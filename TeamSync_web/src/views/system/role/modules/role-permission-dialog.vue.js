import { useMenuStore } from '@/store/modules/menu';
import { formatMenuTitle } from '@/utils/router';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = withDefaults(defineProps(), {
    modelValue: false,
    roleData: undefined
});
const emit = defineEmits();
const { menuList } = storeToRefs(useMenuStore());
const treeRef = ref();
const isExpandAll = ref(true);
const isSelectAll = ref(false);
/**
 * 弹窗显示状态双向绑定
 */
const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
/**
 * 处理菜单数据，将 authList 转换为树形子节点
 * 递归处理菜单树，将权限列表展开为可选择的子节点
 */
const processedMenuList = computed(() => {
    const processNode = (node) => {
        const processed = { ...node };
        // 如果有 authList，将其转换为子节点
        if (node.meta?.authList?.length) {
            const authNodes = node.meta.authList.map((auth) => ({
                id: `${node.id}_${auth.authMark}`,
                name: `${node.name}_${auth.authMark}`,
                label: auth.title,
                authMark: auth.authMark,
                isAuth: true,
                checked: auth.checked || false
            }));
            processed.children = processed.children ? [...processed.children, ...authNodes] : authNodes;
        }
        // 递归处理子节点
        if (processed.children) {
            processed.children = processed.children.map(processNode);
        }
        return processed;
    };
    return menuList.value.map(processNode);
});
/**
 * 树形组件配置
 */
const defaultProps = {
    children: 'children',
    label: (data) => formatMenuTitle(data.meta?.title) || data.label || ''
};
/**
 * 监听弹窗打开，初始化权限数据
 */
watch(() => props.modelValue, (newVal) => {
    if (newVal && props.roleData) {
        // TODO: 根据角色加载对应的权限数据
        console.log('设置权限:', props.roleData);
    }
});
/**
 * 关闭弹窗并清空选中状态
 */
const handleClose = () => {
    visible.value = false;
    treeRef.value?.setCheckedKeys([]);
};
/**
 * 保存权限配置
 */
const savePermission = () => {
    // TODO: 调用保存权限接口
    ElMessage.success('权限保存成功');
    emit('success');
    handleClose();
};
/**
 * 切换全部展开/收起状态
 */
const toggleExpandAll = () => {
    const tree = treeRef.value;
    if (!tree)
        return;
    const nodes = tree.store.nodesMap;
    // 这里保留 any，因为 Element Plus 的内部节点类型较复杂
    Object.values(nodes).forEach((node) => {
        node.expanded = !isExpandAll.value;
    });
    isExpandAll.value = !isExpandAll.value;
};
/**
 * 切换全选/取消全选状态
 */
const toggleSelectAll = () => {
    const tree = treeRef.value;
    if (!tree)
        return;
    if (!isSelectAll.value) {
        const allKeys = getAllNodeKeys(processedMenuList.value);
        tree.setCheckedKeys(allKeys);
    }
    else {
        tree.setCheckedKeys([]);
    }
    isSelectAll.value = !isSelectAll.value;
};
/**
 * 递归获取所有节点的 key
 * @param nodes 节点列表
 * @returns 所有节点的 key 数组
 */
const getAllNodeKeys = (nodes) => {
    const keys = [];
    const traverse = (nodeList) => {
        nodeList.forEach((node) => {
            if (node.name)
                keys.push(node.name);
            if (node.children?.length)
                traverse(node.children);
        });
    };
    traverse(nodes);
    return keys;
};
/**
 * 处理树节点选中状态变化
 * 同步更新全选按钮状态
 */
const handleTreeCheck = () => {
    const tree = treeRef.value;
    if (!tree)
        return;
    const checkedKeys = tree.getCheckedKeys();
    const allKeys = getAllNodeKeys(processedMenuList.value);
    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0;
};
/**
 * 输出选中的权限数据到控制台
 * 用于调试和查看当前选中的权限配置
 */
const outputSelectedData = () => {
    const tree = treeRef.value;
    if (!tree)
        return;
    const selectedData = {
        checkedKeys: tree.getCheckedKeys(),
        halfCheckedKeys: tree.getHalfCheckedKeys(),
        checkedNodes: tree.getCheckedNodes(),
        halfCheckedNodes: tree.getHalfCheckedNodes(),
        totalChecked: tree.getCheckedKeys().length,
        totalHalfChecked: tree.getHalfCheckedKeys().length
    };
    console.log('=== 选中的权限数据 ===', selectedData);
    ElMessage.success(`已输出选中数据到控制台，共选中 ${selectedData.totalChecked} 个节点`);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    modelValue: false,
    roleData: undefined
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
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ("菜单权限"), width: ("520px"), alignCenter: (true), ...{ class: ("el-dialog-border") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ("菜单权限"), width: ("520px"), alignCenter: (true), ...{ class: ("el-dialog-border") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ height: ("70vh"), }));
    const __VLS_11 = __VLS_10({ height: ("70vh"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElTree;
    /** @type { [typeof __VLS_components.ElTree, typeof __VLS_components.ElTree, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ ...{ 'onCheck': {} }, ref: ("treeRef"), data: ((__VLS_ctx.processedMenuList)), showCheckbox: (true), nodeKey: ("name"), defaultExpandAll: ((__VLS_ctx.isExpandAll)), defaultCheckedKeys: (([1, 2, 3])), props: ((__VLS_ctx.defaultProps)), }));
    const __VLS_17 = __VLS_16({ ...{ 'onCheck': {} }, ref: ("treeRef"), data: ((__VLS_ctx.processedMenuList)), showCheckbox: (true), nodeKey: ("name"), defaultExpandAll: ((__VLS_ctx.isExpandAll)), defaultCheckedKeys: (([1, 2, 3])), props: ((__VLS_ctx.defaultProps)), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    // @ts-ignore navigation for `const treeRef = ref()`
    __VLS_ctx.treeRef;
    var __VLS_21 = {};
    let __VLS_22;
    const __VLS_23 = {
        onCheck: (__VLS_ctx.handleTreeCheck)
    };
    let __VLS_18;
    let __VLS_19;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_20.slots);
        const [{ data }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
        if (data.isAuth) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (data.label);
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.defaultProps.label(data));
        }
    }
    var __VLS_20;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ ...{ 'onClick': {} }, ...{ style: ({}) }, }));
        const __VLS_26 = __VLS_25({ ...{ 'onClick': {} }, ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_30;
        const __VLS_31 = {
            onClick: (__VLS_ctx.outputSelectedData)
        };
        let __VLS_27;
        let __VLS_28;
        __VLS_nonNullable(__VLS_29.slots).default;
        var __VLS_29;
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onClick': {} }, }));
        const __VLS_34 = __VLS_33({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_38;
        const __VLS_39 = {
            onClick: (__VLS_ctx.toggleExpandAll)
        };
        let __VLS_35;
        let __VLS_36;
        (__VLS_ctx.isExpandAll ? '全部收起' : '全部展开');
        __VLS_nonNullable(__VLS_37.slots).default;
        var __VLS_37;
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ ...{ 'onClick': {} }, ...{ style: ({}) }, }));
        const __VLS_42 = __VLS_41({ ...{ 'onClick': {} }, ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_46;
        const __VLS_47 = {
            onClick: (__VLS_ctx.toggleSelectAll)
        };
        let __VLS_43;
        let __VLS_44;
        (__VLS_ctx.isSelectAll ? '取消全选' : '全部选择');
        __VLS_nonNullable(__VLS_45.slots).default;
        var __VLS_45;
        const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_50 = __VLS_49({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_54;
        const __VLS_55 = {
            onClick: (__VLS_ctx.savePermission)
        };
        let __VLS_51;
        let __VLS_52;
        __VLS_nonNullable(__VLS_53.slots).default;
        var __VLS_53;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['el-dialog-border'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "treeRef": __VLS_21,
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
            treeRef: treeRef,
            isExpandAll: isExpandAll,
            isSelectAll: isSelectAll,
            visible: visible,
            processedMenuList: processedMenuList,
            defaultProps: defaultProps,
            handleClose: handleClose,
            savePermission: savePermission,
            toggleExpandAll: toggleExpandAll,
            toggleSelectAll: toggleSelectAll,
            handleTreeCheck: handleTreeCheck,
            outputSelectedData: outputSelectedData,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=role-permission-dialog.vue.js.map