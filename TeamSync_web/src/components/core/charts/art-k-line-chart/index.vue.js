/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useChartOps, useChartComponent } from '@/hooks/core/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtKLineChart' });
const props = withDefaults(defineProps(), {
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    // 数据配置
    data: () => [],
    showDataZoom: false,
    dataZoomStart: 0,
    dataZoomEnd: 100
});
// 获取实际使用的颜色
const getActualColors = () => {
    const defaultUpColor = '#4C87F3';
    const defaultDownColor = '#8BD8FC';
    return {
        upColor: props.colors?.[0] || defaultUpColor,
        downColor: props.colors?.[1] || defaultDownColor
    };
};
// 使用新的图表组件抽象
const { chartRef, getAxisLineStyle, getAxisLabelStyle, getAxisTickStyle, getSplitLineStyle, getAnimationConfig, getTooltipStyle } = useChartComponent({
    props,
    checkEmpty: () => {
        return (!props.data?.length ||
            props.data.every((item) => item.open === 0 && item.close === 0 && item.high === 0 && item.low === 0));
    },
    watchSources: [
        () => props.data,
        () => props.colors,
        () => props.showDataZoom,
        () => props.dataZoomStart,
        () => props.dataZoomEnd
    ],
    generateOptions: () => {
        const { upColor, downColor } = getActualColors();
        return {
            grid: {
                top: 20,
                right: 20,
                bottom: props.showDataZoom ? 80 : 20,
                left: 20,
                containLabel: true
            },
            tooltip: getTooltipStyle('axis', {
                axisPointer: {
                    type: 'cross'
                },
                formatter: (params) => {
                    const param = params[0];
                    const data = param.data;
                    return `
              <div style="padding: 5px;">
                <div><strong>时间：</strong>${param.name}</div>
                <div><strong>开盘：</strong>${data[0]}</div>
                <div><strong>收盘：</strong>${data[1]}</div>
                <div><strong>最低：</strong>${data[2]}</div>
                <div><strong>最高：</strong>${data[3]}</div>
              </div>
            `;
                }
            }),
            xAxis: {
                type: 'category',
                data: props.data.map((item) => item.time),
                axisTick: getAxisTickStyle(),
                axisLine: getAxisLineStyle(true),
                axisLabel: getAxisLabelStyle(true)
            },
            yAxis: {
                type: 'value',
                scale: true,
                axisLabel: getAxisLabelStyle(true),
                axisLine: getAxisLineStyle(true),
                splitLine: getSplitLineStyle(true)
            },
            series: [
                {
                    type: 'candlestick',
                    data: props.data.map((item) => [item.open, item.close, item.low, item.high]),
                    itemStyle: {
                        color: upColor,
                        color0: downColor,
                        borderColor: upColor,
                        borderColor0: downColor,
                        borderWidth: 1
                    },
                    emphasis: {
                        itemStyle: {
                            borderWidth: 2,
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)'
                        }
                    },
                    ...getAnimationConfig()
                }
            ],
            dataZoom: props.showDataZoom
                ? [
                    {
                        type: 'inside',
                        start: props.dataZoomStart,
                        end: props.dataZoomEnd
                    },
                    {
                        show: true,
                        type: 'slider',
                        top: '90%',
                        start: props.dataZoomStart,
                        end: props.dataZoomEnd
                    }
                ]
                : undefined
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
    data: () => [],
    showDataZoom: false,
    dataZoomStart: 0,
    dataZoomEnd: 100
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