import request from '@/utils/http';
/**
 * 获取项目看板数据
 * @param projectId 项目ID
 * @returns 阶段列表（包含任务）
 */
export function getBoardList(projectId) {
    return request.get({
        url: `/projects/${projectId}/board`
    });
}
/**
 * 移动任务
 * @param taskId 任务ID
 * @param params 移动参数
 */
export function moveTask(taskId, params) {
    return request.put({
        url: `/tasks/${taskId}/move`,
        params
    });
}
/**
 * 创建任务
 * @param params 任务参数
 * @returns 创建的任务
 */
export function createTask(params) {
    return request.post({
        url: '/tasks',
        params
    });
}
/**
 * 更新任务
 * @param taskId 任务ID
 * @param params 任务参数
 * @returns 更新后的任务
 */
export function updateTask(taskId, params) {
    return request.put({
        url: `/tasks/${taskId}`,
        params
    });
}
/**
 * 删除任务
 * @param taskId 任务ID
 */
export function deleteTask(taskId) {
    return request.del({
        url: `/tasks/${taskId}`
    });
}
/**
 * 获取任务详情
 * @param taskId 任务ID
 * @returns 任务详情
 */
export function getTaskDetail(taskId) {
    return request.get({
        url: `/tasks/${taskId}`
    });
}
// ======================== Stage API ========================
/**
 * 创建阶段（列）
 * @param params 创建参数
 * @returns 创建的阶段
 */
export function createStage(params) {
    return request.post({
        url: '/stages',
        params
    });
}
/**
 * 更新阶段（重命名）
 * @param stageId 阶段ID
 * @param params 更新参数
 * @returns 更新后的阶段
 */
export function updateStage(stageId, params) {
    return request.put({
        url: `/stages/${stageId}`,
        params
    });
}
/**
 * 删除阶段
 * @param stageId 阶段ID
 */
export function deleteStage(stageId) {
    return request.del({
        url: `/stages/${stageId}`
    });
}
//# sourceMappingURL=board.js.map