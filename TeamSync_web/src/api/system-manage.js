import request from '@/utils/http';
// ==================== 用户管理 API ====================
/**
 * 获取用户列表（分页）
 * GET /api/user/list
 */
export function fetchGetUserList(params) {
    return request.get({
        url: '/user/list',
        params
    });
}
/**
 * 新增用户
 * POST /api/user/add
 */
export function fetchAddUser(data) {
    return request.post({
        url: '/user/add',
        data
    });
}
/**
 * 更新用户
 * PUT /api/user/update
 */
export function fetchUpdateUser(data) {
    return request.put({
        url: '/user/update',
        data
    });
}
/**
 * 删除用户
 * DELETE /api/user/delete/{id}
 */
export function fetchDeleteUser(id) {
    return request.del({
        url: `/user/delete/${id}`
    });
}
/**
 * 重置用户密码
 * PUT /api/user/reset-pwd
 */
export function fetchResetUserPwd(data) {
    return request.put({
        url: '/user/reset-pwd',
        data
    });
}
// ==================== 角色管理 API ====================
/**
 * 获取角色列表
 */
export function fetchGetRoleList(params) {
    return request.get({
        url: '/role/list',
        params
    });
}
// ==================== 菜单管理 API ====================
/**
 * 获取菜单列表
 */
export function fetchGetMenuList() {
    return request.get({
        url: '/v3/system/menus/simple'
    });
}
//# sourceMappingURL=system-manage.js.map