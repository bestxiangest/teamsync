/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const __VLS_emit = defineEmits(['view', 'files', 'more']);
/**
 * 获取分组名称
 */
const getGroupName = (groupId) => {
    if (!props.groups || groupId <= 0)
        return '根目录';
    const group = props.groups.find((g) => g.id === groupId);
    return group?.name || '未知分组';
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-project-list") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    if (__VLS_ctx.projects.length === 0 && !__VLS_ctx.loading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-state") }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ("ri:folder-open-line"), ...{ class: ("empty-icon") }, }));
        const __VLS_2 = __VLS_1({ icon: ("ri:folder-open-line"), ...{ class: ("empty-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.activeTab === 'active' ? '暂无项目' : '暂无归档项目');
    }
    for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projects))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.$emit('view', project);
                } }, key: ((project.id)), ...{ class: ("mobile-project-card") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-icon-wrapper") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-icon") }, });
        (project.name.charAt(0).toUpperCase());
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-main-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-name") }, });
        (project.name);
        if (__VLS_ctx.showGroupName) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-group") }, });
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ size: ("small"), type: ("info"), }));
            const __VLS_8 = __VLS_7({ size: ("small"), type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            (__VLS_ctx.getGroupName(project.groupId));
            __VLS_nonNullable(__VLS_11.slots).default;
            var __VLS_11;
        }
        if (project.description) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-description") }, });
            (project.description);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.$emit('more', project);
                } }, ...{ class: ("project-more") }, });
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ icon: ("ri:more-2-fill"), }));
        const __VLS_14 = __VLS_13({ icon: ("ri:more-2-fill"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-body") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("progress-section") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("progress-label") }, });
        (project.progress || 0);
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
        /** @type { [typeof __VLS_components.ElProgress, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ percentage: ((project.progress || 0)), showText: ((false)), strokeWidth: ((4)), }));
        const __VLS_20 = __VLS_19({ percentage: ((project.progress || 0)), showText: ((false)), strokeWidth: ((4)), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-footer") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.$emit('view', project);
                } }, ...{ class: ("footer-action") }, });
        const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ icon: ("ri:dashboard-3-line"), }));
        const __VLS_26 = __VLS_25({ icon: ("ri:dashboard-3-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.$emit('files', project);
                } }, ...{ class: ("footer-action") }, });
        const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ icon: ("ri:folder-line"), }));
        const __VLS_32 = __VLS_31({ icon: ("ri:folder-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.$emit('more', project);
                } }, ...{ class: ("footer-action") }, });
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ icon: ("ri:settings-3-line"), }));
        const __VLS_38 = __VLS_37({ icon: ("ri:settings-3-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_styleScopedClasses['mobile-project-list'];
    __VLS_styleScopedClasses['empty-state'];
    __VLS_styleScopedClasses['empty-icon'];
    __VLS_styleScopedClasses['mobile-project-card'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['project-icon-wrapper'];
    __VLS_styleScopedClasses['project-icon'];
    __VLS_styleScopedClasses['project-main-info'];
    __VLS_styleScopedClasses['project-name'];
    __VLS_styleScopedClasses['project-group'];
    __VLS_styleScopedClasses['project-description'];
    __VLS_styleScopedClasses['project-more'];
    __VLS_styleScopedClasses['card-body'];
    __VLS_styleScopedClasses['progress-section'];
    __VLS_styleScopedClasses['progress-label'];
    __VLS_styleScopedClasses['card-footer'];
    __VLS_styleScopedClasses['footer-action'];
    __VLS_styleScopedClasses['footer-action'];
    __VLS_styleScopedClasses['footer-action'];
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
            getGroupName: getGroupName,
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
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ProjectCards.vue.js.map