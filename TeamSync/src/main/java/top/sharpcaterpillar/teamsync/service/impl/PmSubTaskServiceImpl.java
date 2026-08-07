package top.sharpcaterpillar.teamsync.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import top.sharpcaterpillar.teamsync.dto.SubTaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmSubTask;
import top.sharpcaterpillar.teamsync.mapper.PmSubTaskMapper;
import top.sharpcaterpillar.teamsync.service.PmSubTaskService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 子任务 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class PmSubTaskServiceImpl extends ServiceImpl<PmSubTaskMapper, PmSubTask> implements PmSubTaskService {

    @Override
    public List<PmSubTask> getSubTasksByTaskId(Long taskId) {
        LambdaQueryWrapper<PmSubTask> query = new LambdaQueryWrapper<>();
        query.eq(PmSubTask::getTaskId, taskId)
                .orderByAsc(PmSubTask::getSort)
                .orderByAsc(PmSubTask::getCreatedAt);
        return this.list(query);
    }

    @Override
    public PmSubTask getSubTaskById(Long subtaskId) {
        return this.getById(subtaskId);
    }

    @Override
    public PmSubTask createSubTask(Long taskId, SubTaskRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new RuntimeException("子任务内容不能为空");
        }

        // 计算排序值
        Integer maxSort = getMaxSort(taskId);
        int newSort = (maxSort == null) ? 0 : maxSort + 1;

        PmSubTask subTask = new PmSubTask();
        subTask.setTaskId(taskId);
        subTask.setContent(request.getContent().trim());
        subTask.setStatus(0); // 默认未完成
        subTask.setSort(newSort);
        subTask.setDueTime(request.getDueTime());
        subTask.setCreatedAt(LocalDateTime.now());

        this.save(subTask);
        return subTask;
    }

    @Override
    public PmSubTask updateSubTask(Long subtaskId, SubTaskRequest request) {
        PmSubTask subTask = this.getById(subtaskId);
        if (subTask == null) {
            throw new RuntimeException("子任务不存在");
        }

        // 更新内容
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            subTask.setContent(request.getContent().trim());
        }

        // 更新状态
        if (request.getStatus() != null) {
            subTask.setStatus(request.getStatus());
        }

        // 更新截止时间。未传 dueTime 时不改动；clearDueTime=true 时清除。
        if (request.getDueTime() != null || Boolean.TRUE.equals(request.getClearDueTime())) {
            subTask.setDueTime(Boolean.TRUE.equals(request.getClearDueTime()) ? null : request.getDueTime());
        }

        this.updateById(subTask);
        return subTask;
    }

    @Override
    public void deleteSubTask(Long subtaskId) {
        PmSubTask subTask = this.getById(subtaskId);
        if (subTask == null) {
            throw new RuntimeException("子任务不存在");
        }
        this.removeById(subtaskId);
    }

    /**
     * 获取任务下最大的排序值
     */
    private Integer getMaxSort(Long taskId) {
        LambdaQueryWrapper<PmSubTask> query = new LambdaQueryWrapper<>();
        query.eq(PmSubTask::getTaskId, taskId)
                .orderByDesc(PmSubTask::getSort)
                .last("LIMIT 1");
        PmSubTask subTask = this.getOne(query);
        return subTask != null ? subTask.getSort() : null;
    }

}
