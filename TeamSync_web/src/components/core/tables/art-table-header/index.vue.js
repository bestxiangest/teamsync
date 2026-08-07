/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { TableSizeEnum } from '@/enums/formEnum';
import { useTableStore } from '@/store/modules/table';
import { VueDraggable } from 'vue-draggable-plus';
import { useI18n } from 'vue-i18n';
import { ElScrollbar } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtTableHeader' });
const { t } = useI18n();
const props = withDefaults(defineProps(), {
    showZebra: true,
    showBorder: true,
    showHeaderBackground: true,
    fullClass: 'art-page-view',
    layout: 'search,refresh,size,fullscreen,columns,settings',
    showSearchBar: undefined
});
const columns = defineModel('columns', {
    required: false,
    default: () => []
});
const emit = defineEmits();
/**
 * 获取列的显示状态
 * 优先使用 visible 字段，如果不存在则使用 checked 字段
 */
const getColumnVisibility = (col) => {
    if (col.visible !== undefined) {
        return col.visible;
    }
    return col.checked ?? true;
};
/**
 * 更新列的显示状态
 * 同时更新 checked 和 visible 字段以保持兼容性
 */
const updateColumnVisibility = (col, value) => {
    const boolValue = !!value;
    col.checked = boolValue;
    col.visible = boolValue;
};
/** 表格大小选项配置 */
const tableSizeOptions = [
    { value: TableSizeEnum.SMALL, label: t('table.sizeOptions.small') },
    { value: TableSizeEnum.DEFAULT, label: t('table.sizeOptions.default') },
    { value: TableSizeEnum.LARGE, label: t('table.sizeOptions.large') }
];
const tableStore = useTableStore();
const { tableSize, isZebra, isBorder, isHeaderBackground } = storeToRefs(tableStore);
/** 解析 layout 属性，转换为数组 */
const layoutItems = computed(() => {
    return props.layout.split(',').map((item) => item.trim());
});
/**
 * 检查组件是否应该显示
 * @param componentName 组件名称
 * @returns 是否显示
 */
const shouldShow = (componentName) => {
    return layoutItems.value.includes(componentName);
};
/**
 * 拖拽移动事件处理 - 防止固定列位置改变
 * @param evt move事件对象
 * @returns 是否允许移动
 */
const checkColumnMove = (event) => {
    // 拖拽进入的目标 DOM 元素
    const toElement = event.related;
    // 如果目标位置是 fixed 列，则不允许移动
    if (toElement && toElement.classList.contains('fixed-column')) {
        return false;
    }
    return true;
};
/** 搜索事件处理 */
const search = () => {
    // 切换搜索栏显示状态
    emit('update:showSearchBar', !props.showSearchBar);
    emit('search');
};
/** 刷新事件处理 */
const refresh = () => {
    isManualRefresh.value = true;
    emit('refresh');
};
/**
 * 表格大小变化处理
 * @param command 表格大小枚举值
 */
const handleTableSizeChange = (command) => {
    useTableStore().setTableSize(command);
};
/** 是否手动点击刷新 */
const isManualRefresh = ref(false);
/** 加载中 */
const isFullScreen = ref(false);
/** 保存原始的 overflow 样式，用于退出全屏时恢复 */
const originalOverflow = ref('');
/**
 * 切换全屏状态
 * 进入全屏时会隐藏页面滚动条，退出时恢复原状态
 */
const toggleFullScreen = () => {
    const el = document.querySelector(`.${props.fullClass}`);
    if (!el)
        return;
    isFullScreen.value = !isFullScreen.value;
    if (isFullScreen.value) {
        // 进入全屏：保存原始样式并隐藏滚动条
        originalOverflow.value = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        el.classList.add('el-full-screen');
        tableStore.setIsFullScreen(true);
    }
    else {
        // 退出全屏：恢复原始样式
        document.body.style.overflow = originalOverflow.value;
        el.classList.remove('el-full-screen');
        tableStore.setIsFullScreen(false);
    }
};
/**
 * ESC键退出全屏的事件处理器
 * 需要保存引用以便在组件卸载时正确移除监听器
 */
const handleEscapeKey = (e) => {
    if (e.key === 'Escape' && isFullScreen.value) {
        toggleFullScreen();
    }
};
/** 组件挂载时注册全局事件监听器 */
onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey);
});
/** 组件卸载时清理资源 */
onUnmounted(() => {
    // 移除事件监听器
    document.removeEventListener('keydown', handleEscapeKey);
    // 如果组件在全屏状态下被卸载，恢复页面滚动状态
    if (isFullScreen.value) {
        document.body.style.overflow = originalOverflow.value;
        const el = document.querySelector(`.${props.fullClass}`);
        if (el) {
            el.classList.remove('el-full-screen');
        }
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    showZebra: true,
    showBorder: true,
    showHeaderBackground: true,
    fullClass: 'art-page-view',
    layout: 'search,refresh,size,fullscreen,columns,settings',
    showSearchBar: undefined
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
;
let __VLS_functionalComponentProps;
const __VLS_defaults = {
    columns: () => [],
};
const __VLS_modelEmit = defineEmits();
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cb max-md:!block") }, id: ("art-table-header"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-wrap") }, });
    var __VLS_0 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c md:justify-end max-md:mt-3 max-sm:!hidden") }, });
    if (__VLS_ctx.showSearchBar != null) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.search) }, ...{ class: ("button") }, ...{ class: ((__VLS_ctx.showSearchBar ? 'active !bg-theme hover:!bg-theme/80' : '')) }, });
        const __VLS_1 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_2 = __VLS_asFunctionalComponent(__VLS_1, new __VLS_1({ icon: ("ri:search-line"), ...{ class: ((__VLS_ctx.showSearchBar ? 'text-white' : 'text-g-700')) }, }));
        const __VLS_3 = __VLS_2({ icon: ("ri:search-line"), ...{ class: ((__VLS_ctx.showSearchBar ? 'text-white' : 'text-g-700')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_2));
    }
    if (__VLS_ctx.shouldShow('refresh')) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.refresh) }, ...{ class: ("button") }, ...{ class: (({ loading: __VLS_ctx.loading && __VLS_ctx.isManualRefresh })) }, });
        const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ icon: ("ri:refresh-line"), ...{ class: ((__VLS_ctx.loading && __VLS_ctx.isManualRefresh ? 'animate-spin text-g-600' : '')) }, }));
        const __VLS_9 = __VLS_8({ icon: ("ri:refresh-line"), ...{ class: ((__VLS_ctx.loading && __VLS_ctx.isManualRefresh ? 'animate-spin text-g-600' : '')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    }
    if (__VLS_ctx.shouldShow('size')) {
        const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ ...{ 'onCommand': {} }, }));
        const __VLS_15 = __VLS_14({ ...{ 'onCommand': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_19;
        const __VLS_20 = {
            onCommand: (__VLS_ctx.handleTableSizeChange)
        };
        let __VLS_16;
        let __VLS_17;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("button") }, });
        const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ icon: ("ri:arrow-up-down-fill"), }));
        const __VLS_23 = __VLS_22({ icon: ("ri:arrow-up-down-fill"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_18.slots);
            const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({}));
            const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
            for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableSizeOptions))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((item.value)), ...{ class: ("table-size-btn-item [&_.el-dropdown-menu__item]:!mb-[3px] last:[&_.el-dropdown-menu__item]:!mb-0") }, });
                const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ key: ((item.value)), command: ((item.value)), ...{ class: ((__VLS_ctx.tableSize === item.value ? '!bg-g-300/55' : '')) }, }));
                const __VLS_35 = __VLS_34({ key: ((item.value)), command: ((item.value)), ...{ class: ((__VLS_ctx.tableSize === item.value ? '!bg-g-300/55' : '')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_34));
                (item.label);
                __VLS_nonNullable(__VLS_38.slots).default;
                var __VLS_38;
            }
            __VLS_nonNullable(__VLS_32.slots).default;
            var __VLS_32;
        }
        var __VLS_18;
    }
    if (__VLS_ctx.shouldShow('fullscreen')) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleFullScreen) }, ...{ class: ("button") }, });
        const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ icon: ((__VLS_ctx.isFullScreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line')), }));
        const __VLS_41 = __VLS_40({ icon: ((__VLS_ctx.isFullScreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line')), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    }
    if (__VLS_ctx.shouldShow('columns')) {
        const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
        /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ placement: ("bottom"), trigger: ("click"), }));
        const __VLS_47 = __VLS_46({ placement: ("bottom"), trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_50.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("button") }, });
            const __VLS_51 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({ icon: ("ri:align-right"), }));
            const __VLS_53 = __VLS_52({ icon: ("ri:align-right"), }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_57 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ maxHeight: ("380px"), }));
        const __VLS_59 = __VLS_58({ maxHeight: ("380px"), }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        const __VLS_63 = __VLS_resolvedLocalAndGlobalComponents.VueDraggable;
        /** @type { [typeof __VLS_components.VueDraggable, typeof __VLS_components.VueDraggable, ] } */
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({ ...{ 'onMove': {} }, modelValue: ((__VLS_ctx.columns)), disabled: ((false)), filter: (".fixed-column"), preventOnFilter: ((false)), }));
        const __VLS_65 = __VLS_64({ ...{ 'onMove': {} }, modelValue: ((__VLS_ctx.columns)), disabled: ((false)), filter: (".fixed-column"), preventOnFilter: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        let __VLS_69;
        const __VLS_70 = {
            onMove: (__VLS_ctx.checkColumnMove)
        };
        let __VLS_66;
        let __VLS_67;
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.columns))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((item.prop || item.type)), ...{ class: ("column-option flex-c") }, ...{ class: (({ 'fixed-column': item.fixed })) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("drag-icon mr-2 h-4.5 flex-cc text-g-500") }, ...{ class: ((item.fixed ? 'cursor-default text-g-300' : 'cursor-move')) }, });
            const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ icon: ((item.fixed ? 'ri:unpin-line' : 'ri:drag-move-2-fill')), ...{ class: ("text-base") }, }));
            const __VLS_73 = __VLS_72({ icon: ((item.fixed ? 'ri:unpin-line' : 'ri:drag-move-2-fill')), ...{ class: ("text-base") }, }, ...__VLS_functionalComponentArgsRest(__VLS_72));
            const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({ ...{ 'onUpdate:modelValue': {} }, modelValue: ((__VLS_ctx.getColumnVisibility(item))), disabled: ((item.disabled)), ...{ class: ("flex-1 min-w-0 [&_.el-checkbox__label]:overflow-hidden [&_.el-checkbox__label]:text-ellipsis [&_.el-checkbox__label]:whitespace-nowrap") }, }));
            const __VLS_79 = __VLS_78({ ...{ 'onUpdate:modelValue': {} }, modelValue: ((__VLS_ctx.getColumnVisibility(item))), disabled: ((item.disabled)), ...{ class: ("flex-1 min-w-0 [&_.el-checkbox__label]:overflow-hidden [&_.el-checkbox__label]:text-ellipsis [&_.el-checkbox__label]:whitespace-nowrap") }, }, ...__VLS_functionalComponentArgsRest(__VLS_78));
            let __VLS_83;
            const __VLS_84 = {
                'onUpdate:modelValue': ((val) => __VLS_ctx.updateColumnVisibility(item, val))
            };
            let __VLS_80;
            let __VLS_81;
            (item.label || (item.type === 'selection' ? __VLS_ctx.t('table.selection') : ''));
            __VLS_nonNullable(__VLS_82.slots).default;
            var __VLS_82;
        }
        __VLS_nonNullable(__VLS_68.slots).default;
        var __VLS_68;
        __VLS_nonNullable(__VLS_62.slots).default;
        var __VLS_62;
        var __VLS_50;
    }
    if (__VLS_ctx.shouldShow('settings')) {
        const __VLS_85 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
        /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({ placement: ("bottom"), trigger: ("click"), }));
        const __VLS_87 = __VLS_86({ placement: ("bottom"), trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_90.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("button") }, });
            const __VLS_91 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({ icon: ("ri:settings-line"), }));
            const __VLS_93 = __VLS_92({ icon: ("ri:settings-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_92));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (__VLS_ctx.showZebra) {
            const __VLS_97 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({ modelValue: ((__VLS_ctx.isZebra)), value: ((true)), }));
            const __VLS_99 = __VLS_98({ modelValue: ((__VLS_ctx.isZebra)), value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_98));
            (__VLS_ctx.t('table.zebra'));
            __VLS_nonNullable(__VLS_102.slots).default;
            var __VLS_102;
        }
        if (__VLS_ctx.showBorder) {
            const __VLS_103 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({ modelValue: ((__VLS_ctx.isBorder)), value: ((true)), }));
            const __VLS_105 = __VLS_104({ modelValue: ((__VLS_ctx.isBorder)), value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_104));
            (__VLS_ctx.t('table.border'));
            __VLS_nonNullable(__VLS_108.slots).default;
            var __VLS_108;
        }
        if (__VLS_ctx.showHeaderBackground) {
            const __VLS_109 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({ modelValue: ((__VLS_ctx.isHeaderBackground)), value: ((true)), }));
            const __VLS_111 = __VLS_110({ modelValue: ((__VLS_ctx.isHeaderBackground)), value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_110));
            (__VLS_ctx.t('table.headerBackground'));
            __VLS_nonNullable(__VLS_114.slots).default;
            var __VLS_114;
        }
        var __VLS_90;
    }
    var __VLS_115 = {};
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['max-md:!block'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['md:justify-end'];
    __VLS_styleScopedClasses['max-md:mt-3'];
    __VLS_styleScopedClasses['max-sm:!hidden'];
    __VLS_styleScopedClasses['button'];
    __VLS_styleScopedClasses['button'];
    __VLS_styleScopedClasses['loading'];
    __VLS_styleScopedClasses['button'];
    __VLS_styleScopedClasses['table-size-btn-item'];
    __VLS_styleScopedClasses['[&_.el-dropdown-menu__item]:!mb-[3px]'];
    __VLS_styleScopedClasses['last:[&_.el-dropdown-menu__item]:!mb-0'];
    __VLS_styleScopedClasses['button'];
    __VLS_styleScopedClasses['button'];
    __VLS_styleScopedClasses['column-option'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['fixed-column'];
    __VLS_styleScopedClasses['drag-icon'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['h-4.5'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['min-w-0'];
    __VLS_styleScopedClasses['[&_.el-checkbox__label]:overflow-hidden'];
    __VLS_styleScopedClasses['[&_.el-checkbox__label]:text-ellipsis'];
    __VLS_styleScopedClasses['[&_.el-checkbox__label]:whitespace-nowrap'];
    __VLS_styleScopedClasses['button'];
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
            VueDraggable: VueDraggable,
            ElScrollbar: ElScrollbar,
            t: t,
            columns: columns,
            getColumnVisibility: getColumnVisibility,
            updateColumnVisibility: updateColumnVisibility,
            tableSizeOptions: tableSizeOptions,
            tableSize: tableSize,
            isZebra: isZebra,
            isBorder: isBorder,
            isHeaderBackground: isHeaderBackground,
            shouldShow: shouldShow,
            checkColumnMove: checkColumnMove,
            search: search,
            refresh: refresh,
            handleTableSizeChange: handleTableSizeChange,
            isManualRefresh: isManualRefresh,
            isFullScreen: isFullScreen,
            toggleFullScreen: toggleFullScreen,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map