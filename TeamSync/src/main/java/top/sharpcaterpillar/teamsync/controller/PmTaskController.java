package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.TaskDTO;
import top.sharpcaterpillar.teamsync.dto.TaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.service.BoardBroadcastService;
import top.sharpcaterpillar.teamsync.service.PmTaskService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

/**
 * 任务管理 Controller
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class PmTaskController {

    private static final Logger log = LoggerFactory.getLogger(PmTaskController.class);

    private final PmTaskService pmTaskService;
    private final BoardBroadcastService broadcastService;
    private final ProjectPermissionService permissionService;

    /**
     * 创建任务
     * POST /api/tasks
     *
     * @param request 任务请求
     * @return 创建的任务
     */
    @PostMapping
    public Result createTask(@RequestBody TaskRequest request) {
        // 从 ThreadLocal 获取当前登录用户信息
        Long currentUserId = UserContext.getUserId();
        String username = UserContext.getUsername();
        log.info("创建任务: projectId={}, stageId={}, title={}, userId={}",
                request.getProjectId(), request.getStageId(), request.getTitle(), currentUserId);
        try {
            // 权限检查：必须是项目成员
            permissionService.checkTaskWritePermission(request.getProjectId(), currentUserId);
            
            TaskDTO task = pmTaskService.createTask(request, currentUserId);
            log.info("任务创建成功: taskId={}", task.getId());
            
            // 广播任务创建消息
            broadcastService.broadcastTaskCreated(request.getProjectId(), task.getId(), currentUserId, username);
            
            return Result.success(task);
        } catch (RuntimeException e) {
            log.error("创建任务失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取任务详情
     * GET /api/tasks/{id}
     *
     * @param id 任务ID
     * @return 任务详情
     */
    @GetMapping("/{id}")
    public Result getTaskDetail(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        log.info("获取任务详情: taskId={}, userId={}", id, currentUserId);
        try {
            // 先获取任务以得到 projectId
            PmTask task = pmTaskService.getById(id);
            if (task == null) {
                return Result.error("任务不存在");
            }
            
            // 权限检查：必须是项目成员
            permissionService.checkTaskReadPermission(task.getProjectId(), currentUserId);
            
            TaskDTO taskDTO = pmTaskService.getTaskDetail(id);
            return Result.success(taskDTO);
        } catch (RuntimeException e) {
            log.error("获取任务详情失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新任务
     * PUT /api/tasks/{id}
     *
     * @param id      任务ID
     * @param request 任务请求
     * @return 更新后的任务
     */
    @PutMapping("/{id}")
    public Result updateTask(@PathVariable("id") Long id, @RequestBody TaskRequest request) {
        Long currentUserId = UserContext.getUserId();
        String username = UserContext.getUsername();
        log.info("更新任务: taskId={}, title={}, userId={}", id, request.getTitle(), currentUserId);
        try {
            // 先获取任务以得到 projectId
            PmTask existingTask = pmTaskService.getById(id);
            if (existingTask == null) {
                return Result.error("任务不存在");
            }
            
            // 权限检查：必须是项目成员
            permissionService.checkTaskWritePermission(existingTask.getProjectId(), currentUserId);
            
            TaskDTO task = pmTaskService.updateTask(id, request, currentUserId);
            log.info("任务更新成功: taskId={}", task.getId());
            
            // 广播任务更新消息
            broadcastService.broadcastTaskUpdated(existingTask.getProjectId(), id, currentUserId, username);
            
            return Result.success(task);
        } catch (RuntimeException e) {
            log.error("更新任务失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除任务（逻辑删除）
     * DELETE /api/tasks/{id}
     *
     * @param id 任务ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result deleteTask(@PathVariable("id") Long id) {
        Long currentUserId = UserContext.getUserId();
        String username = UserContext.getUsername();
        log.info("删除任务: taskId={}, userId={}", id, currentUserId);
        try {
            // 先获取任务以得到 projectId
            PmTask existingTask = pmTaskService.getById(id);
            if (existingTask == null) {
                return Result.error("任务不存在");
            }
            Long projectId = existingTask.getProjectId();
            
            // 权限检查：必须是项目成员
            permissionService.checkTaskWritePermission(projectId, currentUserId);
            
            pmTaskService.deleteTask(id, currentUserId);
            log.info("任务删除成功: taskId={}", id);
            
            // 广播任务删除消息
            broadcastService.broadcastTaskDeleted(projectId, id, currentUserId, username);
            
            return Result.success("任务删除成功");
        } catch (RuntimeException e) {
            log.error("删除任务失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

}
