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
}
/**
 * 获取文件列表
 * @param projectId 项目ID
 * @param parentId 父节点ID，默认0表示根目录
 * @returns 文件列表及面包屑导航
 */
export function fetchFileList(projectId, parentId = 0) {
  return request.get({
    url: `/projects/${projectId}/files`,
    params: { parentId }
  })
}
/**
 * 创建文件夹
 * @param params 创建文件夹参数
 * @returns 创建的文件夹信息
 */
export function createFolder(params) {
  return request.post({
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
export function uploadFile(file, projectId, parentId = 0) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', String(projectId))
  formData.append('parentId', String(parentId))
  return request.post({
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
export function fetchTaskFiles(taskId) {
  return request.get({
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
export function uploadTaskFile(file, taskId) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post({
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
export function deleteFileNode(id) {
  return request.del({
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
export function renameFileNode(id, name) {
  return request.put({
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
export function downloadFile(id, fileName) {
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
//# sourceMappingURL=file.js.map
