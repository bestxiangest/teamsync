export const projectRoutes = {
    name: 'Project',
    path: '/project',
    component: '/index/index',
    meta: {
        title: '项目管理',
        icon: 'ri:folder-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
    },
    children: [
        {
            path: 'list',
            name: 'ProjectList',
            component: '/project/list/index',
            meta: {
                title: '项目列表',
                icon: 'ri:list-check-2',
                keepAlive: true
            }
        },
        {
            path: 'recurring-plan',
            name: 'RecurringPlanList',
            component: '/recurring-plan/list/index',
            meta: {
                title: '周期计划',
                icon: 'ri:repeat-2-line',
                keepAlive: true
            }
        },
        {
            path: 'board/:projectId',
            name: 'KanbanBoard',
            component: '/board/index',
            meta: {
                title: '项目看板',
                icon: 'ri:dashboard-3-line',
                keepAlive: false,
                isHide: true // 不在菜单中显示，通过项目列表跳转
            }
        },
        {
            path: 'files/:projectId',
            name: 'ProjectFiles',
            component: '/project/files/index',
            meta: {
                title: '项目文档',
                icon: 'ri:folder-line',
                keepAlive: false,
                isHide: true // 不在菜单中显示，通过项目列表跳转
            }
        }
    ]
};
//# sourceMappingURL=project.js.map
