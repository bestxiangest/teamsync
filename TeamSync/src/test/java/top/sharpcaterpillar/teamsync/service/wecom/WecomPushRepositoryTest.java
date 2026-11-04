package top.sharpcaterpillar.teamsync.service.wecom;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import top.sharpcaterpillar.teamsync.service.wecom.WecomModels.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;

/** 仅对显式指定的本机 wecom_test 临时数据库执行，不连接业务数据库。 */
@EnabledIfEnvironmentVariable(named = "TEAMSYNC_WECOM_TEST_DB_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/wecom_test")
class WecomPushRepositoryTest {
    private JdbcTemplate jdbc;
    private TransactionTemplate tx;
    private WecomPushRepository repository;

    @BeforeEach
    void prepare() throws Exception {
        DriverManagerDataSource source = new DriverManagerDataSource(System.getenv("TEAMSYNC_WECOM_TEST_DB_URL"), "wecom_test", "");
        jdbc = new JdbcTemplate(source);
        tx = new TransactionTemplate(new DataSourceTransactionManager(source));
        jdbc.execute("CREATE SCHEMA IF NOT EXISTS teamsync");
        String migration = Files.readString(Path.of("../doc/sql/wecom_push.sql"));
        jdbc.execute(migration);
        jdbc.execute(migration);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS teamsync.pm_project
                    (id bigint PRIMARY KEY, name text, is_deleted int DEFAULT 0, is_archived int DEFAULT 0);
                CREATE TABLE IF NOT EXISTS teamsync.pm_task
                    (id bigint PRIMARY KEY, project_id bigint, title text, priority int DEFAULT 1,
                     status int DEFAULT 0, due_time timestamp, is_deleted int DEFAULT 0);
                CREATE TABLE IF NOT EXISTS teamsync.sys_user (id bigint PRIMARY KEY, nickname text, username text);
                CREATE TABLE IF NOT EXISTS teamsync.pm_task_member (task_id bigint, user_id bigint, role text);
                TRUNCATE teamsync.pm_task_member, teamsync.sys_user, teamsync.pm_task, teamsync.pm_project,
                    teamsync.sys_wecom_push_job RESTART IDENTITY;
                UPDATE teamsync.sys_wecom_push_setting SET next_dispatch_at = CURRENT_TIMESTAMP;
                """);
        repository = new WecomPushRepository(jdbc, new ObjectMapper());
    }

    @Test
    void migrationIsRepeatableAndSettingsRoundTrip() {
        Settings value = new Settings("cipher", true, List.of("08:00", "08:30"), true, List.of("17:30"), List.of(1L, 2L));
        repository.save(value, 1L);
        assertThat(repository.settings()).isEqualTo(value);
    }

    @Test
    void queryIncludesAllSelectedTasksButExcludesArchivedDeletedAndUnselectedProjects() {
        jdbc.execute("""
                INSERT INTO teamsync.pm_project (id, name, is_deleted, is_archived)
                    VALUES (1, '项目一', 0, 0), (2, '已归档', 0, 1), (3, '已删除', 1, 0), (4, '未选项目', 0, 0);
                INSERT INTO teamsync.pm_task (id, project_id, title, status, due_time, is_deleted) VALUES
                    (1, 1, '历史未完成', 2, '2026-11-01 10:00', 0),
                    (2, 1, '本期已完成', 1, '2026-11-06 10:00', 0),
                    (3, 1, '历史已完成', 1, '2026-11-01 10:00', 0),
                    (4, 2, '归档任务', 0, '2026-11-06 10:00', 0),
                    (5, 3, '删除项目任务', 0, '2026-11-06 10:00', 0),
                    (6, 1, '无截止日期', 0, NULL, 0),
                    (7, 1, '次日任务', 0, '2026-11-07 00:00', 0),
                    (8, 1, '删除任务', 0, '2026-11-06 10:00', 1),
                    (9, 4, '未选任务', 0, '2026-11-06 10:00', 0);
                INSERT INTO teamsync.sys_user VALUES (1, '执行甲', 'user1'), (2, '', 'user2'), (3, '关注者', 'user3');
                INSERT INTO teamsync.pm_task_member VALUES (1, 1, 'EXECUTOR'), (1, 2, 'EXECUTOR'), (1, 3, 'FOLLOWER');
                """);
        List<TaskRow> rows = repository.tasks(List.of(1L, 2L, 3L));
        assertThat(rows).extracting(TaskRow::id).containsExactly(1L, 3L, 2L, 7L, 6L);
        assertThat(rows.getLast().dueTime()).isNull();
        assertThat(rows.getFirst().assignees()).isEqualTo("执行甲、user2");
        assertThat(repository.projects()).extracting(ProjectOption::id).containsExactly(1L, 4L);
    }

    @Test
    void duplicateSlotsAreIgnoredAndMultipartProgressSurvivesRepositoryRecreation() {
        Long id = repository.enqueue("DAILY:slot", ReportType.DAILY, "SCHEDULED", "cipher", List.of("分片一", "分片二"));
        assertThat(repository.enqueue("DAILY:slot", ReportType.DAILY, "SCHEDULED", "cipher", List.of("重复"))).isNull();
        assertThat(tx.execute(s -> repository.claim()).content()).isEqualTo("分片一");
        assertThat(tx.<Delivery>execute(s -> repository.claim())).isNull();
        repository.delivered(id);
        WecomPushRepository restarted = new WecomPushRepository(jdbc, new ObjectMapper());
        jdbc.update("UPDATE teamsync.sys_wecom_push_setting SET next_dispatch_at = CURRENT_TIMESTAMP");
        assertThat(tx.execute(s -> restarted.claim()).content()).isEqualTo("分片二");
        restarted.delivered(id);
        Job job = restarted.recentJobs().getFirst();
        assertThat(job.status()).isEqualTo("SUCCESS");
        assertThat(job.sentParts()).isEqualTo(2);
    }

    @Test
    void failedOrUncertainDeliveriesAreNotAutomaticallyRetried() {
        Long id = repository.enqueue("manual:test", ReportType.WEEKLY, "MANUAL", "cipher", List.of("一", "二"));
        tx.execute(s -> repository.claim());
        repository.delivered(id);
        jdbc.update("UPDATE teamsync.sys_wecom_push_setting SET next_dispatch_at = CURRENT_TIMESTAMP");
        tx.execute(s -> repository.claim());
        jdbc.update("UPDATE teamsync.sys_wecom_push_job SET updated_at = CURRENT_TIMESTAMP - INTERVAL '3 minutes' WHERE id = ?", id);
        assertThat(tx.<Delivery>execute(s -> repository.claim())).isNull();
        Job job = repository.recentJobs().getFirst();
        assertThat(job.status()).isEqualTo("FAILED");
        assertThat(job.sentParts()).isEqualTo(1);
        assertThat(job.errorMessage()).contains("未确认");
    }

    @Test
    void concurrentInstancesCannotClaimTwoMessagesWithinTheGlobalRateWindow() throws Exception {
        repository.enqueue("manual:1", ReportType.DAILY, "MANUAL", "cipher", List.of("一"));
        repository.enqueue("manual:2", ReportType.WEEKLY, "MANUAL", "cipher", List.of("二"));
        CountDownLatch start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var first = pool.submit(() -> { start.await(); return tx.execute(s -> repository.claim()); });
            var second = pool.submit(() -> { start.await(); return tx.execute(s -> repository.claim()); });
            start.countDown();
            Delivery a = first.get(5, TimeUnit.SECONDS);
            Delivery b = second.get(5, TimeUnit.SECONDS);
            assertThat((a == null ? 0 : 1) + (b == null ? 0 : 1)).isEqualTo(1);
        }
    }
}
