/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { HomeFilled, FolderOpened, ChatDotRound, User } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtMobileNav' });
const router = useRouter();
const route = useRoute();
// 导航项配置
const navItems = [
    {
        path: '/dashboard/console',
        label: '工作台',
        icon: HomeFilled,
        matchPaths: ['/dashboard', '/console']
    },
    {
        path: '/project/list',
        label: '项目',
        icon: FolderOpened,
        matchPaths: ['/project', '/board']
    },
    {
        path: '/message',
        label: '消息',
        icon: ChatDotRound,
        matchPaths: ['/message']
    },
    {
        path: '/profile',
        label: '我的',
        icon: User,
        matchPaths: ['/profile', '/user-center']
    }
];
// 判断当前路由是否激活
const isActive = (path) => {
    const item = navItems.find((nav) => nav.path === path);
    if (!item)
        return false;
    return item.matchPaths.some((matchPath) => route.path.startsWith(matchPath));
};
// 处理导航点击
const handleNavClick = (item) => {
    // 消息和我的暂时只是占位，可以跳转到对应页面或提示
    if (item.path === '/message') {
        ElMessage.info('消息功能开发中...');
        return;
    }
    if (item.path === '/profile') {
        router.push('/system/user-center');
        return;
    }
    router.push(item.path);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({});
;
let __VLS_functionalComponentProps;
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_localComponents = {
        ...{},
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_components;
    const __VLS_localDirectives = {
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_directives;
    let __VLS_styleScopedClasses;
    __VLS_styleScopedClasses['nav-icon'];
    __VLS_styleScopedClasses['mobile-nav'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({ ...{ class: ("mobile-nav") }, });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.navItems))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleNavClick(item);
                } }, key: ((item.path)), ...{ class: ("nav-item") }, ...{ class: (({ active: __VLS_ctx.isActive(item.path) })) }, });
        const __VLS_0 = ((item.icon));
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("nav-icon") }, }));
        const __VLS_2 = __VLS_1({ ...{ class: ("nav-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("nav-label") }, });
        (item.label);
    }
    __VLS_styleScopedClasses['mobile-nav'];
    __VLS_styleScopedClasses['nav-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['nav-icon'];
    __VLS_styleScopedClasses['nav-label'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {};
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            navItems: navItems,
            isActive: isActive,
            handleNavClick: handleNavClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map