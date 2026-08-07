import request from '@/utils/http'
import axios from 'axios'
import { useUserStore } from '@/store/modules/user'

/**
 * 项目文档管理 API
 */

/** 文件节点类型 */
export const FILE_NODE_TYPE = {
  FOLDER: 0,
  FILE: 1
} as const

/** 文件节点信息 */
export interface FileNode {
  id: number
  projectId: number
  parentId: number
  nodeType: number // 0-文件夹 1-文件
  name: string
  fileUrl: string | null
  fileSize: number | null
  extension: string | null
  taskId: number | null
  creatorId: number
  creatorName: string
  createdAt: string
  updatedAt: string
  fileSizeFormatted: string
}

/** 面包屑导航项 */
export interface BreadcrumbItem {
  id: number
  name: string
}

/** 文件列表响应 */
export interface FileListResponse {
  files: FileNode[]
  breadcrumb: BreadcrumbItem[]
}

/** 创建文件夹请求 */
export interface FolderCreateParams {
  projectId: number
  parentId: number
  name: string
}

/** 重命名请求 */
export interface RenameParams {
  name: string
}

/**
 * 获取文件列表
 * @param projectId 项目ID
 * @param parentId 父节点ID，默认0表示根目录
 * @returns 文件列表及面包屑导航
 */
export function fetchFileList(projectId: number, parentId: number = 0) {
  return request.get<FileListResponse>({
    url: `/projects/${projectId}/files`,
    params: { parentId }
  })
}

/**
 * 创建文件夹
 * @param params 创建文件夹参数
 * @returns 创建的文件夹信息
 */
export function createFolder(params: FolderCreateParams) {
  return request.post<FileNode>({
    url: '/files/folder',
    params,
    showSuccessMessage: true
  })
}

/**
 * 上传文件
 * @param file 文件
 * @param projectId 项目ID
 * @param parentId 父节点ID
 * @returns 上传的文件信息
 */
export function uploadFile(file: File, projectId: number, parentId: number = 0) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', String(projectId))
  formData.append('parentId', String(parentId))

  return request.post<FileNode>({
    url: '/files/upload',
    params: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    showSuccessMessage: true
  })
}

/**
 * 获取任务附件列表
 * @param taskId 任务ID
 * @returns 附件列表
 */
export function fetchTaskFiles(taskId: number) {
  return request.get<FileNode[]>({
    url: `/tasks/${taskId}/files`,
    showErrorMessage: false
  })
}

/**
 * 上传任务附件
 * @param file 文件
 * @param taskId 任务ID
 * @returns 上传的附件信息
 */
export function uploadTaskFile(file: File, taskId: number) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<FileNode>({
    url: `/tasks/${taskId}/files/upload`,
    params: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    showSuccessMessage: true
  })
}

/**
 * 删除文件/文件夹
 * @param id 节点ID
 * @returns 操作结果
 */
export function deleteFileNode(id: number) {
  return request.del<string>({
    url: `/files/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 重命名文件/文件夹
 * @param id 节点ID
 * @param name 新名称
 * @returns 更新后的节点信息
 */
export function renameFileNode(id: number, name: string) {
  return request.put<FileNode>({
    url: `/files/${id}/rename`,
    params: { name },
    showSuccessMessage: true
  })
}

/**
 * 下载文件
 * @param id 文件节点ID
 * @param fileName 文件名
 */
export function downloadFile(id: number, fileName: string) {
  const { accessToken } = useUserStore()
  return axios({
    baseURL: import.meta.env.VITE_API_URL,
    url: `/files/${id}/download`,
    method: 'GET',
    responseType: 'blob',
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : ''
    }
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  })
}
