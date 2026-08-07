import { ElIcon, ElTooltip } from 'element-plus';
import { QuestionFilled } from '@element-plus/icons-vue';
import { formatMenuTitle } from '@/utils/router';
import ArtForm from '@/components/core/forms/art-form/index.vue';
import { useWindowSize } from '@vueuse/core';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const { width } = useWindowSize();
/**
 * 创建带 tooltip 的表单标签
 * @param label 标签文本
 * @param tooltip 提示文本
 * @returns 渲染函数
 */
const createLabelTooltip = (label, tooltip) => {
    return () => h('span', { class: 'flex items-center' }, [
        h('span', label),
        h(ElTooltip, {
            content: tooltip,
            placement: 'top'
        }, () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled)))
    ]);
};
const props = withDefaults(defineProps(), {
    visible: false,
    type: 'menu',
    lockType: false
});
const emit = defineEmits();
const formRef = ref();
const isEdit = ref(false);
const form = reactive({
    menuType: 'menu',
    id: 0,
    name: '',
    path: '',
    label: '',
    component: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHide: false,
    isHideTab: false,
    link: '',
    isIframe: false,
    showBadge: false,
    showTextBadge: '',
    fixedTab: false,
    activePath: '',
    roles: [],
    isFullPage: false,
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1
});
const rules = reactive({
    name: [
        { required: true, message: '请输入菜单名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    label: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
});
/**
 * 表单项配置
 */
const formItems = computed(() => {
    const baseItems = [{ label: '菜单类型', key: 'menuType', span: 24 }];
    // Switch 组件的 span：小屏幕 12，大屏幕 6
    const switchSpan = width.value < 640 ? 12 : 6;
    if (form.menuType === 'menu') {
        return [
            ...baseItems,
            { label: '菜单名称', key: 'name', type: 'input', props: { placeholder: '菜单名称' } },
            {
                label: createLabelTooltip('路由地址', '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'),
                key: 'path',
                type: 'input',
                props: { placeholder: '如：/dashboard 或 console' }
            },
            { label: '权限标识', key: 'label', type: 'input', props: { placeholder: '如：User' } },
            {
                label: createLabelTooltip('组件路径', '一级父级菜单：填写 /index/index\n具体页面：填写组件路径（如 /system/user）\n目录菜单：留空'),
                key: 'component',
                type: 'input',
                props: { placeholder: '如：/system/user 或留空' }
            },
            { label: '图标', key: 'icon', type: 'input', props: { placeholder: '如：ri:user-line' } },
            {
                label: createLabelTooltip('角色权限', '仅用于前端权限模式：配置角色标识（如 R_SUPER、R_ADMIN）\n后端权限模式：无需配置'),
                key: 'roles',
                type: 'inputtag',
                props: { placeholder: '输入角色标识后按回车，如：R_SUPER' }
            },
            {
                label: '菜单排序',
                key: 'sort',
                type: 'number',
                props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
            },
            {
                label: '外部链接',
                key: 'link',
                type: 'input',
                props: { placeholder: '如：https://www.example.com' }
            },
            {
                label: '文本徽章',
                key: 'showTextBadge',
                type: 'input',
                props: { placeholder: '如：New、Hot' }
            },
            {
                label: createLabelTooltip('激活路径', '用于详情页等隐藏菜单，指定高亮显示的父级菜单路径\n例如：用户详情页高亮显示"用户管理"菜单'),
                key: 'activePath',
                type: 'input',
                props: { placeholder: '如：/system/user' }
            },
            { label: '是否启用', key: 'isEnable', type: 'switch', span: switchSpan },
            { label: '页面缓存', key: 'keepAlive', type: 'switch', span: switchSpan },
            { label: '隐藏菜单', key: 'isHide', type: 'switch', span: switchSpan },
            { label: '是否内嵌', key: 'isIframe', type: 'switch', span: switchSpan },
            { label: '显示徽章', key: 'showBadge', type: 'switch', span: switchSpan },
            { label: '固定标签', key: 'fixedTab', type: 'switch', span: switchSpan },
            { label: '标签隐藏', key: 'isHideTab', type: 'switch', span: switchSpan },
            { label: '全屏页面', key: 'isFullPage', type: 'switch', span: switchSpan }
        ];
    }
    else {
        return [
            ...baseItems,
            {
                label: '权限名称',
                key: 'authName',
                type: 'input',
                props: { placeholder: '如：新增、编辑、删除' }
            },
            {
                label: '权限标识',
                key: 'authLabel',
                type: 'input',
                props: { placeholder: '如：add、edit、delete' }
            },
            {
                label: '权限排序',
                key: 'authSort',
                type: 'number',
                props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
            }
        ];
    }
});
const dialogTitle = computed(() => {
    const type = form.menuType === 'menu' ? '菜单' : '按钮';
    return isEdit.value ? `编辑${type}` : `新建${type}`;
});
/**
 * 是否禁用菜单类型切换
 */
const disableMenuType = computed(() => {
    if (isEdit.value)
        return true;
    if (!isEdit.value && form.menuType === 'menu' && props.lockType)
        return true;
    return false;
});
/**
 * 重置表单数据
 */
const resetForm = () => {
    formRef.value?.reset();
    form.menuType = 'menu';
};
/**
 * 加载表单数据（编辑模式）
 */
const loadFormData = () => {
    if (!props.editData)
        return;
    isEdit.value = true;
    if (form.menuType === 'menu') {
        const row = props.editData;
        form.id = row.id || 0;
        form.name = formatMenuTitle(row.meta?.title || '');
        form.path = row.path || '';
        form.label = row.name || '';
        form.component = row.component || '';
        form.icon = row.meta?.icon || '';
        form.sort = row.meta?.sort || 1;
        form.isMenu = row.meta?.isMenu ?? true;
        form.keepAlive = row.meta?.keepAlive ?? false;
        form.isHide = row.meta?.isHide ?? false;
        form.isHideTab = row.meta?.isHideTab ?? false;
        form.isEnable = row.meta?.isEnable ?? true;
        form.link = row.meta?.link || '';
        form.isIframe = row.meta?.isIframe ?? false;
        form.showBadge = row.meta?.showBadge ?? false;
        form.showTextBadge = row.meta?.showTextBadge || '';
        form.fixedTab = row.meta?.fixedTab ?? false;
        form.activePath = row.meta?.activePath || '';
        form.roles = row.meta?.roles || [];
        form.isFullPage = row.meta?.isFullPage ?? false;
    }
    else {
        const row = props.editData;
        form.authName = row.title || '';
        form.authLabel = row.authMark || '';
        form.authIcon = row.icon || '';
        form.authSort = row.sort || 1;
    }
};
/**
 * 提交表单
 */
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        emit('submit', { ...form });
        ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`);
        handleCancel();
    }
    catch {
        ElMessage.error('表单校验失败，请检查输入');
    }
};
/**
 * 取消操作
 */
const handleCancel = () => {
    emit('update:visible', false);
};
/**
 * 对话框关闭后的回调
 */
const handleClosed = () => {
    resetForm();
    isEdit.value = false;
};
/**
 * 监听对话框显示状态
 */
watch(() => props.visible, (newVal) => {
    if (newVal) {
        form.menuType = props.type;
        nextTick(() => {
            if (props.editData) {
                loadFormData();
            }
        });
    }
});
/**
 * 监听菜单类型变化
 */
watch(() => props.type, (newType) => {
    if (props.visible) {
        form.menuType = newType;
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    visible: false,
    type: 'menu',
    lockType: false
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onUpdate:modelValue': {} }, ...{ 'onClosed': {} }, title: ((__VLS_ctx.dialogTitle)), modelValue: ((__VLS_ctx.visible)), width: ("860px"), alignCenter: (true), ...{ class: ("menu-dialog") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onUpdate:modelValue': {} }, ...{ 'onClosed': {} }, title: ((__VLS_ctx.dialogTitle)), modelValue: ((__VLS_ctx.visible)), width: ("860px"), alignCenter: (true), ...{ class: ("menu-dialog") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        'onUpdate:modelValue': (__VLS_ctx.handleCancel)
    };
    const __VLS_9 = {
        onClosed: (__VLS_ctx.handleClosed)
    };
    let __VLS_3;
    let __VLS_4;
    // @ts-ignore
    [ArtForm, ArtForm,];
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(ArtForm, new ArtForm({ ref: ("formRef"), modelValue: ((__VLS_ctx.form)), items: ((__VLS_ctx.formItems)), rules: ((__VLS_ctx.rules)), span: ((__VLS_ctx.width > 640 ? 12 : 24)), gutter: ((20)), labelWidth: ("100px"), showReset: ((false)), showSubmit: ((false)), }));
    const __VLS_11 = __VLS_10({ ref: ("formRef"), modelValue: ((__VLS_ctx.form)), items: ((__VLS_ctx.formItems)), rules: ((__VLS_ctx.rules)), span: ((__VLS_ctx.width > 640 ? 12 : 24)), gutter: ((20)), labelWidth: ("100px"), showReset: ((false)), showSubmit: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_15 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { menuType: __VLS_thisSlot } = __VLS_nonNullable(__VLS_14.slots);
        const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
        /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.ElRadioGroup, ] } */
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ modelValue: ((__VLS_ctx.form.menuType)), disabled: ((__VLS_ctx.disableMenuType)), }));
        const __VLS_18 = __VLS_17({ modelValue: ((__VLS_ctx.form.menuType)), disabled: ((__VLS_ctx.disableMenuType)), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ value: ("menu"), label: ("menu"), }));
        const __VLS_24 = __VLS_23({ value: ("menu"), label: ("menu"), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        __VLS_nonNullable(__VLS_27.slots).default;
        var __VLS_27;
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ value: ("button"), label: ("button"), }));
        const __VLS_30 = __VLS_29({ value: ("button"), label: ("button"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_nonNullable(__VLS_33.slots).default;
        var __VLS_33;
        __VLS_nonNullable(__VLS_21.slots).default;
        var __VLS_21;
    }
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dialog-footer") }, });
        const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ ...{ 'onClick': {} }, }));
        const __VLS_36 = __VLS_35({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        let __VLS_40;
        const __VLS_41 = {
            onClick: (__VLS_ctx.handleCancel)
        };
        let __VLS_37;
        let __VLS_38;
        __VLS_nonNullable(__VLS_39.slots).default;
        var __VLS_39;
        const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_44 = __VLS_43({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        let __VLS_48;
        const __VLS_49 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_45;
        let __VLS_46;
        __VLS_nonNullable(__VLS_47.slots).default;
        var __VLS_47;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['menu-dialog'];
    __VLS_styleScopedClasses['dialog-footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_15,
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
            ArtForm: ArtForm,
            width: width,
            formRef: formRef,
            form: form,
            rules: rules,
            formItems: formItems,
            dialogTitle: dialogTitle,
            disableMenuType: disableMenuType,
            handleSubmit: handleSubmit,
            handleCancel: handleCancel,
            handleClosed: handleClosed,
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
//# sourceMappingURL=menu-dialog.vue.js.map