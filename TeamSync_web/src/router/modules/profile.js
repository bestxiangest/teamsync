export const profileRoutes = {
    path: '/user',
    name: 'UserProfile',
    component: '/index/index',
    meta: {
        title: 'menus.system.userCenter',
        icon: 'ri:user-line',
        isHide: true
    },
    children: [
        {
            path: 'center',
            name: 'UserCenter',
            component: '/system/user-center',
            meta: {
                title: 'menus.system.userCenter',
                keepAlive: true,
                isHide: true,
                isHideTab: true
            }
        },
        {
            path: 'notifications',
            name: 'UserNotifications',
            component: '/system/notifications',
            meta: {
                title: '通知中心',
                keepAlive: true,
                isHide: true
            }
        }
    ]
};
