import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { createProject, updateProject } from '@/api/project';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'success']);
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const formRef = ref();
const loading = ref(false);
const isEdit = computed(() => !!props.project);
const formData = reactive({
    name: '',
    description: '',
    groupId: 0
});
const formRules = {
    name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' },
        { min: 1, max: 100, message: '项目名称长度在 1 到 100 个字符', trigger: 'blur' }
    ]
};
watch(() => props.modelValue, (val) => {
    if (val) {
        if (props.project) {
            formData.name = props.project.name;
            formData.description = props.project.description || '';
            formData.groupId = props.project.groupId || 0;
        }
        else {
            formData.name = '';
            formData.description = '';
            formData.groupId = props.groupId || 0;
        }
    }
});
const handleClose = () => {
    formRef.value?.resetFields();
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (!valid)
            return;
        loading.value = true;
        try {
            if (isEdit.value && props.project) {
                await updateProject(props.project.id, {
                    name: formData.name.trim(),
                    description: formData.description?.trim() || ''
                });
                ElMessage.success('项目更新成功');
            }
            else {
                await createProject({
                    name: formData.name.trim(),
                    description: formData.description?.trim() || '',
                    groupId: formData.groupId
                });
                ElMessage.success('项目创建成功');
            }
            visible.value = false;
            emit('success');
        }
        catch (error) {
            console.error('操作失败:', error);
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((__VLS_ctx.isEdit ? '编辑项目' : '新建项目')), width: ("500px"), closeOnClickModal: ((false)), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((__VLS_ctx.isEdit ? '编辑项目' : '新建项目')), width: ("500px"), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.formRules)), labelWidth: ("100px"), labelPosition: ("top"), }));
    const __VLS_11 = __VLS_10({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.formRules)), labelWidth: ("100px"), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_15 = {};
    const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ label: ("项目名称"), prop: ("name"), }));
    const __VLS_18 = __VLS_17({ label: ("项目名称"), prop: ("name"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ modelValue: ((__VLS_ctx.formData.name)), placeholder: ("请输入项目名称"), maxlength: ("100"), showWordLimit: (true), }));
    const __VLS_24 = __VLS_23({ modelValue: ((__VLS_ctx.formData.name)), placeholder: ("请输入项目名称"), maxlength: ("100"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ label: ("项目描述"), prop: ("description"), }));
    const __VLS_30 = __VLS_29({ label: ("项目描述"), prop: ("description"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ modelValue: ((__VLS_ctx.formData.description)), type: ("textarea"), placeholder: ("请输入项目描述（选填）"), rows: ((4)), maxlength: ("500"), showWordLimit: (true), }));
    const __VLS_36 = __VLS_35({ modelValue: ((__VLS_ctx.formData.description)), type: ("textarea"), placeholder: ("请输入项目描述（选填）"), rows: ((4)), maxlength: ("500"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ ...{ 'onClick': {} }, }));
        const __VLS_42 = __VLS_41({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_43;
        let __VLS_44;
        __VLS_nonNullable(__VLS_45.slots).default;
        var __VLS_45;
        const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
        const __VLS_50 = __VLS_49({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_54;
        const __VLS_55 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_51;
        let __VLS_52;
        (__VLS_ctx.isEdit ? '保存' : '创建');
        __VLS_nonNullable(__VLS_53.slots).default;
        var __VLS_53;
    }
    var __VLS_5;
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_15,
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
            isEdit: isEdit,
            formData: formData,
            formRules: formRules,
            handleClose: handleClose,
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
//# sourceMappingURL=ProjectDialog.vue.js.map