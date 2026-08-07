/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import SectionTitle from './SectionTitle.vue';
import { useSettingStore } from '@/store/modules/setting';
import { useSettingsConfig } from '../composables/useSettingsConfig';
import { useSettingsHandlers } from '../composables/useSettingsHandlers';
import { storeToRefs } from 'pinia';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const settingStore = useSettingStore();
const { systemThemeColor } = storeToRefs(settingStore);
const { configOptions } = useSettingsConfig();
const { colorHandlers } = useSettingsHandlers(); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.color.title'))), ...{ class: ("mt-10") }, }));
    const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.color.title'))), ...{ class: ("mt-10") }, }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("-mr-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-wrap") }, });
    for (const [color] of __VLS_getVForSourceType((__VLS_ctx.configOptions.mainColors))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.colorHandlers.selectColor(color);
                } }, key: ((color)), ...{ class: ("flex items-center justify-center size-[23px] mr-4 mb-2.5 cursor-pointer rounded-full transition-all duration-200 hover:opacity-85") }, ...{ style: (({ background: `${color} !important` })) }, });
        const __VLS_5 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({ icon: ("ri:check-fill"), ...{ class: ("text-base !text-white") }, }));
        const __VLS_7 = __VLS_6({ icon: ("ri:check-fill"), ...{ class: ("text-base !text-white") }, }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (color === __VLS_ctx.systemThemeColor) }, null, null);
    }
    __VLS_styleScopedClasses['mt-10'];
    __VLS_styleScopedClasses['-mr-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['size-[23px]'];
    __VLS_styleScopedClasses['mr-4'];
    __VLS_styleScopedClasses['mb-2.5'];
    __VLS_styleScopedClasses['cursor-pointer'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['transition-all'];
    __VLS_styleScopedClasses['duration-200'];
    __VLS_styleScopedClasses['hover:opacity-85'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['!text-white'];
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
            systemThemeColor: systemThemeColor,
            configOptions: configOptions,
            colorHandlers: colorHandlers,
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
//# sourceMappingURL=ColorSettings.vue.js.map