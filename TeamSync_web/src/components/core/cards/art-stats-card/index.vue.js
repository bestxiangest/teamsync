/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtStatsCard' });
const __VLS_props = withDefaults(defineProps(), {
    iconSize: 30,
    iconBgRadius: 50,
    decimals: 0,
    separator: ','
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    iconSize: 30,
    iconBgRadius: 50,
    decimals: 0,
    separator: ','
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card h-32 flex-c px-5 transition-transform duration-200 hover:-translate-y-0.5") }, ...{ class: ((__VLS_ctx.boxStyle)) }, });
    if (__VLS_ctx.icon) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mr-4 size-11 flex-cc rounded-lg text-xl text-white") }, ...{ class: ((__VLS_ctx.iconStyle)) }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ((__VLS_ctx.icon)), }));
        const __VLS_2 = __VLS_1({ icon: ((__VLS_ctx.icon)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-1") }, });
    if (__VLS_ctx.title) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("m-0 text-lg font-medium") }, ...{ style: (({ color: __VLS_ctx.textColor })) }, });
        (__VLS_ctx.title);
    }
    if (__VLS_ctx.count !== undefined) {
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtCountTo;
        /** @type { [typeof __VLS_components.ArtCountTo, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ class: ("m-0 text-2xl font-medium") }, target: ((__VLS_ctx.count)), duration: ((2000)), decimals: ((__VLS_ctx.decimals)), separator: ((__VLS_ctx.separator)), }));
        const __VLS_8 = __VLS_7({ ...{ class: ("m-0 text-2xl font-medium") }, target: ((__VLS_ctx.count)), duration: ((2000)), decimals: ((__VLS_ctx.decimals)), separator: ((__VLS_ctx.separator)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    }
    if (__VLS_ctx.description) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1 text-sm text-g-500 opacity-90") }, ...{ style: (({ color: __VLS_ctx.textColor })) }, });
        (__VLS_ctx.description);
    }
    if (__VLS_ctx.showArrow) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ icon: ("ri:arrow-right-s-line"), ...{ class: ("text-xl text-g-500") }, }));
        const __VLS_14 = __VLS_13({ icon: ("ri:arrow-right-s-line"), ...{ class: ("text-xl text-g-500") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['h-32'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['px-5'];
    __VLS_styleScopedClasses['transition-transform'];
    __VLS_styleScopedClasses['duration-200'];
    __VLS_styleScopedClasses['hover:-translate-y-0.5'];
    __VLS_styleScopedClasses['mr-4'];
    __VLS_styleScopedClasses['size-11'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['text-white'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['opacity-90'];
    __VLS_styleScopedClasses['text-xl'];
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
        return {};
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