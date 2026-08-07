/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { IframeRouteManager } from '@/router/core';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'IframeView' });
const route = useRoute();
const isLoading = ref(true);
const iframeUrl = ref('');
const iframeRef = ref(null);
/**
 * 初始化 iframe URL
 * 从路由配置中获取对应的外部链接地址
 */
onMounted(() => {
    const iframeRoute = IframeRouteManager.getInstance().findByPath(route.path);
    if (iframeRoute?.meta) {
        iframeUrl.value = iframeRoute.meta.link || '';
    }
});
/**
 * 处理 iframe 加载完成事件
 * 隐藏加载状态
 */
const handleIframeLoad = () => {
    isLoading.value = false;
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-border w-full h-full") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.isLoading) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.iframe, __VLS_intrinsicElements.iframe)({ ...{ onLoad: (__VLS_ctx.handleIframeLoad) }, ref: ("iframeRef"), src: ((__VLS_ctx.iframeUrl)), frameborder: ("0"), ...{ class: ("w-full h-full min-h-[calc(100vh-120px)] border-none") }, });
    // @ts-ignore navigation for `const iframeRef = ref()`
    __VLS_ctx.iframeRef;
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['min-h-[calc(100vh-120px)]'];
    __VLS_styleScopedClasses['border-none'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "iframeRef": __VLS_nativeElements['iframe'],
    };
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
            isLoading: isLoading,
            iframeUrl: iframeUrl,
            iframeRef: iframeRef,
            handleIframeLoad: handleIframeLoad,
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
//# sourceMappingURL=Iframe.vue.js.map