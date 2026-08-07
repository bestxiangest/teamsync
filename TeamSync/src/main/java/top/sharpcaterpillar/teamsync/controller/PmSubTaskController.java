package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.SubTaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmSubTask;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.service.PmSubTaskService;
import top.sharpcaterpillar.teamsync.service.PmTaskService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.service.TaskLogService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 子任务 Controller。
 */
@RestController
@RequiredArgsConstructor
public class PmSubTaskController {

    private static final Logger log = LoggerFactory.getLogger(PmSubTaskController.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final PmSubTaskService subTaskService;
    private final PmTaskService taskService;
    private final ProjectPermissionService permissionService;
    private final TaskLogService taskLogService;

    /**
     * 获取任务的全部子任务。
     */
    @GetMapping("/api/tasks/{taskId}/subtasks")
    public Result getSubTasks(@PathVariable("taskId") Long taskId) {
        log.info("获取子任务列表: taskId={}", taskId);
        try {
            Long currentUserId = UserContext.getUserId();
            PmTask task = getTaskOrThrow(taskId);
            permissionService.checkTaskReadPermission(task.getProjectId(), currentUserId);
            List<PmSubTask> subTasks = subTaskService.getSubTasksByTaskId(taskId);
            return Result.success(subTasks);
        } catch (RuntimeException e) {
            log.error("获取子任务列表失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 创建子任务。
     */
    @PostMapping("/api/tasks/{taskId}/subtasks")
    public Result createSubTask(@PathVariable("taskId") Long taskId, @RequestBody SubTaskRequest request) {
        log.info("创建子任务: taskId={}, content={}", taskId, request.getContent());
        try {
            Long currentUserId = UserContext.getUserId();
            PmTask task = getTaskOrThrow(taskId);
            permissionService.checkTaskWritePermission(task.getProjectId(), currentUserId);
            PmSubTask subTask = subTaskService.createSubTask(taskId, request);
            taskLogService.logSubTask(taskId, currentUserId, "新增了子任务「" + displayText(subTask.getContent()) + "」");
            log.info("子任务创建成功: subtaskId={}", subTask.getId());
            return Result.success(subTask);
        } catch (RuntimeException e) {
            log.error("创建子任务失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新子任务。
     */
    @PutMapping("/api/subtasks/{subtaskId}")
    public Result updateSubTask(@PathVariable("subtaskId") Long subtaskId, @RequestBody SubTaskRequest request) {
        log.info("更新子任务: subtaskId={}, status={}, content={}", subtaskId, request.getStatus(), request.getContent());
        try {
            Long currentUserId = UserContext.getUserId();
            PmSubTask subTaskEntity = subTaskService.getSubTaskById(subtaskId);
            if (subTaskEntity == null) {
                return Result.error("子任务不存在");
            }
            String oldContent = subTaskEntity.getContent();
            Integer oldStatus = subTaskEntity.getStatus();
            LocalDateTime oldDueTime = subTaskEntity.getDueTime();
            PmTask task = getTaskOrThrow(subTaskEntity.getTaskId());
            permissionService.checkTaskWritePermission(task.getProjectId(), currentUserId);
            PmSubTask subTask = subTaskService.updateSubTask(subtaskId, request);
            List<String> changes = buildSubTaskChanges(request, oldContent, oldStatus, oldDueTime, subTask);
            if (!changes.isEmpty()) {
                taskLogService.logSubTask(task.getId(), currentUserId, "更新了子任务「"
                        + displayText(subTask.getContent()) + "」：" + String.join("；", changes));
            }
            log.info("子任务更新成功: subtaskId={}", subTask.getId());
            return Result.success(subTask);
        } catch (RuntimeException e) {
            log.error("更新子任务失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除子任务。
     */
    @DeleteMapping("/api/subtasks/{subtaskId}")
    public Result deleteSubTask(@PathVariable("subtaskId") Long subtaskId) {
        log.info("删除子任务: subtaskId={}", subtaskId);
        try {
            Long currentUserId = UserContext.getUserId();
            PmSubTask subTaskEntity = subTaskService.getSubTaskById(subtaskId);
            if (subTaskEntity == null) {
                return Result.error("子任务不存在");
            }
            PmTask task = getTaskOrThrow(subTaskEntity.getTaskId());
            permissionService.checkTaskWritePermission(task.getProjectId(), currentUserId);
            subTaskService.deleteSubTask(subtaskId);
            taskLogService.logSubTask(task.getId(), currentUserId, "删除了子任务「" + displayText(subTaskEntity.getContent()) + "」");
            log.info("子任务删除成功: subtaskId={}", subtaskId);
            return Result.success("删除成功");
        } catch (RuntimeException e) {
            log.error("删除子任务失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    private PmTask getTaskOrThrow(Long taskId) {
        PmTask task = taskService.getById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        return task;
    }

    private List<String> buildSubTaskChanges(
            SubTaskRequest request,
            String oldContent,
            Integer oldStatus,
            LocalDateTime oldDueTime,
            PmSubTask subTask
    ) {
        List<String> changes = new ArrayList<>();
        if (request.getContent() != null && !Objects.equals(oldContent, subTask.getContent())) {
            changes.add("内容从「" + displayText(oldContent) + "」改为「" + displayText(subTask.getContent()) + "」");
        }
        if (request.getStatus() != null && !Objects.equals(oldStatus, subTask.getStatus())) {
            changes.add("状态从「" + statusText(oldStatus) + "」改为「" + statusText(subTask.getStatus()) + "」");
        }
        if ((request.getDueTime() != null || Boolean.TRUE.equals(request.getClearDueTime()))
                && !Objects.equals(oldDueTime, subTask.getDueTime())) {
            changes.add("截止时间从「" + formatDateTime(oldDueTime) + "」改为「" + formatDateTime(subTask.getDueTime()) + "」");
        }
        return changes;
    }

    private String statusText(Integer status) {
        if (status == null) {
            return "未开始";
        }
        return switch (status) {
            case 1 -> "已完成";
            case 2 -> "处理中";
            default -> "未开始";
        };
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "无" : DATE_TIME_FORMATTER.format(dateTime);
    }

    private String displayText(String value) {
        if (value == null || value.isBlank()) {
            return "空";
        }
        String text = value.trim().replaceAll("\\s+", " ");
        return text.length() <= 40 ? text : text.substring(0, 37) + "...";
    }
}
