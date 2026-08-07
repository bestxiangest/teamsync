/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProjectMembers, inviteMember, removeMember } from '@/api/member';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const visible = defineModel('visible', { default: false });
const userStore = useUserStore();
// 数据状态
const members = ref([]);
const loading = ref(false);
const inviteUsername = ref('');
const inviting = ref(false);
const removingId = ref(null);
// 当前用户ID
const currentUserId = computed(() => {
    return userStore.info?.userId;
});
// 当前用户是否是管理员
const isAdmin = computed(() => {
    if (!currentUserId.value)
        return false;
    const currentMember = members.value.find((m) => m.userId === currentUserId.value);
    return currentMember?.role === 'admin';
});
// 监听 visible 变化，打开时获取成员
watch(visible, (val) => {
    if (val && props.projectId) {
        fetchMembers();
    }
});
/**
 * 获取成员列表
 */
const fetchMembers = async () => {
    if (!props.projectId)
        return;
    loading.value = true;
    try {
        const data = await getProjectMembers(props.projectId);
        members.value = data || [];
        console.log('[MemberDialog] 成员列表:', members.value);
        console.log('[MemberDialog] 当前用户ID:', currentUserId.value);
        console.log('[MemberDialog] 是否管理员:', isAdmin.value);
    }
    catch (error) {
        console.error('获取成员列表失败:', error);
        ElMessage.error('获取成员列表失败');
    }
    finally {
        loading.value = false;
    }
};
/**
 * 邀请成员
 */
const handleInvite = async () => {
    if (!isAdmin.value) {
        ElMessage.warning('只有管理员才能邀请新成员');
        return;
    }
    const username = inviteUsername.value.trim();
    if (!username) {
        ElMessage.warning('请输入用户名');
        return;
    }
    inviting.value = true;
    try {
        const newMember = await inviteMember(props.projectId, username);
        members.value.push(newMember);
        inviteUsername.value = '';
        ElMessage.success(`已邀请 ${newMember.nickname || newMember.username} 加入项目`);
    }
    catch (error) {
        console.error('邀请失败:', error);
    }
    finally {
        inviting.value = false;
    }
};
/**
 * 移除成员
 */
const handleRemove = async (member) => {
    try {
        await ElMessageBox.confirm(`确定要将 "${member.nickname || member.username}" 移出项目吗？`, '移除成员', {
            confirmButtonText: '移除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        });
        removingId.value = member.userId;
        await removeMember(props.projectId, member.userId);
        members.value = members.value.filter((m) => m.userId !== member.userId);
        ElMessage.success('成员已移除');
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('移除失败:', error);
        }
    }
    finally {
        removingId.value = null;
    }
};
// 暴露方法供父组件调用
const __VLS_exposed = {
    fetchMembers
};
defineExpose({
    fetchMembers
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
;
let __VLS_functionalComponentProps;
const __VLS_defaults = {
    visible: false,
};
const __VLS_modelEmit = defineEmits();
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onOpen': {} }, modelValue: ((__VLS_ctx.visible)), title: ("项目成员"), width: ("520px"), closeOnClickModal: ((false)), }));
    const __VLS_2 = __VLS_1({ ...{ 'onOpen': {} }, modelValue: ((__VLS_ctx.visible)), title: ("项目成员"), width: ("520px"), closeOnClickModal: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onOpen: (__VLS_ctx.fetchMembers)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("member-list") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    if (__VLS_ctx.members.length === 0 && !__VLS_ctx.loading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-state") }, });
        const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ icon: ("ri:user-line"), }));
        const __VLS_11 = __VLS_10({ icon: ("ri:user-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    for (const [member] of __VLS_getVForSourceType((__VLS_ctx.members))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((member.userId)), ...{ class: ("member-item") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("member-info") }, });
        const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
        /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ size: ((40)), src: ((member.avatar)), }));
        const __VLS_17 = __VLS_16({ size: ((40)), src: ((member.avatar)), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        (member.nickname?.charAt(0) || member.username?.charAt(0));
        __VLS_nonNullable(__VLS_20.slots).default;
        var __VLS_20;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("member-detail") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("member-name") }, });
        (member.nickname || member.username);
        if (member.role === 'admin') {
            const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
            // @ts-ignore
            const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ size: ("small"), type: ("warning"), }));
            const __VLS_23 = __VLS_22({ size: ("small"), type: ("warning"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
            __VLS_nonNullable(__VLS_26.slots).default;
            var __VLS_26;
        }
        if (member.userId === __VLS_ctx.currentUserId) {
            const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ size: ("small"), type: ("info"), }));
            const __VLS_29 = __VLS_28({ size: ("small"), type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
            __VLS_nonNullable(__VLS_32.slots).default;
            var __VLS_32;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("member-username") }, });
        (member.username);
        if (__VLS_ctx.isAdmin && member.role !== 'admin' && member.userId !== __VLS_ctx.currentUserId) {
            const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ ...{ 'onClick': {} }, type: ("danger"), size: ("small"), plain: (true), loading: ((__VLS_ctx.removingId === member.userId)), }));
            const __VLS_35 = __VLS_34({ ...{ 'onClick': {} }, type: ("danger"), size: ("small"), plain: (true), loading: ((__VLS_ctx.removingId === member.userId)), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
            let __VLS_39;
            const __VLS_40 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.isAdmin && member.role !== 'admin' && member.userId !== __VLS_ctx.currentUserId)))
                        return;
                    __VLS_ctx.handleRemove(member);
                }
            };
            let __VLS_36;
            let __VLS_37;
            __VLS_nonNullable(__VLS_38.slots).default;
            var __VLS_38;
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("invite-section") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("invite-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("invite-title") }, });
    if (!__VLS_ctx.isAdmin) {
        const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ size: ("small"), type: ("info"), }));
        const __VLS_43 = __VLS_42({ size: ("small"), type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        __VLS_nonNullable(__VLS_46.slots).default;
        var __VLS_46;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("invite-form") }, });
    const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.inviteUsername)), placeholder: ("输入要邀请的用户名（精确匹配）"), clearable: (true), disabled: ((!__VLS_ctx.isAdmin)), }));
    const __VLS_49 = __VLS_48({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.inviteUsername)), placeholder: ("输入要邀请的用户名（精确匹配）"), clearable: (true), disabled: ((!__VLS_ctx.isAdmin)), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_53;
    const __VLS_54 = {
        onKeyup: (__VLS_ctx.handleInvite)
    };
    let __VLS_50;
    let __VLS_51;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_52.slots);
        const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ icon: ("ri:user-add-line"), }));
        const __VLS_57 = __VLS_56({ icon: ("ri:user-add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    }
    var __VLS_52;
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.inviting)), disabled: ((!__VLS_ctx.isAdmin || !__VLS_ctx.inviteUsername.trim())), }));
    const __VLS_63 = __VLS_62({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.inviting)), disabled: ((!__VLS_ctx.isAdmin || !__VLS_ctx.inviteUsername.trim())), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_67;
    const __VLS_68 = {
        onClick: (__VLS_ctx.handleInvite)
    };
    let __VLS_64;
    let __VLS_65;
    __VLS_nonNullable(__VLS_66.slots).default;
    var __VLS_66;
    if (!__VLS_ctx.isAdmin) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("invite-tip") }, });
        const __VLS_69 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({ icon: ("ri:information-line"), }));
        const __VLS_71 = __VLS_70({ icon: ("ri:information-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("member-count") }, });
        (__VLS_ctx.members.length);
        const __VLS_75 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({ ...{ 'onClick': {} }, }));
        const __VLS_77 = __VLS_76({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        let __VLS_81;
        const __VLS_82 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_78;
        let __VLS_79;
        __VLS_nonNullable(__VLS_80.slots).default;
        var __VLS_80;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['member-list'];
    __VLS_styleScopedClasses['empty-state'];
    __VLS_styleScopedClasses['member-item'];
    __VLS_styleScopedClasses['member-info'];
    __VLS_styleScopedClasses['member-detail'];
    __VLS_styleScopedClasses['member-name'];
    __VLS_styleScopedClasses['member-username'];
    __VLS_styleScopedClasses['invite-section'];
    __VLS_styleScopedClasses['invite-header'];
    __VLS_styleScopedClasses['invite-title'];
    __VLS_styleScopedClasses['invite-form'];
    __VLS_styleScopedClasses['invite-tip'];
    __VLS_styleScopedClasses['dialog-footer'];
    __VLS_styleScopedClasses['member-count'];
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
            visible: visible,
            members: members,
            loading: loading,
            inviteUsername: inviteUsername,
            inviting: inviting,
            removingId: removingId,
            currentUserId: currentUserId,
            isAdmin: isAdmin,
            fetchMembers: fetchMembers,
            handleInvite: handleInvite,
            handleRemove: handleRemove,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MemberDialog.vue.js.map