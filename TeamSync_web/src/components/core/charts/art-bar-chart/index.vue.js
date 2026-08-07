/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useChartOps, useChartComponent } from '@/hooks/core/useChart';
import { getCssVar } from '@/utils/ui';
import { graphic } from '@/plugins/echarts';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtBarChart' });
const props = withDefaults(defineProps(), {
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    borderRadius: 4,
    // 数据配置
    data: () => [0, 0, 0, 0, 0, 0, 0],
    xAxisData: () => [],
    barWidth: '40%',
    stack: false,
    // 轴线显示配置
    showAxisLabel: true,
    showAxisLine: true,
    showSplitLine: true,
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
});
// 判断是否为多数据
const isMultipleData = computed(() => {
    return (Array.isArray(props.data) &&
        props.data.length > 0 &&
        typeof props.data[0] === 'object' &&
        'name' in props.data[0]);
});
// 获取颜色配置
const getColor = (customColor, index) => {
    if (customColor)
        return customColor;
    if (index !== undefined) {
        return props.colors[index % props.colors.length];
    }
    // 默认渐变色
    return new graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: getCssVar('--el-color-primary-light-4')
        },
        {
            offset: 1,
            color: getCssVar('--el-color-primary')
        }
    ]);
};
// 创建渐变色
const createGradientColor = (color) => {
    return new graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: color
        },
        {
            offset: 1,
            color: color
        }
    ]);
};
// 获取基础样式配置
const getBaseItemStyle = (color) => ({
    borderRadius: props.borderRadius,
    color: typeof color === 'string' ? createGradientColor(color) : color
});
// 创建系列配置
const createSeriesItem = (config) => {
    const animationConfig = getAnimationConfig();
    return {
        name: config.name,
        data: config.data,
        type: 'bar',
        stack: config.stack,
        itemStyle: getBaseItemStyle(config.color),
        barWidth: config.barWidth || props.barWidth,
        ...animationConfig
    };
};
// 使用新的图表组件抽象
const { chartRef, getAxisLineStyle, getAxisLabelStyle, getAxisTickStyle, getSplitLineStyle, getAnimationConfig, getTooltipStyle, getLegendStyle, getGridWithLegend } = useChartComponent({
    props,
    checkEmpty: () => {
        // 检查单数据情况
        if (Array.isArray(props.data) && typeof props.data[0] === 'number') {
            const singleData = props.data;
            return !singleData.length || singleData.every((val) => val === 0);
        }
        // 检查多数据情况
        if (Array.isArray(props.data) && typeof props.data[0] === 'object') {
            const multiData = props.data;
            return (!multiData.length ||
                multiData.every((item) => !item.data?.length || item.data.every((val) => val === 0)));
        }
        return true;
    },
    watchSources: [() => props.data, () => props.xAxisData, () => props.colors],
    generateOptions: () => {
        const options = {
            grid: getGridWithLegend(props.showLegend && isMultipleData.value, props.legendPosition, {
                top: 15,
                right: 0,
                left: 0
            }),
            tooltip: props.showTooltip ? getTooltipStyle() : undefined,
            xAxis: {
                type: 'category',
                data: props.xAxisData,
                axisTick: getAxisTickStyle(),
                axisLine: getAxisLineStyle(props.showAxisLine),
                axisLabel: getAxisLabelStyle(props.showAxisLabel)
            },
            yAxis: {
                type: 'value',
                axisLabel: getAxisLabelStyle(props.showAxisLabel),
                axisLine: getAxisLineStyle(props.showAxisLine),
                splitLine: getSplitLineStyle(props.showSplitLine)
            }
        };
        // 添加图例配置
        if (props.showLegend && isMultipleData.value) {
            options.legend = getLegendStyle(props.legendPosition);
        }
        // 生成系列数据
        if (isMultipleData.value) {
            const multiData = props.data;
            options.series = multiData.map((item, index) => {
                const computedColor = getColor(props.colors[index], index);
                return createSeriesItem({
                    name: item.name,
                    data: item.data,
                    color: computedColor,
                    barWidth: item.barWidth,
                    stack: props.stack ? item.stack || 'total' : undefined
                });
            });
        }
        else {
            // 单数据情况
            const singleData = props.data;
            const computedColor = getColor();
            options.series = [
                createSeriesItem({
                    data: singleData,
                    color: computedColor
                })
            ];
        }
        return options;
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    borderRadius: 4,
    // 数据配置
    data: () => [0, 0, 0, 0, 0, 0, 0],
    xAxisData: () => [],
    barWidth: '40%',
    stack: false,
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("chartRef"), ...{ style: (({ height: props.height })) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (props.loading) }, null, null);
    // @ts-ignore navigation for `const chartRef = ref()`
    __VLS_ctx.chartRef;
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