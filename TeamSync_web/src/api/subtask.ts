import request from '@/utils/http'

/**
 * 子任务 API
 */

/** 子任务接口 */
export interface SubTask {
  id: number
  taskId: number
  content: string
  status: number // 0:未开始 1:已完成 2:处理中
  sort: number
  dueTime?: string // 截止时间
  createdAt: string
}

/** 创建/更新子任务请求参数 */
export interface SubTaskRequest {
  content?: string
  status?: number // 0:未开始 1:已完成 2:处理中
  dueTime?: string | null // 截止时间
  clearDueTime?: boolean // 是否清除截止时间
}

/**
 * 获取任务的所有子任务
 * @param taskId 任务ID
 * @returns 子任务列表
 */
export function getSubTasks(taskId: number) {
  return request.get<SubTask[]>({
    url: `/tasks/${taskId}/subtasks`
  })
}

/**
 * 创建子任务
 * @param taskId 任务ID
 * @param content 子任务内容
 * @param dueTime 截止时间（可选）
 * @returns 创建的子任务
 */
export function createSubTask(taskId: number, content: string, dueTime?: string) {
  return request.post<SubTask>({
    url: `/tasks/${taskId}/subtasks`,
    params: { content, dueTime }
  })
}

/**
 * 更新子任务（状态或内容）
 * @param subtaskId 子任务ID
 * @param params 更新参数
 * @returns 更新后的子任务
 */
export function updateSubTask(subtaskId: number, params: SubTaskRequest) {
  return request.put<SubTask>({
    url: `/subtasks/${subtaskId}`,
    params
  })
}

/**
 * 删除子任务
 * @param subtaskId 子任务ID
 */
export function deleteSubTask(subtaskId: number) {
  return request.del({
    url: `/subtasks/${subtaskId}`
  })
}
