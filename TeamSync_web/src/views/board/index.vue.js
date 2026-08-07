/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Edit, MoreFilled } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import { getBoardList, moveTask, updateTask, createStage, updateStage, deleteStage } from '@/api/board';
import { getProject, updateProjectProgress } from '@/api/project';
import { useBoardSocket } from '@/hooks/useBoardSocket';
import { useUserStore } from '@/store/modules/user';
import { getProjectMembers } from '@/api/member';
import { getSubTasks } from '@/api/subtask';
import MemberDialog from './components/MemberDialog.vue';
import TaskDetailDialog from './components/TaskDetailDialog.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'KanbanBoard' });
const userStore = useUserStore();
// 成员相关
const members = ref([]);
const memberDialogVisible = ref(false);
const route = useRoute();
const router = useRouter();
// 项目信息
const projectId = ref(0);
const projectName = ref('项目看板');
// 看板数据
const stages = ref([]);
const loading = ref(false);
// 看板滚动容器引用
const boardContainerRef = ref(null);
// 项目进度相关
const projectProgress = ref(0);
const tempProgress = ref(0);
const progressPopoverVisible = ref(false);
const savingProgress = ref(false);
// 进度条颜色（根据进度值动态变化）
const progressColor = computed(() => {
    if (projectProgress.value < 30)
        return '#f56c6c';
    if (projectProgress.value < 70)
        return '#e6a23c';
    return '#67c23a';
});
// 监听 popover 打开时同步临时进度值
watch(progressPopoverVisible, (visible) => {
    if (visible) {
        tempProgress.value = projectProgress.value;
    }
});
// 任务弹窗引用
const taskDialogRef = ref();
// 子任务数据缓存（taskId -> SubTask[]）
const taskSubTasksCache = ref(new Map());
const taskSubTasksLoading = ref(new Set());
// ==================== Stage 管理相关 ====================
// 新建列相关
const isAddingStage = ref(false);
const newStageName = ref('');
const addingStage = ref(false);
const newStageInputRef = ref();
// 编辑列名相关
const editingStageName = ref('');
const stageInputRefs = ref(new Map());
/**
 * 设置 stage input 的 ref
 */
const setStageInputRef = (el, stageId) => {
    if (el) {
        stageInputRefs.value.set(stageId, el);
    }
};
/**
 * 开始添加新列
 */
const startAddStage = () => {
    isAddingStage.value = true;
    newStageName.value = '';
    nextTick(() => {
        newStageInputRef.value?.focus();
    });
};
/**
 * 取消添加新列
 */
const cancelAddStage = () => {
    isAddingStage.value = false;
    newStageName.value = '';
};
/**
 * 确认添加新列
 */
const confirmAddStage = async () => {
    const name = newStageName.value.trim();
    if (!name) {
        ElMessage.warning('请输入列表名称');
        return;
    }
    addingStage.value = true;
    try {
        await createStage({ projectId: projectId.value, name });
        ElMessage.success('列表创建成功');
        cancelAddStage();
        fetchBoard(); // 刷新看板
    }
    catch (error) {
        console.error('创建列表失败:', error);
        ElMessage.error('创建列表失败');
    }
    finally {
        addingStage.value = false;
    }
};
/**
 * 启用 Stage 编辑模式
 */
const enableEditStage = (stage) => {
    // 先关闭其他正在编辑的
    stages.value.forEach((s) => (s.isEditing = false));
    stage.isEditing = true;
    editingStageName.value = stage.name;
    nextTick(() => {
        const input = stageInputRefs.value.get(stage.id);
        input?.focus();
        input?.select();
    });
};
/**
 * 取消编辑 Stage
 */
const cancelEditStage = (stage) => {
    stage.isEditing = false;
    editingStageName.value = '';
};
/**
 * 保存 Stage 名称
 */
const saveStageName = async (stage) => {
    const newName = editingStageName.value.trim();
    // 如果名称没变或为空，取消编辑
    if (!newName || newName === stage.name) {
        cancelEditStage(stage);
        return;
    }
    try {
        await updateStage(stage.id, { name: newName });
        stage.name = newName;
        ElMessage.success('列表名称已更新');
    }
    catch (error) {
        console.error('更新列表名称失败:', error);
        ElMessage.error('更新列表名称失败');
    }
    finally {
        cancelEditStage(stage);
    }
};
/**
 * 处理 Stage 下拉菜单命令
 */
const handleStageCommand = (command, stage) => {
    switch (command) {
        case 'rename':
            enableEditStage(stage);
            break;
        case 'delete':
            handleDeleteStage(stage);
            break;
    }
};
/**
 * 删除 Stage
 */
const handleDeleteStage = async (stage) => {
    // 检查是否有任务
    if (stage.tasks && stage.tasks.length > 0) {
        ElMessage.warning(`该列下还有 ${stage.tasks.length} 个任务，请先移动或删除任务`);
        return;
    }
    try {
        await ElMessageBox.confirm(`确定删除列表「${stage.name}」吗？此操作不可撤销。`, '删除确认', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await deleteStage(stage.id);
        ElMessage.success('列表已删除');
        fetchBoard(); // 刷新看板
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('删除列表失败:', error);
            ElMessage.error('删除列表失败');
        }
    }
};
/**
 * 获取看板数据
 */
const fetchBoard = async () => {
    if (!projectId.value)
        return;
    loading.value = true;
    try {
        const data = await getBoardList(projectId.value);
        stages.value = data || [];
        // 数据加载完成后，强制滚动到最左侧（移动端适配）
        await nextTick();
        if (boardContainerRef.value) {
            boardContainerRef.value.scrollTo({ left: 0, behavior: 'auto' });
            boardContainerRef.value.scrollLeft = 0; // 双重保险
        }
        // 获取所有任务的子任务数据
        await fetchAllTasksSubTasks();
    }
    catch (error) {
        console.error('获取看板数据失败:', error);
        ElMessage.error('获取看板数据失败');
    }
    finally {
        loading.value = false;
    }
};
/**
 * 获取所有任务的子任务数据
 */
const fetchAllTasksSubTasks = async () => {
    const allTaskIds = [];
    stages.value.forEach((stage) => {
        stage.tasks.forEach((task) => {
            allTaskIds.push(task.id);
        });
    });
    // 并发获取所有任务的子任务数据
    const promises = allTaskIds.map((taskId) => fetchTaskSubTasks(taskId));
    await Promise.all(promises);
};
/**
 * 获取单个任务的子任务数据
 */
const fetchTaskSubTasks = async (taskId) => {
    // 如果已经在加载或已缓存，跳过
    if (taskSubTasksLoading.value.has(taskId) || taskSubTasksCache.value.has(taskId)) {
        return;
    }
    taskSubTasksLoading.value.add(taskId);
    try {
        const data = await getSubTasks(taskId);
        taskSubTasksCache.value.set(taskId, data || []);
    }
    catch (error) {
        console.error(`获取任务 ${taskId} 的子任务失败:`, error);
        // 即使失败也设置空数组，避免重复请求
        taskSubTasksCache.value.set(taskId, []);
    }
    finally {
        taskSubTasksLoading.value.delete(taskId);
    }
};
/**
 * 获取任务的子任务进度
 */
const getTaskSubTaskProgress = (taskId) => {
    const subTasks = taskSubTasksCache.value.get(taskId) || [];
    const total = subTasks.length;
    const completed = subTasks.filter((s) => s.status === 1).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
        total,
        completed,
        percentage
    };
};
/**
 * 获取项目成员
 */
const fetchMembers = async () => {
    if (!projectId.value)
        return;
    try {
        const data = await getProjectMembers(projectId.value);
        members.value = data || [];
    }
    catch (error) {
        console.error('获取成员列表失败:', error);
    }
};
/**
 * 获取项目详情（包含进度）
 */
const fetchProjectInfo = async () => {
    if (!projectId.value)
        return;
    try {
        const data = await getProject(projectId.value);
        if (data) {
            projectProgress.value = data.progress ?? 0;
        }
    }
    catch (error) {
        console.error('获取项目信息失败:', error);
    }
};
/**
 * 保存项目进度
 */
const saveProgress = async () => {
    savingProgress.value = true;
    try {
        await updateProjectProgress(projectId.value, tempProgress.value);
        projectProgress.value = tempProgress.value;
        progressPopoverVisible.value = false;
        ElMessage.success('进度已更新');
    }
    catch (error) {
        console.error('保存进度失败:', error);
        ElMessage.error('保存进度失败');
    }
    finally {
        savingProgress.value = false;
    }
};
/**
 * 刷新看板
 */
const refreshBoard = () => {
    fetchBoard();
};
/**
 * 返回项目列表
 */
const goBack = () => {
    router.push('/project/list');
};
/**
 * 跳转到项目文档
 */
const goToFiles = () => {
    router.push({
        name: 'ProjectFiles',
        params: { projectId: projectId.value },
        query: { name: projectName.value }
    });
};
/**
 * 处理拖拽变化
 */
const handleChange = async (evt, stage) => {
    const { added, moved } = evt;
    if (added) {
        const task = added.element;
        const newIndex = added.newIndex;
        await handleMoveTask(task.id, stage.id, newIndex);
    }
    else if (moved) {
        const task = moved.element;
        const newIndex = moved.newIndex;
        await handleMoveTask(task.id, stage.id, newIndex);
    }
};
/**
 * 调用移动任务 API
 */
const handleMoveTask = async (taskId, targetStageId, newSort) => {
    try {
        await moveTask(taskId, { targetStageId, newSort });
    }
    catch (error) {
        console.error('移动任务失败:', error);
        ElMessage.error('移动任务失败，请刷新重试');
        fetchBoard();
    }
};
/**
 * 打开新建任务弹窗
 */
const openCreateDialog = (stageId) => {
    taskDialogRef.value?.openCreate(stageId);
};
/**
 * 打开编辑任务弹窗
 */
const openEditDialog = (task) => {
    taskDialogRef.value?.openEdit(task);
    // 刷新该任务的子任务数据
    fetchTaskSubTasks(task.id);
};
/**
 * 监听任务弹窗的成功事件，刷新子任务数据
 */
const handleTaskDialogSuccess = () => {
    fetchBoard(); // 这会自动调用 fetchAllTasksSubTasks
};
/**
 * 监听子任务更新事件，实时更新对应任务的子任务缓存
 */
const handleSubTaskUpdated = async (taskId) => {
    // 清除缓存和加载状态，强制重新获取
    taskSubTasksCache.value.delete(taskId);
    taskSubTasksLoading.value.delete(taskId);
    // 重新获取该任务的子任务数据
    await fetchTaskSubTasks(taskId);
};
/**
 * 切换任务状态
 */
const handleChangeStatus = async (task, newStatus) => {
    const taskId = task.id;
    try {
        await updateTask(taskId, { status: newStatus });
        // 在 stages 中找到并更新对应的任务（确保响应式更新）
        // 使用 Vue 的响应式方式更新数组中的对象
        for (let i = 0; i < stages.value.length; i++) {
            const stage = stages.value[i];
            const taskIndex = stage.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
                // 直接修改数组中的对象属性
                stages.value[i].tasks[taskIndex].status = newStatus;
                break;
            }
        }
        const statusText = newStatus === 0 ? '未开始' : newStatus === 1 ? '已完成' : '处理中';
        ElMessage.success(`任务状态已更新为：${statusText}`);
    }
    catch (error) {
        console.error('更新任务状态失败:', error);
        ElMessage.error('更新状态失败');
    }
};
/**
 * 获取优先级样式类
 */
const getPriorityClass = (priority) => {
    switch (priority) {
        case 3:
            return 'priority-critical';
        case 2:
            return 'priority-high';
        default:
            return 'priority-normal';
    }
};
/**
 * 获取状态样式类
 */
const getStatusClass = (status) => {
    switch (status) {
        case 0:
            return 'status-pending';
        case 2:
            return 'status-progress';
        case 1:
            return 'status-completed';
        default:
            return 'status-pending';
    }
};
/**
 * 格式化截止时间
 */
const formatDueTime = (dateStr) => {
    if (!dateStr)
        return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)
        return `已逾期 ${Math.abs(diffDays)} 天`;
    if (diffDays === 0)
        return '今天到期';
    if (diffDays === 1)
        return '明天到期';
    if (diffDays <= 7)
        return `${diffDays} 天后到期`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};
/**
 * 判断是否逾期
 */
const isOverdue = (dateStr) => {
    if (!dateStr)
        return false;
    return new Date(dateStr) < new Date();
};
/**
 * 截断文本
 */
const truncateText = (text, maxLength) => {
    if (!text)
        return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
/**
 * WebSocket 消息处理
 */
const handleSocketMessage = (message) => {
    console.log('[Kanban] 收到实时更新:', message.action);
    // 如果是自己的操作，不需要刷新（因为已经在操作后刷新了）
    // 可以通过 userId 判断，但为了简化，这里统一刷新
    // 也可以根据 action 类型做更精细的更新
    // 显示提示（可选）
    if (message.userId && message.userId !== userStore.info?.userId) {
        const actionText = {
            TASK_CREATED: '创建了新任务',
            TASK_UPDATED: '更新了任务',
            TASK_DELETED: '删除了任务',
            TASK_MOVED: '移动了任务'
        };
        const text = actionText[message.action] || '更新了看板';
        ElMessage.info({
            message: `${message.username || '其他用户'} ${text}`,
            duration: 2000
        });
    }
    // 刷新看板数据
    fetchBoard();
};
// WebSocket 连接（传递响应式引用，hook 会监听变化自动连接）
const { connected: wsConnected } = useBoardSocket(projectId, handleSocketMessage);
// 初始化
onMounted(() => {
    projectId.value = Number(route.params.projectId) || 1;
    projectName.value = route.query.name || '项目看板';
    fetchBoard();
    fetchMembers();
    fetchProjectInfo();
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
    __VLS_styleScopedClasses['stage-more-btn'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['priority-normal'];
    __VLS_styleScopedClasses['priority-high'];
    __VLS_styleScopedClasses['priority-critical'];
    __VLS_styleScopedClasses['task-title'];
    __VLS_styleScopedClasses['priority-bar'];
    __VLS_styleScopedClasses['priority-normal'];
    __VLS_styleScopedClasses['priority-high'];
    __VLS_styleScopedClasses['priority-critical'];
    __VLS_styleScopedClasses['task-title'];
    __VLS_styleScopedClasses['task-desc'];
    __VLS_styleScopedClasses['el-avatar'];
    __VLS_styleScopedClasses['priority-normal'];
    __VLS_styleScopedClasses['priority-high'];
    __VLS_styleScopedClasses['priority-critical'];
    __VLS_styleScopedClasses['el-input__wrapper'];
    __VLS_styleScopedClasses['el-progress-bar__outer'];
    __VLS_styleScopedClasses['el-progress-bar__inner'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['kanban-page'];
    __VLS_styleScopedClasses['kanban-header'];
    __VLS_styleScopedClasses['header-top'];
    __VLS_styleScopedClasses['header-left'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['header-right'];
    __VLS_styleScopedClasses['ws-status'];
    __VLS_styleScopedClasses['member-avatars'];
    __VLS_styleScopedClasses['el-avatar'];
    __VLS_styleScopedClasses['member-label'];
    __VLS_styleScopedClasses['header-progress'];
    __VLS_styleScopedClasses['progress-info'];
    __VLS_styleScopedClasses['progress-label'];
    __VLS_styleScopedClasses['progress-value'];
    __VLS_styleScopedClasses['kanban-container'];
    __VLS_styleScopedClasses['kanban-scroll'];
    __VLS_styleScopedClasses['stage-column'];
    __VLS_styleScopedClasses['stage-header'];
    __VLS_styleScopedClasses['stage-name'];
    __VLS_styleScopedClasses['stage-header-right'];
    __VLS_styleScopedClasses['task-count'];
    __VLS_styleScopedClasses['stage-more-btn'];
    __VLS_styleScopedClasses['task-list'];
    __VLS_styleScopedClasses['task-card'];
    __VLS_styleScopedClasses['task-content'];
    __VLS_styleScopedClasses['task-title-row'];
    __VLS_styleScopedClasses['task-title'];
    __VLS_styleScopedClasses['task-desc'];
    __VLS_styleScopedClasses['task-footer'];
    __VLS_styleScopedClasses['due-time'];
    __VLS_styleScopedClasses['creator'];
    __VLS_styleScopedClasses['el-avatar'];
    __VLS_styleScopedClasses['empty-stage'];
    __VLS_styleScopedClasses['add-task-btn'];
    __VLS_styleScopedClasses['add-stage-column'];
    __VLS_styleScopedClasses['add-stage-btn'];
    __VLS_styleScopedClasses['add-stage-form'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("kanban-page") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("kanban-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-top") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-left") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.ArrowLeft)), circle: (true), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.ArrowLeft)), circle: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.goBack)
    };
    let __VLS_3;
    let __VLS_4;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("title") }, });
    (__VLS_ctx.projectName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-right") }, });
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onClick': {} }, type: ("success"), }));
    const __VLS_10 = __VLS_9({ ...{ 'onClick': {} }, type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.goToFiles)
    };
    let __VLS_11;
    let __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_13.slots);
        const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ icon: ("ri:folder-line"), }));
        const __VLS_18 = __VLS_17({ icon: ("ri:folder-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    }
    var __VLS_13;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.memberDialogVisible = true;
            } }, ...{ class: ("member-avatars") }, });
    for (const [member, index] of __VLS_getVForSourceType((__VLS_ctx.members.slice(0, 4)))) {
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
        /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ key: ((member.userId)), size: ((32)), src: ((member.avatar)), ...{ style: (({ marginLeft: index > 0 ? '-8px' : '0', zIndex: 10 - index })) }, }));
        const __VLS_24 = __VLS_23({ key: ((member.userId)), size: ((32)), src: ((member.avatar)), ...{ style: (({ marginLeft: index > 0 ? '-8px' : '0', zIndex: 10 - index })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        (member.nickname?.charAt(0) || member.username?.charAt(0));
        __VLS_nonNullable(__VLS_27.slots).default;
        var __VLS_27;
    }
    if (__VLS_ctx.members.length > 4) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("more-count") }, });
        (__VLS_ctx.members.length - 4);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("member-label") }, });
    (__VLS_ctx.members.length);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ws-status") }, ...{ class: (({ connected: __VLS_ctx.wsConnected })) }, });
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ icon: ((__VLS_ctx.wsConnected ? 'ri:wifi-line' : 'ri:wifi-off-line')), }));
    const __VLS_30 = __VLS_29({ icon: ((__VLS_ctx.wsConnected ? 'ri:wifi-line' : 'ri:wifi-off-line')), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    (__VLS_ctx.wsConnected ? '实时同步' : '离线');
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_36 = __VLS_35({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    let __VLS_40;
    const __VLS_41 = {
        onClick: (__VLS_ctx.refreshBoard)
    };
    let __VLS_37;
    let __VLS_38;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_39.slots);
        const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ icon: ("ri:refresh-line"), }));
        const __VLS_44 = __VLS_43({ icon: ("ri:refresh-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    }
    var __VLS_39;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-progress") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("progress-info") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("progress-label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("progress-value") }, });
    (__VLS_ctx.projectProgress);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("progress-bar-wrapper") }, });
    const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
    /** @type { [typeof __VLS_components.ElProgress, ] } */
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ percentage: ((__VLS_ctx.projectProgress)), strokeWidth: ((10)), showText: ((false)), color: ((__VLS_ctx.progressColor)), }));
    const __VLS_50 = __VLS_49({ percentage: ((__VLS_ctx.projectProgress)), strokeWidth: ((10)), showText: ((false)), color: ((__VLS_ctx.progressColor)), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
    /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ placement: ("bottom"), width: ((280)), trigger: ("click"), visible: ((__VLS_ctx.progressPopoverVisible)), }));
    const __VLS_56 = __VLS_55({ placement: ("bottom"), width: ((280)), trigger: ("click"), visible: ((__VLS_ctx.progressPopoverVisible)), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_59.slots);
        const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ icon: ((__VLS_ctx.Edit)), size: ("small"), circle: (true), ...{ class: ("progress-edit-btn") }, }));
        const __VLS_62 = __VLS_61({ icon: ((__VLS_ctx.Edit)), size: ("small"), circle: (true), ...{ class: ("progress-edit-btn") }, }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("progress-popover") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("popover-title") }, });
    const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElSlider;
    /** @type { [typeof __VLS_components.ElSlider, ] } */
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ modelValue: ((__VLS_ctx.tempProgress)), min: ((0)), max: ((100)), step: ((5)), showInput: (true), showInputControls: ((false)), }));
    const __VLS_68 = __VLS_67({ modelValue: ((__VLS_ctx.tempProgress)), min: ((0)), max: ((100)), step: ((5)), showInput: (true), showInputControls: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("popover-actions") }, });
    const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ ...{ 'onClick': {} }, size: ("small"), }));
    const __VLS_74 = __VLS_73({ ...{ 'onClick': {} }, size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            __VLS_ctx.progressPopoverVisible = false;
        }
    };
    let __VLS_75;
    let __VLS_76;
    __VLS_nonNullable(__VLS_77.slots).default;
    var __VLS_77;
    const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.savingProgress)), }));
    const __VLS_82 = __VLS_81({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.savingProgress)), }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_86;
    const __VLS_87 = {
        onClick: (__VLS_ctx.saveProgress)
    };
    let __VLS_83;
    let __VLS_84;
    __VLS_nonNullable(__VLS_85.slots).default;
    var __VLS_85;
    var __VLS_59;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("kanban-container") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("kanban-scroll") }, ref: ("boardContainerRef"), });
    // @ts-ignore navigation for `const boardContainerRef = ref()`
    __VLS_ctx.boardContainerRef;
    for (const [stage] of __VLS_getVForSourceType((__VLS_ctx.stages))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((stage.id)), ...{ class: ("stage-column") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stage-header") }, });
        if (stage.isEditing) {
            const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
            /** @type { [typeof __VLS_components.ElInput, ] } */
            // @ts-ignore
            const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ ...{ 'onBlur': {} }, ...{ 'onKeyup': {} }, ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.editingStageName)), size: ("small"), ...{ class: ("stage-name-input") }, ref: (((el) => __VLS_ctx.setStageInputRef(el, stage.id))), }));
            const __VLS_90 = __VLS_89({ ...{ 'onBlur': {} }, ...{ 'onKeyup': {} }, ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.editingStageName)), size: ("small"), ...{ class: ("stage-name-input") }, ref: (((el) => __VLS_ctx.setStageInputRef(el, stage.id))), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
            let __VLS_94;
            const __VLS_95 = {
                onBlur: (...[$event]) => {
                    if (!((stage.isEditing)))
                        return;
                    __VLS_ctx.saveStageName(stage);
                }
            };
            const __VLS_96 = {
                onKeyup: (...[$event]) => {
                    if (!((stage.isEditing)))
                        return;
                    __VLS_ctx.saveStageName(stage);
                }
            };
            const __VLS_97 = {
                onKeyup: (...[$event]) => {
                    if (!((stage.isEditing)))
                        return;
                    __VLS_ctx.cancelEditStage(stage);
                }
            };
            let __VLS_91;
            let __VLS_92;
            var __VLS_93;
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ onDblclick: (...[$event]) => {
                        if (!(!((stage.isEditing))))
                            return;
                        __VLS_ctx.enableEditStage(stage);
                    } }, ...{ class: ("stage-name") }, title: ("双击编辑"), });
            (stage.name);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stage-header-right") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("task-count") }, });
        (stage.tasks.length);
        const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ ...{ 'onCommand': {} }, trigger: ("click"), }));
        const __VLS_100 = __VLS_99({ ...{ 'onCommand': {} }, trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        let __VLS_104;
        const __VLS_105 = {
            onCommand: ((cmd) => __VLS_ctx.handleStageCommand(cmd, stage))
        };
        let __VLS_101;
        let __VLS_102;
        const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ icon: ((__VLS_ctx.MoreFilled)), size: ("small"), circle: (true), ...{ class: ("stage-more-btn") }, }));
        const __VLS_108 = __VLS_107({ icon: ((__VLS_ctx.MoreFilled)), size: ("small"), circle: (true), ...{ class: ("stage-more-btn") }, }, ...__VLS_functionalComponentArgsRest(__VLS_107));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_103.slots);
            const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
            const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
            const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
            // @ts-ignore
            const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ command: ("rename"), }));
            const __VLS_120 = __VLS_119({ command: ("rename"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
            const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ icon: ("ri:edit-line"), ...{ class: ("mr-1") }, }));
            const __VLS_126 = __VLS_125({ icon: ("ri:edit-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            __VLS_nonNullable(__VLS_123.slots).default;
            var __VLS_123;
            const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
            // @ts-ignore
            const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ command: ("delete"), divided: (true), }));
            const __VLS_132 = __VLS_131({ command: ("delete"), divided: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ style: ({}) }, });
            const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }));
            const __VLS_138 = __VLS_137({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_137));
            __VLS_nonNullable(__VLS_135.slots).default;
            var __VLS_135;
            __VLS_nonNullable(__VLS_117.slots).default;
            var __VLS_117;
        }
        var __VLS_103;
        const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.draggable;
        /** @type { [typeof __VLS_components.Draggable, typeof __VLS_components.draggable, typeof __VLS_components.Draggable, typeof __VLS_components.draggable, ] } */
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ ...{ 'onChange': {} }, modelValue: ((stage.tasks)), group: ("task-group"), itemKey: ("id"), ...{ class: ("task-list") }, ghostClass: ("ghost-card"), dragClass: ("dragging-card"), animation: ((200)), }));
        const __VLS_144 = __VLS_143({ ...{ 'onChange': {} }, modelValue: ((stage.tasks)), group: ("task-group"), itemKey: ("id"), ...{ class: ("task-list") }, ghostClass: ("ghost-card"), dragClass: ("dragging-card"), animation: ((200)), }, ...__VLS_functionalComponentArgsRest(__VLS_143));
        let __VLS_148;
        const __VLS_149 = {
            onChange: ((evt) => __VLS_ctx.handleChange(evt, stage))
        };
        let __VLS_145;
        let __VLS_146;
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { item: __VLS_thisSlot } = __VLS_nonNullable(__VLS_147.slots);
            const { element: task } = __VLS_getSlotParam(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        __VLS_ctx.openEditDialog(task);
                    } }, ...{ class: ("task-card") }, ...{ class: (({
                        'status-pending': task.status === 0,
                        'status-progress': task.status === 2,
                        'status-completed': task.status === 1,
                        [__VLS_ctx.getPriorityClass(task.priority)]: true
                    })) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("priority-bar") }, ...{ class: ((__VLS_ctx.getPriorityClass(task.priority))) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("status-bar") }, ...{ class: ((__VLS_ctx.getStatusClass(task.status))) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("task-content") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("task-title-row") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({ ...{ class: ("task-title") }, ...{ class: (({ 'line-through': task.status === 1 })) }, });
            (task.title);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("task-status-row") }, });
            const __VLS_150 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
            /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
            // @ts-ignore
            const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({ ...{ 'onClick': {} }, ...{ 'onChange': {} }, modelValue: ((task.status)), ...{ class: ("task-status-select") }, size: ("small"), }));
            const __VLS_152 = __VLS_151({ ...{ 'onClick': {} }, ...{ 'onChange': {} }, modelValue: ((task.status)), ...{ class: ("task-status-select") }, size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_151));
            let __VLS_156;
            const __VLS_157 = {
                onClick: () => { }
            };
            const __VLS_158 = {
                onChange: ((val) => __VLS_ctx.handleChangeStatus(task, Number(val)))
            };
            let __VLS_153;
            let __VLS_154;
            const __VLS_159 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({ value: ((0)), label: ("未开始"), }));
            const __VLS_161 = __VLS_160({ value: ((0)), label: ("未开始"), }, ...__VLS_functionalComponentArgsRest(__VLS_160));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-pending") }, });
            __VLS_nonNullable(__VLS_164.slots).default;
            var __VLS_164;
            const __VLS_165 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({ value: ((2)), label: ("处理中"), }));
            const __VLS_167 = __VLS_166({ value: ((2)), label: ("处理中"), }, ...__VLS_functionalComponentArgsRest(__VLS_166));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-progress") }, });
            __VLS_nonNullable(__VLS_170.slots).default;
            var __VLS_170;
            const __VLS_171 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({ value: ((1)), label: ("已完成"), }));
            const __VLS_173 = __VLS_172({ value: ((1)), label: ("已完成"), }, ...__VLS_functionalComponentArgsRest(__VLS_172));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-completed") }, });
            __VLS_nonNullable(__VLS_176.slots).default;
            var __VLS_176;
            __VLS_nonNullable(__VLS_155.slots).default;
            var __VLS_155;
            if (__VLS_ctx.getTaskSubTaskProgress(task.id).total > 0) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("task-progress-wrapper") }, });
                const __VLS_177 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
                /** @type { [typeof __VLS_components.ElProgress, ] } */
                // @ts-ignore
                const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({ percentage: ((__VLS_ctx.getTaskSubTaskProgress(task.id).percentage)), strokeWidth: ((6)), showText: ((false)), ...{ class: ("task-progress-bar") }, }));
                const __VLS_179 = __VLS_178({ percentage: ((__VLS_ctx.getTaskSubTaskProgress(task.id).percentage)), strokeWidth: ((6)), showText: ((false)), ...{ class: ("task-progress-bar") }, }, ...__VLS_functionalComponentArgsRest(__VLS_178));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("task-progress-text") }, });
                (__VLS_ctx.getTaskSubTaskProgress(task.id).completed);
                (__VLS_ctx.getTaskSubTaskProgress(task.id).total);
            }
            if (task.description) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("task-desc") }, });
                (__VLS_ctx.truncateText(task.description, 60));
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("task-footer") }, });
            if (task.dueTime) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("due-time") }, ...{ class: (({
                            overdue: __VLS_ctx.isOverdue(task.dueTime) && task.status !== 1 && task.status !== 2
                        })) }, });
                const __VLS_183 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({ icon: ("ri:time-line"), }));
                const __VLS_185 = __VLS_184({ icon: ("ri:time-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_184));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.formatDueTime(task.dueTime));
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("creator") }, });
            const __VLS_189 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
            /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
            // @ts-ignore
            const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({ size: ((24)), src: ((task.creatorAvatar)), alt: ((task.creatorName)), }));
            const __VLS_191 = __VLS_190({ size: ((24)), src: ((task.creatorAvatar)), alt: ((task.creatorName)), }, ...__VLS_functionalComponentArgsRest(__VLS_190));
            (task.creatorName?.charAt(0));
            __VLS_nonNullable(__VLS_194.slots).default;
            var __VLS_194;
        }
        var __VLS_147;
        if (stage.tasks.length === 0) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-stage") }, });
            const __VLS_195 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({ icon: ("ri:inbox-line"), }));
            const __VLS_197 = __VLS_196({ icon: ("ri:inbox-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_196));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.openCreateDialog(stage.id);
                } }, ...{ class: ("add-task-btn") }, });
        const __VLS_201 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({ icon: ("ri:add-line"), }));
        const __VLS_203 = __VLS_202({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_202));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("add-stage-column") }, });
    if (!__VLS_ctx.isAddingStage) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.startAddStage) }, ...{ class: ("add-stage-btn") }, });
        const __VLS_207 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({ icon: ("ri:add-line"), }));
        const __VLS_209 = __VLS_208({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_208));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("add-stage-form") }, });
        const __VLS_213 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({ ...{ 'onKeyup': {} }, ...{ 'onKeyup': {} }, ref: ("newStageInputRef"), modelValue: ((__VLS_ctx.newStageName)), placeholder: ("输入列表名称..."), size: ("default"), }));
        const __VLS_215 = __VLS_214({ ...{ 'onKeyup': {} }, ...{ 'onKeyup': {} }, ref: ("newStageInputRef"), modelValue: ((__VLS_ctx.newStageName)), placeholder: ("输入列表名称..."), size: ("default"), }, ...__VLS_functionalComponentArgsRest(__VLS_214));
        // @ts-ignore navigation for `const newStageInputRef = ref()`
        __VLS_ctx.newStageInputRef;
        var __VLS_219 = {};
        let __VLS_220;
        const __VLS_221 = {
            onKeyup: (__VLS_ctx.confirmAddStage)
        };
        const __VLS_222 = {
            onKeyup: (__VLS_ctx.cancelAddStage)
        };
        let __VLS_216;
        let __VLS_217;
        var __VLS_218;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("add-stage-actions") }, });
        const __VLS_223 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.addingStage)), }));
        const __VLS_225 = __VLS_224({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.addingStage)), }, ...__VLS_functionalComponentArgsRest(__VLS_224));
        let __VLS_229;
        const __VLS_230 = {
            onClick: (__VLS_ctx.confirmAddStage)
        };
        let __VLS_226;
        let __VLS_227;
        __VLS_nonNullable(__VLS_228.slots).default;
        var __VLS_228;
        const __VLS_231 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({ ...{ 'onClick': {} }, size: ("small"), }));
        const __VLS_233 = __VLS_232({ ...{ 'onClick': {} }, size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_232));
        let __VLS_237;
        const __VLS_238 = {
            onClick: (__VLS_ctx.cancelAddStage)
        };
        let __VLS_234;
        let __VLS_235;
        __VLS_nonNullable(__VLS_236.slots).default;
        var __VLS_236;
    }
    // @ts-ignore
    [MemberDialog,];
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(MemberDialog, new MemberDialog({ visible: ((__VLS_ctx.memberDialogVisible)), projectId: ((__VLS_ctx.projectId)), }));
    const __VLS_240 = __VLS_239({ visible: ((__VLS_ctx.memberDialogVisible)), projectId: ((__VLS_ctx.projectId)), }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    // @ts-ignore
    [TaskDetailDialog,];
    // @ts-ignore
    const __VLS_244 = __VLS_asFunctionalComponent(TaskDetailDialog, new TaskDetailDialog({ ...{ 'onSuccess': {} }, ...{ 'onSubtaskUpdated': {} }, ref: ("taskDialogRef"), projectId: ((__VLS_ctx.projectId)), }));
    const __VLS_245 = __VLS_244({ ...{ 'onSuccess': {} }, ...{ 'onSubtaskUpdated': {} }, ref: ("taskDialogRef"), projectId: ((__VLS_ctx.projectId)), }, ...__VLS_functionalComponentArgsRest(__VLS_244));
    // @ts-ignore navigation for `const taskDialogRef = ref()`
    __VLS_ctx.taskDialogRef;
    var __VLS_249 = {};
    let __VLS_250;
    const __VLS_251 = {
        onSuccess: (__VLS_ctx.handleTaskDialogSuccess)
    };
    const __VLS_252 = {
        onSubtaskUpdated: (__VLS_ctx.handleSubTaskUpdated)
    };
    let __VLS_246;
    let __VLS_247;
    var __VLS_248;
    __VLS_styleScopedClasses['kanban-page'];
    __VLS_styleScopedClasses['kanban-header'];
    __VLS_styleScopedClasses['header-top'];
    __VLS_styleScopedClasses['header-left'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['header-right'];
    __VLS_styleScopedClasses['member-avatars'];
    __VLS_styleScopedClasses['more-count'];
    __VLS_styleScopedClasses['member-label'];
    __VLS_styleScopedClasses['ws-status'];
    __VLS_styleScopedClasses['connected'];
    __VLS_styleScopedClasses['header-progress'];
    __VLS_styleScopedClasses['progress-info'];
    __VLS_styleScopedClasses['progress-label'];
    __VLS_styleScopedClasses['progress-value'];
    __VLS_styleScopedClasses['progress-bar-wrapper'];
    __VLS_styleScopedClasses['progress-edit-btn'];
    __VLS_styleScopedClasses['progress-popover'];
    __VLS_styleScopedClasses['popover-title'];
    __VLS_styleScopedClasses['popover-actions'];
    __VLS_styleScopedClasses['kanban-container'];
    __VLS_styleScopedClasses['kanban-scroll'];
    __VLS_styleScopedClasses['stage-column'];
    __VLS_styleScopedClasses['stage-header'];
    __VLS_styleScopedClasses['stage-name-input'];
    __VLS_styleScopedClasses['stage-name'];
    __VLS_styleScopedClasses['stage-header-right'];
    __VLS_styleScopedClasses['task-count'];
    __VLS_styleScopedClasses['stage-more-btn'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['task-list'];
    __VLS_styleScopedClasses['task-card'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['priority-bar'];
    __VLS_styleScopedClasses['status-bar'];
    __VLS_styleScopedClasses['task-content'];
    __VLS_styleScopedClasses['task-title-row'];
    __VLS_styleScopedClasses['task-title'];
    __VLS_styleScopedClasses['line-through'];
    __VLS_styleScopedClasses['task-status-row'];
    __VLS_styleScopedClasses['task-status-select'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['task-progress-wrapper'];
    __VLS_styleScopedClasses['task-progress-bar'];
    __VLS_styleScopedClasses['task-progress-text'];
    __VLS_styleScopedClasses['task-desc'];
    __VLS_styleScopedClasses['task-footer'];
    __VLS_styleScopedClasses['due-time'];
    __VLS_styleScopedClasses['overdue'];
    __VLS_styleScopedClasses['creator'];
    __VLS_styleScopedClasses['empty-stage'];
    __VLS_styleScopedClasses['add-task-btn'];
    __VLS_styleScopedClasses['add-stage-column'];
    __VLS_styleScopedClasses['add-stage-btn'];
    __VLS_styleScopedClasses['add-stage-form'];
    __VLS_styleScopedClasses['add-stage-actions'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "boardContainerRef": __VLS_nativeElements['div'],
        "newStageInputRef": __VLS_219,
        "taskDialogRef": __VLS_249,
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
            ArrowLeft: ArrowLeft,
            Edit: Edit,
            MoreFilled: MoreFilled,
            draggable: draggable,
            MemberDialog: MemberDialog,
            TaskDetailDialog: TaskDetailDialog,
            members: members,
            memberDialogVisible: memberDialogVisible,
            projectId: projectId,
            projectName: projectName,
            stages: stages,
            loading: loading,
            boardContainerRef: boardContainerRef,
            projectProgress: projectProgress,
            tempProgress: tempProgress,
            progressPopoverVisible: progressPopoverVisible,
            savingProgress: savingProgress,
            progressColor: progressColor,
            taskDialogRef: taskDialogRef,
            isAddingStage: isAddingStage,
            newStageName: newStageName,
            addingStage: addingStage,
            newStageInputRef: newStageInputRef,
            editingStageName: editingStageName,
            setStageInputRef: setStageInputRef,
            startAddStage: startAddStage,
            cancelAddStage: cancelAddStage,
            confirmAddStage: confirmAddStage,
            enableEditStage: enableEditStage,
            cancelEditStage: cancelEditStage,
            saveStageName: saveStageName,
            handleStageCommand: handleStageCommand,
            getTaskSubTaskProgress: getTaskSubTaskProgress,
            saveProgress: saveProgress,
            refreshBoard: refreshBoard,
            goBack: goBack,
            goToFiles: goToFiles,
            handleChange: handleChange,
            openCreateDialog: openCreateDialog,
            openEditDialog: openEditDialog,
            handleTaskDialogSuccess: handleTaskDialogSuccess,
            handleSubTaskUpdated: handleSubTaskUpdated,
            handleChangeStatus: handleChangeStatus,
            getPriorityClass: getPriorityClass,
            getStatusClass: getStatusClass,
            formatDueTime: formatDueTime,
            isOverdue: isOverdue,
            truncateText: truncateText,
            wsConnected: wsConnected,
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