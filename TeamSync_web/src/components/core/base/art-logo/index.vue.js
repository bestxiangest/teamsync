/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtLogo' });
const props = withDefaults(defineProps(), {
    size: 36
});
const logoStyle = computed(() => ({ width: `${props.size}px` })); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    size: 36
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ style: ((__VLS_ctx.logoStyle)) }, src: ("@imgs/common/logo.webp"), alt: ("logo"), ...{ class: ("w-full h-full") }, });
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
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
            logoStyle: logoStyle,
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