/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, nextTick, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useTableStore } from '@/store/modules/table';
import { useCommon } from '@/hooks/core/useCommon';
import { useTableHeight } from '@/hooks/core/useTableHeight';
import { useResizeObserver, useWindowSize } from '@vueuse/core';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtTable' });
const { width } = useWindowSize();
const elTableRef = ref(null);
const paginationRef = ref();
const tableHeaderRef = ref();
const tableStore = useTableStore();
const { isBorder, isZebra, tableSize, isFullScreen, isHeaderBackground } = storeToRefs(tableStore);
const props = withDefaults(defineProps(), {
    columns: () => [],
    fit: true,
    showHeader: true,
    stripe: undefined,
    border: undefined,
    size: undefined,
    emptyHeight: '100%',
    emptyText: '暂无数据',
    showTableHeader: true
});
const LAYOUT = {
    MOBILE: 'prev, pager, next, sizes, jumper, total',
    IPAD: 'prev, pager, next, jumper, total',
    DESKTOP: 'total, prev, pager, next, sizes, jumper'
};
const layout = computed(() => {
    if (width.value < 768) {
        return LAYOUT.MOBILE;
    }
    else if (width.value < 1024) {
        return LAYOUT.IPAD;
    }
    else {
        return LAYOUT.DESKTOP;
    }
});
// 默认分页常量
const DEFAULT_PAGINATION_OPTIONS = {
    pageSizes: [10, 20, 30, 50, 100],
    align: 'center',
    background: true,
    layout: layout.value,
    hideOnSinglePage: false,
    size: 'default',
    pagerCount: width.value > 1200 ? 7 : 5
};
// 合并分页配置
const mergedPaginationOptions = computed(() => ({
    ...DEFAULT_PAGINATION_OPTIONS,
    ...props.paginationOptions
}));
// 边框 (优先级：props > store)
const border = computed(() => props.border ?? isBorder.value);
// 斑马纹
const stripe = computed(() => props.stripe ?? isZebra.value);
// 表格尺寸
const size = computed(() => props.size ?? tableSize.value);
// 数据是否为空
const isEmpty = computed(() => props.data?.length === 0);
const paginationHeight = ref(0);
const tableHeaderHeight = ref(0);
// 使用 useResizeObserver 监听分页器高度变化
useResizeObserver(paginationRef, (entries) => {
    const entry = entries[0];
    if (entry) {
        // 使用 requestAnimationFrame 避免 ResizeObserver loop 警告
        requestAnimationFrame(() => {
            paginationHeight.value = entry.contentRect.height;
        });
    }
});
// 使用 useResizeObserver 监听表格头部高度变化
useResizeObserver(tableHeaderRef, (entries) => {
    const entry = entries[0];
    if (entry) {
        // 使用 requestAnimationFrame 避免 ResizeObserver loop 警告
        requestAnimationFrame(() => {
            tableHeaderHeight.value = entry.contentRect.height;
        });
    }
});
// 分页器与表格之间的间距常量（计算属性，响应 showTableHeader 变化）
const PAGINATION_SPACING = computed(() => (props.showTableHeader ? 6 : 15));
// 使用表格高度计算 Hook
const { containerHeight } = useTableHeight({
    showTableHeader: computed(() => props.showTableHeader),
    paginationHeight,
    tableHeaderHeight,
    paginationSpacing: PAGINATION_SPACING
});
// 表格高度逻辑
const height = computed(() => {
    // 全屏模式下占满全屏
    if (isFullScreen.value)
        return '100%';
    // 空数据且非加载状态时固定高度
    if (isEmpty.value && !props.loading)
        return props.emptyHeight;
    // 使用传入的高度
    if (props.height)
        return props.height;
    // 默认占满容器高度
    return '100%';
});
// 表头背景颜色样式
const headerCellStyle = computed(() => ({
    background: isHeaderBackground.value
        ? 'var(--el-fill-color-lighter)'
        : 'var(--default-box-color)',
    ...(props.headerCellStyle || {}) // 合并用户传入的样式
}));
// 是否显示分页器
const showPagination = computed(() => props.pagination && !isEmpty.value);
// 清理列属性，移除插槽相关的自定义属性，确保它们不会被 ElTableColumn 错误解释
const cleanColumnProps = (col) => {
    const columnProps = { ...col };
    // 删除自定义的插槽控制属性
    delete columnProps.useHeaderSlot;
    delete columnProps.headerSlotName;
    delete columnProps.useSlot;
    delete columnProps.slotName;
    return columnProps;
};
// 分页大小变化
const handleSizeChange = (val) => {
    emit('pagination:size-change', val);
};
// 分页当前页变化
const handleCurrentChange = (val) => {
    emit('pagination:current-change', val);
    scrollToTop(); // 页码改变后滚动到表格顶部
};
const { scrollToTop: scrollPageToTop } = useCommon();
// 滚动表格内容到顶部，并可以联动页面滚动到顶部
const scrollToTop = () => {
    nextTick(() => {
        elTableRef.value?.setScrollTop(0); // 滚动 ElTable 内部滚动条到顶部
        scrollPageToTop(); // 调用公共 composable 滚动页面到顶部
    });
};
// 全局序号
const getGlobalIndex = (index) => {
    if (!props.pagination)
        return index + 1;
    const { current, size } = props.pagination;
    return (current - 1) * size + index + 1;
};
const emit = defineEmits();
// 查找并绑定表格头部元素 - 使用 VueUse 优化
const findTableHeader = () => {
    if (!props.showTableHeader) {
        tableHeaderRef.value = undefined;
        return;
    }
    const tableHeader = document.getElementById('art-table-header');
    if (tableHeader) {
        tableHeaderRef.value = tableHeader;
    }
    else {
        // 如果找不到表格头部，设置为 undefined，useElementSize 会返回 0
        tableHeaderRef.value = undefined;
    }
};
watchEffect(() => {
    // 访问响应式数据以建立依赖追踪
    void props.data?.length; // 追踪数据变化
    const shouldShow = props.showTableHeader;
    // 只有在需要显示表格头部时才查找
    if (shouldShow) {
        nextTick(() => {
            findTableHeader();
        });
    }
    else {
        // 不显示时清空引用
        tableHeaderRef.value = undefined;
    }
}, { flush: 'post' });
const __VLS_exposed = {
    scrollToTop,
    elTableRef
};
defineExpose({
    scrollToTop,
    elTableRef
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    columns: () => [],
    fit: true,
    showHeader: true,
    stripe: undefined,
    border: undefined,
    size: undefined,
    emptyHeight: '100%',
    emptyText: '暂无数据',
    showTableHeader: true
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-table") }, ...{ class: (({ 'is-empty': __VLS_ctx.isEmpty })) }, ...{ style: ((__VLS_ctx.containerHeight)) }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ref: ("elTableRef"), ...({ ...__VLS_ctx.$attrs, ...props, height: __VLS_ctx.height, stripe: __VLS_ctx.stripe, border: __VLS_ctx.border, size: __VLS_ctx.size, headerCellStyle: __VLS_ctx.headerCellStyle }), }));
    const __VLS_2 = __VLS_1({ ref: ("elTableRef"), ...({ ...__VLS_ctx.$attrs, ...props, height: __VLS_ctx.height, stripe: __VLS_ctx.stripe, border: __VLS_ctx.border, size: __VLS_ctx.size, headerCellStyle: __VLS_ctx.headerCellStyle }), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (!!__VLS_ctx.loading) }, null, null);
    // @ts-ignore navigation for `const elTableRef = ref()`
    __VLS_ctx.elTableRef;
    var __VLS_6 = {};
    for (const [col] of __VLS_getVForSourceType((__VLS_ctx.columns))) {
        (col.prop || col.type);
        if (col.type === 'globalIndex') {
            const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
            // @ts-ignore
            const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ...({ ...col }), }));
            const __VLS_9 = __VLS_8({ ...({ ...col }), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_12.slots);
                const [{ $index }] = __VLS_getSlotParams(__VLS_thisSlot);
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.getGlobalIndex($index));
            }
            var __VLS_12;
        }
        else if (col.type === 'expand') {
            const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ ...(__VLS_ctx.cleanColumnProps(col)), }));
            const __VLS_15 = __VLS_14({ ...(__VLS_ctx.cleanColumnProps(col)), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_18.slots);
                const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
                const __VLS_19 = ((col.formatter ? col.formatter(row) : null));
                // @ts-ignore
                const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({}));
                const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
            }
            var __VLS_18;
        }
        else {
            const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
            // @ts-ignore
            const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ ...(__VLS_ctx.cleanColumnProps(col)), }));
            const __VLS_27 = __VLS_26({ ...(__VLS_ctx.cleanColumnProps(col)), }, ...__VLS_functionalComponentArgsRest(__VLS_26));
            if (col.useHeaderSlot && col.prop) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
                {
                    const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_30.slots);
                    const [headerScope] = __VLS_getSlotParams(__VLS_thisSlot);
                    var __VLS_31 = {
                        ...({ ...headerScope, prop: col.prop, label: col.label }),
                    };
                    var __VLS_32 = (col.headerSlotName || `${col.prop}-header`);
                    (col.label);
                    __VLS_nonNullable(__VLS_30.slots).default;
                }
            }
            if (col.useSlot && col.prop) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
                {
                    const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_30.slots);
                    const [slotScope] = __VLS_getSlotParams(__VLS_thisSlot);
                    var __VLS_33 = {
                        ...({
                            ...slotScope,
                            prop: col.prop,
                            value: col.prop ? slotScope.row[col.prop] : undefined
                        }),
                    };
                    var __VLS_34 = (col.slotName || col.prop);
                }
            }
            var __VLS_30;
        }
    }
    if (__VLS_ctx.$slots.default) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
            var __VLS_35 = {};
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { empty: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        if (__VLS_ctx.loading) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        }
        else {
            const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElEmpty;
            /** @type { [typeof __VLS_components.ElEmpty, ] } */
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ description: ((__VLS_ctx.emptyText)), imageSize: ((120)), }));
            const __VLS_38 = __VLS_37({ description: ((__VLS_ctx.emptyText)), imageSize: ((120)), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        }
    }
    var __VLS_5;
    if (__VLS_ctx.showPagination) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination custom-pagination") }, ...{ class: ((__VLS_ctx.mergedPaginationOptions?.align)) }, ref: ("paginationRef"), });
        // @ts-ignore navigation for `const paginationRef = ref()`
        __VLS_ctx.paginationRef;
        const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
        /** @type { [typeof __VLS_components.ElPagination, ] } */
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, ...(__VLS_ctx.mergedPaginationOptions), total: ((__VLS_ctx.pagination?.total)), disabled: ((__VLS_ctx.loading)), pageSize: ((__VLS_ctx.pagination?.size)), currentPage: ((__VLS_ctx.pagination?.current)), }));
        const __VLS_44 = __VLS_43({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, ...(__VLS_ctx.mergedPaginationOptions), total: ((__VLS_ctx.pagination?.total)), disabled: ((__VLS_ctx.loading)), pageSize: ((__VLS_ctx.pagination?.size)), currentPage: ((__VLS_ctx.pagination?.current)), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        let __VLS_48;
        const __VLS_49 = {
            onSizeChange: (__VLS_ctx.handleSizeChange)
        };
        const __VLS_50 = {
            onCurrentChange: (__VLS_ctx.handleCurrentChange)
        };
        let __VLS_45;
        let __VLS_46;
        var __VLS_47;
    }
    __VLS_styleScopedClasses['art-table'];
    __VLS_styleScopedClasses['is-empty'];
    __VLS_styleScopedClasses['pagination'];
    __VLS_styleScopedClasses['custom-pagination'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "elTableRef": __VLS_6,
        "paginationRef": __VLS_nativeElements['div'],
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
            elTableRef: elTableRef,
            paginationRef: paginationRef,
            mergedPaginationOptions: mergedPaginationOptions,
            border: border,
            stripe: stripe,
            size: size,
            isEmpty: isEmpty,
            containerHeight: containerHeight,
            height: height,
            headerCellStyle: headerCellStyle,
            showPagination: showPagination,
            cleanColumnProps: cleanColumnProps,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            getGlobalIndex: getGlobalIndex,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map