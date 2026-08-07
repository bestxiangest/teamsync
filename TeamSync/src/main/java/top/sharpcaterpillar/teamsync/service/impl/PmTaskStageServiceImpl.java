package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.sharpcaterpillar.teamsync.dto.StageCreateRequest;
import top.sharpcaterpillar.teamsync.dto.StageUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmTask;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.service.PmTaskStageService;
import top.sharpcaterpillar.teamsync.service.ProjectPermissionService;

/**
 * 任务阶段 Service 实现类。
 */
@Service
@RequiredArgsConstructor
public class PmTaskStageServiceImpl extends ServiceImpl<PmTaskStageMapper, PmTaskStage> implements PmTaskStageService {

    private final PmTaskMapper taskMapper;
    private final ProjectPermissionService permissionService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PmTaskStage createStage(StageCreateRequest request, Long userId) {
        if (request.getProjectId() == null) {
            throw new RuntimeException("项目ID不能为空");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("阶段名称不能为空");
        }

        permissionService.checkStageManagePermission(request.getProjectId(), userId);

        LambdaQueryWrapper<PmTaskStage> query = new LambdaQueryWrapper<>();
        query.eq(PmTaskStage::getProjectId, request.getProjectId())
                .orderByDesc(PmTaskStage::getSort)
                .last("LIMIT 1");
        PmTaskStage lastStage = this.getOne(query);
        int newSort = (lastStage == null) ? 0 : lastStage.getSort() + 1;

        PmTaskStage stage = new PmTaskStage();
        stage.setProjectId(request.getProjectId());
        stage.setName(request.getName().trim());
        stage.setSort(newSort);
        this.save(stage);

        return stage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PmTaskStage updateStage(Long stageId, StageUpdateRequest request, Long userId) {
        PmTaskStage stage = this.getById(stageId);
        if (stage == null) {
            throw new RuntimeException("阶段不存在");
        }

        permissionService.checkStageManagePermission(stage.getProjectId(), userId);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            stage.setName(request.getName().trim());
        }
        if (request.getSort() != null) {
            if (request.getSort() < 0) {
                throw new RuntimeException("排序号不能小于 0");
            }
            stage.setSort(request.getSort());
        }

        this.updateById(stage);

        return stage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteStage(Long stageId, Long userId) {
        PmTaskStage stage = this.getById(stageId);
        if (stage == null) {
            throw new RuntimeException("阶段不存在");
        }

        permissionService.checkStageManagePermission(stage.getProjectId(), userId);

        LambdaQueryWrapper<PmTask> taskQuery = new LambdaQueryWrapper<>();
        taskQuery.eq(PmTask::getStageId, stageId)
                .eq(PmTask::getIsDeleted, 0);
        Long taskCount = taskMapper.selectCount(taskQuery);
        if (taskCount > 0) {
            throw new RuntimeException("该列下还有 " + taskCount + " 个任务，请先移动或删除任务后再删除列");
        }

        this.removeById(stageId);
    }
}
