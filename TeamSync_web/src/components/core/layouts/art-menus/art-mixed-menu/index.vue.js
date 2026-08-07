/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, onMounted, nextTick } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { useThrottleFn } from '@vueuse/core';
import { formatMenuTitle } from '@/utils/router';
import { handleMenuJump } from '@/utils/navigation';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtMixedMenu' });
const route = useRoute();
const props = withDefaults(defineProps(), {
    list: () => []
});
const scrollbarRef = ref();
const showLeftArrow = ref(false);
const showRightArrow = ref(false);
/** 滚动配置 */
const SCROLL_CONFIG = {
    /** 点击按钮时的滚动距离 */
    BUTTON_SCROLL_DISTANCE: 200,
    /** 鼠标滚轮快速滚动时的步长 */
    WHEEL_FAST_STEP: 35,
    /** 鼠标滚轮慢速滚动时的步长 */
    WHEEL_SLOW_STEP: 30,
    /** 区分快慢滚动的阈值 */
    WHEEL_FAST_THRESHOLD: 100
};
/**
 * 获取当前激活路径
 * 使用computed缓存，避免重复计算
 */
const currentActivePath = computed(() => {
    return String(route.meta.activePath || route.path);
});
/**
 * 判断菜单项是否为激活状态
 * 递归检查子菜单中是否包含当前路径
 * @param item 菜单项数据
 * @returns 是否为激活状态
 */
const isMenuItemActive = (item) => {
    const activePath = currentActivePath.value;
    // 如果有子菜单，递归检查子菜单
    if (item.children?.length) {
        return item.children.some((child) => {
            if (child.children?.length) {
                return isMenuItemActive(child);
            }
            return child.path === activePath;
        });
    }
    // 直接比较路径
    return item.path === activePath;
};
/**
 * 预处理菜单列表
 * 缓存每个菜单项的激活状态和格式化标题
 */
const processedMenuList = computed(() => {
    return props.list.map((item) => ({
        ...item,
        isActive: isMenuItemActive(item),
        formattedTitle: formatMenuTitle(item.meta.title)
    }));
});
/**
 * 处理滚动事件的核心逻辑
 * 根据滚动位置显示/隐藏滚动按钮
 */
const handleScrollCore = () => {
    if (!scrollbarRef.value?.wrapRef)
        return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollbarRef.value.wrapRef;
    // 判断是否显示左侧滚动按钮
    showLeftArrow.value = scrollLeft > 0;
    // 判断是否显示右侧滚动按钮
    showRightArrow.value = scrollLeft + clientWidth < scrollWidth;
};
/**
 * 节流后的滚动事件处理函数
 * 调整节流间隔为16ms，约等于60fps
 */
const handleScroll = useThrottleFn(handleScrollCore, 16);
/**
 * 滚动菜单容器
 * @param direction 滚动方向，left 或 right
 */
const scroll = (direction) => {
    if (!scrollbarRef.value?.wrapRef)
        return;
    const currentScroll = scrollbarRef.value.wrapRef.scrollLeft;
    const targetScroll = direction === 'left'
        ? currentScroll - SCROLL_CONFIG.BUTTON_SCROLL_DISTANCE
        : currentScroll + SCROLL_CONFIG.BUTTON_SCROLL_DISTANCE;
    // 平滑滚动到目标位置
    scrollbarRef.value.wrapRef.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
};
/**
 * 处理鼠标滚轮事件
 * 优化滚轮响应性能
 * @param event 滚轮事件
 */
const handleWheel = (event) => {
    // 立即阻止默认滚动行为和事件冒泡，避免页面滚动
    event.preventDefault();
    event.stopPropagation();
    // 直接处理滚动，提升响应性
    if (!scrollbarRef.value?.wrapRef)
        return;
    const { wrapRef } = scrollbarRef.value;
    const { scrollLeft, scrollWidth, clientWidth } = wrapRef;
    // 使用更小的滚动步长，让滚动更平滑
    const scrollStep = Math.abs(event.deltaY) > SCROLL_CONFIG.WHEEL_FAST_THRESHOLD
        ? SCROLL_CONFIG.WHEEL_FAST_STEP
        : SCROLL_CONFIG.WHEEL_SLOW_STEP;
    const scrollDelta = event.deltaY > 0 ? scrollStep : -scrollStep;
    const targetScroll = Math.max(0, Math.min(scrollLeft + scrollDelta, scrollWidth - clientWidth));
    // 立即滚动，无动画
    wrapRef.scrollLeft = targetScroll;
    // 更新滚动按钮状态
    handleScrollCore();
};
/**
 * 初始化滚动状态
 */
const initScrollState = () => {
    nextTick(() => {
        handleScrollCore();
    });
};
onMounted(initScrollState); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    list: () => []
});
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
    __VLS_styleScopedClasses['scrollbar-wrapper'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative box-border flex-c w-full overflow-hidden") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.scroll('left');
            } }, ...{ class: ("button-arrow") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.showLeftArrow) }, null, null);
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
    /** @type { [typeof __VLS_components.ArrowLeft, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onScroll': {} }, ...{ 'onWheel': {} }, ref: ("scrollbarRef"), wrapClass: ("scrollbar-wrapper"), horizontal: ((true)), }));
    const __VLS_14 = __VLS_13({ ...{ 'onScroll': {} }, ...{ 'onWheel': {} }, ref: ("scrollbarRef"), wrapClass: ("scrollbar-wrapper"), horizontal: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    // @ts-ignore navigation for `const scrollbarRef = ref()`
    __VLS_ctx.scrollbarRef;
    var __VLS_18 = {};
    let __VLS_19;
    const __VLS_20 = {
        onScroll: (__VLS_ctx.handleScroll)
    };
    const __VLS_21 = {
        onWheel: (__VLS_ctx.handleWheel)
    };
    let __VLS_15;
    let __VLS_16;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-border flex-c flex-shrink-0 flex-nowrap h-15 whitespace-nowrap") }, });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.processedMenuList))) {
        (item.meta.title);
        if (!item.meta.isHide) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((!item.meta.isHide)))
                            return;
                        __VLS_ctx.handleMenuJump(item, true);
                    } }, ...{ class: ("menu-item relative flex-shrink-0 h-10 px-3 text-sm flex-c c-p hover:text-theme") }, ...{ class: (({
                        'menu-item-active text-theme': item.isActive
                    })) }, });
            const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ icon: ((item.meta.icon)), ...{ class: ("text-lg text-g-700 dark:text-g-800 mr-1") }, ...{ class: ((item.isActive && '!text-theme')) }, }));
            const __VLS_24 = __VLS_23({ icon: ((item.meta.icon)), ...{ class: ("text-lg text-g-700 dark:text-g-800 mr-1") }, ...{ class: ((item.isActive && '!text-theme')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_23));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-md text-g-700 dark:text-g-800") }, ...{ class: ((item.isActive && '!text-theme')) }, });
            (item.formattedTitle);
            if (item.meta.showBadge) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("art-badge art-badge-mixed") }, });
            }
        }
    }
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.scroll('right');
            } }, ...{ class: ("button-arrow right-2") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.showRightArrow) }, null, null);
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ArrowRight;
    /** @type { [typeof __VLS_components.ArrowRight, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({}));
    const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['button-arrow'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['flex-shrink-0'];
    __VLS_styleScopedClasses['flex-nowrap'];
    __VLS_styleScopedClasses['h-15'];
    __VLS_styleScopedClasses['whitespace-nowrap'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-shrink-0'];
    __VLS_styleScopedClasses['h-10'];
    __VLS_styleScopedClasses['px-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['hover:text-theme'];
    __VLS_styleScopedClasses['menu-item-active'];
    __VLS_styleScopedClasses['text-theme'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['dark:text-g-800'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['text-md'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['dark:text-g-800'];
    __VLS_styleScopedClasses['art-badge'];
    __VLS_styleScopedClasses['art-badge-mixed'];
    __VLS_styleScopedClasses['button-arrow'];
    __VLS_styleScopedClasses['right-2'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "scrollbarRef": __VLS_18,
    };
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
            ArrowLeft: ArrowLeft,
            ArrowRight: ArrowRight,
            handleMenuJump: handleMenuJump,
            scrollbarRef: scrollbarRef,
            showLeftArrow: showLeftArrow,
            showRightArrow: showRightArrow,
            processedMenuList: processedMenuList,
            handleScroll: handleScroll,
            scroll: scroll,
            handleWheel: handleWheel,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map