import request from '@/utils/http'

/**
 * 项目管理 API
 */

/** 项目分组信息 */
export interface ProjectGroup {
  id: number
  name: string
  ownerId: number
  sort: number
  createdAt: string
}

/** 项目信息 */
export interface Project {
  id: number
  name: string
  description: string
  ownerId: number
  groupId: number // 分组ID
  progress: number // 项目进度 0-100
  isDeleted: number
  isArchived: number // 是否归档 0:活跃 1:已归档
  createdAt: string
  updatedAt: string
}

/** 创建项目请求参数 */
export interface ProjectCreateParams {
  name: string
  description?: string
  groupId?: number
}

/** 更新项目请求参数 */
export interface ProjectUpdateParams {
  name?: string
  description?: string
  progress?: number
  groupId?: number
}

/**
 * 获取项目列表
 * @param archived 是否查询归档项目（true: 已归档, false: 活跃项目）
 * @param groupId 分组ID (undefined: 全部, 0: 根目录, >0: 特定分组)
 * @returns 项目列表
 */
export function fetchProjectList(archived: boolean = false, groupId?: number) {
  return request.get<Project[]>({
    url: '/projects',
    params: { archived, groupId }
  })
}

/**
 * 获取分组列表
 * @returns 分组列表
 */
export function fetchGroupList() {
  return request.get<ProjectGroup[]>({
    url: '/project-groups'
  })
}

/**
 * 创建分组
 * @param name 分组名称
 * @returns 创建的分组
 */
export function createGroup(name: string) {
  return request.post<ProjectGroup>({
    url: '/project-groups',
    data: { name },
    showSuccessMessage: true
  })
}

/**
 * 删除分组
 * @param id 分组ID
 */
export function deleteGroup(id: number) {
  return request.del({
    url: `/project-groups/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 更新分组
 * @param id 分组ID
 * @param name 分组名称
 * @returns 操作结果
 */
export function updateGroup(id: number, name: string) {
  return request.put<ProjectGroup>({
    url: `/project-groups/${id}`,
    data: { name },
    showSuccessMessage: true
  })
}

/**
 * 更新分组排序
 * @param id 分组ID
 * @param sort 排序号
 * @returns 操作结果
 */
export function updateGroupSort(id: number, sort: number) {
  return request.put<ProjectGroup>({
    url: `/project-groups/${id}/sort`,
    data: { sort },
    showSuccessMessage: true
  })
}

/**
 * 移动项目到分组
 * @param projectId 项目ID
 * @param targetGroupId 目标分组ID (0表示根目录)
 */
export function moveProject(projectId: number, targetGroupId: number) {
  return request.put({
    url: `/projects/${projectId}/move`,
    data: { targetGroupId },
    showSuccessMessage: true
  })
}

/**
 * 创建新项目
 * @param params 创建项目参数
 * @returns 创建的项目信息
 */
export function createProject(params: ProjectCreateParams) {
  return request.post<Project>({
    url: '/projects',
    data: params,
    showSuccessMessage: true
  })
}

/**
 * 获取项目详情
 * @param id 项目ID
 * @returns 项目信息
 */
export function getProject(id: number) {
  return request.get<Project>({
    url: `/projects/${id}`
  })
}

/**
 * 更新项目信息
 * @param id 项目ID
 * @param params 更新参数
 * @returns 更新后的项目信息
 */
export function updateProject(id: number, params: ProjectUpdateParams) {
  return request.put<Project>({
    url: `/projects/${id}`,
    data: params,
    showSuccessMessage: true
  })
}

/**
 * 更新项目进度
 * @param id 项目ID
 * @param progress 进度值 0-100
 * @returns 更新后的项目信息
 */
export function updateProjectProgress(id: number, progress: number) {
  return updateProject(id, { progress })
}

/**
 * 删除项目
 * @param id 项目ID
 * @returns 操作结果
 */
export function deleteProject(id: number) {
  return request.del<string>({
    url: `/projects/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 归档项目
 * @param id 项目ID
 * @returns 操作结果
 */
export function archiveProject(id: number) {
  return request.put<string>({
    url: `/projects/${id}/archive`,
    showSuccessMessage: true
  })
}

/**
 * 取消归档项目（还原）
 * @param id 项目ID
 * @returns 操作结果
 */
export function unarchiveProject(id: number) {
  return request.put<string>({
    url: `/projects/${id}/unarchive`,
    showSuccessMessage: true
  })
}
