/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { useUserStore } from '@/store/modules/user';
import { useI18n } from 'vue-i18n';
import { HttpError } from '@/utils/http/error';
import { fetchLogin } from '@/api/auth';
import { ElNotification } from 'element-plus';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Login' });
const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);
const { t, locale } = useI18n();
const formKey = ref(0);
// 监听语言切换，重置表单
watch(locale, () => {
    formKey.value++;
});
const dragVerify = ref();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isPassing = ref(false);
const isClickPass = ref(false);
const systemName = AppConfig.systemInfo.name;
const formRef = ref();
const formData = reactive({
    username: '',
    password: '',
    rememberPassword: true
});
const rules = computed(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }]
}));
const loading = ref(false);
// 登录
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        // 表单验证
        const valid = await formRef.value.validate();
        if (!valid)
            return;
        // 拖拽验证
        if (!isPassing.value) {
            isClickPass.value = true;
            return;
        }
        loading.value = true;
        // 登录请求
        const { username, password } = formData;
        const { token, refreshToken } = await fetchLogin({
            userName: username,
            password
        });
        // 验证token
        if (!token) {
            throw new Error('Login failed - no token received');
        }
        // 存储 token 和登录状态
        userStore.setToken(token, refreshToken);
        userStore.setLoginStatus(true);
        // 登录成功处理
        showLoginSuccessNotice();
        // 获取 redirect 参数，排除无效的重定向目标（根路径、登录页本身），否则跳转到工作台
        const redirect = route.query.redirect;
        const isValidRedirect = redirect && redirect !== '/' && !redirect.startsWith('/auth/login');
        const targetPath = isValidRedirect ? redirect : '/dashboard/console';
        router.push(targetPath);
    }
    catch (error) {
        // 处理 HttpError
        if (error instanceof HttpError) {
            // console.log(error.code)
        }
        else {
            // 处理非 HttpError
            // ElMessage.error('登录失败，请稍后重试')
            console.error('[Login] Unexpected error:', error);
        }
    }
    finally {
        loading.value = false;
        resetDragVerify();
    }
};
// 重置拖拽验证
const resetDragVerify = () => {
    dragVerify.value.reset();
};
// 登录成功提示
const showLoginSuccessNotice = () => {
    setTimeout(() => {
        ElNotification({
            title: t('login.success.title'),
            type: 'success',
            duration: 2500,
            zIndex: 10000,
            message: `${t('login.success.message')}, ${systemName}!`
        });
    }, 1000);
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
    (__VLS_ctx.$t('login.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("sub-title") }, });
    (__VLS_ctx.$t('login.subTitle'));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onKeyup': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), key: ((__VLS_ctx.formKey)), ...{ style: ({}) }, }));
    const __VLS_14 = __VLS_13({ ...{ 'onKeyup': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), key: ((__VLS_ctx.formKey)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_18 = {};
    let __VLS_19;
    const __VLS_20 = {
        onKeyup: (__VLS_ctx.handleSubmit)
    };
    let __VLS_15;
    let __VLS_16;
    const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ prop: ("username"), }));
    const __VLS_23 = __VLS_22({ prop: ("username"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.username'))), modelValue: ((__VLS_ctx.formData.username)), }));
    const __VLS_29 = __VLS_28({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.username'))), modelValue: ((__VLS_ctx.formData.username)), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_nonNullable(__VLS_26.slots).default;
    var __VLS_26;
    const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ prop: ("password"), }));
    const __VLS_35 = __VLS_34({ prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.password'))), modelValue: ((__VLS_ctx.formData.password)), type: ("password"), autocomplete: ("off"), showPassword: (true), }));
    const __VLS_41 = __VLS_40({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.password'))), modelValue: ((__VLS_ctx.formData.password)), type: ("password"), autocomplete: ("off"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    __VLS_nonNullable(__VLS_38.slots).default;
    var __VLS_38;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative pb-5 mt-6") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative z-[2] overflow-hidden select-none rounded-lg border border-transparent tad-300") }, ...{ class: (({ '!border-[#FF4E4F]': !__VLS_ctx.isPassing && __VLS_ctx.isClickPass })) }, });
    const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ArtDragVerify;
    /** @type { [typeof __VLS_components.ArtDragVerify, ] } */
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ ref: ("dragVerify"), value: ((__VLS_ctx.isPassing)), text: ((__VLS_ctx.$t('login.sliderText'))), textColor: ("var(--art-gray-700)"), successText: ((__VLS_ctx.$t('login.sliderSuccessText'))), progressBarBg: ("var(--main-color)"), background: ((__VLS_ctx.isDark ? '#26272F' : '#F1F1F4')), handlerBg: ("var(--default-box-color)"), }));
    const __VLS_47 = __VLS_46({ ref: ("dragVerify"), value: ((__VLS_ctx.isPassing)), text: ((__VLS_ctx.$t('login.sliderText'))), textColor: ("var(--art-gray-700)"), successText: ((__VLS_ctx.$t('login.sliderSuccessText'))), progressBarBg: ("var(--main-color)"), background: ((__VLS_ctx.isDark ? '#26272F' : '#F1F1F4')), handlerBg: ("var(--default-box-color)"), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    // @ts-ignore navigation for `const dragVerify = ref()`
    __VLS_ctx.dragVerify;
    var __VLS_51 = {};
    var __VLS_50;
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("absolute top-0 z-[1] px-px mt-2 text-xs text-[#f56c6c] tad-300") }, ...{ class: (({ 'translate-y-10': !__VLS_ctx.isPassing && __VLS_ctx.isClickPass })) }, });
    (__VLS_ctx.$t('login.placeholder.slider'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cb mt-2 text-sm") }, });
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
    /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ modelValue: ((__VLS_ctx.formData.rememberPassword)), }));
    const __VLS_54 = __VLS_53({ modelValue: ((__VLS_ctx.formData.rememberPassword)), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    (__VLS_ctx.$t('login.rememberPwd'));
    __VLS_nonNullable(__VLS_57.slots).default;
    var __VLS_57;
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ ...{ class: ("text-theme") }, to: (({ name: 'ForgetPassword' })), }));
    const __VLS_60 = __VLS_59({ ...{ class: ("text-theme") }, to: (({ name: 'ForgetPassword' })), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    (__VLS_ctx.$t('login.forgetPwd'));
    __VLS_nonNullable(__VLS_63.slots).default;
    var __VLS_63;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    const __VLS_66 = __VLS_65({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_70;
    const __VLS_71 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    let __VLS_67;
    let __VLS_68;
    (__VLS_ctx.$t('login.btnText'));
    __VLS_nonNullable(__VLS_69.slots).default;
    var __VLS_69;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-5 text-sm text-gray-600") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('login.noAccount'));
    const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ ...{ class: ("text-theme") }, to: (({ name: 'Register' })), }));
    const __VLS_74 = __VLS_73({ ...{ class: ("text-theme") }, to: (({ name: 'Register' })), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    (__VLS_ctx.$t('login.register'));
    __VLS_nonNullable(__VLS_77.slots).default;
    var __VLS_77;
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
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['pb-5'];
    __VLS_styleScopedClasses['mt-6'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['z-[2]'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-transparent'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['!border-[#FF4E4F]'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['z-[1]'];
    __VLS_styleScopedClasses['px-px'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-[#f56c6c]'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['translate-y-10'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-theme'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['text-theme'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_18,
        "dragVerify": __VLS_51,
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
            isDark: isDark,
            formKey: formKey,
            dragVerify: dragVerify,
            isPassing: isPassing,
            isClickPass: isClickPass,
            formRef: formRef,
            formData: formData,
            rules: rules,
            loading: loading,
            handleSubmit: handleSubmit,
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