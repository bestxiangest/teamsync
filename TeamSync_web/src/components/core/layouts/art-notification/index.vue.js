/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
// 导入头像图片
import avatar1 from '@/assets/images/avatar/avatar1.webp';
import avatar2 from '@/assets/images/avatar/avatar2.webp';
import avatar3 from '@/assets/images/avatar/avatar3.webp';
import avatar4 from '@/assets/images/avatar/avatar4.webp';
import avatar5 from '@/assets/images/avatar/avatar5.webp';
import avatar6 from '@/assets/images/avatar/avatar6.webp';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtNotification' });
const { t } = useI18n();
const props = defineProps();
const emit = defineEmits();
const show = ref(false);
const visible = ref(false);
const barActiveIndex = ref(0);
const useNotificationData = () => {
    // 通知数据
    const noticeList = ref([
        {
            title: '新增国际化',
            time: '2024-6-13 0:10',
            type: 'notice'
        },
        {
            title: '冷月呆呆给你发了一条消息',
            time: '2024-4-21 8:05',
            type: 'message'
        },
        {
            title: '小肥猪关注了你',
            time: '2020-3-17 21:12',
            type: 'collection'
        },
        {
            title: '新增使用文档',
            time: '2024-02-14 0:20',
            type: 'notice'
        },
        {
            title: '小肥猪给你发了一封邮件',
            time: '2024-1-20 0:15',
            type: 'email'
        },
        {
            title: '菜单mock本地真实数据',
            time: '2024-1-17 22:06',
            type: 'notice'
        }
    ]);
    // 消息数据
    const msgList = ref([
        {
            title: '池不胖 关注了你',
            time: '2021-2-26 23:50',
            avatar: avatar1
        },
        {
            title: '唐不苦 关注了你',
            time: '2021-2-21 8:05',
            avatar: avatar2
        },
        {
            title: '中小鱼 关注了你',
            time: '2020-1-17 21:12',
            avatar: avatar3
        },
        {
            title: '何小荷 关注了你',
            time: '2021-01-14 0:20',
            avatar: avatar4
        },
        {
            title: '誶誶淰 关注了你',
            time: '2020-12-20 0:15',
            avatar: avatar5
        },
        {
            title: '冷月呆呆 关注了你',
            time: '2020-12-17 22:06',
            avatar: avatar6
        }
    ]);
    // 待办数据
    const pendingList = ref([]);
    // 标签栏数据
    const barList = computed(() => [
        {
            name: computed(() => t('notice.bar[0]')),
            num: noticeList.value.length
        },
        {
            name: computed(() => t('notice.bar[1]')),
            num: msgList.value.length
        },
        {
            name: computed(() => t('notice.bar[2]')),
            num: pendingList.value.length
        }
    ]);
    return {
        noticeList,
        msgList,
        pendingList,
        barList
    };
};
// 样式管理
const useNotificationStyles = () => {
    const noticeStyleMap = {
        email: {
            icon: 'ri:mail-line',
            iconClass: 'bg-warning/12 text-warning'
        },
        message: {
            icon: 'ri:volume-down-line',
            iconClass: 'bg-success/12 text-success'
        },
        collection: {
            icon: 'ri:heart-3-line',
            iconClass: 'bg-danger/12 text-danger'
        },
        user: {
            icon: 'ri:volume-down-line',
            iconClass: 'bg-info/12 text-info'
        },
        notice: {
            icon: 'ri:notification-3-line',
            iconClass: 'bg-theme/12 text-theme'
        }
    };
    const getNoticeStyle = (type) => {
        const defaultStyle = {
            icon: 'ri:arrow-right-circle-line',
            iconClass: 'bg-theme/12 text-theme'
        };
        return noticeStyleMap[type] || defaultStyle;
    };
    return {
        getNoticeStyle
    };
};
// 动画管理
const useNotificationAnimation = () => {
    const showNotice = (open) => {
        if (open) {
            visible.value = true;
            setTimeout(() => {
                show.value = true;
            }, 5);
        }
        else {
            show.value = false;
            setTimeout(() => {
                visible.value = false;
            }, 350);
        }
    };
    return {
        showNotice
    };
};
// 标签页管理
const useTabManagement = (noticeList, msgList, pendingList, businessHandlers) => {
    const changeBar = (index) => {
        barActiveIndex.value = index;
    };
    // 检查当前标签页是否为空
    const currentTabIsEmpty = computed(() => {
        const tabDataMap = [noticeList.value, msgList.value, pendingList.value];
        const currentData = tabDataMap[barActiveIndex.value];
        return currentData && currentData.length === 0;
    });
    const handleViewAll = () => {
        // 查看全部处理器映射
        const viewAllHandlers = {
            0: businessHandlers.handleNoticeAll,
            1: businessHandlers.handleMsgAll,
            2: businessHandlers.handlePendingAll
        };
        const handler = viewAllHandlers[barActiveIndex.value];
        handler?.();
        // 关闭通知面板
        emit('update:value', false);
    };
    return {
        changeBar,
        currentTabIsEmpty,
        handleViewAll
    };
};
// 业务逻辑处理
const useBusinessLogic = () => {
    const handleNoticeAll = () => {
        // 处理查看全部通知
        console.log('查看全部通知');
    };
    const handleMsgAll = () => {
        // 处理查看全部消息
        console.log('查看全部消息');
    };
    const handlePendingAll = () => {
        // 处理查看全部待办
        console.log('查看全部待办');
    };
    return {
        handleNoticeAll,
        handleMsgAll,
        handlePendingAll
    };
};
// 组合所有逻辑
const { noticeList, msgList, pendingList, barList } = useNotificationData();
const { getNoticeStyle } = useNotificationStyles();
const { showNotice } = useNotificationAnimation();
const { handleNoticeAll, handleMsgAll, handlePendingAll } = useBusinessLogic();
const { changeBar, currentTabIsEmpty, handleViewAll } = useTabManagement(noticeList, msgList, pendingList, { handleNoticeAll, handleMsgAll, handlePendingAll });
// 监听属性变化
watch(() => props.value, (newValue) => {
    showNotice(newValue);
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['scrollbar-thin'];
    __VLS_styleScopedClasses['dark'];
    __VLS_styleScopedClasses['scrollbar-thin'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("art-notification-panel art-card-sm !shadow-xl") }, ...{ style: (({
                transform: __VLS_ctx.show ? 'scaleY(1)' : 'scaleY(0.9)',
                opacity: __VLS_ctx.show ? 1 : 0
            })) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.visible) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cb px-3.5 mt-3.5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-base font-medium text-g-800") }, });
    (__VLS_ctx.$t('notice.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs text-g-800 px-1.5 py-1 c-p select-none rounded hover:bg-g-200") }, });
    (__VLS_ctx.$t('notice.btnRead'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("box-border flex items-end w-full h-12.5 px-3.5 border-b-d") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.barList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.changeBar(index);
                } }, key: ((index)), ...{ class: ("h-12 leading-12 mr-5 overflow-hidden text-[13px] text-g-700 c-p select-none") }, ...{ class: (({ 'bar-active': __VLS_ctx.barActiveIndex === index })) }, });
        (item.name);
        (item.num);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full h-[calc(100%-95px)]") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("h-[calc(100%-60px)] overflow-y-scroll scrollbar-thin") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.barActiveIndex === 0) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.noticeList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ key: ((index)), ...{ class: ("box-border flex-c px-3.5 py-3.5 c-p last:border-b-0 hover:bg-g-200/60") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("size-9 leading-9 text-center rounded-lg flex-cc") }, ...{ class: (([__VLS_ctx.getNoticeStyle(item.type).iconClass])) }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("text-lg !bg-transparent") }, icon: ((__VLS_ctx.getNoticeStyle(item.type).icon)), }));
        const __VLS_2 = __VLS_1({ ...{ class: ("text-lg !bg-transparent") }, icon: ((__VLS_ctx.getNoticeStyle(item.type).icon)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-[calc(100%-45px)] ml-3.5") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({ ...{ class: ("text-sm font-normal leading-5.5 text-g-900") }, });
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1.5 text-xs text-g-500") }, });
        (item.time);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.barActiveIndex === 1) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.msgList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ key: ((index)), ...{ class: ("box-border flex-c px-3.5 py-3.5 c-p last:border-b-0 hover:bg-g-200/60") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-9 h-9") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((item.avatar)), ...{ class: ("w-full h-full rounded-lg") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-[calc(100%-45px)] ml-3.5") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({ ...{ class: ("text-xs font-normal leading-5.5") }, });
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1.5 text-xs text-g-500") }, });
        (item.time);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.barActiveIndex === 2) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.pendingList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ key: ((index)), ...{ class: ("box-border px-5 py-3.5 last:border-b-0") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-xs text-g-500") }, });
        (item.time);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative top-25 h-full text-g-500 text-center !bg-transparent") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.currentTabIsEmpty) }, null, null);
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ("system-uicons:inbox"), ...{ class: ("text-5xl") }, }));
    const __VLS_8 = __VLS_7({ icon: ("system-uicons:inbox"), ...{ class: ("text-5xl") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-3.5 text-xs !bg-transparent") }, });
    (__VLS_ctx.$t('notice.text[0]'));
    (__VLS_ctx.barList[__VLS_ctx.barActiveIndex].name);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative box-border w-full px-3.5") }, });
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onClick': {} }, ...{ class: ("w-full mt-3") }, }));
    const __VLS_14 = __VLS_13({ ...{ 'onClick': {} }, ...{ class: ("w-full mt-3") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.handleViewAll)
    };
    let __VLS_15;
    let __VLS_16;
    (__VLS_ctx.$t('notice.viewAll'));
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("h-25") }, });
    __VLS_styleScopedClasses['art-notification-panel'];
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['!shadow-xl'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['px-3.5'];
    __VLS_styleScopedClasses['mt-3.5'];
    __VLS_styleScopedClasses['text-base'];
    __VLS_styleScopedClasses['font-medium'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['px-1.5'];
    __VLS_styleScopedClasses['py-1'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['hover:bg-g-200'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-end'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-12.5'];
    __VLS_styleScopedClasses['px-3.5'];
    __VLS_styleScopedClasses['border-b-d'];
    __VLS_styleScopedClasses['h-12'];
    __VLS_styleScopedClasses['leading-12'];
    __VLS_styleScopedClasses['mr-5'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['text-[13px]'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['bar-active'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-[calc(100%-95px)]'];
    __VLS_styleScopedClasses['h-[calc(100%-60px)]'];
    __VLS_styleScopedClasses['overflow-y-scroll'];
    __VLS_styleScopedClasses['scrollbar-thin'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['px-3.5'];
    __VLS_styleScopedClasses['py-3.5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['last:border-b-0'];
    __VLS_styleScopedClasses['hover:bg-g-200/60'];
    __VLS_styleScopedClasses['size-9'];
    __VLS_styleScopedClasses['leading-9'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['!bg-transparent'];
    __VLS_styleScopedClasses['w-[calc(100%-45px)]'];
    __VLS_styleScopedClasses['ml-3.5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['leading-5.5'];
    __VLS_styleScopedClasses['text-g-900'];
    __VLS_styleScopedClasses['mt-1.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['px-3.5'];
    __VLS_styleScopedClasses['py-3.5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['last:border-b-0'];
    __VLS_styleScopedClasses['hover:bg-g-200/60'];
    __VLS_styleScopedClasses['w-9'];
    __VLS_styleScopedClasses['h-9'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['w-[calc(100%-45px)]'];
    __VLS_styleScopedClasses['ml-3.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['leading-5.5'];
    __VLS_styleScopedClasses['mt-1.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['px-5'];
    __VLS_styleScopedClasses['py-3.5'];
    __VLS_styleScopedClasses['last:border-b-0'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['top-25'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['!bg-transparent'];
    __VLS_styleScopedClasses['text-5xl'];
    __VLS_styleScopedClasses['mt-3.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['!bg-transparent'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['px-3.5'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['mt-3'];
    __VLS_styleScopedClasses['h-25'];
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
            show: show,
            visible: visible,
            barActiveIndex: barActiveIndex,
            noticeList: noticeList,
            msgList: msgList,
            pendingList: pendingList,
            barList: barList,
            getNoticeStyle: getNoticeStyle,
            changeBar: changeBar,
            currentTabIsEmpty: currentTabIsEmpty,
            handleViewAll: handleViewAll,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map