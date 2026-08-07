/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, watch, nextTick, onUnmounted, shallowRef } from 'vue';
import { useTransition, TransitionPresets } from '@vueuse/core';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
// 常量定义
const EPSILON = Number.EPSILON;
const MIN_DURATION = 100;
const MAX_DURATION = 60000;
const MAX_DECIMALS = 10;
const DEFAULT_EASING = 'easeOutExpo';
const DEFAULT_DURATION = 2000;
const props = withDefaults(defineProps(), {
    target: 0,
    duration: DEFAULT_DURATION,
    autoStart: true,
    decimals: 0,
    decimal: '.',
    separator: '',
    prefix: '',
    suffix: '',
    easing: DEFAULT_EASING,
    disabled: false
});
const emit = defineEmits();
// 工具函数
const validateNumber = (value, name, defaultValue) => {
    if (!Number.isFinite(value)) {
        console.warn(`[CountTo] Invalid ${name} value:`, value);
        return defaultValue;
    }
    return value;
};
const clamp = (value, min, max) => {
    return Math.max(min, Math.min(value, max));
};
const formatNumber = (value, decimals, decimal, separator) => {
    let result = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toString();
    // 处理小数点符号
    if (decimal !== '.' && result.includes('.')) {
        result = result.replace('.', decimal);
    }
    // 处理千分位分隔符
    if (separator) {
        const parts = result.split(decimal);
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        result = parts.join(decimal);
    }
    return result;
};
// 安全计算值
const safeTarget = computed(() => validateNumber(props.target, 'target', 0));
const safeDuration = computed(() => clamp(validateNumber(props.duration, 'duration', DEFAULT_DURATION), MIN_DURATION, MAX_DURATION));
const safeDecimals = computed(() => clamp(validateNumber(props.decimals, 'decimals', 0), 0, MAX_DECIMALS));
const safeEasing = computed(() => {
    const easing = props.easing;
    if (!(easing in TransitionPresets)) {
        console.warn('[CountTo] Invalid easing value:', easing);
        return DEFAULT_EASING;
    }
    return easing;
});
// 状态管理
const currentValue = shallowRef(0);
const targetValue = shallowRef(safeTarget.value);
const isRunning = shallowRef(false);
const isPaused = shallowRef(false);
const pausedValue = shallowRef(0);
// 动画控制
const transitionValue = useTransition(currentValue, {
    duration: safeDuration,
    transition: computed(() => TransitionPresets[safeEasing.value]),
    onStarted: () => {
        isRunning.value = true;
        isPaused.value = false;
        emit('started', targetValue.value);
    },
    onFinished: () => {
        isRunning.value = false;
        isPaused.value = false;
        emit('finished', targetValue.value);
    }
});
// 格式化显示值
const formattedValue = computed(() => {
    const value = isPaused.value ? pausedValue.value : transitionValue.value;
    if (!Number.isFinite(value)) {
        return `${props.prefix}0${props.suffix}`;
    }
    const formattedNumber = formatNumber(value, safeDecimals.value, props.decimal, props.separator);
    return `${props.prefix}${formattedNumber}${props.suffix}`;
});
// 私有方法
const shouldSkipAnimation = (target) => {
    const current = isPaused.value ? pausedValue.value : transitionValue.value;
    return Math.abs(current - target) < EPSILON;
};
const resetPauseState = () => {
    isPaused.value = false;
    pausedValue.value = 0;
};
// 公共方法
const start = (target) => {
    if (props.disabled) {
        console.warn('[CountTo] Animation is disabled');
        return;
    }
    const finalTarget = target !== undefined ? target : targetValue.value;
    if (!Number.isFinite(finalTarget)) {
        console.warn('[CountTo] Invalid target value for start:', finalTarget);
        return;
    }
    targetValue.value = finalTarget;
    if (shouldSkipAnimation(finalTarget)) {
        return;
    }
    // 从暂停值开始（如果存在）
    if (isPaused.value) {
        currentValue.value = pausedValue.value;
        resetPauseState();
    }
    nextTick(() => {
        currentValue.value = finalTarget;
    });
};
const pause = () => {
    if (!isRunning.value || isPaused.value) {
        return;
    }
    isPaused.value = true;
    pausedValue.value = transitionValue.value;
    currentValue.value = pausedValue.value;
    emit('paused', pausedValue.value);
};
const reset = (newTarget = 0) => {
    const target = validateNumber(newTarget, 'reset target', 0);
    currentValue.value = target;
    targetValue.value = target;
    resetPauseState();
    emit('reset');
};
const setTarget = (target) => {
    if (!Number.isFinite(target)) {
        console.warn('[CountTo] Invalid target value for setTarget:', target);
        return;
    }
    targetValue.value = target;
    if ((isRunning.value || props.autoStart) && !props.disabled) {
        start(target);
    }
};
const stop = () => {
    if (isRunning.value || isPaused.value) {
        currentValue.value = 0;
        resetPauseState();
        emit('paused', 0);
    }
};
// 监听器
watch(safeTarget, (newTarget) => {
    if (props.autoStart && !props.disabled) {
        start(newTarget);
    }
    else {
        targetValue.value = newTarget;
    }
}, { immediate: props.autoStart && !props.disabled });
watch(() => props.disabled, (disabled) => {
    if (disabled && isRunning.value) {
        stop();
    }
});
// 清理
onUnmounted(() => {
    if (isRunning.value) {
        stop();
    }
});
// 暴露 API
let __VLS_exposed;
defineExpose({
    start,
    pause,
    reset,
    stop,
    setTarget,
    get isRunning() {
        return isRunning.value;
    },
    get isPaused() {
        return isPaused.value;
    },
    get currentValue() {
        return isPaused.value ? pausedValue.value : transitionValue.value;
    },
    get targetValue() {
        return targetValue.value;
    },
    get progress() {
        const current = isPaused.value ? pausedValue.value : transitionValue.value;
        const target = targetValue.value;
        if (target === 0)
            return current === 0 ? 1 : 0;
        return Math.abs(current / target);
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    target: 0,
    duration: DEFAULT_DURATION,
    autoStart: true,
    decimals: 0,
    decimal: '.',
    separator: '',
    prefix: '',
    suffix: '',
    easing: DEFAULT_EASING,
    disabled: false
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-g-900 tabular-nums") }, ...{ class: ((__VLS_ctx.isRunning ? 'transition-opacity duration-300 ease-in-out' : '')) }, });
    (__VLS_ctx.formattedValue);
    __VLS_styleScopedClasses['text-g-900'];
    __VLS_styleScopedClasses['tabular-nums'];
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
            isRunning: isRunning,
            formattedValue: formattedValue,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map