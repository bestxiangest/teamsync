/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useUserStore } from '@/store/modules/user';
import imgUrl from '@imgs/svg/404.svg';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Exception404' });
const LOGIN_HASH_PATH = '/#/auth/login';
const userStore = useUserStore();
const goToLogin = () => {
    userStore.logOut(false);
    window.location.replace(LOGIN_HASH_PATH);
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
    __VLS_styleScopedClasses['login-btn'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({ ...{ class: ("not-found-page") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({ ...{ class: ("not-found-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((__VLS_ctx.imgUrl)), alt: ("404 not found"), ...{ class: ("not-found-image") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("not-found-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("not-found-desc") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({ ...{ onClick: (__VLS_ctx.goToLogin) }, type: ("button"), ...{ class: ("login-btn") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("path-hint") }, });
    __VLS_styleScopedClasses['not-found-page'];
    __VLS_styleScopedClasses['not-found-card'];
    __VLS_styleScopedClasses['not-found-image'];
    __VLS_styleScopedClasses['not-found-title'];
    __VLS_styleScopedClasses['not-found-desc'];
    __VLS_styleScopedClasses['login-btn'];
    __VLS_styleScopedClasses['path-hint'];
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
            imgUrl: imgUrl,
            goToLogin: goToLogin,
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