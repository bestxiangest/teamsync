/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useCommon } from '@/hooks/core/useCommon';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtBackToTop' });
const { scrollToTop } = useCommon();
const showButton = ref(false);
const scrollThreshold = 300;
onMounted(() => {
    const scrollContainer = document.getElementById('app-main');
    if (scrollContainer) {
        const { y } = useScroll(scrollContainer);
        watch(y, (newY) => {
            showButton.value = newY > scrollThreshold;
        });
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.Transition;
    /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.Transition, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ enterActiveClass: ("tad-300 ease-out"), leaveActiveClass: ("tad-200 ease-in"), enterFromClass: ("opacity-0 translate-y-2"), enterToClass: ("opacity-100 translate-y-0"), leaveFromClass: ("opacity-100 translate-y-0"), leaveToClass: ("opacity-0 translate-y-2"), persisted: (true), }));
    const __VLS_2 = __VLS_1({ enterActiveClass: ("tad-300 ease-out"), leaveActiveClass: ("tad-200 ease-in"), enterFromClass: ("opacity-0 translate-y-2"), enterToClass: ("opacity-100 translate-y-0"), leaveFromClass: ("opacity-100 translate-y-0"), leaveToClass: ("opacity-0 translate-y-2"), persisted: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.scrollToTop) }, ...{ class: ("fixed right-10 bottom-15 size-9.5 flex-cc c-p border border-g-300 rounded-md tad-300 hover:bg-g-200") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.showButton) }, null, null);
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ icon: ("ri:arrow-up-wide-line"), ...{ class: ("text-g-500 text-lg") }, }));
    const __VLS_9 = __VLS_8({ icon: ("ri:arrow-up-wide-line"), ...{ class: ("text-g-500 text-lg") }, }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['fixed'];
    __VLS_styleScopedClasses['right-10'];
    __VLS_styleScopedClasses['bottom-15'];
    __VLS_styleScopedClasses['size-9.5'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['rounded-md'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['hover:bg-g-200'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['text-lg'];
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
            scrollToTop: scrollToTop,
            showButton: showButton,
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