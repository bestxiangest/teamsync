/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useI18n } from 'vue-i18n';
import { useSettingStore } from '@/store/modules/setting';
import { useUserStore } from '@/store/modules/user';
import { useHeaderBar } from '@/hooks/core/useHeaderBar';
import { themeAnimation } from '@/utils/ui/animation';
import { languageOptions } from '@/locales';
import AppConfig from '@/config';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'AuthTopBar' });
const settingStore = useSettingStore();
const userStore = useUserStore();
const { isDark, systemThemeColor } = storeToRefs(settingStore);
const { shouldShowThemeToggle, shouldShowLanguage } = useHeaderBar();
const { locale } = useI18n();
const mainColors = AppConfig.systemMainColor;
const color = systemThemeColor; // css v-bind 使用
const changeLanguage = (lang) => {
    if (locale.value === lang)
        return;
    locale.value = lang;
    userStore.setLanguage(lang);
};
const changeThemeColor = (color) => {
    if (systemThemeColor.value === color)
        return;
    settingStore.setElementTheme(color);
    settingStore.reload();
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
    __VLS_styleScopedClasses['color-dot'];
    __VLS_styleScopedClasses['color-dots'];
    __VLS_styleScopedClasses['color-picker-expandable'];
    __VLS_styleScopedClasses['color-dot'];
    __VLS_styleScopedClasses['color-dots'];
    __VLS_styleScopedClasses['color-picker-expandable'];
    // CSS variable injection 
    __VLS_ctx.color;
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("absolute w-full flex-cb top-4.5 z-10 flex-c !justify-end max-[1180px]:!justify-between") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc !hidden max-[1180px]:!flex ml-2 max-sm:ml-6") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
    /** @type { [typeof __VLS_components.ArtLogo, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("icon") }, size: ("46"), }));
    const __VLS_2 = __VLS_1({ ...{ class: ("icon") }, size: ("46"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("text-xl ont-mediumf ml-2") }, });
    (__VLS_ctx.AppConfig.systemInfo.name);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc gap-1.5 mr-2 max-sm:mr-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("color-picker-expandable relative flex-c max-sm:!hidden") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("color-dots absolute right-0 rounded-full flex-c gap-2 rounded-5 px-2.5 py-2 pr-9 pl-2.5 opacity-0") }, });
    for (const [color, index] of __VLS_getVForSourceType((__VLS_ctx.mainColors))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.changeThemeColor(color);
                } }, key: ((color)), ...{ class: ("color-dot relative size-5 c-p flex-cc rounded-full opacity-0") }, ...{ class: (({ active: color === __VLS_ctx.systemThemeColor })) }, ...{ style: (({ background: color, '--index': index })) }, });
        if (color === __VLS_ctx.systemThemeColor) {
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ("ri:check-fill"), ...{ class: ("text-white") }, }));
            const __VLS_8 = __VLS_7({ icon: ("ri:check-fill"), ...{ class: ("text-white") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn palette-btn relative z-[2] h-8 w-8 c-p flex-cc tad-300") }, });
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ icon: ("ri:palette-line"), ...{ class: ("text-xl text-g-800 transition-colors duration-300") }, }));
    const __VLS_14 = __VLS_13({ icon: ("ri:palette-line"), ...{ class: ("text-xl text-g-800 transition-colors duration-300") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    if (__VLS_ctx.shouldShowLanguage) {
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onCommand': {} }, popperClass: ("langDropDownStyle"), }));
        const __VLS_20 = __VLS_19({ ...{ 'onCommand': {} }, popperClass: ("langDropDownStyle"), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        let __VLS_24;
        const __VLS_25 = {
            onCommand: (__VLS_ctx.changeLanguage)
        };
        let __VLS_21;
        let __VLS_22;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn language-btn h-8 w-8 c-p flex-cc tad-300") }, });
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ icon: ("ri:translate-2"), ...{ class: ("text-[19px] text-g-800 transition-colors duration-300") }, }));
        const __VLS_28 = __VLS_27({ icon: ("ri:translate-2"), ...{ class: ("text-[19px] text-g-800 transition-colors duration-300") }, }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_23.slots);
            const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
            const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
            for (const [lang] of __VLS_getVForSourceType((__VLS_ctx.languageOptions))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((lang.value)), ...{ class: ("lang-btn-item") }, });
                const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ command: ((lang.value)), ...{ class: (({ 'is-selected': __VLS_ctx.locale === lang.value })) }, }));
                const __VLS_40 = __VLS_39({ command: ((lang.value)), ...{ class: (({ 'is-selected': __VLS_ctx.locale === lang.value })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_39));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-txt") }, });
                (lang.label);
                if (__VLS_ctx.locale === lang.value) {
                    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ icon: ("ri:check-fill"), ...{ class: ("text-base") }, }));
                    const __VLS_46 = __VLS_45({ icon: ("ri:check-fill"), ...{ class: ("text-base") }, }, ...__VLS_functionalComponentArgsRest(__VLS_45));
                }
                __VLS_nonNullable(__VLS_43.slots).default;
                var __VLS_43;
            }
            __VLS_nonNullable(__VLS_37.slots).default;
            var __VLS_37;
        }
        var __VLS_23;
    }
    if (__VLS_ctx.shouldShowThemeToggle) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.themeAnimation) }, ...{ class: ("btn theme-btn h-8 w-8 c-p flex-cc tad-300") }, });
        const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ icon: ((__VLS_ctx.isDark ? 'ri:sun-fill' : 'ri:moon-line')), ...{ class: ("text-xl text-g-800 transition-colors duration-300") }, }));
        const __VLS_52 = __VLS_51({ icon: ((__VLS_ctx.isDark ? 'ri:sun-fill' : 'ri:moon-line')), ...{ class: ("text-xl text-g-800 transition-colors duration-300") }, }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    }
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['top-4.5'];
    __VLS_styleScopedClasses['z-10'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['!justify-end'];
    __VLS_styleScopedClasses['max-[1180px]:!justify-between'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['!hidden'];
    __VLS_styleScopedClasses['max-[1180px]:!flex'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['max-sm:ml-6'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['ont-mediumf'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['gap-1.5'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['max-sm:mr-5'];
    __VLS_styleScopedClasses['color-picker-expandable'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['max-sm:!hidden'];
    __VLS_styleScopedClasses['color-dots'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['right-0'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['rounded-5'];
    __VLS_styleScopedClasses['px-2.5'];
    __VLS_styleScopedClasses['py-2'];
    __VLS_styleScopedClasses['pr-9'];
    __VLS_styleScopedClasses['pl-2.5'];
    __VLS_styleScopedClasses['opacity-0'];
    __VLS_styleScopedClasses['color-dot'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['size-5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['opacity-0'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['text-white'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['palette-btn'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['z-[2]'];
    __VLS_styleScopedClasses['h-8'];
    __VLS_styleScopedClasses['w-8'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['transition-colors'];
    __VLS_styleScopedClasses['duration-300'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['language-btn'];
    __VLS_styleScopedClasses['h-8'];
    __VLS_styleScopedClasses['w-8'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['text-[19px]'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['transition-colors'];
    __VLS_styleScopedClasses['duration-300'];
    __VLS_styleScopedClasses['lang-btn-item'];
    __VLS_styleScopedClasses['is-selected'];
    __VLS_styleScopedClasses['menu-txt'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['theme-btn'];
    __VLS_styleScopedClasses['h-8'];
    __VLS_styleScopedClasses['w-8'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['transition-colors'];
    __VLS_styleScopedClasses['duration-300'];
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
            themeAnimation: themeAnimation,
            languageOptions: languageOptions,
            AppConfig: AppConfig,
            isDark: isDark,
            systemThemeColor: systemThemeColor,
            shouldShowThemeToggle: shouldShowThemeToggle,
            shouldShowLanguage: shouldShowLanguage,
            locale: locale,
            mainColors: mainColors,
            color: color,
            changeLanguage: changeLanguage,
            changeThemeColor: changeThemeColor,
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
//# sourceMappingURL=AuthTopBar.vue.js.map