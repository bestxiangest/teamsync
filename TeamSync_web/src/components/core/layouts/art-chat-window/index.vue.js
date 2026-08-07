/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { Picture, Paperclip, Close } from '@element-plus/icons-vue';
import { mittBus } from '@/utils/sys';
import meAvatar from '@/assets/images/avatar/avatar5.webp';
import aiAvatar from '@/assets/images/avatar/avatar10.webp';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtChatWindow' });
// 常量定义
const MOBILE_BREAKPOINT = 640;
const SCROLL_DELAY = 100;
const BOT_NAME = 'Art Bot';
const USER_NAME = 'Ricky';
// 响应式布局
const { width } = useWindowSize();
const isMobile = computed(() => width.value < MOBILE_BREAKPOINT);
// 组件状态
const isDrawerVisible = ref(false);
const isOnline = ref(true);
// 消息相关状态
const messageText = ref('');
const messageId = ref(10);
const messageContainer = ref(null);
// 初始化聊天消息数据
const initializeMessages = () => [
    {
        id: 1,
        sender: BOT_NAME,
        content: '你好！我是你的AI助手，有什么我可以帮你的吗？',
        time: '10:00',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 2,
        sender: USER_NAME,
        content: '我想了解一下系统的使用方法。',
        time: '10:01',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 3,
        sender: BOT_NAME,
        content: '好的，我来为您介绍系统的主要功能。首先，您可以通过左侧菜单访问不同的功能模块...',
        time: '10:02',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 4,
        sender: USER_NAME,
        content: '听起来很不错，能具体讲讲数据分析部分吗？',
        time: '10:05',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 5,
        sender: BOT_NAME,
        content: '当然可以。数据分析模块可以帮助您实时监控关键指标，并生成详细的报表...',
        time: '10:06',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 6,
        sender: USER_NAME,
        content: '太好了，那我如何开始使用呢？',
        time: '10:08',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 7,
        sender: BOT_NAME,
        content: '您可以先创建一个项目，然后在项目中添加相关的数据源，系统会自动进行分析。',
        time: '10:09',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 8,
        sender: USER_NAME,
        content: '明白了，谢谢你的帮助！',
        time: '10:10',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 9,
        sender: BOT_NAME,
        content: '不客气，有任何问题随时联系我。',
        time: '10:11',
        isMe: false,
        avatar: aiAvatar
    }
];
const messages = ref(initializeMessages());
// 工具函数
const formatCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
};
const scrollToBottom = () => {
    nextTick(() => {
        setTimeout(() => {
            if (messageContainer.value) {
                messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
            }
        }, SCROLL_DELAY);
    });
};
// 消息处理方法
const sendMessage = () => {
    const text = messageText.value.trim();
    if (!text)
        return;
    const newMessage = {
        id: messageId.value++,
        sender: USER_NAME,
        content: text,
        time: formatCurrentTime(),
        isMe: true,
        avatar: meAvatar
    };
    messages.value.push(newMessage);
    messageText.value = '';
    scrollToBottom();
};
// 聊天窗口控制方法
const openChat = () => {
    isDrawerVisible.value = true;
    scrollToBottom();
};
const closeChat = () => {
    isDrawerVisible.value = false;
};
// 生命周期
onMounted(() => {
    scrollToBottom();
    mittBus.on('openChat', openChat);
});
onUnmounted(() => {
    mittBus.off('openChat', openChat);
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDrawer;
    /** @type { [typeof __VLS_components.ElDrawer, typeof __VLS_components.ElDrawer, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.isDrawerVisible)), size: ((__VLS_ctx.isMobile ? '100%' : '480px')), withHeader: ((false)), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.isDrawerVisible)), size: ((__VLS_ctx.isMobile ? '100%' : '480px')), withHeader: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-5 flex-cb") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-base font-medium") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-1.5 flex-c gap-1") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("h-2 w-2 rounded-full") }, ...{ class: ((__VLS_ctx.isOnline ? 'bg-success/100' : 'bg-danger/100')) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs text-g-600") }, });
    (__VLS_ctx.isOnline ? '在线' : '离线');
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, ...{ class: ("c-p") }, size: ((20)), }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, ...{ class: ("c-p") }, size: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onClick: (__VLS_ctx.closeChat)
    };
    let __VLS_9;
    let __VLS_10;
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.Close;
    /** @type { [typeof __VLS_components.Close, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex h-[calc(100%-70px)] flex-col") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-1 overflow-y-auto border-t-d px-4 py-7.5 [&::-webkit-scrollbar]:!w-1") }, ref: ("messageContainer"), });
    // @ts-ignore navigation for `const messageContainer = ref()`
    __VLS_ctx.messageContainer;
    for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: (([
                    'mb-7.5 flex w-full items-start gap-2',
                    message.isMe ? 'flex-row-reverse' : 'flex-row'
                ])) }, });
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
        /** @type { [typeof __VLS_components.ElAvatar, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ size: ((32)), src: ((message.avatar)), ...{ class: ("shrink-0") }, }));
        const __VLS_22 = __VLS_21({ size: ((32)), src: ((message.avatar)), ...{ class: ("shrink-0") }, }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ((['flex max-w-[70%] flex-col', message.isMe ? 'items-end' : 'items-start'])) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: (([
                    'mb-1 flex gap-2 text-xs',
                    message.isMe ? 'flex-row-reverse' : 'flex-row'
                ])) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-medium") }, });
        (message.sender);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-g-600") }, });
        (message.time);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: (([
                    'rounded-md px-3.5 py-2.5 text-sm leading-[1.4] text-g-900',
                    message.isMe ? 'message-right bg-theme/15' : 'message-left bg-g-300/50'
                ])) }, });
        (message.content);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("px-4 pt-4") }, });
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.messageText)), type: ("textarea"), rows: ((3)), placeholder: ("输入消息"), resize: ("none"), }));
    const __VLS_28 = __VLS_27({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.messageText)), type: ("textarea"), rows: ((3)), placeholder: ("输入消息"), resize: ("none"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_32;
    const __VLS_33 = {
        onKeyup: (__VLS_ctx.sendMessage)
    };
    let __VLS_29;
    let __VLS_30;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { append: __VLS_thisSlot } = __VLS_nonNullable(__VLS_31.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex gap-2 py-2") }, });
        const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ icon: ((__VLS_ctx.Paperclip)), circle: (true), plain: (true), }));
        const __VLS_36 = __VLS_35({ icon: ((__VLS_ctx.Paperclip)), circle: (true), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ icon: ((__VLS_ctx.Picture)), circle: (true), plain: (true), }));
        const __VLS_42 = __VLS_41({ icon: ((__VLS_ctx.Picture)), circle: (true), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_48 = __VLS_47({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_52;
        const __VLS_53 = {
            onClick: (__VLS_ctx.sendMessage)
        };
        let __VLS_49;
        let __VLS_50;
        __VLS_nonNullable(__VLS_51.slots).default;
        var __VLS_51;
    }
    var __VLS_31;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-3 flex-cb") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c") }, });
    const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ icon: ("ri:image-line"), ...{ class: ("mr-5 c-p text-g-600 text-lg") }, }));
    const __VLS_56 = __VLS_55({ icon: ("ri:image-line"), ...{ class: ("mr-5 c-p text-g-600 text-lg") }, }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ icon: ("ri:emotion-happy-line"), ...{ class: ("mr-5 c-p text-g-600 text-lg") }, }));
    const __VLS_62 = __VLS_61({ icon: ("ri:emotion-happy-line"), ...{ class: ("mr-5 c-p text-g-600 text-lg") }, }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("min-w-20") }, }));
    const __VLS_68 = __VLS_67({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("min-w-20") }, }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_72;
    const __VLS_73 = {
        onClick: (__VLS_ctx.sendMessage)
    };
    let __VLS_69;
    let __VLS_70;
    __VLS_nonNullable(__VLS_71.slots).default;
    var __VLS_71;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['mt-1.5'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-1'];
    __VLS_styleScopedClasses['h-2'];
    __VLS_styleScopedClasses['w-2'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['h-[calc(100%-70px)]'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['overflow-y-auto'];
    __VLS_styleScopedClasses['border-t-d'];
    __VLS_styleScopedClasses['px-4'];
    __VLS_styleScopedClasses['py-7.5'];
    __VLS_styleScopedClasses['[&::-webkit-scrollbar]:!w-1'];
    __VLS_styleScopedClasses['mb-7.5'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['items-start'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['shrink-0'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['max-w-[70%]'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['mb-1'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['rounded-md'];
    __VLS_styleScopedClasses['px-3.5'];
    __VLS_styleScopedClasses['py-2.5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['leading-[1.4]'];
    __VLS_styleScopedClasses['text-g-900'];
    __VLS_styleScopedClasses['px-4'];
    __VLS_styleScopedClasses['pt-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['py-2'];
    __VLS_styleScopedClasses['mt-3'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['mr-5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['mr-5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['min-w-20'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "messageContainer": __VLS_nativeElements['div'],
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
            Picture: Picture,
            Paperclip: Paperclip,
            Close: Close,
            isMobile: isMobile,
            isDrawerVisible: isDrawerVisible,
            isOnline: isOnline,
            messageText: messageText,
            messageContainer: messageContainer,
            messages: messages,
            sendMessage: sendMessage,
            closeChat: closeChat,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map