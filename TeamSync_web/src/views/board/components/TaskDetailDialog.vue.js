import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit } from '@element-plus/icons-vue';
import { createTask, updateTask, deleteTask } from '@/api/board';
import { getTaskActivities, addComment } from '@/api/activity';
import { getProjectMembers } from '@/api/member';
import { getSubTasks, createSubTask, updateSubTask, deleteSubTask } from '@/api/subtask';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const visible = defineModel('visible', { default: false });
const emit = defineEmits();
// 移动端检测
const isMobile = useMediaQuery('(max-width: 768px)');
const mobileActiveTab = ref('detail');
// 弹窗宽度（响应式）
const dialogWidth = computed(() => {
    if (isMobile.value)
        return '100%';
    return isEditMode.value ? '960px' : '480px';
});
// 表单相关
const formRef = ref();
const isEditMode = ref(false);
const currentTaskId = ref(null);
const currentStageId = ref(null);
const submitLoading = ref(false);
const submitContinueLoading = ref(false);
const deleteLoading = ref(false);
// 任务表单
const taskForm = reactive({
    title: '',
    description: '',
    priority: 1,
    dueTime: '',
    assigneeIds: []
});
// 项目成员（用于负责人选择）
const projectMembers = ref([]);
const membersLoading = ref(false);
// 活动流相关
const activities = ref([]);
const activityLoading = ref(false);
const commentContent = ref('');
const commentLoading = ref(false);
const activeTab = ref('all');
// 子任务相关
const subTasks = ref([]);
const subTasksLoading = ref(false);
const newSubTaskContent = ref('');
const addingSubTask = ref(false);
const editingSubTaskDueTime = ref(null);
const subTaskDueTimeDialogVisible = ref(false);
const subTaskDueTimeValue = ref('');
// 计算属性：过滤后的列表
const commentList = computed(() => activities.value.filter((a) => a.type === 'comment'));
const logList = computed(() => activities.value.filter((a) => a.type === 'log'));
const currentActivityList = computed(() => {
    switch (activeTab.value) {
        case 'comments':
            return commentList.value;
        case 'logs':
            return logList.value;
        default:
            return activities.value;
    }
});
const emptyText = computed(() => {
    switch (activeTab.value) {
        case 'comments':
            return '暂无评论';
        case 'logs':
            return '暂无日志';
        default:
            return '暂无动态';
    }
});
// 子任务进度计算
const subTaskProgress = computed(() => {
    if (subTasks.value.length === 0)
        return 0;
    const completed = subTasks.value.filter((s) => s.status === 1).length;
    return Math.round((completed / subTasks.value.length) * 100);
});
const subTaskCompletedCount = computed(() => subTasks.value.filter((s) => s.status === 1).length);
// 表单校验规则
const formRules = {
    title: [
        { required: true, message: '请输入任务标题', trigger: 'blur' },
        { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
    ]
};
// 优先级选项
const priorityOptions = [
    { value: 1, label: '普通' },
    { value: 2, label: '紧急' },
    { value: 3, label: '非常紧急' }
];
/**
 * 打开新建弹窗
 */
const openCreate = (stageId) => {
    isEditMode.value = false;
    currentTaskId.value = null;
    currentStageId.value = stageId;
    resetForm();
    visible.value = true;
};
/**
 * 打开编辑弹窗
 */
const openEdit = (task) => {
    isEditMode.value = true;
    currentTaskId.value = task.id;
    currentStageId.value = task.stageId;
    // 回显数据
    taskForm.title = task.title || '';
    taskForm.description = task.description || '';
    taskForm.priority = task.priority || 1;
    taskForm.dueTime = task.dueTime || '';
    taskForm.assigneeIds = task.assigneeIds || [];
    visible.value = true;
};
/**
 * 弹窗打开时
 */
const onDialogOpen = () => {
    // 获取项目成员列表（用于负责人选择）
    fetchProjectMembers();
    if (isEditMode.value && currentTaskId.value) {
        // 并发获取活动流和子任务
        fetchActivities();
        fetchSubTasks();
    }
};
/**
 * 获取项目成员列表
 */
const fetchProjectMembers = async () => {
    if (!props.projectId)
        return;
    membersLoading.value = true;
    try {
        const data = await getProjectMembers(props.projectId);
        projectMembers.value = data || [];
    }
    catch (error) {
        console.error('获取项目成员失败:', error);
    }
    finally {
        membersLoading.value = false;
    }
};
/**
 * 弹窗关闭时
 */
const onDialogClose = () => {
    resetForm();
    activities.value = [];
    subTasks.value = [];
    newSubTaskContent.value = '';
    commentContent.value = '';
    activeTab.value = 'all';
};
/**
 * 重置表单
 */
const resetForm = () => {
    taskForm.title = '';
    taskForm.description = '';
    taskForm.priority = 1;
    taskForm.dueTime = '';
    taskForm.assigneeIds = [];
    formRef.value?.resetFields();
};
/**
 * 获取活动流
 */
const fetchActivities = async () => {
    if (!currentTaskId.value)
        return;
    activityLoading.value = true;
    try {
        const data = await getTaskActivities(currentTaskId.value);
        activities.value = data || [];
    }
    catch (error) {
        console.error('获取活动流失败:', error);
    }
    finally {
        activityLoading.value = false;
    }
};
/**
 * 获取子任务列表
 */
const fetchSubTasks = async () => {
    if (!currentTaskId.value)
        return;
    subTasksLoading.value = true;
    try {
        const data = await getSubTasks(currentTaskId.value);
        subTasks.value = data || [];
    }
    catch (error) {
        console.error('获取子任务失败:', error);
    }
    finally {
        subTasksLoading.value = false;
    }
};
/**
 * 添加子任务
 */
const handleAddSubTask = async () => {
    if (!currentTaskId.value || !newSubTaskContent.value.trim())
        return;
    addingSubTask.value = true;
    try {
        const newSubTask = await createSubTask(currentTaskId.value, newSubTaskContent.value.trim());
        subTasks.value.push(newSubTask);
        newSubTaskContent.value = '';
        // 通知父组件更新子任务缓存
        if (currentTaskId.value) {
            emit('subtask-updated', currentTaskId.value);
        }
    }
    catch (error) {
        console.error('添加子任务失败:', error);
        ElMessage.error('添加子任务失败');
    }
    finally {
        addingSubTask.value = false;
    }
};
/**
 * 切换子任务状态
 */
const handleChangeSubTaskStatus = async (subTask, newStatus) => {
    try {
        await updateSubTask(subTask.id, { status: newStatus });
        subTask.status = newStatus;
        const statusText = newStatus === 0 ? '未开始' : newStatus === 1 ? '已完成' : '处理中';
        ElMessage.success(`子任务状态已更新为：${statusText}`);
        // 通知父组件更新子任务缓存
        if (currentTaskId.value) {
            emit('subtask-updated', currentTaskId.value);
        }
    }
    catch (error) {
        console.error('更新子任务状态失败:', error);
        ElMessage.error('更新状态失败');
    }
};
/**
 * 切换子任务状态（已废弃，使用 handleChangeSubTaskStatus）
 * @deprecated 使用 handleChangeSubTaskStatus 代替
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleToggleSubTask = async (subTask) => {
    await handleChangeSubTaskStatus(subTask, subTask.status === 1 ? 0 : 1);
};
/**
 * 删除子任务
 */
const handleDeleteSubTask = async (subTask) => {
    try {
        await deleteSubTask(subTask.id);
        const index = subTasks.value.findIndex((s) => s.id === subTask.id);
        if (index > -1) {
            subTasks.value.splice(index, 1);
        }
        // 通知父组件更新子任务缓存
        if (currentTaskId.value) {
            emit('subtask-updated', currentTaskId.value);
        }
    }
    catch (error) {
        console.error('删除子任务失败:', error);
        ElMessage.error('删除子任务失败');
    }
};
/**
 * 编辑子任务截止时间
 */
const handleEditSubTaskDueTime = (subTask) => {
    editingSubTaskDueTime.value = subTask;
    subTaskDueTimeValue.value = subTask.dueTime || '';
    subTaskDueTimeDialogVisible.value = true;
};
/**
 * 保存子任务截止时间
 */
const handleSaveSubTaskDueTime = async () => {
    if (!editingSubTaskDueTime.value)
        return;
    try {
        // 如果为空，则清除截止时间；否则处理截止时间，统一设置为选定日期的 18:00:00
        const normalizedDueTime = subTaskDueTimeValue.value
            ? normalizeDueTime(subTaskDueTimeValue.value)
            : undefined;
        await updateSubTask(editingSubTaskDueTime.value.id, {
            dueTime: normalizedDueTime
        });
        // 更新本地数据
        const subTask = subTasks.value.find((s) => s.id === editingSubTaskDueTime.value.id);
        if (subTask) {
            subTask.dueTime = normalizedDueTime || undefined;
        }
        subTaskDueTimeDialogVisible.value = false;
        editingSubTaskDueTime.value = null;
        subTaskDueTimeValue.value = '';
        ElMessage.success('截止时间已更新');
        // 通知父组件更新子任务缓存（虽然截止时间不影响进度，但保持数据同步）
        if (currentTaskId.value) {
            emit('subtask-updated', currentTaskId.value);
        }
    }
    catch (error) {
        console.error('更新子任务截止时间失败:', error);
        ElMessage.error('更新截止时间失败');
    }
};
/**
 * 格式化子任务截止时间
 */
const formatSubTaskDueTime = (dueTime) => {
    if (!dueTime)
        return '';
    const date = new Date(dueTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (dueDate.getTime() === today.getTime()) {
        return '今天 18:00';
    }
    else if (dueDate.getTime() === today.getTime() + 86400000) {
        return '明天 18:00';
    }
    else {
        return date.toLocaleDateString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};
/**
 * 判断子任务是否过期
 */
const isSubTaskOverdue = (subTask) => {
    if (!subTask.dueTime || subTask.status === 1)
        return false;
    const dueDate = new Date(subTask.dueTime);
    return dueDate < new Date();
};
/**
 * 发表评论
 */
const handleAddComment = async () => {
    if (!currentTaskId.value || !commentContent.value.trim())
        return;
    commentLoading.value = true;
    try {
        const newComment = await addComment(currentTaskId.value, commentContent.value.trim());
        // 添加到列表开头（因为是倒序）
        activities.value.unshift(newComment);
        commentContent.value = '';
        ElMessage.success('评论发表成功');
        // 切换到全部或评论 Tab
        if (activeTab.value === 'logs') {
            activeTab.value = 'all';
        }
    }
    catch (error) {
        console.error('发表评论失败:', error);
    }
    finally {
        commentLoading.value = false;
    }
};
/**
 * 将截止时间统一设置为选定日期的 18:00:00
 * @param dueTime 原始截止时间字符串 (格式: YYYY-MM-DDTHH:mm:ss)
 * @returns 处理后的截止时间字符串，时间部分统一为 18:00:00
 */
const normalizeDueTime = (dueTime) => {
    if (!dueTime)
        return undefined;
    // 解析日期时间字符串
    const date = new Date(dueTime);
    if (isNaN(date.getTime()))
        return undefined;
    // 提取日期部分 (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // 统一设置为 18:00:00
    return `${year}-${month}-${day}T18:00:00`;
};
/**
 * 提交表单（创建/更新）
 */
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (!valid)
            return;
        submitLoading.value = true;
        try {
            // 处理截止时间，统一设置为选定日期的 18:00:00
            const normalizedDueTime = normalizeDueTime(taskForm.dueTime);
            if (isEditMode.value && currentTaskId.value) {
                // 更新任务
                await updateTask(currentTaskId.value, {
                    title: taskForm.title.trim(),
                    description: taskForm.description?.trim() || '',
                    priority: taskForm.priority,
                    dueTime: normalizedDueTime,
                    assigneeIds: taskForm.assigneeIds
                });
                ElMessage.success('任务更新成功');
                // 刷新活动流
                fetchActivities();
            }
            else {
                // 创建任务
                await createTask({
                    projectId: props.projectId,
                    stageId: currentStageId.value,
                    title: taskForm.title.trim(),
                    description: taskForm.description?.trim() || '',
                    priority: taskForm.priority,
                    dueTime: normalizedDueTime,
                    assigneeIds: taskForm.assigneeIds.length > 0 ? taskForm.assigneeIds : undefined
                });
                ElMessage.success('任务创建成功');
                visible.value = false;
                resetForm();
            }
            emit('success');
        }
        catch (error) {
            console.error('操作失败:', error);
        }
        finally {
            submitLoading.value = false;
        }
    });
};
/**
 * 提交并继续创建（仅新建模式）
 * - 创建成功后不关闭弹窗
 * - 清空 title, description
 * - 保留 priority, assigneeIds, dueTime（方便批量录入）
 */
const handleSubmitAndContinue = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (!valid)
            return;
        submitContinueLoading.value = true;
        try {
            // 处理截止时间，统一设置为选定日期的 18:00:00
            const normalizedDueTime = normalizeDueTime(taskForm.dueTime);
            await createTask({
                projectId: props.projectId,
                stageId: currentStageId.value,
                title: taskForm.title.trim(),
                description: taskForm.description?.trim() || '',
                priority: taskForm.priority,
                dueTime: normalizedDueTime,
                assigneeIds: taskForm.assigneeIds.length > 0 ? taskForm.assigneeIds : undefined
            });
            ElMessage.success('创建成功，可继续添加');
            // 清空 title 和 description，保留其他字段
            taskForm.title = '';
            taskForm.description = '';
            // priority, assigneeIds, dueTime 保留不变
            // 通知父组件刷新
            emit('success');
        }
        catch (error) {
            console.error('创建任务失败:', error);
        }
        finally {
            submitContinueLoading.value = false;
        }
    });
};
/**
 * 删除任务
 */
const handleDelete = async () => {
    if (!currentTaskId.value)
        return;
    try {
        await ElMessageBox.confirm('确定要删除这个任务吗？此操作不可恢复。', '删除确认', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        });
        deleteLoading.value = true;
        await deleteTask(currentTaskId.value);
        ElMessage.success('任务删除成功');
        visible.value = false;
        resetForm();
        emit('success');
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('删除失败:', error);
        }
    }
    finally {
        deleteLoading.value = false;
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
const getTimelineType = (activity) => {
    if (activity.type === 'comment')
        return 'primary';
    switch (activity.actionType) {
        case 'CREATE':
            return 'success';
        case 'DELETE':
            return 'danger';
        case 'MOVE':
            return 'warning';
        default:
            return 'info';
    }
};
/**
 * 格式化时间
 */
const formatTime = (dateStr) => {
    if (!dateStr)
        return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1)
        return '刚刚';
    if (diffMins < 60)
        return `${diffMins}分钟前`;
    if (diffHours < 24)
        return `${diffHours}小时前`;
    if (diffDays < 7)
        return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
// 暴露方法供父组件调用
const __VLS_exposed = {
    openCreate,
    openEdit
};
defineExpose({
    openCreate,
    openEdit
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
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['activity-section-bottom'];
    __VLS_styleScopedClasses['activity-list-wrapper'];
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['subtask-section-right'];
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['subtask-content'];
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['overdue'];
    __VLS_styleScopedClasses['subtask-due-time-btn'];
    __VLS_styleScopedClasses['subtask-delete-btn'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['el-tabs__header'];
    __VLS_styleScopedClasses['el-tabs__item'];
    __VLS_styleScopedClasses['el-badge'];
    __VLS_styleScopedClasses['el-badge__content'];
    __VLS_styleScopedClasses['comment-input'];
    __VLS_styleScopedClasses['el-button'];
    __VLS_styleScopedClasses['dialog-footer'];
    __VLS_styleScopedClasses['el-button'];
    __VLS_styleScopedClasses['subtask-item'];
    __VLS_styleScopedClasses['subtask-delete-btn'];
    __VLS_styleScopedClasses['compact-timeline'];
    __VLS_styleScopedClasses['el-timeline-item'];
    __VLS_styleScopedClasses['activity-item'];
    __VLS_styleScopedClasses['comment'];
    __VLS_styleScopedClasses['comment-header'];
    __VLS_styleScopedClasses['user-name'];
    __VLS_styleScopedClasses['activity-time'];
    __VLS_styleScopedClasses['comment-body'];
    __VLS_styleScopedClasses['log'];
    __VLS_styleScopedClasses['log-item'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onOpen': {} }, ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((__VLS_ctx.isEditMode ? '任务详情' : '新建任务')), width: ((__VLS_ctx.dialogWidth)), closeOnClickModal: ((false)), fullscreen: ((__VLS_ctx.isMobile)), ...{ class: ("task-detail-dialog") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onOpen': {} }, ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((__VLS_ctx.isEditMode ? '任务详情' : '新建任务')), width: ((__VLS_ctx.dialogWidth)), closeOnClickModal: ((false)), fullscreen: ((__VLS_ctx.isMobile)), ...{ class: ("task-detail-dialog") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onOpen: (__VLS_ctx.onDialogOpen)
    };
    const __VLS_9 = {
        onClose: (__VLS_ctx.onDialogClose)
    };
    let __VLS_3;
    let __VLS_4;
    if (__VLS_ctx.isMobile && __VLS_ctx.isEditMode) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-dialog-content") }, });
        const __VLS_10 = __VLS_resolvedLocalAndGlobalComponents.ElTabs;
        /** @type { [typeof __VLS_components.ElTabs, typeof __VLS_components.ElTabs, ] } */
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({ modelValue: ((__VLS_ctx.mobileActiveTab)), ...{ class: ("mobile-tabs") }, }));
        const __VLS_12 = __VLS_11({ modelValue: ((__VLS_ctx.mobileActiveTab)), ...{ class: ("mobile-tabs") }, }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
        /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.ElTabPane, ] } */
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ label: ("详情"), name: ("detail"), }));
        const __VLS_18 = __VLS_17({ label: ("详情"), name: ("detail"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ height: ("calc(100vh - 200px)"), }));
        const __VLS_24 = __VLS_23({ height: ("calc(100vh - 200px)"), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-form-wrapper") }, });
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ref: ("formRef"), model: ((__VLS_ctx.taskForm)), rules: ((__VLS_ctx.formRules)), labelPosition: ("top"), }));
        const __VLS_30 = __VLS_29({ ref: ("formRef"), model: ((__VLS_ctx.taskForm)), rules: ((__VLS_ctx.formRules)), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        // @ts-ignore navigation for `const formRef = ref()`
        __VLS_ctx.formRef;
        var __VLS_34 = {};
        const __VLS_35 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({ label: ("任务标题"), prop: ("title"), }));
        const __VLS_37 = __VLS_36({ label: ("任务标题"), prop: ("title"), }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ modelValue: ((__VLS_ctx.taskForm.title)), placeholder: ("请输入任务标题"), maxlength: ("200"), showWordLimit: (true), }));
        const __VLS_43 = __VLS_42({ modelValue: ((__VLS_ctx.taskForm.title)), placeholder: ("请输入任务标题"), maxlength: ("200"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        __VLS_nonNullable(__VLS_40.slots).default;
        var __VLS_40;
        const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ label: ("任务描述"), prop: ("description"), }));
        const __VLS_49 = __VLS_48({ label: ("任务描述"), prop: ("description"), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        const __VLS_53 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({ modelValue: ((__VLS_ctx.taskForm.description)), type: ("textarea"), placeholder: ("请输入任务描述（选填）"), rows: ((4)), maxlength: ("1000"), showWordLimit: (true), }));
        const __VLS_55 = __VLS_54({ modelValue: ((__VLS_ctx.taskForm.description)), type: ("textarea"), placeholder: ("请输入任务描述（选填）"), rows: ((4)), maxlength: ("1000"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        __VLS_nonNullable(__VLS_52.slots).default;
        var __VLS_52;
        const __VLS_59 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({ gutter: ((12)), }));
        const __VLS_61 = __VLS_60({ gutter: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        const __VLS_65 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({ span: ((12)), }));
        const __VLS_67 = __VLS_66({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ label: ("优先级"), prop: ("priority"), }));
        const __VLS_73 = __VLS_72({ label: ("优先级"), prop: ("priority"), }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({ modelValue: ((__VLS_ctx.taskForm.priority)), placeholder: ("选择优先级"), ...{ style: ({}) }, }));
        const __VLS_79 = __VLS_78({ modelValue: ((__VLS_ctx.taskForm.priority)), placeholder: ("选择优先级"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.priorityOptions))) {
            const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ key: ((item.value)), label: ((item.label)), value: ((item.value)), }));
            const __VLS_85 = __VLS_84({ key: ((item.value)), label: ((item.label)), value: ((item.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_84));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("priority-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("priority-dot") }, ...{ class: ((__VLS_ctx.getPriorityClass(item.value))) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.label);
            __VLS_nonNullable(__VLS_88.slots).default;
            var __VLS_88;
        }
        __VLS_nonNullable(__VLS_82.slots).default;
        var __VLS_82;
        __VLS_nonNullable(__VLS_76.slots).default;
        var __VLS_76;
        __VLS_nonNullable(__VLS_70.slots).default;
        var __VLS_70;
        const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ span: ((12)), }));
        const __VLS_91 = __VLS_90({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        const __VLS_95 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({ label: ("截止时间"), prop: ("dueTime"), }));
        const __VLS_97 = __VLS_96({ label: ("截止时间"), prop: ("dueTime"), }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        const __VLS_101 = __VLS_resolvedLocalAndGlobalComponents.ElDatePicker;
        /** @type { [typeof __VLS_components.ElDatePicker, ] } */
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({ modelValue: ((__VLS_ctx.taskForm.dueTime)), type: ("datetime"), placeholder: ("选择时间"), format: ("MM-DD HH:mm"), valueFormat: ("YYYY-MM-DDTHH:mm:ss"), ...{ style: ({}) }, }));
        const __VLS_103 = __VLS_102({ modelValue: ((__VLS_ctx.taskForm.dueTime)), type: ("datetime"), placeholder: ("选择时间"), format: ("MM-DD HH:mm"), valueFormat: ("YYYY-MM-DDTHH:mm:ss"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        __VLS_nonNullable(__VLS_100.slots).default;
        var __VLS_100;
        __VLS_nonNullable(__VLS_94.slots).default;
        var __VLS_94;
        __VLS_nonNullable(__VLS_64.slots).default;
        var __VLS_64;
        const __VLS_107 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({ label: ("负责人"), prop: ("assigneeIds"), }));
        const __VLS_109 = __VLS_108({ label: ("负责人"), prop: ("assigneeIds"), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        const __VLS_113 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({ modelValue: ((__VLS_ctx.taskForm.assigneeIds)), multiple: (true), filterable: (true), placeholder: ("选择负责人"), ...{ style: ({}) }, loading: ((__VLS_ctx.membersLoading)), collapseTags: (true), maxCollapseTags: ((2)), }));
        const __VLS_115 = __VLS_114({ modelValue: ((__VLS_ctx.taskForm.assigneeIds)), multiple: (true), filterable: (true), placeholder: ("选择负责人"), ...{ style: ({}) }, loading: ((__VLS_ctx.membersLoading)), collapseTags: (true), maxCollapseTags: ((2)), }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        for (const [member] of __VLS_getVForSourceType((__VLS_ctx.projectMembers))) {
            const __VLS_119 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({ key: ((member.userId)), label: ((member.nickname || member.username)), value: ((member.userId)), }));
            const __VLS_121 = __VLS_120({ key: ((member.userId)), label: ((member.nickname || member.username)), value: ((member.userId)), }, ...__VLS_functionalComponentArgsRest(__VLS_120));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("assignee-option") }, });
            const __VLS_125 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
            /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({ size: ((24)), src: ((member.avatar)), }));
            const __VLS_127 = __VLS_126({ size: ((24)), src: ((member.avatar)), }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            ((member.nickname || member.username)?.charAt(0));
            __VLS_nonNullable(__VLS_130.slots).default;
            var __VLS_130;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("assignee-name") }, });
            (member.nickname || member.username);
            __VLS_nonNullable(__VLS_124.slots).default;
            var __VLS_124;
        }
        __VLS_nonNullable(__VLS_118.slots).default;
        var __VLS_118;
        __VLS_nonNullable(__VLS_112.slots).default;
        var __VLS_112;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-section") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-header") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subtask-title") }, });
        const __VLS_131 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({ icon: ("ri:checkbox-multiple-line"), }));
        const __VLS_133 = __VLS_132({ icon: ("ri:checkbox-multiple-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_132));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subtask-progress-text") }, });
        (__VLS_ctx.subTaskCompletedCount);
        (__VLS_ctx.subTasks.length);
        if (__VLS_ctx.subTasks.length > 0) {
            const __VLS_137 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
            /** @type { [typeof __VLS_components.ElProgress, ] } */
            // @ts-ignore
            const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({ percentage: ((__VLS_ctx.subTaskProgress)), strokeWidth: ((6)), showText: ((false)), ...{ class: ("subtask-progress-bar") }, }));
            const __VLS_139 = __VLS_138({ percentage: ((__VLS_ctx.subTaskProgress)), strokeWidth: ((6)), showText: ((false)), ...{ class: ("subtask-progress-bar") }, }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-list") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.subTasksLoading) }, null, null);
        for (const [subTask] of __VLS_getVForSourceType((__VLS_ctx.subTasks))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((subTask.id)), ...{ class: ("subtask-item") }, ...{ class: (({
                        'status-pending': subTask.status === 0,
                        'status-progress': subTask.status === 2,
                        'status-completed': subTask.status === 1
                    })) }, });
            const __VLS_143 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
            /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
            // @ts-ignore
            const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({ ...{ 'onChange': {} }, modelValue: ((subTask.status)), ...{ class: ("subtask-status-select") }, size: ("small"), }));
            const __VLS_145 = __VLS_144({ ...{ 'onChange': {} }, modelValue: ((subTask.status)), ...{ class: ("subtask-status-select") }, size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_144));
            let __VLS_149;
            const __VLS_150 = {
                onChange: ((val) => __VLS_ctx.handleChangeSubTaskStatus(subTask, Number(val)))
            };
            let __VLS_146;
            let __VLS_147;
            const __VLS_151 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({ value: ((0)), label: ("未开始"), }));
            const __VLS_153 = __VLS_152({ value: ((0)), label: ("未开始"), }, ...__VLS_functionalComponentArgsRest(__VLS_152));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-pending") }, });
            __VLS_nonNullable(__VLS_156.slots).default;
            var __VLS_156;
            const __VLS_157 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({ value: ((2)), label: ("处理中"), }));
            const __VLS_159 = __VLS_158({ value: ((2)), label: ("处理中"), }, ...__VLS_functionalComponentArgsRest(__VLS_158));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-progress") }, });
            __VLS_nonNullable(__VLS_162.slots).default;
            var __VLS_162;
            const __VLS_163 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({ value: ((1)), label: ("已完成"), }));
            const __VLS_165 = __VLS_164({ value: ((1)), label: ("已完成"), }, ...__VLS_functionalComponentArgsRest(__VLS_164));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-completed") }, });
            __VLS_nonNullable(__VLS_168.slots).default;
            var __VLS_168;
            __VLS_nonNullable(__VLS_148.slots).default;
            var __VLS_148;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subtask-content") }, ...{ class: (({ 'line-through': subTask.status === 1 })) }, });
            (subTask.content);
            const __VLS_169 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({ ...{ 'onClick': {} }, ...{ class: ("subtask-delete-btn") }, icon: ((__VLS_ctx.Delete)), size: ("small"), text: (true), type: ("danger"), }));
            const __VLS_171 = __VLS_170({ ...{ 'onClick': {} }, ...{ class: ("subtask-delete-btn") }, icon: ((__VLS_ctx.Delete)), size: ("small"), text: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_170));
            let __VLS_175;
            const __VLS_176 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.isMobile && __VLS_ctx.isEditMode)))
                        return;
                    __VLS_ctx.handleDeleteSubTask(subTask);
                }
            };
            let __VLS_172;
            let __VLS_173;
            var __VLS_174;
        }
        if (__VLS_ctx.subTasks.length === 0 && !__VLS_ctx.subTasksLoading) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-empty") }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-add") }, });
        const __VLS_177 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.newSubTaskContent)), placeholder: ("添加子任务..."), size: ("small"), disabled: ((__VLS_ctx.addingSubTask)), }));
        const __VLS_179 = __VLS_178({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.newSubTaskContent)), placeholder: ("添加子任务..."), size: ("small"), disabled: ((__VLS_ctx.addingSubTask)), }, ...__VLS_functionalComponentArgsRest(__VLS_178));
        let __VLS_183;
        const __VLS_184 = {
            onKeyup: (__VLS_ctx.handleAddSubTask)
        };
        let __VLS_180;
        let __VLS_181;
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { prefix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_182.slots);
            const __VLS_185 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({ icon: ("ri:add-line"), }));
            const __VLS_187 = __VLS_186({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        }
        var __VLS_182;
        const __VLS_191 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.addingSubTask)), disabled: ((!__VLS_ctx.newSubTaskContent.trim())), }));
        const __VLS_193 = __VLS_192({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.addingSubTask)), disabled: ((!__VLS_ctx.newSubTaskContent.trim())), }, ...__VLS_functionalComponentArgsRest(__VLS_192));
        let __VLS_197;
        const __VLS_198 = {
            onClick: (__VLS_ctx.handleAddSubTask)
        };
        let __VLS_194;
        let __VLS_195;
        __VLS_nonNullable(__VLS_196.slots).default;
        var __VLS_196;
        __VLS_nonNullable(__VLS_33.slots).default;
        var __VLS_33;
        __VLS_nonNullable(__VLS_27.slots).default;
        var __VLS_27;
        __VLS_nonNullable(__VLS_21.slots).default;
        var __VLS_21;
        const __VLS_199 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
        /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.ElTabPane, ] } */
        // @ts-ignore
        const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({ name: ("activity"), }));
        const __VLS_201 = __VLS_200({ name: ("activity"), }, ...__VLS_functionalComponentArgsRest(__VLS_200));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { label: __VLS_thisSlot } = __VLS_nonNullable(__VLS_204.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            if (__VLS_ctx.activities.length > 0) {
                const __VLS_205 = __VLS_resolvedLocalAndGlobalComponents.ElBadge;
                /** @type { [typeof __VLS_components.ElBadge, ] } */
                // @ts-ignore
                const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({ value: ((__VLS_ctx.activities.length)), max: ((99)), }));
                const __VLS_207 = __VLS_206({ value: ((__VLS_ctx.activities.length)), max: ((99)), }, ...__VLS_functionalComponentArgsRest(__VLS_206));
            }
        }
        const __VLS_211 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
        // @ts-ignore
        const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({ height: ("calc(100vh - 200px)"), }));
        const __VLS_213 = __VLS_212({ height: ("calc(100vh - 200px)"), }, ...__VLS_functionalComponentArgsRest(__VLS_212));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-activity-wrapper") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("comment-input mobile") }, });
        const __VLS_217 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({ modelValue: ((__VLS_ctx.commentContent)), type: ("textarea"), placeholder: ("发表评论..."), rows: ((2)), maxlength: ("500"), resize: ("none"), }));
        const __VLS_219 = __VLS_218({ modelValue: ((__VLS_ctx.commentContent)), type: ("textarea"), placeholder: ("发表评论..."), rows: ((2)), maxlength: ("500"), resize: ("none"), }, ...__VLS_functionalComponentArgsRest(__VLS_218));
        const __VLS_223 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.commentLoading)), disabled: ((!__VLS_ctx.commentContent.trim())), }));
        const __VLS_225 = __VLS_224({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.commentLoading)), disabled: ((!__VLS_ctx.commentContent.trim())), }, ...__VLS_functionalComponentArgsRest(__VLS_224));
        let __VLS_229;
        const __VLS_230 = {
            onClick: (__VLS_ctx.handleAddComment)
        };
        let __VLS_226;
        let __VLS_227;
        const __VLS_231 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({ icon: ("ri:send-plane-line"), }));
        const __VLS_233 = __VLS_232({ icon: ("ri:send-plane-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_232));
        __VLS_nonNullable(__VLS_228.slots).default;
        var __VLS_228;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-filter") }, });
        const __VLS_237 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
        /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.ElRadioGroup, ] } */
        // @ts-ignore
        const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({ modelValue: ((__VLS_ctx.activeTab)), size: ("small"), }));
        const __VLS_239 = __VLS_238({ modelValue: ((__VLS_ctx.activeTab)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_238));
        const __VLS_243 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
        // @ts-ignore
        const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({ label: ("all"), }));
        const __VLS_245 = __VLS_244({ label: ("all"), }, ...__VLS_functionalComponentArgsRest(__VLS_244));
        __VLS_nonNullable(__VLS_248.slots).default;
        var __VLS_248;
        const __VLS_249 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
        // @ts-ignore
        const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({ label: ("comments"), }));
        const __VLS_251 = __VLS_250({ label: ("comments"), }, ...__VLS_functionalComponentArgsRest(__VLS_250));
        __VLS_nonNullable(__VLS_254.slots).default;
        var __VLS_254;
        const __VLS_255 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
        // @ts-ignore
        const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({ label: ("logs"), }));
        const __VLS_257 = __VLS_256({ label: ("logs"), }, ...__VLS_functionalComponentArgsRest(__VLS_256));
        __VLS_nonNullable(__VLS_260.slots).default;
        var __VLS_260;
        __VLS_nonNullable(__VLS_242.slots).default;
        var __VLS_242;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-list-wrapper") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.activityLoading) }, null, null);
        if (__VLS_ctx.currentActivityList.length === 0 && !__VLS_ctx.activityLoading) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-activity") }, });
            const __VLS_261 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({ icon: ("ri:file-list-3-line"), }));
            const __VLS_263 = __VLS_262({ icon: ("ri:file-list-3-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_262));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.emptyText);
        }
        else {
            const __VLS_267 = __VLS_resolvedLocalAndGlobalComponents.ElTimeline;
            /** @type { [typeof __VLS_components.ElTimeline, typeof __VLS_components.ElTimeline, ] } */
            // @ts-ignore
            const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({ ...{ class: ("compact-timeline") }, }));
            const __VLS_269 = __VLS_268({ ...{ class: ("compact-timeline") }, }, ...__VLS_functionalComponentArgsRest(__VLS_268));
            for (const [activity] of __VLS_getVForSourceType((__VLS_ctx.currentActivityList))) {
                const __VLS_273 = __VLS_resolvedLocalAndGlobalComponents.ElTimelineItem;
                /** @type { [typeof __VLS_components.ElTimelineItem, typeof __VLS_components.ElTimelineItem, ] } */
                // @ts-ignore
                const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({ key: ((`${activity.type}-${activity.id}`)), type: ((__VLS_ctx.getTimelineType(activity))), hollow: ((activity.type === 'log')), size: ((activity.type === 'log' ? 'normal' : 'large')), }));
                const __VLS_275 = __VLS_274({ key: ((`${activity.type}-${activity.id}`)), type: ((__VLS_ctx.getTimelineType(activity))), hollow: ((activity.type === 'log')), size: ((activity.type === 'log' ? 'normal' : 'large')), }, ...__VLS_functionalComponentArgsRest(__VLS_274));
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-item") }, ...{ class: ((activity.type)) }, });
                if (activity.type === 'comment') {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("comment-header") }, });
                    const __VLS_279 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
                    /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
                    // @ts-ignore
                    const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({ size: ((20)), src: ((activity.avatar)), }));
                    const __VLS_281 = __VLS_280({ size: ((20)), src: ((activity.avatar)), }, ...__VLS_functionalComponentArgsRest(__VLS_280));
                    (activity.nickname?.charAt(0) || activity.username?.charAt(0));
                    __VLS_nonNullable(__VLS_284.slots).default;
                    var __VLS_284;
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("user-name") }, });
                    (activity.nickname || activity.username);
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("activity-time") }, });
                    (__VLS_ctx.formatTime(activity.createdAt));
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("comment-body") }, });
                    (activity.content);
                }
                else {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("log-item") }, });
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("log-user") }, });
                    (activity.nickname || activity.username);
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("log-text") }, });
                    (activity.content);
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("log-time") }, });
                    (__VLS_ctx.formatTime(activity.createdAt));
                }
                __VLS_nonNullable(__VLS_278.slots).default;
                var __VLS_278;
            }
            __VLS_nonNullable(__VLS_272.slots).default;
            var __VLS_272;
        }
        __VLS_nonNullable(__VLS_216.slots).default;
        var __VLS_216;
        var __VLS_204;
        __VLS_nonNullable(__VLS_15.slots).default;
        var __VLS_15;
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ((['dialog-content', { 'two-column': __VLS_ctx.isEditMode }])) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("form-section") }, });
        const __VLS_285 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
        // @ts-ignore
        const __VLS_286 = __VLS_asFunctionalComponent(__VLS_285, new __VLS_285({ height: ((__VLS_ctx.isEditMode ? '600px' : 'auto')), }));
        const __VLS_287 = __VLS_286({ height: ((__VLS_ctx.isEditMode ? '600px' : 'auto')), }, ...__VLS_functionalComponentArgsRest(__VLS_286));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("form-inner") }, });
        const __VLS_291 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
        // @ts-ignore
        const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({ ref: ("formRef"), model: ((__VLS_ctx.taskForm)), rules: ((__VLS_ctx.formRules)), labelWidth: ("80px"), labelPosition: ("top"), }));
        const __VLS_293 = __VLS_292({ ref: ("formRef"), model: ((__VLS_ctx.taskForm)), rules: ((__VLS_ctx.formRules)), labelWidth: ("80px"), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_292));
        // @ts-ignore navigation for `const formRef = ref()`
        __VLS_ctx.formRef;
        var __VLS_297 = {};
        const __VLS_298 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({ label: ("任务标题"), prop: ("title"), }));
        const __VLS_300 = __VLS_299({ label: ("任务标题"), prop: ("title"), }, ...__VLS_functionalComponentArgsRest(__VLS_299));
        const __VLS_304 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({ modelValue: ((__VLS_ctx.taskForm.title)), placeholder: ("请输入任务标题"), maxlength: ("200"), showWordLimit: (true), }));
        const __VLS_306 = __VLS_305({ modelValue: ((__VLS_ctx.taskForm.title)), placeholder: ("请输入任务标题"), maxlength: ("200"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_305));
        __VLS_nonNullable(__VLS_303.slots).default;
        var __VLS_303;
        const __VLS_310 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({ label: ("任务描述"), prop: ("description"), }));
        const __VLS_312 = __VLS_311({ label: ("任务描述"), prop: ("description"), }, ...__VLS_functionalComponentArgsRest(__VLS_311));
        const __VLS_316 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({ modelValue: ((__VLS_ctx.taskForm.description)), type: ("textarea"), placeholder: ("请输入任务描述（选填）"), rows: ((__VLS_ctx.isEditMode ? 6 : 4)), maxlength: ("1000"), showWordLimit: (true), }));
        const __VLS_318 = __VLS_317({ modelValue: ((__VLS_ctx.taskForm.description)), type: ("textarea"), placeholder: ("请输入任务描述（选填）"), rows: ((__VLS_ctx.isEditMode ? 6 : 4)), maxlength: ("1000"), showWordLimit: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_317));
        __VLS_nonNullable(__VLS_315.slots).default;
        var __VLS_315;
        const __VLS_322 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({ gutter: ((12)), }));
        const __VLS_324 = __VLS_323({ gutter: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_323));
        const __VLS_328 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({ span: ((12)), }));
        const __VLS_330 = __VLS_329({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_329));
        const __VLS_334 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({ label: ("优先级"), prop: ("priority"), }));
        const __VLS_336 = __VLS_335({ label: ("优先级"), prop: ("priority"), }, ...__VLS_functionalComponentArgsRest(__VLS_335));
        const __VLS_340 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
        // @ts-ignore
        const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({ modelValue: ((__VLS_ctx.taskForm.priority)), placeholder: ("选择优先级"), ...{ style: ({}) }, }));
        const __VLS_342 = __VLS_341({ modelValue: ((__VLS_ctx.taskForm.priority)), placeholder: ("选择优先级"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_341));
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.priorityOptions))) {
            const __VLS_346 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_347 = __VLS_asFunctionalComponent(__VLS_346, new __VLS_346({ key: ((item.value)), label: ((item.label)), value: ((item.value)), }));
            const __VLS_348 = __VLS_347({ key: ((item.value)), label: ((item.label)), value: ((item.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_347));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("priority-option") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("priority-dot") }, ...{ class: ((__VLS_ctx.getPriorityClass(item.value))) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.label);
            __VLS_nonNullable(__VLS_351.slots).default;
            var __VLS_351;
        }
        __VLS_nonNullable(__VLS_345.slots).default;
        var __VLS_345;
        __VLS_nonNullable(__VLS_339.slots).default;
        var __VLS_339;
        __VLS_nonNullable(__VLS_333.slots).default;
        var __VLS_333;
        const __VLS_352 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({ span: ((12)), }));
        const __VLS_354 = __VLS_353({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_353));
        const __VLS_358 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_359 = __VLS_asFunctionalComponent(__VLS_358, new __VLS_358({ label: ("截止时间"), prop: ("dueTime"), }));
        const __VLS_360 = __VLS_359({ label: ("截止时间"), prop: ("dueTime"), }, ...__VLS_functionalComponentArgsRest(__VLS_359));
        const __VLS_364 = __VLS_resolvedLocalAndGlobalComponents.ElDatePicker;
        /** @type { [typeof __VLS_components.ElDatePicker, ] } */
        // @ts-ignore
        const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({ modelValue: ((__VLS_ctx.taskForm.dueTime)), type: ("datetime"), placeholder: ("选择时间"), format: ("YYYY-MM-DD HH:mm"), valueFormat: ("YYYY-MM-DDTHH:mm:ss"), ...{ style: ({}) }, }));
        const __VLS_366 = __VLS_365({ modelValue: ((__VLS_ctx.taskForm.dueTime)), type: ("datetime"), placeholder: ("选择时间"), format: ("YYYY-MM-DD HH:mm"), valueFormat: ("YYYY-MM-DDTHH:mm:ss"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_365));
        __VLS_nonNullable(__VLS_363.slots).default;
        var __VLS_363;
        __VLS_nonNullable(__VLS_357.slots).default;
        var __VLS_357;
        __VLS_nonNullable(__VLS_327.slots).default;
        var __VLS_327;
        const __VLS_370 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_371 = __VLS_asFunctionalComponent(__VLS_370, new __VLS_370({ label: ("负责人"), prop: ("assigneeIds"), }));
        const __VLS_372 = __VLS_371({ label: ("负责人"), prop: ("assigneeIds"), }, ...__VLS_functionalComponentArgsRest(__VLS_371));
        const __VLS_376 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
        // @ts-ignore
        const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({ modelValue: ((__VLS_ctx.taskForm.assigneeIds)), multiple: (true), filterable: (true), placeholder: ("选择负责人"), ...{ style: ({}) }, loading: ((__VLS_ctx.membersLoading)), collapseTags: (true), collapseTagsTooltip: (true), maxCollapseTags: ((3)), }));
        const __VLS_378 = __VLS_377({ modelValue: ((__VLS_ctx.taskForm.assigneeIds)), multiple: (true), filterable: (true), placeholder: ("选择负责人"), ...{ style: ({}) }, loading: ((__VLS_ctx.membersLoading)), collapseTags: (true), collapseTagsTooltip: (true), maxCollapseTags: ((3)), }, ...__VLS_functionalComponentArgsRest(__VLS_377));
        for (const [member] of __VLS_getVForSourceType((__VLS_ctx.projectMembers))) {
            const __VLS_382 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({ key: ((member.userId)), label: ((member.nickname || member.username)), value: ((member.userId)), }));
            const __VLS_384 = __VLS_383({ key: ((member.userId)), label: ((member.nickname || member.username)), value: ((member.userId)), }, ...__VLS_functionalComponentArgsRest(__VLS_383));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("assignee-option") }, });
            const __VLS_388 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
            /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
            // @ts-ignore
            const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({ size: ((24)), src: ((member.avatar)), }));
            const __VLS_390 = __VLS_389({ size: ((24)), src: ((member.avatar)), }, ...__VLS_functionalComponentArgsRest(__VLS_389));
            ((member.nickname || member.username)?.charAt(0));
            __VLS_nonNullable(__VLS_393.slots).default;
            var __VLS_393;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("assignee-name") }, });
            (member.nickname || member.username);
            if (member.role === 'admin') {
                const __VLS_394 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ] } */
                // @ts-ignore
                const __VLS_395 = __VLS_asFunctionalComponent(__VLS_394, new __VLS_394({ size: ("small"), type: ("warning"), }));
                const __VLS_396 = __VLS_395({ size: ("small"), type: ("warning"), }, ...__VLS_functionalComponentArgsRest(__VLS_395));
                __VLS_nonNullable(__VLS_399.slots).default;
                var __VLS_399;
            }
            __VLS_nonNullable(__VLS_387.slots).default;
            var __VLS_387;
        }
        __VLS_nonNullable(__VLS_381.slots).default;
        var __VLS_381;
        __VLS_nonNullable(__VLS_375.slots).default;
        var __VLS_375;
        __VLS_nonNullable(__VLS_296.slots).default;
        var __VLS_296;
        if (__VLS_ctx.isEditMode) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-section-bottom") }, });
            const __VLS_400 = __VLS_resolvedLocalAndGlobalComponents.ElTabs;
            /** @type { [typeof __VLS_components.ElTabs, typeof __VLS_components.ElTabs, ] } */
            // @ts-ignore
            const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({ modelValue: ((__VLS_ctx.activeTab)), ...{ class: ("activity-tabs") }, }));
            const __VLS_402 = __VLS_401({ modelValue: ((__VLS_ctx.activeTab)), ...{ class: ("activity-tabs") }, }, ...__VLS_functionalComponentArgsRest(__VLS_401));
            const __VLS_406 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
            /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.ElTabPane, ] } */
            // @ts-ignore
            const __VLS_407 = __VLS_asFunctionalComponent(__VLS_406, new __VLS_406({ name: ("all"), }));
            const __VLS_408 = __VLS_407({ name: ("all"), }, ...__VLS_functionalComponentArgsRest(__VLS_407));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { label: __VLS_thisSlot } = __VLS_nonNullable(__VLS_411.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("tab-label") }, });
                const __VLS_412 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({ icon: ("ri:list-unordered"), }));
                const __VLS_414 = __VLS_413({ icon: ("ri:list-unordered"), }, ...__VLS_functionalComponentArgsRest(__VLS_413));
                if (__VLS_ctx.activities.length > 0) {
                    const __VLS_418 = __VLS_resolvedLocalAndGlobalComponents.ElBadge;
                    /** @type { [typeof __VLS_components.ElBadge, ] } */
                    // @ts-ignore
                    const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({ value: ((__VLS_ctx.activities.length)), max: ((99)), }));
                    const __VLS_420 = __VLS_419({ value: ((__VLS_ctx.activities.length)), max: ((99)), }, ...__VLS_functionalComponentArgsRest(__VLS_419));
                }
            }
            var __VLS_411;
            const __VLS_424 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
            /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.ElTabPane, ] } */
            // @ts-ignore
            const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({ name: ("comments"), }));
            const __VLS_426 = __VLS_425({ name: ("comments"), }, ...__VLS_functionalComponentArgsRest(__VLS_425));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { label: __VLS_thisSlot } = __VLS_nonNullable(__VLS_429.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("tab-label") }, });
                const __VLS_430 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({ icon: ("ri:chat-3-line"), }));
                const __VLS_432 = __VLS_431({ icon: ("ri:chat-3-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_431));
                if (__VLS_ctx.commentList.length > 0) {
                    const __VLS_436 = __VLS_resolvedLocalAndGlobalComponents.ElBadge;
                    /** @type { [typeof __VLS_components.ElBadge, ] } */
                    // @ts-ignore
                    const __VLS_437 = __VLS_asFunctionalComponent(__VLS_436, new __VLS_436({ value: ((__VLS_ctx.commentList.length)), max: ((99)), }));
                    const __VLS_438 = __VLS_437({ value: ((__VLS_ctx.commentList.length)), max: ((99)), }, ...__VLS_functionalComponentArgsRest(__VLS_437));
                }
            }
            var __VLS_429;
            const __VLS_442 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
            /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.ElTabPane, ] } */
            // @ts-ignore
            const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({ name: ("logs"), }));
            const __VLS_444 = __VLS_443({ name: ("logs"), }, ...__VLS_functionalComponentArgsRest(__VLS_443));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { label: __VLS_thisSlot } = __VLS_nonNullable(__VLS_447.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("tab-label") }, });
                const __VLS_448 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_449 = __VLS_asFunctionalComponent(__VLS_448, new __VLS_448({ icon: ("ri:history-line"), }));
                const __VLS_450 = __VLS_449({ icon: ("ri:history-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_449));
                if (__VLS_ctx.logList.length > 0) {
                    const __VLS_454 = __VLS_resolvedLocalAndGlobalComponents.ElBadge;
                    /** @type { [typeof __VLS_components.ElBadge, ] } */
                    // @ts-ignore
                    const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({ value: ((__VLS_ctx.logList.length)), max: ((99)), }));
                    const __VLS_456 = __VLS_455({ value: ((__VLS_ctx.logList.length)), max: ((99)), }, ...__VLS_functionalComponentArgsRest(__VLS_455));
                }
            }
            var __VLS_447;
            __VLS_nonNullable(__VLS_405.slots).default;
            var __VLS_405;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("comment-input") }, });
            const __VLS_460 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
            /** @type { [typeof __VLS_components.ElInput, ] } */
            // @ts-ignore
            const __VLS_461 = __VLS_asFunctionalComponent(__VLS_460, new __VLS_460({ ...{ 'onKeydown': {} }, ...{ 'onKeydown': {} }, modelValue: ((__VLS_ctx.commentContent)), type: ("textarea"), placeholder: ("发表评论... (Ctrl+Enter 发送)"), rows: ((2)), maxlength: ("500"), resize: ("none"), }));
            const __VLS_462 = __VLS_461({ ...{ 'onKeydown': {} }, ...{ 'onKeydown': {} }, modelValue: ((__VLS_ctx.commentContent)), type: ("textarea"), placeholder: ("发表评论... (Ctrl+Enter 发送)"), rows: ((2)), maxlength: ("500"), resize: ("none"), }, ...__VLS_functionalComponentArgsRest(__VLS_461));
            let __VLS_466;
            const __VLS_467 = {
                onKeydown: (__VLS_ctx.handleAddComment)
            };
            const __VLS_468 = {
                onKeydown: (__VLS_ctx.handleAddComment)
            };
            let __VLS_463;
            let __VLS_464;
            var __VLS_465;
            const __VLS_469 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_470 = __VLS_asFunctionalComponent(__VLS_469, new __VLS_469({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.commentLoading)), disabled: ((!__VLS_ctx.commentContent.trim())), }));
            const __VLS_471 = __VLS_470({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.commentLoading)), disabled: ((!__VLS_ctx.commentContent.trim())), }, ...__VLS_functionalComponentArgsRest(__VLS_470));
            let __VLS_475;
            const __VLS_476 = {
                onClick: (__VLS_ctx.handleAddComment)
            };
            let __VLS_472;
            let __VLS_473;
            const __VLS_477 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_478 = __VLS_asFunctionalComponent(__VLS_477, new __VLS_477({ icon: ("ri:send-plane-line"), }));
            const __VLS_479 = __VLS_478({ icon: ("ri:send-plane-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_478));
            __VLS_nonNullable(__VLS_474.slots).default;
            var __VLS_474;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-list-wrapper") }, });
            __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.activityLoading) }, null, null);
            const __VLS_483 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
            /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
            // @ts-ignore
            const __VLS_484 = __VLS_asFunctionalComponent(__VLS_483, new __VLS_483({ height: ("300px"), }));
            const __VLS_485 = __VLS_484({ height: ("300px"), }, ...__VLS_functionalComponentArgsRest(__VLS_484));
            if (__VLS_ctx.currentActivityList.length === 0 && !__VLS_ctx.activityLoading) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-activity") }, });
                const __VLS_489 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_490 = __VLS_asFunctionalComponent(__VLS_489, new __VLS_489({ icon: ("ri:file-list-3-line"), }));
                const __VLS_491 = __VLS_490({ icon: ("ri:file-list-3-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_490));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.emptyText);
            }
            else {
                const __VLS_495 = __VLS_resolvedLocalAndGlobalComponents.ElTimeline;
                /** @type { [typeof __VLS_components.ElTimeline, typeof __VLS_components.ElTimeline, ] } */
                // @ts-ignore
                const __VLS_496 = __VLS_asFunctionalComponent(__VLS_495, new __VLS_495({ ...{ class: ("compact-timeline") }, }));
                const __VLS_497 = __VLS_496({ ...{ class: ("compact-timeline") }, }, ...__VLS_functionalComponentArgsRest(__VLS_496));
                for (const [activity] of __VLS_getVForSourceType((__VLS_ctx.currentActivityList))) {
                    const __VLS_501 = __VLS_resolvedLocalAndGlobalComponents.ElTimelineItem;
                    /** @type { [typeof __VLS_components.ElTimelineItem, typeof __VLS_components.ElTimelineItem, ] } */
                    // @ts-ignore
                    const __VLS_502 = __VLS_asFunctionalComponent(__VLS_501, new __VLS_501({ key: ((`${activity.type}-${activity.id}`)), type: ((__VLS_ctx.getTimelineType(activity))), hollow: ((activity.type === 'log')), size: ((activity.type === 'log' ? 'normal' : 'large')), }));
                    const __VLS_503 = __VLS_502({ key: ((`${activity.type}-${activity.id}`)), type: ((__VLS_ctx.getTimelineType(activity))), hollow: ((activity.type === 'log')), size: ((activity.type === 'log' ? 'normal' : 'large')), }, ...__VLS_functionalComponentArgsRest(__VLS_502));
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("activity-item") }, ...{ class: ((activity.type)) }, });
                    if (activity.type === 'comment') {
                        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("comment-header") }, });
                        const __VLS_507 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
                        /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.ElAvatar, ] } */
                        // @ts-ignore
                        const __VLS_508 = __VLS_asFunctionalComponent(__VLS_507, new __VLS_507({ size: ((24)), src: ((activity.avatar)), }));
                        const __VLS_509 = __VLS_508({ size: ((24)), src: ((activity.avatar)), }, ...__VLS_functionalComponentArgsRest(__VLS_508));
                        (activity.nickname?.charAt(0) || activity.username?.charAt(0));
                        __VLS_nonNullable(__VLS_512.slots).default;
                        var __VLS_512;
                        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("user-name") }, });
                        (activity.nickname || activity.username);
                        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("activity-time") }, });
                        (__VLS_ctx.formatTime(activity.createdAt));
                        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("comment-body") }, });
                        (activity.content);
                    }
                    else {
                        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("log-item") }, });
                        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("log-user") }, });
                        (activity.nickname || activity.username);
                        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("log-text") }, });
                        (activity.content);
                        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("log-time") }, });
                        (__VLS_ctx.formatTime(activity.createdAt));
                    }
                    __VLS_nonNullable(__VLS_506.slots).default;
                    var __VLS_506;
                }
                __VLS_nonNullable(__VLS_500.slots).default;
                var __VLS_500;
            }
            __VLS_nonNullable(__VLS_488.slots).default;
            var __VLS_488;
        }
        __VLS_nonNullable(__VLS_290.slots).default;
        var __VLS_290;
        if (__VLS_ctx.isEditMode) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-section-right") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subtask-title") }, });
            const __VLS_513 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_514 = __VLS_asFunctionalComponent(__VLS_513, new __VLS_513({ icon: ("ri:checkbox-multiple-line"), }));
            const __VLS_515 = __VLS_514({ icon: ("ri:checkbox-multiple-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_514));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subtask-progress-text") }, });
            (__VLS_ctx.subTaskCompletedCount);
            (__VLS_ctx.subTasks.length);
            if (__VLS_ctx.subTasks.length > 0) {
                const __VLS_519 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
                /** @type { [typeof __VLS_components.ElProgress, ] } */
                // @ts-ignore
                const __VLS_520 = __VLS_asFunctionalComponent(__VLS_519, new __VLS_519({ percentage: ((__VLS_ctx.subTaskProgress)), strokeWidth: ((8)), showText: ((false)), ...{ class: ("subtask-progress-bar") }, }));
                const __VLS_521 = __VLS_520({ percentage: ((__VLS_ctx.subTaskProgress)), strokeWidth: ((8)), showText: ((false)), ...{ class: ("subtask-progress-bar") }, }, ...__VLS_functionalComponentArgsRest(__VLS_520));
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-list") }, });
            __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.subTasksLoading) }, null, null);
            const __VLS_525 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
            /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
            // @ts-ignore
            const __VLS_526 = __VLS_asFunctionalComponent(__VLS_525, new __VLS_525({ height: ("400px"), }));
            const __VLS_527 = __VLS_526({ height: ("400px"), }, ...__VLS_functionalComponentArgsRest(__VLS_526));
            for (const [subTask] of __VLS_getVForSourceType((__VLS_ctx.subTasks))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((subTask.id)), ...{ class: ("subtask-item") }, ...{ class: (({
                            'status-pending': subTask.status === 0,
                            'status-progress': subTask.status === 2,
                            'status-completed': subTask.status === 1
                        })) }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-main") }, });
                const __VLS_531 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
                /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
                // @ts-ignore
                const __VLS_532 = __VLS_asFunctionalComponent(__VLS_531, new __VLS_531({ ...{ 'onChange': {} }, modelValue: ((subTask.status)), ...{ class: ("subtask-status-select") }, size: ("small"), }));
                const __VLS_533 = __VLS_532({ ...{ 'onChange': {} }, modelValue: ((subTask.status)), ...{ class: ("subtask-status-select") }, size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_532));
                let __VLS_537;
                const __VLS_538 = {
                    onChange: ((val) => __VLS_ctx.handleChangeSubTaskStatus(subTask, Number(val)))
                };
                let __VLS_534;
                let __VLS_535;
                const __VLS_539 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
                /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
                // @ts-ignore
                const __VLS_540 = __VLS_asFunctionalComponent(__VLS_539, new __VLS_539({ value: ((0)), label: ("未开始"), }));
                const __VLS_541 = __VLS_540({ value: ((0)), label: ("未开始"), }, ...__VLS_functionalComponentArgsRest(__VLS_540));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-pending") }, });
                __VLS_nonNullable(__VLS_544.slots).default;
                var __VLS_544;
                const __VLS_545 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
                /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
                // @ts-ignore
                const __VLS_546 = __VLS_asFunctionalComponent(__VLS_545, new __VLS_545({ value: ((2)), label: ("处理中"), }));
                const __VLS_547 = __VLS_546({ value: ((2)), label: ("处理中"), }, ...__VLS_functionalComponentArgsRest(__VLS_546));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-progress") }, });
                __VLS_nonNullable(__VLS_550.slots).default;
                var __VLS_550;
                const __VLS_551 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
                /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
                // @ts-ignore
                const __VLS_552 = __VLS_asFunctionalComponent(__VLS_551, new __VLS_551({ value: ((1)), label: ("已完成"), }));
                const __VLS_553 = __VLS_552({ value: ((1)), label: ("已完成"), }, ...__VLS_functionalComponentArgsRest(__VLS_552));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-option") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-dot status-completed") }, });
                __VLS_nonNullable(__VLS_556.slots).default;
                var __VLS_556;
                __VLS_nonNullable(__VLS_536.slots).default;
                var __VLS_536;
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subtask-content") }, ...{ class: (({ 'line-through': subTask.status === 1 })) }, });
                (subTask.content);
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-meta") }, });
                if (subTask.dueTime) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-due-time") }, });
                    const __VLS_557 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                    // @ts-ignore
                    const __VLS_558 = __VLS_asFunctionalComponent(__VLS_557, new __VLS_557({ icon: ("ri:time-line"), }));
                    const __VLS_559 = __VLS_558({ icon: ("ri:time-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_558));
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: (({ overdue: __VLS_ctx.isSubTaskOverdue(subTask) })) }, });
                    (__VLS_ctx.formatSubTaskDueTime(subTask.dueTime));
                }
                const __VLS_563 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                /** @type { [typeof __VLS_components.ElButton, ] } */
                // @ts-ignore
                const __VLS_564 = __VLS_asFunctionalComponent(__VLS_563, new __VLS_563({ ...{ 'onClick': {} }, ...{ class: ("subtask-due-time-btn") }, icon: ((__VLS_ctx.Edit)), size: ("small"), text: (true), type: ("primary"), }));
                const __VLS_565 = __VLS_564({ ...{ 'onClick': {} }, ...{ class: ("subtask-due-time-btn") }, icon: ((__VLS_ctx.Edit)), size: ("small"), text: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_564));
                let __VLS_569;
                const __VLS_570 = {
                    onClick: (...[$event]) => {
                        if (!(!((__VLS_ctx.isMobile && __VLS_ctx.isEditMode))))
                            return;
                        if (!((__VLS_ctx.isEditMode)))
                            return;
                        __VLS_ctx.handleEditSubTaskDueTime(subTask);
                    }
                };
                let __VLS_566;
                let __VLS_567;
                var __VLS_568;
                const __VLS_571 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                /** @type { [typeof __VLS_components.ElButton, ] } */
                // @ts-ignore
                const __VLS_572 = __VLS_asFunctionalComponent(__VLS_571, new __VLS_571({ ...{ 'onClick': {} }, ...{ class: ("subtask-delete-btn") }, icon: ((__VLS_ctx.Delete)), size: ("small"), text: (true), type: ("danger"), }));
                const __VLS_573 = __VLS_572({ ...{ 'onClick': {} }, ...{ class: ("subtask-delete-btn") }, icon: ((__VLS_ctx.Delete)), size: ("small"), text: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_572));
                let __VLS_577;
                const __VLS_578 = {
                    onClick: (...[$event]) => {
                        if (!(!((__VLS_ctx.isMobile && __VLS_ctx.isEditMode))))
                            return;
                        if (!((__VLS_ctx.isEditMode)))
                            return;
                        __VLS_ctx.handleDeleteSubTask(subTask);
                    }
                };
                let __VLS_574;
                let __VLS_575;
                var __VLS_576;
            }
            if (__VLS_ctx.subTasks.length === 0 && !__VLS_ctx.subTasksLoading) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-empty") }, });
            }
            __VLS_nonNullable(__VLS_530.slots).default;
            var __VLS_530;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subtask-add") }, });
            const __VLS_579 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
            /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
            // @ts-ignore
            const __VLS_580 = __VLS_asFunctionalComponent(__VLS_579, new __VLS_579({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.newSubTaskContent)), placeholder: ("添加子任务..."), size: ("small"), disabled: ((__VLS_ctx.addingSubTask)), }));
            const __VLS_581 = __VLS_580({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.newSubTaskContent)), placeholder: ("添加子任务..."), size: ("small"), disabled: ((__VLS_ctx.addingSubTask)), }, ...__VLS_functionalComponentArgsRest(__VLS_580));
            let __VLS_585;
            const __VLS_586 = {
                onKeyup: (__VLS_ctx.handleAddSubTask)
            };
            let __VLS_582;
            let __VLS_583;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { prefix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_584.slots);
                const __VLS_587 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_588 = __VLS_asFunctionalComponent(__VLS_587, new __VLS_587({ icon: ("ri:add-line"), }));
                const __VLS_589 = __VLS_588({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_588));
            }
            var __VLS_584;
            const __VLS_593 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_594 = __VLS_asFunctionalComponent(__VLS_593, new __VLS_593({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.addingSubTask)), disabled: ((!__VLS_ctx.newSubTaskContent.trim())), }));
            const __VLS_595 = __VLS_594({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), loading: ((__VLS_ctx.addingSubTask)), disabled: ((!__VLS_ctx.newSubTaskContent.trim())), }, ...__VLS_functionalComponentArgsRest(__VLS_594));
            let __VLS_599;
            const __VLS_600 = {
                onClick: (__VLS_ctx.handleAddSubTask)
            };
            let __VLS_596;
            let __VLS_597;
            __VLS_nonNullable(__VLS_598.slots).default;
            var __VLS_598;
        }
    }
    const __VLS_601 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_602 = __VLS_asFunctionalComponent(__VLS_601, new __VLS_601({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.subTaskDueTimeDialogVisible)), title: ("设置截止时间"), width: ("400px"), }));
    const __VLS_603 = __VLS_602({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.subTaskDueTimeDialogVisible)), title: ("设置截止时间"), width: ("400px"), }, ...__VLS_functionalComponentArgsRest(__VLS_602));
    let __VLS_607;
    const __VLS_608 = {
        onClose: (...[$event]) => {
            __VLS_ctx.subTaskDueTimeValue = '';
        }
    };
    let __VLS_604;
    let __VLS_605;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_609 = __VLS_resolvedLocalAndGlobalComponents.ElDatePicker;
    /** @type { [typeof __VLS_components.ElDatePicker, ] } */
    // @ts-ignore
    const __VLS_610 = __VLS_asFunctionalComponent(__VLS_609, new __VLS_609({ modelValue: ((__VLS_ctx.subTaskDueTimeValue)), type: ("datetime"), placeholder: ("选择截止时间（留空则清除）"), format: ("YYYY-MM-DD HH:mm"), valueFormat: ("YYYY-MM-DDTHH:mm:ss"), ...{ style: ({}) }, clearable: (true), }));
    const __VLS_611 = __VLS_610({ modelValue: ((__VLS_ctx.subTaskDueTimeValue)), type: ("datetime"), placeholder: ("选择截止时间（留空则清除）"), format: ("YYYY-MM-DD HH:mm"), valueFormat: ("YYYY-MM-DDTHH:mm:ss"), ...{ style: ({}) }, clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_610));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_606.slots);
        const __VLS_615 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_616 = __VLS_asFunctionalComponent(__VLS_615, new __VLS_615({ ...{ 'onClick': {} }, }));
        const __VLS_617 = __VLS_616({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_616));
        let __VLS_621;
        const __VLS_622 = {
            onClick: (...[$event]) => {
                __VLS_ctx.subTaskDueTimeDialogVisible = false;
            }
        };
        let __VLS_618;
        let __VLS_619;
        __VLS_nonNullable(__VLS_620.slots).default;
        var __VLS_620;
        const __VLS_623 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_624 = __VLS_asFunctionalComponent(__VLS_623, new __VLS_623({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_625 = __VLS_624({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_624));
        let __VLS_629;
        const __VLS_630 = {
            onClick: (__VLS_ctx.handleSaveSubTaskDueTime)
        };
        let __VLS_626;
        let __VLS_627;
        __VLS_nonNullable(__VLS_628.slots).default;
        var __VLS_628;
    }
    var __VLS_606;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        if (__VLS_ctx.isEditMode) {
            const __VLS_631 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_632 = __VLS_asFunctionalComponent(__VLS_631, new __VLS_631({ ...{ 'onClick': {} }, type: ("danger"), plain: (true), loading: ((__VLS_ctx.deleteLoading)), }));
            const __VLS_633 = __VLS_632({ ...{ 'onClick': {} }, type: ("danger"), plain: (true), loading: ((__VLS_ctx.deleteLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_632));
            let __VLS_637;
            const __VLS_638 = {
                onClick: (__VLS_ctx.handleDelete)
            };
            let __VLS_634;
            let __VLS_635;
            const __VLS_639 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_640 = __VLS_asFunctionalComponent(__VLS_639, new __VLS_639({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }));
            const __VLS_641 = __VLS_640({ icon: ("ri:delete-bin-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_640));
            __VLS_nonNullable(__VLS_636.slots).default;
            var __VLS_636;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("footer-right") }, });
        const __VLS_645 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_646 = __VLS_asFunctionalComponent(__VLS_645, new __VLS_645({ ...{ 'onClick': {} }, }));
        const __VLS_647 = __VLS_646({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_646));
        let __VLS_651;
        const __VLS_652 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_648;
        let __VLS_649;
        __VLS_nonNullable(__VLS_650.slots).default;
        var __VLS_650;
        if (!__VLS_ctx.isEditMode) {
            const __VLS_653 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_654 = __VLS_asFunctionalComponent(__VLS_653, new __VLS_653({ ...{ 'onClick': {} }, type: ("success"), loading: ((__VLS_ctx.submitContinueLoading)), }));
            const __VLS_655 = __VLS_654({ ...{ 'onClick': {} }, type: ("success"), loading: ((__VLS_ctx.submitContinueLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_654));
            let __VLS_659;
            const __VLS_660 = {
                onClick: (__VLS_ctx.handleSubmitAndContinue)
            };
            let __VLS_656;
            let __VLS_657;
            const __VLS_661 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_662 = __VLS_asFunctionalComponent(__VLS_661, new __VLS_661({ icon: ("ri:add-circle-line"), ...{ class: ("mr-1") }, }));
            const __VLS_663 = __VLS_662({ icon: ("ri:add-circle-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_662));
            __VLS_nonNullable(__VLS_658.slots).default;
            var __VLS_658;
        }
        const __VLS_667 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_668 = __VLS_asFunctionalComponent(__VLS_667, new __VLS_667({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_669 = __VLS_668({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_668));
        let __VLS_673;
        const __VLS_674 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_670;
        let __VLS_671;
        (__VLS_ctx.isEditMode ? '保存' : '创建');
        __VLS_nonNullable(__VLS_672.slots).default;
        var __VLS_672;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['task-detail-dialog'];
    __VLS_styleScopedClasses['mobile-dialog-content'];
    __VLS_styleScopedClasses['mobile-tabs'];
    __VLS_styleScopedClasses['mobile-form-wrapper'];
    __VLS_styleScopedClasses['priority-option'];
    __VLS_styleScopedClasses['priority-dot'];
    __VLS_styleScopedClasses['assignee-option'];
    __VLS_styleScopedClasses['assignee-name'];
    __VLS_styleScopedClasses['subtask-section'];
    __VLS_styleScopedClasses['subtask-header'];
    __VLS_styleScopedClasses['subtask-title'];
    __VLS_styleScopedClasses['subtask-progress-text'];
    __VLS_styleScopedClasses['subtask-progress-bar'];
    __VLS_styleScopedClasses['subtask-list'];
    __VLS_styleScopedClasses['subtask-item'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['subtask-status-select'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['subtask-content'];
    __VLS_styleScopedClasses['line-through'];
    __VLS_styleScopedClasses['subtask-delete-btn'];
    __VLS_styleScopedClasses['subtask-empty'];
    __VLS_styleScopedClasses['subtask-add'];
    __VLS_styleScopedClasses['mobile-activity-wrapper'];
    __VLS_styleScopedClasses['comment-input'];
    __VLS_styleScopedClasses['mobile'];
    __VLS_styleScopedClasses['activity-filter'];
    __VLS_styleScopedClasses['activity-list-wrapper'];
    __VLS_styleScopedClasses['empty-activity'];
    __VLS_styleScopedClasses['compact-timeline'];
    __VLS_styleScopedClasses['activity-item'];
    __VLS_styleScopedClasses['comment-header'];
    __VLS_styleScopedClasses['user-name'];
    __VLS_styleScopedClasses['activity-time'];
    __VLS_styleScopedClasses['comment-body'];
    __VLS_styleScopedClasses['log-item'];
    __VLS_styleScopedClasses['log-user'];
    __VLS_styleScopedClasses['log-text'];
    __VLS_styleScopedClasses['log-time'];
    __VLS_styleScopedClasses['dialog-content'];
    __VLS_styleScopedClasses['two-column'];
    __VLS_styleScopedClasses['form-section'];
    __VLS_styleScopedClasses['form-inner'];
    __VLS_styleScopedClasses['priority-option'];
    __VLS_styleScopedClasses['priority-dot'];
    __VLS_styleScopedClasses['assignee-option'];
    __VLS_styleScopedClasses['assignee-name'];
    __VLS_styleScopedClasses['activity-section-bottom'];
    __VLS_styleScopedClasses['activity-tabs'];
    __VLS_styleScopedClasses['tab-label'];
    __VLS_styleScopedClasses['tab-label'];
    __VLS_styleScopedClasses['tab-label'];
    __VLS_styleScopedClasses['comment-input'];
    __VLS_styleScopedClasses['activity-list-wrapper'];
    __VLS_styleScopedClasses['empty-activity'];
    __VLS_styleScopedClasses['compact-timeline'];
    __VLS_styleScopedClasses['activity-item'];
    __VLS_styleScopedClasses['comment-header'];
    __VLS_styleScopedClasses['user-name'];
    __VLS_styleScopedClasses['activity-time'];
    __VLS_styleScopedClasses['comment-body'];
    __VLS_styleScopedClasses['log-item'];
    __VLS_styleScopedClasses['log-user'];
    __VLS_styleScopedClasses['log-text'];
    __VLS_styleScopedClasses['log-time'];
    __VLS_styleScopedClasses['subtask-section-right'];
    __VLS_styleScopedClasses['subtask-header'];
    __VLS_styleScopedClasses['subtask-title'];
    __VLS_styleScopedClasses['subtask-progress-text'];
    __VLS_styleScopedClasses['subtask-progress-bar'];
    __VLS_styleScopedClasses['subtask-list'];
    __VLS_styleScopedClasses['subtask-item'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['subtask-main'];
    __VLS_styleScopedClasses['subtask-status-select'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-pending'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-progress'];
    __VLS_styleScopedClasses['status-option'];
    __VLS_styleScopedClasses['status-dot'];
    __VLS_styleScopedClasses['status-completed'];
    __VLS_styleScopedClasses['subtask-content'];
    __VLS_styleScopedClasses['line-through'];
    __VLS_styleScopedClasses['subtask-meta'];
    __VLS_styleScopedClasses['subtask-due-time'];
    __VLS_styleScopedClasses['overdue'];
    __VLS_styleScopedClasses['subtask-due-time-btn'];
    __VLS_styleScopedClasses['subtask-delete-btn'];
    __VLS_styleScopedClasses['subtask-empty'];
    __VLS_styleScopedClasses['subtask-add'];
    __VLS_styleScopedClasses['dialog-footer'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['footer-right'];
    __VLS_styleScopedClasses['mr-1'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_297,
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
            Delete: Delete,
            Edit: Edit,
            visible: visible,
            isMobile: isMobile,
            mobileActiveTab: mobileActiveTab,
            dialogWidth: dialogWidth,
            formRef: formRef,
            isEditMode: isEditMode,
            submitLoading: submitLoading,
            submitContinueLoading: submitContinueLoading,
            deleteLoading: deleteLoading,
            taskForm: taskForm,
            projectMembers: projectMembers,
            membersLoading: membersLoading,
            activities: activities,
            activityLoading: activityLoading,
            commentContent: commentContent,
            commentLoading: commentLoading,
            activeTab: activeTab,
            subTasks: subTasks,
            subTasksLoading: subTasksLoading,
            newSubTaskContent: newSubTaskContent,
            addingSubTask: addingSubTask,
            subTaskDueTimeDialogVisible: subTaskDueTimeDialogVisible,
            subTaskDueTimeValue: subTaskDueTimeValue,
            commentList: commentList,
            logList: logList,
            currentActivityList: currentActivityList,
            emptyText: emptyText,
            subTaskProgress: subTaskProgress,
            subTaskCompletedCount: subTaskCompletedCount,
            formRules: formRules,
            priorityOptions: priorityOptions,
            onDialogOpen: onDialogOpen,
            onDialogClose: onDialogClose,
            handleAddSubTask: handleAddSubTask,
            handleChangeSubTaskStatus: handleChangeSubTaskStatus,
            handleDeleteSubTask: handleDeleteSubTask,
            handleEditSubTaskDueTime: handleEditSubTaskDueTime,
            handleSaveSubTaskDueTime: handleSaveSubTaskDueTime,
            formatSubTaskDueTime: formatSubTaskDueTime,
            isSubTaskOverdue: isSubTaskOverdue,
            handleAddComment: handleAddComment,
            handleSubmit: handleSubmit,
            handleSubmitAndContinue: handleSubmitAndContinue,
            handleDelete: handleDelete,
            getPriorityClass: getPriorityClass,
            getTimelineType: getTimelineType,
            formatTime: formatTime,
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
//# sourceMappingURL=TaskDetailDialog.vue.js.map