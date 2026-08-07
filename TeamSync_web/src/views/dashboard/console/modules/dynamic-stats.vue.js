/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
/**
 * 用户动态列表
 * 记录用户的关注、发文、提问、兑换等各类活动
 */
const list = reactive([
    {
        username: '中小鱼',
        type: '关注了',
        target: '誶誶淰'
    },
    {
        username: '何小荷',
        type: '发表文章',
        target: 'Vue3 + Typescript + Vite 项目实战笔记'
    },
    {
        username: '中小鱼',
        type: '关注了',
        target: '誶誶淰'
    },
    {
        username: '何小荷',
        type: '发表文章',
        target: 'Vue3 + Typescript + Vite 项目实战笔记'
    },
    {
        username: '誶誶淰',
        type: '提出问题',
        target: '主题可以配置吗'
    },
    {
        username: '发呆草',
        type: '兑换了物品',
        target: '《奇特的一生》'
    },
    {
        username: '甜筒',
        type: '关闭了问题',
        target: '发呆草'
    },
    {
        username: '冷月呆呆',
        type: '兑换了物品',
        target: '《高效人士的七个习惯》'
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-success") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("h-9/10 mt-2 overflow-hidden") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden last:border-b-0") }, key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-g-800 font-medium") }, });
        (item.username);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("mx-2 text-g-600") }, });
        (item.type);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-theme") }, });
        (item.target);
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
    __VLS_styleScopedClasses['text-success'];
    __VLS_styleScopedClasses['h-9/10'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['h-17.5'];
    __VLS_styleScopedClasses['leading-17.5'];
    __VLS_styleScopedClasses['border-b'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['last:border-b-0'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mx-2'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['text-theme'];
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
//# sourceMappingURL=dynamic-stats.vue.js.map