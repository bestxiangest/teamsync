/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import SectionTitle from './SectionTitle.vue';
import SettingItem from './SettingItem.vue';
import { useSettingStore } from '@/store/modules/setting';
import { useSettingsConfig } from '../composables/useSettingsConfig';
import { useSettingsHandlers } from '../composables/useSettingsHandlers';
import { storeToRefs } from 'pinia';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const settingStore = useSettingStore();
const { basicSettingsConfig } = useSettingsConfig();
const { basicHandlers } = useSettingsHandlers();
// 获取store的响应式状态
const { uniqueOpened, showMenuButton, showFastEnter, showRefreshButton, showCrumbs, showWorkTab, showLanguage, showNprogress, colorWeak, watermarkVisible, menuOpenWidth, tabStyle, pageTransition, customRadius } = storeToRefs(settingStore);
// 创建设置值映射
const settingValueMap = {
    uniqueOpened,
    showMenuButton,
    showFastEnter,
    showRefreshButton,
    showCrumbs,
    showWorkTab,
    showLanguage,
    showNprogress,
    colorWeak,
    watermarkVisible,
    menuOpenWidth,
    tabStyle,
    pageTransition,
    customRadius
};
// 获取设置值的方法
const getSettingValue = (key) => {
    const settingRef = settingValueMap[key];
    return settingRef?.value ?? null;
};
// 统一的设置变更处理
const handleSettingChange = (handlerName, value) => {
    const handler = basicHandlers[handlerName];
    if (typeof handler === 'function') {
        handler(value);
    }
    else {
        console.warn(`Handler "${handlerName}" not found in basicHandlers`);
    }
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
    const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.basics.title'))), ...{ class: ("mt-10") }, }));
    const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.basics.title'))), ...{ class: ("mt-10") }, }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    for (const [config] of __VLS_getVForSourceType((__VLS_ctx.basicSettingsConfig))) {
        // @ts-ignore
        [SettingItem,];
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(SettingItem, new SettingItem({ ...{ 'onChange': {} }, key: ((config.key)), config: ((config)), modelValue: ((__VLS_ctx.getSettingValue(config.key))), }));
        const __VLS_6 = __VLS_5({ ...{ 'onChange': {} }, key: ((config.key)), config: ((config)), modelValue: ((__VLS_ctx.getSettingValue(config.key))), }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        let __VLS_10;
        const __VLS_11 = {
            onChange: (...[$event]) => {
                __VLS_ctx.handleSettingChange(config.handler, $event);
            }
        };
        let __VLS_7;
        let __VLS_8;
        var __VLS_9;
    }
    __VLS_styleScopedClasses['mt-10'];
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
            SettingItem: SettingItem,
            basicSettingsConfig: basicSettingsConfig,
            getSettingValue: getSettingValue,
            handleSettingChange: handleSettingChange,
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
//# sourceMappingURL=BasicSettings.vue.js.map