/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { fetchResetUserPwd } from '@/api/system-manage';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});
// 表单实例
const formRef = ref();
// 提交loading
const submitLoading = ref(false);
// 表单数据
const formData = reactive({
    newPassword: '',
    confirmPassword: ''
});
// 确认密码校验
const validateConfirmPassword = (_rule, value, callback) => {
    if (value !== formData.newPassword) {
        callback(new Error('两次输入的密码不一致'));
    }
    else {
        callback();
    }
};
// 表单验证规则
const rules = {
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
};
/**
 * 重置表单
 */
const resetForm = () => {
    formData.newPassword = '';
    formData.confirmPassword = '';
};
/**
 * 监听对话框状态变化
 */
watch(() => props.visible, (visible) => {
    if (visible) {
        resetForm();
        nextTick(() => {
            formRef.value?.clearValidate();
        });
    }
});
/**
 * 提交表单
 */
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        submitLoading.value = true;
        await fetchResetUserPwd({
            id: props.userId,
            newPassword: formData.newPassword
        });
        ElMessage.success('密码重置成功');
        dialogVisible.value = false;
        emit('submit');
    }
    catch (error) {
        console.error('重置密码失败:', error);
        if (error?.message) {
            ElMessage.error(error.message);
        }
    }
    finally {
        submitLoading.value = false;
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
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.dialogVisible)), title: ("重置密码"), width: ("400px"), alignCenter: (true), closeOnClickModal: ((false)), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.dialogVisible)), title: ("重置密码"), width: ("400px"), alignCenter: (true), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-gray-500") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-medium") }, });
    (__VLS_ctx.username);
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }));
    const __VLS_9 = __VLS_8({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_13 = {};
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ label: ("新密码"), prop: ("newPassword"), }));
    const __VLS_16 = __VLS_15({ label: ("新密码"), prop: ("newPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ modelValue: ((__VLS_ctx.formData.newPassword)), type: ("password"), placeholder: ("请输入新密码（至少6位）"), showPassword: (true), }));
    const __VLS_22 = __VLS_21({ modelValue: ((__VLS_ctx.formData.newPassword)), type: ("password"), placeholder: ("请输入新密码（至少6位）"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("确认密码"), prop: ("confirmPassword"), }));
    const __VLS_28 = __VLS_27({ label: ("确认密码"), prop: ("confirmPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ modelValue: ((__VLS_ctx.formData.confirmPassword)), type: ("password"), placeholder: ("请再次输入新密码"), showPassword: (true), }));
    const __VLS_34 = __VLS_33({ modelValue: ((__VLS_ctx.formData.confirmPassword)), type: ("password"), placeholder: ("请再次输入新密码"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ ...{ 'onClick': {} }, }));
        const __VLS_40 = __VLS_39({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_44;
        const __VLS_45 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_41;
        let __VLS_42;
        __VLS_nonNullable(__VLS_43.slots).default;
        var __VLS_43;
        const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_48 = __VLS_47({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        let __VLS_52;
        const __VLS_53 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_49;
        let __VLS_50;
        __VLS_nonNullable(__VLS_51.slots).default;
        var __VLS_51;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['dialog-footer'];
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
            dialogVisible: dialogVisible,
            formRef: formRef,
            submitLoading: submitLoading,
            formData: formData,
            rules: rules,
            handleSubmit: handleSubmit,
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
//# sourceMappingURL=reset-pwd-dialog.vue.js.map