/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue';
import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData';
import { useTable } from '@/hooks/core/useTable';
import { fetchGetUserList, fetchDeleteUser } from '@/api/system-manage';
import UserSearch from './modules/user-search.vue';
import UserDialog from './modules/user-dialog.vue';
import ResetPwdDialog from './modules/reset-pwd-dialog.vue';
import { ElTag, ElMessageBox, ElImage, ElButton } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'User' });
// 弹窗相关
const dialogType = ref('add');
const dialogVisible = ref(false);
const currentUserData = ref({});
// 重置密码弹窗
const resetPwdDialogVisible = ref(false);
const resetPwdUserId = ref(0);
const resetPwdUsername = ref('');
// 选中行
const selectedRows = ref([]);
// 搜索表单
const searchForm = ref({
    username: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: undefined
});
// 用户状态配置
const USER_STATUS_CONFIG = {
    '1': { type: 'success', text: '在线' },
    '2': { type: 'info', text: '离线' },
    '3': { type: 'warning', text: '异常' },
    '4': { type: 'danger', text: '注销' }
};
/**
 * 获取用户状态配置
 */
const getUserStatusConfig = (status) => {
    return (USER_STATUS_CONFIG[status] || {
        type: 'info',
        text: '未知'
    });
};
const { columns, columnChecks, data, loading, pagination, getData, searchParams, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData } = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetUserList,
        apiParams: {
            current: 1,
            size: 20,
            ...searchForm.value
        },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            {
                prop: 'userInfo',
                label: '用户名',
                minWidth: 280,
                formatter: (row) => {
                    return h('div', { class: 'user flex-c' }, [
                        h(ElImage, {
                            class: 'size-9.5 rounded-md',
                            src: row.avatar,
                            previewSrcList: [row.avatar],
                            previewTeleported: true
                        }),
                        h('div', { class: 'ml-2' }, [
                            h('p', { class: 'user-name' }, row.username),
                            h('p', { class: 'email' }, row.userEmail)
                        ])
                    ]);
                }
            },
            {
                prop: 'userGender',
                label: '性别',
                minWidth: 80,
                sortable: true,
                formatter: (row) => row.userGender
            },
            { prop: 'userPhone', label: '手机号', minWidth: 130 },
            {
                prop: 'isAdmin',
                label: '管理员',
                minWidth: 100,
                formatter: (row) => {
                    const isAdmin = row.isAdmin === true;
                    return h(ElTag, { type: isAdmin ? 'danger' : 'info', size: 'small' }, () => (isAdmin ? '是' : '否'));
                }
            },
            {
                prop: 'status',
                label: '状态',
                minWidth: 80,
                formatter: (row) => {
                    const statusConfig = getUserStatusConfig(row.status);
                    return h(ElTag, { type: statusConfig.type, size: 'small' }, () => statusConfig.text);
                }
            },
            {
                prop: 'createTime',
                label: '创建日期',
                minWidth: 170,
                sortable: true
            },
            {
                prop: 'operation',
                label: '操作',
                minWidth: 200,
                fixed: 'right',
                formatter: (row) => h('div', { class: 'flex items-center gap-1' }, [
                    h(ArtButtonTable, {
                        type: 'edit',
                        onClick: () => showDialog('edit', row)
                    }),
                    h(ArtButtonTable, {
                        type: 'delete',
                        onClick: () => deleteUser(row)
                    }),
                    h(ElButton, {
                        size: 'small',
                        type: 'warning',
                        text: true,
                        onClick: () => showResetPwdDialog(row)
                    }, () => '重置密码')
                ])
            }
        ]
    },
    // 数据处理
    transform: {
        // 数据转换器 - 替换头像
        dataTransformer: (records) => {
            if (!Array.isArray(records)) {
                console.warn('数据转换器: 期望数组类型，实际收到:', typeof records);
                return [];
            }
            return records.map((item, index) => {
                return {
                    ...item,
                    avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
                };
            });
        }
    }
});
/**
 * 搜索处理
 */
const handleSearch = (params) => {
    console.log('搜索参数:', params);
    Object.assign(searchParams, params);
    getData();
};
/**
 * 显示用户弹窗
 */
const showDialog = (type, row) => {
    console.log('打开弹窗:', { type, row });
    dialogType.value = type;
    currentUserData.value = row ? { ...row } : {};
    nextTick(() => {
        dialogVisible.value = true;
    });
};
/**
 * 显示重置密码弹窗
 */
const showResetPwdDialog = (row) => {
    resetPwdUserId.value = row.id;
    resetPwdUsername.value = row.username;
    resetPwdDialogVisible.value = true;
};
/**
 * 删除用户
 */
const deleteUser = async (row) => {
    console.log('删除用户:', row);
    try {
        await ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？此操作不可恢复！`, '删除用户', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        // 调用删除接口
        await fetchDeleteUser(row.id);
        ElMessage.success('删除成功');
        // 刷新列表
        getData();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('删除用户失败:', error);
            ElMessage.error(error?.message || '删除失败');
        }
    }
};
/**
 * 处理弹窗提交事件
 */
const handleDialogSubmit = async () => {
    dialogVisible.value = false;
    currentUserData.value = {};
    // 刷新列表
    getData();
};
/**
 * 处理重置密码提交事件
 */
const handleResetPwdSubmit = () => {
    resetPwdDialogVisible.value = false;
};
/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection) => {
    selectedRows.value = selection;
    console.log('选中行数据:', selectedRows.value);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-page art-full-height") }, });
    // @ts-ignore
    [UserSearch, UserSearch,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(UserSearch, new UserSearch({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }));
    const __VLS_1 = __VLS_0({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
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
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ class: ("art-table-card") }, shadow: ("never"), }));
    const __VLS_10 = __VLS_9({ ...{ class: ("art-table-card") }, shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtTableHeader;
    /** @type { [typeof __VLS_components.ArtTableHeader, typeof __VLS_components.ArtTableHeader, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), loading: ((__VLS_ctx.loading)), }));
    const __VLS_16 = __VLS_15({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
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
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_30 = __VLS_29({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
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
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ 'onSelectionChange': {} }, ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: ((__VLS_ctx.data)), columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }));
    const __VLS_38 = __VLS_37({ ...{ 'onSelectionChange': {} }, ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: ((__VLS_ctx.data)), columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_42;
    const __VLS_43 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    const __VLS_44 = {
        'onPagination:sizeChange': (__VLS_ctx.handleSizeChange)
    };
    const __VLS_45 = {
        'onPagination:currentChange': (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_39;
    let __VLS_40;
    var __VLS_41;
    // @ts-ignore
    [UserDialog,];
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(UserDialog, new UserDialog({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), userData: ((__VLS_ctx.currentUserData)), }));
    const __VLS_47 = __VLS_46({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), userData: ((__VLS_ctx.currentUserData)), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_51;
    const __VLS_52 = {
        onSubmit: (__VLS_ctx.handleDialogSubmit)
    };
    let __VLS_48;
    let __VLS_49;
    var __VLS_50;
    // @ts-ignore
    [ResetPwdDialog,];
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(ResetPwdDialog, new ResetPwdDialog({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.resetPwdDialogVisible)), userId: ((__VLS_ctx.resetPwdUserId)), username: ((__VLS_ctx.resetPwdUsername)), }));
    const __VLS_54 = __VLS_53({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.resetPwdDialogVisible)), userId: ((__VLS_ctx.resetPwdUserId)), username: ((__VLS_ctx.resetPwdUsername)), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_58;
    const __VLS_59 = {
        onSubmit: (__VLS_ctx.handleResetPwdSubmit)
    };
    let __VLS_55;
    let __VLS_56;
    var __VLS_57;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    __VLS_styleScopedClasses['user-page'];
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
            UserSearch: UserSearch,
            UserDialog: UserDialog,
            ResetPwdDialog: ResetPwdDialog,
            ElButton: ElButton,
            dialogType: dialogType,
            dialogVisible: dialogVisible,
            currentUserData: currentUserData,
            resetPwdDialogVisible: resetPwdDialogVisible,
            resetPwdUserId: resetPwdUserId,
            resetPwdUsername: resetPwdUsername,
            searchForm: searchForm,
            columns: columns,
            columnChecks: columnChecks,
            data: data,
            loading: loading,
            pagination: pagination,
            resetSearchParams: resetSearchParams,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            refreshData: refreshData,
            handleSearch: handleSearch,
            showDialog: showDialog,
            handleDialogSubmit: handleDialogSubmit,
            handleResetPwdSubmit: handleResetPwdSubmit,
            handleSelectionChange: handleSelectionChange,
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