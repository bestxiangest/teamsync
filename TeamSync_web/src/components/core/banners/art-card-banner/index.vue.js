/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
// 导入默认图标
import defaultIcon from '@imgs/3d/icon1.webp';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtCardBanner' });
const __VLS_props = withDefaults(defineProps(), {
    height: '24rem',
    image: defaultIcon,
    title: '',
    description: '',
    // 主按钮默认配置
    button: () => ({
        show: true,
        text: '查看详情',
        color: 'var(--theme-color)',
        textColor: '#fff'
    }),
    // 取消按钮默认配置
    cancelButton: () => ({
        show: false,
        text: '取消',
        color: '#f5f5f5',
        textColor: '#666'
    })
});
const emit = defineEmits();
// 主按钮点击处理函数
const handleClick = () => {
    emit('click');
};
// 取消按钮点击处理函数
const handleCancel = () => {
    emit('cancel');
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: '24rem',
    image: defaultIcon,
    title: '',
    description: '',
    // 主按钮默认配置
    button: () => ({
        show: true,
        text: '查看详情',
        color: 'var(--theme-color)',
        textColor: '#fff'
    }),
    // 取消按钮默认配置
    cancelButton: () => ({
        show: false,
        text: '取消',
        color: '#f5f5f5',
        textColor: '#666'
    })
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-sm flex-c flex-col pb-6") }, ...{ style: (({ height: __VLS_ctx.height })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c flex-col gap-4 text-center") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-45") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((__VLS_ctx.image)), alt: ((__VLS_ctx.title)), ...{ class: ("w-full h-full object-contain") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-border px-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mb-2 text-lg font-semibold text-g-800") }, });
    (__VLS_ctx.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("m-0 text-sm text-g-600") }, });
    (__VLS_ctx.description);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c gap-3") }, });
    if (__VLS_ctx.cancelButton?.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleCancel) }, ...{ class: ("inline-block h-9 px-3 text-sm/9 c-p select-none rounded-md border border-g-300") }, ...{ style: (({
                    backgroundColor: __VLS_ctx.cancelButton?.color,
                    color: __VLS_ctx.cancelButton?.textColor
                })) }, });
        (__VLS_ctx.cancelButton?.text);
    }
    if (__VLS_ctx.button?.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleClick) }, ...{ class: ("inline-block h-9 px-3 text-sm/9 c-p select-none rounded-md") }, ...{ style: (({ backgroundColor: __VLS_ctx.button?.color, color: __VLS_ctx.button?.textColor })) }, });
        (__VLS_ctx.button?.text);
    }
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['pb-6'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['gap-4'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['w-45'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['object-contain'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['px-4'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['font-semibold'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-3'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['h-9'];
    __VLS_styleScopedClasses['px-3'];
    __VLS_styleScopedClasses['text-sm/9'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded-md'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['h-9'];
    __VLS_styleScopedClasses['px-3'];
    __VLS_styleScopedClasses['text-sm/9'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded-md'];
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
            handleClick: handleClick,
            handleCancel: handleCancel,
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