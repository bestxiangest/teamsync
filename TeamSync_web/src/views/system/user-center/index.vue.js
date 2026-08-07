/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'UserCenter' });
const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);
const isEdit = ref(false);
const isEditPwd = ref(false);
const date = ref('');
const ruleFormRef = ref();
/**
 * 用户信息表单
 */
const form = reactive({
    realName: 'John Snow',
    nikeName: '皮卡丘',
    email: '59301283@mall.com',
    mobile: '18888888888',
    address: '广东省深圳市宝安区西乡街道101栋201',
    sex: '2',
    des: '抓资源、控节奏、强推进，确保项目高效落地。'
});
/**
 * 密码修改表单
 */
const pwdForm = reactive({
    password: '123456',
    newPassword: '123456',
    confirmPassword: '123456'
});
/**
 * 表单验证规则
 */
const rules = reactive({
    realName: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    nikeName: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
    sex: [{ required: true, message: '请选择性别', trigger: 'blur' }]
});
/**
 * 性别选项
 */
const options = [
    { value: '1', label: '男' },
    { value: '2', label: '女' }
];
/**
 * 用户标签列表
 */
const lableList = ['专注设计', '很有想法', '辣~', '大长腿', '川妹子', '海纳百川'];
onMounted(() => {
    getDate();
});
/**
 * 根据当前时间获取问候语
 */
const getDate = () => {
    const h = new Date().getHours();
    if (h >= 6 && h < 9)
        date.value = '早上好';
    else if (h >= 9 && h < 11)
        date.value = '上午好';
    else if (h >= 11 && h < 13)
        date.value = '中午好';
    else if (h >= 13 && h < 18)
        date.value = '下午好';
    else if (h >= 18 && h < 24)
        date.value = '晚上好';
    else
        date.value = '很晚了，早点睡';
};
/**
 * 切换用户信息编辑状态
 */
const edit = () => {
    isEdit.value = !isEdit.value;
};
/**
 * 切换密码编辑状态
 */
const editPwd = () => {
    isEditPwd.value = !isEditPwd.value;
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full h-full p-0 bg-transparent border-none shadow-none") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative flex-b mt-2.5 max-md:block max-md:mt-1") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-112 mr-5 max-md:w-full max-md:mr-0") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-sm relative p-9 pb-6 overflow-hidden text-center") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("absolute top-0 left-0 w-full h-50 object-cover") }, src: ("@imgs/user/bg.webp"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full") }, src: ("@imgs/user/avatar.webp"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("mt-5 text-xl font-normal") }, });
    (__VLS_ctx.userInfo.username);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-5 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-75 mx-auto mt-7.5 text-left") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ("ri:mail-line"), ...{ class: ("text-g-700") }, }));
    const __VLS_2 = __VLS_1({ icon: ("ri:mail-line"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ("ri:user-3-line"), ...{ class: ("text-g-700") }, }));
    const __VLS_8 = __VLS_7({ icon: ("ri:user-3-line"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ icon: ("ri:map-pin-line"), ...{ class: ("text-g-700") }, }));
    const __VLS_14 = __VLS_13({ icon: ("ri:map-pin-line"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ icon: ("ri:dribbble-fill"), ...{ class: ("text-g-700") }, }));
    const __VLS_20 = __VLS_19({ icon: ("ri:dribbble-fill"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-10") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("text-sm font-medium") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-wrap justify-center mt-3.5") }, });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.lableList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((item)), ...{ class: ("py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded") }, });
        (item);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-1 overflow-hidden max-md:w-full max-md:mt-3.5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("p-4 text-xl font-normal border-b border-g-300") }, });
    const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ model: ((__VLS_ctx.form)), ...{ class: ("box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full") }, ref: ("ruleFormRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("86px"), labelPosition: ("top"), }));
    const __VLS_26 = __VLS_25({ model: ((__VLS_ctx.form)), ...{ class: ("box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full") }, ref: ("ruleFormRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("86px"), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore navigation for `const ruleFormRef = ref()`
    __VLS_ctx.ruleFormRef;
    var __VLS_30 = {};
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({}));
    const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ label: ("姓名"), prop: ("realName"), }));
    const __VLS_39 = __VLS_38({ label: ("姓名"), prop: ("realName"), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ modelValue: ((__VLS_ctx.form.realName)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_45 = __VLS_44({ modelValue: ((__VLS_ctx.form.realName)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_nonNullable(__VLS_42.slots).default;
    var __VLS_42;
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ label: ("性别"), prop: ("sex"), ...{ class: ("ml-5") }, }));
    const __VLS_51 = __VLS_50({ label: ("性别"), prop: ("sex"), ...{ class: ("ml-5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ modelValue: ((__VLS_ctx.form.sex)), placeholder: ("Select"), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_57 = __VLS_56({ modelValue: ((__VLS_ctx.form.sex)), placeholder: ("Select"), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.options))) {
        const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, ] } */
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ key: ((item.value)), label: ((item.label)), value: ((item.value)), }));
        const __VLS_63 = __VLS_62({ key: ((item.value)), label: ((item.label)), value: ((item.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    }
    __VLS_nonNullable(__VLS_60.slots).default;
    var __VLS_60;
    __VLS_nonNullable(__VLS_54.slots).default;
    var __VLS_54;
    __VLS_nonNullable(__VLS_36.slots).default;
    var __VLS_36;
    const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
    const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
    const __VLS_73 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({ label: ("昵称"), prop: ("nikeName"), }));
    const __VLS_75 = __VLS_74({ label: ("昵称"), prop: ("nikeName"), }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    const __VLS_79 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({ modelValue: ((__VLS_ctx.form.nikeName)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_81 = __VLS_80({ modelValue: ((__VLS_ctx.form.nikeName)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    __VLS_nonNullable(__VLS_78.slots).default;
    var __VLS_78;
    const __VLS_85 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({ label: ("邮箱"), prop: ("email"), ...{ class: ("ml-5") }, }));
    const __VLS_87 = __VLS_86({ label: ("邮箱"), prop: ("email"), ...{ class: ("ml-5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    const __VLS_91 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({ modelValue: ((__VLS_ctx.form.email)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_93 = __VLS_92({ modelValue: ((__VLS_ctx.form.email)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    __VLS_nonNullable(__VLS_90.slots).default;
    var __VLS_90;
    __VLS_nonNullable(__VLS_72.slots).default;
    var __VLS_72;
    const __VLS_97 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
    const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
    const __VLS_103 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({ label: ("手机"), prop: ("mobile"), }));
    const __VLS_105 = __VLS_104({ label: ("手机"), prop: ("mobile"), }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    const __VLS_109 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({ modelValue: ((__VLS_ctx.form.mobile)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_111 = __VLS_110({ modelValue: ((__VLS_ctx.form.mobile)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_nonNullable(__VLS_108.slots).default;
    var __VLS_108;
    const __VLS_115 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({ label: ("地址"), prop: ("address"), ...{ class: ("ml-5") }, }));
    const __VLS_117 = __VLS_116({ label: ("地址"), prop: ("address"), ...{ class: ("ml-5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    const __VLS_121 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({ modelValue: ((__VLS_ctx.form.address)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_123 = __VLS_122({ modelValue: ((__VLS_ctx.form.address)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_nonNullable(__VLS_120.slots).default;
    var __VLS_120;
    __VLS_nonNullable(__VLS_102.slots).default;
    var __VLS_102;
    const __VLS_127 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({ label: ("个人介绍"), prop: ("des"), ...{ class: ("h-32") }, }));
    const __VLS_129 = __VLS_128({ label: ("个人介绍"), prop: ("des"), ...{ class: ("h-32") }, }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    const __VLS_133 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({ type: ("textarea"), rows: ((4)), modelValue: ((__VLS_ctx.form.des)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_135 = __VLS_134({ type: ("textarea"), rows: ((4)), modelValue: ((__VLS_ctx.form.des)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    __VLS_nonNullable(__VLS_132.slots).default;
    var __VLS_132;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c justify-end [&_.el-button]:!w-27.5") }, });
    const __VLS_139 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }));
    const __VLS_141 = __VLS_140({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_145;
    const __VLS_146 = {
        onClick: (__VLS_ctx.edit)
    };
    let __VLS_142;
    let __VLS_143;
    (__VLS_ctx.isEdit ? '保存' : '编辑');
    __VLS_nonNullable(__VLS_144.slots).default;
    var __VLS_144;
    __VLS_nonNullable(__VLS_29.slots).default;
    var __VLS_29;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-sm my-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("p-4 text-xl font-normal border-b border-g-300") }, });
    const __VLS_147 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({ model: ((__VLS_ctx.pwdForm)), ...{ class: ("box-border p-5") }, labelWidth: ("86px"), labelPosition: ("top"), }));
    const __VLS_149 = __VLS_148({ model: ((__VLS_ctx.pwdForm)), ...{ class: ("box-border p-5") }, labelWidth: ("86px"), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    const __VLS_153 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({ label: ("当前密码"), prop: ("password"), }));
    const __VLS_155 = __VLS_154({ label: ("当前密码"), prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    const __VLS_159 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({ modelValue: ((__VLS_ctx.pwdForm.password)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), }));
    const __VLS_161 = __VLS_160({ modelValue: ((__VLS_ctx.pwdForm.password)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    __VLS_nonNullable(__VLS_158.slots).default;
    var __VLS_158;
    const __VLS_165 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({ label: ("新密码"), prop: ("newPassword"), }));
    const __VLS_167 = __VLS_166({ label: ("新密码"), prop: ("newPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    const __VLS_171 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({ modelValue: ((__VLS_ctx.pwdForm.newPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), }));
    const __VLS_173 = __VLS_172({ modelValue: ((__VLS_ctx.pwdForm.newPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    __VLS_nonNullable(__VLS_170.slots).default;
    var __VLS_170;
    const __VLS_177 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({ label: ("确认新密码"), prop: ("confirmPassword"), }));
    const __VLS_179 = __VLS_178({ label: ("确认新密码"), prop: ("confirmPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    const __VLS_183 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({ modelValue: ((__VLS_ctx.pwdForm.confirmPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), }));
    const __VLS_185 = __VLS_184({ modelValue: ((__VLS_ctx.pwdForm.confirmPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    __VLS_nonNullable(__VLS_182.slots).default;
    var __VLS_182;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c justify-end [&_.el-button]:!w-27.5") }, });
    const __VLS_189 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }));
    const __VLS_191 = __VLS_190({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_190));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_195;
    const __VLS_196 = {
        onClick: (__VLS_ctx.editPwd)
    };
    let __VLS_192;
    let __VLS_193;
    (__VLS_ctx.isEditPwd ? '保存' : '编辑');
    __VLS_nonNullable(__VLS_194.slots).default;
    var __VLS_194;
    __VLS_nonNullable(__VLS_152.slots).default;
    var __VLS_152;
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['p-0'];
    __VLS_styleScopedClasses['bg-transparent'];
    __VLS_styleScopedClasses['border-none'];
    __VLS_styleScopedClasses['shadow-none'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['max-md:block'];
    __VLS_styleScopedClasses['max-md:mt-1'];
    __VLS_styleScopedClasses['w-112'];
    __VLS_styleScopedClasses['mr-5'];
    __VLS_styleScopedClasses['max-md:w-full'];
    __VLS_styleScopedClasses['max-md:mr-0'];
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['p-9'];
    __VLS_styleScopedClasses['pb-6'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-50'];
    __VLS_styleScopedClasses['object-cover'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['z-10'];
    __VLS_styleScopedClasses['w-20'];
    __VLS_styleScopedClasses['h-20'];
    __VLS_styleScopedClasses['mt-30'];
    __VLS_styleScopedClasses['mx-auto'];
    __VLS_styleScopedClasses['object-cover'];
    __VLS_styleScopedClasses['border-2'];
    __VLS_styleScopedClasses['border-white'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['w-75'];
    __VLS_styleScopedClasses['mx-auto'];
    __VLS_styleScopedClasses['mt-7.5'];
    __VLS_styleScopedClasses['text-left'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mt-10'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['mt-3.5'];
    __VLS_styleScopedClasses['py-1'];
    __VLS_styleScopedClasses['px-1.5'];
    __VLS_styleScopedClasses['mr-2.5'];
    __VLS_styleScopedClasses['mb-2.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['max-md:w-full'];
    __VLS_styleScopedClasses['max-md:mt-3.5'];
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['border-b'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['[&>.el-row_.el-form-item]:w-[calc(50%-10px)]'];
    __VLS_styleScopedClasses['[&>.el-row_.el-input]:w-full'];
    __VLS_styleScopedClasses['[&>.el-row_.el-select]:w-full'];
    __VLS_styleScopedClasses['ml-5'];
    __VLS_styleScopedClasses['ml-5'];
    __VLS_styleScopedClasses['ml-5'];
    __VLS_styleScopedClasses['h-32'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['[&_.el-button]:!w-27.5'];
    __VLS_styleScopedClasses['w-22.5'];
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['my-5'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['border-b'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['[&_.el-button]:!w-27.5'];
    __VLS_styleScopedClasses['w-22.5'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "ruleFormRef": __VLS_30,
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
            userInfo: userInfo,
            isEdit: isEdit,
            isEditPwd: isEditPwd,
            ruleFormRef: ruleFormRef,
            form: form,
            pwdForm: pwdForm,
            rules: rules,
            options: options,
            lableList: lableList,
            edit: edit,
            editPwd: editPwd,
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