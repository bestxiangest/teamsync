package top.sharpcaterpillar.teamsync.service;

import top.sharpcaterpillar.teamsync.dto.NotificationMarkReadRequest;
import top.sharpcaterpillar.teamsync.dto.NotificationQueryRequest;
import top.sharpcaterpillar.teamsync.entity.PmProject;
import top.sharpcaterpillar.teamsync.entity.PmRecurringPlan;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.vo.NotificationUnreadCountVO;
import top.sharpcaterpillar.teamsync.vo.NotificationVO;
import top.sharpcaterpillar.teamsync.vo.PageVO;

import java.time.LocalDateTime;
import java.util.Collection;

/**
 * 站内通知服务。
 */
public interface SysNotificationService {

    String TYPE_TASK_DUE = "TASK_DUE";
    String TYPE_TASK_OVERDUE = "TASK_OVERDUE";
    String TYPE_TASK_COMPLETED = "TASK_COMPLETED";
    String TYPE_RECURRING_PLAN_DUE = "RECURRING_PLAN_DUE";
    String TYPE_RECURRING_PLAN_OVERDUE = "RECURRING_PLAN_OVERDUE";
    String TYPE_PROJECT_MEMBER_JOINED = "PROJECT_MEMBER_JOINED";
    String TYPE_PROJECT_MEMBER_ROLE_UPDATED = "PROJECT_MEMBER_ROLE_UPDATED";
    String TYPE_PROJECT_MEMBER_REMOVED = "PROJECT_MEMBER_REMOVED";
    String TYPE_PROJECT_MEMBER_QUIT = "PROJECT_MEMBER_QUIT";

    PageVO<NotificationVO> listNotifications(NotificationQueryRequest request, Long userId);

    NotificationUnreadCountVO countUnread(Long userId);

    NotificationVO markRead(Long notificationId, Long userId);

    void markRead(NotificationMarkReadRequest request, Long userId);

    void markAllRead(Long userId);

    void notifyTaskDue(PmTask task, Collection<Long> recipientIds, LocalDateTime now);

    void notifyTaskOverdue(PmTask task, Collection<Long> recipientIds, LocalDateTime now);

    void notifyTaskCompleted(PmTask task, Collection<Long> recipientIds, Long actorId, LocalDateTime completedAt);

    void notifyRecurringPlanDue(PmRecurringPlan plan, Collection<Long> recipientIds, LocalDateTime now);

    void notifyRecurringPlanOverdue(PmRecurringPlan plan,
                                    LocalDateTime nextDueTime,
                                    Collection<Long> recipientIds,
                                    LocalDateTime now);

    void notifyProjectMemberJoined(PmProject project, Long targetUserId, Long actorId);

    void notifyProjectMemberRoleUpdated(PmProject project, Long targetUserId, Long actorId, String roleLabel);

    void notifyProjectMemberRemoved(PmProject project, Long targetUserId, Long actorId);

    void notifyProjectMemberQuit(PmProject project, Long targetUserId, Long actorId);
}
