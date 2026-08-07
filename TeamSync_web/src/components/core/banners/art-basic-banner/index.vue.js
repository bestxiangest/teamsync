/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, ref, computed } from 'vue';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);
defineOptions({ name: 'ArtBasicBanner' });
const props = withDefaults(defineProps(), {
    height: '11rem',
    titleColor: 'white',
    subtitleColor: 'white',
    boxStyle: '!bg-theme/60',
    decoration: true,
    buttonConfig: () => ({
        show: true,
        text: '查看',
        color: '#fff',
        textColor: '#333',
        radius: '6px'
    }),
    meteorConfig: () => ({ enabled: false, count: 10 }),
    imageConfig: () => ({ src: '', width: '12rem', bottom: '-3rem', right: '0' })
});
const emit = defineEmits();
// 计算按钮样式属性
const buttonColor = computed(() => props.buttonConfig?.color ?? '#fff');
const buttonTextColor = computed(() => props.buttonConfig?.textColor ?? '#333');
const buttonRadius = computed(() => props.buttonConfig?.radius ?? '6px');
// 流星数据初始化
const meteors = ref([]);
onMounted(() => {
    if (props.meteorConfig?.enabled) {
        meteors.value = generateMeteors(props.meteorConfig?.count ?? 10);
    }
});
/**
 * 生成流星数据数组
 * @param count 流星数量
 * @returns 流星数据数组
 */
function generateMeteors(count) {
    // 计算每个流星的区域宽度
    const segmentWidth = 100 / count;
    return Array.from({ length: count }, (_, index) => {
        // 计算流星起始位置
        const segmentStart = index * segmentWidth;
        // 在区域内随机生成x坐标
        const x = segmentStart + Math.random() * segmentWidth;
        // 随机决定流星速度快慢
        const isSlow = Math.random() > 0.5;
        return {
            x,
            speed: isSlow ? 5 + Math.random() * 3 : 2 + Math.random() * 2,
            delay: Math.random() * 5
        };
    });
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: '11rem',
    titleColor: 'white',
    subtitleColor: 'white',
    boxStyle: '!bg-theme/60',
    decoration: true,
    buttonConfig: () => ({
        show: true,
        text: '查看',
        color: '#fff',
        textColor: '#333',
        radius: '6px'
    }),
    meteorConfig: () => ({ enabled: false, count: 10 }),
    imageConfig: () => ({ src: '', width: '12rem', bottom: '-3rem', right: '0' })
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
    __VLS_styleScopedClasses['basic-banner'];
    __VLS_styleScopedClasses['has-decoration'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.emit('click');
            } }, ...{ class: ("art-card basic-banner") }, ...{ class: (([{ 'has-decoration': __VLS_ctx.decoration }, __VLS_ctx.boxStyle])) }, ...{ style: (({ height: __VLS_ctx.height })) }, });
    if (__VLS_ctx.meteorConfig?.enabled && __VLS_ctx.isDark) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("basic-banner__meteors") }, });
        for (const [meteor, index] of __VLS_getVForSourceType((__VLS_ctx.meteors))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ key: ((index)), ...{ class: ("meteor") }, ...{ style: (({
                        top: '-60px',
                        left: `${meteor.x}%`,
                        animationDuration: `${meteor.speed}s`,
                        animationDelay: `${meteor.delay}s`
                    })) }, });
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("basic-banner__content") }, });
    var __VLS_0 = {};
    if (__VLS_ctx.title) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("basic-banner__title") }, ...{ style: (({ color: __VLS_ctx.titleColor })) }, });
        (__VLS_ctx.title);
    }
    var __VLS_1 = {};
    if (__VLS_ctx.subtitle) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("basic-banner__subtitle") }, ...{ style: (({ color: __VLS_ctx.subtitleColor })) }, });
        (__VLS_ctx.subtitle);
    }
    var __VLS_2 = {};
    if (__VLS_ctx.buttonConfig?.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.buttonConfig?.show)))
                        return;
                    __VLS_ctx.emit('buttonClick');
                } }, ...{ class: ("basic-banner__button") }, ...{ style: (({
                    backgroundColor: __VLS_ctx.buttonColor,
                    color: __VLS_ctx.buttonTextColor,
                    borderRadius: __VLS_ctx.buttonRadius
                })) }, });
        (__VLS_ctx.buttonConfig?.text);
    }
    var __VLS_3 = {};
    if (__VLS_ctx.imageConfig.src) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("basic-banner__background-image") }, src: ((__VLS_ctx.imageConfig.src)), ...{ style: (({ width: __VLS_ctx.imageConfig.width, bottom: __VLS_ctx.imageConfig.bottom, right: __VLS_ctx.imageConfig.right })) }, loading: ("lazy"), alt: ("背景图片"), });
    }
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['basic-banner'];
    __VLS_styleScopedClasses['has-decoration'];
    __VLS_styleScopedClasses['basic-banner__meteors'];
    __VLS_styleScopedClasses['meteor'];
    __VLS_styleScopedClasses['basic-banner__content'];
    __VLS_styleScopedClasses['basic-banner__title'];
    __VLS_styleScopedClasses['basic-banner__subtitle'];
    __VLS_styleScopedClasses['basic-banner__button'];
    __VLS_styleScopedClasses['basic-banner__background-image'];
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
            isDark: isDark,
            emit: emit,
            buttonColor: buttonColor,
            buttonTextColor: buttonTextColor,
            buttonRadius: buttonRadius,
            meteors: meteors,
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