import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// ==================== 用户管理 API ====================

/**
 * 获取用户列表（分页）
 * GET /api/user/list
 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/user/list',
    params
  })
}

/**
 * 新增用户请求参数
 */
export interface UserAddParams {
  username: string
  password: string
  nickname?: string
  userPhone?: string
  userEmail?: string
  userGender?: number
  status?: string
  avatar?: string
  isAdmin?: boolean
}

/**
 * 新增用户
 * POST /api/user/add
 */
export function fetchAddUser(data: UserAddParams) {
  return request.post<number>({
    url: '/user/add',
    data
  })
}

/**
 * 更新用户请求参数
 */
export interface UserUpdateParams {
  id: number
  username?: string
  nickname?: string
  userPhone?: string
  userEmail?: string
  userGender?: number
  status?: string
  avatar?: string
  isAdmin?: boolean
}

/**
 * 更新用户
 * PUT /api/user/update
 */
export function fetchUpdateUser(data: UserUpdateParams) {
  return request.put<void>({
    url: '/user/update',
    data
  })
}

/**
 * 删除用户
 * DELETE /api/user/delete/{id}
 */
export function fetchDeleteUser(id: number) {
  return request.del<void>({
    url: `/user/delete/${id}`
  })
}

/**
 * 重置用户密码请求参数
 */
export interface UserResetPwdParams {
  id: number
  newPassword: string
}

/**
 * 重置用户密码
 * PUT /api/user/reset-pwd
 */
export function fetchResetUserPwd(data: UserResetPwdParams) {
  return request.put<void>({
    url: '/user/reset-pwd',
    data
  })
}

// ==================== 角色管理 API ====================

/**
 * 获取角色列表
 */
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/role/list',
    params
  })
}

// ==================== 菜单管理 API ====================

/**
 * 获取菜单列表
 */
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/v3/system/menus/simple'
  })
}
