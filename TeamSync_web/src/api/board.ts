import request from '@/utils/http'

/**
 * 看板 API
 */

/** 负责人接口 */
export interface Assignee {
  userId: number
  nickname: string
  avatar: string
}

/** 任务接口 */
export interface BoardTask {
  id: number
  stageId: number
  title: string
  description: string
  priority: number // 1:普通 2:紧急 3:非常紧急
  status: number // 0:未开始 1:已完成 2:处理中
  startTime: string
  dueTime: string
  sort: number
  creatorId: number
  creatorName: string
  creatorAvatar: string
  assigneeIds: number[]
  assignees: Assignee[]
  followerIds: number[]
  followers: Assignee[]
  createdAt: string
  updatedAt: string
}

/** 阶段接口 */
export interface BoardStage {
  id: number
  projectId: number
  name: string
  sort: number
  tasks: BoardTask[]
  isEditing?: boolean // 前端临时状态：是否正在编辑名称
}

/** 创建阶段请求参数 */
export interface CreateStageParams {
  projectId: number
  name: string
}

/** 更新阶段请求参数 */
export interface UpdateStageParams {
  name?: string
  sort?: number
}

/** 任务移动请求参数 */
export interface MoveTaskParams {
  targetStageId: number
  newSort: number
}

/** 创建任务请求参数 */
export interface CreateTaskParams {
  projectId: number
  stageId: number
  title: string
  description?: string
  priority?: number // 1:普通 2:紧急 3:非常紧急
  startTime?: string
  dueTime?: string
  assigneeIds?: number[]
  followerIds?: number[]
}

/** 更新任务请求参数 */
export interface UpdateTaskParams {
  title?: string
  description?: string
  priority?: number
  status?: number // 0:未开始 1:已完成 2:处理中
  startTime?: string
  clearStartTime?: boolean
  dueTime?: string
  clearDueTime?: boolean
  assigneeIds?: number[]
  followerIds?: number[]
}

/**
 * 获取项目看板数据
 * @param projectId 项目ID
 * @returns 阶段列表（包含任务）
 */
export function getBoardList(projectId: number) {
  return request.get<BoardStage[]>({
    url: `/projects/${projectId}/board`
  })
}

/**
 * 移动任务
 * @param taskId 任务ID
 * @param params 移动参数
 */
export function moveTask(taskId: number, params: MoveTaskParams) {
  return request.put({
    url: `/tasks/${taskId}/move`,
    params
  })
}

/**
 * 创建任务
 * @param params 任务参数
 * @returns 创建的任务
 */
export function createTask(params: CreateTaskParams) {
  return request.post<BoardTask>({
    url: '/tasks',
    params
  })
}

/**
 * 更新任务
 * @param taskId 任务ID
 * @param params 任务参数
 * @returns 更新后的任务
 */
export function updateTask(taskId: number, params: UpdateTaskParams) {
  return request.put<BoardTask>({
    url: `/tasks/${taskId}`,
    params
  })
}

/**
 * 删除任务
 * @param taskId 任务ID
 */
export function deleteTask(taskId: number) {
  return request.del({
    url: `/tasks/${taskId}`
  })
}

/**
 * 获取任务详情
 * @param taskId 任务ID
 * @returns 任务详情
 */
export function getTaskDetail(taskId: number) {
  return request.get<BoardTask>({
    url: `/tasks/${taskId}`
  })
}

// ======================== Stage API ========================

/**
 * 创建阶段（列）
 * @param params 创建参数
 * @returns 创建的阶段
 */
export function createStage(params: CreateStageParams) {
  return request.post<BoardStage>({
    url: '/stages',
    params
  })
}

/**
 * 更新阶段（重命名）
 * @param stageId 阶段ID
 * @param params 更新参数
 * @returns 更新后的阶段
 */
export function updateStage(stageId: number, params: UpdateStageParams) {
  return request.put<BoardStage>({
    url: `/stages/${stageId}`,
    params
  })
}

/**
 * 删除阶段
 * @param stageId 阶段ID
 */
export function deleteStage(stageId: number) {
  return request.del({
    url: `/stages/${stageId}`
  })
}
