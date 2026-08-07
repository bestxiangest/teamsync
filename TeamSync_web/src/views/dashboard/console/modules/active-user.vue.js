/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
// 最近9个月
const xAxisLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'];
// 每月活跃用户数
const chartData = [160, 100, 150, 80, 190, 100, 175, 120, 160];
/**
 * 用户统计数据列表
 * 包含总用户量、总访问量、日访问量和周同比等关键指标
 */
const list = [
    { name: '总用户量', num: '32k' },
    { name: '总访问量', num: '128k' },
    { name: '日访问量', num: '1.2k' },
    { name: '周同比', num: '+5%' }
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card h-105 p-4 box-border mb-5 max-sm:mb-4") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtBarChart;
    /** @type { [typeof __VLS_components.ArtBarChart, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("box-border p-2") }, barWidth: ("50%"), height: ("13.7rem"), showAxisLine: ((false)), data: ((__VLS_ctx.chartData)), xAxisData: ((__VLS_ctx.xAxisLabels)), }));
    const __VLS_2 = __VLS_1({ ...{ class: ("box-border p-2") }, barWidth: ("50%"), height: ("13.7rem"), showAxisLine: ((false)), data: ((__VLS_ctx.chartData)), xAxisData: ((__VLS_ctx.xAxisLabels)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("ml-1") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("mt-5 text-lg font-medium") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-success font-medium") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-b mt-2") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-1") }, key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-2xl text-g-900") }, });
        (item.num);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-xs text-g-500") }, });
        (item.name);
    }
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['h-105'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['p-2'];
    __VLS_styleScopedClasses['ml-1'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-success'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['text-g-900'];
    __VLS_styleScopedClasses['text-xs'];
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
            xAxisLabels: xAxisLabels,
            chartData: chartData,
            list: list,
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
//# sourceMappingURL=active-user.vue.js.map