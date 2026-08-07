const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
const handleOpen = () => {
    emit('open');
};
const handleDrawerClose = () => {
    emit('close');
};
const handleClose = () => {
    visible.value = false;
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("setting-drawer") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDrawer;
    /** @type { [typeof __VLS_components.ElDrawer, typeof __VLS_components.ElDrawer, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onOpen': {} }, ...{ 'onClose': {} }, size: ("300px"), modelValue: ((__VLS_ctx.visible)), lockScroll: ((true)), withHeader: ((false)), beforeClose: ((__VLS_ctx.handleClose)), destroyOnClose: ((false)), modalClass: ("setting-modal"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onOpen': {} }, ...{ 'onClose': {} }, size: ("300px"), modelValue: ((__VLS_ctx.visible)), lockScroll: ((true)), withHeader: ((false)), beforeClose: ((__VLS_ctx.handleClose)), destroyOnClose: ((false)), modalClass: ("setting-modal"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onOpen: (__VLS_ctx.handleOpen)
    };
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleDrawerClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("drawer-con") }, });
    var __VLS_9 = {};
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['setting-drawer'];
    __VLS_styleScopedClasses['drawer-con'];
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
            visible: visible,
            handleOpen: handleOpen,
            handleDrawerClose: handleDrawerClose,
            handleClose: handleClose,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=SettingDrawer.vue.js.map