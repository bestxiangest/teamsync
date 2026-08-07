/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { getEnabledGlobalComponents } from '@/config/modules/component';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtGlobalComponent' });
const enabledComponents = computed(() => getEnabledGlobalComponents()); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    for (const [componentConfig] of __VLS_getVForSourceType((__VLS_ctx.enabledComponents))) {
        const __VLS_0 = ((componentConfig.component));
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ key: ((componentConfig.key)), }));
        const __VLS_2 = __VLS_1({ key: ((componentConfig.key)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
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
            enabledComponents: enabledComponents,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map