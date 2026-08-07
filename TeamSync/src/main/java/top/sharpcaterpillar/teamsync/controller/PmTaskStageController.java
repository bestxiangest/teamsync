package top.sharpcaterpillar.teamsync.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import top.sharpcaterpillar.teamsync.common.Result;
import top.sharpcaterpillar.teamsync.dto.StageCreateRequest;
import top.sharpcaterpillar.teamsync.dto.StageUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.service.PmTaskStageService;
import top.sharpcaterpillar.teamsync.utils.UserContext;

/**
 * 任务阶段管理 Controller
 */
@RestController
@RequestMapping("/api/stages")
@RequiredArgsConstructor
public class PmTaskStageController {

    private static final Logger log = LoggerFactory.getLogger(PmTaskStageController.class);

    private final PmTaskStageService stageService;

    /**
     * 创建新阶段
     * POST /api/stages
     *
     * @param request 创建请求
     * @return 创建的阶段
     */
    @PostMapping
    public Result createStage(@RequestBody StageCreateRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("创建阶段: projectId={}, name={}, userId={}", request.getProjectId(), request.getName(), currentUserId);

        try {
            PmTaskStage stage = stageService.createStage(request, currentUserId);
            return Result.success(stage);
        } catch (Exception e) {
            log.error("创建阶段失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新阶段（重命名）
     * PUT /api/stages/{id}
     *
     * @param id      阶段ID
     * @param request 更新请求
     * @return 更新后的阶段
     */
    @PutMapping("/{id}")
    public Result updateStage(@PathVariable Long id, @RequestBody StageUpdateRequest request) {
        Long currentUserId = UserContext.getUserId();
        log.info("更新阶段: id={}, name={}, userId={}", id, request.getName(), currentUserId);

        try {
            PmTaskStage stage = stageService.updateStage(id, request, currentUserId);
            return Result.success(stage);
        } catch (Exception e) {
            log.error("更新阶段失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除阶段
     * DELETE /api/stages/{id}
     *
     * @param id 阶段ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result deleteStage(@PathVariable Long id) {
        Long currentUserId = UserContext.getUserId();
        log.info("删除阶段: id={}, userId={}", id, currentUserId);

        try {
            stageService.deleteStage(id, currentUserId);
            return Result.success("删除成功");
        } catch (Exception e) {
            log.error("删除阶段失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

}
