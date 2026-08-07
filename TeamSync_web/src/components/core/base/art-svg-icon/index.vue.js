/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { Icon } from '@iconify/vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtSvgIcon', inheritAttrs: false });
const __VLS_props = defineProps();
const attrs = useAttrs();
const bindAttrs = computed(() => ({
    class: attrs.class || '',
    style: attrs.style || ''
})); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    if (__VLS_ctx.icon) {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.Icon;
        /** @type { [typeof __VLS_components.Icon, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ((__VLS_ctx.icon)), ...(__VLS_ctx.bindAttrs), ...{ class: ("art-svg-icon inline") }, }));
        const __VLS_2 = __VLS_1({ icon: ((__VLS_ctx.icon)), ...(__VLS_ctx.bindAttrs), ...{ class: ("art-svg-icon inline") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['inline'];
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
            Icon: Icon,
            bindAttrs: bindAttrs,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map