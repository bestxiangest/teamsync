/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { getCssVar } from '@/utils/ui';
import { useChartOps, useChartComponent } from '@/hooks/core/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtScatterChart' });
const props = withDefaults(defineProps(), {
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    // 数据配置
    data: () => [{ value: [0, 0] }, { value: [0, 0] }],
    symbolSize: 14,
    // 轴线显示配置
    showAxisLabel: true,
    showAxisLine: true,
    showSplitLine: true,
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
});
// 使用新的图表组件抽象
const { chartRef, isDark, getAxisLineStyle, getAxisLabelStyle, getAxisTickStyle, getSplitLineStyle, getAnimationConfig, getTooltipStyle } = useChartComponent({
    props,
    checkEmpty: () => {
        return !props.data?.length || props.data.every((item) => item.value.every((val) => val === 0));
    },
    watchSources: [() => props.data, () => props.colors, () => props.symbolSize],
    generateOptions: () => {
        const computedColor = props.colors[0] || getCssVar('--el-color-primary');
        return {
            grid: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
                containLabel: true
            },
            tooltip: props.showTooltip
                ? getTooltipStyle('item', {
                    formatter: (params) => {
                        const [x, y] = params.value;
                        return `X: ${x}<br/>Y: ${y}`;
                    }
                })
                : undefined,
            xAxis: {
                type: 'value',
                axisLabel: getAxisLabelStyle(props.showAxisLabel),
                axisLine: getAxisLineStyle(props.showAxisLine),
                axisTick: getAxisTickStyle(),
                splitLine: getSplitLineStyle(props.showSplitLine)
            },
            yAxis: {
                type: 'value',
                axisLabel: getAxisLabelStyle(props.showAxisLabel),
                axisLine: getAxisLineStyle(props.showAxisLine),
                axisTick: getAxisTickStyle(),
                splitLine: getSplitLineStyle(props.showSplitLine)
            },
            series: [
                {
                    type: 'scatter',
                    data: props.data,
                    symbolSize: props.symbolSize,
                    itemStyle: {
                        color: computedColor,
                        shadowBlur: 6,
                        shadowColor: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        shadowOffsetY: 2
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 12,
                            shadowColor: isDark.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                        },
                        scale: true
                    },
                    ...getAnimationConfig()
                }
            ]
        };
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    // 数据配置
    data: () => [{ value: [0, 0] }, { value: [0, 0] }],
    symbolSize: 14,
    // 轴线显示配置
    showAxisLabel: true,
    showAxisLine: true,
    showSplitLine: true,
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("chartRef"), ...{ class: ("relative w-full") }, ...{ style: (({ height: props.height })) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (props.loading) }, null, null);
    // @ts-ignore navigation for `const chartRef = ref()`
    __VLS_ctx.chartRef;
    __VLS_styleScopedClasses['relative'];
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