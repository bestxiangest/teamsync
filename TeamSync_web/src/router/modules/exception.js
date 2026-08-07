export const exceptionRoutes = {
    path: '/exception',
    name: 'Exception',
    component: '/index/index',
    meta: {
        title: 'menus.exception.title',
        icon: 'ri:error-warning-line',
        isHide: true // 隐藏整个异常页面目录
    },
    children: [
        {
            path: '403',
            name: 'ExceptionPage403',
            component: '/exception/403',
            meta: {
                title: 'menus.exception.forbidden',
                keepAlive: true,
                isHideTab: true,
                isFullPage: true
            }
        },
        {
            path: '404',
            name: 'ExceptionPage404',
            component: '/exception/404',
            meta: {
                title: 'menus.exception.notFound',
                keepAlive: true,
                isHideTab: true,
                isFullPage: true
            }
        },
        {
            path: '500',
            name: 'ExceptionPage500',
            component: '/exception/500',
            meta: {
                title: 'menus.exception.serverError',
                keepAlive: true,
                isHideTab: true,
                isFullPage: true
            }
        }
    ]
};
//# sourceMappingURL=exception.js.map