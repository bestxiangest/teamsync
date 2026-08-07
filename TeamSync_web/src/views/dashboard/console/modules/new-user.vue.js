/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import avatar1 from '@/assets/images/avatar/avatar1.webp';
import avatar2 from '@/assets/images/avatar/avatar2.webp';
import avatar3 from '@/assets/images/avatar/avatar3.webp';
import avatar4 from '@/assets/images/avatar/avatar4.webp';
import avatar5 from '@/assets/images/avatar/avatar5.webp';
import avatar6 from '@/assets/images/avatar/avatar6.webp';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const ANIMATION_DELAY = 100;
const radio2 = ref('本月');
/**
 * 新用户表格数据
 * 包含用户基本信息和完成进度
 */
const tableData = reactive([
    {
        username: '中小鱼',
        province: '北京',
        sex: 0,
        age: 22,
        percentage: 60,
        pro: 0,
        color: 'var(--art-primary)',
        avatar: avatar1
    },
    {
        username: '何小荷',
        province: '深圳',
        sex: 1,
        age: 21,
        percentage: 20,
        pro: 0,
        color: 'var(--art-secondary)',
        avatar: avatar2
    },
    {
        username: '誶誶淰',
        province: '上海',
        sex: 1,
        age: 23,
        percentage: 60,
        pro: 0,
        color: 'var(--art-warning)',
        avatar: avatar3
    },
    {
        username: '发呆草',
        province: '长沙',
        sex: 0,
        age: 28,
        percentage: 50,
        pro: 0,
        color: 'var(--art-info)',
        avatar: avatar4
    },
    {
        username: '甜筒',
        province: '浙江',
        sex: 1,
        age: 26,
        percentage: 70,
        pro: 0,
        color: 'var(--art-error)',
        avatar: avatar5
    },
    {
        username: '冷月呆呆',
        province: '湖北',
        sex: 1,
        age: 25,
        percentage: 90,
        pro: 0,
        color: 'var(--art-success)',
        avatar: avatar6
    }
]);
/**
 * 添加进度条动画效果
 * 延迟后将进度值从 0 更新到目标百分比，触发动画
 */
const addAnimation = () => {
    setTimeout(() => {
        tableData.forEach((item) => {
            item.pro = item.percentage;
        });
    }, ANIMATION_DELAY);
};
onMounted(() => {
    addAnimation();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-5 h-128 overflow-hidden mb-5 max-sm:mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-success") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
    /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.ElRadioGroup, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.radio2)), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.radio2)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
    /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ value: ("本月"), label: ("本月"), }));
    const __VLS_8 = __VLS_7({ value: ("本月"), label: ("本月"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
    /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ value: ("上月"), label: ("上月"), }));
    const __VLS_14 = __VLS_13({ value: ("上月"), label: ("上月"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
    /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ value: ("今年"), label: ("今年"), }));
    const __VLS_20 = __VLS_19({ value: ("今年"), label: ("今年"), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ArtTable;
    /** @type { [typeof __VLS_components.ArtTable, typeof __VLS_components.ArtTable, ] } */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ ...{ class: ("w-full") }, data: ((__VLS_ctx.tableData)), ...{ style: ({}) }, size: ("large"), border: ((false)), stripe: ((false)), headerCellStyle: (({ background: 'transparent' })), }));
    const __VLS_26 = __VLS_25({ ...{ class: ("w-full") }, data: ((__VLS_ctx.tableData)), ...{ style: ({}) }, size: ("large"), border: ((false)), stripe: ((false)), headerCellStyle: (({ background: 'transparent' })), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_29.slots);
        const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ label: ("头像"), prop: ("avatar"), width: ("150px"), }));
        const __VLS_32 = __VLS_31({ label: ("头像"), prop: ("avatar"), width: ("150px"), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_35.slots);
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("size-9 rounded-lg") }, src: ((scope.row.avatar)), alt: ("avatar"), });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2") }, });
            (scope.row.username);
        }
        var __VLS_35;
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ label: ("地区"), prop: ("province"), }));
        const __VLS_38 = __VLS_37({ label: ("地区"), prop: ("province"), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ label: ("性别"), prop: ("avatar"), }));
        const __VLS_44 = __VLS_43({ label: ("性别"), prop: ("avatar"), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_47.slots);
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ style: ({}) }, });
            (scope.row.sex === 1 ? '男' : '女');
        }
        var __VLS_47;
        const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ label: ("进度"), width: ("240"), }));
        const __VLS_50 = __VLS_49({ label: ("进度"), width: ("240"), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_53.slots);
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
            /** @type { [typeof __VLS_components.ElProgress, ] } */
            // @ts-ignore
            const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ percentage: ((scope.row.pro)), color: ((scope.row.color)), strokeWidth: ((4)), "aria-label": ((`${scope.row.username}的完成进度: ${scope.row.pro}%`)), }));
            const __VLS_56 = __VLS_55({ percentage: ((scope.row.pro)), color: ((scope.row.color)), strokeWidth: ((4)), "aria-label": ((`${scope.row.username}的完成进度: ${scope.row.pro}%`)), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        }
        var __VLS_53;
    }
    var __VLS_29;
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['h-128'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['art-card-header'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['text-success'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['size-9'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['ml-2'];
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
            radio2: radio2,
            tableData: tableData,
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
//# sourceMappingURL=new-user.vue.js.map