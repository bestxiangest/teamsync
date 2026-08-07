/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useChartOps, useChartComponent } from '@/hooks/core/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtRadarChart' });
const props = withDefaults(defineProps(), {
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    // 数据配置
    indicator: () => [],
    data: () => [],
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
});
// 使用新的图表组件抽象
const { chartRef, isDark, getAnimationConfig, getTooltipStyle } = useChartComponent({
    props,
    checkEmpty: () => {
        return !props.data?.length || props.data.every((item) => item.value.every((val) => val === 0));
    },
    watchSources: [() => props.data, () => props.indicator, () => props.colors],
    generateOptions: () => {
        return {
            tooltip: props.showTooltip ? getTooltipStyle('item') : undefined,
            radar: {
                indicator: props.indicator,
                center: ['50%', '50%'],
                radius: '70%',
                axisName: {
                    color: isDark.value ? '#ccc' : '#666',
                    fontSize: 12
                },
                splitLine: {
                    lineStyle: {
                        color: isDark.value ? '#444' : '#e6e6e6'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: isDark.value ? '#444' : '#e6e6e6'
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: isDark.value
                            ? ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
                            : ['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.05)']
                    }
                }
            },
            series: [
                {
                    type: 'radar',
                    data: props.data.map((item, index) => ({
                        name: item.name,
                        value: item.value,
                        symbolSize: 4,
                        lineStyle: {
                            width: 2,
                            color: props.colors[index % props.colors.length]
                        },
                        itemStyle: {
                            color: props.colors[index % props.colors.length]
                        },
                        areaStyle: {
                            color: props.colors[index % props.colors.length],
                            opacity: 0.1
                        },
                        emphasis: {
                            areaStyle: {
                                opacity: 0.25
                            },
                            lineStyle: {
                                width: 3
                            }
                        }
                    })),
                    ...getAnimationConfig(200, 1800)
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
    indicator: () => [],
    data: () => [],
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