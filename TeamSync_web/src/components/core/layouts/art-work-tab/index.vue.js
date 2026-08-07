/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useWorktabStore } from '@/store/modules/worktab';
import { useUserStore } from '@/store/modules/user';
import { formatMenuTitle } from '@/utils/router';
import { useSettingStore } from '@/store/modules/setting';
import { useCommon } from '@/hooks/core/useCommon';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtWorkTab' });
// 基础设置
const { t } = useI18n();
const store = useWorktabStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { currentRoute } = router;
const settingStore = useSettingStore();
const { tabStyle, showWorkTab } = storeToRefs(settingStore);
// DOM 引用
const scrollRef = ref(null);
const tabsRef = ref(null);
const menuRef = ref();
// 状态管理
const scrollState = ref({
    translateX: 0,
    transition: ''
});
const touchState = ref({
    startX: 0,
    currentX: 0
});
const clickedPath = ref('');
// 计算属性
const list = computed(() => store.opened);
const activeTab = computed(() => currentRoute.value.path);
const activeTabIndex = computed(() => list.value.findIndex((tab) => tab.path === activeTab.value));
// 右键菜单逻辑
const useContextMenu = () => {
    const getClickedTabInfo = () => {
        const clickedIndex = list.value.findIndex((tab) => tab.path === clickedPath.value);
        const currentTab = list.value[clickedIndex];
        return {
            clickedIndex,
            currentTab,
            isLastTab: clickedIndex === list.value.length - 1,
            isOneTab: list.value.length === 1,
            isCurrentTab: clickedPath.value === activeTab.value
        };
    };
    // 检查标签页是否固定
    const checkTabsFixedStatus = (clickedIndex) => {
        const leftTabs = list.value.slice(0, clickedIndex);
        const rightTabs = list.value.slice(clickedIndex + 1);
        const otherTabs = list.value.filter((_, index) => index !== clickedIndex);
        return {
            areAllLeftTabsFixed: leftTabs.length > 0 && leftTabs.every((tab) => tab.fixedTab),
            areAllRightTabsFixed: rightTabs.length > 0 && rightTabs.every((tab) => tab.fixedTab),
            areAllOtherTabsFixed: otherTabs.length > 0 && otherTabs.every((tab) => tab.fixedTab),
            areAllTabsFixed: list.value.every((tab) => tab.fixedTab)
        };
    };
    // 右键菜单选项
    const menuItems = computed(() => {
        const { clickedIndex, currentTab, isLastTab, isOneTab, isCurrentTab } = getClickedTabInfo();
        const fixedStatus = checkTabsFixedStatus(clickedIndex);
        return [
            {
                key: 'refresh',
                label: t('worktab.btn.refresh'),
                icon: 'ri:refresh-line',
                disabled: !isCurrentTab
            },
            {
                key: 'fixed',
                label: currentTab?.fixedTab ? t('worktab.btn.unfixed') : t('worktab.btn.fixed'),
                icon: 'ri:pushpin-2-line',
                disabled: false,
                showLine: true
            },
            {
                key: 'left',
                label: t('worktab.btn.closeLeft'),
                icon: 'ri:arrow-left-s-line',
                disabled: clickedIndex === 0 || fixedStatus.areAllLeftTabsFixed
            },
            {
                key: 'right',
                label: t('worktab.btn.closeRight'),
                icon: 'ri:arrow-right-s-line',
                disabled: isLastTab || fixedStatus.areAllRightTabsFixed
            },
            {
                key: 'other',
                label: t('worktab.btn.closeOther'),
                icon: 'ri:close-fill',
                disabled: isOneTab || fixedStatus.areAllOtherTabsFixed
            },
            {
                key: 'all',
                label: t('worktab.btn.closeAll'),
                icon: 'ri:close-circle-line',
                disabled: isOneTab || fixedStatus.areAllTabsFixed
            }
        ];
    });
    return { menuItems };
};
// 滚动逻辑
const useScrolling = () => {
    const setTransition = () => {
        scrollState.value.transition = 'transform 0.5s cubic-bezier(0.15, 0, 0.15, 1)';
        setTimeout(() => {
            scrollState.value.transition = '';
        }, 250);
    };
    const getCurrentTabElement = () => {
        return document.getElementById(`scroll-li-${activeTabIndex.value}`);
    };
    const calculateScrollPosition = () => {
        if (!scrollRef.value || !tabsRef.value)
            return;
        const scrollWidth = scrollRef.value.offsetWidth;
        const ulWidth = tabsRef.value.offsetWidth;
        const curTabEl = getCurrentTabElement();
        if (!curTabEl)
            return;
        const { offsetLeft, clientWidth } = curTabEl;
        const curTabRight = offsetLeft + clientWidth;
        const targetLeft = scrollWidth - curTabRight;
        return {
            scrollWidth,
            ulWidth,
            offsetLeft,
            clientWidth,
            curTabRight,
            targetLeft
        };
    };
    const autoPositionTab = () => {
        const positions = calculateScrollPosition();
        if (!positions)
            return;
        const { scrollWidth, ulWidth, offsetLeft, curTabRight, targetLeft } = positions;
        if ((offsetLeft > Math.abs(scrollState.value.translateX) && curTabRight <= scrollWidth) ||
            (scrollState.value.translateX < targetLeft && targetLeft < 0)) {
            return;
        }
        requestAnimationFrame(() => {
            if (curTabRight > scrollWidth) {
                scrollState.value.translateX = Math.max(targetLeft - 6, scrollWidth - ulWidth);
            }
            else if (offsetLeft < Math.abs(scrollState.value.translateX)) {
                scrollState.value.translateX = -offsetLeft;
            }
        });
    };
    const adjustPositionAfterClose = () => {
        const positions = calculateScrollPosition();
        if (!positions)
            return;
        const { scrollWidth, ulWidth, offsetLeft, clientWidth } = positions;
        const curTabLeft = offsetLeft + clientWidth;
        requestAnimationFrame(() => {
            scrollState.value.translateX = curTabLeft > scrollWidth ? scrollWidth - ulWidth : 0;
        });
    };
    return {
        setTransition,
        autoPositionTab,
        adjustPositionAfterClose
    };
};
// 事件处理逻辑
const useEventHandlers = () => {
    const { setTransition, adjustPositionAfterClose } = useScrolling();
    const handleWheelScroll = (event) => {
        if (!scrollRef.value || !tabsRef.value)
            return;
        event.preventDefault();
        if (tabsRef.value.offsetWidth <= scrollRef.value.offsetWidth)
            return;
        const xMax = 0;
        const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth;
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        scrollState.value.translateX = Math.min(Math.max(scrollState.value.translateX - delta, xMin), xMax);
    };
    const handleTouchStart = (event) => {
        touchState.value.startX = event.touches[0].clientX;
    };
    const handleTouchMove = (event) => {
        if (!scrollRef.value || !tabsRef.value)
            return;
        touchState.value.currentX = event.touches[0].clientX;
        const deltaX = touchState.value.currentX - touchState.value.startX;
        const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth;
        scrollState.value.translateX = Math.min(Math.max(scrollState.value.translateX + deltaX, xMin), 0);
        touchState.value.startX = touchState.value.currentX;
    };
    const handleTouchEnd = () => {
        setTransition();
    };
    const setupEventListeners = () => {
        if (tabsRef.value) {
            tabsRef.value.addEventListener('wheel', handleWheelScroll, { passive: false });
            tabsRef.value.addEventListener('touchstart', handleTouchStart, { passive: true });
            tabsRef.value.addEventListener('touchmove', handleTouchMove, { passive: true });
            tabsRef.value.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
    };
    const cleanupEventListeners = () => {
        if (tabsRef.value) {
            tabsRef.value.removeEventListener('wheel', handleWheelScroll);
            tabsRef.value.removeEventListener('touchstart', handleTouchStart);
            tabsRef.value.removeEventListener('touchmove', handleTouchMove);
            tabsRef.value.removeEventListener('touchend', handleTouchEnd);
        }
    };
    return {
        setupEventListeners,
        cleanupEventListeners,
        adjustPositionAfterClose
    };
};
// 标签页操作逻辑
const useTabOperations = (adjustPositionAfterClose) => {
    const clickTab = (item) => {
        router.push({
            path: item.path,
            query: item.query
        });
    };
    const closeWorktab = (type, tabPath) => {
        const path = typeof tabPath === 'string' ? tabPath : route.path;
        const closeActions = {
            current: () => store.removeTab(path),
            left: () => store.removeLeft(path),
            right: () => store.removeRight(path),
            other: () => store.removeOthers(path),
            all: () => store.removeAll()
        };
        closeActions[type]?.();
        setTimeout(() => {
            adjustPositionAfterClose();
        }, 100);
    };
    const showMenu = (e, path) => {
        clickedPath.value = path || '';
        menuRef.value?.show(e);
        e.preventDefault();
        e.stopPropagation();
    };
    const handleSelect = (item) => {
        const { key } = item;
        if (key === 'refresh') {
            useCommon().refresh();
            return;
        }
        if (key === 'fixed') {
            useWorktabStore().toggleFixedTab(clickedPath.value);
            return;
        }
        const activeIndex = list.value.findIndex((tab) => tab.path === activeTab.value);
        const clickedIndex = list.value.findIndex((tab) => tab.path === clickedPath.value);
        const navigationRules = {
            left: activeIndex < clickedIndex,
            right: activeIndex > clickedIndex,
            other: true
        };
        const shouldNavigate = navigationRules[key];
        if (shouldNavigate) {
            router.push(clickedPath.value);
        }
        closeWorktab(key, clickedPath.value);
    };
    return {
        clickTab,
        closeWorktab,
        showMenu,
        handleSelect
    };
};
// 组合所有逻辑
const { menuItems } = useContextMenu();
const { setTransition, autoPositionTab } = useScrolling();
const { setupEventListeners, cleanupEventListeners, adjustPositionAfterClose } = useEventHandlers();
const { clickTab, closeWorktab, showMenu, handleSelect } = useTabOperations(adjustPositionAfterClose);
// 生命周期
onMounted(() => {
    setupEventListeners();
    autoPositionTab();
});
onUnmounted(() => {
    cleanupEventListeners();
});
// 监听器
watch(() => currentRoute.value, () => {
    setTransition();
    autoPositionTab();
});
watch(() => userStore.language, () => {
    scrollState.value.translateX = 0;
    nextTick(() => {
        autoPositionTab();
    });
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
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['dark'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['dark'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['dark'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['line'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['line'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['line'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['line'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['google-tab'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    if (__VLS_ctx.showWorkTab) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-border flex-b w-full px-5 mb-3 select-none max-sm:px-[15px]") }, ...{ class: (([
                    __VLS_ctx.tabStyle === 'tab-card' ? 'py-1 border-b border-[var(--art-card-border)]' : '',
                    __VLS_ctx.tabStyle === 'tab-google' ? 'pt-1 pb-0 border-b border-[var(--art-card-border)]' : ''
                ])) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full overflow-hidden") }, ref: ("scrollRef"), });
        // @ts-ignore navigation for `const scrollRef = ref()`
        __VLS_ctx.scrollRef;
        __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("float-left whitespace-nowrap !bg-transparent flex") }, ...{ class: (([__VLS_ctx.tabStyle === 'tab-google' ? 'pl-1' : ''])) }, ref: ("tabsRef"), ...{ style: (({
                    transform: `translateX(${__VLS_ctx.scrollState.translateX}px)`,
                    transition: `${__VLS_ctx.scrollState.transition}`
                })) }, });
        // @ts-ignore navigation for `const tabsRef = ref()`
        __VLS_ctx.tabsRef;
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.showWorkTab)))
                            return;
                        __VLS_ctx.clickTab(item);
                    } }, ...{ onContextmenu: ((e) => __VLS_ctx.showMenu(e, item.path)) }, ...{ class: ("art-card-xs inline-flex flex-cc h-8 mr-1.5 text-xs c-p hover:text-theme group") }, ...{ class: (([
                        item.path === __VLS_ctx.activeTab ? 'activ-tab !text-theme' : 'text-g-600 dark:text-g-800',
                        __VLS_ctx.tabStyle === 'tab-google' ? 'google-tab relative !h-8 !leading-8 !border-none' : ''
                    ])) }, ...{ style: (({
                        padding: item.fixedTab ? '0 10px' : '0 8px 0 12px',
                        borderRadius: __VLS_ctx.tabStyle === 'tab-google'
                            ? 'calc(var(--custom-radius) / 2.5 + 4px) !important'
                            : 'calc(var(--custom-radius) / 2.5 + 2px) !important'
                    })) }, key: ((item.path)), ref: ((item.path)), id: ((`scroll-li-${index}`)), });
            const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ((item.icon)), ...{ class: ("text-base mr-1 group-hover:text-theme") }, ...{ class: ((item.path === __VLS_ctx.activeTab ? 'text-theme' : 'text-g-600')) }, }));
            const __VLS_2 = __VLS_1({ icon: ((item.icon)), ...{ class: ("text-base mr-1 group-hover:text-theme") }, ...{ class: ((item.path === __VLS_ctx.activeTab ? 'text-theme' : 'text-g-600')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (item.icon) }, null, null);
            (item.customTitle || __VLS_ctx.formatMenuTitle(item.title));
            if (__VLS_ctx.list.length > 1 && !item.fixedTab) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ onClick: (...[$event]) => {
                            if (!((__VLS_ctx.showWorkTab)))
                                return;
                            if (!((__VLS_ctx.list.length > 1 && !item.fixedTab)))
                                return;
                            __VLS_ctx.closeWorktab('current', item.path);
                        } }, ...{ class: ("inline-flex flex-cc relative ml-0.5 p-1 rounded-full tad-200 hover:bg-g-200") }, });
                const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ("ri:close-large-fill"), ...{ class: ("text-[10px] text-g-600") }, }));
                const __VLS_8 = __VLS_7({ icon: ("ri:close-large-fill"), ...{ class: ("text-[10px] text-g-600") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            }
            if (__VLS_ctx.tabStyle === 'tab-google') {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("line absolute top-0 bottom-0 left-0 w-px h-4 my-auto bg-g-400 transition-opacity duration-150") }, });
            }
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: ((e) => __VLS_ctx.showMenu(e, __VLS_ctx.activeTab)) }, ...{ class: ("flex-cc art-card-xs relative top-0 size-8 leading-8 text-center c-p tad-200 hover:!bg-hover-color") }, ...{ style: (({
                    borderRadius: 'calc(var(--custom-radius) / 2.5 + 0px)',
                    marginTop: __VLS_ctx.tabStyle === 'tab-google' ? '-2px' : ''
                })) }, });
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ icon: ("iconamoon:arrow-down-2-thin"), ...{ class: ("text-2xl text-g-700") }, }));
        const __VLS_14 = __VLS_13({ icon: ("iconamoon:arrow-down-2-thin"), ...{ class: ("text-2xl text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ArtMenuRight;
        /** @type { [typeof __VLS_components.ArtMenuRight, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onSelect': {} }, ref: ("menuRef"), menuItems: ((__VLS_ctx.menuItems)), menuWidth: ((140)), borderRadius: ((10)), }));
        const __VLS_20 = __VLS_19({ ...{ 'onSelect': {} }, ref: ("menuRef"), menuItems: ((__VLS_ctx.menuItems)), menuWidth: ((140)), borderRadius: ((10)), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        // @ts-ignore navigation for `const menuRef = ref()`
        __VLS_ctx.menuRef;
        var __VLS_24 = {};
        let __VLS_25;
        const __VLS_26 = {
            onSelect: (__VLS_ctx.handleSelect)
        };
        let __VLS_21;
        let __VLS_22;
        var __VLS_23;
    }
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['px-5'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['max-sm:px-[15px]'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['float-left'];
    __VLS_styleScopedClasses['whitespace-nowrap'];
    __VLS_styleScopedClasses['!bg-transparent'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['art-card-xs'];
    __VLS_styleScopedClasses['inline-flex'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['h-8'];
    __VLS_styleScopedClasses['mr-1.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['hover:text-theme'];
    __VLS_styleScopedClasses['group'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['group-hover:text-theme'];
    __VLS_styleScopedClasses['inline-flex'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['ml-0.5'];
    __VLS_styleScopedClasses['p-1'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['tad-200'];
    __VLS_styleScopedClasses['hover:bg-g-200'];
    __VLS_styleScopedClasses['text-[10px]'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['line'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['bottom-0'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['w-px'];
    __VLS_styleScopedClasses['h-4'];
    __VLS_styleScopedClasses['my-auto'];
    __VLS_styleScopedClasses['bg-g-400'];
    __VLS_styleScopedClasses['transition-opacity'];
    __VLS_styleScopedClasses['duration-150'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['art-card-xs'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['size-8'];
    __VLS_styleScopedClasses['leading-8'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['tad-200'];
    __VLS_styleScopedClasses['hover:!bg-hover-color'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['text-g-700'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "scrollRef": __VLS_nativeElements['div'],
        "tabsRef": __VLS_nativeElements['ul'],
        "menuRef": __VLS_24,
    };
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
            formatMenuTitle: formatMenuTitle,
            tabStyle: tabStyle,
            showWorkTab: showWorkTab,
            scrollRef: scrollRef,
            tabsRef: tabsRef,
            menuRef: menuRef,
            scrollState: scrollState,
            list: list,
            activeTab: activeTab,
            menuItems: menuItems,
            clickTab: clickTab,
            closeWorktab: closeWorktab,
            showMenu: showMenu,
            handleSelect: handleSelect,
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