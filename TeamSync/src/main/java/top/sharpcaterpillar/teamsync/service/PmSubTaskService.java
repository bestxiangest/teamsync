package top.sharpcaterpillar.teamsync.service;

import top.sharpcaterpillar.teamsync.dto.SubTaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmSubTask;

import java.util.List;

/**
 * 子任务 Service 接口。
 */
public interface PmSubTaskService {

    /**
     * 获取任务的全部子任务。
     */
    List<PmSubTask> getSubTasksByTaskId(Long taskId);

    /**
     * 根据 ID 获取子任务。
     */
    PmSubTask getSubTaskById(Long subtaskId);

    /**
     * 创建子任务。
     */
    PmSubTask createSubTask(Long taskId, SubTaskRequest request);

    /**
     * 更新子任务。
     */
    PmSubTask updateSubTask(Long subtaskId, SubTaskRequest request);

    /**
     * 删除子任务。
     */
    void deleteSubTask(Long subtaskId);
}
