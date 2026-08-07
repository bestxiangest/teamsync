const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtMenuRight' });
const props = withDefaults(defineProps(), {
    menuWidth: 120,
    submenuWidth: 150,
    itemHeight: 32,
    boundaryDistance: 10,
    menuPadding: 5,
    itemPaddingX: 6,
    borderRadius: 6,
    animationDuration: 100
});
const emit = defineEmits();
const visible = ref(false);
const position = ref({ x: 0, y: 0 });
// 用于清理定时器和事件监听器
let showTimer = null;
let eventListenersAdded = false;
// 计算菜单样式
const menuStyle = computed(() => ({
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    zIndex: 2000,
    width: `${props.menuWidth}px`
}));
// 计算菜单列表样式
const menuListStyle = computed(() => ({
    padding: `${props.menuPadding}px`
}));
// 计算菜单项样式
const menuItemStyle = computed(() => ({
    height: `${props.itemHeight}px`,
    padding: `0 ${props.itemPaddingX}px`,
    borderRadius: '4px'
}));
// 计算子菜单列表样式
const submenuListStyle = computed(() => ({
    minWidth: `${props.submenuWidth}px`,
    padding: `${props.menuPadding}px 0`,
    borderRadius: `${props.borderRadius}px`
}));
// 计算菜单高度（用于边界检测）
const calculateMenuHeight = () => {
    let totalHeight = props.menuPadding * 2; // 上下内边距
    props.menuItems.forEach((item) => {
        totalHeight += props.itemHeight;
        if (item.showLine) {
            totalHeight += 10; // 分割线额外高度
        }
    });
    return totalHeight;
};
// 优化的位置计算函数
const calculatePosition = (e) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const menuHeight = calculateMenuHeight();
    let x = e.clientX;
    let y = e.clientY;
    // 检查右边界 - 优先显示在鼠标右侧，如果空间不足则显示在左侧
    if (x + props.menuWidth > screenWidth - props.boundaryDistance) {
        x = Math.max(props.boundaryDistance, x - props.menuWidth);
    }
    // 检查下边界 - 优先显示在鼠标下方，如果空间不足则向上调整
    if (y + menuHeight > screenHeight - props.boundaryDistance) {
        y = Math.max(props.boundaryDistance, screenHeight - menuHeight - props.boundaryDistance);
    }
    // 确保不会超出边界
    x = Math.max(props.boundaryDistance, Math.min(x, screenWidth - props.menuWidth - props.boundaryDistance));
    y = Math.max(props.boundaryDistance, Math.min(y, screenHeight - menuHeight - props.boundaryDistance));
    return { x, y };
};
// 添加事件监听器
const addEventListeners = () => {
    if (eventListenersAdded)
        return;
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('contextmenu', handleDocumentContextmenu);
    document.addEventListener('keydown', handleKeydown);
    eventListenersAdded = true;
};
// 移除事件监听器
const removeEventListeners = () => {
    if (!eventListenersAdded)
        return;
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('contextmenu', handleDocumentContextmenu);
    document.removeEventListener('keydown', handleKeydown);
    eventListenersAdded = false;
};
// 处理文档点击事件
const handleDocumentClick = (e) => {
    // 检查点击是否在菜单内部
    const target = e.target;
    const menuElement = document.querySelector('.context-menu');
    if (menuElement && menuElement.contains(target)) {
        return;
    }
    hide();
};
// 处理文档右键事件
const handleDocumentContextmenu = () => {
    hide();
};
// 处理键盘事件
const handleKeydown = (e) => {
    if (e.key === 'Escape') {
        hide();
    }
};
const show = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 清理之前的定时器
    if (showTimer) {
        window.clearTimeout(showTimer);
        showTimer = null;
    }
    // 计算位置
    position.value = calculatePosition(e);
    visible.value = true;
    emit('show');
    // 延迟添加事件监听器，避免立即触发关闭
    showTimer = window.setTimeout(() => {
        if (visible.value) {
            addEventListeners();
        }
        showTimer = null;
    }, 50); // 减少延迟时间，提升响应性
};
const hide = () => {
    if (!visible.value)
        return;
    visible.value = false;
    emit('hide');
    // 清理定时器
    if (showTimer) {
        window.clearTimeout(showTimer);
        showTimer = null;
    }
    // 移除事件监听器
    removeEventListeners();
};
const handleMenuClick = (item) => {
    if (item.disabled)
        return;
    emit('select', item);
    hide();
};
// 动画钩子函数
const onBeforeEnter = (el) => {
    const element = el;
    element.style.transformOrigin = 'top left';
};
const onAfterLeave = () => {
    // 确保清理所有资源
    removeEventListeners();
    if (showTimer) {
        window.clearTimeout(showTimer);
        showTimer = null;
    }
};
// 组件卸载时清理资源
onUnmounted(() => {
    removeEventListeners();
    if (showTimer) {
        window.clearTimeout(showTimer);
        showTimer = null;
    }
});
// 导出方法供父组件调用
const __VLS_exposed = {
    show,
    hide,
    visible: computed(() => visible.value)
};
defineExpose({
    show,
    hide,
    visible: computed(() => visible.value)
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    menuWidth: 120,
    submenuWidth: 150,
    itemHeight: 32,
    boundaryDistance: 10,
    menuPadding: 5,
    itemPaddingX: 6,
    borderRadius: 6,
    animationDuration: 100
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
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['has-line'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['submenu'];
    __VLS_styleScopedClasses['submenu-arrow'];
    // CSS variable injection 
    __VLS_ctx.props.menuWidth + "px";
    __VLS_ctx.props.borderRadius + "px";
    __VLS_ctx.props.animationDuration + "ms";
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("menu-right") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.Transition;
    /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.Transition, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onBeforeEnter': {} }, ...{ 'onAfterLeave': {} }, name: ("context-menu"), persisted: (true), }));
    const __VLS_2 = __VLS_1({ ...{ 'onBeforeEnter': {} }, ...{ 'onAfterLeave': {} }, name: ("context-menu"), persisted: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onBeforeEnter: (__VLS_ctx.onBeforeEnter)
    };
    const __VLS_8 = {
        onAfterLeave: (__VLS_ctx.onAfterLeave)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ((__VLS_ctx.menuStyle)) }, ...{ class: ("context-menu art-card-xs !shadow-xl min-w-[var(--menu-width)] w-[var(--menu-width)]") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.visible) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("menu-list m-0 list-none") }, ...{ style: ((__VLS_ctx.menuListStyle)) }, });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.menuItems))) {
        (item.key);
        if (!item.children) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                        if (!((!item.children)))
                            return;
                        __VLS_ctx.handleMenuClick(item);
                    } }, ...{ class: ("menu-item relative flex-c c-p select-none rounded text-xs transition-colors duration-150 hover:bg-g-200") }, ...{ class: (({ 'is-disabled': item.disabled, 'has-line': item.showLine })) }, ...{ style: ((__VLS_ctx.menuItemStyle)) }, });
            if (item.icon) {
                const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ...{ class: ("mr-2 shrink-0 text-base text-g-800") }, icon: ((item.icon)), }));
                const __VLS_11 = __VLS_10({ ...{ class: ("mr-2 shrink-0 text-base text-g-800") }, icon: ((item.icon)), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-label flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-g-800") }, });
            (item.label);
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ class: ("menu-item submenu relative flex-c c-p select-none rounded text-xs transition-colors duration-150 hover:bg-g-200") }, ...{ style: ((__VLS_ctx.menuItemStyle)) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("submenu-title flex-c w-full") }, });
            if (item.icon) {
                const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ ...{ class: ("mr-2 shrink-0 text-base text-g-800") }, icon: ((item.icon)), }));
                const __VLS_17 = __VLS_16({ ...{ class: ("mr-2 shrink-0 text-base text-g-800") }, icon: ((item.icon)), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-label flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-g-800") }, });
            (item.label);
            const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ icon: ("ri:arrow-right-s-line"), ...{ class: ("ubmenu-arrow ml-auto mr-0 text-base text-g-500 transition-transform duration-150") }, }));
            const __VLS_23 = __VLS_22({ icon: ("ri:arrow-right-s-line"), ...{ class: ("ubmenu-arrow ml-auto mr-0 text-base text-g-500 transition-transform duration-150") }, }, ...__VLS_functionalComponentArgsRest(__VLS_22));
            __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("submenu-list art-card-xs absolute left-full top-0 z-[2001] hidden w-max min-w-max list-none !shadow-xl") }, ...{ style: ((__VLS_ctx.submenuListStyle)) }, });
            for (const [child] of __VLS_getVForSourceType((item.children))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                            if (!(!((!item.children))))
                                return;
                            __VLS_ctx.handleMenuClick(child);
                        } }, key: ((child.key)), ...{ class: ("menu-item relative mx-1.5 flex-c c-p select-none rounded text-xs transition-colors duration-150 hover:bg-g-200") }, ...{ class: (({ 'is-disabled': child.disabled, 'has-line': child.showLine })) }, ...{ style: ((__VLS_ctx.menuItemStyle)) }, });
                if (child.icon) {
                    const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ ...{ class: ("r-2 shrink-0 text-base text-g-800 mr-1") }, icon: ((child.icon)), }));
                    const __VLS_29 = __VLS_28({ ...{ class: ("r-2 shrink-0 text-base text-g-800 mr-1") }, icon: ((child.icon)), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
                }
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-label flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-g-800") }, });
                (child.label);
            }
        }
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['menu-right'];
    __VLS_styleScopedClasses['context-menu'];
    __VLS_styleScopedClasses['art-card-xs'];
    __VLS_styleScopedClasses['!shadow-xl'];
    __VLS_styleScopedClasses['min-w-[var(--menu-width)]'];
    __VLS_styleScopedClasses['w-[var(--menu-width)]'];
    __VLS_styleScopedClasses['menu-list'];
    __VLS_styleScopedClasses['m-0'];
    __VLS_styleScopedClasses['list-none'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['transition-colors'];
    __VLS_styleScopedClasses['duration-150'];
    __VLS_styleScopedClasses['hover:bg-g-200'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['has-line'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['shrink-0'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['menu-label'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['text-ellipsis'];
    __VLS_styleScopedClasses['whitespace-nowrap'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['submenu'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['transition-colors'];
    __VLS_styleScopedClasses['duration-150'];
    __VLS_styleScopedClasses['hover:bg-g-200'];
    __VLS_styleScopedClasses['submenu-title'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['shrink-0'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['menu-label'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['text-ellipsis'];
    __VLS_styleScopedClasses['whitespace-nowrap'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['ubmenu-arrow'];
    __VLS_styleScopedClasses['ml-auto'];
    __VLS_styleScopedClasses['mr-0'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['transition-transform'];
    __VLS_styleScopedClasses['duration-150'];
    __VLS_styleScopedClasses['submenu-list'];
    __VLS_styleScopedClasses['art-card-xs'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['left-full'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['z-[2001]'];
    __VLS_styleScopedClasses['hidden'];
    __VLS_styleScopedClasses['w-max'];
    __VLS_styleScopedClasses['min-w-max'];
    __VLS_styleScopedClasses['list-none'];
    __VLS_styleScopedClasses['!shadow-xl'];
    __VLS_styleScopedClasses['menu-item'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['mx-1.5'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['transition-colors'];
    __VLS_styleScopedClasses['duration-150'];
    __VLS_styleScopedClasses['hover:bg-g-200'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['has-line'];
    __VLS_styleScopedClasses['r-2'];
    __VLS_styleScopedClasses['shrink-0'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['menu-label'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['text-ellipsis'];
    __VLS_styleScopedClasses['whitespace-nowrap'];
    __VLS_styleScopedClasses['text-g-800'];
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
            props: props,
            visible: visible,
            menuStyle: menuStyle,
            menuListStyle: menuListStyle,
            menuItemStyle: menuItemStyle,
            submenuListStyle: submenuListStyle,
            handleMenuClick: handleMenuClick,
            onBeforeEnter: onBeforeEnter,
            onAfterLeave: onAfterLeave,
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