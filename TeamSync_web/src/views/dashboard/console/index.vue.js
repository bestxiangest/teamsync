/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { List, Folder, ChatDotRound, Select, Star, Bell } from '@element-plus/icons-vue';
import { getWorkbenchData } from '@/api/dashboard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');
defineOptions({ name: 'Console' });
const router = useRouter();
const loading = ref(false);
const dashboardData = ref(null);
const tasksSection = ref(null);
const projectsSection = ref(null);
// 项目ID到任务的映射（用于从动态跳转）
const taskProjectMap = ref(new Map());
// 加载数据
const fetchData = async () => {
    loading.value = true;
    try {
        const data = await getWorkbenchData();
        dashboardData.value = data;
        // 构建任务-项目映射
        if (data?.myTasks) {
            data.myTasks.forEach((task) => {
                taskProjectMap.value.set(task.id, task.projectId);
            });
        }
    }
    catch (error) {
        console.error('获取工作台数据失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 跳转到看板
const goToBoard = (projectId, projectName) => {
    router.push(`/project/board/${projectId}?name=${encodeURIComponent(projectName)}`);
};
// 根据活动获取项目ID
const getProjectIdByActivity = (activity) => {
    return taskProjectMap.value.get(activity.taskId) || 0;
};
// 优先级相关
const getPriorityType = (priority) => {
    switch (priority) {
        case 3:
            return 'danger';
        case 2:
            return 'warning';
        default:
            return 'info';
    }
};
const getPriorityLabel = (priority) => {
    switch (priority) {
        case 3:
            return '紧急';
        case 2:
            return '较高';
        default:
            return '普通';
    }
};
// 时间格式化
const formatDueTime = (dueTime) => {
    if (!dueTime)
        return '未设置';
    return dayjs(dueTime).format('MM-DD HH:mm');
};
const formatActivityTime = (time) => {
    return dayjs(time).fromNow();
};
// 判断是否过期
const isOverdue = (dueTime) => {
    if (!dueTime)
        return false;
    return dayjs(dueTime).isBefore(dayjs());
};
// 表格行样式
const getRowClassName = ({ row }) => {
    if (isOverdue(row.dueTime))
        return 'row-overdue';
    if (row.priority === 3)
        return 'row-urgent';
    return '';
};
// 动态颜色
const getActivityColor = (actionType) => {
    switch (actionType) {
        case 'CREATE':
            return '#67c23a';
        case 'UPDATE':
            return '#409eff';
        case 'MOVE':
            return '#e6a23c';
        case 'COMMENT':
            return '#909399';
        case 'DELETE':
            return '#f56c6c';
        default:
            return '#909399';
    }
};
// 项目头像颜色
const projectColors = [
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9'
];
const getProjectColor = (projectId) => {
    return projectColors[projectId % projectColors.length];
};
// 滚动到指定区域
const scrollToTasks = () => {
    tasksSection.value?.scrollIntoView({ behavior: 'smooth' });
};
const scrollToProjects = () => {
    projectsSection.value?.scrollIntoView({ behavior: 'smooth' });
};
onMounted(() => {
    fetchData();
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
    __VLS_styleScopedClasses['section-card__body'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['section-card'];
    __VLS_styleScopedClasses['task-title'];
    __VLS_styleScopedClasses['project-item'];
    __VLS_styleScopedClasses['activity-item'];
    __VLS_styleScopedClasses['row-overdue'];
    __VLS_styleScopedClasses['row-urgent'];
    __VLS_styleScopedClasses['stats-row'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['project-grid'];
    __VLS_styleScopedClasses['section-card'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("workbench-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ gutter: ((20)), ...{ class: ("stats-row") }, }));
    const __VLS_2 = __VLS_1({ gutter: ((20)), ...{ class: ("stats-row") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ xs: ((12)), sm: ((12)), md: ((6)), }));
    const __VLS_8 = __VLS_7({ xs: ((12)), sm: ((12)), md: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.scrollToTasks) }, ...{ class: ("stat-card stat-card--pending") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__icon") }, });
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ size: ((28)), }));
    const __VLS_14 = __VLS_13({ size: ((28)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.List;
    /** @type { [typeof __VLS_components.List, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__value") }, });
    (__VLS_ctx.dashboardData?.stats?.pendingTaskCount ?? 0);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__label") }, });
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ xs: ((12)), sm: ((12)), md: ((6)), }));
    const __VLS_26 = __VLS_25({ xs: ((12)), sm: ((12)), md: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.scrollToProjects) }, ...{ class: ("stat-card stat-card--projects") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__icon") }, });
    const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ size: ((28)), }));
    const __VLS_32 = __VLS_31({ size: ((28)), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.Folder;
    /** @type { [typeof __VLS_components.Folder, ] } */
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_nonNullable(__VLS_35.slots).default;
    var __VLS_35;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__value") }, });
    (__VLS_ctx.dashboardData?.stats?.projectCount ?? 0);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__label") }, });
    __VLS_nonNullable(__VLS_29.slots).default;
    var __VLS_29;
    const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ xs: ((12)), sm: ((12)), md: ((6)), }));
    const __VLS_44 = __VLS_43({ xs: ((12)), sm: ((12)), md: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card stat-card--comments") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__icon") }, });
    const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ size: ((28)), }));
    const __VLS_50 = __VLS_49({ size: ((28)), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ChatDotRound;
    /** @type { [typeof __VLS_components.ChatDotRound, ] } */
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_nonNullable(__VLS_53.slots).default;
    var __VLS_53;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__value") }, });
    (__VLS_ctx.dashboardData?.stats?.totalCommentCount ?? 0);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__label") }, });
    __VLS_nonNullable(__VLS_47.slots).default;
    var __VLS_47;
    const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ xs: ((12)), sm: ((12)), md: ((6)), }));
    const __VLS_62 = __VLS_61({ xs: ((12)), sm: ((12)), md: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card stat-card--done") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__icon") }, });
    const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ size: ((28)), }));
    const __VLS_68 = __VLS_67({ size: ((28)), }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.Select;
    /** @type { [typeof __VLS_components.Select, ] } */
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_nonNullable(__VLS_71.slots).default;
    var __VLS_71;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__value") }, });
    (__VLS_ctx.dashboardData?.stats?.doneTaskCount ?? 0);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("stat-card__label") }, });
    __VLS_nonNullable(__VLS_65.slots).default;
    var __VLS_65;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ gutter: ((20)), ...{ class: ("main-content") }, }));
    const __VLS_80 = __VLS_79({ gutter: ((20)), ...{ class: ("main-content") }, }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ xs: ((24)), lg: ((16)), }));
    const __VLS_86 = __VLS_85({ xs: ((24)), lg: ((16)), }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("tasksSection"), ...{ class: ("section-card") }, });
    // @ts-ignore navigation for `const tasksSection = ref()`
    __VLS_ctx.tasksSection;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-card__header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("section-card__title") }, });
    const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
    const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.List;
    /** @type { [typeof __VLS_components.List, ] } */
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
    const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_nonNullable(__VLS_95.slots).default;
    var __VLS_95;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    if (__VLS_ctx.dashboardData?.myTasks?.length) {
        const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ type: ("warning"), size: ("small"), }));
        const __VLS_104 = __VLS_103({ type: ("warning"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        (__VLS_ctx.dashboardData?.myTasks?.length);
        __VLS_nonNullable(__VLS_107.slots).default;
        var __VLS_107;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-card__body") }, });
    const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ] } */
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ data: ((__VLS_ctx.dashboardData?.myTasks ?? [])), ...{ style: ({}) }, rowClassName: ((__VLS_ctx.getRowClassName)), emptyText: ("暂无待办任务，休息一下吧 ☕"), }));
    const __VLS_110 = __VLS_109({ data: ((__VLS_ctx.dashboardData?.myTasks ?? [])), ...{ style: ({}) }, rowClassName: ((__VLS_ctx.getRowClassName)), emptyText: ("暂无待办任务，休息一下吧 ☕"), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_114 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({ prop: ("title"), label: ("任务标题"), minWidth: ("200"), }));
    const __VLS_116 = __VLS_115({ prop: ("title"), label: ("任务标题"), minWidth: ("200"), }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_119.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.goToBoard(row.projectId, row.projectName);
                } }, ...{ class: ("task-title") }, });
        (row.title);
    }
    var __VLS_119;
    const __VLS_120 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({ prop: ("projectName"), label: ("所属项目"), minWidth: ("140"), }));
    const __VLS_122 = __VLS_121({ prop: ("projectName"), label: ("所属项目"), minWidth: ("140"), }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_125.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_126 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
        const __VLS_128 = __VLS_127({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        let __VLS_132;
        const __VLS_133 = {
            onClick: (...[$event]) => {
                __VLS_ctx.goToBoard(row.projectId, row.projectName);
            }
        };
        let __VLS_129;
        let __VLS_130;
        (row.projectName);
        __VLS_nonNullable(__VLS_131.slots).default;
        var __VLS_131;
    }
    var __VLS_125;
    const __VLS_134 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({ prop: ("priority"), label: ("优先级"), width: ("100"), align: ("center"), }));
    const __VLS_136 = __VLS_135({ prop: ("priority"), label: ("优先级"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_139.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ type: ((__VLS_ctx.getPriorityType(row.priority))), size: ("small"), effect: ("dark"), }));
        const __VLS_142 = __VLS_141({ type: ((__VLS_ctx.getPriorityType(row.priority))), size: ("small"), effect: ("dark"), }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        (__VLS_ctx.getPriorityLabel(row.priority));
        __VLS_nonNullable(__VLS_145.slots).default;
        var __VLS_145;
    }
    var __VLS_139;
    const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ prop: ("dueTime"), label: ("截止时间"), width: ("160"), align: ("center"), }));
    const __VLS_148 = __VLS_147({ prop: ("dueTime"), label: ("截止时间"), width: ("160"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_151.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: (({ overdue: __VLS_ctx.isOverdue(row.dueTime) })) }, });
        (__VLS_ctx.formatDueTime(row.dueTime));
    }
    var __VLS_151;
    const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ prop: ("stageName"), label: ("当前阶段"), width: ("140"), align: ("center"), }));
    const __VLS_154 = __VLS_153({ prop: ("stageName"), label: ("当前阶段"), width: ("140"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_157.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_158 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
        // @ts-ignore
        const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ size: ("small"), effect: ("plain"), }));
        const __VLS_160 = __VLS_159({ size: ("small"), effect: ("plain"), }, ...__VLS_functionalComponentArgsRest(__VLS_159));
        (row.stageName);
        __VLS_nonNullable(__VLS_163.slots).default;
        var __VLS_163;
    }
    var __VLS_157;
    __VLS_nonNullable(__VLS_113.slots).default;
    var __VLS_113;
    __VLS_nonNullable(__VLS_89.slots).default;
    var __VLS_89;
    const __VLS_164 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({ xs: ((24)), lg: ((8)), }));
    const __VLS_166 = __VLS_165({ xs: ((24)), lg: ((8)), }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("projectsSection"), ...{ class: ("section-card section-card--compact") }, });
    // @ts-ignore navigation for `const projectsSection = ref()`
    __VLS_ctx.projectsSection;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-card__header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("section-card__title") }, });
    const __VLS_170 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({}));
    const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
    const __VLS_176 = __VLS_resolvedLocalAndGlobalComponents.Folder;
    /** @type { [typeof __VLS_components.Folder, ] } */
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
    const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_nonNullable(__VLS_175.slots).default;
    var __VLS_175;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-card__body") }, });
    if (__VLS_ctx.dashboardData?.projects?.length) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-grid") }, });
        for (const [project] of __VLS_getVForSourceType((__VLS_ctx.dashboardData?.projects))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.dashboardData?.projects?.length)))
                            return;
                        __VLS_ctx.goToBoard(project.id, project.name);
                    } }, key: ((project.id)), ...{ class: ("project-item") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-item__avatar") }, ...{ style: (({ background: __VLS_ctx.getProjectColor(project.id) })) }, });
            (project.name?.charAt(0));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-item__info") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("project-item__name") }, });
            (project.name);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("project-item__role") }, });
            if (project.role === 'admin') {
                const __VLS_182 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
                // @ts-ignore
                const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({ size: ((12)), }));
                const __VLS_184 = __VLS_183({ size: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
                const __VLS_188 = __VLS_resolvedLocalAndGlobalComponents.Star;
                /** @type { [typeof __VLS_components.Star, ] } */
                // @ts-ignore
                const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
                const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
                __VLS_nonNullable(__VLS_187.slots).default;
                var __VLS_187;
            }
            (project.role === 'admin' ? '管理员' : '成员');
        }
    }
    else {
        const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElEmpty;
        /** @type { [typeof __VLS_components.ElEmpty, ] } */
        // @ts-ignore
        const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ description: ("暂无项目"), imageSize: ((60)), }));
        const __VLS_196 = __VLS_195({ description: ("暂无项目"), imageSize: ((60)), }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-card section-card--activities") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-card__header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("section-card__title") }, });
    const __VLS_200 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({}));
    const __VLS_202 = __VLS_201({}, ...__VLS_functionalComponentArgsRest(__VLS_201));
    const __VLS_206 = __VLS_resolvedLocalAndGlobalComponents.Bell;
    /** @type { [typeof __VLS_components.Bell, ] } */
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({}));
    const __VLS_208 = __VLS_207({}, ...__VLS_functionalComponentArgsRest(__VLS_207));
    __VLS_nonNullable(__VLS_205.slots).default;
    var __VLS_205;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-card__body activities-body") }, });
    if (__VLS_ctx.dashboardData?.activities?.length) {
        const __VLS_212 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
        // @ts-ignore
        const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({ height: ("320px"), }));
        const __VLS_214 = __VLS_213({ height: ("320px"), }, ...__VLS_functionalComponentArgsRest(__VLS_213));
        const __VLS_218 = __VLS_resolvedLocalAndGlobalComponents.ElTimeline;
        /** @type { [typeof __VLS_components.ElTimeline, typeof __VLS_components.ElTimeline, ] } */
        // @ts-ignore
        const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({}));
        const __VLS_220 = __VLS_219({}, ...__VLS_functionalComponentArgsRest(__VLS_219));
        for (const [activity] of __VLS_getVForSourceType((__VLS_ctx.dashboardData?.activities))) {
            const __VLS_224 = __VLS_resolvedLocalAndGlobalComponents.ElTimelineItem;
            /** @type { [typeof __VLS_components.ElTimelineItem, typeof __VLS_components.ElTimelineItem, ] } */
            // @ts-ignore
            const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({ key: ((activity.id)), timestamp: ((__VLS_ctx.formatActivityTime(activity.createdAt))), placement: ("top"), color: ((__VLS_ctx.getActivityColor(activity.actionType))), }));
            const __VLS_226 = __VLS_225({ key: ((activity.id)), timestamp: ((__VLS_ctx.formatActivityTime(activity.createdAt))), placement: ("top"), color: ((__VLS_ctx.getActivityColor(activity.actionType))), }, ...__VLS_functionalComponentArgsRest(__VLS_225));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-item") }, });
            const __VLS_230 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
            /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
            // @ts-ignore
            const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({ size: ((28)), src: ((activity.operatorAvatar)), }));
            const __VLS_232 = __VLS_231({ size: ((28)), src: ((activity.operatorAvatar)), }, ...__VLS_functionalComponentArgsRest(__VLS_231));
            (activity.operatorName?.charAt(0));
            __VLS_nonNullable(__VLS_235.slots).default;
            var __VLS_235;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-item__content") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("activity-item__user") }, });
            (activity.operatorName);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("activity-item__action") }, });
            (activity.detail);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.dashboardData?.activities?.length)))
                            return;
                        __VLS_ctx.goToBoard(__VLS_ctx.getProjectIdByActivity(activity), activity.projectName);
                    } }, ...{ class: ("activity-item__task") }, });
            (activity.taskTitle);
            __VLS_nonNullable(__VLS_229.slots).default;
            var __VLS_229;
        }
        __VLS_nonNullable(__VLS_223.slots).default;
        var __VLS_223;
        __VLS_nonNullable(__VLS_217.slots).default;
        var __VLS_217;
    }
    else {
        const __VLS_236 = __VLS_resolvedLocalAndGlobalComponents.ElEmpty;
        /** @type { [typeof __VLS_components.ElEmpty, ] } */
        // @ts-ignore
        const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({ description: ("暂无动态"), imageSize: ((60)), }));
        const __VLS_238 = __VLS_237({ description: ("暂无动态"), imageSize: ((60)), }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    }
    __VLS_nonNullable(__VLS_169.slots).default;
    var __VLS_169;
    __VLS_nonNullable(__VLS_83.slots).default;
    var __VLS_83;
    __VLS_styleScopedClasses['workbench-container'];
    __VLS_styleScopedClasses['stats-row'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['stat-card--pending'];
    __VLS_styleScopedClasses['stat-card__icon'];
    __VLS_styleScopedClasses['stat-card__content'];
    __VLS_styleScopedClasses['stat-card__value'];
    __VLS_styleScopedClasses['stat-card__label'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['stat-card--projects'];
    __VLS_styleScopedClasses['stat-card__icon'];
    __VLS_styleScopedClasses['stat-card__content'];
    __VLS_styleScopedClasses['stat-card__value'];
    __VLS_styleScopedClasses['stat-card__label'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['stat-card--comments'];
    __VLS_styleScopedClasses['stat-card__icon'];
    __VLS_styleScopedClasses['stat-card__content'];
    __VLS_styleScopedClasses['stat-card__value'];
    __VLS_styleScopedClasses['stat-card__label'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['stat-card--done'];
    __VLS_styleScopedClasses['stat-card__icon'];
    __VLS_styleScopedClasses['stat-card__content'];
    __VLS_styleScopedClasses['stat-card__value'];
    __VLS_styleScopedClasses['stat-card__label'];
    __VLS_styleScopedClasses['main-content'];
    __VLS_styleScopedClasses['section-card'];
    __VLS_styleScopedClasses['section-card__header'];
    __VLS_styleScopedClasses['section-card__title'];
    __VLS_styleScopedClasses['section-card__body'];
    __VLS_styleScopedClasses['task-title'];
    __VLS_styleScopedClasses['overdue'];
    __VLS_styleScopedClasses['section-card'];
    __VLS_styleScopedClasses['section-card--compact'];
    __VLS_styleScopedClasses['section-card__header'];
    __VLS_styleScopedClasses['section-card__title'];
    __VLS_styleScopedClasses['section-card__body'];
    __VLS_styleScopedClasses['project-grid'];
    __VLS_styleScopedClasses['project-item'];
    __VLS_styleScopedClasses['project-item__avatar'];
    __VLS_styleScopedClasses['project-item__info'];
    __VLS_styleScopedClasses['project-item__name'];
    __VLS_styleScopedClasses['project-item__role'];
    __VLS_styleScopedClasses['section-card'];
    __VLS_styleScopedClasses['section-card--activities'];
    __VLS_styleScopedClasses['section-card__header'];
    __VLS_styleScopedClasses['section-card__title'];
    __VLS_styleScopedClasses['section-card__body'];
    __VLS_styleScopedClasses['activities-body'];
    __VLS_styleScopedClasses['activity-item'];
    __VLS_styleScopedClasses['activity-item__content'];
    __VLS_styleScopedClasses['activity-item__user'];
    __VLS_styleScopedClasses['activity-item__action'];
    __VLS_styleScopedClasses['activity-item__task'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "tasksSection": __VLS_nativeElements['div'],
        "projectsSection": __VLS_nativeElements['div'],
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
            List: List,
            Folder: Folder,
            ChatDotRound: ChatDotRound,
            Select: Select,
            Star: Star,
            Bell: Bell,
            loading: loading,
            dashboardData: dashboardData,
            tasksSection: tasksSection,
            projectsSection: projectsSection,
            goToBoard: goToBoard,
            getProjectIdByActivity: getProjectIdByActivity,
            getPriorityType: getPriorityType,
            getPriorityLabel: getPriorityLabel,
            formatDueTime: formatDueTime,
            formatActivityTime: formatActivityTime,
            isOverdue: isOverdue,
            getRowClassName: getRowClassName,
            getActivityColor: getActivityColor,
            getProjectColor: getProjectColor,
            scrollToTasks: scrollToTasks,
            scrollToProjects: scrollToProjects,
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