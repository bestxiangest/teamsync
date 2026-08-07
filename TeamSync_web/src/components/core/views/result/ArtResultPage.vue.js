/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtResultPage' });
const __VLS_props = withDefaults(defineProps(), {
    type: 'success',
    title: '',
    message: '',
    iconCode: ''
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    type: 'success',
    title: '',
    message: '',
    iconCode: ''
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-content box-border !px-20 py-3.5 text-center max-md:!px-5") }, ...{ class: ((__VLS_ctx.type)) }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("icon size-22 p-2 mt-16 block rounded-full !text-white") }, icon: ((__VLS_ctx.iconCode)), ...{ class: ((__VLS_ctx.type === 'success' ? 'bg-[#19BE6B]' : 'bg-[#ED4014]')) }, }));
    const __VLS_2 = __VLS_1({ ...{ class: ("icon size-22 p-2 mt-16 block rounded-full !text-white") }, icon: ((__VLS_ctx.iconCode)), ...{ class: ((__VLS_ctx.type === 'success' ? 'bg-[#19BE6B]' : 'bg-[#ED4014]')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("title mt-8 text-3xl font-medium !text-g-900 max-md:mt-2.5 max-md:text-2xl") }, });
    (__VLS_ctx.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("msg mt-5 text-base text-g-600") }, });
    (__VLS_ctx.message);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("res mt-7.5 rounded bg-g-200/80 dark:bg-g-300/40 px-7.5 py-5.5 text-left max-md:px-7.5 max-md:py-2.5 [&_p]:flex [&_p]:items-center [&_p]:py-2 [&_p]:text-sm [&_p]:text-[#808695] [&_p_i]:mr-1.5") }, });
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn-group mt-12.5") }, });
    var __VLS_7 = {};
    __VLS_styleScopedClasses['page-content'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['!px-20'];
    __VLS_styleScopedClasses['py-3.5'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['max-md:!px-5'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['size-22'];
    __VLS_styleScopedClasses['p-2'];
    __VLS_styleScopedClasses['mt-16'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['!text-white'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['mt-8'];
    __VLS_styleScopedClasses['text-3xl'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['!text-g-900'];
    __VLS_styleScopedClasses['max-md:mt-2.5'];
    __VLS_styleScopedClasses['max-md:text-2xl'];
    __VLS_styleScopedClasses['msg'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['res'];
    __VLS_styleScopedClasses['mt-7.5'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['bg-g-200/80'];
    __VLS_styleScopedClasses['dark:bg-g-300/40'];
    __VLS_styleScopedClasses['px-7.5'];
    __VLS_styleScopedClasses['py-5.5'];
    __VLS_styleScopedClasses['text-left'];
    __VLS_styleScopedClasses['max-md:px-7.5'];
    __VLS_styleScopedClasses['max-md:py-2.5'];
    __VLS_styleScopedClasses['[&_p]:flex'];
    __VLS_styleScopedClasses['[&_p]:items-center'];
    __VLS_styleScopedClasses['[&_p]:py-2'];
    __VLS_styleScopedClasses['[&_p]:text-sm'];
    __VLS_styleScopedClasses['[&_p]:text-[#808695]'];
    __VLS_styleScopedClasses['[&_p_i]:mr-1.5'];
    __VLS_styleScopedClasses['btn-group'];
    __VLS_styleScopedClasses['mt-12.5'];
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
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ArtResultPage.vue.js.map