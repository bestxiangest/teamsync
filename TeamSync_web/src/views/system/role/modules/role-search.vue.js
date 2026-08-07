const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const searchBarRef = ref();
/**
 * 表单数据双向绑定
 */
const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
/**
 * 表单校验规则
 */
const rules = {};
/**
 * 角色状态选项
 */
const statusOptions = ref([
    { label: '启用', value: true },
    { label: '禁用', value: false }
]);
/**
 * 搜索表单配置项
 */
const formItems = computed(() => [
    {
        label: '角色名称',
        key: 'roleName',
        type: 'input',
        placeholder: '请输入角色名称',
        clearable: true
    },
    {
        label: '角色编码',
        key: 'roleCode',
        type: 'input',
        placeholder: '请输入角色编码',
        clearable: true
    },
    {
        label: '角色描述',
        key: 'description',
        type: 'input',
        placeholder: '请输入角色描述',
        clearable: true
    },
    {
        label: '角色状态',
        key: 'enabled',
        type: 'select',
        props: {
            placeholder: '请选择状态',
            options: statusOptions.value,
            clearable: true
        }
    },
    {
        label: '创建日期',
        key: 'daterange',
        type: 'datetime',
        props: {
            style: { width: '100%' },
            placeholder: '请选择日期范围',
            type: 'daterange',
            rangeSeparator: '至',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            valueFormat: 'YYYY-MM-DD',
            shortcuts: [
                { text: '今日', value: [new Date(), new Date()] },
                { text: '最近一周', value: [new Date(Date.now() - 604800000), new Date()] },
                { text: '最近一个月', value: [new Date(Date.now() - 2592000000), new Date()] }
            ]
        }
    }
]);
/**
 * 处理重置事件
 */
const handleReset = () => {
    emit('reset');
};
/**
 * 处理搜索事件
 * 验证表单后触发搜索
 */
const handleSearch = async () => {
    await searchBarRef.value.validate();
    emit('search', formData.value);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSearchBar;
    /** @type { [typeof __VLS_components.ArtSearchBar, typeof __VLS_components.ArtSearchBar, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onReset': {} }, ...{ 'onSearch': {} }, ref: ("searchBarRef"), modelValue: ((__VLS_ctx.formData)), items: ((__VLS_ctx.formItems)), rules: ((__VLS_ctx.rules)), }));
    const __VLS_2 = __VLS_1({ ...{ 'onReset': {} }, ...{ 'onSearch': {} }, ref: ("searchBarRef"), modelValue: ((__VLS_ctx.formData)), items: ((__VLS_ctx.formItems)), rules: ((__VLS_ctx.rules)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const searchBarRef = ref()`
    __VLS_ctx.searchBarRef;
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onReset: (__VLS_ctx.handleReset)
    };
    const __VLS_9 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    let __VLS_3;
    let __VLS_4;
    var __VLS_5;
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "searchBarRef": __VLS_6,
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
            searchBarRef: searchBarRef,
            formData: formData,
            rules: rules,
            formItems: formItems,
            handleReset: handleReset,
            handleSearch: handleSearch,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=role-search.vue.js.map