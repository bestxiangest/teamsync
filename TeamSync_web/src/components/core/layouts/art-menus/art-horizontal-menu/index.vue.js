/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import HorizontalSubmenu from './widget/HorizontalSubmenu.vue';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtHorizontalMenu' });
const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);
const route = useRoute();
const props = withDefaults(defineProps(), {
    list: () => []
});
/**
 * 过滤后的菜单项列表
 * 只显示未隐藏的菜单项
 */
const filteredMenuItems = computed(() => {
    return filterMenuItems(props.list);
});
/**
 * 当前激活的路由路径
 * 用于菜单高亮显示
 */
const routerPath = computed(() => String(route.meta.activePath || route.path));
/**
 * 递归过滤菜单项，移除隐藏的菜单
 * 如果一个父菜单的所有子菜单都被隐藏，则父菜单也会被隐藏
 * @param items 菜单项数组
 * @returns 过滤后的菜单项数组
 */
const filterMenuItems = (items) => {
    return items
        .filter((item) => {
        // 如果当前项被隐藏，直接过滤掉
        if (item.meta.isHide) {
            return false;
        }
        // 如果有子菜单，递归过滤子菜单
        if (item.children && item.children.length > 0) {
            const filteredChildren = filterMenuItems(item.children);
            // 如果所有子菜单都被过滤掉了，则隐藏父菜单
            return filteredChildren.length > 0;
        }
        // 叶子节点且未被隐藏，保留
        return true;
    })
        .map((item) => ({
        ...item,
        children: item.children ? filterMenuItems(item.children) : undefined
    }));
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    list: () => []
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-1 overflow-hidden") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElMenu;
    /** @type { [typeof __VLS_components.ElMenu, typeof __VLS_components.ElMenu, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ellipsis: ((true)), mode: ("horizontal"), defaultActive: ((__VLS_ctx.routerPath)), textColor: ((__VLS_ctx.isDark ? 'var(--art-gray-800)' : 'var(--art-gray-700)')), popperOffset: ((-6)), backgroundColor: ("transparent"), showTimeout: ((50)), hideTimeout: ((50)), popperClass: ("horizontal-menu-popper"), ...{ class: ("w-full border-none") }, }));
    const __VLS_2 = __VLS_1({ ellipsis: ((true)), mode: ("horizontal"), defaultActive: ((__VLS_ctx.routerPath)), textColor: ((__VLS_ctx.isDark ? 'var(--art-gray-800)' : 'var(--art-gray-700)')), popperOffset: ((-6)), backgroundColor: ("transparent"), showTimeout: ((50)), hideTimeout: ((50)), popperClass: ("horizontal-menu-popper"), ...{ class: ("w-full border-none") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredMenuItems))) {
        // @ts-ignore
        [HorizontalSubmenu,];
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(HorizontalSubmenu, new HorizontalSubmenu({ key: ((item.path)), item: ((item)), isMobile: ((false)), level: ((0)), }));
        const __VLS_7 = __VLS_6({ key: ((item.path)), item: ((item)), isMobile: ((false)), level: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['border-none'];
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
            HorizontalSubmenu: HorizontalSubmenu,
            isDark: isDark,
            filteredMenuItems: filteredMenuItems,
            routerPath: routerPath,
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
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map