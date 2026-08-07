/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
/**
 * 卡片统计数据列表
 * 展示总访问次数、在线访客数、点击量和新用户等核心数据指标
 */
const dataList = reactive([
    {
        des: '总访问次数',
        icon: 'ri:pie-chart-line',
        startVal: 0,
        duration: 1000,
        num: 9120,
        change: '+20%'
    },
    {
        des: '在线访客数',
        icon: 'ri:group-line',
        startVal: 0,
        duration: 1000,
        num: 182,
        change: '+10%'
    },
    {
        des: '点击量',
        icon: 'ri:fire-line',
        startVal: 0,
        duration: 1000,
        num: 9520,
        change: '-12%'
    },
    {
        des: '新用户',
        icon: 'ri:progress-2-line',
        startVal: 0,
        duration: 1000,
        num: 156,
        change: '+30%'
    }
]); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ gutter: ((20)), ...{ class: ("flex") }, }));
    const __VLS_2 = __VLS_1({ gutter: ((20)), ...{ class: ("flex") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.dataList))) {
        const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ key: ((index)), sm: ((12)), md: ((6)), lg: ((6)), }));
        const __VLS_9 = __VLS_8({ key: ((index)), sm: ((12)), md: ((6)), lg: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-g-700 text-sm") }, });
        (item.des);
        const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ArtCountTo;
        /** @type { [typeof __VLS_components.ArtCountTo, ] } */
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ ...{ class: ("text-[26px] font-medium mt-2") }, target: ((item.num)), duration: ((1300)), }));
        const __VLS_15 = __VLS_14({ ...{ class: ("text-[26px] font-medium mt-2") }, target: ((item.num)), duration: ((1300)), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c mt-1") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs text-g-600") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-1 text-xs font-semibold") }, ...{ class: (([item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success'])) }, });
        (item.change);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10") }, });
        const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ icon: ((item.icon)), ...{ class: ("text-xl text-theme") }, }));
        const __VLS_21 = __VLS_20({ icon: ((item.icon)), ...{ class: ("text-xl text-theme") }, }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        __VLS_nonNullable(__VLS_12.slots).default;
        var __VLS_12;
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['h-35'];
    __VLS_styleScopedClasses['px-5'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-[26px]'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['ml-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-semibold'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['bottom-0'];
    __VLS_styleScopedClasses['right-5'];
    __VLS_styleScopedClasses['m-auto'];
    __VLS_styleScopedClasses['size-12.5'];
    __VLS_styleScopedClasses['rounded-xl'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['bg-theme/10'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['text-theme'];
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
            dataList: dataList,
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
//# sourceMappingURL=card-list.vue.js.map