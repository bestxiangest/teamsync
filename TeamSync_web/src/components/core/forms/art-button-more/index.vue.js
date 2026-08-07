/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useAuth } from '@/hooks/core/useAuth';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtButtonMore' });
const { hasAuth } = useAuth();
const props = withDefaults(defineProps(), {});
// 检查是否有任何有权限的 item
const hasAnyAuthItem = computed(() => {
    return props.list.some((item) => !item.auth || hasAuth(item.auth));
});
const emit = defineEmits();
const handleClick = (item) => {
    emit('click', item);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.hasAnyAuthItem) {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
        /** @type { [typeof __VLS_components.ArtIconButton, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ("ri:more-2-fill"), ...{ class: ("!size-8 bg-g-200 dark:bg-g-300/45 text-sm") }, }));
        const __VLS_8 = __VLS_7({ icon: ("ri:more-2-fill"), ...{ class: ("!size-8 bg-g-200 dark:bg-g-300/45 text-sm") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
            const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
            const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
            for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list))) {
                (item.key);
                if (!item.auth || __VLS_ctx.hasAuth(item.auth)) {
                    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                    /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                    // @ts-ignore
                    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onClick': {} }, disabled: ((item.disabled)), }));
                    const __VLS_20 = __VLS_19({ ...{ 'onClick': {} }, disabled: ((item.disabled)), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
                    let __VLS_24;
                    const __VLS_25 = {
                        onClick: (...[$event]) => {
                            if (!((__VLS_ctx.hasAnyAuthItem)))
                                return;
                            if (!((!item.auth || __VLS_ctx.hasAuth(item.auth))))
                                return;
                            __VLS_ctx.handleClick(item);
                        }
                    };
                    let __VLS_21;
                    let __VLS_22;
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c gap-2") }, ...{ style: (({ color: item.color })) }, });
                    if (item.icon) {
                        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                        // @ts-ignore
                        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ icon: ((item.icon)), }));
                        const __VLS_28 = __VLS_27({ icon: ((item.icon)), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
                    }
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (item.label);
                    __VLS_nonNullable(__VLS_23.slots).default;
                    var __VLS_23;
                }
            }
            __VLS_nonNullable(__VLS_17.slots).default;
            var __VLS_17;
        }
        var __VLS_5;
    }
    __VLS_styleScopedClasses['!size-8'];
    __VLS_styleScopedClasses['bg-g-200'];
    __VLS_styleScopedClasses['dark:bg-g-300/45'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-2'];
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
            hasAuth: hasAuth,
            hasAnyAuthItem: hasAnyAuthItem,
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