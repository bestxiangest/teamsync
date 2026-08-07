/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import SectionTitle from './SectionTitle.vue';
import { useSettingStore } from '@/store/modules/setting';
import { useSettingsConfig } from '../composables/useSettingsConfig';
import { useSettingsHandlers } from '../composables/useSettingsHandlers';
import { storeToRefs } from 'pinia';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const settingStore = useSettingStore();
const { containerWidth } = storeToRefs(settingStore);
const { containerWidthOptions } = useSettingsConfig();
const { containerHandlers } = useSettingsHandlers(); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    // @ts-ignore
    [SectionTitle,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.container.title'))), ...{ class: ("mt-12.5") }, }));
    const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.container.title'))), ...{ class: ("mt-12.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex") }, });
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.containerWidthOptions))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.containerHandlers.setWidth(option.value);
                } }, key: ((option.value)), ...{ class: ("flex-cc flex-1 h-16 mt-5 mr-3.5 mb-3.5 cursor-pointer !border-2 rounded-lg !text-g-800 last:mr-0") }, ...{ class: (({
                    'border-theme [&_i]:!text-theme': __VLS_ctx.containerWidth === option.value,
                    'border-full-d': __VLS_ctx.containerWidth !== option.value
                })) }, });
        const __VLS_5 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({ icon: ((option.icon)), ...{ class: ("mr-2 text-lg") }, }));
        const __VLS_7 = __VLS_6({ icon: ((option.icon)), ...{ class: ("mr-2 text-lg") }, }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-sm") }, });
        (option.label);
    }
    __VLS_styleScopedClasses['mt-12.5'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['h-16'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['mr-3.5'];
    __VLS_styleScopedClasses['mb-3.5'];
    __VLS_styleScopedClasses['cursor-pointer'];
    __VLS_styleScopedClasses['!border-2'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['!text-g-800'];
    __VLS_styleScopedClasses['last:mr-0'];
    __VLS_styleScopedClasses['border-theme'];
    __VLS_styleScopedClasses['[&_i]:!text-theme'];
    __VLS_styleScopedClasses['border-full-d'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['text-sm'];
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
            SectionTitle: SectionTitle,
            containerWidth: containerWidth,
            containerWidthOptions: containerWidthOptions,
            containerHandlers: containerHandlers,
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
//# sourceMappingURL=ContainerSettings.vue.js.map