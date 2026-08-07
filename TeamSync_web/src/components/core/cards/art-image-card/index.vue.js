/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { Picture, View, ChatLineRound } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtImageCard' });
const props = withDefaults(defineProps(), {
    imageUrl: '',
    title: '',
    category: '',
    readTime: '',
    views: 0,
    comments: 0,
    date: ''
});
const emit = defineEmits();
const handleClick = () => {
    emit('click', props);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    imageUrl: '',
    title: '',
    category: '',
    readTime: '',
    views: 0,
    comments: 0,
    date: ''
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleClick) }, ...{ class: ("w-full c-p") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card overflow-hidden") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative w-full aspect-[16/10] overflow-hidden") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElImage;
    /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.ElImage, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ src: ((props.imageUrl)), fit: ("cover"), loading: ("lazy"), ...{ class: ("w-full h-full transition-transform duration-300 ease-in-out hover:scale-105") }, }));
    const __VLS_2 = __VLS_1({ src: ((props.imageUrl)), fit: ("cover"), loading: ("lazy"), ...{ class: ("w-full h-full transition-transform duration-300 ease-in-out hover:scale-105") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { placeholder: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc w-full h-full bg-[#f5f7fa]") }, });
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
        const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.Picture;
        /** @type { [typeof __VLS_components.Picture, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_nonNullable(__VLS_11.slots).default;
        var __VLS_11;
    }
    var __VLS_5;
    if (props.readTime) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("absolute right-3.5 bottom-3.5 py-1 px-2 text-xs bg-g-200 rounded") }, });
        (props.readTime);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("p-4") }, });
    if (props.category) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("inline-block py-0.5 px-2 mb-2 text-xs bg-g-300/70 rounded") }, });
        (props.category);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("m-0 mb-3 text-base font-medium") }, });
    (props.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c gap-4 text-xs text-g-600") }, });
    if (props.views) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("flex-c gap-1") }, });
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ class: ("text-base") }, }));
        const __VLS_20 = __VLS_19({ ...{ class: ("text-base") }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.View;
        /** @type { [typeof __VLS_components.View, ] } */
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_nonNullable(__VLS_23.slots).default;
        var __VLS_23;
        (props.views);
    }
    if (props.comments) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("flex-c gap-1") }, });
        const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ ...{ class: ("text-base") }, }));
        const __VLS_32 = __VLS_31({ ...{ class: ("text-base") }, }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ChatLineRound;
        /** @type { [typeof __VLS_components.ChatLineRound, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_nonNullable(__VLS_35.slots).default;
        var __VLS_35;
        (props.comments);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (props.date);
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['aspect-[16/10]'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['transition-transform'];
    __VLS_styleScopedClasses['duration-300'];
    __VLS_styleScopedClasses['ease-in-out'];
    __VLS_styleScopedClasses['hover:scale-105'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['bg-[#f5f7fa]'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['right-3.5'];
    __VLS_styleScopedClasses['bottom-3.5'];
    __VLS_styleScopedClasses['py-1'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['bg-g-200'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['py-0.5'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['bg-g-300/70'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-4'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-1'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-1'];
    __VLS_styleScopedClasses['text-base'];
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
            Picture: Picture,
            View: View,
            ChatLineRound: ChatLineRound,
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