/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
// 标准化选项，处理computed和普通数组
const normalizedOptions = computed(() => {
    if (!props.config.options)
        return [];
    try {
        // 如果是 ComputedRef，则返回其值
        if (typeof props.config.options === 'object' && 'value' in props.config.options) {
            return props.config.options.value || [];
        }
        // 如果是普通数组，直接返回
        return Array.isArray(props.config.options) ? props.config.options : [];
    }
    catch (error) {
        console.warn('Error processing options for config:', props.config.key, error);
        return [];
    }
});
const handleChange = (value) => {
    try {
        emit('change', value);
    }
    catch (error) {
        console.error('Error handling change for config:', props.config.key, error);
    }
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cb mb-4 last:mb-2") }, ...{ class: (({ 'mobile-hide': __VLS_ctx.config.mobileHide })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-sm") }, });
    (__VLS_ctx.config.label);
    if (__VLS_ctx.config.type === 'switch') {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.modelValue)), }));
        const __VLS_2 = __VLS_1({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.modelValue)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_6;
        const __VLS_7 = {
            onChange: (__VLS_ctx.handleChange)
        };
        let __VLS_3;
        let __VLS_4;
        var __VLS_5;
    }
    else if (__VLS_ctx.config.type === 'input-number') {
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.modelValue)), min: ((__VLS_ctx.config.min)), max: ((__VLS_ctx.config.max)), step: ((__VLS_ctx.config.step)), ...{ style: ((__VLS_ctx.config.style)) }, controlsPosition: ((__VLS_ctx.config.controlsPosition)), }));
        const __VLS_10 = __VLS_9({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.modelValue)), min: ((__VLS_ctx.config.min)), max: ((__VLS_ctx.config.max)), step: ((__VLS_ctx.config.step)), ...{ style: ((__VLS_ctx.config.style)) }, controlsPosition: ((__VLS_ctx.config.controlsPosition)), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_14;
        const __VLS_15 = {
            onChange: (__VLS_ctx.handleChange)
        };
        let __VLS_11;
        let __VLS_12;
        var __VLS_13;
    }
    else if (__VLS_ctx.config.type === 'select') {
        const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.modelValue)), ...{ style: ((__VLS_ctx.config.style)) }, }));
        const __VLS_18 = __VLS_17({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.modelValue)), ...{ style: ((__VLS_ctx.config.style)) }, }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_22;
        const __VLS_23 = {
            onChange: (__VLS_ctx.handleChange)
        };
        let __VLS_19;
        let __VLS_20;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.normalizedOptions))) {
            const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ key: ((option.value)), label: ((option.label)), value: ((option.value)), }));
            const __VLS_26 = __VLS_25({ key: ((option.value)), label: ((option.label)), value: ((option.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        }
        __VLS_nonNullable(__VLS_21.slots).default;
        var __VLS_21;
    }
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['last:mb-2'];
    __VLS_styleScopedClasses['mobile-hide'];
    __VLS_styleScopedClasses['text-sm'];
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
            normalizedOptions: normalizedOptions,
            handleChange: handleChange,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=SettingItem.vue.js.map