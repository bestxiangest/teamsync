import request from '@/utils/http';
/**
 * 获取任务的所有子任务
 * @param taskId 任务ID
 * @returns 子任务列表
 */
export function getSubTasks(taskId) {
    return request.get({
        url: `/tasks/${taskId}/subtasks`
    });
}
/**
 * 创建子任务
 * @param taskId 任务ID
 * @param content 子任务内容
 * @param dueTime 截止时间（可选）
 * @returns 创建的子任务
 */
export function createSubTask(taskId, content, dueTime) {
    return request.post({
        url: `/tasks/${taskId}/subtasks`,
        params: { content, dueTime }
    });
}
/**
 * 更新子任务（状态或内容）
 * @param subtaskId 子任务ID
 * @param params 更新参数
 * @returns 更新后的子任务
 */
export function updateSubTask(subtaskId, params) {
    return request.put({
        url: `/subtasks/${subtaskId}`,
        params
    });
}
/**
 * 删除子任务
 * @param subtaskId 子任务ID
 */
export function deleteSubTask(subtaskId) {
    return request.del({
        url: `/subtasks/${subtaskId}`
    });
}
//# sourceMappingURL=subtask.js.map