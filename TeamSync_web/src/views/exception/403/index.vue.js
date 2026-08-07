/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import imgUrl from '@imgs/svg/403.svg';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Exception403' }); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtException;
    /** @type { [typeof __VLS_components.ArtException, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ data: (({
            title: '403',
            desc: __VLS_ctx.$t('exceptionPage.403'),
            btnText: __VLS_ctx.$t('exceptionPage.gohome'),
            imgUrl: __VLS_ctx.imgUrl
        })), }));
    const __VLS_2 = __VLS_1({ data: (({
            title: '403',
            desc: __VLS_ctx.$t('exceptionPage.403'),
            btnText: __VLS_ctx.$t('exceptionPage.gohome'),
            imgUrl: __VLS_ctx.imgUrl
        })), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    var __VLS_5;
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
            imgUrl: imgUrl,
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