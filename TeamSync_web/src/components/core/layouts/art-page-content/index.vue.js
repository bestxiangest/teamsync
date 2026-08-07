/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useRoute } from 'vue-router';
import { useAutoLayoutHeight } from '@/hooks/core/useLayoutHeight';
import { useSettingStore } from '@/store/modules/setting';
import { useWorktabStore } from '@/store/modules/worktab';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtPageContent' });
const route = useRoute();
const { containerMinHeight } = useAutoLayoutHeight();
const { pageTransition, containerWidth, refresh } = storeToRefs(useSettingStore());
const { keepAliveExclude } = storeToRefs(useWorktabStore());
const isRefresh = shallowRef(true);
const isOpenRouteInfo = import.meta.env.VITE_OPEN_ROUTE_INFO;
const showTransitionMask = ref(false);
// 标记是否是首次加载（浏览器刷新）
const isFirstLoad = ref(true);
// 检查当前路由是否需要使用无基础布局模式
const isFullPage = computed(() => route.matched.some((r) => r.meta?.isFullPage));
const prevIsFullPage = ref(isFullPage.value);
// 切换动画名称：首次加载、从全屏返回时不使用动画
const actualTransition = computed(() => {
    if (isFirstLoad.value)
        return '';
    if (prevIsFullPage.value && !isFullPage.value)
        return '';
    return pageTransition.value;
});
// 监听全屏状态变化，显示过渡遮罩
watch(isFullPage, (val, oldVal) => {
    if (val !== oldVal) {
        showTransitionMask.value = true;
        // 延迟隐藏遮罩，给足时间让页面完成切换
        setTimeout(() => {
            showTransitionMask.value = false;
        }, 50);
    }
    nextTick(() => {
        prevIsFullPage.value = val;
    });
});
const containerStyle = computed(() => isFullPage.value
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 2500,
        background: 'var(--default-bg-color)'
    }
    : {
        maxWidth: containerWidth.value
    });
const contentStyle = computed(() => ({
    minHeight: containerMinHeight.value
}));
const reload = () => {
    isRefresh.value = false;
    nextTick(() => {
        isRefresh.value = true;
    });
};
watch(refresh, reload, { flush: 'post' });
// 组件挂载后标记首次加载完成
onMounted(() => {
    // 延迟一帧，确保首次渲染完成
    nextTick(() => {
        isFirstLoad.value = false;
    });
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-content") }, ...{ class: (({ 'overflow-auto': __VLS_ctx.isFullPage })) }, ...{ style: ((__VLS_ctx.containerStyle)) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ id: ("app-content-header"), });
    if (!__VLS_ctx.isFullPage) {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtFestivalTextScroll;
        /** @type { [typeof __VLS_components.ArtFestivalTextScroll, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    if (__VLS_ctx.isOpenRouteInfo === 'true') {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("px-2 py-1.5 mb-3 text-sm text-g-500 bg-g-200 border-full-d rounded-md") }, });
        (__VLS_ctx.route.meta);
    }
    if (__VLS_ctx.isRefresh) {
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.RouterView;
        /** @type { [typeof __VLS_components.RouterView, typeof __VLS_components.RouterView, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ style: ((__VLS_ctx.contentStyle)) }, }));
        const __VLS_8 = __VLS_7({ ...{ style: ((__VLS_ctx.contentStyle)) }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_11.slots);
            const [{ Component, route }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.Transition;
            /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.Transition, ] } */
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ name: ((__VLS_ctx.showTransitionMask ? '' : __VLS_ctx.actualTransition)), mode: ("out-in"), appear: (true), }));
            const __VLS_14 = __VLS_13({ name: ((__VLS_ctx.showTransitionMask ? '' : __VLS_ctx.actualTransition)), mode: ("out-in"), appear: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.KeepAlive;
            /** @type { [typeof __VLS_components.KeepAlive, typeof __VLS_components.KeepAlive, ] } */
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ max: ((10)), exclude: ((__VLS_ctx.keepAliveExclude)), }));
            const __VLS_20 = __VLS_19({ max: ((10)), exclude: ((__VLS_ctx.keepAliveExclude)), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
            if (route.meta.keepAlive) {
                const __VLS_24 = ((Component));
                // @ts-ignore
                const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ ...{ class: ("art-page-view") }, key: ((route.path)), }));
                const __VLS_26 = __VLS_25({ ...{ class: ("art-page-view") }, key: ((route.path)), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            }
            __VLS_nonNullable(__VLS_23.slots).default;
            var __VLS_23;
            __VLS_nonNullable(__VLS_17.slots).default;
            var __VLS_17;
            const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.Transition;
            /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.Transition, ] } */
            // @ts-ignore
            const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ name: ((__VLS_ctx.showTransitionMask ? '' : __VLS_ctx.actualTransition)), mode: ("out-in"), appear: (true), }));
            const __VLS_32 = __VLS_31({ name: ((__VLS_ctx.showTransitionMask ? '' : __VLS_ctx.actualTransition)), mode: ("out-in"), appear: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
            if (!route.meta.keepAlive) {
                const __VLS_36 = ((Component));
                // @ts-ignore
                const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ class: ("art-page-view") }, key: ((route.path)), }));
                const __VLS_38 = __VLS_37({ ...{ class: ("art-page-view") }, key: ((route.path)), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            }
            __VLS_nonNullable(__VLS_35.slots).default;
            var __VLS_35;
            __VLS_nonNullable(__VLS_11.slots)['' /* empty slot name completion */];
        }
        var __VLS_11;
    }
    const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.Teleport;
    /** @type { [typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ] } */
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ to: ("body"), }));
    const __VLS_44 = __VLS_43({ to: ("body"), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("fixed top-0 left-0 z-[2000] w-screen h-screen pointer-events-none bg-box") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.showTransitionMask) }, null, null);
    __VLS_nonNullable(__VLS_47.slots).default;
    var __VLS_47;
    __VLS_styleScopedClasses['layout-content'];
    __VLS_styleScopedClasses['overflow-auto'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['py-1.5'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['bg-g-200'];
    __VLS_styleScopedClasses['border-full-d'];
    __VLS_styleScopedClasses['rounded-md'];
    __VLS_styleScopedClasses['art-page-view'];
    __VLS_styleScopedClasses['art-page-view'];
    __VLS_styleScopedClasses['fixed'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['z-[2000]'];
    __VLS_styleScopedClasses['w-screen'];
    __VLS_styleScopedClasses['h-screen'];
    __VLS_styleScopedClasses['pointer-events-none'];
    __VLS_styleScopedClasses['bg-box'];
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
            route: route,
            keepAliveExclude: keepAliveExclude,
            isRefresh: isRefresh,
            isOpenRouteInfo: isOpenRouteInfo,
            showTransitionMask: showTransitionMask,
            isFullPage: isFullPage,
            actualTransition: actualTransition,
            containerStyle: containerStyle,
            contentStyle: contentStyle,
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