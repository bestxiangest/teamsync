import request from '@/utils/http';
/**
 * 获取任务活动流（评论 + 日志 混合，按时间倒序）
 * @param taskId 任务ID
 * @returns 活动列表
 */
export function getTaskActivities(taskId) {
    return request.get({
        url: `/tasks/${taskId}/activities`
    });
}
/**
 * 发表评论
 * @param taskId 任务ID
 * @param content 评论内容
 * @returns 新评论
 */
export function addComment(taskId, content) {
    return request.post({
        url: `/tasks/${taskId}/comments`,
        params: { content }
    });
}
//# sourceMappingURL=activity.js.map