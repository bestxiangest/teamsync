package top.sharpcaterpillar.teamsync.service.wecom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.service.wecom.WecomModels.*;
import top.sharpcaterpillar.teamsync.utils.UserContext;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WecomPushService {
    private static final Logger log = LoggerFactory.getLogger(WecomPushService.class);
    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");
    private final WecomPushRepository repository;
    private final WecomWebhookSecret secret;
    private final WecomReportFormatter formatter;
    private final WecomWebhookClient client;
    private final SysUserMapper users;
    private final boolean enabled;

    public WecomPushService(WecomPushRepository repository, WecomWebhookSecret secret,
                            WecomReportFormatter formatter, WecomWebhookClient client, SysUserMapper users,
                            @Value("${teamsync.wecom.enabled:false}") boolean enabled) {
        this.repository = repository;
        this.secret = secret;
        this.formatter = formatter;
        this.client = client;
        this.users = users;
        this.enabled = enabled;
    }

    public void requireAdmin() {
        Long id = UserContext.getUserId();
        SysUser user = id == null ? null : users.selectById(id);
        if (user == null || !Boolean.TRUE.equals(user.getIsAdmin()) || Integer.valueOf(4).equals(user.getStatus())) {
            throw new IllegalArgumentException("仅平台管理员可管理企业微信推送");
        }
    }

    public SettingsView settings() {
        Settings s = repository.settings();
        return new SettingsView(StringUtils.hasText(s.webhookCipher()), secret.isReady(), enabled,
                s.dailyEnabled(), s.dailyTimes(), s.weeklyEnabled(), s.weeklyTimes(), s.projectIds(), "Asia/Shanghai", "周一至周五");
    }

    public SettingsView save(SettingsRequest request) {
        if (request == null) throw new IllegalArgumentException("推送配置不能为空");
        List<String> daily = validateTimes(request.dailyTimes());
        List<String> weekly = validateTimes(request.weeklyTimes());
        List<Long> ids = request.projectIds() == null ? List.of() : request.projectIds();
        if (ids.stream().anyMatch(id -> id == null || id <= 0)) throw new IllegalArgumentException("项目选择无效");
        ids = ids.stream().distinct().sorted().toList();
        Set<Long> available = repository.projects().stream().map(ProjectOption::id).collect(Collectors.toSet());
        if (!available.containsAll(ids)) throw new IllegalArgumentException("所选项目已归档、已删除或不存在，请刷新后重新选择");
        if ((request.dailyEnabled() || request.weeklyEnabled()) && ids.isEmpty()) {
            throw new IllegalArgumentException("请至少选择一个未归档项目");
        }
        if (request.dailyEnabled() && daily.isEmpty()) throw new IllegalArgumentException("请选择日报推送时间");
        if (request.weeklyEnabled() && weekly.isEmpty()) throw new IllegalArgumentException("请选择周报推送时间");
        Settings previous = repository.settings();
        String cipher = StringUtils.hasText(request.webhookUrl()) ? secret.encrypt(request.webhookUrl()) : previous.webhookCipher();
        if ((request.dailyEnabled() || request.weeklyEnabled()) && !StringUtils.hasText(cipher)) {
            throw new IllegalArgumentException("请先填写企业微信 Webhook");
        }
        repository.save(new Settings(cipher, request.dailyEnabled(), daily, request.weeklyEnabled(), weekly, ids), UserContext.getUserId());
        return settings();
    }

    public List<ProjectOption> projects() { return repository.projects(); }
    public List<Job> jobs() { return repository.recentJobs(); }

    public Preview preview(ReportType type) {
        return report(type, repository.settings(), LocalDateTime.now(ZONE));
    }

    public Long manualPush(ReportType type) {
        requireDispatch();
        Settings s = repository.settings();
        requireConfigured(s);
        secret.decrypt(s.webhookCipher());
        Preview preview = report(type, s, LocalDateTime.now(ZONE));
        return repository.enqueue("manual:" + UUID.randomUUID(), type, "MANUAL", s.webhookCipher(), preview.messages());
    }

    public void schedule(LocalDateTime now) {
        if (!enabled || !secret.isReady() || now.getMinute() % 30 != 0) return;
        if (now.getDayOfWeek() == DayOfWeek.SATURDAY || now.getDayOfWeek() == DayOfWeek.SUNDAY) return;
        Settings s = repository.settings();
        if (!StringUtils.hasText(s.webhookCipher()) || s.projectIds().isEmpty()) return;
        String time = now.format(TIME);
        for (ReportType type : ReportType.values()) {
            boolean due = type == ReportType.DAILY ? s.dailyEnabled() && s.dailyTimes().contains(time)
                    : s.weeklyEnabled() && s.weeklyTimes().contains(time);
            String key = type + ":" + now.toLocalDate() + "T" + time;
            if (due && !repository.scheduledExists(key)) {
                Preview report = report(type, s, now);
                repository.enqueue(key, type, "SCHEDULED", s.webhookCipher(), report.messages());
            }
        }
    }

    public void dispatchOne() {
        if (!enabled || !secret.isReady()) return;
        Delivery delivery = repository.claim();
        if (delivery == null) return;
        try {
            client.send(secret.decrypt(delivery.webhookCipher()), delivery.content());
            repository.delivered(delivery.id());
        } catch (Exception e) {
            String message = e instanceof IllegalStateException ? e.getMessage() : "发送失败，请核对群内消息后重试";
            repository.failed(delivery.id(), message);
            log.warn("企业微信推送失败，jobId={}", delivery.id());
        }
    }

    private Preview report(ReportType type, Settings s, LocalDateTime now) {
        if (s.projectIds().isEmpty()) throw new IllegalArgumentException("请先保存要推送的项目");
        List<Long> activeIds = repository.projects().stream().map(ProjectOption::id)
                .filter(s.projectIds()::contains).toList();
        return formatter.format(type, repository.tasks(activeIds), activeIds.size(), now);
    }

    private List<String> validateTimes(List<String> times) {
        if (times == null) return List.of();
        if (times.size() > 48 || times.stream().anyMatch(t -> t == null || !t.matches("(?:[01][0-9]|2[0-3]):(?:00|30)"))) {
            throw new IllegalArgumentException("推送时间必须为 00:00 至 23:30 的半小时时间点");
        }
        return times.stream().distinct().sorted().toList();
    }

    private void requireDispatch() {
        if (!enabled) throw new IllegalStateException("请先设置 TEAMSYNC_WECOM_ENABLED=true 并重启后端");
        if (!secret.isReady()) throw new IllegalStateException("请先配置 TEAMSYNC_WECOM_ENCRYPTION_KEY 并重启后端");
    }

    private void requireConfigured(Settings s) {
        if (!StringUtils.hasText(s.webhookCipher())) throw new IllegalArgumentException("请先保存企业微信 Webhook");
    }
}
