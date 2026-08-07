/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useFastEnter } from '@/hooks/core/useFastEnter';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtFastEnter' });
const router = useRouter();
const popoverRef = ref();
// 使用快速入口配置
const { enabledApplications, enabledQuickLinks } = useFastEnter();
/**
 * 处理导航跳转
 * @param routeName 路由名称
 * @param link 外部链接
 */
const handleNavigate = (routeName, link) => {
    const targetPath = routeName || link;
    if (!targetPath) {
        console.warn('导航配置无效：缺少路由名称或链接');
        return;
    }
    if (targetPath.startsWith('http')) {
        window.open(targetPath, '_blank');
    }
    else {
        router.push({ name: targetPath });
    }
    popoverRef.value?.hide();
};
/**
 * 处理应用项点击
 * @param application 应用配置对象
 */
const handleApplicationClick = (application) => {
    handleNavigate(application.routeName, application.link);
};
/**
 * 处理快速链接点击
 * @param quickLink 快速链接配置对象
 */
const handleQuickLinkClick = (quickLink) => {
    handleNavigate(quickLink.routeName, quickLink.link);
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
    /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ref: ("popoverRef"), width: ((700)), offset: ((0)), showArrow: ((false)), trigger: ("hover"), placement: ("bottom-start"), popperClass: ("fast-enter-popover"), popperStyle: (({
            border: '1px solid var(--default-border)',
            borderRadius: 'calc(var(--custom-radius) / 2 + 4px)'
        })), }));
    const __VLS_2 = __VLS_1({ ref: ("popoverRef"), width: ((700)), offset: ((0)), showArrow: ((false)), trigger: ("hover"), placement: ("bottom-start"), popperClass: ("fast-enter-popover"), popperStyle: (({
            border: '1px solid var(--default-border)',
            borderRadius: 'calc(var(--custom-radius) / 2 + 4px)'
        })), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const popoverRef = ref()`
    __VLS_ctx.popoverRef;
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c gap-2") }, });
        var __VLS_7 = {};
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("grid grid-cols-[2fr_0.8fr]") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("grid grid-cols-2 gap-1.5") }, });
    for (const [application] of __VLS_getVForSourceType((__VLS_ctx.enabledApplications))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleApplicationClick(application);
                } }, key: ((application.name)), ...{ class: ("mr-3 c-p flex-c gap-3 rounded-lg p-2 hover:bg-g-200/70 dark:hover:bg-g-200/90 hover:[&_.app-icon]:!bg-transparent") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("app-icon size-12 flex-cc rounded-lg bg-g-200/80 dark:bg-g-300/30") }, });
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ class: ("text-xl") }, icon: ((application.icon)), ...{ style: (({ color: application.iconColor })) }, }));
        const __VLS_10 = __VLS_9({ ...{ class: ("text-xl") }, icon: ((application.icon)), ...{ style: (({ color: application.iconColor })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("m-0 text-sm font-medium text-g-800") }, });
        (application.name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1 text-xs text-g-600") }, });
        (application.description);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("border-l-d pl-6 pt-2") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("mb-2.5 text-base font-medium text-g-800") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    for (const [quickLink] of __VLS_getVForSourceType((__VLS_ctx.enabledQuickLinks))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleQuickLinkClick(quickLink);
                } }, key: ((quickLink.name)), ...{ class: ("c-p py-2 hover:[&_span]:text-theme") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-g-600 no-underline") }, });
        (quickLink.name);
    }
    var __VLS_5;
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['grid'];
    __VLS_styleScopedClasses['grid-cols-[2fr_0.8fr]'];
    __VLS_styleScopedClasses['grid'];
    __VLS_styleScopedClasses['grid-cols-2'];
    __VLS_styleScopedClasses['gap-1.5'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-3'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['p-2'];
    __VLS_styleScopedClasses['hover:bg-g-200/70'];
    __VLS_styleScopedClasses['dark:hover:bg-g-200/90'];
    __VLS_styleScopedClasses['hover:[&_.app-icon]:!bg-transparent'];
    __VLS_styleScopedClasses['app-icon'];
    __VLS_styleScopedClasses['size-12'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['bg-g-200/80'];
    __VLS_styleScopedClasses['dark:bg-g-300/30'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['border-l-d'];
    __VLS_styleScopedClasses['pl-6'];
    __VLS_styleScopedClasses['pt-2'];
    __VLS_styleScopedClasses['mb-2.5'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['py-2'];
    __VLS_styleScopedClasses['hover:[&_span]:text-theme'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['no-underline'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "popoverRef": __VLS_6,
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
            popoverRef: popoverRef,
            enabledApplications: enabledApplications,
            enabledQuickLinks: enabledQuickLinks,
            handleApplicationClick: handleApplicationClick,
            handleQuickLinkClick: handleQuickLinkClick,
        };
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map