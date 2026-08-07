import request from '@/utils/http'

/**
 * 任务活动 API
 */

/** 活动接口（评论 + 日志 混合） */
export interface Activity {
  id: number
  type: 'comment' | 'log'
  taskId: number
  userId: number
  username: string
  nickname: string
  avatar: string
  content: string
  actionType?: string // 仅日志: CREATE/UPDATE/MOVE/DELETE/COMMENT
  createdAt: string
}

/** 评论请求参数 */
export interface CommentParams {
  content: string
}

/**
 * 获取任务活动流（评论 + 日志 混合，按时间倒序）
 * @param taskId 任务ID
 * @returns 活动列表
 */
export function getTaskActivities(taskId: number) {
  return request.get<Activity[]>({
    url: `/tasks/${taskId}/activities`
  })
}

/**
 * 发表评论
 * @param taskId 任务ID
 * @param content 评论内容
 * @returns 新评论
 */
export function addComment(taskId: number, content: string) {
  return request.post<Activity>({
    url: `/tasks/${taskId}/comments`,
    params: { content }
  })
}
