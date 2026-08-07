/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtVideoPlayer' });
const props = withDefaults(defineProps(), {
    playerId: '',
    videoUrl: '',
    posterUrl: '',
    autoplay: false,
    volume: 1,
    loop: false,
    muted: false
});
// 设置属性默认值
// 播放器实例引用
const playerInstance = ref(null);
// 默认样式配置
const defaultStyle = {
    progressColor: 'rgba(255, 255, 255, 0.3)',
    playedColor: '#00AEED',
    cachedColor: 'rgba(255, 255, 255, 0.6)',
    sliderBtnStyle: {
        width: '10px',
        height: '10px',
        backgroundColor: '#00AEED'
    },
    volumeColor: '#00AEED'
};
// 组件挂载时初始化播放器
onMounted(() => {
    playerInstance.value = new Player({
        id: props.playerId,
        lang: 'zh', // 设置界面语言为中文
        volume: props.volume,
        autoplay: props.autoplay,
        screenShot: true, // 启用截图功能
        url: props.videoUrl,
        poster: props.posterUrl,
        fluid: true, // 启用流式布局，自适应容器大小
        playbackRate: props.playbackRates,
        loop: props.loop,
        muted: props.muted,
        commonStyle: {
            ...defaultStyle,
            ...props.commonStyle
        }
    });
    // 播放事件监听器
    playerInstance.value.on('play', () => {
        console.log('Video is playing');
    });
    // 暂停事件监听器
    playerInstance.value.on('pause', () => {
        console.log('Video is paused');
    });
    // 错误事件监听器
    playerInstance.value.on('error', (error) => {
        console.error('Error occurred:', error);
    });
});
// 组件卸载前清理播放器实例
onBeforeUnmount(() => {
    if (playerInstance.value) {
        playerInstance.value.destroy();
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    playerId: '',
    videoUrl: '',
    posterUrl: '',
    autoplay: false,
    volume: 1,
    loop: false,
    muted: false
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ id: ((__VLS_ctx.playerId)), });
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