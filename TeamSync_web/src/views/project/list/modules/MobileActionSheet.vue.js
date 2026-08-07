/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed } from 'vue';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const userStore = useUserStore();
const props = defineProps();
const isOwner = computed(() => {
    return props.project && userStore.info?.userId === props.project.ownerId;
});
const emit = defineEmits([
    'update:addModelValue',
    'update:moreModelValue',
    'add-action',
    'project-action'
]);
const addVisible = computed({
    get: () => props.addModelValue,
    set: (val) => emit('update:addModelValue', val)
});
const moreVisible = computed({
    get: () => props.moreModelValue,
    set: (val) => emit('update:moreModelValue', val)
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
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
    __VLS_styleScopedClasses['art-svg-icon'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDrawer;
    /** @type { [typeof __VLS_components.ElDrawer, typeof __VLS_components.ElDrawer, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.addVisible)), direction: ("btt"), size: ("auto"), withHeader: ((false)), ...{ class: ("mobile-action-drawer") }, }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.addVisible)), direction: ("btt"), size: ("auto"), withHeader: ((false)), ...{ class: ("mobile-action-drawer") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("action-list") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('add-action', 'project');
            } }, ...{ class: ("action-item") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ("ri:add-line"), }));
    const __VLS_8 = __VLS_7({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('add-action', 'group');
            } }, ...{ class: ("action-item") }, });
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ icon: ("ri:folder-add-line"), }));
    const __VLS_14 = __VLS_13({ icon: ("ri:folder-add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.addVisible = false;
            } }, ...{ class: ("action-cancel") }, });
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElDrawer;
    /** @type { [typeof __VLS_components.ElDrawer, typeof __VLS_components.ElDrawer, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ modelValue: ((__VLS_ctx.moreVisible)), direction: ("btt"), size: ("auto"), withHeader: ((false)), ...{ class: ("mobile-action-drawer") }, }));
    const __VLS_20 = __VLS_19({ modelValue: ((__VLS_ctx.moreVisible)), direction: ("btt"), size: ("auto"), withHeader: ((false)), ...{ class: ("mobile-action-drawer") }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    if (__VLS_ctx.project) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("action-list") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("action-title") }, });
        (__VLS_ctx.project.name);
        if (__VLS_ctx.activeTab === 'active') {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.project)))
                            return;
                        if (!((__VLS_ctx.activeTab === 'active')))
                            return;
                        __VLS_ctx.$emit('project-action', 'move');
                    } }, ...{ class: ("action-item") }, });
            const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ icon: ("ri:folder-transfer-line"), }));
            const __VLS_26 = __VLS_25({ icon: ("ri:folder-transfer-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            if (__VLS_ctx.isOwner) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                            if (!((__VLS_ctx.project)))
                                return;
                            if (!((__VLS_ctx.activeTab === 'active')))
                                return;
                            if (!((__VLS_ctx.isOwner)))
                                return;
                            __VLS_ctx.$emit('project-action', 'edit');
                        } }, ...{ class: ("action-item") }, });
                const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ icon: ("ri:settings-3-line"), }));
                const __VLS_32 = __VLS_31({ icon: ("ri:settings-3-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                            if (!((__VLS_ctx.project)))
                                return;
                            if (!((__VLS_ctx.activeTab === 'active')))
                                return;
                            if (!((__VLS_ctx.isOwner)))
                                return;
                            __VLS_ctx.$emit('project-action', 'archive');
                        } }, ...{ class: ("action-item") }, });
                const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ icon: ("ri:archive-line"), }));
                const __VLS_38 = __VLS_37({ icon: ("ri:archive-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                            if (!((__VLS_ctx.project)))
                                return;
                            if (!((__VLS_ctx.activeTab === 'active')))
                                return;
                            if (!((__VLS_ctx.isOwner)))
                                return;
                            __VLS_ctx.$emit('project-action', 'delete');
                        } }, ...{ class: ("action-item danger") }, });
                const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ icon: ("ri:delete-bin-line"), }));
                const __VLS_44 = __VLS_43({ icon: ("ri:delete-bin-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            }
            else {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                            if (!((__VLS_ctx.project)))
                                return;
                            if (!((__VLS_ctx.activeTab === 'active')))
                                return;
                            if (!(!((__VLS_ctx.isOwner))))
                                return;
                            __VLS_ctx.$emit('project-action', 'quit');
                        } }, ...{ class: ("action-item danger") }, });
                const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ icon: ("ri:logout-box-r-line"), }));
                const __VLS_50 = __VLS_49({ icon: ("ri:logout-box-r-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            }
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.project)))
                            return;
                        if (!(!((__VLS_ctx.activeTab === 'active'))))
                            return;
                        __VLS_ctx.$emit('project-action', 'unarchive');
                    } }, ...{ class: ("action-item") }, });
            const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ icon: ("ri:inbox-unarchive-line"), }));
            const __VLS_56 = __VLS_55({ icon: ("ri:inbox-unarchive-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.project)))
                            return;
                        if (!(!((__VLS_ctx.activeTab === 'active'))))
                            return;
                        __VLS_ctx.$emit('project-action', 'delete');
                    } }, ...{ class: ("action-item danger") }, });
            const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ icon: ("ri:delete-bin-line"), }));
            const __VLS_62 = __VLS_61({ icon: ("ri:delete-bin-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.project)))
                        return;
                    __VLS_ctx.moreVisible = false;
                } }, ...{ class: ("action-cancel") }, });
    }
    __VLS_nonNullable(__VLS_23.slots).default;
    var __VLS_23;
    __VLS_styleScopedClasses['mobile-action-drawer'];
    __VLS_styleScopedClasses['action-list'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['action-cancel'];
    __VLS_styleScopedClasses['mobile-action-drawer'];
    __VLS_styleScopedClasses['action-list'];
    __VLS_styleScopedClasses['action-title'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['danger'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['danger'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['action-item'];
    __VLS_styleScopedClasses['danger'];
    __VLS_styleScopedClasses['action-cancel'];
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
            isOwner: isOwner,
            addVisible: addVisible,
            moreVisible: moreVisible,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MobileActionSheet.vue.js.map