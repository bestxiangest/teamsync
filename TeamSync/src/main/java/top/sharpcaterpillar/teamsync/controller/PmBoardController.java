package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.StageDTO;
import top.sharpcaterpillar.teamsync.dto.TaskMoveRequest;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.service.BoardBroadcastService;
import top.sharpcaterpillar.teamsync.service.PmBoardService;
import top.sharpcaterpillar.teamsync.service.PmTaskService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

import java.util.List;

/**
 * 看板 Controller
 * 
 * 提供看板数据获取和任务拖拽操作接口
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PmBoardController {

    private static final Logger log = LoggerFactory.getLogger(PmBoardController.class);

    private final PmBoardService pmBoardService;
    private final PmTaskService pmTaskService;
    private final BoardBroadcastService broadcastService;
    private final ProjectPermissionService permissionService;

    /**
     * 获取项目看板数据
     * GET /api/projects/{projectId}/board
     *
     * @param projectId 项目ID
     * @return 阶段列表（包含任务）
     */
    @GetMapping("/projects/{projectId}/board")
    public Result getBoard(@PathVariable Long projectId) {
        Long currentUserId = UserContext.getUserId();
        log.info("获取看板数据: projectId={}, userId={}", projectId, currentUserId);
        
        try {
            // 权限检查：必须是项目成员
            permissionService.checkTaskReadPermission(projectId, currentUserId);
            
            List<StageDTO> stages = pmBoardService.getBoard(projectId);
            return Result.success(stages);
        } catch (RuntimeException e) {
            log.warn("获取看板失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("获取看板数据失败: " + e.getMessage());
        }
    }

    /**
     * 移动任务
     * PUT /api/tasks/{taskId}/move
     * 
     * 支持跨阶段拖拽和同阶段内排序
     *
     * @param taskId  任务ID
     * @param request 移动请求（目标阶段ID和新排序）
     * @return 操作结果
     */
    @PutMapping("/tasks/{taskId}/move")
    public Result moveTask(@PathVariable Long taskId, @RequestBody TaskMoveRequest request) {
        Long currentUserId = UserContext.getUserId();
        String username = UserContext.getUsername();
        
        // 参数校验
        if (request.getTargetStageId() == null) {
            return Result.error("目标阶段ID不能为空");
        }
        if (request.getNewSort() == null) {
            return Result.error("新排序索引不能为空");
        }

        try {
            // 先获取任务以得到 projectId
            PmTask task = pmTaskService.getById(taskId);
            if (task == null) {
                return Result.error("任务不存在");
            }
            Long projectId = task.getProjectId();
            
            // 权限检查：必须是项目成员
            permissionService.checkTaskWritePermission(projectId, currentUserId);
            
            pmBoardService.moveTask(taskId, request, currentUserId);
            
            // 广播任务移动消息
            broadcastService.broadcastTaskMoved(projectId, taskId, currentUserId, username);
            
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("移动任务失败: " + e.getMessage());
        }
    }

}
