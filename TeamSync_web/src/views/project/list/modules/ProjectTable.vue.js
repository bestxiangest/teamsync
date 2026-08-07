/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const userStore = useUserStore();
const props = defineProps();
const __VLS_emit = defineEmits(['view', 'files', 'command', 'unarchive', 'delete']);
const isOwner = (row) => {
    return userStore.info?.userId === row.ownerId;
};
/**
 * 获取分组名称
 */
const getGroupName = (groupId) => {
    if (!props.groups || groupId <= 0)
        return '根目录';
    const group = props.groups.find((g) => g.id === groupId);
    return group?.name || '未知分组';
};
const formatDateTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ data: ((__VLS_ctx.projects)), stripe: (true), ...{ style: ({}) }, emptyText: ((__VLS_ctx.activeTab === 'active' ? '暂无项目，点击右上角创建您的第一个项目' : '暂无归档项目')), }));
    const __VLS_2 = __VLS_1({ data: ((__VLS_ctx.projects)), stripe: (true), ...{ style: ({}) }, emptyText: ((__VLS_ctx.activeTab === 'active' ? '暂无项目，点击右上角创建您的第一个项目' : '暂无归档项目')), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    var __VLS_6 = {};
    if (0) {
        const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ prop: ("id"), label: ("ID"), width: ("80"), }));
        const __VLS_9 = __VLS_8({ prop: ("id"), label: ("ID"), width: ("80"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    }
    const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ prop: ("name"), label: ("项目名称"), minWidth: ("200"), }));
    const __VLS_15 = __VLS_14({ prop: ("name"), label: ("项目名称"), minWidth: ("200"), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_18.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.$emit('view', row);
                } }, ...{ class: ("project-name") }, });
        (row.name);
    }
    var __VLS_18;
    if (__VLS_ctx.showGroupColumn) {
        const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ prop: ("groupId"), label: ("所属分组"), width: ("150"), }));
        const __VLS_21 = __VLS_20({ prop: ("groupId"), label: ("所属分组"), width: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_24.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            if (row.groupId > 0) {
                const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
                // @ts-ignore
                const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ type: ("info"), size: ("small"), }));
                const __VLS_27 = __VLS_26({ type: ("info"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_26));
                (__VLS_ctx.getGroupName(row.groupId));
                __VLS_nonNullable(__VLS_30.slots).default;
                var __VLS_30;
            }
            else {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-gray-400") }, });
            }
        }
        var __VLS_24;
    }
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ prop: ("description"), label: ("项目描述"), minWidth: ("300"), }));
    const __VLS_33 = __VLS_32({ prop: ("description"), label: ("项目描述"), minWidth: ("300"), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_36.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("description") }, });
        (row.description || '暂无描述');
    }
    var __VLS_36;
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ prop: ("progress"), label: ("进度"), width: ("120"), }));
    const __VLS_39 = __VLS_38({ prop: ("progress"), label: ("进度"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_42.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
        /** @type { [typeof __VLS_components.ElProgress, ] } */
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ percentage: ((row.progress || 0)), strokeWidth: ((6)), }));
        const __VLS_45 = __VLS_44({ percentage: ((row.progress || 0)), strokeWidth: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    }
    var __VLS_42;
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ prop: ("createdAt"), label: ("创建时间"), width: ("180"), }));
    const __VLS_51 = __VLS_50({ prop: ("createdAt"), label: ("创建时间"), width: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_54.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatDateTime(row.createdAt));
    }
    var __VLS_54;
    const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ label: ("操作"), width: ("260"), fixed: ("right"), }));
    const __VLS_57 = __VLS_56({ label: ("操作"), width: ("260"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_60.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (__VLS_ctx.activeTab === 'active') {
            const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }));
            const __VLS_63 = __VLS_62({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
            let __VLS_67;
            const __VLS_68 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.activeTab === 'active')))
                        return;
                    __VLS_ctx.$emit('view', row);
                }
            };
            let __VLS_64;
            let __VLS_65;
            const __VLS_69 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({ icon: ("ri:dashboard-3-line"), ...{ class: ("mr-1") }, }));
            const __VLS_71 = __VLS_70({ icon: ("ri:dashboard-3-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_70));
            __VLS_nonNullable(__VLS_66.slots).default;
            var __VLS_66;
            const __VLS_75 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({ ...{ 'onClick': {} }, type: ("success"), link: (true), size: ("small"), }));
            const __VLS_77 = __VLS_76({ ...{ 'onClick': {} }, type: ("success"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_76));
            let __VLS_81;
            const __VLS_82 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.activeTab === 'active')))
                        return;
                    __VLS_ctx.$emit('files', row);
                }
            };
            let __VLS_78;
            let __VLS_79;
            const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ icon: ("ri:folder-line"), ...{ class: ("mr-1") }, }));
            const __VLS_85 = __VLS_84({ icon: ("ri:folder-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_84));
            __VLS_nonNullable(__VLS_80.slots).default;
            var __VLS_80;
            const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
            /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ ...{ 'onCommand': {} }, trigger: ("click"), }));
            const __VLS_91 = __VLS_90({ ...{ 'onCommand': {} }, trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            let __VLS_95;
            const __VLS_96 = {
                onCommand: ((cmd) => __VLS_ctx.$emit('command', cmd, row))
            };
            let __VLS_92;
            let __VLS_93;
            const __VLS_97 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({ link: (true), size: ("small"), ...{ class: ("ml-2") }, }));
            const __VLS_99 = __VLS_98({ link: (true), size: ("small"), ...{ class: ("ml-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_98));
            const __VLS_103 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({ icon: ("ri:arrow-down-s-line"), ...{ class: ("el-icon--right") }, }));
            const __VLS_105 = __VLS_104({ icon: ("ri:arrow-down-s-line"), ...{ class: ("el-icon--right") }, }, ...__VLS_functionalComponentArgsRest(__VLS_104));
            __VLS_nonNullable(__VLS_102.slots).default;
            var __VLS_102;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_94.slots);
                const __VLS_109 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
                /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
                // @ts-ignore
                const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({}));
                const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
                const __VLS_115 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({ command: ("move"), }));
                const __VLS_117 = __VLS_116({ command: ("move"), }, ...__VLS_functionalComponentArgsRest(__VLS_116));
                const __VLS_121 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({ icon: ("ri:folder-transfer-line"), ...{ class: ("mr-1") }, }));
                const __VLS_123 = __VLS_122({ icon: ("ri:folder-transfer-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_122));
                __VLS_nonNullable(__VLS_120.slots).default;
                var __VLS_120;
                if (__VLS_ctx.isOwner(row)) {
                    const __VLS_127 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                    /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                    // @ts-ignore
                    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({ command: ("edit"), }));
                    const __VLS_129 = __VLS_128({ command: ("edit"), }, ...__VLS_functionalComponentArgsRest(__VLS_128));
                    const __VLS_133 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({ icon: ("ri:settings-3-line"), ...{ class: ("mr-1") }, }));
                    const __VLS_135 = __VLS_134({ icon: ("ri:settings-3-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_134));
                    __VLS_nonNullable(__VLS_132.slots).default;
                    var __VLS_132;
                    const __VLS_139 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                    /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                    // @ts-ignore
                    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({ command: ("archive"), }));
                    const __VLS_141 = __VLS_140({ command: ("archive"), }, ...__VLS_functionalComponentArgsRest(__VLS_140));
                    const __VLS_145 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({ icon: ("ri:archive-line"), ...{ class: ("mr-1") }, }));
                    const __VLS_147 = __VLS_146({ icon: ("ri:archive-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_146));
                    __VLS_nonNullable(__VLS_144.slots).default;
                    var __VLS_144;
                    const __VLS_151 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                    /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                    // @ts-ignore
                    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({ command: ("delete"), divided: (true), ...{ style: ({}) }, }));
                    const __VLS_153 = __VLS_152({ command: ("delete"), divided: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_152));
                    const __VLS_157 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }));
                    const __VLS_159 = __VLS_158({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_158));
                    __VLS_nonNullable(__VLS_156.slots).default;
                    var __VLS_156;
                }
                else {
                    const __VLS_163 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                    /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                    // @ts-ignore
                    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({ command: ("quit"), divided: (true), ...{ style: ({}) }, }));
                    const __VLS_165 = __VLS_164({ command: ("quit"), divided: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_164));
                    const __VLS_169 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({ icon: ("ri:logout-box-r-line"), ...{ class: ("mr-1") }, }));
                    const __VLS_171 = __VLS_170({ icon: ("ri:logout-box-r-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_170));
                    __VLS_nonNullable(__VLS_168.slots).default;
                    var __VLS_168;
                }
                __VLS_nonNullable(__VLS_114.slots).default;
                var __VLS_114;
            }
            var __VLS_94;
        }
        else {
            const __VLS_175 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }));
            const __VLS_177 = __VLS_176({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_176));
            let __VLS_181;
            const __VLS_182 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.activeTab === 'active'))))
                        return;
                    __VLS_ctx.$emit('view', row);
                }
            };
            let __VLS_178;
            let __VLS_179;
            const __VLS_183 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({ icon: ("ri:dashboard-3-line"), ...{ class: ("mr-1") }, }));
            const __VLS_185 = __VLS_184({ icon: ("ri:dashboard-3-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_184));
            __VLS_nonNullable(__VLS_180.slots).default;
            var __VLS_180;
            const __VLS_189 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({ ...{ 'onClick': {} }, type: ("success"), link: (true), size: ("small"), }));
            const __VLS_191 = __VLS_190({ ...{ 'onClick': {} }, type: ("success"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_190));
            let __VLS_195;
            const __VLS_196 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.activeTab === 'active'))))
                        return;
                    __VLS_ctx.$emit('unarchive', row);
                }
            };
            let __VLS_192;
            let __VLS_193;
            const __VLS_197 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({ icon: ("ri:inbox-unarchive-line"), ...{ class: ("mr-1") }, }));
            const __VLS_199 = __VLS_198({ icon: ("ri:inbox-unarchive-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_198));
            __VLS_nonNullable(__VLS_194.slots).default;
            var __VLS_194;
            const __VLS_203 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({ ...{ 'onClick': {} }, type: ("danger"), link: (true), size: ("small"), }));
            const __VLS_205 = __VLS_204({ ...{ 'onClick': {} }, type: ("danger"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_204));
            let __VLS_209;
            const __VLS_210 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.activeTab === 'active'))))
                        return;
                    __VLS_ctx.$emit('delete', row);
                }
            };
            let __VLS_206;
            let __VLS_207;
            const __VLS_211 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }));
            const __VLS_213 = __VLS_212({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_212));
            __VLS_nonNullable(__VLS_208.slots).default;
            var __VLS_208;
        }
    }
    var __VLS_60;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['project-name'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['description'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['el-icon--right'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
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
            isOwner: isOwner,
            getGroupName: getGroupName,
            formatDateTime: formatDateTime,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ProjectTable.vue.js.map