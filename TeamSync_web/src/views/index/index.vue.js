/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import ArtMobileNav from '@/components/core/layouts/art-mobile-nav/index.vue';
import ArtLogo from '@/components/core/base/art-logo/index.vue';
import { useUserStore } from '@/store/modules/user';
import { ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'AppLayout' });
const router = useRouter();
const userStore = useUserStore();
// 使用 VueUse 的 useMediaQuery 判断是否为移动端
const isMobile = useMediaQuery('(max-width: 768px)');
// 提供给子组件使用
provide('isMobile', isMobile);
/**
 * 处理 Logo 下拉菜单点击
 */
const handleLogoCommand = (command) => {
    switch (command) {
        case 'login':
            router.push({ name: 'Login' });
            break;
        case 'user-center':
            router.push({ name: 'UserCenter' });
            break;
        case 'logout':
            handleLogout();
            break;
    }
};
/**
 * 退出登录
 */
const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        userStore.logOut();
    });
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("app-layout") }, ...{ class: (({ 'is-mobile': __VLS_ctx.isMobile })) }, });
    if (!__VLS_ctx.isMobile) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({ id: ("app-sidebar"), });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSidebarMenu;
        /** @type { [typeof __VLS_components.ArtSidebarMenu, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({ id: ("app-main"), });
    if (!__VLS_ctx.isMobile) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ id: ("app-header"), });
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtHeaderBar;
        /** @type { [typeof __VLS_components.ArtHeaderBar, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
        const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ id: ("app-header-mobile"), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-header") }, });
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onCommand': {} }, trigger: ("click"), }));
        const __VLS_14 = __VLS_13({ ...{ 'onCommand': {} }, trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_18;
        const __VLS_19 = {
            onCommand: (__VLS_ctx.handleLogoCommand)
        };
        let __VLS_15;
        let __VLS_16;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("logo-wrapper") }, });
        // @ts-ignore
        [ArtLogo,];
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(ArtLogo, new ArtLogo({ size: ((30)), }));
        const __VLS_21 = __VLS_20({ size: ((30)), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("system-title ml-2") }, });
        const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ icon: ("ri:arrow-down-s-line"), ...{ class: ("ml-1 dropdown-icon") }, }));
        const __VLS_27 = __VLS_26({ icon: ("ri:arrow-down-s-line"), ...{ class: ("ml-1 dropdown-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_17.slots);
            const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ ...{ class: ("mobile-logo-dropdown") }, }));
            const __VLS_33 = __VLS_32({ ...{ class: ("mobile-logo-dropdown") }, }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            if (__VLS_ctx.userStore.isLogin) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-info-section px-4 py-3 border-b border-gray-50 mb-1") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("nickname font-600 text-14px") }, });
                (__VLS_ctx.userStore.info?.nickname || __VLS_ctx.userStore.info?.username);
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("username text-12px text-gray-400 mt-1") }, });
                (__VLS_ctx.userStore.info?.username);
                const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ command: ("user-center"), }));
                const __VLS_39 = __VLS_38({ command: ("user-center"), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
                const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ icon: ("ri:user-line"), ...{ class: ("mr-2") }, }));
                const __VLS_45 = __VLS_44({ icon: ("ri:user-line"), ...{ class: ("mr-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_44));
                __VLS_nonNullable(__VLS_42.slots).default;
                var __VLS_42;
                const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ command: ("logout"), divided: (true), ...{ style: ({}) }, }));
                const __VLS_51 = __VLS_50({ command: ("logout"), divided: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_50));
                const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ icon: ("ri:logout-box-r-line"), ...{ class: ("mr-2") }, }));
                const __VLS_57 = __VLS_56({ icon: ("ri:logout-box-r-line"), ...{ class: ("mr-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_56));
                __VLS_nonNullable(__VLS_54.slots).default;
                var __VLS_54;
            }
            else {
                const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ command: ("login"), }));
                const __VLS_63 = __VLS_62({ command: ("login"), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
                const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ icon: ("ri:login-box-line"), ...{ class: ("mr-2") }, }));
                const __VLS_69 = __VLS_68({ icon: ("ri:login-box-line"), ...{ class: ("mr-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_68));
                __VLS_nonNullable(__VLS_66.slots).default;
                var __VLS_66;
            }
            __VLS_nonNullable(__VLS_36.slots).default;
            var __VLS_36;
        }
        var __VLS_17;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ id: ("app-content"), });
    const __VLS_73 = __VLS_resolvedLocalAndGlobalComponents.ArtPageContent;
    /** @type { [typeof __VLS_components.ArtPageContent, ] } */
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
    const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
    if (__VLS_ctx.isMobile) {
        // @ts-ignore
        [ArtMobileNav,];
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(ArtMobileNav, new ArtMobileNav({}));
        const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ id: ("app-global"), });
    const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ArtGlobalComponent;
    /** @type { [typeof __VLS_components.ArtGlobalComponent, ] } */
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
    const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_styleScopedClasses['app-layout'];
    __VLS_styleScopedClasses['is-mobile'];
    __VLS_styleScopedClasses['mobile-header'];
    __VLS_styleScopedClasses['logo-wrapper'];
    __VLS_styleScopedClasses['system-title'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['ml-1'];
    __VLS_styleScopedClasses['dropdown-icon'];
    __VLS_styleScopedClasses['mobile-logo-dropdown'];
    __VLS_styleScopedClasses['user-info-section'];
    __VLS_styleScopedClasses['px-4'];
    __VLS_styleScopedClasses['py-3'];
    __VLS_styleScopedClasses['border-b'];
    __VLS_styleScopedClasses['border-gray-50'];
    __VLS_styleScopedClasses['mb-1'];
    __VLS_styleScopedClasses['nickname'];
    __VLS_styleScopedClasses['font-600'];
    __VLS_styleScopedClasses['text-14px'];
    __VLS_styleScopedClasses['username'];
    __VLS_styleScopedClasses['text-12px'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['mr-2'];
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
            ArtMobileNav: ArtMobileNav,
            ArtLogo: ArtLogo,
            userStore: userStore,
            isMobile: isMobile,
            handleLogoCommand: handleLogoCommand,
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