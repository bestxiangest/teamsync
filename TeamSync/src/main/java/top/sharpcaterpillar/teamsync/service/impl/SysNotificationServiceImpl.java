package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import top.sharpcaterpillar.teamsync.dto.NotificationMarkReadRequest;
import top.sharpcaterpillar.teamsync.dto.NotificationQueryRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.SysNotification;
import top.sharpcaterpillar.teamsync.mapper.SysNotificationMapper;
import top.sharpcaterpillar.teamsync.service.SysNotificationService;
import top.sharpcaterpillar.teamsync.vo.NotificationUnreadCountVO;
import top.sharpcaterpillar.teamsync.vo.NotificationVO;
import top.sharpcaterpillar.teamsync.vo.PageVO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 站内通知服务实现。
 */
@Service
@RequiredArgsConstructor
public class SysNotificationServiceImpl extends ServiceImpl<SysNotificationMapper, SysNotification>
        implements SysNotificationService {

    private static final String SOURCE_TASK = "TASK";
    private static final String SOURCE_RECURRING_PLAN = "RECURRING_PLAN";
    private static final String SOURCE_PROJECT = "PROJECT";
    private static final DateTimeFormatter WINDOW_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final DateTimeFormatter OPERATION_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final ObjectProvider<SimpMessagingTemplate> messagingTemplateProvider;

    @Override
    public PageVO<NotificationVO> listNotifications(NotificationQueryRequest request, Long userId) {
        requireLogin(userId);
        NotificationQueryRequest safeRequest = request == null ? new NotificationQueryRequest() : request;

        Page<SysNotification> page = new Page<>(normalizeCurrent(safeRequest.getCurrent()), normalizeSize(safeRequest.getSize()));
        LambdaQueryWrapper<SysNotification> query = new LambdaQueryWrapper<>();
        query.eq(SysNotification::getUserId, userId);
        if (StringUtils.hasText(safeRequest.getType())) {
            query.eq(SysNotification::getType, safeRequest.getType().trim().toUpperCase());
        }
        if (Boolean.TRUE.equals(safeRequest.getUnreadOnly())) {
            query.eq(SysNotification::getReadFlag, false);
        }
        query.orderByAsc(SysNotification::getReadFlag)
                .orderByDesc(SysNotification::getCreatedAt)
                .orderByDesc(SysNotification::getId);

        Page<SysNotification> resultPage = this.page(page, query);
        List<NotificationVO> records = resultPage.getRecords().stream()
                .map(this::toVO)
                .collect(Collectors.toList());
        return PageVO.of(records, resultPage.getTotal(), (int) resultPage.getCurrent(), (int) resultPage.getSize());
    }

    @Override
    public NotificationUnreadCountVO countUnread(Long userId) {
        requireLogin(userId);
        return new NotificationUnreadCountVO(countUnreadValue(userId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public NotificationVO markRead(Long notificationId, Long userId) {
        requireLogin(userId);
        if (notificationId == null) {
            throw new RuntimeException("通知ID不能为空");
        }

        SysNotification notification = requireOwnNotification(notificationId, userId);
        if (!Boolean.TRUE.equals(notification.getReadFlag())) {
            LocalDateTime now = LocalDateTime.now();
            notification.setReadFlag(true);
            notification.setReadAt(now);
            notification.setUpdatedAt(now);
            this.updateById(notification);
            broadcastUnreadCount(userId);
        }
        return toVO(notification);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markRead(NotificationMarkReadRequest request, Long userId) {
        requireLogin(userId);
        if (request == null || request.getIds() == null || request.getIds().isEmpty()) {
            return;
        }
        List<Long> ids = request.getIds().stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (ids.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LambdaUpdateWrapper<SysNotification> update = new LambdaUpdateWrapper<>();
        update.eq(SysNotification::getUserId, userId)
                .in(SysNotification::getId, ids)
                .eq(SysNotification::getReadFlag, false)
                .set(SysNotification::getReadFlag, true)
                .set(SysNotification::getReadAt, now)
                .set(SysNotification::getUpdatedAt, now);
        this.update(update);
        broadcastUnreadCount(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAllRead(Long userId) {
        requireLogin(userId);
        LocalDateTime now = LocalDateTime.now();
        LambdaUpdateWrapper<SysNotification> update = new LambdaUpdateWrapper<>();
        update.eq(SysNotification::getUserId, userId)
                .eq(SysNotification::getReadFlag, false)
                .set(SysNotification::getReadFlag, true)
                .set(SysNotification::getReadAt, now)
                .set(SysNotification::getUpdatedAt, now);
        this.update(update);
        broadcastUnreadCount(userId);
    }

    @Override
    public void notifyTaskDue(PmTask task, Collection<Long> recipientIds, LocalDateTime now) {
        if (task == null || task.getId() == null || task.getDueTime() == null) {
            return;
        }
        for (Long userId : normalizeRecipients(recipientIds)) {
            String dedupeKey = String.format("%s:%d:%d:%s",
                    TYPE_TASK_DUE, task.getId(), userId, window(task.getDueTime()));
            createIfAbsent(userId,
                    TYPE_TASK_DUE,
                    "任务即将到期",
                    "任务「" + task.getTitle() + "」将在近期到期，请及时处理。",
                    SOURCE_TASK,
                    task.getId(),
                    boardPath(task.getProjectId()),
                    dedupeKey,
                    null,
                    now);
        }
    }

    @Override
    public void notifyTaskOverdue(PmTask task, Collection<Long> recipientIds, LocalDateTime now) {
        if (task == null || task.getId() == null || task.getDueTime() == null) {
            return;
        }
        for (Long userId : normalizeRecipients(recipientIds)) {
            String dedupeKey = String.format("%s:%d:%d:%s",
                    TYPE_TASK_OVERDUE, task.getId(), userId, now.toLocalDate());
            createIfAbsent(userId,
                    TYPE_TASK_OVERDUE,
                    "任务已逾期",
                    "任务「" + task.getTitle() + "」已超过截止时间，请尽快处理。",
                    SOURCE_TASK,
                    task.getId(),
                    boardPath(task.getProjectId()),
                    dedupeKey,
                    null,
                    now);
        }
    }

    @Override
    public void notifyTaskCompleted(PmTask task, Collection<Long> recipientIds, Long actorId, LocalDateTime completedAt) {
        if (task == null || task.getId() == null) {
            return;
        }
        LocalDateTime safeCompletedAt = completedAt != null ? completedAt : LocalDateTime.now();
        for (Long userId : normalizeRecipients(recipientIds)) {
            String dedupeKey = String.format("%s:%d:%d:%s",
                    TYPE_TASK_COMPLETED, task.getId(), userId, operationWindow(safeCompletedAt));
            createIfAbsent(userId,
                    TYPE_TASK_COMPLETED,
                    "任务已完成",
                    "任务「" + task.getTitle() + "」已完成，请查看。",
                    SOURCE_TASK,
                    task.getId(),
                    boardPath(task.getProjectId()),
                    dedupeKey,
                    actorId,
                    safeCompletedAt);
        }
    }

    @Override
    public void notifyRecurringPlanDue(PmRecurringPlan plan, Collection<Long> recipientIds, LocalDateTime now) {
        if (plan == null || plan.getId() == null || plan.getNextRunAt() == null) {
            return;
        }
        for (Long userId : normalizeRecipients(recipientIds)) {
            String dedupeKey = String.format("%s:%d:%d:%s",
                    TYPE_RECURRING_PLAN_DUE, plan.getId(), userId, window(plan.getNextRunAt()));
            createIfAbsent(userId,
                    TYPE_RECURRING_PLAN_DUE,
                    "周期计划到期",
                    "周期计划「" + plan.getTitle() + "」已进入本期处理窗口。",
                    SOURCE_RECURRING_PLAN,
                    plan.getId(),
                    "/project/recurring-plan",
                    dedupeKey,
                    null,
                    now);
        }
    }

    @Override
    public void notifyRecurringPlanOverdue(PmRecurringPlan plan,
                                           LocalDateTime nextDueTime,
                                           Collection<Long> recipientIds,
                                           LocalDateTime now) {
        if (plan == null || plan.getId() == null || nextDueTime == null) {
            return;
        }
        for (Long userId : normalizeRecipients(recipientIds)) {
            String dedupeKey = String.format("%s:%d:%d:%s",
                    TYPE_RECURRING_PLAN_OVERDUE, plan.getId(), userId, window(nextDueTime));
            createIfAbsent(userId,
                    TYPE_RECURRING_PLAN_OVERDUE,
                    "周期计划已逾期",
                    "周期计划「" + plan.getTitle() + "」本期截止时间已过，请完成、跳过或延期。",
                    SOURCE_RECURRING_PLAN,
                    plan.getId(),
                    "/project/recurring-plan",
                    dedupeKey,
                    null,
                    now);
        }
    }

    @Override
    public void notifyProjectMemberJoined(PmProject project, Long targetUserId, Long actorId) {
        if (project == null || targetUserId == null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        createIfAbsent(targetUserId,
                TYPE_PROJECT_MEMBER_JOINED,
                "你已加入项目",
                "你已被加入项目「" + project.getName() + "」。",
                SOURCE_PROJECT,
                project.getId(),
                boardPath(project.getId()),
                String.format("%s:%d:%d:%s", TYPE_PROJECT_MEMBER_JOINED, project.getId(), targetUserId, now.toLocalDate()),
                actorId,
                now);
    }

    @Override
    public void notifyProjectMemberRoleUpdated(PmProject project, Long targetUserId, Long actorId, String roleLabel) {
        if (project == null || targetUserId == null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        createIfAbsent(targetUserId,
                TYPE_PROJECT_MEMBER_ROLE_UPDATED,
                "项目角色已调整",
                "你在项目「" + project.getName() + "」中的角色已调整为「" + roleLabel + "」。",
                SOURCE_PROJECT,
                project.getId(),
                boardPath(project.getId()),
                String.format("%s:%d:%d:%s:%s",
                        TYPE_PROJECT_MEMBER_ROLE_UPDATED, project.getId(), targetUserId, roleLabel, now.toLocalDate()),
                actorId,
                now);
    }

    @Override
    public void notifyProjectMemberRemoved(PmProject project, Long targetUserId, Long actorId) {
        if (project == null || targetUserId == null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        createIfAbsent(targetUserId,
                TYPE_PROJECT_MEMBER_REMOVED,
                "你已被移出项目",
                "你已被移出项目「" + project.getName() + "」。",
                SOURCE_PROJECT,
                project.getId(),
                "/project/list",
                String.format("%s:%d:%d:%s", TYPE_PROJECT_MEMBER_REMOVED, project.getId(), targetUserId, now.toLocalDate()),
                actorId,
                now);
    }

    @Override
    public void notifyProjectMemberQuit(PmProject project, Long targetUserId, Long actorId) {
        if (project == null || targetUserId == null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        createIfAbsent(targetUserId,
                TYPE_PROJECT_MEMBER_QUIT,
                "项目成员已退出",
                "项目「" + project.getName() + "」有成员主动退出。",
                SOURCE_PROJECT,
                project.getId(),
                boardPath(project.getId()),
                String.format("%s:%d:%d:%s", TYPE_PROJECT_MEMBER_QUIT, project.getId(), targetUserId, now.toLocalDate()),
                actorId,
                now);
    }

    private SysNotification createIfAbsent(Long userId,
                                           String type,
                                           String title,
                                           String content,
                                           String sourceType,
                                           Long sourceId,
                                           String targetPath,
                                           String dedupeKey,
                                           Long actorId,
                                           LocalDateTime now) {
        if (userId == null || !StringUtils.hasText(dedupeKey)) {
            return null;
        }

        SysNotification existing = findByDedupeKey(userId, dedupeKey);
        if (existing != null) {
            return existing;
        }

        SysNotification notification = new SysNotification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(trim(title, 160));
        notification.setContent(trim(content, 1000));
        notification.setSourceType(sourceType);
        notification.setSourceId(sourceId);
        notification.setTargetPath(targetPath);
        notification.setDedupeKey(dedupeKey);
        notification.setActorId(actorId);
        notification.setReadFlag(false);
        notification.setCreatedAt(now);
        notification.setUpdatedAt(now);

        try {
            this.save(notification);
            broadcastUnreadCount(userId);
            return notification;
        } catch (DuplicateKeyException ignored) {
            return findByDedupeKey(userId, dedupeKey);
        }
    }

    private SysNotification findByDedupeKey(Long userId, String dedupeKey) {
        LambdaQueryWrapper<SysNotification> query = new LambdaQueryWrapper<>();
        query.eq(SysNotification::getUserId, userId)
                .eq(SysNotification::getDedupeKey, dedupeKey)
                .last("LIMIT 1");
        return this.getOne(query);
    }

    private SysNotification requireOwnNotification(Long notificationId, Long userId) {
        LambdaQueryWrapper<SysNotification> query = new LambdaQueryWrapper<>();
        query.eq(SysNotification::getId, notificationId)
                .eq(SysNotification::getUserId, userId);
        SysNotification notification = this.getOne(query);
        if (notification == null) {
            throw new RuntimeException("通知不存在");
        }
        return notification;
    }

    private NotificationVO toVO(SysNotification notification) {
        NotificationVO vo = new NotificationVO();
        vo.setId(notification.getId());
        vo.setUserId(notification.getUserId());
        vo.setType(notification.getType());
        vo.setTitle(notification.getTitle());
        vo.setContent(notification.getContent());
        vo.setSourceType(notification.getSourceType());
        vo.setSourceId(notification.getSourceId());
        vo.setTargetPath(notification.getTargetPath());
        vo.setActorId(notification.getActorId());
        vo.setRead(Boolean.TRUE.equals(notification.getReadFlag()));
        vo.setReadAt(notification.getReadAt());
        vo.setCreatedAt(notification.getCreatedAt());
        return vo;
    }

    private Set<Long> normalizeRecipients(Collection<Long> recipientIds) {
        if (recipientIds == null || recipientIds.isEmpty()) {
            return Set.of();
        }
        return recipientIds.stream()
                .filter(Objects::nonNull)
                .filter(id -> id > 0)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private void broadcastUnreadCount(Long userId) {
        SimpMessagingTemplate messagingTemplate = messagingTemplateProvider.getIfAvailable();
        if (messagingTemplate == null || userId == null) {
            return;
        }
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, countUnread(userId));
    }

    private long countUnreadValue(Long userId) {
        LambdaQueryWrapper<SysNotification> query = new LambdaQueryWrapper<>();
        query.eq(SysNotification::getUserId, userId)
                .eq(SysNotification::getReadFlag, false);
        Long count = this.count(query);
        return count == null ? 0L : count;
    }

    private String boardPath(Long projectId) {
        return projectId == null ? "/project/list" : "/project/board/" + projectId;
    }

    private String window(LocalDateTime value) {
        return value == null ? "none" : value.format(WINDOW_FORMATTER);
    }

    private String operationWindow(LocalDateTime value) {
        return value == null ? "none" : value.format(OPERATION_FORMATTER);
    }

    private String trim(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private void requireLogin(Long userId) {
        if (userId == null) {
            throw new RuntimeException("用户未登录");
        }
    }

    private int normalizeCurrent(Integer current) {
        return current == null || current < 1 ? 1 : current;
    }

    private int normalizeSize(Integer size) {
        if (size == null || size < 1) {
            return 20;
        }
        return Math.min(size, 100);
    }
}
