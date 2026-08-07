/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtButtonTable' });
const props = withDefaults(defineProps(), {});
const emit = defineEmits();
// 默认按钮配置
const defaultButtons = {
    add: { icon: 'ri:add-fill', class: 'bg-theme/12 text-theme' },
    edit: { icon: 'ri:pencil-line', class: 'bg-secondary/12 text-secondary' },
    delete: { icon: 'ri:delete-bin-5-line', class: 'bg-error/12 text-error' },
    view: { icon: 'ri:eye-line', class: 'bg-info/12 text-info' },
    more: { icon: 'ri:more-2-fill', class: '' }
};
// 获取图标内容
const iconContent = computed(() => {
    return props.icon || (props.type ? defaultButtons[props.type]?.icon : '') || '';
});
// 获取按钮样式类
const buttonClass = computed(() => {
    return props.iconClass || (props.type ? defaultButtons[props.type]?.class : '') || '';
});
const handleClick = () => {
    emit('click');
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({});
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleClick) }, ...{ class: (([
                'inline-flex items-center justify-center min-w-8 h-8 px-2.5 mr-2.5 text-sm c-p rounded-md align-middle',
                __VLS_ctx.buttonClass
            ])) }, ...{ style: (({ backgroundColor: __VLS_ctx.buttonBgColor, color: __VLS_ctx.iconColor })) }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ((__VLS_ctx.iconContent)), }));
    const __VLS_2 = __VLS_1({ icon: ((__VLS_ctx.iconContent)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_styleScopedClasses['inline-flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['min-w-8'];
    __VLS_styleScopedClasses['h-8'];
    __VLS_styleScopedClasses['px-2.5'];
    __VLS_styleScopedClasses['mr-2.5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['rounded-md'];
    __VLS_styleScopedClasses['align-middle'];
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
            iconContent: iconContent,
            buttonClass: buttonClass,
            handleClick: handleClick,
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
//# sourceMappingURL=index.vue.js.map