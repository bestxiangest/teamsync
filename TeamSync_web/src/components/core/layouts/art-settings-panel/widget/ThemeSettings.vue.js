/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import SectionTitle from './SectionTitle.vue';
import { useSettingStore } from '@/store/modules/setting';
import { useSettingsConfig } from '../composables/useSettingsConfig';
import { useTheme } from '@/hooks/core/useTheme';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const settingStore = useSettingStore();
const { systemThemeMode } = storeToRefs(settingStore);
const { configOptions } = useSettingsConfig();
const { switchThemeStyles } = useTheme(); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    // @ts-ignore
    [SectionTitle,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.theme.title'))), }));
    const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.theme.title'))), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("setting-box-wrap") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.configOptions.themeList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.switchThemeStyles(item.theme);
                } }, ...{ class: ("setting-item") }, key: ((item.theme)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box") }, ...{ class: (({ 'is-active': item.theme === __VLS_ctx.systemThemeMode })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((item.img)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("name") }, });
        (__VLS_ctx.$t(`setting.theme.list[${index}]`));
    }
    __VLS_styleScopedClasses['setting-box-wrap'];
    __VLS_styleScopedClasses['setting-item'];
    __VLS_styleScopedClasses['box'];
    __VLS_styleScopedClasses['is-active'];
    __VLS_styleScopedClasses['name'];
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
            systemThemeMode: systemThemeMode,
            configOptions: configOptions,
            switchThemeStyles: switchThemeStyles,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ThemeSettings.vue.js.map