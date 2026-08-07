/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useChartOps, useChartComponent } from '@/hooks/core/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtRingChart' });
const props = withDefaults(defineProps(), {
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    // 数据配置
    data: () => [],
    radius: () => ['50%', '80%'],
    borderRadius: 10,
    centerText: '',
    showLabel: false,
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'right'
});
// 使用新的图表组件抽象
const { chartRef, isDark, getAnimationConfig, getTooltipStyle, getLegendStyle } = useChartComponent({
    props,
    checkEmpty: () => {
        return !props.data?.length || props.data.every((item) => item.value === 0);
    },
    watchSources: [() => props.data, () => props.centerText],
    generateOptions: () => {
        // 根据图例位置计算环形图中心位置
        const getCenterPosition = () => {
            if (!props.showLegend)
                return ['50%', '50%'];
            switch (props.legendPosition) {
                case 'left':
                    return ['60%', '50%'];
                case 'right':
                    return ['40%', '50%'];
                case 'top':
                    return ['50%', '60%'];
                case 'bottom':
                    return ['50%', '40%'];
                default:
                    return ['50%', '50%'];
            }
        };
        const option = {
            tooltip: props.showTooltip
                ? getTooltipStyle('item', {
                    formatter: '{b}: {c} ({d}%)'
                })
                : undefined,
            legend: props.showLegend ? getLegendStyle(props.legendPosition) : undefined,
            series: [
                {
                    name: '数据占比',
                    type: 'pie',
                    radius: props.radius,
                    center: getCenterPosition(),
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: props.borderRadius,
                        borderColor: isDark.value ? '#2c2c2c' : '#fff',
                        borderWidth: 0
                    },
                    label: {
                        show: props.showLabel,
                        formatter: '{b}\n{d}%',
                        position: 'outside',
                        color: isDark.value ? '#ccc' : '#999',
                        fontSize: 12
                    },
                    emphasis: {
                        label: {
                            show: false,
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: props.showLabel,
                        length: 15,
                        length2: 25,
                        smooth: true
                    },
                    data: props.data,
                    color: props.colors,
                    ...getAnimationConfig(),
                    animationType: 'expansion'
                }
            ]
        };
        // 添加中心文字
        if (props.centerText) {
            const centerPos = getCenterPosition();
            option.title = {
                text: props.centerText,
                left: centerPos[0],
                top: centerPos[1],
                textAlign: 'center',
                textVerticalAlign: 'middle',
                textStyle: {
                    fontSize: 18,
                    fontWeight: 500,
                    color: isDark.value ? '#999' : '#ADB0BC'
                }
            };
        }
        return option;
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
    radius: () => ['50%', '80%'],
    borderRadius: 10,
    centerText: '',
    showLabel: false,
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'right'
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