export const dashboardRoutes = {
    name: 'Dashboard',
    path: '/dashboard',
    component: '/index/index',
    meta: {
        title: 'menus.dashboard.title',
        icon: 'ri:pie-chart-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
    },
    children: [
        {
            path: 'console',
            name: 'Console',
            component: '/dashboard/console',
            meta: {
                title: 'menus.dashboard.console',
                icon: 'ri:dashboard-line',
                keepAlive: false,
                fixedTab: true
            }
        },
        {
            path: 'overview',
            name: 'Overview',
            component: '/dashboard/overview/index',
            meta: {
                title: 'menus.dashboard.overview',
                icon: 'ri:bar-chart-box-line',
                keepAlive: false
            }
        },
        {
            path: 'calendar',
            name: 'CalendarView',
            component: '/calendar/index',
            meta: {
                title: '日历视图',
                icon: 'ri:calendar-line',
                keepAlive: true
            }
        }
    ]
};
//# sourceMappingURL=dashboard.js.map
