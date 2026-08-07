/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useI18n } from 'vue-i18n';
import { fetchRegister } from '@/api/auth';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Register' });
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;
const REDIRECT_DELAY = 1000;
const { t, locale } = useI18n();
const router = useRouter();
const formRef = ref();
const loading = ref(false);
const formKey = ref(0);
// 监听语言切换，重置表单
watch(locale, () => {
    formKey.value++;
});
const formData = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    agreement: false
});
/**
 * 验证密码
 * 当密码输入后，如果确认密码已填写，则触发确认密码的验证
 */
const validatePassword = (_rule, value, callback) => {
    if (!value) {
        callback(new Error(t('register.placeholder.password')));
        return;
    }
    if (formData.confirmPassword) {
        formRef.value?.validateField('confirmPassword');
    }
    callback();
};
/**
 * 验证确认密码
 * 检查确认密码是否与密码一致
 */
const validateConfirmPassword = (_rule, value, callback) => {
    if (!value) {
        callback(new Error(t('register.rule.confirmPasswordRequired')));
        return;
    }
    if (value !== formData.password) {
        callback(new Error(t('register.rule.passwordMismatch')));
        return;
    }
    callback();
};
/**
 * 验证用户协议
 * 确保用户已勾选同意协议
 */
const validateAgreement = (_rule, value, callback) => {
    if (!value) {
        callback(new Error(t('register.rule.agreementRequired')));
        return;
    }
    callback();
};
const rules = computed(() => ({
    username: [
        { required: true, message: t('register.placeholder.username'), trigger: 'blur' },
        {
            min: USERNAME_MIN_LENGTH,
            max: USERNAME_MAX_LENGTH,
            message: t('register.rule.usernameLength'),
            trigger: 'blur'
        }
    ],
    password: [
        { required: true, validator: validatePassword, trigger: 'blur' },
        { min: PASSWORD_MIN_LENGTH, message: t('register.rule.passwordLength'), trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
    agreement: [{ validator: validateAgreement, trigger: 'change' }]
}));
/**
 * 注册用户
 * 验证表单后提交注册请求
 */
const register = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        loading.value = true;
        // 调用注册 API
        await fetchRegister({
            username: formData.username,
            password: formData.password,
            nickname: formData.username // 默认昵称为用户名
        });
        ElMessage.success('注册成功，请登录');
        toLogin();
    }
    catch (error) {
        console.error('注册失败:', error);
        // 错误消息已在 HTTP 拦截器中处理
    }
    finally {
        loading.value = false;
    }
};
/**
 * 跳转到登录页面
 */
const toLogin = () => {
    setTimeout(() => {
        router.push({ name: 'Login' });
    }, REDIRECT_DELAY);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex w-full h-screen") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.LoginLeftView;
    /** @type { [typeof __VLS_components.LoginLeftView, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative flex-1") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.AuthTopBar;
    /** @type { [typeof __VLS_components.AuthTopBar, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("auth-right-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("form") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("title") }, });
    (__VLS_ctx.$t('register.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("sub-title") }, });
    (__VLS_ctx.$t('register.subTitle'));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ class: ("mt-7.5") }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelPosition: ("top"), key: ((__VLS_ctx.formKey)), }));
    const __VLS_14 = __VLS_13({ ...{ class: ("mt-7.5") }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelPosition: ("top"), key: ((__VLS_ctx.formKey)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_18 = {};
    const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ prop: ("username"), }));
    const __VLS_21 = __VLS_20({ prop: ("username"), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ ...{ class: ("custom-height") }, modelValue: ((__VLS_ctx.formData.username)), placeholder: ((__VLS_ctx.$t('register.placeholder.username'))), }));
    const __VLS_27 = __VLS_26({ ...{ class: ("custom-height") }, modelValue: ((__VLS_ctx.formData.username)), placeholder: ((__VLS_ctx.$t('register.placeholder.username'))), }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_nonNullable(__VLS_24.slots).default;
    var __VLS_24;
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ prop: ("password"), }));
    const __VLS_33 = __VLS_32({ prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ ...{ class: ("custom-height") }, modelValue: ((__VLS_ctx.formData.password)), placeholder: ((__VLS_ctx.$t('register.placeholder.password'))), type: ("password"), autocomplete: ("off"), showPassword: (true), }));
    const __VLS_39 = __VLS_38({ ...{ class: ("custom-height") }, modelValue: ((__VLS_ctx.formData.password)), placeholder: ((__VLS_ctx.$t('register.placeholder.password'))), type: ("password"), autocomplete: ("off"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_nonNullable(__VLS_36.slots).default;
    var __VLS_36;
    const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ prop: ("confirmPassword"), }));
    const __VLS_45 = __VLS_44({ prop: ("confirmPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ ...{ 'onKeyup': {} }, ...{ class: ("custom-height") }, modelValue: ((__VLS_ctx.formData.confirmPassword)), placeholder: ((__VLS_ctx.$t('register.placeholder.confirmPassword'))), type: ("password"), autocomplete: ("off"), showPassword: (true), }));
    const __VLS_51 = __VLS_50({ ...{ 'onKeyup': {} }, ...{ class: ("custom-height") }, modelValue: ((__VLS_ctx.formData.confirmPassword)), placeholder: ((__VLS_ctx.$t('register.placeholder.confirmPassword'))), type: ("password"), autocomplete: ("off"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    let __VLS_55;
    const __VLS_56 = {
        onKeyup: (__VLS_ctx.register)
    };
    let __VLS_52;
    let __VLS_53;
    var __VLS_54;
    __VLS_nonNullable(__VLS_48.slots).default;
    var __VLS_48;
    const __VLS_57 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ prop: ("agreement"), }));
    const __VLS_59 = __VLS_58({ prop: ("agreement"), }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const __VLS_63 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
    /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({ modelValue: ((__VLS_ctx.formData.agreement)), }));
    const __VLS_65 = __VLS_64({ modelValue: ((__VLS_ctx.formData.agreement)), }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    (__VLS_ctx.$t('register.agreeText'));
    const __VLS_69 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({ ...{ style: ({}) }, to: ("/privacy-policy"), }));
    const __VLS_71 = __VLS_70({ ...{ style: ({}) }, to: ("/privacy-policy"), }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    (__VLS_ctx.$t('register.privacyPolicy'));
    __VLS_nonNullable(__VLS_74.slots).default;
    var __VLS_74;
    __VLS_nonNullable(__VLS_68.slots).default;
    var __VLS_68;
    __VLS_nonNullable(__VLS_62.slots).default;
    var __VLS_62;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_75 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    const __VLS_77 = __VLS_76({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_81;
    const __VLS_82 = {
        onClick: (__VLS_ctx.register)
    };
    let __VLS_78;
    let __VLS_79;
    (__VLS_ctx.$t('register.submitBtnText'));
    __VLS_nonNullable(__VLS_80.slots).default;
    var __VLS_80;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-5 text-sm text-g-600") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('register.hasAccount'));
    const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ ...{ class: ("text-theme") }, to: (({ name: 'Login' })), }));
    const __VLS_85 = __VLS_84({ ...{ class: ("text-theme") }, to: (({ name: 'Login' })), }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    (__VLS_ctx.$t('register.toLogin'));
    __VLS_nonNullable(__VLS_88.slots).default;
    var __VLS_88;
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-screen'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['auth-right-wrap'];
    __VLS_styleScopedClasses['form'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['sub-title'];
    __VLS_styleScopedClasses['mt-7.5'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['text-theme'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_18,
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
            formRef: formRef,
            loading: loading,
            formKey: formKey,
            formData: formData,
            rules: rules,
            register: register,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map