/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { useSettingStore } from '@/store/modules/setting';
import { MenuTypeEnum, MenuWidth } from '@/enums/appEnum';
import { useMenuStore } from '@/store/modules/menu';
import { isIframe } from '@/utils/navigation';
import { handleMenuJump } from '@/utils/navigation';
import SidebarSubmenu from './widget/SidebarSubmenu.vue';
import { useCommon } from '@/hooks/core/useCommon';
import { useWindowSize, useTimeoutFn } from '@vueuse/core';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtSidebarMenu' });
const MOBILE_BREAKPOINT = 800;
const ANIMATION_DELAY = 350;
const MENU_CLOSE_WIDTH = MenuWidth.CLOSE;
const route = useRoute();
const router = useRouter();
const settingStore = useSettingStore();
const { getMenuOpenWidth, menuType, uniqueOpened, dualMenuShowText, menuOpen, getMenuTheme } = storeToRefs(settingStore);
// 组件内部状态
const defaultOpenedMenus = ref([]);
const isMobileMode = ref(false);
const showMobileModal = ref(false);
// 使用 VueUse 的窗口尺寸监听
const { width } = useWindowSize();
// 菜单宽度相关
const menuopenwidth = computed(() => getMenuOpenWidth.value);
const menuclosewidth = computed(() => MENU_CLOSE_WIDTH);
// 菜单类型判断
const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT);
const showLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT || menuType.value === MenuTypeEnum.TOP_LEFT);
const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU);
// 移动端屏幕判断（使用 computed 避免重复计算）
const isMobileScreen = computed(() => width.value < MOBILE_BREAKPOINT);
// 路由相关
const firstLevelMenuPath = computed(() => route.matched[0]?.path);
const routerPath = computed(() => String(route.meta.activePath || route.path));
// 菜单数据
const firstLevelMenus = computed(() => {
    return useMenuStore().menuList.filter((menu) => !menu.meta.isHide);
});
const menuList = computed(() => {
    const menuStore = useMenuStore();
    const allMenus = menuStore.menuList;
    // 如果不是顶部左侧菜单或双列菜单，直接返回完整菜单列表
    if (!isTopLeftMenu.value && !isDualMenu.value) {
        return allMenus;
    }
    // 处理 iframe 路径
    if (isIframe(route.path)) {
        return findIframeMenuList(route.path, allMenus);
    }
    // 处理一级菜单
    if (route.meta.isFirstLevel) {
        return [];
    }
    // 返回当前顶级路径对应的子菜单
    const currentTopPath = `/${route.path.split('/')[1]}`;
    const currentMenu = allMenus.find((menu) => menu.path === currentTopPath);
    return currentMenu?.children ?? [];
});
// 双列菜单收起时的滚动条样式
const scrollbarStyle = computed(() => {
    const isCollapsed = isDualMenu.value && !menuOpen.value;
    return {
        transform: isCollapsed ? 'translateY(-50px)' : 'translateY(0)',
        height: isCollapsed ? 'calc(100% + 50px)' : '100%',
        transition: 'transform 0.3s ease'
    };
});
/**
 * 延迟隐藏移动端模态框（使用 VueUse 的 useTimeoutFn）
 */
const { start: delayHideMobileModal } = useTimeoutFn(() => {
    showMobileModal.value = false;
}, ANIMATION_DELAY, { immediate: false });
/**
 * 查找 iframe 对应的二级菜单列表
 */
const findIframeMenuList = (currentPath, menuList) => {
    // 递归查找包含当前路径的菜单项
    const hasPath = (items) => {
        for (const item of items) {
            if (item.path === currentPath) {
                return true;
            }
            if (item.children && hasPath(item.children)) {
                return true;
            }
        }
        return false;
    };
    // 遍历一级菜单查找匹配的子菜单
    for (const menu of menuList) {
        if (menu.children && hasPath(menu.children)) {
            return menu.children;
        }
    }
    return [];
};
const { homePath } = useCommon();
/**
 * 导航到首页
 */
const navigateToHome = () => {
    router.push(homePath.value);
};
/**
 * 切换菜单显示/隐藏
 */
const toggleMenuVisibility = () => {
    settingStore.setMenuOpen(!menuOpen.value);
    // 移动端模态框控制逻辑
    if (isMobileScreen.value) {
        if (!menuOpen.value) {
            // 菜单即将打开，立即显示模态框
            showMobileModal.value = true;
        }
        else {
            // 菜单即将关闭，延迟隐藏模态框确保动画完成
            delayHideMobileModal();
        }
    }
};
/**
 * 处理菜单关闭（来自子组件）
 */
const handleMenuClose = () => {
    if (isMobileScreen.value) {
        settingStore.setMenuOpen(false);
        delayHideMobileModal();
    }
};
/**
 * 切换双列菜单模式
 */
const toggleDualMenuMode = () => {
    settingStore.setDualMenuShowText(!dualMenuShowText.value);
};
/**
 * 监听窗口尺寸变化，自动处理移动端菜单
 */
watch(width, (newWidth) => {
    if (newWidth < MOBILE_BREAKPOINT) {
        settingStore.setMenuOpen(false);
        if (!menuOpen.value) {
            showMobileModal.value = false;
        }
    }
    else {
        showMobileModal.value = false;
    }
});
/**
 * 监听菜单开关状态变化
 */
watch(menuOpen, (isMenuOpen) => {
    if (!isMobileScreen.value) {
        // 大屏幕设备上，模态框始终隐藏
        showMobileModal.value = false;
    }
    else {
        // 小屏幕设备上，根据菜单状态控制模态框
        if (isMenuOpen) {
            // 菜单打开时立即显示模态框
            showMobileModal.value = true;
        }
        else {
            // 菜单关闭时延迟隐藏模态框，确保动画完成
            delayHideMobileModal();
        }
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
    // CSS variable injection 
    __VLS_ctx.menuopenwidth;
    __VLS_ctx.menuclosewidth;
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    if (__VLS_ctx.showLeftMenu || __VLS_ctx.isDualMenu) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-sidebar") }, ...{ class: (({ 'no-border': __VLS_ctx.menuList.length === 0 })) }, });
        if (__VLS_ctx.isDualMenu) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dual-menu-left") }, ...{ style: (({ width: __VLS_ctx.dualMenuShowText ? '80px' : '64px', background: __VLS_ctx.getMenuTheme.background })) }, });
            const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
            /** @type { [typeof __VLS_components.ArtLogo, ] } */
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, ...{ class: ("logo") }, }));
            const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, ...{ class: ("logo") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            let __VLS_6;
            const __VLS_7 = {
                onClick: (__VLS_ctx.navigateToHome)
            };
            let __VLS_3;
            let __VLS_4;
            var __VLS_5;
            const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
            /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ style: ({}) }, }));
            const __VLS_10 = __VLS_9({ ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [menu] of __VLS_getVForSourceType((__VLS_ctx.firstLevelMenus))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                            if (!((__VLS_ctx.showLeftMenu || __VLS_ctx.isDualMenu)))
                                return;
                            if (!((__VLS_ctx.isDualMenu)))
                                return;
                            __VLS_ctx.handleMenuJump(menu, true);
                        } }, key: ((menu.path)), });
                const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
                /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.ElTooltip, ] } */
                // @ts-ignore
                const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ class: ("box-item") }, effect: ("dark"), content: ((__VLS_ctx.$t(menu.meta.title))), placement: ("right"), offset: ((15)), hideAfter: ((0)), disabled: ((__VLS_ctx.dualMenuShowText)), }));
                const __VLS_16 = __VLS_15({ ...{ class: ("box-item") }, effect: ("dark"), content: ((__VLS_ctx.$t(menu.meta.title))), placement: ("right"), offset: ((15)), hideAfter: ((0)), disabled: ((__VLS_ctx.dualMenuShowText)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: (({
                            'is-active': menu.meta.isFirstLevel
                                ? menu.path === __VLS_ctx.route.path
                                : menu.path === __VLS_ctx.firstLevelMenuPath
                        })) }, ...{ style: (({
                            height: __VLS_ctx.dualMenuShowText ? '60px' : '46px'
                        })) }, });
                const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ class: ("menu-icon text-g-700 dark:text-g-800") }, icon: ((menu.meta.icon)), ...{ style: (({
                            marginBottom: __VLS_ctx.dualMenuShowText ? '5px' : '0'
                        })) }, }));
                const __VLS_22 = __VLS_21({ ...{ class: ("menu-icon text-g-700 dark:text-g-800") }, icon: ((menu.meta.icon)), ...{ style: (({
                            marginBottom: __VLS_ctx.dualMenuShowText ? '5px' : '0'
                        })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                if (__VLS_ctx.dualMenuShowText) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-md text-g-700") }, });
                    (__VLS_ctx.$t(menu.meta.title));
                }
                if (menu.meta.showBadge) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("art-badge art-badge-dual") }, });
                }
                __VLS_nonNullable(__VLS_19.slots).default;
                var __VLS_19;
            }
            __VLS_nonNullable(__VLS_13.slots).default;
            var __VLS_13;
            const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
            /** @type { [typeof __VLS_components.ArtIconButton, ] } */
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ 'onClick': {} }, ...{ class: ("switch-btn size-10") }, icon: ("ri:arrow-left-right-fill"), }));
            const __VLS_28 = __VLS_27({ ...{ 'onClick': {} }, ...{ class: ("switch-btn size-10") }, icon: ("ri:arrow-left-right-fill"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
            let __VLS_32;
            const __VLS_33 = {
                onClick: (__VLS_ctx.toggleDualMenuMode)
            };
            let __VLS_29;
            let __VLS_30;
            var __VLS_31;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("menu-left") }, ...{ class: ((`menu-left-${__VLS_ctx.getMenuTheme.theme} menu-left-${!__VLS_ctx.menuOpen ? 'close' : 'open'}`)) }, ...{ style: (({ background: __VLS_ctx.getMenuTheme.background })) }, });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.menuList.length > 0) }, null, null);
        const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ ...{ style: ((__VLS_ctx.scrollbarStyle)) }, }));
        const __VLS_36 = __VLS_35({ ...{ style: ((__VLS_ctx.scrollbarStyle)) }, }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.navigateToHome) }, ...{ class: ("header") }, ...{ style: (({
                    background: __VLS_ctx.getMenuTheme.background
                })) }, });
        if (!__VLS_ctx.isDualMenu) {
            const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
            /** @type { [typeof __VLS_components.ArtLogo, ] } */
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ ...{ class: ("logo") }, }));
            const __VLS_42 = __VLS_41({ ...{ class: ("logo") }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: (({ 'is-dual-menu-name': __VLS_ctx.isDualMenu })) }, ...{ style: (({
                    color: __VLS_ctx.getMenuTheme.systemNameColor,
                    opacity: !__VLS_ctx.menuOpen ? 0 : 1
                })) }, });
        (__VLS_ctx.AppConfig.systemInfo.name);
        const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElMenu;
        /** @type { [typeof __VLS_components.ElMenu, typeof __VLS_components.ElMenu, ] } */
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ ...{ class: (('el-menu-' + __VLS_ctx.getMenuTheme.theme)) }, collapse: ((!__VLS_ctx.menuOpen)), defaultActive: ((__VLS_ctx.routerPath)), textColor: ((__VLS_ctx.getMenuTheme.textColor)), uniqueOpened: ((__VLS_ctx.uniqueOpened)), backgroundColor: ((__VLS_ctx.getMenuTheme.background)), defaultOpeneds: ((__VLS_ctx.defaultOpenedMenus)), popperClass: ((`menu-left-popper menu-left-${__VLS_ctx.getMenuTheme.theme}-popper`)), showTimeout: ((50)), hideTimeout: ((50)), }));
        const __VLS_48 = __VLS_47({ ...{ class: (('el-menu-' + __VLS_ctx.getMenuTheme.theme)) }, collapse: ((!__VLS_ctx.menuOpen)), defaultActive: ((__VLS_ctx.routerPath)), textColor: ((__VLS_ctx.getMenuTheme.textColor)), uniqueOpened: ((__VLS_ctx.uniqueOpened)), backgroundColor: ((__VLS_ctx.getMenuTheme.background)), defaultOpeneds: ((__VLS_ctx.defaultOpenedMenus)), popperClass: ((`menu-left-popper menu-left-${__VLS_ctx.getMenuTheme.theme}-popper`)), showTimeout: ((50)), hideTimeout: ((50)), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        // @ts-ignore
        [SidebarSubmenu,];
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent(SidebarSubmenu, new SidebarSubmenu({ ...{ 'onClose': {} }, list: ((__VLS_ctx.menuList)), isMobile: ((__VLS_ctx.isMobileMode)), theme: ((__VLS_ctx.getMenuTheme)), }));
        const __VLS_53 = __VLS_52({ ...{ 'onClose': {} }, list: ((__VLS_ctx.menuList)), isMobile: ((__VLS_ctx.isMobileMode)), theme: ((__VLS_ctx.getMenuTheme)), }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        let __VLS_57;
        const __VLS_58 = {
            onClose: (__VLS_ctx.handleMenuClose)
        };
        let __VLS_54;
        let __VLS_55;
        var __VLS_56;
        __VLS_nonNullable(__VLS_51.slots).default;
        var __VLS_51;
        __VLS_nonNullable(__VLS_39.slots).default;
        var __VLS_39;
        if (__VLS_ctx.isDualMenu) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleMenuVisibility) }, ...{ class: ("dual-menu-collapse-btn") }, });
            const __VLS_59 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({ ...{ class: ("text-g-500/70") }, icon: ((__VLS_ctx.menuOpen ? 'ri:arrow-left-wide-fill' : 'ri:arrow-right-wide-fill')), }));
            const __VLS_61 = __VLS_60({ ...{ class: ("text-g-500/70") }, icon: ((__VLS_ctx.menuOpen ? 'ri:arrow-left-wide-fill' : 'ri:arrow-right-wide-fill')), }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleMenuVisibility) }, ...{ class: ("menu-model") }, ...{ style: (({
                    opacity: !__VLS_ctx.menuOpen ? 0 : 1,
                    transform: __VLS_ctx.showMobileModal ? 'scale(1)' : 'scale(0)'
                })) }, });
    }
    __VLS_styleScopedClasses['layout-sidebar'];
    __VLS_styleScopedClasses['no-border'];
    __VLS_styleScopedClasses['dual-menu-left'];
    __VLS_styleScopedClasses['logo'];
    __VLS_styleScopedClasses['box-item'];
    __VLS_styleScopedClasses['is-active'];
    __VLS_styleScopedClasses['menu-icon'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['dark:text-g-800'];
    __VLS_styleScopedClasses['text-md'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['art-badge'];
    __VLS_styleScopedClasses['art-badge-dual'];
    __VLS_styleScopedClasses['switch-btn'];
    __VLS_styleScopedClasses['size-10'];
    __VLS_styleScopedClasses['menu-left'];
    __VLS_styleScopedClasses['header'];
    __VLS_styleScopedClasses['logo'];
    __VLS_styleScopedClasses['is-dual-menu-name'];
    __VLS_styleScopedClasses['dual-menu-collapse-btn'];
    __VLS_styleScopedClasses['text-g-500/70'];
    __VLS_styleScopedClasses['menu-model'];
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
            AppConfig: AppConfig,
            handleMenuJump: handleMenuJump,
            SidebarSubmenu: SidebarSubmenu,
            route: route,
            uniqueOpened: uniqueOpened,
            dualMenuShowText: dualMenuShowText,
            menuOpen: menuOpen,
            getMenuTheme: getMenuTheme,
            defaultOpenedMenus: defaultOpenedMenus,
            isMobileMode: isMobileMode,
            showMobileModal: showMobileModal,
            menuopenwidth: menuopenwidth,
            menuclosewidth: menuclosewidth,
            showLeftMenu: showLeftMenu,
            isDualMenu: isDualMenu,
            firstLevelMenuPath: firstLevelMenuPath,
            routerPath: routerPath,
            firstLevelMenus: firstLevelMenus,
            menuList: menuList,
            scrollbarStyle: scrollbarStyle,
            navigateToHome: navigateToHome,
            toggleMenuVisibility: toggleMenuVisibility,
            handleMenuClose: handleMenuClose,
            toggleDualMenuMode: toggleDualMenuMode,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map