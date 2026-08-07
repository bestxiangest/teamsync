/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtWatermark' });
const settingStore = useSettingStore();
const { watermarkVisible } = storeToRefs(settingStore);
const __VLS_props = withDefaults(defineProps(), {
    content: AppConfig.systemInfo.name,
    visible: false,
    fontSize: 16,
    fontColor: 'rgba(128, 128, 128, 0.2)',
    rotate: -22,
    gapX: 100,
    gapY: 100,
    offsetX: 50,
    offsetY: 50,
    zIndex: 3100
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    content: AppConfig.systemInfo.name,
    visible: false,
    fontSize: 16,
    fontColor: 'rgba(128, 128, 128, 0.2)',
    rotate: -22,
    gapX: 100,
    gapY: 100,
    offsetX: 50,
    offsetY: 50,
    zIndex: 3100
});
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
    if (__VLS_ctx.watermarkVisible) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("fixed left-0 top-0 h-screen w-screen pointer-events-none") }, ...{ style: (({ zIndex: __VLS_ctx.zIndex })) }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElWatermark;
        /** @type { [typeof __VLS_components.ElWatermark, typeof __VLS_components.ElWatermark, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ content: ((__VLS_ctx.content)), font: (({ fontSize: __VLS_ctx.fontSize, color: __VLS_ctx.fontColor })), rotate: ((__VLS_ctx.rotate)), gap: (([__VLS_ctx.gapX, __VLS_ctx.gapY])), offset: (([__VLS_ctx.offsetX, __VLS_ctx.offsetY])), }));
        const __VLS_2 = __VLS_1({ content: ((__VLS_ctx.content)), font: (({ fontSize: __VLS_ctx.fontSize, color: __VLS_ctx.fontColor })), rotate: ((__VLS_ctx.rotate)), gap: (([__VLS_ctx.gapX, __VLS_ctx.gapY])), offset: (([__VLS_ctx.offsetX, __VLS_ctx.offsetY])), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
        __VLS_nonNullable(__VLS_5.slots).default;
        var __VLS_5;
    }
    __VLS_styleScopedClasses['fixed'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['h-screen'];
    __VLS_styleScopedClasses['w-screen'];
    __VLS_styleScopedClasses['pointer-events-none'];
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
            watermarkVisible: watermarkVisible,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map