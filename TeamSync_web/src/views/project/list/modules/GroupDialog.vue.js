import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { createGroup } from '@/api/project';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'success']);
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const formRef = ref();
const loading = ref(false);
const formData = reactive({
    name: ''
});
const formRules = {
    name: [
        { required: true, message: '请输入分组名称', trigger: 'blur' },
        { min: 1, max: 100, message: '分组名称长度在 1 到 100 个字符', trigger: 'blur' }
    ]
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (!valid)
            return;
        loading.value = true;
        try {
            await createGroup(formData.name);
            ElMessage.success('分组创建成功');
            visible.value = false;
            formData.name = '';
            emit('success');
        }
        catch (error) {
            console.error(error);
        }
        finally {
            loading.value = false;
        }
    });
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.visible)), title: ("新建分组"), width: ("400px"), closeOnClickModal: ((false)), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.visible)), title: ("新建分组"), width: ("400px"), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.formRules)), labelWidth: ("80px"), }));
    const __VLS_9 = __VLS_8({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.formRules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_13 = {};
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ label: ("分组名称"), prop: ("name"), }));
    const __VLS_16 = __VLS_15({ label: ("分组名称"), prop: ("name"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formData.name)), placeholder: ("请输入分组名称"), maxlength: ("100"), showWordLimit: (true), }));
    const __VLS_22 = __VLS_21({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formData.name)), placeholder: ("请输入分组名称"), maxlength: ("100"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_26;
    const __VLS_27 = {
        onKeyup: (__VLS_ctx.handleSubmit)
    };
    let __VLS_23;
    let __VLS_24;
    var __VLS_25;
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ...{ 'onClick': {} }, }));
        const __VLS_30 = __VLS_29({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_31;
        let __VLS_32;
        __VLS_nonNullable(__VLS_33.slots).default;
        var __VLS_33;
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
        const __VLS_38 = __VLS_37({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_42;
        const __VLS_43 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_39;
        let __VLS_40;
        __VLS_nonNullable(__VLS_41.slots).default;
        var __VLS_41;
    }
    var __VLS_5;
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_13,
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
            visible: visible,
            formRef: formRef,
            loading: loading,
            formData: formData,
            formRules: formRules,
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
//# sourceMappingURL=GroupDialog.vue.js.map