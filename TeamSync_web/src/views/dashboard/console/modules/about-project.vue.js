/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { WEB_LINKS } from '@/utils/constants';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const systemName = AppConfig.systemInfo.name;
const linkList = [
    { label: '项目官网', url: WEB_LINKS.DOCS },
    { label: '文档', url: WEB_LINKS.INTRODUCE },
    { label: 'Github', url: WEB_LINKS.GITHUB_HOME },
    { label: '哔哩哔哩', url: WEB_LINKS.BILIBILI }
];
/**
 * 在新标签页中打开指定 URL
 * @param url 要打开的网页地址
 */
const goPage = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-5 flex-b mb-5 max-sm:mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("text-2xl font-medium") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-g-700 mt-1") }, });
    (__VLS_ctx.systemName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-g-700 mt-1") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-wrap gap-3.5 max-w-150 mt-9") }, });
    for (const [link] of __VLS_getVForSourceType((__VLS_ctx.linkList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.goPage(link.url);
                } }, ...{ class: ("w-60 flex-cb h-12.5 px-3.5 border border-g-300 c-p rounded-lg text-sm bg-g-100 duration-300 hover:-translate-y-1 max-sm:w-full") }, key: ((link.label)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-g-700") }, });
        (link.label);
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ("ri:arrow-right-s-line"), ...{ class: ("text-lg text-g-600") }, }));
        const __VLS_2 = __VLS_1({ icon: ("ri:arrow-right-s-line"), ...{ class: ("text-lg text-g-600") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("w-75 max-md:!hidden") }, src: ("@imgs/draw/draw1.png"), alt: ("draw1"), });
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['gap-3.5'];
    __VLS_styleScopedClasses['max-w-150'];
    __VLS_styleScopedClasses['mt-9'];
    __VLS_styleScopedClasses['w-60'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['h-12.5'];
    __VLS_styleScopedClasses['px-3.5'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['bg-g-100'];
    __VLS_styleScopedClasses['duration-300'];
    __VLS_styleScopedClasses['hover:-translate-y-1'];
    __VLS_styleScopedClasses['max-sm:w-full'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['w-75'];
    __VLS_styleScopedClasses['max-md:!hidden'];
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
            systemName: systemName,
            linkList: linkList,
            goPage: goPage,
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
//# sourceMappingURL=about-project.vue.js.map