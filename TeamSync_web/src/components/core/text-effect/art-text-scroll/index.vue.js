/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useElementSize, useRafFn, useElementHover, useDebounceFn, useTimeoutFn } from '@vueuse/core';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = withDefaults(defineProps(), {
    text: '',
    direction: 'left',
    speed: 80,
    width: '100%',
    height: '36px',
    pauseOnHover: true,
    type: 'theme',
    showClose: false,
    alwaysScroll: true
});
const emit = defineEmits();
const handleClose = () => {
    emit('close');
};
const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);
const containerRef = ref();
const contentRef = ref();
const textRef = ref();
const isReady = ref(false);
const currentPosition = ref(0);
const textSize = ref(0);
const containerSize = ref(0);
const shouldClone = ref(false);
const isHorizontal = computed(() => props.direction === 'left' || props.direction === 'right');
const isReverse = computed(() => props.direction === 'right' || props.direction === 'down');
// 使用 VueUse 的 useElementSize 监听容器尺寸变化
const { width: containerWidth, height: containerHeight } = useElementSize(containerRef);
// 使用 VueUse 的 useElementHover 检测鼠标悬停
const isHovered = useElementHover(containerRef);
// 计算是否应该暂停动画
const isPaused = computed(() => {
    // 如果未启用 alwaysScroll，且文字未超出容器，则暂停滚动
    if (!props.alwaysScroll && textSize.value <= containerSize.value) {
        return true;
    }
    return props.pauseOnHover && isHovered.value;
});
// 主题样式映射
const themeClasses = computed(() => {
    const themeMap = {
        theme: 'text-theme/90 !border-theme/50',
        primary: 'text-primary/90 !border-primary/50',
        secondary: 'text-secondary/90 !border-secondary/50',
        error: 'text-error/90 !border-error/50',
        info: 'text-info/90 !border-info/50',
        success: 'text-success/90 !border-success/50',
        warning: 'text-warning/90 !border-warning/50',
        danger: 'text-danger/90 !border-danger/50'
    };
    return themeMap[props.type] || themeMap.theme;
});
// 背景色
const bgColor = computed(() => `color-mix(in oklch, var(--color-${props.type}) ${isDark.value ? '25' : '10'}%, var(--art-color))`);
const containerStyle = computed(() => ({
    width: props.width,
    height: props.height,
    backgroundColor: bgColor.value
}));
const contentClass = computed(() => {
    if (!isHorizontal.value) {
        return 'flex flex-col';
    }
    return '';
});
const contentStyle = computed(() => {
    const transform = isHorizontal.value
        ? `translateX(${currentPosition.value}px)`
        : `translateY(${currentPosition.value}px)`;
    return {
        transform,
        willChange: 'transform'
    };
});
// 克隆元素的间距
const cloneSpacing = computed(() => {
    const spacing = '2em';
    return isHorizontal.value ? { marginLeft: spacing } : { marginTop: spacing };
});
const measureSizes = () => {
    if (!containerRef.value || !textRef.value)
        return;
    const text = textRef.value;
    if (isHorizontal.value) {
        containerSize.value = containerWidth.value;
        textSize.value = text.offsetWidth;
    }
    else {
        containerSize.value = containerHeight.value;
        textSize.value = text.offsetHeight;
    }
    const isOverflow = textSize.value > containerSize.value;
    shouldClone.value = isOverflow;
    // 居中显示
    currentPosition.value = (containerSize.value - textSize.value) / 2;
    // 测量完成后才显示内容
    if (!isReady.value) {
        isReady.value = true;
    }
};
// 使用 VueUse 的 useDebounceFn 防抖测量
const debouncedMeasure = useDebounceFn(measureSizes, 150);
let lastTimestamp = 0;
// 使用 VueUse 的 useRafFn 替代手动 requestAnimationFrame
const { pause, resume } = useRafFn(({ timestamp }) => {
    if (!lastTimestamp)
        lastTimestamp = timestamp;
    if (!isPaused.value) {
        const delta = (timestamp - lastTimestamp) / 1000;
        const distance = props.speed * delta;
        const spacing = textSize.value * 0.1;
        currentPosition.value += isReverse.value ? distance : -distance;
        // 循环边界检测
        if (isReverse.value) {
            if (currentPosition.value > containerSize.value) {
                currentPosition.value = -(textSize.value + spacing);
            }
        }
        else {
            if (currentPosition.value < -(textSize.value + spacing)) {
                currentPosition.value = containerSize.value;
            }
        }
    }
    lastTimestamp = timestamp;
}, { immediate: false });
const handleContentClick = (e) => {
    const target = e.target;
    if (target.tagName === 'A') {
        e.stopPropagation();
    }
};
// 监听容器尺寸变化
watch([containerWidth, containerHeight], () => {
    debouncedMeasure();
});
// 监听属性变化
watch(() => [props.direction, props.speed, props.text], () => {
    measureSizes();
    lastTimestamp = 0;
});
// 使用 VueUse 的 useTimeoutFn 替代 setTimeout
const { start: startMeasure } = useTimeoutFn(() => {
    measureSizes();
    // 测量完成后立即开始动画
    resume();
}, 100);
onMounted(() => {
    startMeasure();
});
onBeforeUnmount(() => {
    pause();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    text: '',
    direction: 'left',
    speed: 80,
    width: '100%',
    height: '36px',
    pauseOnHover: true,
    type: 'theme',
    showClose: false,
    alwaysScroll: true
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("containerRef"), ...{ class: ("relative overflow-hidden rounded-custom-sm border flex-c box-border text-sm") }, ...{ class: ((__VLS_ctx.themeClasses)) }, ...{ style: ((__VLS_ctx.containerStyle)) }, });
    // @ts-ignore navigation for `const containerRef = ref()`
    __VLS_ctx.containerRef;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc absolute left-0 h-full w-9 z-10") }, ...{ style: (({ backgroundColor: __VLS_ctx.bgColor })) }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ("ri:volume-down-line"), ...{ class: ("text-lg") }, }));
    const __VLS_2 = __VLS_1({ icon: ("ri:volume-down-line"), ...{ class: ("text-lg") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleContentClick) }, ref: ("contentRef"), ...{ class: ("whitespace-nowrap inline-block transition-opacity duration-600 [&_a]:text-danger [&_a:hover]:underline [&_a:hover]:text-danger/80 px-9") }, ...{ class: (([__VLS_ctx.contentClass, { 'opacity-0': !__VLS_ctx.isReady, 'opacity-100': __VLS_ctx.isReady }])) }, ...{ style: ((__VLS_ctx.contentStyle)) }, });
    // @ts-ignore navigation for `const contentRef = ref()`
    __VLS_ctx.contentRef;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ref: ("textRef"), ...{ class: ("inline-block") }, });
    // @ts-ignore navigation for `const textRef = ref()`
    __VLS_ctx.textRef;
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.text) }, null, null);
    if (__VLS_ctx.shouldClone) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("inline-block") }, ...{ style: ((__VLS_ctx.cloneSpacing)) }, });
        var __VLS_7 = {};
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.text) }, null, null);
    }
    if (__VLS_ctx.showClose) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleClose) }, ...{ class: ("flex-cc absolute right-0 h-full w-9 c-p") }, ...{ style: (({ backgroundColor: __VLS_ctx.bgColor })) }, });
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ icon: ("ri:close-fill"), ...{ class: ("text-lg") }, }));
        const __VLS_10 = __VLS_9({ icon: ("ri:close-fill"), ...{ class: ("text-lg") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['rounded-custom-sm'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['w-9'];
    __VLS_styleScopedClasses['z-10'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['whitespace-nowrap'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['transition-opacity'];
    __VLS_styleScopedClasses['duration-600'];
    __VLS_styleScopedClasses['[&_a]:text-danger'];
    __VLS_styleScopedClasses['[&_a:hover]:underline'];
    __VLS_styleScopedClasses['[&_a:hover]:text-danger/80'];
    __VLS_styleScopedClasses['px-9'];
    __VLS_styleScopedClasses['opacity-0'];
    __VLS_styleScopedClasses['opacity-100'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['right-0'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['w-9'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['text-lg'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "containerRef": __VLS_nativeElements['div'],
        "contentRef": __VLS_nativeElements['div'],
        "textRef": __VLS_nativeElements['span'],
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
            handleClose: handleClose,
            containerRef: containerRef,
            contentRef: contentRef,
            textRef: textRef,
            isReady: isReady,
            shouldClone: shouldClone,
            themeClasses: themeClasses,
            bgColor: bgColor,
            containerStyle: containerStyle,
            contentClass: contentClass,
            contentStyle: contentStyle,
            cloneSpacing: cloneSpacing,
            handleContentClick: handleContentClick,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map