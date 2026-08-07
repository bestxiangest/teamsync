const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const __VLS_props = defineProps();
const __VLS_emit = defineEmits(['enter', 'delete']); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['group-grid'];
    __VLS_styleScopedClasses['group-icon'];
    __VLS_styleScopedClasses['group-card'];
    __VLS_styleScopedClasses['group-icon'];
    __VLS_styleScopedClasses['group-info'];
    __VLS_styleScopedClasses['group-name'];
    __VLS_styleScopedClasses['group-actions'];
    __VLS_styleScopedClasses['delete-btn'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    if (__VLS_ctx.groups.length > 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("group-grid") }, });
        for (const [group] of __VLS_getVForSourceType((__VLS_ctx.groups))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.groups.length > 0)))
                            return;
                        __VLS_ctx.$emit('enter', group);
                    } }, key: ((group.id)), ...{ class: ("group-card") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("group-icon") }, });
            const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ("ri:folder-fill"), }));
            const __VLS_2 = __VLS_1({ icon: ("ri:folder-fill"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("group-info") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("group-name") }, });
            (group.name);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("group-actions") }, });
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElPopconfirm;
            /** @type { [typeof __VLS_components.ElPopconfirm, typeof __VLS_components.ElPopconfirm, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onConfirm': {} }, title: ("删除分组将把其中的项目移至根目录，确定删除吗？"), width: ("220"), }));
            const __VLS_8 = __VLS_7({ ...{ 'onConfirm': {} }, title: ("删除分组将把其中的项目移至根目录，确定删除吗？"), width: ("220"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            let __VLS_12;
            const __VLS_13 = {
                onConfirm: (...[$event]) => {
                    if (!((__VLS_ctx.groups.length > 0)))
                        return;
                    __VLS_ctx.$emit('delete', group);
                }
            };
            let __VLS_9;
            let __VLS_10;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_11.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("delete-btn") }, });
                const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ icon: ("ri:delete-bin-line"), }));
                const __VLS_16 = __VLS_15({ icon: ("ri:delete-bin-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            }
            var __VLS_11;
        }
    }
    __VLS_styleScopedClasses['group-grid'];
    __VLS_styleScopedClasses['group-card'];
    __VLS_styleScopedClasses['group-icon'];
    __VLS_styleScopedClasses['group-info'];
    __VLS_styleScopedClasses['group-name'];
    __VLS_styleScopedClasses['group-actions'];
    __VLS_styleScopedClasses['delete-btn'];
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
        return {};
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
//# sourceMappingURL=GroupGrid.vue.js.map