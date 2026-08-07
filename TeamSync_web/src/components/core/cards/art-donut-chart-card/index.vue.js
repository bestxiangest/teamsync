/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useChartOps, useChartComponent } from '@/hooks/core/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtDonutChartCard' });
const props = withDefaults(defineProps(), {
    height: 9,
    radius: () => ['70%', '90%'],
    data: () => [0, 0]
});
const formatNumber = (num) => {
    return num.toLocaleString();
};
// 使用新的图表组件抽象
const { chartRef } = useChartComponent({
    props: {
        height: `${props.height}rem`,
        loading: false,
        isEmpty: props.data.every((val) => val === 0)
    },
    checkEmpty: () => props.data.every((val) => val === 0),
    watchSources: [
        () => props.data,
        () => props.color,
        () => props.radius,
        () => props.currentValue,
        () => props.previousValue
    ],
    generateOptions: () => {
        const computedColor = props.color || useChartOps().themeColor;
        return {
            series: [
                {
                    type: 'pie',
                    radius: props.radius,
                    avoidLabelOverlap: false,
                    label: {
                        show: false
                    },
                    data: [
                        {
                            value: props.data[0],
                            name: props.currentValue,
                            itemStyle: { color: computedColor }
                        },
                        {
                            value: props.data[1],
                            name: props.previousValue,
                            itemStyle: { color: '#e6e8f7' }
                        }
                    ]
                }
            ]
        };
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: 9,
    radius: () => ['70%', '90%'],
    data: () => [0, 0]
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card overflow-hidden") }, ...{ style: (({ height: `${__VLS_ctx.height}rem` })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex box-border h-full p-5 pr-2") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex w-full items-start gap-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-b h-full flex-1 flex-col") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("m-0 text-xl font-medium leading-tight text-g-900") }, });
    (__VLS_ctx.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("m-0 mt-2.5 text-xl font-medium leading-tight text-g-900") }, });
    (__VLS_ctx.formatNumber(__VLS_ctx.value));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-1.5 text-xs font-medium") }, ...{ class: ((__VLS_ctx.percentage > 0 ? 'text-success' : 'text-danger')) }, });
    (__VLS_ctx.percentage > 0 ? '+' : '');
    (__VLS_ctx.percentage);
    if (__VLS_ctx.percentageLabel) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.percentageLabel);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2 flex gap-4 text-xs text-g-600") }, });
    if (__VLS_ctx.currentValue) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("size-2 bg-theme/100 rounded mr-2") }, });
        (__VLS_ctx.currentValue);
    }
    if (__VLS_ctx.previousValue) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("size-2 bg-g-400 rounded mr-2") }, });
        (__VLS_ctx.previousValue);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c h-full max-w-40 flex-1") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("chartRef"), ...{ class: ("h-30 w-full") }, });
    // @ts-ignore navigation for `const chartRef = ref()`
    __VLS_ctx.chartRef;
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['pr-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['items-start'];
    __VLS_styleScopedClasses['gap-5'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['leading-tight'];
    __VLS_styleScopedClasses['text-g-900'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['leading-tight'];
    __VLS_styleScopedClasses['text-g-900'];
    __VLS_styleScopedClasses['mt-1.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['gap-4'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['size-2'];
    __VLS_styleScopedClasses['bg-theme/100'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['size-2'];
    __VLS_styleScopedClasses['bg-g-400'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['max-w-40'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['h-30'];
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
            formatNumber: formatNumber,
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