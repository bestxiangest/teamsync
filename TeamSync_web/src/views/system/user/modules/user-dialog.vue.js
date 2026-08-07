/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { fetchAddUser, fetchUpdateUser } from '@/api/system-manage';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});
// 是否编辑模式
const isEdit = computed(() => props.type === 'edit');
// 对话框标题
const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'));
// 表单实例
const formRef = ref();
// 提交loading
const submitLoading = ref(false);
// 表单数据
const formData = reactive({
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    userPhone: '',
    userEmail: '',
    userGender: 0,
    status: '1',
    isAdmin: false
});
// 表单验证规则
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    userPhone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    userEmail: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ]
};
/**
 * 性别文字转数字
 */
const genderTextToNumber = (genderText) => {
    if (!genderText)
        return 0;
    if (genderText === '男')
        return 1;
    if (genderText === '女')
        return 2;
    return 0;
};
/**
 * 初始化表单数据
 */
const initFormData = () => {
    if (isEdit.value && props.userData) {
        const row = props.userData;
        Object.assign(formData, {
            id: row.id,
            username: row.username || '',
            password: '',
            nickname: row.nickname || '',
            userPhone: row.userPhone || '',
            userEmail: row.userEmail || '',
            userGender: genderTextToNumber(row.userGender),
            status: row.status || '1',
            isAdmin: row.isAdmin === true
        });
    }
    else {
        // 新增模式，重置表单
        Object.assign(formData, {
            id: undefined,
            username: '',
            password: '',
            nickname: '',
            userPhone: '',
            userEmail: '',
            userGender: 0,
            status: '1',
            isAdmin: false
        });
    }
};
/**
 * 监听对话框状态变化
 */
watch(() => [props.visible, props.type, props.userData], ([visible]) => {
    if (visible) {
        initFormData();
        nextTick(() => {
            formRef.value?.clearValidate();
        });
    }
}, { immediate: true });
/**
 * 提交表单
 */
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        submitLoading.value = true;
        if (isEdit.value) {
            // 编辑用户
            await fetchUpdateUser({
                id: formData.id,
                username: formData.username,
                nickname: formData.nickname,
                userPhone: formData.userPhone,
                userEmail: formData.userEmail,
                userGender: formData.userGender,
                status: formData.status,
                isAdmin: formData.isAdmin
            });
            ElMessage.success('更新成功');
        }
        else {
            // 新增用户
            await fetchAddUser({
                username: formData.username,
                password: formData.password,
                nickname: formData.nickname,
                userPhone: formData.userPhone,
                userEmail: formData.userEmail,
                userGender: formData.userGender,
                status: formData.status,
                isAdmin: formData.isAdmin
            });
            ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        emit('submit');
    }
    catch (error) {
        console.error('提交失败:', error);
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogTitle)), width: ("500px"), alignCenter: (true), closeOnClickModal: ((false)), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogTitle)), width: ("500px"), alignCenter: (true), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }));
    const __VLS_9 = __VLS_8({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_13 = {};
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ label: ("用户名"), prop: ("username"), }));
    const __VLS_16 = __VLS_15({ label: ("用户名"), prop: ("username"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ modelValue: ((__VLS_ctx.formData.username)), placeholder: ("请输入用户名"), disabled: ((__VLS_ctx.isEdit)), }));
    const __VLS_22 = __VLS_21({ modelValue: ((__VLS_ctx.formData.username)), placeholder: ("请输入用户名"), disabled: ((__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    if (!__VLS_ctx.isEdit) {
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("密码"), prop: ("password"), }));
        const __VLS_28 = __VLS_27({ label: ("密码"), prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ modelValue: ((__VLS_ctx.formData.password)), type: ("password"), placeholder: ("请输入密码（至少6位）"), showPassword: (true), }));
        const __VLS_34 = __VLS_33({ modelValue: ((__VLS_ctx.formData.password)), type: ("password"), placeholder: ("请输入密码（至少6位）"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_nonNullable(__VLS_31.slots).default;
        var __VLS_31;
    }
    const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ label: ("昵称"), prop: ("nickname"), }));
    const __VLS_40 = __VLS_39({ label: ("昵称"), prop: ("nickname"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ modelValue: ((__VLS_ctx.formData.nickname)), placeholder: ("请输入昵称"), }));
    const __VLS_46 = __VLS_45({ modelValue: ((__VLS_ctx.formData.nickname)), placeholder: ("请输入昵称"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_nonNullable(__VLS_43.slots).default;
    var __VLS_43;
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ label: ("手机号"), prop: ("userPhone"), }));
    const __VLS_52 = __VLS_51({ label: ("手机号"), prop: ("userPhone"), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ modelValue: ((__VLS_ctx.formData.userPhone)), placeholder: ("请输入手机号"), maxlength: ("11"), }));
    const __VLS_58 = __VLS_57({ modelValue: ((__VLS_ctx.formData.userPhone)), placeholder: ("请输入手机号"), maxlength: ("11"), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ label: ("邮箱"), prop: ("userEmail"), }));
    const __VLS_64 = __VLS_63({ label: ("邮箱"), prop: ("userEmail"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ modelValue: ((__VLS_ctx.formData.userEmail)), placeholder: ("请输入邮箱"), }));
    const __VLS_70 = __VLS_69({ modelValue: ((__VLS_ctx.formData.userEmail)), placeholder: ("请输入邮箱"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_nonNullable(__VLS_67.slots).default;
    var __VLS_67;
    const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ label: ("性别"), prop: ("userGender"), }));
    const __VLS_76 = __VLS_75({ label: ("性别"), prop: ("userGender"), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
    /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.ElRadioGroup, ] } */
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ modelValue: ((__VLS_ctx.formData.userGender)), }));
    const __VLS_82 = __VLS_81({ modelValue: ((__VLS_ctx.formData.userGender)), }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
    /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.ElRadio, ] } */
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ value: ((0)), }));
    const __VLS_88 = __VLS_87({ value: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_nonNullable(__VLS_91.slots).default;
    var __VLS_91;
    const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
    /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.ElRadio, ] } */
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ value: ((1)), }));
    const __VLS_94 = __VLS_93({ value: ((1)), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_nonNullable(__VLS_97.slots).default;
    var __VLS_97;
    const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
    /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.ElRadio, ] } */
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ value: ((2)), }));
    const __VLS_100 = __VLS_99({ value: ((2)), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    __VLS_nonNullable(__VLS_103.slots).default;
    var __VLS_103;
    __VLS_nonNullable(__VLS_85.slots).default;
    var __VLS_85;
    __VLS_nonNullable(__VLS_79.slots).default;
    var __VLS_79;
    const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ label: ("状态"), prop: ("status"), }));
    const __VLS_106 = __VLS_105({ label: ("状态"), prop: ("status"), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    const __VLS_110 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({ modelValue: ((__VLS_ctx.formData.status)), placeholder: ("请选择状态"), }));
    const __VLS_112 = __VLS_111({ modelValue: ((__VLS_ctx.formData.status)), placeholder: ("请选择状态"), }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    const __VLS_116 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, ] } */
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({ label: ("在线"), value: ("1"), }));
    const __VLS_118 = __VLS_117({ label: ("在线"), value: ("1"), }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    const __VLS_122 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, ] } */
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ label: ("离线"), value: ("2"), }));
    const __VLS_124 = __VLS_123({ label: ("离线"), value: ("2"), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    const __VLS_128 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, ] } */
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({ label: ("异常"), value: ("3"), }));
    const __VLS_130 = __VLS_129({ label: ("异常"), value: ("3"), }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const __VLS_134 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, ] } */
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({ label: ("注销"), value: ("4"), }));
    const __VLS_136 = __VLS_135({ label: ("注销"), value: ("4"), }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    __VLS_nonNullable(__VLS_115.slots).default;
    var __VLS_115;
    __VLS_nonNullable(__VLS_109.slots).default;
    var __VLS_109;
    const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ label: ("管理员"), prop: ("isAdmin"), }));
    const __VLS_142 = __VLS_141({ label: ("管理员"), prop: ("isAdmin"), }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, ] } */
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ modelValue: ((__VLS_ctx.formData.isAdmin)), activeText: ("是"), inactiveText: ("否"), }));
    const __VLS_148 = __VLS_147({ modelValue: ((__VLS_ctx.formData.isAdmin)), activeText: ("是"), inactiveText: ("否"), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    __VLS_nonNullable(__VLS_145.slots).default;
    var __VLS_145;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ ...{ 'onClick': {} }, }));
        const __VLS_154 = __VLS_153({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        let __VLS_158;
        const __VLS_159 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_155;
        let __VLS_156;
        __VLS_nonNullable(__VLS_157.slots).default;
        var __VLS_157;
        const __VLS_160 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_162 = __VLS_161({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_161));
        let __VLS_166;
        const __VLS_167 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_163;
        let __VLS_164;
        (__VLS_ctx.isEdit ? '保存' : '创建');
        __VLS_nonNullable(__VLS_165.slots).default;
        var __VLS_165;
    }
    var __VLS_5;
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
            isEdit: isEdit,
            dialogTitle: dialogTitle,
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
//# sourceMappingURL=user-dialog.vue.js.map