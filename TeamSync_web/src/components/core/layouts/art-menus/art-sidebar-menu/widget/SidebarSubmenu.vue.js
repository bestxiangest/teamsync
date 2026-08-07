/// <reference types="../../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed } from 'vue';
import { formatMenuTitle } from '@/utils/router';
import { handleMenuJump } from '@/utils/navigation';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = withDefaults(defineProps(), {
    title: '',
    list: () => [],
    theme: () => ({}),
    isMobile: false,
    level: 0
});
const emit = defineEmits();
const settingStore = useSettingStore();
const { menuOpen } = storeToRefs(settingStore);
/**
 * 过滤后的菜单项列表
 * 只显示未隐藏的菜单项
 */
const filteredMenuItems = computed(() => filterRoutes(props.list));
/**
 * 跳转到指定页面
 * @param item 菜单项数据
 */
const goPage = (item) => {
    closeMenu();
    handleMenuJump(item);
};
/**
 * 关闭菜单
 * 触发父组件的关闭事件
 */
const closeMenu = () => {
    emit('close');
};
/**
 * 递归过滤菜单路由，移除隐藏的菜单项
 * 如果一个父菜单的所有子菜单都被隐藏，则父菜单也会被隐藏
 * @param items 菜单项数组
 * @returns 过滤后的菜单项数组
 */
const filterRoutes = (items) => {
    return items
        .filter((item) => {
        // 如果当前项被隐藏，直接过滤掉
        if (item.meta.isHide) {
            return false;
        }
        // 如果有子菜单，递归过滤子菜单
        if (item.children && item.children.length > 0) {
            const filteredChildren = filterRoutes(item.children);
            // 如果所有子菜单都被过滤掉了，则隐藏父菜单
            return filteredChildren.length > 0;
        }
        // 叶子节点且未被隐藏，保留
        return true;
    })
        .map((item) => ({
        ...item,
        children: item.children ? filterRoutes(item.children) : undefined
    }));
};
/**
 * 判断菜单项是否包含可见的子菜单
 * @param item 菜单项数据
 * @returns 是否包含可见的子菜单
 */
const hasChildren = (item) => {
    if (!item.children || item.children.length === 0) {
        return false;
    }
    // 递归检查是否有可见的子菜单
    const filteredChildren = filterRoutes(item.children);
    return filteredChildren.length > 0;
};
/**
 * 判断是否为外部链接
 * @param item 菜单项数据
 * @returns 是否为外部链接
 */
const isExternalLink = (item) => {
    return !!(item.meta.link && !item.meta.isIframe);
};
/**
 * 生成唯一的 key
 * 使用 path、title 和 index 组合确保唯一性
 * @param item 菜单项数据
 * @param index 索引
 * @returns 唯一的 key
 */
const getUniqueKey = (item, index) => {
    return `${item.path || item.meta.title || 'menu'}-${props.level}-${index}`;
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    title: '',
    list: () => [],
    theme: () => ({}),
    isMobile: false,
    level: 0
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
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.filteredMenuItems))) {
        (__VLS_ctx.getUniqueKey(item, index));
        if (__VLS_ctx.hasChildren(item)) {
            const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElSubMenu;
            /** @type { [typeof __VLS_components.ElSubMenu, typeof __VLS_components.ElSubMenu, ] } */
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ index: ((item.path || item.meta.title)), level: ((__VLS_ctx.level)), }));
            const __VLS_2 = __VLS_1({ index: ((item.path || item.meta.title)), level: ((__VLS_ctx.level)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { title: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("menu-icon flex-cc") }, });
                const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ((item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ style: (({ color: __VLS_ctx.theme.iconColor })) }, }));
                const __VLS_8 = __VLS_7({ icon: ((item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ style: (({ color: __VLS_ctx.theme.iconColor })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-name") }, });
                (__VLS_ctx.formatMenuTitle(item.meta.title));
                if (item.meta.showBadge) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("art-badge") }, ...{ style: ({}) }, });
                }
            }
            const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.SidebarSubmenu;
            /** @type { [typeof __VLS_components.SidebarSubmenu, ] } */
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onClose': {} }, list: ((item.children)), isMobile: ((__VLS_ctx.isMobile)), level: ((__VLS_ctx.level + 1)), theme: ((__VLS_ctx.theme)), }));
            const __VLS_14 = __VLS_13({ ...{ 'onClose': {} }, list: ((item.children)), isMobile: ((__VLS_ctx.isMobile)), level: ((__VLS_ctx.level + 1)), theme: ((__VLS_ctx.theme)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            let __VLS_18;
            const __VLS_19 = {
                onClose: (__VLS_ctx.closeMenu)
            };
            let __VLS_15;
            let __VLS_16;
            var __VLS_17;
            var __VLS_5;
        }
        else {
            const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElMenuItem;
            /** @type { [typeof __VLS_components.ElMenuItem, typeof __VLS_components.ElMenuItem, ] } */
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ 'onClick': {} }, index: ((__VLS_ctx.isExternalLink(item) ? undefined : item.path || item.meta.title)), levelItem: ((__VLS_ctx.level + 1)), }));
            const __VLS_22 = __VLS_21({ ...{ 'onClick': {} }, index: ((__VLS_ctx.isExternalLink(item) ? undefined : item.path || item.meta.title)), levelItem: ((__VLS_ctx.level + 1)), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            let __VLS_26;
            const __VLS_27 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.hasChildren(item)))))
                        return;
                    __VLS_ctx.goPage(item);
                }
            };
            let __VLS_23;
            let __VLS_24;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("menu-icon flex-cc") }, });
            const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ icon: ((item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ style: (({ color: __VLS_ctx.theme.iconColor })) }, }));
            const __VLS_30 = __VLS_29({ icon: ((item.meta.icon)), color: ((__VLS_ctx.theme?.iconColor)), ...{ style: (({ color: __VLS_ctx.theme.iconColor })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("art-badge") }, ...{ style: ({}) }, });
            __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (item.meta.showBadge && __VLS_ctx.level === 0 && !__VLS_ctx.menuOpen) }, null, null);
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { title: __VLS_thisSlot } = __VLS_nonNullable(__VLS_25.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-name") }, });
                (__VLS_ctx.formatMenuTitle(item.meta.title));
                if (item.meta.showBadge) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("art-badge") }, });
                }
                if (item.meta.showTextBadge && (__VLS_ctx.level > 0 || __VLS_ctx.menuOpen)) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-text-badge") }, });
                    (item.meta.showTextBadge);
                }
            }
            var __VLS_25;
        }
    }
    __VLS_styleScopedClasses['menu-icon'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['menu-name'];
    __VLS_styleScopedClasses['art-badge'];
    __VLS_styleScopedClasses['menu-icon'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['art-badge'];
    __VLS_styleScopedClasses['menu-name'];
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
            menuOpen: menuOpen,
            filteredMenuItems: filteredMenuItems,
            goPage: goPage,
            closeMenu: closeMenu,
            hasChildren: hasChildren,
            isExternalLink: isExternalLink,
            getUniqueKey: getUniqueKey,
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
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=SidebarSubmenu.vue.js.map