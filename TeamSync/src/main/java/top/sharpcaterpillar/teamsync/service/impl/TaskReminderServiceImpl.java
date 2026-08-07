package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import top.sharpcaterpillar.teamsync.config.TaskReminderMailProperties;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlanAssignee;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskMember;
import top.sharpcaterpillar.teamsync.entity.PmTaskReminderLog;
import top.sharpcaterpillar.teamsync.entity.SysUser;
import top.sharpcaterpillar.teamsync.entity.SysUserReminderSetting;
import top.sharpcaterpillar.teamsync.mapper.PmProjectMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanAssigneeMapper;
import top.sharpcaterpillar.teamsync.mapper.PmRecurringPlanMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMemberMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskReminderLogMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserMapper;
import top.sharpcaterpillar.teamsync.mapper.SysUserReminderSettingMapper;
import top.sharpcaterpillar.teamsync.service.SysNotificationService;
import top.sharpcaterpillar.teamsync.service.TaskReminderService;

import jakarta.mail.internet.InternetAddress;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 任务提醒服务实现
 */
@Service
public class TaskReminderServiceImpl implements TaskReminderService {

    private static final Logger log = LoggerFactory.getLogger(TaskReminderServiceImpl.class);
    private static final String REMINDER_TYPE_OVERDUE_EMAIL = "OVERDUE_EMAIL";
    private static final String PLAN_STATUS_ACTIVE = "ACTIVE";
    private static final String PLAN_ASSIGNEE_ROLE_RESPONSIBLE = "RESPONSIBLE";
    private static final int TASK_DUE_SOON_HOURS = 24;
    private static final int DEFAULT_RECURRING_REMINDER_MINUTES = 60;
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final PmTaskMapper taskMapper;
    private final PmTaskMemberMapper taskMemberMapper;
    private final PmRecurringPlanMapper recurringPlanMapper;
    private final PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper;
    private final SysUserMapper userMapper;
    private final PmProjectMapper projectMapper;
    private final SysUserReminderSettingMapper reminderSettingMapper;
    private final PmTaskReminderLogMapper reminderLogMapper;
    private final SysNotificationService notificationService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final TaskReminderMailProperties properties;

    public TaskReminderServiceImpl(PmTaskMapper taskMapper,
                                   PmTaskMemberMapper taskMemberMapper,
                                   PmRecurringPlanMapper recurringPlanMapper,
                                   PmRecurringPlanAssigneeMapper recurringPlanAssigneeMapper,
                                   SysUserMapper userMapper,
                                   PmProjectMapper projectMapper,
                                   SysUserReminderSettingMapper reminderSettingMapper,
                                   PmTaskReminderLogMapper reminderLogMapper,
                                   SysNotificationService notificationService,
                                   ObjectProvider<JavaMailSender> mailSenderProvider,
                                   TaskReminderMailProperties properties) {
        this.taskMapper = taskMapper;
        this.taskMemberMapper = taskMemberMapper;
        this.recurringPlanMapper = recurringPlanMapper;
        this.recurringPlanAssigneeMapper = recurringPlanAssigneeMapper;
        this.userMapper = userMapper;
        this.projectMapper = projectMapper;
        this.reminderSettingMapper = reminderSettingMapper;
        this.reminderLogMapper = reminderLogMapper;
        this.notificationService = notificationService;
        this.mailSenderProvider = mailSenderProvider;
        this.properties = properties;
    }

    @Override
    public void scanAndSendOverdueTaskReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<PmTask> overdueTasks = loadOverdueTasks(now);
        Map<Long, List<Long>> recipientMap = buildTaskRecipients(overdueTasks);

        createTaskOverdueNotifications(overdueTasks, recipientMap, now);
        scanAndCreateTaskDueNotifications(now);
        scanAndCreateRecurringPlanNotifications(now);

        if (!properties.isEnabled()) {
            log.debug("邮件提醒扫描已关闭，跳过本次执行");
            return;
        }

        if (!isMailChannelReady()) {
            log.warn("邮件提醒扫描跳过：未检测到可用的邮件发送通道");
            return;
        }

        resolveRecoveredReminderLogs(now);
        if (overdueTasks.isEmpty()) {
            return;
        }

        Set<Long> userIds = recipientMap.values().stream()
                .flatMap(Collection::stream)
                .collect(Collectors.toSet());
        if (userIds.isEmpty()) {
            return;
        }

        Map<Long, SysUser> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, user -> user));
        Map<Long, SysUserReminderSetting> settingMap = reminderSettingMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUserReminderSetting::getUserId, setting -> setting));
        Set<Long> projectIds = overdueTasks.stream()
                .map(PmTask::getProjectId)
                .filter(projectId -> projectId != null)
                .collect(Collectors.toSet());
        Map<Long, PmProject> projectMap = projectIds.isEmpty()
                ? Collections.emptyMap()
                : projectMapper.selectBatchIds(projectIds).stream()
                .collect(Collectors.toMap(PmProject::getId, project -> project));

        Set<Long> taskIds = overdueTasks.stream().map(PmTask::getId).collect(Collectors.toSet());
        Map<String, PmTaskReminderLog> reminderLogMap = loadReminderLogs(taskIds);

        int sentCount = 0;
        for (PmTask task : overdueTasks) {
            List<Long> recipients = recipientMap.getOrDefault(task.getId(), Collections.emptyList());
            if (recipients.isEmpty()) {
                continue;
            }

            for (Long userId : recipients) {
                SysUser user = userMap.get(userId);
                if (user == null || !StringUtils.hasText(user.getEmail())) {
                    continue;
                }

                SysUserReminderSetting setting = settingMap.get(userId);
                if (!isReminderEnabled(setting)) {
                    continue;
                }

                String key = buildReminderKey(task.getId(), userId);
                PmTaskReminderLog existingLog = reminderLogMap.get(key);
                if (!shouldSendReminder(existingLog, now)) {
                    continue;
                }

                try {
                    sendOverdueReminder(user, task, projectMap.get(task.getProjectId()));
                    PmTaskReminderLog savedLog = saveReminderLog(existingLog, task, userId, now);
                    reminderLogMap.put(key, savedLog);
                    sentCount++;
                } catch (Exception ex) {
                    log.error("发送逾期任务提醒失败: taskId={}, userId={}", task.getId(), userId, ex);
                }
            }
        }

        if (sentCount > 0) {
            log.info("逾期任务提醒扫描完成，成功发送 {} 封提醒邮件", sentCount);
        }
    }

    @Override
    public void sendTestReminderEmail(Long userId, String email) {
        if (!isMailChannelReady()) {
            throw new RuntimeException("当前未配置可用的邮件发送通道");
        }

        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        String targetEmail = StringUtils.hasText(email) ? email.trim() : user.getEmail();
        if (!StringUtils.hasText(targetEmail)) {
            throw new RuntimeException("请先填写提醒邮箱");
        }
        validateEmail(targetEmail);

        String subject = "【TeamSync】邮箱提醒测试";
        String body = buildTestMailBody(user);
        sendMail(targetEmail, subject, body);
    }

    @Override
    public void sendTaskCompletedReminder(PmTask task, Collection<Long> recipientIds, Long actorId) {
        if (task == null || task.getId() == null) {
            return;
        }
        if (!properties.isEnabled()) {
            log.debug("邮件提醒总开关已关闭，跳过任务完成邮件: taskId={}", task.getId());
            return;
        }
        if (!isMailChannelReady()) {
            log.debug("邮件通道不可用，跳过任务完成邮件: taskId={}", task.getId());
            return;
        }

        Set<Long> userIds = normalizeRecipientIds(recipientIds);
        if (actorId != null) {
            userIds.remove(actorId);
        }
        if (userIds.isEmpty()) {
            return;
        }

        Map<Long, SysUser> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, user -> user));
        Map<Long, SysUserReminderSetting> settingMap = reminderSettingMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUserReminderSetting::getUserId, setting -> setting));
        PmProject project = task.getProjectId() == null ? null : projectMapper.selectById(task.getProjectId());

        int sentCount = 0;
        for (Long userId : userIds) {
            SysUser user = userMap.get(userId);
            if (user == null || !StringUtils.hasText(user.getEmail())) {
                continue;
            }

            SysUserReminderSetting setting = settingMap.get(userId);
            if (!isTaskCompletedReminderEnabled(setting)) {
                continue;
            }

            try {
                sendCompletedReminderMail(user, task, project);
                sentCount++;
            } catch (Exception ex) {
                log.error("发送任务完成提醒失败: taskId={}, userId={}", task.getId(), userId, ex);
            }
        }

        if (sentCount > 0) {
            log.info("任务完成提醒邮件发送完成: taskId={}, sentCount={}", task.getId(), sentCount);
        }
    }

    @Override
    public boolean isMailChannelReady() {
        return mailSenderProvider.getIfAvailable() != null;
    }

    private void resolveRecoveredReminderLogs(LocalDateTime now) {
        LambdaQueryWrapper<PmTaskReminderLog> query = new LambdaQueryWrapper<>();
        query.eq(PmTaskReminderLog::getReminderType, REMINDER_TYPE_OVERDUE_EMAIL)
                .isNull(PmTaskReminderLog::getResolvedAt);
        List<PmTaskReminderLog> logs = reminderLogMapper.selectList(query);
        if (logs.isEmpty()) {
            return;
        }

        Set<Long> taskIds = logs.stream()
                .map(PmTaskReminderLog::getTaskId)
                .collect(Collectors.toSet());
        Map<Long, PmTask> taskMap = taskMapper.selectBatchIds(taskIds).stream()
                .collect(Collectors.toMap(PmTask::getId, task -> task));

        for (PmTaskReminderLog logItem : logs) {
            PmTask task = taskMap.get(logItem.getTaskId());
            boolean resolved = task == null
                    || task.getStatus() == 1
                    || task.getDueTime() == null
                    || !task.getDueTime().isBefore(now);
            if (!resolved) {
                continue;
            }
            logItem.setResolvedAt(now);
            logItem.setUpdatedAt(now);
            reminderLogMapper.updateById(logItem);
        }
    }

    private Map<Long, List<Long>> buildTaskRecipients(List<PmTask> tasks) {
        Set<Long> taskIds = tasks.stream().map(PmTask::getId).collect(Collectors.toSet());
        if (taskIds.isEmpty()) {
            return Collections.emptyMap();
        }

        LambdaQueryWrapper<PmTaskMember> query = new LambdaQueryWrapper<>();
        query.in(PmTaskMember::getTaskId, taskIds)
                .eq(PmTaskMember::getRole, "EXECUTOR");
        List<PmTaskMember> members = taskMemberMapper.selectList(query);

        Map<Long, List<Long>> recipientMap = new HashMap<>();
        for (PmTaskMember member : members) {
            recipientMap.computeIfAbsent(member.getTaskId(), key -> new ArrayList<>()).add(member.getUserId());
        }

        for (PmTask task : tasks) {
            recipientMap.computeIfAbsent(task.getId(), key -> {
                if (task.getCreatorId() == null) {
                    return new ArrayList<>();
                }
                List<Long> fallback = new ArrayList<>();
                fallback.add(task.getCreatorId());
                return fallback;
            });

            List<Long> deduplicated = new ArrayList<>(new LinkedHashSet<>(recipientMap.get(task.getId())));
            recipientMap.put(task.getId(), deduplicated);
        }

        return recipientMap;
    }

    private List<PmTask> loadOverdueTasks(LocalDateTime now) {
        LambdaQueryWrapper<PmTask> taskQuery = new LambdaQueryWrapper<>();
        taskQuery.isNotNull(PmTask::getDueTime)
                .lt(PmTask::getDueTime, now)
                .ne(PmTask::getStatus, 1)
                .orderByAsc(PmTask::getDueTime);
        return taskMapper.selectList(taskQuery);
    }

    private void scanAndCreateTaskDueNotifications(LocalDateTime now) {
        LambdaQueryWrapper<PmTask> taskQuery = new LambdaQueryWrapper<>();
        taskQuery.isNotNull(PmTask::getDueTime)
                .ge(PmTask::getDueTime, now)
                .le(PmTask::getDueTime, now.plusHours(TASK_DUE_SOON_HOURS))
                .ne(PmTask::getStatus, 1)
                .orderByAsc(PmTask::getDueTime);
        List<PmTask> dueSoonTasks = taskMapper.selectList(taskQuery);
        Map<Long, List<Long>> recipients = buildTaskRecipients(dueSoonTasks);
        for (PmTask task : dueSoonTasks) {
            notificationService.notifyTaskDue(task, recipients.getOrDefault(task.getId(), Collections.emptyList()), now);
        }
    }

    private void createTaskOverdueNotifications(List<PmTask> overdueTasks,
                                                Map<Long, List<Long>> recipientMap,
                                                LocalDateTime now) {
        for (PmTask task : overdueTasks) {
            notificationService.notifyTaskOverdue(task, recipientMap.getOrDefault(task.getId(), Collections.emptyList()), now);
        }
    }

    private void scanAndCreateRecurringPlanNotifications(LocalDateTime now) {
        LambdaQueryWrapper<PmRecurringPlan> query = new LambdaQueryWrapper<>();
        query.eq(PmRecurringPlan::getStatus, PLAN_STATUS_ACTIVE)
                .isNotNull(PmRecurringPlan::getNextRunAt)
                .orderByAsc(PmRecurringPlan::getNextRunAt);
        List<PmRecurringPlan> plans = recurringPlanMapper.selectList(query);
        if (plans.isEmpty()) {
            return;
        }

        Map<Long, List<Long>> recipientMap = buildRecurringPlanRecipients(plans);
        for (PmRecurringPlan plan : plans) {
            List<Long> recipients = recipientMap.getOrDefault(plan.getId(), Collections.emptyList());
            if (Boolean.TRUE.equals(plan.getReminderEnabled()) && isInRecurringPlanReminderWindow(plan, now)) {
                notificationService.notifyRecurringPlanDue(plan, recipients, now);
            }

            LocalDateTime nextDueTime = calculateRecurringPlanNextDueTime(plan);
            if (nextDueTime != null && nextDueTime.isBefore(now)) {
                notificationService.notifyRecurringPlanOverdue(plan, nextDueTime, recipients, now);
            }
        }
    }

    private Map<Long, List<Long>> buildRecurringPlanRecipients(List<PmRecurringPlan> plans) {
        Set<Long> planIds = plans.stream()
                .map(PmRecurringPlan::getId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        if (planIds.isEmpty()) {
            return Collections.emptyMap();
        }

        LambdaQueryWrapper<PmRecurringPlanAssignee> query = new LambdaQueryWrapper<>();
        query.in(PmRecurringPlanAssignee::getPlanId, planIds)
                .eq(PmRecurringPlanAssignee::getRole, PLAN_ASSIGNEE_ROLE_RESPONSIBLE);
        List<PmRecurringPlanAssignee> assignees = recurringPlanAssigneeMapper.selectList(query);

        Map<Long, List<Long>> recipientMap = new HashMap<>();
        for (PmRecurringPlanAssignee assignee : assignees) {
            recipientMap.computeIfAbsent(assignee.getPlanId(), key -> new ArrayList<>()).add(assignee.getUserId());
        }

        for (PmRecurringPlan plan : plans) {
            recipientMap.computeIfAbsent(plan.getId(), key -> {
                List<Long> fallback = new ArrayList<>();
                if (plan.getCreatorId() != null) {
                    fallback.add(plan.getCreatorId());
                }
                return fallback;
            });
            List<Long> deduplicated = new ArrayList<>(new LinkedHashSet<>(recipientMap.get(plan.getId())));
            recipientMap.put(plan.getId(), deduplicated);
        }
        return recipientMap;
    }

    private boolean isInRecurringPlanReminderWindow(PmRecurringPlan plan, LocalDateTime now) {
        if (plan.getNextRunAt() == null || plan.getNextRunAt().isBefore(now)) {
            return false;
        }
        int minutesBefore = plan.getReminderMinutesBefore() == null
                ? DEFAULT_RECURRING_REMINDER_MINUTES
                : Math.max(plan.getReminderMinutesBefore(), 0);
        return !plan.getNextRunAt().isAfter(now.plusMinutes(minutesBefore));
    }

    private LocalDateTime calculateRecurringPlanNextDueTime(PmRecurringPlan plan) {
        if (plan.getNextRunAt() == null || plan.getDueTime() == null || plan.getStartTime() == null) {
            return null;
        }
        Duration duration = Duration.between(plan.getStartTime(), plan.getDueTime());
        return duration.isNegative() ? plan.getNextRunAt() : plan.getNextRunAt().plus(duration);
    }

    private Map<String, PmTaskReminderLog> loadReminderLogs(Set<Long> taskIds) {
        if (taskIds.isEmpty()) {
            return Collections.emptyMap();
        }

        LambdaQueryWrapper<PmTaskReminderLog> query = new LambdaQueryWrapper<>();
        query.in(PmTaskReminderLog::getTaskId, taskIds)
                .eq(PmTaskReminderLog::getReminderType, REMINDER_TYPE_OVERDUE_EMAIL);
        return reminderLogMapper.selectList(query).stream()
                .collect(Collectors.toMap(
                        logItem -> buildReminderKey(logItem.getTaskId(), logItem.getUserId()),
                        logItem -> logItem,
                        (left, right) -> right
                ));
    }

    private boolean isReminderEnabled(SysUserReminderSetting setting) {
        return setting != null
                && Boolean.TRUE.equals(setting.getEmailEnabled())
                && Boolean.TRUE.equals(setting.getOverdueTaskEnabled());
    }

    private boolean isTaskCompletedReminderEnabled(SysUserReminderSetting setting) {
        return setting != null
                && Boolean.TRUE.equals(setting.getEmailEnabled())
                && Boolean.TRUE.equals(setting.getTaskCompletedEnabled());
    }

    private Set<Long> normalizeRecipientIds(Collection<Long> recipientIds) {
        if (recipientIds == null || recipientIds.isEmpty()) {
            return new LinkedHashSet<>();
        }
        return recipientIds.stream()
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private boolean shouldSendReminder(PmTaskReminderLog existingLog, LocalDateTime now) {
        if (existingLog == null) {
            return true;
        }
        if (existingLog.getLastSentAt() == null) {
            return true;
        }
        return !existingLog.getLastSentAt().toLocalDate().isEqual(now.toLocalDate());
    }

    private PmTaskReminderLog saveReminderLog(PmTaskReminderLog existingLog, PmTask task, Long userId, LocalDateTime now) {
        PmTaskReminderLog logItem = existingLog != null ? existingLog : new PmTaskReminderLog();
        logItem.setTaskId(task.getId());
        logItem.setUserId(userId);
        logItem.setReminderType(REMINDER_TYPE_OVERDUE_EMAIL);
        logItem.setDueTimeSnapshot(task.getDueTime());
        logItem.setLastSentAt(now);
        logItem.setResolvedAt(null);
        logItem.setUpdatedAt(now);

        if (existingLog == null) {
            logItem.setFirstSentAt(now);
            logItem.setSendCount(1);
            logItem.setCreatedAt(now);
            reminderLogMapper.insert(logItem);
        } else {
            logItem.setFirstSentAt(existingLog.getFirstSentAt() != null ? existingLog.getFirstSentAt() : now);
            logItem.setSendCount((existingLog.getSendCount() != null ? existingLog.getSendCount() : 0) + 1);
            reminderLogMapper.updateById(logItem);
        }
        return logItem;
    }

    private void sendOverdueReminder(SysUser user, PmTask task, PmProject project) {
        String subject = "【TeamSync】任务已逾期：" + task.getTitle();
        String body = buildOverdueMailBody(user, task, project);
        sendMail(user.getEmail(), subject, body);
    }

    private void sendCompletedReminderMail(SysUser user, PmTask task, PmProject project) {
        String subject = "【TeamSync】任务已完成：" + task.getTitle();
        String body = buildCompletedMailBody(user, task, project);
        sendMail(user.getEmail(), subject, body);
    }

    private void sendMail(String to, String subject, String body) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new RuntimeException("当前未配置可用的邮件发送通道");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        if (StringUtils.hasText(properties.getFromAddress())) {
            message.setFrom(properties.getFromAddress().trim());
        }
        mailSender.send(message);
    }

    private String buildOverdueMailBody(SysUser user, PmTask task, PmProject project) {
        StringBuilder builder = new StringBuilder();
        builder.append("你好，").append(resolveDisplayName(user)).append("：\n\n");
        builder.append("你负责的任务已经逾期，请尽快处理。\n\n");
        builder.append("任务标题：").append(task.getTitle()).append("\n");
        builder.append("所属项目：").append(project != null ? project.getName() : "未知项目").append("\n");
        builder.append("截止时间：").append(formatDateTime(task.getDueTime())).append("\n");
        if (StringUtils.hasText(task.getDescription())) {
            builder.append("任务说明：").append(task.getDescription()).append("\n");
        }
        String boardUrl = buildBoardUrl(task.getProjectId());
        if (StringUtils.hasText(boardUrl)) {
            builder.append("查看看板：").append(boardUrl).append("\n");
        }
        builder.append("\n这是系统根据当前默认规则发送的逾期提醒邮件。");
        return builder.toString();
    }

    private String buildCompletedMailBody(SysUser user, PmTask task, PmProject project) {
        StringBuilder builder = new StringBuilder();
        builder.append("你好，").append(resolveDisplayName(user)).append("：\n\n");
        builder.append("与你相关的任务已被标记为完成。\n\n");
        builder.append("任务标题：").append(task.getTitle()).append("\n");
        builder.append("所属项目：").append(project != null ? project.getName() : "未知项目").append("\n");
        builder.append("完成时间：").append(formatDateTime(task.getUpdatedAt())).append("\n");
        if (StringUtils.hasText(task.getDescription())) {
            builder.append("任务说明：").append(task.getDescription()).append("\n");
        }
        String boardUrl = buildBoardUrl(task.getProjectId());
        if (StringUtils.hasText(boardUrl)) {
            builder.append("查看看板：").append(boardUrl).append("\n");
        }
        builder.append("\n这是系统根据你的任务完成邮件提醒设置发送的通知。");
        return builder.toString();
    }

    private String buildTestMailBody(SysUser user) {
        StringBuilder builder = new StringBuilder();
        builder.append("你好，").append(resolveDisplayName(user)).append("：\n\n");
        builder.append("这是一封 TeamSync 邮箱提醒测试邮件。\n");
        builder.append("如果你收到了这封邮件，说明当前邮箱地址与 SMTP 通道可以正常工作。\n\n");
        builder.append("后续当你负责的任务逾期时，系统会按你的提醒设置向该邮箱发送通知。");
        return builder.toString();
    }

    private String buildBoardUrl(Long projectId) {
        if (!StringUtils.hasText(properties.getFrontendBaseUrl()) || projectId == null) {
            return "";
        }
        String baseUrl = properties.getFrontendBaseUrl().trim();
        while (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        if (baseUrl.contains("#")) {
            return baseUrl + "/project/board/" + projectId;
        }
        return baseUrl + "/#/project/board/" + projectId;
    }

    private String resolveDisplayName(SysUser user) {
        if (user == null) {
            return "同事";
        }
        if (StringUtils.hasText(user.getNickname())) {
            return user.getNickname().trim();
        }
        if (StringUtils.hasText(user.getUsername())) {
            return user.getUsername().trim();
        }
        return "同事";
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "未设置" : value.format(DATETIME_FORMATTER);
    }

    private String buildReminderKey(Long taskId, Long userId) {
        return taskId + ":" + userId + ":" + REMINDER_TYPE_OVERDUE_EMAIL;
    }

    private void validateEmail(String email) {
        try {
            InternetAddress address = new InternetAddress(email);
            address.validate();
        } catch (Exception e) {
            throw new RuntimeException("邮箱格式不正确");
        }
    }
}
