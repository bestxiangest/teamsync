/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useUserStore } from '@/store/modules/user';
import { Search } from '@element-plus/icons-vue';
import { mittBus } from '@/utils/sys';
import { useMenuStore } from '@/store/modules/menu';
import { formatMenuTitle } from '@/utils/router';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtGlobalSearch' });
const router = useRouter();
const userStore = useUserStore();
const { menuList } = storeToRefs(useMenuStore());
const showSearchDialog = ref(false);
const searchVal = ref('');
const searchResult = ref([]);
const historyMaxLength = 10;
const { searchHistory: historyResult } = storeToRefs(userStore);
const searchInput = ref(null);
const highlightedIndex = ref(0);
const historyHIndex = ref(0);
const searchResultScrollbar = ref();
const isKeyboardNavigating = ref(false); // 新增状态：是否正在使用键盘导航
// 生命周期钩子
onMounted(() => {
    mittBus.on('openSearchDialog', openSearchDialog);
    document.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
// 键盘快捷键处理
const handleKeydown = (event) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCommandKey = isMac ? event.metaKey : event.ctrlKey;
    if (isCommandKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        showSearchDialog.value = true;
        focusInput();
    }
    // 当搜索对话框打开时，处理方向键和回车键
    if (showSearchDialog.value) {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            highlightPrevious();
        }
        else if (event.key === 'ArrowDown') {
            event.preventDefault();
            highlightNext();
        }
        else if (event.key === 'Enter') {
            event.preventDefault();
            selectHighlighted();
        }
        else if (event.key === 'Escape') {
            event.preventDefault();
            showSearchDialog.value = false;
        }
    }
};
const focusInput = () => {
    setTimeout(() => {
        searchInput.value?.focus();
    }, 100);
};
// 搜索逻辑
const search = (val) => {
    if (val) {
        searchResult.value = flattenAndFilterMenuItems(menuList.value, val);
    }
    else {
        searchResult.value = [];
    }
};
const flattenAndFilterMenuItems = (items, val) => {
    const lowerVal = val.toLowerCase();
    const result = [];
    const flattenAndMatch = (item) => {
        if (item.meta?.isHide)
            return;
        const lowerItemTitle = formatMenuTitle(item.meta.title).toLowerCase();
        if (item.children && item.children.length > 0) {
            item.children.forEach(flattenAndMatch);
            return;
        }
        if (lowerItemTitle.includes(lowerVal) && item.path) {
            result.push({ ...item, children: undefined });
        }
    };
    items.forEach(flattenAndMatch);
    return result;
};
// 高亮控制并实现滚动条跟随
const highlightPrevious = () => {
    isKeyboardNavigating.value = true;
    if (searchVal.value) {
        highlightedIndex.value =
            (highlightedIndex.value - 1 + searchResult.value.length) % searchResult.value.length;
        scrollToHighlightedItem();
    }
    else {
        historyHIndex.value =
            (historyHIndex.value - 1 + historyResult.value.length) % historyResult.value.length;
        scrollToHighlightedHistoryItem();
    }
    // 延迟重置键盘导航状态，防止立即被 hover 覆盖
    setTimeout(() => {
        isKeyboardNavigating.value = false;
    }, 100);
};
const highlightNext = () => {
    isKeyboardNavigating.value = true;
    if (searchVal.value) {
        highlightedIndex.value = (highlightedIndex.value + 1) % searchResult.value.length;
        scrollToHighlightedItem();
    }
    else {
        historyHIndex.value = (historyHIndex.value + 1) % historyResult.value.length;
        scrollToHighlightedHistoryItem();
    }
    setTimeout(() => {
        isKeyboardNavigating.value = false;
    }, 100);
};
const scrollToHighlightedItem = () => {
    nextTick(() => {
        if (!searchResultScrollbar.value || !searchResult.value.length)
            return;
        const scrollWrapper = searchResultScrollbar.value.wrapRef;
        if (!scrollWrapper)
            return;
        const highlightedElements = scrollWrapper.querySelectorAll('.result .box');
        if (!highlightedElements[highlightedIndex.value])
            return;
        const highlightedElement = highlightedElements[highlightedIndex.value];
        const itemHeight = highlightedElement.offsetHeight;
        const scrollTop = scrollWrapper.scrollTop;
        const containerHeight = scrollWrapper.clientHeight;
        const itemTop = highlightedElement.offsetTop;
        const itemBottom = itemTop + itemHeight;
        if (itemTop < scrollTop) {
            searchResultScrollbar.value.setScrollTop(itemTop);
        }
        else if (itemBottom > scrollTop + containerHeight) {
            searchResultScrollbar.value.setScrollTop(itemBottom - containerHeight);
        }
    });
};
const scrollToHighlightedHistoryItem = () => {
    nextTick(() => {
        if (!searchResultScrollbar.value || !historyResult.value.length)
            return;
        const scrollWrapper = searchResultScrollbar.value.wrapRef;
        if (!scrollWrapper)
            return;
        const historyItems = scrollWrapper.querySelectorAll('.history-result .box');
        if (!historyItems[historyHIndex.value])
            return;
        const highlightedElement = historyItems[historyHIndex.value];
        const itemHeight = highlightedElement.offsetHeight;
        const scrollTop = scrollWrapper.scrollTop;
        const containerHeight = scrollWrapper.clientHeight;
        const itemTop = highlightedElement.offsetTop;
        const itemBottom = itemTop + itemHeight;
        if (itemTop < scrollTop) {
            searchResultScrollbar.value.setScrollTop(itemTop);
        }
        else if (itemBottom > scrollTop + containerHeight) {
            searchResultScrollbar.value.setScrollTop(itemBottom - containerHeight);
        }
    });
};
const selectHighlighted = () => {
    if (searchVal.value && searchResult.value.length) {
        searchGoPage(searchResult.value[highlightedIndex.value]);
    }
    else if (!searchVal.value && historyResult.value.length) {
        searchGoPage(historyResult.value[historyHIndex.value]);
    }
};
const isHighlighted = (index) => {
    return highlightedIndex.value === index;
};
const searchBlur = () => {
    highlightedIndex.value = 0;
};
const searchGoPage = (item) => {
    showSearchDialog.value = false;
    addHistory(item);
    router.push(item.path);
    searchVal.value = '';
    searchResult.value = [];
};
// 历史记录管理
const updateHistory = () => {
    if (Array.isArray(historyResult.value)) {
        userStore.setSearchHistory(historyResult.value);
    }
};
const addHistory = (item) => {
    const hasItemIndex = historyResult.value.findIndex((historyItem) => historyItem.path === item.path);
    if (hasItemIndex !== -1) {
        historyResult.value.splice(hasItemIndex, 1);
    }
    else if (historyResult.value.length >= historyMaxLength) {
        historyResult.value.pop();
    }
    const cleanedItem = { ...item };
    delete cleanedItem.children;
    delete cleanedItem.meta.authList;
    historyResult.value.unshift(cleanedItem);
    updateHistory();
};
const deleteHistory = (index) => {
    historyResult.value.splice(index, 1);
    updateHistory();
};
// 对话框控制
const openSearchDialog = () => {
    showSearchDialog.value = true;
    focusInput();
};
const closeSearchDialog = () => {
    searchVal.value = '';
    searchResult.value = [];
    highlightedIndex.value = 0;
    historyHIndex.value = 0;
};
// 修改 hover 高亮逻辑，只有在非键盘导航时才生效
const highlightOnHover = (index) => {
    if (!isKeyboardNavigating.value && searchVal.value) {
        highlightedIndex.value = index;
    }
};
const highlightOnHoverHistory = (index) => {
    if (!isKeyboardNavigating.value && !searchVal.value) {
        historyHIndex.value = index;
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
    __VLS_styleScopedClasses['layout-search'];
    __VLS_styleScopedClasses['el-input'];
    __VLS_styleScopedClasses['el-input__wrapper'];
    __VLS_styleScopedClasses['search-modal'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-search") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.showSearchDialog)), width: ("600"), showClose: ((false)), lockScroll: ((false)), modalClass: ("search-modal"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.showSearchDialog)), width: ("600"), showClose: ((false)), lockScroll: ((false)), modalClass: ("search-modal"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onClose: (__VLS_ctx.closeSearchDialog)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onInput': {} }, ...{ 'onBlur': {} }, modelValue: ((__VLS_ctx.searchVal)), placeholder: ((__VLS_ctx.$t('search.placeholder'))), ref: ("searchInput"), prefixIcon: ((__VLS_ctx.Search)), ...{ class: ("h-12") }, }));
    const __VLS_10 = __VLS_9({ ...{ 'onInput': {} }, ...{ 'onBlur': {} }, modelValue: ((__VLS_ctx.searchVal)), placeholder: ((__VLS_ctx.$t('search.placeholder'))), ref: ("searchInput"), prefixIcon: ((__VLS_ctx.Search)), ...{ class: ("h-12") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    // @ts-ignore navigation for `const searchInput = ref()`
    __VLS_ctx.searchInput;
    var __VLS_14 = {};
    let __VLS_15;
    const __VLS_16 = {
        onInput: (__VLS_ctx.search)
    };
    const __VLS_17 = {
        onBlur: (__VLS_ctx.searchBlur)
    };
    let __VLS_11;
    let __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { suffix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_13.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("h-4.5 flex-cc rounded border border-g-300 dark:!bg-g-200/50 !bg-box px-1.5 text-g-500") }, });
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ icon: ("fluent:arrow-enter-left-20-filled"), }));
        const __VLS_20 = __VLS_19({ icon: ("fluent:arrow-enter-left-20-filled"), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    }
    var __VLS_13;
    const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ ...{ class: ("mt-5") }, maxHeight: ("370px"), ref: ("searchResultScrollbar"), always: (true), }));
    const __VLS_26 = __VLS_25({ ...{ class: ("mt-5") }, maxHeight: ("370px"), ref: ("searchResultScrollbar"), always: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore navigation for `const searchResultScrollbar = ref()`
    __VLS_ctx.searchResultScrollbar;
    var __VLS_30 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("result w-full") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.searchResult.length) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.searchResult))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box !mt-0 c-p text-base leading-none") }, key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.searchGoPage(item);
                } }, ...{ onMouseenter: (...[$event]) => {
                    __VLS_ctx.highlightOnHover(index);
                } }, ...{ class: ("mt-2 h-12 flex-cb rounded-custom-sm bg-g-200/80 px-4 text-sm text-g-700") }, ...{ class: ((__VLS_ctx.isHighlighted(index) ? 'highlighted !bg-theme/70 !text-white' : '')) }, });
        (__VLS_ctx.formatMenuTitle(item.meta.title));
        const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ icon: ("fluent:arrow-enter-left-20-filled"), }));
        const __VLS_33 = __VLS_32({ icon: ("fluent:arrow-enter-left-20-filled"), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.isHighlighted(index)) }, null, null);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (!__VLS_ctx.searchVal && __VLS_ctx.searchResult.length === 0 && __VLS_ctx.historyResult.length > 0) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-xs text-g-500") }, });
    (__VLS_ctx.$t('search.historyTitle'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-1.5 w-full") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.historyResult))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.searchGoPage(item);
                } }, ...{ onMouseenter: (...[$event]) => {
                    __VLS_ctx.highlightOnHoverHistory(index);
                } }, ...{ class: ("box mt-2 h-12 c-p flex-cb rounded-custom-sm bg-g-200/80 px-4 text-sm text-g-800") }, key: ((index)), ...{ class: ((__VLS_ctx.historyHIndex === index
                    ? 'highlighted !bg-theme/70 !text-white [&_.selected-icon]:!text-white'
                    : '')) }, });
        (__VLS_ctx.formatMenuTitle(item.meta.title));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.deleteHistory(index);
                } }, ...{ class: ("size-5 selected-icon select-none rounded-full text-g-500 flex-cc c-p") }, });
        const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ icon: ("ri:close-large-fill"), ...{ class: ("text-xs") }, }));
        const __VLS_39 = __VLS_38({ icon: ("ri:close-large-fill"), ...{ class: ("text-xs") }, }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    }
    __VLS_nonNullable(__VLS_29.slots).default;
    var __VLS_29;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer box-border flex-c border-t-d pt-4.5 pb-1") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc") }, });
        const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ icon: ("fluent:arrow-enter-left-20-filled"), ...{ class: ("keyboard") }, }));
        const __VLS_45 = __VLS_44({ icon: ("fluent:arrow-enter-left-20-filled"), ...{ class: ("keyboard") }, }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("mr-3.5 text-xs text-g-700") }, });
        (__VLS_ctx.$t('search.selectKeydown'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c") }, });
        const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ icon: ("ri:arrow-up-wide-fill"), ...{ class: ("keyboard") }, }));
        const __VLS_51 = __VLS_50({ icon: ("ri:arrow-up-wide-fill"), ...{ class: ("keyboard") }, }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ icon: ("ri:arrow-down-wide-fill"), ...{ class: ("keyboard") }, }));
        const __VLS_57 = __VLS_56({ icon: ("ri:arrow-down-wide-fill"), ...{ class: ("keyboard") }, }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("mr-3.5 text-xs text-g-700") }, });
        (__VLS_ctx.$t('search.switchKeydown'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("keyboard !w-8 flex-cc") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-[10px] font-medium") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("mr-3.5 text-xs text-g-700") }, });
        (__VLS_ctx.$t('search.exitKeydown'));
    }
    var __VLS_5;
    __VLS_styleScopedClasses['layout-search'];
    __VLS_styleScopedClasses['h-12'];
    __VLS_styleScopedClasses['h-4.5'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['dark:!bg-g-200/50'];
    __VLS_styleScopedClasses['!bg-box'];
    __VLS_styleScopedClasses['px-1.5'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['result'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['box'];
    __VLS_styleScopedClasses['!mt-0'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['leading-none'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['h-12'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['rounded-custom-sm'];
    __VLS_styleScopedClasses['bg-g-200/80'];
    __VLS_styleScopedClasses['px-4'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['mt-1.5'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['box'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['h-12'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['rounded-custom-sm'];
    __VLS_styleScopedClasses['bg-g-200/80'];
    __VLS_styleScopedClasses['px-4'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['size-5'];
    __VLS_styleScopedClasses['selected-icon'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['dialog-footer'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['border-t-d'];
    __VLS_styleScopedClasses['pt-4.5'];
    __VLS_styleScopedClasses['pb-1'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['keyboard'];
    __VLS_styleScopedClasses['mr-3.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['keyboard'];
    __VLS_styleScopedClasses['keyboard'];
    __VLS_styleScopedClasses['mr-3.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['keyboard'];
    __VLS_styleScopedClasses['!w-8'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['text-[10px]'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mr-3.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-700'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "searchInput": __VLS_14,
        "searchResultScrollbar": __VLS_30,
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
            Search: Search,
            formatMenuTitle: formatMenuTitle,
            showSearchDialog: showSearchDialog,
            searchVal: searchVal,
            searchResult: searchResult,
            historyResult: historyResult,
            searchInput: searchInput,
            historyHIndex: historyHIndex,
            searchResultScrollbar: searchResultScrollbar,
            search: search,
            isHighlighted: isHighlighted,
            searchBlur: searchBlur,
            searchGoPage: searchGoPage,
            deleteHistory: deleteHistory,
            closeSearchDialog: closeSearchDialog,
            highlightOnHover: highlightOnHover,
            highlightOnHoverHistory: highlightOnHoverHistory,
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
//# sourceMappingURL=index.vue.js.map