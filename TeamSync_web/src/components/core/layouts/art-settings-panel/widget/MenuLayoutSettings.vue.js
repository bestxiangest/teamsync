/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import SectionTitle from './SectionTitle.vue';
import { useSettingStore } from '@/store/modules/setting';
import { useSettingsConfig } from '../composables/useSettingsConfig';
import { useSettingsState } from '../composables/useSettingsState';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const { width } = useWindowSize();
const settingStore = useSettingStore();
const { menuType } = storeToRefs(settingStore);
const { configOptions } = useSettingsConfig();
const { switchMenuLayouts } = useSettingsState(); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    if (__VLS_ctx.width > 1000) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        // @ts-ignore
        [SectionTitle,];
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.menuType.title'))), }));
        const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.menuType.title'))), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("setting-box-wrap") }, });
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.configOptions.menuLayoutList))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.width > 1000)))
                            return;
                        __VLS_ctx.switchMenuLayouts(item.value);
                    } }, ...{ class: ("setting-item") }, key: ((item.value)), });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box") }, ...{ class: (({ 'is-active': item.value === __VLS_ctx.menuType, 'mt-16': index > 2 })) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((item.img)), });
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("name") }, });
            (__VLS_ctx.$t(`setting.menuType.list[${index}]`));
        }
    }
    __VLS_styleScopedClasses['setting-box-wrap'];
    __VLS_styleScopedClasses['setting-item'];
    __VLS_styleScopedClasses['box'];
    __VLS_styleScopedClasses['is-active'];
    __VLS_styleScopedClasses['mt-16'];
    __VLS_styleScopedClasses['name'];
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
            SectionTitle: SectionTitle,
            width: width,
            menuType: menuType,
            configOptions: configOptions,
            switchMenuLayouts: switchMenuLayouts,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MenuLayoutSettings.vue.js.map