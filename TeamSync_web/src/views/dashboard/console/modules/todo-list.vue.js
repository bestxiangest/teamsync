/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
/**
 * 待办事项列表
 * 记录每日工作任务及完成状态
 */
const list = reactive([
    {
        username: '查看今天工作内容',
        date: '上午 09:30',
        complate: true
    },
    {
        username: '回复邮件',
        date: '上午 10:30',
        complate: true
    },
    {
        username: '工作汇报整理',
        date: '上午 11:00',
        complate: true
    },
    {
        username: '产品需求会议',
        date: '下午 02:00',
        complate: false
    },
    {
        username: '整理会议内容',
        date: '下午 03:30',
        complate: false
    },
    {
        username: '明天工作计划',
        date: '下午 06:30',
        complate: false
    }
]); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card h-128 p-5 mb-5 max-sm:mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-danger") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("h-[calc(100%-40px)] overflow-auto") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0") }, key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-sm") }, });
        (item.username);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-g-500 mt-1") }, });
        (item.date);
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
        /** @type { [typeof __VLS_components.ElCheckbox, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ modelValue: ((item.complate)), }));
        const __VLS_8 = __VLS_7({ modelValue: ((item.complate)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['h-128'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['art-card-header'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['text-danger'];
    __VLS_styleScopedClasses['h-[calc(100%-40px)]'];
    __VLS_styleScopedClasses['overflow-auto'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['h-17.5'];
    __VLS_styleScopedClasses['border-b'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['last:border-b-0'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['mt-1'];
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
            list: list,
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
//# sourceMappingURL=todo-list.vue.js.map