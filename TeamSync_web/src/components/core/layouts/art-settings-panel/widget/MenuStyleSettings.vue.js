/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import SectionTitle from './SectionTitle.vue';
import { MenuTypeEnum } from '@/enums/appEnum';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const menuThemeList = AppConfig.themeList;
const settingStore = useSettingStore();
const { menuThemeType, menuType, isDark } = storeToRefs(settingStore);
const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP);
const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU);
const disabled = computed(() => isTopMenu.value || isDualMenu.value || isDark.value);
// 菜单样式切换
const switchMenuStyles = (theme) => {
    if (isDualMenu.value || isTopMenu.value || isDark.value) {
        return;
    }
    settingStore.switchMenuStyles(theme);
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
    // @ts-ignore
    [SectionTitle,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.menu.title'))), }));
    const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.menu.title'))), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("setting-box-wrap") }, });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.menuThemeList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.switchMenuStyles(item.theme);
                } }, ...{ class: ("setting-item") }, key: ((item.theme)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box") }, ...{ class: (({ 'is-active': item.theme === __VLS_ctx.menuThemeType })) }, ...{ style: (({
                    cursor: __VLS_ctx.disabled ? 'no-drop' : 'pointer'
                })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((item.img)), });
    }
    __VLS_styleScopedClasses['setting-box-wrap'];
    __VLS_styleScopedClasses['setting-item'];
    __VLS_styleScopedClasses['box'];
    __VLS_styleScopedClasses['is-active'];
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
            menuThemeList: menuThemeList,
            menuThemeType: menuThemeType,
            disabled: disabled,
            switchMenuStyles: switchMenuStyles,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MenuStyleSettings.vue.js.map