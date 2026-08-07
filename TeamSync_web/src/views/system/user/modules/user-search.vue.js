const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
// 表单数据双向绑定
const searchBarRef = ref();
const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
// 校验规则
const rules = {
// userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
};
// 动态 options
const statusOptions = ref([]);
// 模拟接口返回状态数据
function fetchStatusOptions() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { label: '在线', value: '1' },
                { label: '离线', value: '2' },
                { label: '异常', value: '3' },
                { label: '注销', value: '4' }
            ]);
        }, 1000);
    });
}
onMounted(async () => {
    statusOptions.value = await fetchStatusOptions();
});
// 表单配置
const formItems = computed(() => [
    {
        label: '用户名',
        key: 'username',
        type: 'input',
        placeholder: '请输入用户名',
        clearable: true
    },
    {
        label: '手机号',
        key: 'userPhone',
        type: 'input',
        props: { placeholder: '请输入手机号', maxlength: '11' }
    },
    {
        label: '邮箱',
        key: 'userEmail',
        type: 'input',
        props: { placeholder: '请输入邮箱' }
    },
    {
        label: '状态',
        key: 'status',
        type: 'select',
        props: {
            placeholder: '请选择状态',
            options: statusOptions.value
        }
    },
    {
        label: '性别',
        key: 'userGender',
        type: 'radiogroup',
        props: {
            options: [
                { label: '男', value: '1' },
                { label: '女', value: '2' }
            ]
        }
    }
]);
// 事件
function handleReset() {
    console.log('重置表单');
    emit('reset');
}
async function handleSearch() {
    await searchBarRef.value.validate();
    emit('search', formData.value);
    console.log('表单数据', formData.value);
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
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
//# sourceMappingURL=user-search.vue.js.map