/// <reference types="../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useUserStore } from './store/modules/user';
import zh from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { systemUpgrade } from './utils/sys';
import { toggleTransition } from './utils/ui/animation';
import { checkStorageCompatibility } from './utils/storage';
import { initializeTheme } from './hooks/core/useTheme';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const userStore = useUserStore();
const { language } = storeToRefs(userStore);
const locales = {
    zh: zh,
    en: en
};
onBeforeMount(() => {
    toggleTransition(true);
    initializeTheme();
});
onMounted(() => {
    checkStorageCompatibility();
    toggleTransition(false);
    systemUpgrade();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElConfigProvider;
    /** @type { [typeof __VLS_components.ElConfigProvider, typeof __VLS_components.ElConfigProvider, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ size: ("default"), locale: ((__VLS_ctx.locales[__VLS_ctx.language])), zIndex: ((3000)), }));
    const __VLS_2 = __VLS_1({ size: ("default"), locale: ((__VLS_ctx.locales[__VLS_ctx.language])), zIndex: ((3000)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.RouterView;
    /** @type { [typeof __VLS_components.RouterView, typeof __VLS_components.RouterView, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({}));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_nonNullable(__VLS_5.slots).default;
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
            language: language,
            locales: locales,
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
//# sourceMappingURL=App.vue.js.map