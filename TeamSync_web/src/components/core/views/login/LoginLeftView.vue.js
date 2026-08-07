/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import loginIcon from '@imgs/svg/login_icon.svg';
import { themeAnimation } from '@/utils/ui/animation';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const __VLS_props = defineProps(); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['animate-fade-in-left'];
    __VLS_styleScopedClasses['animate-fade-in-right'];
    __VLS_styleScopedClasses['text-wrap'];
    __VLS_styleScopedClasses['left-img'];
    __VLS_styleScopedClasses['text-wrap'];
    __VLS_styleScopedClasses['geometric-decorations'];
    __VLS_styleScopedClasses['logo'];
    __VLS_styleScopedClasses['login-left-view'];
    __VLS_styleScopedClasses['geometric-decorations'];
    __VLS_styleScopedClasses['circle-top-right'];
    __VLS_styleScopedClasses['bg-bubble'];
    __VLS_styleScopedClasses['square-rotated'];
    __VLS_styleScopedClasses['circle-small'];
    __VLS_styleScopedClasses['dot'];
    __VLS_styleScopedClasses['square-bottom-right'];
    __VLS_styleScopedClasses['dot'];
    __VLS_styleScopedClasses['dot-top-right'];
    __VLS_styleScopedClasses['squares-group'];
    __VLS_styleScopedClasses['square'];
    __VLS_styleScopedClasses['square-blue'];
    __VLS_styleScopedClasses['square-pink'];
    __VLS_styleScopedClasses['square-purple'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("login-left-view") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("logo") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
    /** @type { [typeof __VLS_components.ArtLogo, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("icon") }, size: ("46"), }));
    const __VLS_2 = __VLS_1({ ...{ class: ("icon") }, size: ("46"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("title") }, });
    (__VLS_ctx.AppConfig.systemInfo.name);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left-img") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ThemeSvg;
    /** @type { [typeof __VLS_components.ThemeSvg, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ src: ((__VLS_ctx.loginIcon)), size: ("100%"), }));
    const __VLS_8 = __VLS_7({ src: ((__VLS_ctx.loginIcon)), size: ("100%"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.$t('login.leftView.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('login.leftView.subTitle'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geometric-decorations") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element circle-outline animate-fade-in-up") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element square-rotated animate-fade-in-left") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element circle-small animate-fade-in-up") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element square-bottom-right animate-fade-in-right") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element bg-bubble animate-scale-in") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.themeAnimation) }, ...{ class: ("geo-element circle-top-right animate-fade-in-down") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element dot dot-top-left animate-bounce-in") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element dot dot-top-right animate-bounce-in") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("geo-element dot dot-center-right animate-bounce-in") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("squares-group") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("geo-element square square-blue animate-fade-in-left-rotated-blue") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("geo-element square square-pink animate-fade-in-left-rotated-pink") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("geo-element square square-purple animate-fade-in-left-no-rotation") }, ...{ style: ({}) }, });
    __VLS_styleScopedClasses['login-left-view'];
    __VLS_styleScopedClasses['logo'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['left-img'];
    __VLS_styleScopedClasses['text-wrap'];
    __VLS_styleScopedClasses['geometric-decorations'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['circle-outline'];
    __VLS_styleScopedClasses['animate-fade-in-up'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['square-rotated'];
    __VLS_styleScopedClasses['animate-fade-in-left'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['circle-small'];
    __VLS_styleScopedClasses['animate-fade-in-up'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['square-bottom-right'];
    __VLS_styleScopedClasses['animate-fade-in-right'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['bg-bubble'];
    __VLS_styleScopedClasses['animate-scale-in'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['circle-top-right'];
    __VLS_styleScopedClasses['animate-fade-in-down'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['dot'];
    __VLS_styleScopedClasses['dot-top-left'];
    __VLS_styleScopedClasses['animate-bounce-in'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['dot'];
    __VLS_styleScopedClasses['dot-top-right'];
    __VLS_styleScopedClasses['animate-bounce-in'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['dot'];
    __VLS_styleScopedClasses['dot-center-right'];
    __VLS_styleScopedClasses['animate-bounce-in'];
    __VLS_styleScopedClasses['squares-group'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['square'];
    __VLS_styleScopedClasses['square-blue'];
    __VLS_styleScopedClasses['animate-fade-in-left-rotated-blue'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['square'];
    __VLS_styleScopedClasses['square-pink'];
    __VLS_styleScopedClasses['animate-fade-in-left-rotated-pink'];
    __VLS_styleScopedClasses['geo-element'];
    __VLS_styleScopedClasses['square'];
    __VLS_styleScopedClasses['square-purple'];
    __VLS_styleScopedClasses['animate-fade-in-left-no-rotation'];
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
            AppConfig: AppConfig,
            loginIcon: loginIcon,
            themeAnimation: themeAnimation,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=LoginLeftView.vue.js.map