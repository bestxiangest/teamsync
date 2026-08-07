/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { graphic } from '@/plugins/echarts';
import { getCssVar, hexToRgba } from '@/utils/ui';
import { useChartOps, useChartComponent } from '@/hooks/core/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtLineChartCard' });
const props = withDefaults(defineProps(), {
    height: 11
});
// 使用新的图表组件抽象
const { chartRef } = useChartComponent({
    props: {
        height: `${props.height}rem`,
        loading: false,
        isEmpty: !props.chartData?.length || props.chartData.every((val) => val === 0)
    },
    checkEmpty: () => !props.chartData?.length || props.chartData.every((val) => val === 0),
    watchSources: [() => props.chartData, () => props.color, () => props.showAreaColor],
    generateOptions: () => {
        const computedColor = props.color || useChartOps().themeColor;
        return {
            grid: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            xAxis: {
                type: 'category',
                show: false,
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                show: false
            },
            series: [
                {
                    data: props.chartData,
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 3,
                        color: computedColor
                    },
                    areaStyle: props.showAreaColor
                        ? {
                            color: new graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: props.color
                                        ? hexToRgba(props.color, 0.2).rgba
                                        : hexToRgba(getCssVar('--el-color-primary'), 0.2).rgba
                                },
                                {
                                    offset: 1,
                                    color: props.color
                                        ? hexToRgba(props.color, 0.01).rgba
                                        : hexToRgba(getCssVar('--el-color-primary'), 0.01).rgba
                                }
                            ])
                        }
                        : undefined
                }
            ]
        };
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: 11
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card relative overflow-hidden") }, ...{ style: (({ height: `${__VLS_ctx.height}rem` })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-2.5 flex-b items-start p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-2xl font-medium leading-none") }, });
    (__VLS_ctx.value);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1 text-sm text-g-500") }, });
    (__VLS_ctx.label);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-sm font-medium") }, ...{ class: (([
                __VLS_ctx.percentage > 0 ? 'text-success' : 'text-danger',
                __VLS_ctx.isMiniChart ? 'absolute bottom-5' : ''
            ])) }, });
    (__VLS_ctx.percentage > 0 ? '+' : '');
    (__VLS_ctx.percentage);
    if (__VLS_ctx.date) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("absolute bottom-5 right-5 text-xs text-g-500") }, });
        (__VLS_ctx.date);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("chartRef"), ...{ class: ("absolute bottom-0 left-0 right-0 box-border w-full") }, ...{ class: ((__VLS_ctx.isMiniChart ? '!absolute !top-5 !right-5 !bottom-auto !left-auto !h-15 !w-4/10' : '')) }, ...{ style: (({ height: __VLS_ctx.isMiniChart ? '60px' : `calc(${__VLS_ctx.height}rem - 5rem)` })) }, });
    // @ts-ignore navigation for `const chartRef = ref()`
    __VLS_ctx.chartRef;
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['mb-2.5'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['items-start'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['leading-none'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['bottom-5'];
    __VLS_styleScopedClasses['right-5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['bottom-0'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['right-0'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['w-full'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "chartRef": __VLS_nativeElements['div'],
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
            chartRef: chartRef,
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