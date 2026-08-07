/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
/**
 * 全年访问量数据
 * 记录每月的访问量统计
 */
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
/**
   * 全年访问量数据
   * 记录每月的访问量统计
   */
const data = [50, 25, 40, 20, 70, 35, 65, 30, 35, 20, 40, 44];
/**
 * X 轴月份标签
 */
const xAxisData = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月'
]; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card h-105 p-5 mb-5 max-sm:mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-success") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtLineChart;
    /** @type { [typeof __VLS_components.ArtLineChart, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ height: ("calc(100% - 56px)"), data: ((__VLS_ctx.data)), xAxisData: ((__VLS_ctx.xAxisData)), showAreaColor: ((true)), showAxisLine: ((false)), }));
    const __VLS_2 = __VLS_1({ height: ("calc(100% - 56px)"), data: ((__VLS_ctx.data)), xAxisData: ((__VLS_ctx.xAxisData)), showAreaColor: ((true)), showAxisLine: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['h-105'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['art-card-header'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['text-success'];
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
            data: data,
            xAxisData: xAxisData,
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
//# sourceMappingURL=sales-overview.vue.js.map