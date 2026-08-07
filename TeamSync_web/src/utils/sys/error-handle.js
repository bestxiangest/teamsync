/**
 * Vue 运行时错误处理
 */
export function vueErrorHandler(err, instance, info) {
    console.error('[VueError]', err, info, instance);
    // 这里可以上报到服务端，比如：
    // reportError({ type: 'vue', err, info })
}
/**
 * 全局脚本错误处理
 */
export function scriptErrorHandler(message, source, lineno, colno, error) {
    // 忽略 ResizeObserver 循环警告（常见于 Element Plus 等 UI 库，不影响功能）
    const msgStr = typeof message === 'string' ? message : message?.message || '';
    if (msgStr.includes('ResizeObserver loop')) {
        return true;
    }
    console.error('[ScriptError]', { message, source, lineno, colno, error });
    // reportError({ type: 'script', message, source, lineno, colno, error })
    return true; // 阻止默认控制台报错，可根据需求改
}
/**
 * Promise 未捕获错误处理
 */
export function registerPromiseErrorHandler() {
    window.addEventListener('unhandledrejection', (event) => {
        console.error('[PromiseError]', event.reason);
        // reportError({ type: 'promise', reason: event.reason })
    });
}
/**
 * 资源加载错误处理 (img, script, css...)
 */
export function registerResourceErrorHandler() {
    window.addEventListener('error', (event) => {
        const target = event.target;
        if (target &&
            (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
            console.error('[ResourceError]', {
                tagName: target.tagName,
                src: target.src ||
                    target.src ||
                    target.href
            });
            // reportError({ type: 'resource', target })
        }
    }, true // 捕获阶段才能监听到资源错误
    );
}
/**
 * 安装统一错误处理
 */
export function setupErrorHandle(app) {
    app.config.errorHandler = vueErrorHandler;
    window.onerror = scriptErrorHandler;
    registerPromiseErrorHandler();
    registerResourceErrorHandler();
}
//# sourceMappingURL=error-handle.js.map