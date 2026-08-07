/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import ImgCutter from 'vue-img-cutter';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtCutterImg' });
const props = withDefaults(defineProps(), {
    // 基础配置默认值
    isModal: false,
    tool: true,
    toolBgc: '#fff',
    title: '',
    previewTitle: '',
    showPreview: true,
    // 尺寸相关默认值
    boxWidth: 700,
    boxHeight: 458,
    cutWidth: 470,
    cutHeight: 270,
    sizeChange: true,
    // 移动和缩放默认值
    moveAble: true,
    imgMove: true,
    scaleAble: true,
    // 图片相关默认值
    originalGraph: true,
    crossOrigin: true,
    fileType: 'png',
    quality: 0.9,
    // 水印默认值
    watermarkText: '',
    watermarkFontSize: 20,
    watermarkColor: '#ffffff',
    // 其他功能默认值
    saveCutPosition: true,
    previewMode: true
});
const emit = defineEmits(['update:imgUrl', 'error', 'imageLoadComplete', 'imageLoadError']);
const temImgPath = ref('');
const imgCutterModal = ref();
// 计算属性：整合所有ImgCutter的props
const cutterProps = computed(() => ({
    ...props,
    WatermarkText: props.watermarkText,
    WatermarkFontSize: props.watermarkFontSize,
    WatermarkColor: props.watermarkColor
}));
// 图片预加载
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
    });
}
// 初始化裁剪器
async function initImgCutter() {
    if (props.imgUrl) {
        try {
            await preloadImage(props.imgUrl);
            imgCutterModal.value?.handleOpen({
                name: '封面图片',
                src: props.imgUrl
            });
        }
        catch (error) {
            emit('error', error);
            console.error('图片加载失败:', error);
        }
    }
}
// 生命周期钩子
onMounted(() => {
    if (props.imgUrl) {
        temImgPath.value = props.imgUrl;
        initImgCutter();
    }
});
// 监听图片URL变化
watch(() => props.imgUrl, (newVal) => {
    if (newVal) {
        temImgPath.value = newVal;
        initImgCutter();
    }
});
// 实时预览
function cutterPrintImg(result) {
    temImgPath.value = result.dataURL;
}
// 裁剪完成
function cutDownImg(result) {
    emit('update:imgUrl', result.dataURL);
}
// 图片加载完成
function handleImageLoadComplete(result) {
    emit('imageLoadComplete', result);
}
// 图片加载失败
function handleImageLoadError(error) {
    emit('error', error);
    emit('imageLoadError', error);
}
// 清除所有
function handleClearAll() {
    temImgPath.value = '';
}
// 下载图片
function downloadImg() {
    console.log('下载图片');
    const a = document.createElement('a');
    a.href = temImgPath.value;
    a.download = 'image.png';
    a.click();
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    // 基础配置默认值
    isModal: false,
    tool: true,
    toolBgc: '#fff',
    title: '',
    previewTitle: '',
    showPreview: true,
    // 尺寸相关默认值
    boxWidth: 700,
    boxHeight: 458,
    cutWidth: 470,
    cutHeight: 270,
    sizeChange: true,
    // 移动和缩放默认值
    moveAble: true,
    imgMove: true,
    scaleAble: true,
    // 图片相关默认值
    originalGraph: true,
    crossOrigin: true,
    fileType: 'png',
    quality: 0.9,
    // 水印默认值
    watermarkText: '',
    watermarkFontSize: 20,
    watermarkColor: '#ffffff',
    // 其他功能默认值
    saveCutPosition: true,
    previewMode: true
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
    __VLS_styleScopedClasses['cutter-container'];
    __VLS_styleScopedClasses['i-dialog-footer'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("cutter-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("cutter-component") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("title") }, });
    (__VLS_ctx.title);
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ImgCutter;
    /** @type { [typeof __VLS_components.ImgCutter, typeof __VLS_components.ImgCutter, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onCutDown': {} }, ...{ 'onOnPrintImg': {} }, ...{ 'onOnImageLoadComplete': {} }, ...{ 'onOnImageLoadError': {} }, ...{ 'onOnClearAll': {} }, ref: ("imgCutterModal"), ...(__VLS_ctx.cutterProps), ...{ class: ("img-cutter") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onCutDown': {} }, ...{ 'onOnPrintImg': {} }, ...{ 'onOnImageLoadComplete': {} }, ...{ 'onOnImageLoadError': {} }, ...{ 'onOnClearAll': {} }, ref: ("imgCutterModal"), ...(__VLS_ctx.cutterProps), ...{ class: ("img-cutter") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const imgCutterModal = ref()`
    __VLS_ctx.imgCutterModal;
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onCutDown: (__VLS_ctx.cutDownImg)
    };
    const __VLS_9 = {
        onOnPrintImg: (__VLS_ctx.cutterPrintImg)
    };
    const __VLS_10 = {
        onOnImageLoadComplete: (__VLS_ctx.handleImageLoadComplete)
    };
    const __VLS_11 = {
        onOnImageLoadError: (__VLS_ctx.handleImageLoadError)
    };
    const __VLS_12 = {
        onOnClearAll: (__VLS_ctx.handleClearAll)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { choose: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ type: ("primary"), plain: (true), }));
        const __VLS_15 = __VLS_14({ type: ("primary"), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        __VLS_nonNullable(__VLS_18.slots).default;
        var __VLS_18;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { cancel: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ type: ("danger"), plain: (true), }));
        const __VLS_21 = __VLS_20({ type: ("danger"), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        __VLS_nonNullable(__VLS_24.slots).default;
        var __VLS_24;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { confirm: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    }
    var __VLS_5;
    if (__VLS_ctx.showPreview) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-container") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("title") }, });
        (__VLS_ctx.previewTitle);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-box") }, ...{ style: (({
                    width: `${__VLS_ctx.cutterProps.cutWidth}px`,
                    height: `${__VLS_ctx.cutterProps.cutHeight}px`
                })) }, });
        if (__VLS_ctx.temImgPath) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("preview-img") }, src: ((__VLS_ctx.temImgPath)), alt: ("预览图"), });
        }
        const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ ...{ 'onClick': {} }, ...{ class: ("download-btn") }, disabled: ((!__VLS_ctx.temImgPath)), }));
        const __VLS_27 = __VLS_26({ ...{ 'onClick': {} }, ...{ class: ("download-btn") }, disabled: ((!__VLS_ctx.temImgPath)), }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_31;
        const __VLS_32 = {
            onClick: (__VLS_ctx.downloadImg)
        };
        let __VLS_28;
        let __VLS_29;
        __VLS_nonNullable(__VLS_30.slots).default;
        var __VLS_30;
    }
    __VLS_styleScopedClasses['cutter-container'];
    __VLS_styleScopedClasses['cutter-component'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['img-cutter'];
    __VLS_styleScopedClasses['preview-container'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['preview-box'];
    __VLS_styleScopedClasses['preview-img'];
    __VLS_styleScopedClasses['download-btn'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "imgCutterModal": __VLS_6,
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
            ImgCutter: ImgCutter,
            temImgPath: temImgPath,
            imgCutterModal: imgCutterModal,
            cutterProps: cutterProps,
            cutterPrintImg: cutterPrintImg,
            cutDownImg: cutDownImg,
            handleImageLoadComplete: handleImageLoadComplete,
            handleImageLoadError: handleImageLoadError,
            handleClearAll: handleClearAll,
            downloadImg: downloadImg,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map