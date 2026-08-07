/// <reference types="../../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed } from 'vue';
import { handleMenuJump } from '@/utils/navigation';
import { formatMenuTitle } from '@/utils/router';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    theme: {
        type: Object,
        default: () => ({})
    },
    isMobile: Boolean,
    level: {
        type: Number,
        default: 0
    }
});
const emit = defineEmits(['close']);
// 过滤后的子菜单项（不包含隐藏的）
const filteredChildren = computed(() => {
    return props.item.children?.filter((child) => !child.meta.isHide) || [];
});
// 计算当前项是否有可见的子菜单
const hasChildren = computed(() => {
    return filteredChildren.value.length > 0;
});
const goPage = (item) => {
    closeMenu();
    handleMenuJump(item);
};
const closeMenu = () => {
    emit('close');
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    props: {
        item: {
            type: Object,
            required: true
        },
        theme: {
            type: Object,
            default: () => ({})
        },
        isMobile: Boolean,
        level: {
            type: Number,
            default: 0
        }
    },
    emits: {},
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    if (__VLS_ctx.hasChildren) {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElSubMenu;
        /** @type { [typeof __VLS_components.ElSubMenu, typeof __VLS_components.ElSubMenu, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ index: ((__VLS_ctx.item.path || __VLS_ctx.item.meta.title)), ...{ class: ("!p-0") }, }));
        const __VLS_2 = __VLS_1({ index: ((__VLS_ctx.item.path || __VLS_ctx.item.meta.title)), ...{ class: ("!p-0") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { title: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ((__VLS_ctx.item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ class: ("mr-1 text-lg") }, }));
            const __VLS_8 = __VLS_7({ icon: ((__VLS_ctx.item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ class: ("mr-1 text-lg") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-md") }, });
            (__VLS_ctx.formatMenuTitle(__VLS_ctx.item.meta.title));
            if (__VLS_ctx.item.meta.showBadge) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("art-badge art-badge-horizontal") }, });
            }
            if (__VLS_ctx.item.meta.showTextBadge) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-text-badge") }, });
                (__VLS_ctx.item.meta.showTextBadge);
            }
        }
        for (const [child] of __VLS_getVForSourceType((__VLS_ctx.filteredChildren))) {
            const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.HorizontalSubmenu;
            /** @type { [typeof __VLS_components.HorizontalSubmenu, ] } */
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onClose': {} }, key: ((child.path)), item: ((child)), theme: ((__VLS_ctx.theme)), isMobile: ((__VLS_ctx.isMobile)), level: ((__VLS_ctx.level + 1)), }));
            const __VLS_14 = __VLS_13({ ...{ 'onClose': {} }, key: ((child.path)), item: ((child)), theme: ((__VLS_ctx.theme)), isMobile: ((__VLS_ctx.isMobile)), level: ((__VLS_ctx.level + 1)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            let __VLS_18;
            const __VLS_19 = {
                onClose: (__VLS_ctx.closeMenu)
            };
            let __VLS_15;
            let __VLS_16;
            var __VLS_17;
        }
        var __VLS_5;
    }
    else if (!__VLS_ctx.item.meta.isHide) {
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElMenuItem;
        /** @type { [typeof __VLS_components.ElMenuItem, typeof __VLS_components.ElMenuItem, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ 'onClick': {} }, index: ((__VLS_ctx.item.path || __VLS_ctx.item.meta.title)), }));
        const __VLS_22 = __VLS_21({ ...{ 'onClick': {} }, index: ((__VLS_ctx.item.path || __VLS_ctx.item.meta.title)), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_26;
        const __VLS_27 = {
            onClick: (...[$event]) => {
                if (!(!((__VLS_ctx.hasChildren))))
                    return;
                if (!((!__VLS_ctx.item.meta.isHide)))
                    return;
                __VLS_ctx.goPage(__VLS_ctx.item);
            }
        };
        let __VLS_23;
        let __VLS_24;
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ icon: ((__VLS_ctx.item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ class: ("mr-1 text-lg") }, ...{ style: (({ color: __VLS_ctx.theme.iconColor })) }, }));
        const __VLS_30 = __VLS_29({ icon: ((__VLS_ctx.item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ class: ("mr-1 text-lg") }, ...{ style: (({ color: __VLS_ctx.theme.iconColor })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-md") }, });
        (__VLS_ctx.formatMenuTitle(__VLS_ctx.item.meta.title));
        if (__VLS_ctx.item.meta.showBadge) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("art-badge") }, ...{ style: (({ right: __VLS_ctx.level === 0 ? '10px' : '20px' })) }, });
        }
        if (__VLS_ctx.item.meta.showTextBadge && __VLS_ctx.level !== 0) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-text-badge") }, });
            (__VLS_ctx.item.meta.showTextBadge);
        }
        __VLS_nonNullable(__VLS_25.slots).default;
        var __VLS_25;
    }
    __VLS_styleScopedClasses['!p-0'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['text-md'];
    __VLS_styleScopedClasses['art-badge'];
    __VLS_styleScopedClasses['art-badge-horizontal'];
    __VLS_styleScopedClasses['art-text-badge'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['text-md'];
    __VLS_styleScopedClasses['art-badge'];
    __VLS_styleScopedClasses['art-text-badge'];
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
            formatMenuTitle: formatMenuTitle,
            filteredChildren: filteredChildren,
            hasChildren: hasChildren,
            goPage: goPage,
            closeMenu: closeMenu,
        };
    },
    emits: {},
    props: {
        item: {
            type: Object,
            required: true
        },
        theme: {
            type: Object,
            default: () => ({})
        },
        isMobile: Boolean,
        level: {
            type: Number,
            default: 0
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        item: {
            type: Object,
            required: true
        },
        theme: {
            type: Object,
            default: () => ({})
        },
        isMobile: Boolean,
        level: {
            type: Number,
            default: 0
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=HorizontalSubmenu.vue.js.map