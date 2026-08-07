package top.sharpcaterpillar.teamsync.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.sharpcaterpillar.teamsync.dto.TaskDTO;
import top.sharpcaterpillar.teamsync.dto.TaskRequest;
import top.sharpcaterpillar.teamsync.entity.PmTask;

/**
 * 任务 Service 接口
 */
public interface PmTaskService extends IService<PmTask> {

    /**
     * 创建任务
     * 新任务默认添加到该列的最底部
     *
     * @param request 任务请求
     * @param userId  创建人ID
     * @return 创建的任务DTO
     */
    TaskDTO createTask(TaskRequest request, Long userId);

    /**
     * 更新任务
     * 仅更新标题、描述、优先级、截止时间等字段
     * 不处理 stageId 或 sort 变更（由 moveTask 接口负责）
     *
     * @param taskId  任务ID
     * @param request 任务请求
     * @param userId  操作人ID
     * @return 更新后的任务DTO
     */
    TaskDTO updateTask(Long taskId, TaskRequest request, Long userId);

    /**
     * 删除任务（逻辑删除）
     *
     * @param taskId 任务ID
     * @param userId 操作人ID
     */
    void deleteTask(Long taskId, Long userId);

    /**
     * 获取任务详情
     *
     * @param taskId 任务ID
     * @return 任务DTO
     */
    TaskDTO getTaskDetail(Long taskId);

}

