/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { formatMenuTitle } from '@/utils/router';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtBreadcrumb' });
const route = useRoute();
const router = useRouter();
// 使用computed替代watch，提高性能
const breadcrumbItems = computed(() => {
    const { matched } = route;
    const matchedLength = matched.length;
    // 处理首页情况
    if (!matchedLength || isHomeRoute(matched[0])) {
        return [];
    }
    // 处理一级菜单和普通路由
    const firstRoute = matched[0];
    const isFirstLevel = firstRoute.meta?.isFirstLevel;
    const lastIndex = matchedLength - 1;
    const currentRoute = matched[lastIndex];
    const currentRouteMeta = currentRoute.meta;
    let items = isFirstLevel
        ? [createBreadcrumbItem(currentRoute)]
        : matched.map(createBreadcrumbItem);
    // 过滤包裹容器：如果有多个项目且第一个是容器路由（如 /outside），则移除它
    if (items.length > 1 && isWrapperContainer(items[0])) {
        items = items.slice(1);
    }
    // IFrame 页面特殊处理：如果过滤后只剩一个 iframe 页面，或者所有项都是包裹容器，则仅展示当前页
    if (currentRouteMeta?.isIframe && (items.length === 1 || items.every(isWrapperContainer))) {
        return [createBreadcrumbItem(currentRoute)];
    }
    return items;
});
// 辅助函数：判断是否为包裹容器路由
const isWrapperContainer = (item) => item.path === '/outside' && !!item.meta?.isIframe;
// 辅助函数：创建面包屑项目
const createBreadcrumbItem = (route) => ({
    path: route.path,
    meta: route.meta
});
// 辅助函数：判断是否为首页
const isHomeRoute = (route) => route.name === '/';
// 辅助函数：判断是否为最后一项
const isLastItem = (index) => {
    const itemsLength = breadcrumbItems.value.length;
    return index === itemsLength - 1;
};
// 辅助函数：判断是否可点击
const isClickable = (item, index) => item.path !== '/outside' && !isLastItem(index);
// 辅助函数：查找路由的第一个有效子路由
const findFirstValidChild = (route) => route.children?.find((child) => !child.redirect && !child.meta?.isHide);
// 辅助函数：构建完整路径
const buildFullPath = (childPath) => `/${childPath}`.replace('//', '/');
// 处理面包屑点击事件
async function handleBreadcrumbClick(item, index) {
    // 如果是最后一项或外部链接，不处理
    if (isLastItem(index) || item.path === '/outside') {
        return;
    }
    try {
        // 缓存路由表查找结果
        const routes = router.getRoutes();
        const targetRoute = routes.find((route) => route.path === item.path);
        if (!targetRoute?.children?.length) {
            await router.push(item.path);
            return;
        }
        const firstValidChild = findFirstValidChild(targetRoute);
        if (firstValidChild) {
            await router.push(buildFullPath(firstValidChild.path));
        }
        else {
            await router.push(item.path);
        }
    }
    catch (error) {
        console.error('导航失败:', error);
    }
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({ ...{ class: ("ml-2.5 max-lg:!hidden") }, "aria-label": ("breadcrumb"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("flex-c h-full") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.breadcrumbItems))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ key: ((item.path)), ...{ class: ("box-border flex-c h-7 text-sm leading-7") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleBreadcrumbClick(item, index);
                } }, ...{ class: ((__VLS_ctx.isClickable(item, index)
                    ? 'c-p py-1 rounded tad-200 hover:bg-active-color hover:[&_span]:text-g-600'
                    : '')) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("block max-w-46 overflow-hidden text-ellipsis whitespace-nowrap px-1.5 text-sm text-g-600 dark:text-g-800") }, });
        (__VLS_ctx.formatMenuTitle(item.meta?.title));
        if (!__VLS_ctx.isLastItem(index) && item.meta?.title) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mx-1 text-sm not-italic text-g-500") }, "aria-hidden": ("true"), });
        }
    }
    __VLS_styleScopedClasses['ml-2.5'];
    __VLS_styleScopedClasses['max-lg:!hidden'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['h-7'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['leading-7'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['max-w-46'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['text-ellipsis'];
    __VLS_styleScopedClasses['whitespace-nowrap'];
    __VLS_styleScopedClasses['px-1.5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['dark:text-g-800'];
    __VLS_styleScopedClasses['mx-1'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['not-italic'];
    __VLS_styleScopedClasses['text-g-500'];
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
            formatMenuTitle: formatMenuTitle,
            breadcrumbItems: breadcrumbItems,
            isLastItem: isLastItem,
            isClickable: isClickable,
            handleBreadcrumbClick: handleBreadcrumbClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map