import { nextTick } from 'vue';
import NProgress from 'nprogress';
import { useSettingStore } from '@/store/modules/setting';
import { useUserStore } from '@/store/modules/user';
import { useMenuStore } from '@/store/modules/menu';
import { setWorktab } from '@/utils/navigation';
import { setPageTitle } from '@/utils/router';
import { RoutesAlias } from '../routesAlias';
import { staticRoutes } from '../routes/staticRoutes';
import { loadingService } from '@/utils/ui';
import { useCommon } from '@/hooks/core/useCommon';
import { useWorktabStore } from '@/store/modules/worktab';
import { fetchGetUserInfo } from '@/api/auth';
import { ApiStatus } from '@/utils/http/status';
import { isHttpError } from '@/utils/http/error';
import { RouteRegistry, MenuProcessor, IframeRouteManager, RoutePermissionValidator } from '../core';
const LEGACY_ROUTE_REDIRECT_MAP = {
    '/system/user-center': '/user/center'
};
// 路由注册器实例
let routeRegistry = null;
// 菜单处理器实例
const menuProcessor = new MenuProcessor();
// 跟踪是否需要关闭 loading
let pendingLoading = false;
// 路由初始化失败标记，防止死循环
// 一旦设置为 true，只有刷新页面或重新登录才能重置
let routeInitFailed = false;
// 路由初始化进行中标记，防止并发请求
let routeInitInProgress = false;
/**
 * 获取 pendingLoading 状态
 */
export function getPendingLoading() {
    return pendingLoading;
}
/**
 * 重置 pendingLoading 状态
 */
export function resetPendingLoading() {
    pendingLoading = false;
}
/**
 * 获取路由初始化失败状态
 */
export function getRouteInitFailed() {
    return routeInitFailed;
}
/**
 * 重置路由初始化状态（用于重新登录场景）
 */
export function resetRouteInitState() {
    routeInitFailed = false;
    routeInitInProgress = false;
}
/**
 * 设置路由全局前置守卫
 */
export function setupBeforeEachGuard(router) {
    // 初始化路由注册器
    routeRegistry = new RouteRegistry(router);
    router.beforeEach(async (to, from, next) => {
        try {
            await handleRouteGuard(to, from, next, router);
        }
        catch (error) {
            console.error('[RouteGuard] 路由守卫处理失败:', error);
            closeLoading();
            next({ name: 'Exception500' });
        }
    });
}
/**
 * 关闭 loading 效果
 */
function closeLoading() {
    if (pendingLoading) {
        nextTick(() => {
            loadingService.hideLoading();
            pendingLoading = false;
        });
    }
}
/**
 * 处理路由守卫逻辑
 */
async function handleRouteGuard(to, from, next, router) {
    const settingStore = useSettingStore();
    const userStore = useUserStore();
    if (handleLegacyRouteRedirect(to, next)) {
        return;
    }
    // 启动进度条
    if (settingStore.showNprogress) {
        NProgress.start();
    }
    // 1. 检查登录状态
    if (!handleLoginStatus(to, userStore, next)) {
        return;
    }
    // 2. 检查路由初始化是否已失败（防止死循环）
    if (routeInitFailed) {
        // 已经失败过，直接放行到错误页面，不再重试
        if (to.matched.length > 0) {
            next();
        }
        else {
            // 未匹配到路由，跳转到 500 页面
            next({ name: 'Exception500', replace: true });
        }
        return;
    }
    // 3. 处理动态路由注册（登录页不需要注册动态路由）
    if (!routeRegistry?.isRegistered() && userStore.isLogin && to.path !== RoutesAlias.Login) {
        // 防止并发请求（快速连续导航场景）
        if (routeInitInProgress) {
            // 正在初始化中，等待完成后重新导航
            next(false);
            return;
        }
        await handleDynamicRoutes(to, next, router);
        return;
    }
    // 4. 处理根路径重定向
    if (handleRootPathRedirect(to, next)) {
        return;
    }
    // 5. 处理已匹配的路由
    if (to.matched.length > 0) {
        setWorktab(to);
        setPageTitle(to);
        next();
        return;
    }
    // 6. 未匹配到路由，跳转到 404
    next({ name: 'Exception404' });
}
function handleLegacyRouteRedirect(to, next) {
    const targetPath = LEGACY_ROUTE_REDIRECT_MAP[to.path];
    if (!targetPath) {
        return false;
    }
    next({
        path: targetPath,
        query: to.query,
        hash: to.hash,
        replace: true
    });
    return true;
}
/**
 * 处理登录状态
 * @returns true 表示可以继续，false 表示已处理跳转
 */
function handleLoginStatus(to, userStore, next) {
    // 已登录或访问登录页或静态路由，直接放行
    if (userStore.isLogin || to.path === RoutesAlias.Login || isStaticRoute(to.path)) {
        return true;
    }
    // 未登录且访问需要权限的页面
    // 只清理状态，不在 logOut 中重定向，由下面的 next() 处理重定向
    userStore.logOut(false);
    next({
        name: 'Login',
        query: { redirect: to.fullPath }
    });
    return false;
}
/**
 * 检查路由是否为静态路由
 */
function isStaticRoute(path) {
    const checkRoute = (routes, targetPath) => {
        return routes.some((route) => {
            // 排除 404 捕获路由，使其不被视为静态路由以触法登录检查
            if (route.name === 'Exception404') {
                return false;
            }
            // 处理动态路由参数匹配
            const routePath = route.path;
            const pattern = routePath.replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(targetPath)) {
                return true;
            }
            if (route.children && route.children.length > 0) {
                return checkRoute(route.children, targetPath);
            }
            return false;
        });
    };
    return checkRoute(staticRoutes, path);
}
/**
 * 处理动态路由注册
 */
async function handleDynamicRoutes(to, next, router) {
    // 标记初始化进行中
    routeInitInProgress = true;
    // 显示 loading
    pendingLoading = true;
    loadingService.showLoading();
    try {
        // 1. 获取用户信息
        await fetchUserInfo();
        // 2. 获取菜单数据
        const menuList = await menuProcessor.getMenuList();
        // 3. 验证菜单数据
        if (!menuProcessor.validateMenuList(menuList)) {
            throw new Error('获取菜单列表失败，请重新登录');
        }
        // 4. 注册动态路由
        routeRegistry?.register(menuList);
        // 取消之前遗留的 resetRouterState 定时器，防止刚注册的路由被清除
        cancelPendingResetTimer();
        // 5. 保存菜单数据到 store
        const menuStore = useMenuStore();
        menuStore.setMenuList(menuList);
        menuStore.addRemoveRouteFns(routeRegistry?.getRemoveRouteFns() || []);
        // 6. 保存 iframe 路由
        IframeRouteManager.getInstance().save();
        // 7. 验证工作标签页
        useWorktabStore().validateWorktabs(router);
        // 8. 验证目标路径权限
        const { homePath } = useCommon();
        const { path: validatedPath, hasPermission } = RoutePermissionValidator.validatePath(to.path, menuList, homePath.value || '/');
        // 初始化成功，重置进行中标记
        routeInitInProgress = false;
        // 9. 确定最终导航目标
        let targetPath;
        if (!hasPermission) {
            closeLoading();
            console.warn(`[RouteGuard] 用户无权限访问路径: ${to.path}，已跳转到首页`);
            targetPath = validatedPath;
        }
        else if (to.path === '/') {
            closeLoading();
            targetPath = homePath.value || validatedPath;
        }
        else {
            targetPath = to.fullPath;
        }
        // 10. 中止当前导航，通过 router.replace 发起全新导航
        // 这样确保 Vue Router 在全新的导航周期中解析路由，能正确匹配刚注册的动态路由
        next(false);
        router.replace(targetPath);
    }
    catch (error) {
        console.error('[RouteGuard] 动态路由注册失败:', error);
        // 关闭 loading
        closeLoading();
        // 401 错误：直接重定向到登录页，而不是取消导航
        // axios 拦截器已经触发了 logOut()，这里确保导航到登录页
        if (isUnauthorizedError(error)) {
            // 重置状态，允许重新登录后再次初始化
            routeInitInProgress = false;
            // 立即清除登录状态，避免重定向到登录页后再次进入 handleDynamicRoutes 形成循环
            const userStore = useUserStore();
            userStore.setLoginStatus(false);
            userStore.setToken('');
            // 重定向到登录页，携带有效的 redirect 参数（排除登录页自身和根路径）
            const redirect = to.fullPath !== RoutesAlias.Login && to.fullPath !== '/' ? to.fullPath : undefined;
            next({
                name: 'Login',
                query: redirect ? { redirect } : undefined,
                replace: true
            });
            return;
        }
        // 标记初始化失败，防止死循环
        routeInitFailed = true;
        routeInitInProgress = false;
        // 输出详细错误信息，便于排查
        if (isHttpError(error)) {
            console.error(`[RouteGuard] 错误码: ${error.code}, 消息: ${error.message}`);
        }
        // 跳转到 500 页面，使用 replace 避免产生历史记录
        next({ name: 'Exception500', replace: true });
    }
}
/**
 * 获取用户信息
 */
async function fetchUserInfo() {
    const userStore = useUserStore();
    const data = await fetchGetUserInfo();
    userStore.setUserInfo(data);
    // 检查并清理工作台标签页（如果是不同用户登录）
    userStore.checkAndClearWorktabs();
}
// 重置路由状态的定时器ID，用于取消之前的定时器避免竞争条件
let resetRouterStateTimer = null;
/**
 * 取消待执行的路由重置定时器（在动态路由成功注册后调用）
 */
function cancelPendingResetTimer() {
    if (resetRouterStateTimer) {
        clearTimeout(resetRouterStateTimer);
        resetRouterStateTimer = null;
    }
}
/**
 * 重置路由相关状态
 */
export function resetRouterState(delay) {
    // 取消之前的定时器，避免重新登录后旧定时器清除新注册的路由
    cancelPendingResetTimer();
    resetRouterStateTimer = setTimeout(() => {
        resetRouterStateTimer = null;
        routeRegistry?.unregister();
        IframeRouteManager.getInstance().clear();
        const menuStore = useMenuStore();
        menuStore.removeAllDynamicRoutes();
        menuStore.setMenuList([]);
        // 重置路由初始化状态，允许重新登录后再次初始化
        resetRouteInitState();
    }, delay);
}
/**
 * 处理根路径重定向到首页
 * @returns true 表示已处理跳转，false 表示无需跳转
 */
function handleRootPathRedirect(to, next) {
    if (to.path !== '/') {
        return false;
    }
    const { homePath } = useCommon();
    if (homePath.value && homePath.value !== '/') {
        next({ path: homePath.value, replace: true });
        return true;
    }
    return false;
}
/**
 * 判断是否为未授权错误（401）
 */
function isUnauthorizedError(error) {
    return isHttpError(error) && error.code === ApiStatus.unauthorized;
}
//# sourceMappingURL=beforeEach.js.map
