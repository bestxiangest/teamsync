export const recurringPlanRoutes = {
    name: 'RecurringPlanLegacy',
    path: '/recurring-plan',
    component: '/index/index',
    meta: {
        title: '周期计划',
        icon: 'ri:calendar-schedule-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
        isHide: true
    },
    children: [
        {
            path: 'list',
            name: 'RecurringPlanLegacyList',
            component: '/recurring-plan/list/index',
            meta: {
                title: '周期计划',
                icon: 'ri:repeat-2-line',
                keepAlive: true,
                isHide: true,
                activePath: '/project/recurring-plan'
            }
        }
    ]
};
