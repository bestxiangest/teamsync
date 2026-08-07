/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ForgetPassword' });
const router = useRouter();
const showInputLabel = ref(false);
const username = ref('');
const loading = ref(false);
const register = async () => { };
const toLogin = () => {
    router.push({ name: 'Login' });
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
    (__VLS_ctx.$t('forgetPassword.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("sub-title") }, });
    (__VLS_ctx.$t('forgetPassword.subTitle'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-5") }, });
    if (__VLS_ctx.showInputLabel) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("input-label") }, });
    }
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('forgetPassword.placeholder'))), modelValue: ((__VLS_ctx.username)), }));
    const __VLS_14 = __VLS_13({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('forgetPassword.placeholder'))), modelValue: ((__VLS_ctx.username)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    const __VLS_20 = __VLS_19({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_24;
    const __VLS_25 = {
        onClick: (__VLS_ctx.register)
    };
    let __VLS_21;
    let __VLS_22;
    (__VLS_ctx.$t('forgetPassword.submitBtnText'));
    __VLS_nonNullable(__VLS_23.slots).default;
    var __VLS_23;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, plain: (true), }));
    const __VLS_28 = __VLS_27({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_32;
    const __VLS_33 = {
        onClick: (__VLS_ctx.toLogin)
    };
    let __VLS_29;
    let __VLS_30;
    (__VLS_ctx.$t('forgetPassword.backBtnText'));
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-screen'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['auth-right-wrap'];
    __VLS_styleScopedClasses['form'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['sub-title'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['input-label'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['custom-height'];
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
            showInputLabel: showInputLabel,
            username: username,
            loading: loading,
            register: register,
            toLogin: toLogin,
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