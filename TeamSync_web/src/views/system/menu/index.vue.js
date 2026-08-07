/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { formatMenuTitle } from '@/utils/router';
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue';
import { useTableColumns } from '@/hooks/core/useTableColumns';
import MenuDialog from './modules/menu-dialog.vue';
import { fetchGetMenuList } from '@/api/system-manage';
import { ElTag, ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Menus' });
// 状态管理
const loading = ref(false);
const isExpanded = ref(false);
const tableRef = ref();
// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('menu');
const editData = ref(null);
const lockMenuType = ref(false);
// 搜索相关
const initialSearchState = {
    name: '',
    route: ''
};
const formFilters = reactive({ ...initialSearchState });
const appliedFilters = reactive({ ...initialSearchState });
const formItems = computed(() => [
    {
        label: '菜单名称',
        key: 'name',
        type: 'input',
        props: { clearable: true }
    },
    {
        label: '路由地址',
        key: 'route',
        type: 'input',
        props: { clearable: true }
    }
]);
onMounted(() => {
    getMenuList();
});
/**
 * 获取菜单列表数据
 */
const getMenuList = async () => {
    loading.value = true;
    try {
        const list = await fetchGetMenuList();
        tableData.value = list;
    }
    catch (error) {
        throw error instanceof Error ? error : new Error('获取菜单失败');
    }
    finally {
        loading.value = false;
    }
};
/**
 * 获取菜单类型标签颜色
 * @param row 菜单行数据
 * @returns 标签颜色类型
 */
const getMenuTypeTag = (row) => {
    if (row.meta?.isAuthButton)
        return 'danger';
    if (row.children?.length)
        return 'info';
    if (row.meta?.link && row.meta?.isIframe)
        return 'success';
    if (row.path)
        return 'primary';
    if (row.meta?.link)
        return 'warning';
    return 'info';
};
/**
 * 获取菜单类型文本
 * @param row 菜单行数据
 * @returns 菜单类型文本
 */
const getMenuTypeText = (row) => {
    if (row.meta?.isAuthButton)
        return '按钮';
    if (row.children?.length)
        return '目录';
    if (row.meta?.link && row.meta?.isIframe)
        return '内嵌';
    if (row.path)
        return '菜单';
    if (row.meta?.link)
        return '外链';
    return '未知';
};
// 表格列配置
const { columnChecks, columns } = useTableColumns(() => [
    {
        prop: 'meta.title',
        label: '菜单名称',
        minWidth: 120,
        formatter: (row) => formatMenuTitle(row.meta?.title)
    },
    {
        prop: 'type',
        label: '菜单类型',
        formatter: (row) => {
            return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row));
        }
    },
    {
        prop: 'path',
        label: '路由',
        formatter: (row) => {
            if (row.meta?.isAuthButton)
                return '';
            return row.meta?.link || row.path || '';
        }
    },
    {
        prop: 'meta.authList',
        label: '权限标识',
        formatter: (row) => {
            if (row.meta?.isAuthButton) {
                return row.meta?.authMark || '';
            }
            if (!row.meta?.authList?.length)
                return '';
            return `${row.meta.authList.length} 个权限标识`;
        }
    },
    {
        prop: 'date',
        label: '编辑时间',
        formatter: () => '2022-3-12 12:00:00'
    },
    {
        prop: 'status',
        label: '状态',
        formatter: () => h(ElTag, { type: 'success' }, () => '启用')
    },
    {
        prop: 'operation',
        label: '操作',
        width: 180,
        align: 'right',
        formatter: (row) => {
            const buttonStyle = { style: 'text-align: right' };
            if (row.meta?.isAuthButton) {
                return h('div', buttonStyle, [
                    h(ArtButtonTable, {
                        type: 'edit',
                        onClick: () => handleEditAuth(row)
                    }),
                    h(ArtButtonTable, {
                        type: 'delete',
                        onClick: () => handleDeleteAuth()
                    })
                ]);
            }
            return h('div', buttonStyle, [
                h(ArtButtonTable, {
                    type: 'add',
                    onClick: () => handleAddAuth(),
                    title: '新增权限'
                }),
                h(ArtButtonTable, {
                    type: 'edit',
                    onClick: () => handleEditMenu(row)
                }),
                h(ArtButtonTable, {
                    type: 'delete',
                    onClick: () => handleDeleteMenu()
                })
            ]);
        }
    }
]);
// 数据相关
const tableData = ref([]);
/**
 * 重置搜索条件
 */
const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState });
    Object.assign(appliedFilters, { ...initialSearchState });
    getMenuList();
};
/**
 * 执行搜索
 */
const handleSearch = () => {
    Object.assign(appliedFilters, { ...formFilters });
    getMenuList();
};
/**
 * 刷新菜单列表
 */
const handleRefresh = () => {
    getMenuList();
};
/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj);
    if (Array.isArray(obj))
        return obj.map((item) => deepClone(item));
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
};
/**
 * 将权限列表转换为子节点
 * @param items 菜单项数组
 * @returns 转换后的菜单项数组
 */
const convertAuthListToChildren = (items) => {
    return items.map((item) => {
        const clonedItem = deepClone(item);
        if (clonedItem.children?.length) {
            clonedItem.children = convertAuthListToChildren(clonedItem.children);
        }
        if (item.meta?.authList?.length) {
            const authChildren = item.meta.authList.map((auth) => ({
                path: `${item.path}_auth_${auth.authMark}`,
                name: `${String(item.name)}_auth_${auth.authMark}`,
                meta: {
                    title: auth.title,
                    authMark: auth.authMark,
                    isAuthButton: true,
                    parentPath: item.path
                }
            }));
            clonedItem.children = clonedItem.children?.length
                ? [...clonedItem.children, ...authChildren]
                : authChildren;
        }
        return clonedItem;
    });
};
/**
 * 搜索菜单
 * @param items 菜单项数组
 * @returns 搜索结果数组
 */
const searchMenu = (items) => {
    const results = [];
    for (const item of items) {
        const searchName = appliedFilters.name?.toLowerCase().trim() || '';
        const searchRoute = appliedFilters.route?.toLowerCase().trim() || '';
        const menuTitle = formatMenuTitle(item.meta?.title || '').toLowerCase();
        const menuPath = (item.path || '').toLowerCase();
        const nameMatch = !searchName || menuTitle.includes(searchName);
        const routeMatch = !searchRoute || menuPath.includes(searchRoute);
        if (item.children?.length) {
            const matchedChildren = searchMenu(item.children);
            if (matchedChildren.length > 0) {
                const clonedItem = deepClone(item);
                clonedItem.children = matchedChildren;
                results.push(clonedItem);
                continue;
            }
        }
        if (nameMatch && routeMatch) {
            results.push(deepClone(item));
        }
    }
    return results;
};
// 过滤后的表格数据
const filteredTableData = computed(() => {
    const searchedData = searchMenu(tableData.value);
    return convertAuthListToChildren(searchedData);
});
/**
 * 添加菜单
 */
const handleAddMenu = () => {
    dialogType.value = 'menu';
    editData.value = null;
    lockMenuType.value = true;
    dialogVisible.value = true;
};
/**
 * 添加权限按钮
 */
const handleAddAuth = () => {
    dialogType.value = 'menu';
    editData.value = null;
    lockMenuType.value = false;
    dialogVisible.value = true;
};
/**
 * 编辑菜单
 * @param row 菜单行数据
 */
const handleEditMenu = (row) => {
    dialogType.value = 'menu';
    editData.value = row;
    lockMenuType.value = true;
    dialogVisible.value = true;
};
/**
 * 编辑权限按钮
 * @param row 权限行数据
 */
const handleEditAuth = (row) => {
    dialogType.value = 'button';
    editData.value = {
        title: row.meta?.title,
        authMark: row.meta?.authMark
    };
    lockMenuType.value = false;
    dialogVisible.value = true;
};
/**
 * 提交表单数据
 * @param formData 表单数据
 */
const handleSubmit = (formData) => {
    console.log('提交数据:', formData);
    // TODO: 调用API保存数据
    getMenuList();
};
/**
 * 删除菜单
 */
const handleDeleteMenu = async () => {
    try {
        await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        ElMessage.success('删除成功');
        getMenuList();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败');
        }
    }
};
/**
 * 删除权限按钮
 */
const handleDeleteAuth = async () => {
    try {
        await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        ElMessage.success('删除成功');
        getMenuList();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败');
        }
    }
};
/**
 * 切换展开/收起所有菜单
 */
const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
    nextTick(() => {
        if (tableRef.value?.elTableRef && filteredTableData.value) {
            const processRows = (rows) => {
                rows.forEach((row) => {
                    if (row.children?.length) {
                        tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value);
                        processRows(row.children);
                    }
                });
            };
            processRows(filteredTableData.value);
        }
    });
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("menu-page art-full-height") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSearchBar;
    /** @type { [typeof __VLS_components.ArtSearchBar, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onReset': {} }, ...{ 'onSearch': {} }, modelValue: ((__VLS_ctx.formFilters)), items: ((__VLS_ctx.formItems)), showExpand: ((false)), }));
    const __VLS_2 = __VLS_1({ ...{ 'onReset': {} }, ...{ 'onSearch': {} }, modelValue: ((__VLS_ctx.formFilters)), items: ((__VLS_ctx.formItems)), showExpand: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onReset: (__VLS_ctx.handleReset)
    };
    const __VLS_8 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    let __VLS_3;
    let __VLS_4;
    var __VLS_5;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ...{ class: ("art-table-card") }, shadow: ("never"), }));
    const __VLS_11 = __VLS_10({ ...{ class: ("art-table-card") }, shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ArtTableHeader;
    /** @type { [typeof __VLS_components.ArtTableHeader, typeof __VLS_components.ArtTableHeader, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ ...{ 'onRefresh': {} }, showZebra: ((false)), loading: ((__VLS_ctx.loading)), columns: ((__VLS_ctx.columnChecks)), }));
    const __VLS_17 = __VLS_16({ ...{ 'onRefresh': {} }, showZebra: ((false)), loading: ((__VLS_ctx.loading)), columns: ((__VLS_ctx.columnChecks)), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_21;
    const __VLS_22 = {
        onRefresh: (__VLS_ctx.handleRefresh)
    };
    let __VLS_18;
    let __VLS_19;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { left: __VLS_thisSlot } = __VLS_nonNullable(__VLS_20.slots);
        const __VLS_23 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({ ...{ 'onClick': {} }, }));
        const __VLS_25 = __VLS_24({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        __VLS_asFunctionalDirective(__VLS_directives.vAuth)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: ('add') }, null, null);
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_29;
        const __VLS_30 = {
            onClick: (__VLS_ctx.handleAddMenu)
        };
        let __VLS_26;
        let __VLS_27;
        __VLS_nonNullable(__VLS_28.slots).default;
        var __VLS_28;
        const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ ...{ 'onClick': {} }, }));
        const __VLS_33 = __VLS_32({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_37;
        const __VLS_38 = {
            onClick: (__VLS_ctx.toggleExpand)
        };
        let __VLS_34;
        let __VLS_35;
        (__VLS_ctx.isExpanded ? '收起' : '展开');
        __VLS_nonNullable(__VLS_36.slots).default;
        var __VLS_36;
    }
    var __VLS_20;
    const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ArtTable;
    /** @type { [typeof __VLS_components.ArtTable, ] } */
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ ref: ("tableRef"), rowKey: ("path"), loading: ((__VLS_ctx.loading)), columns: ((__VLS_ctx.columns)), data: ((__VLS_ctx.filteredTableData)), stripe: ((false)), treeProps: (({ children: 'children', hasChildren: 'hasChildren' })), defaultExpandAll: ((false)), }));
    const __VLS_41 = __VLS_40({ ref: ("tableRef"), rowKey: ("path"), loading: ((__VLS_ctx.loading)), columns: ((__VLS_ctx.columns)), data: ((__VLS_ctx.filteredTableData)), stripe: ((false)), treeProps: (({ children: 'children', hasChildren: 'hasChildren' })), defaultExpandAll: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    // @ts-ignore navigation for `const tableRef = ref()`
    __VLS_ctx.tableRef;
    var __VLS_45 = {};
    var __VLS_44;
    // @ts-ignore
    [MenuDialog,];
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(MenuDialog, new MenuDialog({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), editData: ((__VLS_ctx.editData)), lockType: ((__VLS_ctx.lockMenuType)), }));
    const __VLS_47 = __VLS_46({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), editData: ((__VLS_ctx.editData)), lockType: ((__VLS_ctx.lockMenuType)), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_51;
    const __VLS_52 = {
        onSubmit: (__VLS_ctx.handleSubmit)
    };
    let __VLS_48;
    let __VLS_49;
    var __VLS_50;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_styleScopedClasses['menu-page'];
    __VLS_styleScopedClasses['art-full-height'];
    __VLS_styleScopedClasses['art-table-card'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "tableRef": __VLS_45,
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
            MenuDialog: MenuDialog,
            loading: loading,
            isExpanded: isExpanded,
            tableRef: tableRef,
            dialogVisible: dialogVisible,
            dialogType: dialogType,
            editData: editData,
            lockMenuType: lockMenuType,
            formFilters: formFilters,
            formItems: formItems,
            columnChecks: columnChecks,
            columns: columns,
            handleReset: handleReset,
            handleSearch: handleSearch,
            handleRefresh: handleRefresh,
            filteredTableData: filteredTableData,
            handleAddMenu: handleAddMenu,
            handleSubmit: handleSubmit,
            toggleExpand: toggleExpand,
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