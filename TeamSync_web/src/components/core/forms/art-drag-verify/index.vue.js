/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtDragVerify' });
// 事件定义
const emit = defineEmits(['handlerMove', 'update:value', 'passCallback']);
const props = withDefaults(defineProps(), {
    value: false,
    width: '100%',
    height: 40,
    text: '按住滑块拖动',
    successText: 'success',
    background: '#eee',
    progressBarBg: '#1385FF',
    completedBg: '#57D187',
    circle: false,
    radius: 'calc(var(--custom-radius) / 3 + 2px)',
    handlerIcon: 'solar:double-alt-arrow-right-linear',
    successIcon: 'ri:check-fill',
    handlerBg: '#fff',
    textSize: '13px',
    textColor: '#333'
});
// 响应式状态定义
const state = reactive({
    isMoving: false,
    x: 0,
    isOk: false
});
// 解构响应式状态
const { isOk } = toRefs(state);
// DOM 元素引用
const dragVerify = ref();
const messageRef = ref();
const handler = ref();
const progressBar = ref();
// 触摸事件变量 - 用于禁止页面滑动
let startX, startY, moveX, moveY;
/**
 * 触摸开始事件处理
 * @param e 触摸事件对象
 */
const onTouchStart = (e) => {
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;
};
/**
 * 触摸移动事件处理 - 判断是否为横向滑动，如果是则阻止默认行为
 * @param e 触摸事件对象
 */
const onTouchMove = (e) => {
    moveX = e.targetTouches[0].pageX;
    moveY = e.targetTouches[0].pageY;
    // 如果横向移动距离大于纵向移动距离，阻止默认行为（防止页面滑动）
    if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
        e.preventDefault();
    }
};
// 全局事件监听器添加
document.addEventListener('touchstart', onTouchStart);
document.addEventListener('touchmove', onTouchMove, { passive: false });
// 获取数值形式的宽度
const getNumericWidth = () => {
    if (typeof props.width === 'string') {
        // 如果是字符串，尝试从DOM元素获取实际宽度
        return dragVerify.value?.offsetWidth || 260;
    }
    return props.width;
};
// 获取样式字符串形式的宽度
const getStyleWidth = () => {
    if (typeof props.width === 'string') {
        return props.width;
    }
    return props.width + 'px';
};
// 组件挂载后的初始化
onMounted(() => {
    // 设置 CSS 自定义属性
    dragVerify.value?.style.setProperty('--textColor', props.textColor);
    // 等待DOM更新后设置宽度相关属性
    nextTick(() => {
        const numericWidth = getNumericWidth();
        dragVerify.value?.style.setProperty('--width', Math.floor(numericWidth / 2) + 'px');
        dragVerify.value?.style.setProperty('--pwidth', -Math.floor(numericWidth / 2) + 'px');
    });
    // 重复添加事件监听器（确保事件绑定）
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
});
// 组件卸载前清理事件监听器
onBeforeUnmount(() => {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
});
// 滑块样式计算
const handlerStyle = {
    left: '0',
    width: props.height + 'px',
    height: props.height + 'px',
    background: props.handlerBg
};
// 主容器样式计算
const dragVerifyStyle = computed(() => ({
    width: getStyleWidth(),
    height: props.height + 'px',
    lineHeight: props.height + 'px',
    background: props.background,
    borderRadius: props.circle ? props.height / 2 + 'px' : props.radius
}));
// 进度条样式计算
const progressBarStyle = {
    background: props.progressBarBg,
    height: props.height + 'px',
    borderRadius: props.circle
        ? props.height / 2 + 'px 0 0 ' + props.height / 2 + 'px'
        : props.radius
};
// 文本样式计算
const textStyle = computed(() => ({
    fontSize: props.textSize
}));
// 显示消息计算属性
const message = computed(() => {
    return props.value ? props.successText : props.text;
});
/**
 * 拖拽开始处理函数
 * @param e 鼠标或触摸事件对象
 */
const dragStart = (e) => {
    if (!props.value) {
        state.isMoving = true;
        handler.value.style.transition = 'none';
        // 计算拖拽起始位置
        state.x =
            (e.pageX || e.touches[0].pageX) - parseInt(handler.value.style.left.replace('px', ''), 10);
    }
    emit('handlerMove');
};
/**
 * 拖拽移动处理函数
 * @param e 鼠标或触摸事件对象
 */
const dragMoving = (e) => {
    if (state.isMoving && !props.value) {
        const numericWidth = getNumericWidth();
        // 计算当前位置
        let _x = (e.pageX || e.touches[0].pageX) - state.x;
        // 在有效范围内移动
        if (_x > 0 && _x <= numericWidth - props.height) {
            handler.value.style.left = _x + 'px';
            progressBar.value.style.width = _x + props.height / 2 + 'px';
        }
        else if (_x > numericWidth - props.height) {
            // 拖拽到末端，触发验证成功
            handler.value.style.left = numericWidth - props.height + 'px';
            progressBar.value.style.width = numericWidth - props.height / 2 + 'px';
            passVerify();
        }
    }
};
/**
 * 拖拽结束处理函数
 * @param e 鼠标或触摸事件对象
 */
const dragFinish = (e) => {
    if (state.isMoving && !props.value) {
        const numericWidth = getNumericWidth();
        // 计算最终位置
        let _x = (e.pageX || e.changedTouches[0].pageX) - state.x;
        if (_x < numericWidth - props.height) {
            // 未拖拽到末端，重置位置
            state.isOk = true;
            handler.value.style.left = '0';
            handler.value.style.transition = 'all 0.2s';
            progressBar.value.style.width = '0';
            state.isOk = false;
        }
        else {
            // 拖拽到末端，保持验证成功状态
            handler.value.style.transition = 'none';
            handler.value.style.left = numericWidth - props.height + 'px';
            progressBar.value.style.width = numericWidth - props.height / 2 + 'px';
            passVerify();
        }
        state.isMoving = false;
    }
};
/**
 * 验证通过处理函数
 */
const passVerify = () => {
    emit('update:value', true);
    state.isMoving = false;
    // 更新样式为成功状态
    progressBar.value.style.background = props.completedBg;
    messageRef.value.style['-webkit-text-fill-color'] = 'unset';
    messageRef.value.style.animation = 'slidetounlock2 2s cubic-bezier(0, 0.2, 1, 1) infinite';
    messageRef.value.style.color = '#fff';
    emit('passCallback');
};
/**
 * 重置验证状态函数
 */
const reset = () => {
    // 重置滑块位置
    handler.value.style.left = '0';
    progressBar.value.style.width = '0';
    progressBar.value.style.background = props.progressBarBg;
    // 重置文本样式
    messageRef.value.style['-webkit-text-fill-color'] = 'transparent';
    messageRef.value.style.animation = 'slidetounlock 2s cubic-bezier(0, 0.2, 1, 1) infinite';
    messageRef.value.style.color = props.background;
    // 重置状态
    emit('update:value', false);
    state.isOk = false;
    state.isMoving = false;
    state.x = 0;
};
// 暴露重置方法给父组件
const __VLS_exposed = {
    reset
};
defineExpose({
    reset
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    value: false,
    width: '100%',
    height: 40,
    text: '按住滑块拖动',
    successText: 'success',
    background: '#eee',
    progressBarBg: '#1385FF',
    completedBg: '#57D187',
    circle: false,
    radius: 'calc(var(--custom-radius) / 3 + 2px)',
    handlerIcon: 'solar:double-alt-arrow-right-linear',
    successIcon: 'ri:check-fill',
    handlerBg: '#fff',
    textSize: '13px',
    textColor: '#333'
});
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onMousemove: (__VLS_ctx.dragMoving) }, ...{ onMouseup: (__VLS_ctx.dragFinish) }, ...{ onMouseleave: (__VLS_ctx.dragFinish) }, ...{ onTouchmove: (__VLS_ctx.dragMoving) }, ...{ onTouchend: (__VLS_ctx.dragFinish) }, ref: ("dragVerify"), ...{ class: ("drag_verify") }, ...{ style: ((__VLS_ctx.dragVerifyStyle)) }, });
    // @ts-ignore navigation for `const dragVerify = ref()`
    __VLS_ctx.dragVerify;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dv_progress_bar") }, ...{ class: (({ goFirst2: __VLS_ctx.isOk })) }, ref: ("progressBar"), ...{ style: ((__VLS_ctx.progressBarStyle)) }, });
    // @ts-ignore navigation for `const progressBar = ref()`
    __VLS_ctx.progressBar;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dv_text") }, ...{ style: ((__VLS_ctx.textStyle)) }, ref: ("messageRef"), });
    // @ts-ignore navigation for `const messageRef = ref()`
    __VLS_ctx.messageRef;
    if (__VLS_ctx.$slots.textBefore) {
        var __VLS_0 = {};
    }
    (__VLS_ctx.message);
    if (__VLS_ctx.$slots.textAfter) {
        var __VLS_1 = {};
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onMousedown: (__VLS_ctx.dragStart) }, ...{ onTouchstart: (__VLS_ctx.dragStart) }, ...{ class: ("dv_handler dv_handler_bg") }, ...{ class: (({ goFirst: __VLS_ctx.isOk })) }, ref: ("handler"), ...{ style: ((__VLS_ctx.handlerStyle)) }, });
    // @ts-ignore navigation for `const handler = ref()`
    __VLS_ctx.handler;
    const __VLS_2 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(__VLS_2, new __VLS_2({ icon: ((__VLS_ctx.value ? __VLS_ctx.successIcon : __VLS_ctx.handlerIcon)), ...{ class: ("text-g-600") }, }));
    const __VLS_4 = __VLS_3({ icon: ((__VLS_ctx.value ? __VLS_ctx.successIcon : __VLS_ctx.handlerIcon)), ...{ class: ("text-g-600") }, }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    __VLS_styleScopedClasses['drag_verify'];
    __VLS_styleScopedClasses['dv_progress_bar'];
    __VLS_styleScopedClasses['goFirst2'];
    __VLS_styleScopedClasses['dv_text'];
    __VLS_styleScopedClasses['dv_handler'];
    __VLS_styleScopedClasses['dv_handler_bg'];
    __VLS_styleScopedClasses['goFirst'];
    __VLS_styleScopedClasses['text-g-600'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "dragVerify": __VLS_nativeElements['div'],
        "progressBar": __VLS_nativeElements['div'],
        "messageRef": __VLS_nativeElements['div'],
        "handler": __VLS_nativeElements['div'],
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
            isOk: isOk,
            dragVerify: dragVerify,
            messageRef: messageRef,
            handler: handler,
            progressBar: progressBar,
            handlerStyle: handlerStyle,
            dragVerifyStyle: dragVerifyStyle,
            progressBarStyle: progressBarStyle,
            textStyle: textStyle,
            message: message,
            dragStart: dragStart,
            dragMoving: dragMoving,
            dragFinish: dragFinish,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map