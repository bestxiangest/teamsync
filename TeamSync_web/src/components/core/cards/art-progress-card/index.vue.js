/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtProgressCard' });
const props = withDefaults(defineProps(), {
    strokeWidth: 5,
    color: '#67C23A'
});
const animationDuration = 500;
const currentPercentage = ref(0);
const animateProgress = () => {
    const startTime = Date.now();
    const startValue = currentPercentage.value;
    const endValue = props.percentage;
    const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        currentPercentage.value = startValue + (endValue - startValue) * progress;
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
};
onMounted(() => {
    animateProgress();
});
// 当 percentage 属性变化时重新执行动画
watch(() => props.percentage, () => {
    animateProgress();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    strokeWidth: 5,
    color: '#67C23A'
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card h-32 flex flex-col justify-center px-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-3.5 flex-c") }, ...{ style: (({ justifyContent: __VLS_ctx.icon ? 'space-between' : 'flex-start' })) }, });
    if (__VLS_ctx.icon) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("size-11 flex-cc bg-g-300 text-xl rounded-lg") }, ...{ class: ((__VLS_ctx.iconStyle)) }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ((__VLS_ctx.icon)), ...{ class: ("text-2xl") }, }));
        const __VLS_2 = __VLS_1({ icon: ((__VLS_ctx.icon)), ...{ class: ("text-2xl") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtCountTo;
    /** @type { [typeof __VLS_components.ArtCountTo, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ class: ("mb-1 block text-2xl font-semibold") }, target: ((__VLS_ctx.percentage)), duration: ((2000)), suffix: ("%"), ...{ style: (({ textAlign: __VLS_ctx.icon ? 'right' : 'left' })) }, }));
    const __VLS_8 = __VLS_7({ ...{ class: ("mb-1 block text-2xl font-semibold") }, target: ((__VLS_ctx.percentage)), duration: ((2000)), suffix: ("%"), ...{ style: (({ textAlign: __VLS_ctx.icon ? 'right' : 'left' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-sm text-g-500") }, });
    (__VLS_ctx.title);
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
    /** @type { [typeof __VLS_components.ElProgress, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ percentage: ((__VLS_ctx.currentPercentage)), strokeWidth: ((__VLS_ctx.strokeWidth)), showText: ((false)), color: ((__VLS_ctx.color)), ...{ class: ("[&_.el-progress-bar__outer]:bg-[rgb(240_240_240)]") }, }));
    const __VLS_14 = __VLS_13({ percentage: ((__VLS_ctx.currentPercentage)), strokeWidth: ((__VLS_ctx.strokeWidth)), showText: ((false)), color: ((__VLS_ctx.color)), ...{ class: ("[&_.el-progress-bar__outer]:bg-[rgb(240_240_240)]") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['h-32'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['px-5'];
    __VLS_styleScopedClasses['mb-3.5'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['size-11'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['bg-g-300'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['mb-1'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['font-semibold'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['[&_.el-progress-bar__outer]:bg-[rgb(240_240_240)]'];
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
            currentPercentage: currentPercentage,
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