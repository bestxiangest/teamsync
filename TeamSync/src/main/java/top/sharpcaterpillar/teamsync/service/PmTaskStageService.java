package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.sharpcaterpillar.teamsync.dto.StageCreateRequest;
import top.sharpcaterpillar.teamsync.dto.StageUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;

/**
 * 任务阶段 Service 接口
 */
public interface PmTaskStageService extends IService<PmTaskStage> {

    /**
     * 创建新阶段（放在最后）
     *
     * @param request 创建请求
     * @param userId  当前用户ID（用于权限校验）
     * @return 创建的阶段
     */
    PmTaskStage createStage(StageCreateRequest request, Long userId);

    /**
     * 更新阶段（重命名）
     *
     * @param stageId 阶段ID
     * @param request 更新请求
     * @param userId  当前用户ID（用于权限校验）
     * @return 更新后的阶段
     */
    PmTaskStage updateStage(Long stageId, StageUpdateRequest request, Long userId);

    /**
     * 删除阶段
     *
     * @param stageId 阶段ID
     * @param userId  当前用户ID（用于权限校验）
     */
    void deleteStage(Long stageId, Long userId);

}

