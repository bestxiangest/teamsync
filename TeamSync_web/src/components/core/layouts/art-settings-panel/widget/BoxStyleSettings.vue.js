/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import SectionTitle from './SectionTitle.vue';
import { useSettingStore } from '@/store/modules/setting';
import { useSettingsConfig } from '../composables/useSettingsConfig';
import { useSettingsHandlers } from '../composables/useSettingsHandlers';
import { storeToRefs } from 'pinia';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const settingStore = useSettingStore();
const { boxBorderMode } = storeToRefs(settingStore);
const { boxStyleOptions } = useSettingsConfig();
const { boxStyleHandlers } = useSettingsHandlers();
// 判断当前选项是否激活
const isActive = (type) => {
    return type === 'border-mode' ? boxBorderMode.value : !boxBorderMode.value;
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    // @ts-ignore
    [SectionTitle,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.box.title'))), ...{ class: ("mt-10") }, }));
    const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.box.title'))), ...{ class: ("mt-10") }, }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-border flex-cb p-1 mt-5 rounded-lg bg-g-200") }, });
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.boxStyleOptions))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.boxStyleHandlers.setBoxMode(option.type);
                } }, key: ((option.value)), ...{ class: ("w-[calc(50%-3px)] h-8.5 leading-8.5 text-sm text-center c-p select-none rounded-md transition-all duration-200") }, ...{ class: ((__VLS_ctx.isActive(option.type)
                    ? 'text-g-800 bg-[var(--default-box-color)] dark:!text-white dark:bg-g-300'
                    : 'hover:text-g-800 hover:bg-black/[0.04] dark:hover:bg-black/20')) }, });
        (option.label);
    }
    __VLS_styleScopedClasses['mt-10'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['p-1'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['bg-g-200'];
    __VLS_styleScopedClasses['w-[calc(50%-3px)]'];
    __VLS_styleScopedClasses['h-8.5'];
    __VLS_styleScopedClasses['leading-8.5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded-md'];
    __VLS_styleScopedClasses['transition-all'];
    __VLS_styleScopedClasses['duration-200'];
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
            boxStyleOptions: boxStyleOptions,
            boxStyleHandlers: boxStyleHandlers,
            isActive: isActive,
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
//# sourceMappingURL=BoxStyleSettings.vue.js.map