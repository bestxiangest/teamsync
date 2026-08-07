/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, watchEffect } from 'vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = withDefaults(defineProps(), {
    size: 500,
    themeColor: 'var(--el-color-primary)'
});
const svgContent = ref('');
// 计算样式
const sizeStyle = computed(() => {
    const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size;
    return {
        width: sizeValue,
        height: sizeValue
    };
});
// 颜色映射配置
const COLOR_MAPPINGS = {
    '#C7DEFF': 'var(--el-color-primary-light-6)',
    '#071F4D': 'var(--el-color-primary-dark-2)',
    '#00E4E5': 'var(--el-color-primary-light-1)',
    '#006EFF': 'var(--el-color-primary)',
    '#fff': 'var(--default-box-color)',
    '#ffffff': 'var(--default-box-color)',
    '#DEEBFC': 'var(--el-color-primary-light-7)'
};
// 将主题色应用到 SVG 内容
const applyThemeToSvg = (content) => {
    return Object.entries(COLOR_MAPPINGS).reduce((processedContent, [originalColor, themeColor]) => {
        const fillRegex = new RegExp(`fill="${originalColor}"`, 'gi');
        const strokeRegex = new RegExp(`stroke="${originalColor}"`, 'gi');
        return processedContent
            .replace(fillRegex, `fill="${themeColor}"`)
            .replace(strokeRegex, `stroke="${themeColor}"`);
    }, content);
};
// 加载 SVG 文件内容
const loadSvgContent = async () => {
    if (!props.src) {
        svgContent.value = '';
        return;
    }
    try {
        const response = await fetch(props.src);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        svgContent.value = applyThemeToSvg(content);
    }
    catch (error) {
        console.error('Failed to load SVG:', error);
        svgContent.value = '';
    }
};
watchEffect(() => {
    loadSvgContent();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    size: 500,
    themeColor: 'var(--el-color-primary)'
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("theme-svg") }, ...{ style: ((__VLS_ctx.sizeStyle)) }, });
    if (__VLS_ctx.src) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("svg-container") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.svgContent) }, null, null);
    }
    __VLS_styleScopedClasses['theme-svg'];
    __VLS_styleScopedClasses['svg-container'];
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
            svgContent: svgContent,
            sizeStyle: sizeStyle,
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