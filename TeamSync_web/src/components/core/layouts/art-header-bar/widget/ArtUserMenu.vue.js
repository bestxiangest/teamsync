/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { WEB_LINKS } from '@/utils/constants';
import { mittBus } from '@/utils/sys';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtUserMenu' });
const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();
const { getUserInfo: userInfo } = storeToRefs(userStore);
const userMenuPopover = ref();
/**
 * 页面跳转
 * @param {string} path - 目标路径
 */
const goPage = (path) => {
    router.push(path);
};
/**
 * 打开文档页面
 */
const toDocs = () => {
    window.open(WEB_LINKS.DOCS);
};
/**
 * 打开 GitHub 页面
 */
const toGithub = () => {
    window.open(WEB_LINKS.GITHUB);
};
/**
 * 打开锁屏功能
 */
const lockScreen = () => {
    mittBus.emit('openLockScreen');
};
/**
 * 用户登出确认
 */
const loginOut = () => {
    closeUserMenu();
    setTimeout(() => {
        ElMessageBox.confirm(t('common.logOutTips'), t('common.tips'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            customClass: 'login-out-dialog'
        }).then(() => {
            userStore.logOut();
        });
    }, 200);
};
/**
 * 关闭用户菜单弹出层
 */
const closeUserMenu = () => {
    setTimeout(() => {
        userMenuPopover.value.hide();
    }, 100);
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
    /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ref: ("userMenuPopover"), placement: ("bottom-end"), width: ((240)), hideAfter: ((0)), offset: ((10)), trigger: ("hover"), showArrow: ((false)), popperClass: ("user-menu-popover"), popperStyle: ("padding: 5px 16px;"), }));
    const __VLS_2 = __VLS_1({ ref: ("userMenuPopover"), placement: ("bottom-end"), width: ((240)), hideAfter: ((0)), offset: ((10)), trigger: ("hover"), showArrow: ((false)), popperClass: ("user-menu-popover"), popperStyle: ("padding: 5px 16px;"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const userMenuPopover = ref()`
    __VLS_ctx.userMenuPopover;
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("size-8.5 mr-5 c-p rounded-full max-sm:w-6.5 max-sm:h-6.5 max-sm:mr-[16px]") }, src: ("@imgs/user/avatar.webp"), alt: ("avatar"), });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pt-3") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c pb-1 px-0") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left") }, src: ("@imgs/user/avatar.webp"), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-[calc(100%-60px)] h-full") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("block text-sm font-medium text-g-800 truncate") }, });
        (__VLS_ctx.userInfo.username);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("block mt-0.5 text-xs text-g-500 truncate") }, });
        (__VLS_ctx.userInfo.email);
        __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("py-4 mt-3 border-t border-g-300/80") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.goPage('/system/user-center');
                } }, ...{ class: ("btn-item") }, });
        const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ icon: ("ri:user-3-line"), }));
        const __VLS_9 = __VLS_8({ icon: ("ri:user-3-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('topBar.user.userCenter'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toDocs();
                } }, ...{ class: ("btn-item") }, });
        const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ icon: ("ri:book-2-line"), }));
        const __VLS_15 = __VLS_14({ icon: ("ri:book-2-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('topBar.user.docs'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toGithub();
                } }, ...{ class: ("btn-item") }, });
        const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ icon: ("ri:github-line"), }));
        const __VLS_21 = __VLS_20({ icon: ("ri:github-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('topBar.user.github'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.lockScreen();
                } }, ...{ class: ("btn-item") }, });
        const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ icon: ("ri:lock-line"), }));
        const __VLS_27 = __VLS_26({ icon: ("ri:lock-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('topBar.user.lockScreen'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full h-px my-2 bg-g-300/80") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.loginOut) }, ...{ class: ("log-out c-p") }, });
        (__VLS_ctx.$t('topBar.user.logout'));
    }
    var __VLS_5;
    __VLS_styleScopedClasses['size-8.5'];
    __VLS_styleScopedClasses['mr-5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['max-sm:w-6.5'];
    __VLS_styleScopedClasses['max-sm:h-6.5'];
    __VLS_styleScopedClasses['max-sm:mr-[16px]'];
    __VLS_styleScopedClasses['pt-3'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['pb-1'];
    __VLS_styleScopedClasses['px-0'];
    __VLS_styleScopedClasses['w-10'];
    __VLS_styleScopedClasses['h-10'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['ml-0'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['float-left'];
    __VLS_styleScopedClasses['w-[calc(100%-60px)]'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['truncate'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['mt-0.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['truncate'];
    __VLS_styleScopedClasses['py-4'];
    __VLS_styleScopedClasses['mt-3'];
    __VLS_styleScopedClasses['border-t'];
    __VLS_styleScopedClasses['border-g-300/80'];
    __VLS_styleScopedClasses['btn-item'];
    __VLS_styleScopedClasses['btn-item'];
    __VLS_styleScopedClasses['btn-item'];
    __VLS_styleScopedClasses['btn-item'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-px'];
    __VLS_styleScopedClasses['my-2'];
    __VLS_styleScopedClasses['bg-g-300/80'];
    __VLS_styleScopedClasses['log-out'];
    __VLS_styleScopedClasses['c-p'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "userMenuPopover": __VLS_6,
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
            userInfo: userInfo,
            userMenuPopover: userMenuPopover,
            goPage: goPage,
            toDocs: toDocs,
            toGithub: toGithub,
            lockScreen: lockScreen,
            loginOut: loginOut,
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
//# sourceMappingURL=ArtUserMenu.vue.js.map