package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.CommentRequest;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.service.PmTaskService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.service.TaskActivityService;
import top.sharpcaterpillar.teamsync.utils.UserContext;
import top.sharpcaterpillar.teamsync.vo.ActivityVO;

import java.util.List;

/**
 * 任务活动 Controller
 * 
 * 提供任务评论和动态日志相关接口
 */
@RestController
@RequestMapping("/api/tasks/{taskId}")
@RequiredArgsConstructor
public class PmTaskActivityController {

    private static final Logger log = LoggerFactory.getLogger(PmTaskActivityController.class);

    private final TaskActivityService activityService;
    private final PmTaskService taskService;
    private final ProjectPermissionService permissionService;

    /**
     * 获取任务活动流（评论 + 日志 混合）
     * GET /api/tasks/{taskId}/activities
     *
     * @param taskId 任务ID
     * @return 活动列表（按时间倒序）
     */
    @GetMapping("/activities")
    public Result getActivities(@PathVariable Long taskId) {
        Long currentUserId = UserContext.getUserId();
        log.info("获取任务活动流: taskId={}, userId={}", taskId, currentUserId);

        try {
            // 先获取任务以得到 projectId
            PmTask task = taskService.getById(taskId);
            if (task == null) {
                return Result.error("任务不存在");
            }

            // 权限检查：必须是项目成员
            permissionService.checkTaskReadPermission(task.getProjectId(), currentUserId);

            List<ActivityVO> activities = activityService.getTaskActivities(taskId);
            return Result.success(activities);
        } catch (RuntimeException e) {
            log.warn("获取活动流失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 发表评论
     * POST /api/tasks/{taskId}/comments
     *
     * @param taskId  任务ID
     * @param request 评论请求
     * @return 新评论的活动VO
     */
    @PostMapping("/comments")
    public Result addComment(@PathVariable Long taskId, @RequestBody CommentRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("发表评论: taskId={}, userId={}", taskId, currentUserId);

        try {
            // 先获取任务以得到 projectId
            PmTask task = taskService.getById(taskId);
            if (task == null) {
                return Result.error("任务不存在");
            }

            // 权限检查：必须是项目成员
            permissionService.checkTaskWritePermission(task.getProjectId(), currentUserId);

            ActivityVO comment = activityService.addComment(taskId, currentUserId, request.getContent());
            log.info("评论发表成功: taskId={}, commentId={}", taskId, comment.getId());
            return Result.success(comment);
        } catch (RuntimeException e) {
            log.warn("发表评论失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

}
