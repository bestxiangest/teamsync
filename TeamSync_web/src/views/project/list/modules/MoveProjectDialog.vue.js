/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { moveProject } from '@/api/project';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'success']);
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const loading = ref(false);
const targetGroupId = ref(0);
watch(() => props.modelValue, (val) => {
    if (val && props.project) {
        targetGroupId.value = props.project.groupId || 0;
    }
});
const handleSubmit = async () => {
    if (!props.project)
        return;
    loading.value = true;
    try {
        await moveProject(props.project.id, targetGroupId.value);
        ElMessage.success('移动成功');
        visible.value = false;
        emit('success');
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    emits: {},
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.visible)), title: ("移动项目"), width: ("400px"), closeOnClickModal: ((false)), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.visible)), title: ("移动项目"), width: ("400px"), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ labelPosition: ("top"), }));
    const __VLS_9 = __VLS_8({ labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ label: ("选择目标分组"), }));
    const __VLS_15 = __VLS_14({ label: ("选择目标分组"), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ modelValue: ((__VLS_ctx.targetGroupId)), placeholder: ("请选择分组"), ...{ style: ({}) }, }));
    const __VLS_21 = __VLS_20({ modelValue: ((__VLS_ctx.targetGroupId)), placeholder: ("请选择分组"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, ] } */
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ label: ("根目录 (不放入任何分组)"), value: ((0)), }));
    const __VLS_27 = __VLS_26({ label: ("根目录 (不放入任何分组)"), value: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.groups))) {
        const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, ] } */
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ key: ((group.id)), label: ((group.name)), value: ((group.id)), }));
        const __VLS_33 = __VLS_32({ key: ((group.id)), label: ((group.name)), value: ((group.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    }
    __VLS_nonNullable(__VLS_24.slots).default;
    var __VLS_24;
    __VLS_nonNullable(__VLS_18.slots).default;
    var __VLS_18;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ ...{ 'onClick': {} }, }));
        const __VLS_39 = __VLS_38({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        let __VLS_43;
        const __VLS_44 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_40;
        let __VLS_41;
        __VLS_nonNullable(__VLS_42.slots).default;
        var __VLS_42;
        const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
        const __VLS_47 = __VLS_46({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        let __VLS_51;
        const __VLS_52 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_48;
        let __VLS_49;
        __VLS_nonNullable(__VLS_50.slots).default;
        var __VLS_50;
    }
    var __VLS_5;
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
            loading: loading,
            targetGroupId: targetGroupId,
            handleSubmit: handleSubmit,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MoveProjectDialog.vue.js.map