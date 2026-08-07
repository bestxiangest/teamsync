/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useTable } from '@/hooks/core/useTable';
import { fetchGetRoleList } from '@/api/system-manage';
import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue';
import RoleSearch from './modules/role-search.vue';
import RoleEditDialog from './modules/role-edit-dialog.vue';
import RolePermissionDialog from './modules/role-permission-dialog.vue';
import { ElTag, ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Role' });
// 搜索表单
const searchForm = ref({
    roleName: undefined,
    roleCode: undefined,
    description: undefined,
    enabled: undefined,
    daterange: undefined
});
const showSearchBar = ref(false);
const dialogVisible = ref(false);
const permissionDialog = ref(false);
const currentRoleData = ref(undefined);
const { columns, columnChecks, data, loading, pagination, getData, searchParams, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData } = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetRoleList,
        apiParams: {
            current: 1,
            size: 20
        },
        // 排除 apiParams 中的属性
        excludeParams: ['daterange'],
        columnsFactory: () => [
            {
                prop: 'roleId',
                label: '角色ID',
                width: 100
            },
            {
                prop: 'roleName',
                label: '角色名称',
                minWidth: 120
            },
            {
                prop: 'roleCode',
                label: '角色编码',
                minWidth: 120
            },
            {
                prop: 'description',
                label: '角色描述',
                minWidth: 150,
                showOverflowTooltip: true
            },
            {
                prop: 'enabled',
                label: '角色状态',
                width: 100,
                formatter: (row) => {
                    const statusConfig = row.enabled
                        ? { type: 'success', text: '启用' }
                        : { type: 'warning', text: '禁用' };
                    return h(ElTag, { type: statusConfig.type }, () => statusConfig.text);
                }
            },
            {
                prop: 'createTime',
                label: '创建日期',
                width: 180,
                sortable: true
            },
            {
                prop: 'operation',
                label: '操作',
                width: 80,
                fixed: 'right',
                formatter: (row) => h('div', [
                    h(ArtButtonMore, {
                        list: [
                            {
                                key: 'permission',
                                label: '菜单权限',
                                icon: 'ri:user-3-line'
                            },
                            {
                                key: 'edit',
                                label: '编辑角色',
                                icon: 'ri:edit-2-line'
                            },
                            {
                                key: 'delete',
                                label: '删除角色',
                                icon: 'ri:delete-bin-4-line',
                                color: '#f56c6c'
                            }
                        ],
                        onClick: (item) => buttonMoreClick(item, row)
                    })
                ])
            }
        ]
    }
});
const dialogType = ref('add');
const showDialog = (type, row) => {
    dialogVisible.value = true;
    dialogType.value = type;
    currentRoleData.value = row;
};
/**
 * 搜索处理
 * @param params 搜索参数
 */
const handleSearch = (params) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...filtersParams } = params;
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null];
    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams, startTime, endTime });
    getData();
};
const buttonMoreClick = (item, row) => {
    switch (item.key) {
        case 'permission':
            showPermissionDialog(row);
            break;
        case 'edit':
            showDialog('edit', row);
            break;
        case 'delete':
            deleteRole(row);
            break;
    }
};
const showPermissionDialog = (row) => {
    permissionDialog.value = true;
    currentRoleData.value = row;
};
const deleteRole = (row) => {
    ElMessageBox.confirm(`确定删除角色"${row.roleName}"吗？此操作不可恢复！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(() => {
        // TODO: 调用删除接口
        ElMessage.success('删除成功');
        refreshData();
    })
        .catch(() => {
        ElMessage.info('已取消删除');
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-full-height") }, });
    // @ts-ignore
    [RoleSearch, RoleSearch,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(RoleSearch, new RoleSearch({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }));
    const __VLS_1 = __VLS_0({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.showSearchBar) }, null, null);
    let __VLS_5;
    const __VLS_6 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    const __VLS_7 = {
        onReset: (__VLS_ctx.resetSearchParams)
    };
    let __VLS_2;
    let __VLS_3;
    var __VLS_4;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ class: ("art-table-card") }, shadow: ("never"), ...{ style: (({ 'margin-top': __VLS_ctx.showSearchBar ? '12px' : '0' })) }, }));
    const __VLS_10 = __VLS_9({ ...{ class: ("art-table-card") }, shadow: ("never"), ...{ style: (({ 'margin-top': __VLS_ctx.showSearchBar ? '12px' : '0' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtTableHeader;
    /** @type { [typeof __VLS_components.ArtTableHeader, typeof __VLS_components.ArtTableHeader, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), showSearchBar: ((__VLS_ctx.showSearchBar)), loading: ((__VLS_ctx.loading)), }));
    const __VLS_16 = __VLS_15({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), showSearchBar: ((__VLS_ctx.showSearchBar)), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_20;
    const __VLS_21 = {
        onRefresh: (__VLS_ctx.refreshData)
    };
    let __VLS_17;
    let __VLS_18;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { left: __VLS_thisSlot } = __VLS_nonNullable(__VLS_19.slots);
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElSpace;
        /** @type { [typeof __VLS_components.ElSpace, typeof __VLS_components.ElSpace, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ wrap: (true), }));
        const __VLS_24 = __VLS_23({ wrap: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ...{ 'onClick': {} }, }));
        const __VLS_30 = __VLS_29({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                __VLS_ctx.showDialog('add');
            }
        };
        let __VLS_31;
        let __VLS_32;
        __VLS_nonNullable(__VLS_33.slots).default;
        var __VLS_33;
        __VLS_nonNullable(__VLS_27.slots).default;
        var __VLS_27;
    }
    var __VLS_19;
    const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ArtTable;
    /** @type { [typeof __VLS_components.ArtTable, typeof __VLS_components.ArtTable, ] } */
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: ((__VLS_ctx.data)), columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }));
    const __VLS_38 = __VLS_37({ ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: ((__VLS_ctx.data)), columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_42;
    const __VLS_43 = {
        'onPagination:sizeChange': (__VLS_ctx.handleSizeChange)
    };
    const __VLS_44 = {
        'onPagination:currentChange': (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_39;
    let __VLS_40;
    var __VLS_41;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    // @ts-ignore
    [RoleEditDialog,];
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(RoleEditDialog, new RoleEditDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.dialogVisible)), dialogType: ((__VLS_ctx.dialogType)), roleData: ((__VLS_ctx.currentRoleData)), }));
    const __VLS_46 = __VLS_45({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.dialogVisible)), dialogType: ((__VLS_ctx.dialogType)), roleData: ((__VLS_ctx.currentRoleData)), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_50;
    const __VLS_51 = {
        onSuccess: (__VLS_ctx.refreshData)
    };
    let __VLS_47;
    let __VLS_48;
    var __VLS_49;
    // @ts-ignore
    [RolePermissionDialog,];
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(RolePermissionDialog, new RolePermissionDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.permissionDialog)), roleData: ((__VLS_ctx.currentRoleData)), }));
    const __VLS_53 = __VLS_52({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.permissionDialog)), roleData: ((__VLS_ctx.currentRoleData)), }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_57;
    const __VLS_58 = {
        onSuccess: (__VLS_ctx.refreshData)
    };
    let __VLS_54;
    let __VLS_55;
    var __VLS_56;
    __VLS_styleScopedClasses['art-full-height'];
    __VLS_styleScopedClasses['art-table-card'];
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
            RoleSearch: RoleSearch,
            RoleEditDialog: RoleEditDialog,
            RolePermissionDialog: RolePermissionDialog,
            searchForm: searchForm,
            showSearchBar: showSearchBar,
            dialogVisible: dialogVisible,
            permissionDialog: permissionDialog,
            currentRoleData: currentRoleData,
            columns: columns,
            columnChecks: columnChecks,
            data: data,
            loading: loading,
            pagination: pagination,
            resetSearchParams: resetSearchParams,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            refreshData: refreshData,
            dialogType: dialogType,
            showDialog: showDialog,
            handleSearch: handleSearch,
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