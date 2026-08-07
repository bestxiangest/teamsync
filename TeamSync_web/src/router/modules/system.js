export const systemRoutes = {
    path: '/system',
    name: 'System',
    component: '/index/index',
    meta: {
        title: 'menus.system.title',
        icon: 'ri:user-3-line',
        roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
        {
            path: 'user',
            name: 'User',
            component: '/system/user',
            meta: {
                title: 'menus.system.user',
                keepAlive: true,
                roles: ['R_SUPER'], // 只有超级管理员有权限
                authList: [
                    { title: '新增', authMark: 'add' },
                    { title: '编辑', authMark: 'edit' },
                    { title: '删除', authMark: 'delete' },
                    { title: '重置密码', authMark: 'reset-pwd' }
                ]
            }
        },
        {
            path: 'role',
            name: 'Role',
            component: '/system/role',
            meta: {
                title: 'menus.system.role',
                keepAlive: true,
                roles: ['R_SUPER'],
                isHide: true // 隐藏：后端未实现角色管理接口
            }
        },
        {
            path: 'menu',
            name: 'Menus',
            component: '/system/menu',
            meta: {
                title: 'menus.system.menu',
                keepAlive: true,
                roles: ['R_SUPER'],
                authList: [
                    { title: '新增', authMark: 'add' },
                    { title: '编辑', authMark: 'edit' },
                    { title: '删除', authMark: 'delete' }
                ]
            }
        }
    ]
};
//# sourceMappingURL=system.js.map
