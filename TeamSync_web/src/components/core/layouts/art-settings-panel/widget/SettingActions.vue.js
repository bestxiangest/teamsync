/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { nextTick } from 'vue';
import { useSettingStore } from '@/store/modules/setting';
import { SETTING_DEFAULT_CONFIG } from '@/config/setting';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { MenuThemeEnum } from '@/enums/appEnum';
import { useTheme } from '@/hooks/core/useTheme';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'SettingActions' });
const { t } = useI18n();
const settingStore = useSettingStore();
const { copy, copied } = useClipboard();
const { switchThemeStyles } = useTheme();
/** 枚举映射表 */
const ENUM_MAPS = {
    menuType: {
        left: 'MenuTypeEnum.LEFT',
        top: 'MenuTypeEnum.TOP',
        'top-left': 'MenuTypeEnum.TOP_LEFT',
        'dual-menu': 'MenuTypeEnum.DUAL_MENU'
    },
    systemTheme: {
        auto: 'SystemThemeEnum.AUTO',
        light: 'SystemThemeEnum.LIGHT',
        dark: 'SystemThemeEnum.DARK'
    },
    menuTheme: {
        design: 'MenuThemeEnum.DESIGN',
        light: 'MenuThemeEnum.LIGHT',
        dark: 'MenuThemeEnum.DARK'
    },
    containerWidth: {
        '100%': 'ContainerWidthEnum.FULL',
        '1200px': 'ContainerWidthEnum.BOXED'
    }
};
const CONFIG_ITEMS = [
    { comment: '菜单类型', key: 'menuType', enumMap: ENUM_MAPS.menuType },
    { comment: '菜单展开宽度', key: 'menuOpenWidth' },
    { comment: '菜单是否展开', key: 'menuOpen' },
    { comment: '双菜单是否显示文本', key: 'dualMenuShowText' },
    { comment: '系统主题类型', key: 'systemThemeType', enumMap: ENUM_MAPS.systemTheme },
    { comment: '系统主题模式', key: 'systemThemeMode', enumMap: ENUM_MAPS.systemTheme },
    { comment: '菜单风格', key: 'menuThemeType', enumMap: ENUM_MAPS.menuTheme },
    { comment: '系统主题颜色', key: 'systemThemeColor' },
    { comment: '是否显示菜单按钮', key: 'showMenuButton' },
    { comment: '是否显示快速入口', key: 'showFastEnter' },
    { comment: '是否显示刷新按钮', key: 'showRefreshButton' },
    { comment: '是否显示面包屑', key: 'showCrumbs' },
    { comment: '是否显示工作台标签', key: 'showWorkTab' },
    { comment: '是否显示语言切换', key: 'showLanguage' },
    { comment: '是否显示进度条', key: 'showNprogress' },
    { comment: '是否显示设置引导', key: 'showSettingGuide' },
    { comment: '是否显示节日文本', key: 'showFestivalText' },
    { comment: '是否显示水印', key: 'watermarkVisible' },
    { comment: '是否自动关闭', key: 'autoClose' },
    { comment: '是否唯一展开', key: 'uniqueOpened' },
    { comment: '是否色弱模式', key: 'colorWeak' },
    { comment: '是否刷新', key: 'refresh' },
    { comment: '是否加载节日烟花', key: 'holidayFireworksLoaded' },
    { comment: '边框模式', key: 'boxBorderMode' },
    { comment: '页面过渡效果', key: 'pageTransition' },
    { comment: '标签页样式', key: 'tabStyle' },
    { comment: '自定义圆角', key: 'customRadius' },
    { comment: '容器宽度', key: 'containerWidth', enumMap: ENUM_MAPS.containerWidth },
    { comment: '节日日期', key: 'festivalDate', forceValue: '' }
];
/**
 * 将值转换为代码字符串
 */
const valueToCode = (value, enumMap) => {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    // 优先查找枚举映射
    if (enumMap && typeof value === 'string' && enumMap[value]) {
        return enumMap[value];
    }
    // 其他类型处理
    if (typeof value === 'string')
        return `'${value}'`;
    if (typeof value === 'boolean' || typeof value === 'number')
        return String(value);
    return JSON.stringify(value);
};
/**
 * 生成配置代码
 */
const generateConfigCode = () => {
    const lines = ['export const SETTING_DEFAULT_CONFIG = {'];
    CONFIG_ITEMS.forEach((item) => {
        lines.push(`  /** ${item.comment} */`);
        const value = item.forceValue !== undefined ? item.forceValue : settingStore[item.key];
        lines.push(`  ${String(item.key)}: ${valueToCode(value, item.enumMap)},`);
    });
    lines.push('}');
    return lines.join('\n');
};
/**
 * 复制配置到剪贴板
 */
const handleCopyConfig = async () => {
    try {
        const configText = generateConfigCode();
        await copy(configText);
        if (copied.value) {
            ElMessage.success({
                message: t('setting.actions.copySuccess'),
                duration: 3000
            });
        }
    }
    catch (error) {
        console.error('复制配置失败:', error);
        ElMessage.error(t('setting.actions.copyFailed'));
    }
};
/**
 * 切换布尔值配置（如果当前值与默认值不同）
 */
const toggleIfDifferent = (currentValue, defaultValue, toggleFn) => {
    if (currentValue !== defaultValue) {
        toggleFn();
    }
};
/**
 * 重置配置为默认值
 */
const handleResetConfig = async () => {
    try {
        const config = SETTING_DEFAULT_CONFIG;
        // 菜单相关
        settingStore.switchMenuLayouts(config.menuType);
        settingStore.setMenuOpenWidth(config.menuOpenWidth);
        settingStore.setMenuOpen(config.menuOpen);
        settingStore.setDualMenuShowText(config.dualMenuShowText);
        // 主题相关 - 使用 switchThemeStyles 确保正确处理 AUTO 模式
        switchThemeStyles(config.systemThemeMode);
        // 等待主题切换完成后，根据实际应用的主题设置菜单主题
        await nextTick();
        const menuTheme = settingStore.isDark ? MenuThemeEnum.DARK : config.menuThemeType;
        settingStore.switchMenuStyles(menuTheme);
        settingStore.setElementTheme(config.systemThemeColor);
        // 界面显示（切换类方法）
        toggleIfDifferent(settingStore.showMenuButton, config.showMenuButton, () => settingStore.setButton());
        toggleIfDifferent(settingStore.showFastEnter, config.showFastEnter, () => settingStore.setFastEnter());
        toggleIfDifferent(settingStore.showRefreshButton, config.showRefreshButton, () => settingStore.setShowRefreshButton());
        toggleIfDifferent(settingStore.showCrumbs, config.showCrumbs, () => settingStore.setCrumbs());
        toggleIfDifferent(settingStore.showLanguage, config.showLanguage, () => settingStore.setLanguage());
        toggleIfDifferent(settingStore.showNprogress, config.showNprogress, () => settingStore.setNprogress());
        // 界面显示（直接设置类方法）
        settingStore.setWorkTab(config.showWorkTab);
        settingStore.setShowFestivalText(config.showFestivalText);
        settingStore.setWatermarkVisible(config.watermarkVisible);
        // 功能设置
        toggleIfDifferent(settingStore.autoClose, config.autoClose, () => settingStore.setAutoClose());
        toggleIfDifferent(settingStore.uniqueOpened, config.uniqueOpened, () => settingStore.setUniqueOpened());
        toggleIfDifferent(settingStore.colorWeak, config.colorWeak, () => settingStore.setColorWeak());
        // 样式设置
        toggleIfDifferent(settingStore.boxBorderMode, config.boxBorderMode, () => settingStore.setBorderMode());
        settingStore.setPageTransition(config.pageTransition);
        settingStore.setTabStyle(config.tabStyle);
        settingStore.setCustomRadius(config.customRadius);
        settingStore.setContainerWidth(config.containerWidth);
        // 节日相关
        settingStore.setFestivalDate(config.festivalDate);
        settingStore.setholidayFireworksLoaded(config.holidayFireworksLoaded);
        location.reload();
    }
    catch (error) {
        console.error('重置配置失败:', error);
        ElMessage.error(t('setting.actions.resetFailed'));
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-10 flex gap-8 border-t border-[var(--default-border)] bg-[var(--art-bg-color)] pt-5") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("flex-1 !h-8") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("flex-1 !h-8") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.handleCopyConfig)
    };
    let __VLS_3;
    let __VLS_4;
    (__VLS_ctx.$t('setting.actions.copyConfig'));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onClick': {} }, type: ("danger"), plain: (true), ...{ class: ("flex-1 !h-8") }, }));
    const __VLS_10 = __VLS_9({ ...{ 'onClick': {} }, type: ("danger"), plain: (true), ...{ class: ("flex-1 !h-8") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.handleResetConfig)
    };
    let __VLS_11;
    let __VLS_12;
    (__VLS_ctx.$t('setting.actions.resetConfig'));
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    __VLS_styleScopedClasses['mt-10'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['gap-8'];
    __VLS_styleScopedClasses['border-t'];
    __VLS_styleScopedClasses['border-[var(--default-border)]'];
    __VLS_styleScopedClasses['bg-[var(--art-bg-color)]'];
    __VLS_styleScopedClasses['pt-5'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['!h-8'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['!h-8'];
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
            handleCopyConfig: handleCopyConfig,
            handleResetConfig: handleResetConfig,
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
//# sourceMappingURL=SettingActions.vue.js.map