/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useSettingsPanel } from './composables/useSettingsPanel';
import SettingDrawer from './widget/SettingDrawer.vue';
import SettingHeader from './widget/SettingHeader.vue';
import ThemeSettings from './widget/ThemeSettings.vue';
import MenuLayoutSettings from './widget/MenuLayoutSettings.vue';
import MenuStyleSettings from './widget/MenuStyleSettings.vue';
import ColorSettings from './widget/ColorSettings.vue';
import BoxStyleSettings from './widget/BoxStyleSettings.vue';
import ContainerSettings from './widget/ContainerSettings.vue';
import BasicSettings from './widget/BasicSettings.vue';
import SettingActions from './widget/SettingActions.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtSettingsPanel' });
const props = defineProps();
// 使用设置面板逻辑
const settingsPanel = useSettingsPanel();
const { showDrawer } = settingsPanel;
// 获取各种处理器
const { handleOpen, handleClose, closeDrawer } = settingsPanel.useDrawerControl();
const { initializeSettings, cleanupSettings } = settingsPanel.useSettingsInitializer();
// 监听 props 变化
settingsPanel.usePropsWatcher(props);
onMounted(() => {
    initializeSettings();
});
onUnmounted(() => {
    cleanupSettings();
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-settings") }, });
    // @ts-ignore
    [SettingDrawer, SettingDrawer,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SettingDrawer, new SettingDrawer({ ...{ 'onOpen': {} }, ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.showDrawer)), }));
    const __VLS_1 = __VLS_0({ ...{ 'onOpen': {} }, ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.showDrawer)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_5;
    const __VLS_6 = {
        onOpen: (__VLS_ctx.handleOpen)
    };
    const __VLS_7 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_2;
    let __VLS_3;
    // @ts-ignore
    [SettingHeader,];
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(SettingHeader, new SettingHeader({ ...{ 'onClose': {} }, }));
    const __VLS_9 = __VLS_8({ ...{ 'onClose': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_13;
    const __VLS_14 = {
        onClose: (__VLS_ctx.closeDrawer)
    };
    let __VLS_10;
    let __VLS_11;
    var __VLS_12;
    // @ts-ignore
    [ThemeSettings,];
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(ThemeSettings, new ThemeSettings({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    // @ts-ignore
    [MenuLayoutSettings,];
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(MenuLayoutSettings, new MenuLayoutSettings({}));
    const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
    // @ts-ignore
    [MenuStyleSettings,];
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(MenuStyleSettings, new MenuStyleSettings({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore
    [ColorSettings,];
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(ColorSettings, new ColorSettings({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    // @ts-ignore
    [BoxStyleSettings,];
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(BoxStyleSettings, new BoxStyleSettings({}));
    const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
    // @ts-ignore
    [ContainerSettings,];
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(ContainerSettings, new ContainerSettings({}));
    const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
    // @ts-ignore
    [BasicSettings,];
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(BasicSettings, new BasicSettings({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    // @ts-ignore
    [SettingActions,];
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(SettingActions, new SettingActions({}));
    const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_nonNullable(__VLS_4.slots).default;
    var __VLS_4;
    __VLS_styleScopedClasses['layout-settings'];
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
            SettingDrawer: SettingDrawer,
            SettingHeader: SettingHeader,
            ThemeSettings: ThemeSettings,
            MenuLayoutSettings: MenuLayoutSettings,
            MenuStyleSettings: MenuStyleSettings,
            ColorSettings: ColorSettings,
            BoxStyleSettings: BoxStyleSettings,
            ContainerSettings: ContainerSettings,
            BasicSettings: BasicSettings,
            SettingActions: SettingActions,
            showDrawer: showDrawer,
            handleOpen: handleOpen,
            handleClose: handleClose,
            closeDrawer: closeDrawer,
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
//# sourceMappingURL=index.vue.js.map