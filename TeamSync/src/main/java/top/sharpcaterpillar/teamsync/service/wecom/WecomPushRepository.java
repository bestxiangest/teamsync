package top.sharpcaterpillar.teamsync.service.wecom;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.service.wecom.WecomModels.*;

import java.util.List;
import java.util.Map;

/** 使用 PostgreSQL 行锁与唯一键协调多实例定时任务及分片发送。 */
@Repository
public class WecomPushRepository {
    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate named;
    private final ObjectMapper json;

    public WecomPushRepository(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.named = new NamedParameterJdbcTemplate(jdbc);
        this.json = json;
    }

    public Settings settings() {
        return jdbc.queryForObject("SELECT * FROM teamsync.sys_wecom_push_setting WHERE id = 1", (rs, row) ->
                new Settings(rs.getString("webhook_cipher"), rs.getBoolean("daily_enabled"),
                        read(rs.getString("daily_times"), new TypeReference<List<String>>() { }),
                        rs.getBoolean("weekly_enabled"),
                        read(rs.getString("weekly_times"), new TypeReference<List<String>>() { }),
                        read(rs.getString("project_ids"), new TypeReference<List<Long>>() { })));
    }

    public void save(Settings s, Long userId) {
        jdbc.update("""
                UPDATE teamsync.sys_wecom_push_setting SET webhook_cipher = ?, daily_enabled = ?, daily_times = ?,
                    weekly_enabled = ?, weekly_times = ?, project_ids = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
                """, s.webhookCipher(), s.dailyEnabled(), write(s.dailyTimes()), s.weeklyEnabled(),
                write(s.weeklyTimes()), write(s.projectIds()), userId);
    }

    public List<ProjectOption> projects() {
        return jdbc.query("SELECT id, name FROM teamsync.pm_project WHERE is_deleted = 0 AND is_archived = 0 ORDER BY id",
                (rs, row) -> new ProjectOption(rs.getLong("id"), rs.getString("name")));
    }

    public List<TaskRow> tasks(List<Long> projectIds) {
        if (projectIds.isEmpty()) return List.of();
        return named.query("""
                SELECT t.id, p.name AS project_name, t.title, t.priority, t.status, t.due_time,
                    a.assignees
                FROM teamsync.pm_task t
                JOIN teamsync.pm_project p ON p.id = t.project_id AND p.is_deleted = 0 AND p.is_archived = 0
                LEFT JOIN LATERAL (
                    SELECT string_agg(COALESCE(NULLIF(u.nickname, ''), u.username), '、' ORDER BY u.id) AS assignees
                    FROM teamsync.pm_task_member m JOIN teamsync.sys_user u ON u.id = m.user_id
                    WHERE m.task_id = t.id AND m.role = 'EXECUTOR'
                ) a ON TRUE
                WHERE t.is_deleted = 0 AND t.project_id IN (:ids)
                ORDER BY t.due_time NULLS LAST, t.priority DESC, t.id
                """, Map.of("ids", projectIds), (rs, row) -> {
                var due = rs.getTimestamp("due_time");
                return new TaskRow(rs.getLong("id"), rs.getString("project_name"), rs.getString("title"),
                        rs.getString("assignees"), rs.getInt("priority"), rs.getInt("status"),
                        due == null ? null : due.toLocalDateTime());
                });
    }

    public Long enqueue(String key, ReportType type, String trigger, String cipher, List<String> messages) {
        List<Long> ids = jdbc.query("""
                INSERT INTO teamsync.sys_wecom_push_job
                    (job_key, report_type, trigger_type, webhook_cipher, messages, total_parts)
                VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (job_key) DO NOTHING RETURNING id
                """, (rs, row) -> rs.getLong(1), key, type.name(), trigger, cipher, write(messages), messages.size());
        return ids.isEmpty() ? null : ids.getFirst();
    }

    public boolean scheduledExists(String key) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM teamsync.sys_wecom_push_job WHERE job_key = ?)", Boolean.class, key));
    }

    /** 全平台每 3.5 秒最多领取一个分片，不在 HTTP 请求期间持有数据库事务。 */
    @Transactional
    public Delivery claim() {
        Boolean available = jdbc.queryForObject("""
                SELECT clock_timestamp() >= next_dispatch_at FROM teamsync.sys_wecom_push_setting WHERE id = 1 FOR UPDATE
                """, Boolean.class);
        jdbc.update("""
                UPDATE teamsync.sys_wecom_push_job SET status = 'FAILED',
                    error_message = '上次发送结果未确认，请核对群内消息后手动推送', updated_at = CURRENT_TIMESTAMP
                WHERE status = 'SENDING' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '2 minutes'
                """);
        if (!Boolean.TRUE.equals(available)) return null;
        List<Delivery> jobs = jdbc.query("""
                SELECT id, webhook_cipher, messages, sent_parts FROM teamsync.sys_wecom_push_job
                WHERE status = 'PENDING' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED
                """, (rs, row) -> new Delivery(rs.getLong("id"), rs.getString("webhook_cipher"),
                this.<List<String>>read(rs.getString("messages"), new TypeReference<>() { }).get(rs.getInt("sent_parts"))));
        if (jobs.isEmpty()) return null;
        Delivery delivery = jobs.getFirst();
        jdbc.update("UPDATE teamsync.sys_wecom_push_job SET status = 'SENDING', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                delivery.id());
        jdbc.update("UPDATE teamsync.sys_wecom_push_setting SET next_dispatch_at = clock_timestamp() + INTERVAL '3.5 seconds' WHERE id = 1");
        return delivery;
    }

    public void delivered(Long id) {
        jdbc.update("""
                UPDATE teamsync.sys_wecom_push_job SET sent_parts = sent_parts + 1,
                    status = CASE WHEN sent_parts + 1 = total_parts THEN 'SUCCESS' ELSE 'PENDING' END,
                    updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'SENDING'
                """, id);
    }

    public void failed(Long id, String message) {
        jdbc.update("""
                UPDATE teamsync.sys_wecom_push_job SET status = 'FAILED', error_message = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND status = 'SENDING'
                """, message, id);
    }

    public List<Job> recentJobs() {
        return jdbc.query("""
                SELECT id, report_type, trigger_type, status, total_parts, sent_parts, error_message,
                    to_char(created_at AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                    to_char(updated_at AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') AS updated_at
                FROM teamsync.sys_wecom_push_job ORDER BY id DESC LIMIT 30
                """, (rs, row) -> new Job(rs.getLong("id"), rs.getString("report_type"), rs.getString("trigger_type"),
                rs.getString("status"), rs.getInt("total_parts"), rs.getInt("sent_parts"), rs.getString("error_message"),
                rs.getString("created_at"), rs.getString("updated_at")));
    }

    private String write(Object value) {
        try {
            return json.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalStateException("推送数据序列化失败");
        }
    }

    private <T> T read(String value, TypeReference<T> type) {
        try {
            return json.readValue(value, type);
        } catch (Exception e) {
            throw new IllegalStateException("推送配置数据无法读取");
        }
    }
}
