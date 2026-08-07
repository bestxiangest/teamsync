/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const __VLS_emit = defineEmits(); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-end") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('close');
            } }, ...{ class: ("flex-cc c-p size-7.5 !transition-all duration-200 rounded hover:bg-g-300/80") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ("ri:close-fill"), ...{ class: ("block text-xl text-g-600") }, }));
    const __VLS_2 = __VLS_1({ icon: ("ri:close-fill"), ...{ class: ("block text-xl text-g-600") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['size-7.5'];
    __VLS_styleScopedClasses['!transition-all'];
    __VLS_styleScopedClasses['duration-200'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['hover:bg-g-300/80'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['text-g-600'];
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
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=SettingHeader.vue.js.map