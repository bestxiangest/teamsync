package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.NotificationMarkReadRequest;
import top.sharpcaterpillar.teamsync.dto.NotificationQueryRequest;
import top.sharpcaterpillar.teamsync.service.SysNotificationService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

/**
 * 站内通知 Controller。
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class SysNotificationController {

    private static final Logger log = LoggerFactory.getLogger(SysNotificationController.class);

    private final SysNotificationService notificationService;

    @GetMapping
    public Result listNotifications(NotificationQueryRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(notificationService.listNotifications(request, currentUserId));
        } catch (RuntimeException e) {
            log.warn("查询站内通知失败: userId={}, message={}", currentUserId, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/unread-count")
    public Result countUnread() {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(notificationService.countUnread(currentUserId));
        } catch (RuntimeException e) {
            log.warn("查询未读通知数失败: userId={}, message={}", currentUserId, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public Result markRead(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        try {
            return Result.success(notificationService.markRead(id, currentUserId));
        } catch (RuntimeException e) {
            log.warn("标记通知已读失败: userId={}, id={}, message={}", currentUserId, id, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/read")
    public Result markRead(@RequestBody NotificationMarkReadRequest request) {
        Long currentUserId = UserContext.getUserId();
        try {
            notificationService.markRead(request, currentUserId);
            return Result.success("通知已标记为已读");
        } catch (RuntimeException e) {
            log.warn("批量标记通知已读失败: userId={}, message={}", currentUserId, e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/read-all")
    public Result markAllRead() {
        Long currentUserId = UserContext.getUserId();
        try {
            notificationService.markAllRead(currentUserId);
            return Result.success("全部通知已标记为已读");
        } catch (RuntimeException e) {
            log.warn("全部标记通知已读失败: userId={}, message={}", currentUserId, e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}
