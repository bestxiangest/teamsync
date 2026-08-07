/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useSettingStore } from '@/store/modules/setting';
import { useCeremony } from '@/hooks/core/useCeremony';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtFestivalTextScroll' });
const settingStore = useSettingStore();
const { showFestivalText } = storeToRefs(settingStore);
const { currentFestivalData } = useCeremony();
const handleClose = () => {
    settingStore.setShowFestivalText(false);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("overflow-hidden transition-[height] duration-600 ease-in-out") }, ...{ style: (({
                height: __VLS_ctx.showFestivalText ? '48px' : '0'
            })) }, });
    if (__VLS_ctx.showFestivalText && __VLS_ctx.currentFestivalData?.scrollText !== '') {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtTextScroll;
        /** @type { [typeof __VLS_components.ArtTextScroll, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, text: ((__VLS_ctx.currentFestivalData?.scrollText || '')), ...{ style: ({}) }, showClose: (true), }));
        const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, text: ((__VLS_ctx.currentFestivalData?.scrollText || '')), ...{ style: ({}) }, showClose: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_6;
        const __VLS_7 = {
            onClose: (__VLS_ctx.handleClose)
        };
        let __VLS_3;
        let __VLS_4;
        var __VLS_5;
    }
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['transition-[height]'];
    __VLS_styleScopedClasses['duration-600'];
    __VLS_styleScopedClasses['ease-in-out'];
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
            showFestivalText: showFestivalText,
            currentFestivalData: currentFestivalData,
            handleClose: handleClose,
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