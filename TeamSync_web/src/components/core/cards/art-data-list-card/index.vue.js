/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtDataListCard' });
const ITEM_HEIGHT = 66;
const DEFAULT_MAX_COUNT = 5;
const props = withDefaults(defineProps(), {
    maxCount: DEFAULT_MAX_COUNT
});
const maxHeight = computed(() => `${ITEM_HEIGHT * props.maxCount}px`);
const emit = defineEmits();
const handleMore = () => emit('more'); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    maxCount: DEFAULT_MAX_COUNT
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pb-3.5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-lg font-medium") }, });
    (__VLS_ctx.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-sm text-g-600") }, });
    (__VLS_ctx.subtitle);
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ style: (({ height: __VLS_ctx.maxHeight })) }, }));
    const __VLS_2 = __VLS_1({ ...{ style: (({ height: __VLS_ctx.maxHeight })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), ...{ class: ("flex-c py-3") }, });
        if (item.icon) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc mr-3 size-10 rounded-lg") }, ...{ class: ((item.class)) }, });
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ((item.icon)), ...{ class: ("text-xl") }, }));
            const __VLS_8 = __VLS_7({ icon: ((item.icon)), ...{ class: ("text-xl") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-1") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-1 text-sm") }, });
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-g-500") }, });
        (item.status);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("ml-3 text-xs text-g-500") }, });
        (item.time);
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    if (__VLS_ctx.showMoreButton) {
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onClick': {} }, ...{ class: ("mt-[25px] w-full text-center") }, }));
        const __VLS_14 = __VLS_13({ ...{ 'onClick': {} }, ...{ class: ("mt-[25px] w-full text-center") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_18;
        const __VLS_19 = {
            onClick: (__VLS_ctx.handleMore)
        };
        let __VLS_15;
        let __VLS_16;
        __VLS_nonNullable(__VLS_17.slots).default;
        var __VLS_17;
    }
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['pb-3.5'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['py-3'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['size-10'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['mb-1'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['ml-3'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['mt-[25px]'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['text-center'];
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
            maxHeight: maxHeight,
            handleMore: handleMore,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map