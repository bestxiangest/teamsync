/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMediaQuery } from '@vueuse/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchProjectList, deleteProject, archiveProject, unarchiveProject, fetchGroupList, deleteGroup } from '@/api/project';
import { quitProject } from '@/api/member';
import { useUserStore } from '@/store/modules/user';
// 子模块导入
import ProjectTable from './modules/ProjectTable.vue';
import ProjectCards from './modules/ProjectCards.vue';
import GroupGrid from './modules/GroupGrid.vue';
import ProjectDialog from './modules/ProjectDialog.vue';
import GroupDialog from './modules/GroupDialog.vue';
import MoveProjectDialog from './modules/MoveProjectDialog.vue';
import MobileActionSheet from './modules/MobileActionSheet.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ProjectList' });
const router = useRouter();
const userStore = useUserStore();
const isMobile = useMediaQuery('(max-width: 768px)');
// 状态变量
const loading = ref(false);
const projectList = ref([]);
const groupList = ref([]);
const allGroups = ref([]);
const activeTab = ref('active');
const currentGroupId = ref(0);
const breadcrumbs = ref([]);
const showAllProjects = ref(false); // 是否显示全部项目（无视分组）
// 搜索相关
const showSearch = ref(false);
const searchQuery = ref('');
// 弹窗可见性
const projectDialogVisible = ref(false);
const groupDialogVisible = ref(false);
const moveDialogVisible = ref(false);
const mobileAddVisible = ref(false);
const mobileMoreVisible = ref(false);
// 当前操作的对象
const editingProject = ref(null);
const movingProject = ref(null);
const currentMobileProject = ref(null);
// 计算过滤后的项目列表
const filteredProjectList = computed(() => {
    if (!searchQuery.value)
        return projectList.value;
    const query = searchQuery.value.toLowerCase();
    return projectList.value.filter((p) => p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)));
});
/**
 * 获取数据列表
 */
const getProjectList = async () => {
    loading.value = true;
    try {
        const archived = activeTab.value === 'archived';
        // 如果是全部模式，不传 groupId，后端会返回所有项目
        const queryGroupId = showAllProjects.value ? undefined : (archived ? undefined : currentGroupId.value);
        const projects = await fetchProjectList(archived, queryGroupId);
        projectList.value = projects || [];
        // 获取分组列表
        if (allGroups.value.length === 0) {
            const groups = await fetchGroupList();
            allGroups.value = groups || [];
        }
        if (!archived && currentGroupId.value === 0 && !showAllProjects.value) {
            const groups = await fetchGroupList();
            groupList.value = groups || [];
        }
    }
    catch (error) {
        console.error('获取列表失败:', error);
    }
    finally {
        loading.value = false;
    }
};
/**
 * 切换全部项目视图
 */
const toggleShowAll = () => {
    showAllProjects.value = !showAllProjects.value;
    if (showAllProjects.value) {
        // 进入全部模式，重置分组状态
        currentGroupId.value = 0;
        breadcrumbs.value = [];
    }
    getProjectList();
};
/**
 * 切换 Tab
 */
const handleTabChange = (tab) => {
    activeTab.value = tab;
    currentGroupId.value = 0;
    breadcrumbs.value = [];
    showAllProjects.value = false; // 切换 Tab 时重置全部视图
    getProjectList();
};
/**
 * 进入分组
 */
const handleEnterGroup = (group) => {
    currentGroupId.value = group.id;
    breadcrumbs.value = [{ id: group.id, name: group.name }];
    getProjectList();
};
/**
 * 点击面包屑
 */
const handleBreadcrumbClick = (item) => {
    currentGroupId.value = 0;
    breadcrumbs.value = [];
    getProjectList();
};
/**
 * 打开新建项目弹窗
 */
const openCreateDialog = () => {
    editingProject.value = null;
    projectDialogVisible.value = true;
};
/**
 * 查看项目
 */
const viewProject = (row) => {
    router.push({
        name: 'KanbanBoard',
        params: { projectId: row.id },
        query: { name: row.name }
    });
};
/**
 * 查看看板文档
 */
const viewFiles = (row) => {
    router.push({
        name: 'ProjectFiles',
        params: { projectId: row.id },
        query: { name: row.name }
    });
};
/**
 * 处理操作命令
 */
const handleCommand = (command, row) => {
    switch (command) {
        case 'edit':
            editingProject.value = row;
            projectDialogVisible.value = true;
            break;
        case 'move':
            movingProject.value = row;
            moveDialogVisible.value = true;
            break;
        case 'archive':
            confirmArchive(row);
            break;
        case 'unarchive':
            handleUnarchive(row);
            break;
        case 'delete':
            confirmDelete(row);
            break;
        case 'quit':
            confirmQuit(row);
            break;
    }
};
// 确认操作
const confirmArchive = (row) => {
    ElMessageBox.confirm('归档后项目将移入归档箱。确定归档吗？', '归档项目', {
        type: 'warning'
    }).then(() => handleArchive(row));
};
const confirmDelete = (row) => {
    ElMessageBox.confirm('确定删除该项目吗？删除后不可恢复！', '删除项目', {
        type: 'error'
    }).then(() => handleDelete(row));
};
const confirmQuit = (row) => {
    ElMessageBox.confirm('确定要退出该项目吗？', '退出项目', {
        type: 'warning'
    }).then(() => handleQuit(row));
};
/**
 * API 调用
 */
const handleArchive = async (row) => {
    try {
        await archiveProject(row.id);
        ElMessage.success('项目已归档');
        getProjectList();
    }
    catch (error) { }
};
const handleUnarchive = async (row) => {
    try {
        await unarchiveProject(row.id);
        ElMessage.success('项目已还原');
        getProjectList();
    }
    catch (error) { }
};
const handleDelete = async (row) => {
    try {
        await deleteProject(row.id);
        ElMessage.success('项目删除成功');
        getProjectList();
    }
    catch (error) { }
};
const handleQuit = async (row) => {
    try {
        await quitProject(row.id);
        ElMessage.success('已退出项目');
        getProjectList();
    }
    catch (error) { }
};
const handleDeleteGroup = async (group) => {
    try {
        await deleteGroup(group.id);
        ElMessage.success('分组删除成功');
        getProjectList();
    }
    catch (error) { }
};
/**
 * 移动端特定逻辑
 */
const openMobileProjectMenu = (project) => {
    currentMobileProject.value = project;
    mobileMoreVisible.value = true;
};
const handleMobileAddAction = (type) => {
    mobileAddVisible.value = false;
    if (type === 'project')
        openCreateDialog();
    else
        groupDialogVisible.value = true;
};
const handleMobileProjectAction = (cmd) => {
    mobileMoreVisible.value = false;
    if (currentMobileProject.value) {
        handleCommand(cmd, currentMobileProject.value);
    }
};
onMounted(getProjectList); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['el-card__body'];
    __VLS_styleScopedClasses['project-page'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-page art-full-height") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("art-table-card") }, shadow: ("never"), }));
    const __VLS_2 = __VLS_1({ ...{ class: ("art-table-card") }, shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    if (!__VLS_ctx.isMobile) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("table-header") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left-panel") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("title") }, });
        if (__VLS_ctx.activeTab === 'active') {
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, type: ((__VLS_ctx.showAllProjects ? 'primary' : 'default')), size: ("small"), ...{ class: ("ml-4") }, }));
            const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, type: ((__VLS_ctx.showAllProjects ? 'primary' : 'default')), size: ("small"), ...{ class: ("ml-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            let __VLS_12;
            const __VLS_13 = {
                onClick: (__VLS_ctx.toggleShowAll)
            };
            let __VLS_9;
            let __VLS_10;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_11.slots);
                const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ icon: ((__VLS_ctx.showAllProjects ? 'ri:layout-grid-line' : 'ri:list-check')), }));
                const __VLS_16 = __VLS_15({ icon: ((__VLS_ctx.showAllProjects ? 'ri:layout-grid-line' : 'ri:list-check')), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            }
            (__VLS_ctx.showAllProjects ? '分组视图' : '全部项目');
            var __VLS_11;
        }
        if (__VLS_ctx.currentGroupId > 0 && !__VLS_ctx.showAllProjects) {
            const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElBreadcrumb;
            /** @type { [typeof __VLS_components.ElBreadcrumb, typeof __VLS_components.ElBreadcrumb, ] } */
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ separator: ("/"), ...{ class: ("ml-4") }, }));
            const __VLS_22 = __VLS_21({ separator: ("/"), ...{ class: ("ml-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElBreadcrumbItem;
            /** @type { [typeof __VLS_components.ElBreadcrumbItem, typeof __VLS_components.ElBreadcrumbItem, ] } */
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
            const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
            __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({ ...{ onClick: (...[$event]) => {
                        if (!((!__VLS_ctx.isMobile)))
                            return;
                        if (!((__VLS_ctx.currentGroupId > 0 && !__VLS_ctx.showAllProjects)))
                            return;
                        __VLS_ctx.handleBreadcrumbClick(null);
                    } }, ...{ class: ("breadcrumb-link") }, });
            __VLS_nonNullable(__VLS_31.slots).default;
            var __VLS_31;
            for (const [item] of __VLS_getVForSourceType((__VLS_ctx.breadcrumbs))) {
                const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElBreadcrumbItem;
                /** @type { [typeof __VLS_components.ElBreadcrumbItem, typeof __VLS_components.ElBreadcrumbItem, ] } */
                // @ts-ignore
                const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ key: ((item.id)), }));
                const __VLS_34 = __VLS_33({ key: ((item.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
                (item.name);
                __VLS_nonNullable(__VLS_37.slots).default;
                var __VLS_37;
            }
            __VLS_nonNullable(__VLS_25.slots).default;
            var __VLS_25;
        }
        if (__VLS_ctx.showAllProjects) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-4 text-sm text-gray-500") }, });
            (__VLS_ctx.filteredProjectList.length);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("actions") }, });
        if (__VLS_ctx.currentGroupId === 0 && __VLS_ctx.activeTab === 'active' && !__VLS_ctx.showAllProjects) {
            const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
            // @ts-ignore
            const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ ...{ 'onClick': {} }, }));
            const __VLS_40 = __VLS_39({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_39));
            let __VLS_44;
            const __VLS_45 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isMobile)))
                        return;
                    if (!((__VLS_ctx.currentGroupId === 0 && __VLS_ctx.activeTab === 'active' && !__VLS_ctx.showAllProjects)))
                        return;
                    __VLS_ctx.groupDialogVisible = true;
                }
            };
            let __VLS_41;
            let __VLS_42;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_43.slots);
                const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
                /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
                // @ts-ignore
                const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ icon: ("ri:folder-add-line"), }));
                const __VLS_48 = __VLS_47({ icon: ("ri:folder-add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            }
            var __VLS_43;
        }
        const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_54 = __VLS_53({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_58;
        const __VLS_59 = {
            onClick: (__VLS_ctx.openCreateDialog)
        };
        let __VLS_55;
        let __VLS_56;
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_57.slots);
            const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ icon: ("ri:add-line"), }));
            const __VLS_62 = __VLS_61({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        }
        var __VLS_57;
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-toolbar") }, });
        if (__VLS_ctx.currentGroupId > 0 && !__VLS_ctx.showAllProjects) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-group-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!(!((!__VLS_ctx.isMobile))))
                            return;
                        if (!((__VLS_ctx.currentGroupId > 0 && !__VLS_ctx.showAllProjects)))
                            return;
                        __VLS_ctx.handleBreadcrumbClick(null);
                    } }, ...{ class: ("back-btn") }, });
            const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ icon: ("ri:arrow-left-s-line"), }));
            const __VLS_68 = __VLS_67({ icon: ("ri:arrow-left-s-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_67));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("group-title") }, });
            (__VLS_ctx.breadcrumbs[0]?.name);
        }
        else if (__VLS_ctx.showAllProjects) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-group-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleShowAll) }, ...{ class: ("back-btn") }, });
            const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ icon: ("ri:arrow-left-s-line"), }));
            const __VLS_74 = __VLS_73({ icon: ("ri:arrow-left-s-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("group-title") }, });
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-tabs") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!(!((!__VLS_ctx.isMobile))))
                            return;
                        if (!(!((__VLS_ctx.currentGroupId > 0 && !__VLS_ctx.showAllProjects))))
                            return;
                        if (!(!((__VLS_ctx.showAllProjects))))
                            return;
                        __VLS_ctx.handleTabChange('active');
                    } }, ...{ class: ("mobile-tab-item") }, ...{ class: (({ active: __VLS_ctx.activeTab === 'active' })) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                        if (!(!((!__VLS_ctx.isMobile))))
                            return;
                        if (!(!((__VLS_ctx.currentGroupId > 0 && !__VLS_ctx.showAllProjects))))
                            return;
                        if (!(!((__VLS_ctx.showAllProjects))))
                            return;
                        __VLS_ctx.handleTabChange('archived');
                    } }, ...{ class: ("mobile-tab-item") }, ...{ class: (({ active: __VLS_ctx.activeTab === 'archived' })) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleShowAll) }, ...{ class: ("mobile-tab-item all-btn") }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-actions") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.isMobile))))
                        return;
                    __VLS_ctx.showSearch = !__VLS_ctx.showSearch;
                } }, ...{ class: ("icon-btn") }, });
        const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ icon: ("ri:search-line"), }));
        const __VLS_80 = __VLS_79({ icon: ("ri:search-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.isMobile))))
                        return;
                    __VLS_ctx.mobileAddVisible = true;
                } }, ...{ class: ("icon-btn") }, });
        const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ icon: ("ri:add-line"), }));
        const __VLS_86 = __VLS_85({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    }
    if (__VLS_ctx.isMobile && __VLS_ctx.showSearch) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mobile-search-bar") }, });
        const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ modelValue: ((__VLS_ctx.searchQuery)), placeholder: ("搜索项目..."), clearable: (true), }));
        const __VLS_92 = __VLS_91({ modelValue: ((__VLS_ctx.searchQuery)), placeholder: ("搜索项目..."), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { prefix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_95.slots);
            const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({ icon: ("ri:search-line"), }));
            const __VLS_98 = __VLS_97({ icon: ("ri:search-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        }
        var __VLS_95;
    }
    if (!__VLS_ctx.isMobile) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("archive-tabs") }, });
        const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
        /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.ElRadioGroup, ] } */
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.activeTab)), }));
        const __VLS_104 = __VLS_103({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.activeTab)), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        let __VLS_108;
        const __VLS_109 = {
            onChange: (...[$event]) => {
                if (!((!__VLS_ctx.isMobile)))
                    return;
                __VLS_ctx.handleTabChange(__VLS_ctx.activeTab);
            }
        };
        let __VLS_105;
        let __VLS_106;
        const __VLS_110 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({ value: ("active"), }));
        const __VLS_112 = __VLS_111({ value: ("active"), }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        const __VLS_116 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({ icon: ("ri:folder-open-line"), ...{ class: ("mr-1") }, }));
        const __VLS_118 = __VLS_117({ icon: ("ri:folder-open-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        __VLS_nonNullable(__VLS_115.slots).default;
        var __VLS_115;
        const __VLS_122 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ value: ("archived"), }));
        const __VLS_124 = __VLS_123({ value: ("archived"), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        const __VLS_128 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({ icon: ("ri:archive-line"), ...{ class: ("mr-1") }, }));
        const __VLS_130 = __VLS_129({ icon: ("ri:archive-line"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        __VLS_nonNullable(__VLS_127.slots).default;
        var __VLS_127;
        __VLS_nonNullable(__VLS_107.slots).default;
        var __VLS_107;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-content") }, });
    if (__VLS_ctx.activeTab === 'active' && __VLS_ctx.currentGroupId === 0 && !__VLS_ctx.showAllProjects) {
        // @ts-ignore
        [GroupGrid,];
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(GroupGrid, new GroupGrid({ ...{ 'onEnter': {} }, ...{ 'onDelete': {} }, groups: ((__VLS_ctx.groupList)), }));
        const __VLS_135 = __VLS_134({ ...{ 'onEnter': {} }, ...{ 'onDelete': {} }, groups: ((__VLS_ctx.groupList)), }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_139;
        const __VLS_140 = {
            onEnter: (__VLS_ctx.handleEnterGroup)
        };
        const __VLS_141 = {
            onDelete: (__VLS_ctx.handleDeleteGroup)
        };
        let __VLS_136;
        let __VLS_137;
        var __VLS_138;
    }
    if (!__VLS_ctx.isMobile) {
        // @ts-ignore
        [ProjectTable,];
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(ProjectTable, new ProjectTable({ ...{ 'onView': {} }, ...{ 'onFiles': {} }, ...{ 'onCommand': {} }, ...{ 'onUnarchive': {} }, ...{ 'onDelete': {} }, projects: ((__VLS_ctx.filteredProjectList)), loading: ((__VLS_ctx.loading)), activeTab: ((__VLS_ctx.activeTab)), showGroupColumn: ((__VLS_ctx.showAllProjects)), groups: ((__VLS_ctx.allGroups)), }));
        const __VLS_143 = __VLS_142({ ...{ 'onView': {} }, ...{ 'onFiles': {} }, ...{ 'onCommand': {} }, ...{ 'onUnarchive': {} }, ...{ 'onDelete': {} }, projects: ((__VLS_ctx.filteredProjectList)), loading: ((__VLS_ctx.loading)), activeTab: ((__VLS_ctx.activeTab)), showGroupColumn: ((__VLS_ctx.showAllProjects)), groups: ((__VLS_ctx.allGroups)), }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        let __VLS_147;
        const __VLS_148 = {
            onView: (__VLS_ctx.viewProject)
        };
        const __VLS_149 = {
            onFiles: (__VLS_ctx.viewFiles)
        };
        const __VLS_150 = {
            onCommand: (__VLS_ctx.handleCommand)
        };
        const __VLS_151 = {
            onUnarchive: (__VLS_ctx.handleUnarchive)
        };
        const __VLS_152 = {
            onDelete: (__VLS_ctx.handleDelete)
        };
        let __VLS_144;
        let __VLS_145;
        var __VLS_146;
    }
    else {
        // @ts-ignore
        [ProjectCards,];
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(ProjectCards, new ProjectCards({ ...{ 'onView': {} }, ...{ 'onFiles': {} }, ...{ 'onMore': {} }, projects: ((__VLS_ctx.filteredProjectList)), loading: ((__VLS_ctx.loading)), activeTab: ((__VLS_ctx.activeTab)), showGroupName: ((__VLS_ctx.showAllProjects)), groups: ((__VLS_ctx.allGroups)), }));
        const __VLS_154 = __VLS_153({ ...{ 'onView': {} }, ...{ 'onFiles': {} }, ...{ 'onMore': {} }, projects: ((__VLS_ctx.filteredProjectList)), loading: ((__VLS_ctx.loading)), activeTab: ((__VLS_ctx.activeTab)), showGroupName: ((__VLS_ctx.showAllProjects)), groups: ((__VLS_ctx.allGroups)), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        let __VLS_158;
        const __VLS_159 = {
            onView: (__VLS_ctx.viewProject)
        };
        const __VLS_160 = {
            onFiles: (__VLS_ctx.viewFiles)
        };
        const __VLS_161 = {
            onMore: (__VLS_ctx.openMobileProjectMenu)
        };
        let __VLS_155;
        let __VLS_156;
        var __VLS_157;
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    // @ts-ignore
    [ProjectDialog,];
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(ProjectDialog, new ProjectDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.projectDialogVisible)), project: ((__VLS_ctx.editingProject)), groupId: ((__VLS_ctx.currentGroupId)), }));
    const __VLS_163 = __VLS_162({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.projectDialogVisible)), project: ((__VLS_ctx.editingProject)), groupId: ((__VLS_ctx.currentGroupId)), }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    let __VLS_167;
    const __VLS_168 = {
        onSuccess: (__VLS_ctx.getProjectList)
    };
    let __VLS_164;
    let __VLS_165;
    var __VLS_166;
    // @ts-ignore
    [GroupDialog,];
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(GroupDialog, new GroupDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.groupDialogVisible)), }));
    const __VLS_170 = __VLS_169({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.groupDialogVisible)), }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    let __VLS_174;
    const __VLS_175 = {
        onSuccess: (__VLS_ctx.getProjectList)
    };
    let __VLS_171;
    let __VLS_172;
    var __VLS_173;
    // @ts-ignore
    [MoveProjectDialog,];
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(MoveProjectDialog, new MoveProjectDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.moveDialogVisible)), project: ((__VLS_ctx.movingProject)), groups: ((__VLS_ctx.allGroups)), }));
    const __VLS_177 = __VLS_176({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.moveDialogVisible)), project: ((__VLS_ctx.movingProject)), groups: ((__VLS_ctx.allGroups)), }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    let __VLS_181;
    const __VLS_182 = {
        onSuccess: (__VLS_ctx.getProjectList)
    };
    let __VLS_178;
    let __VLS_179;
    var __VLS_180;
    // @ts-ignore
    [MobileActionSheet,];
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(MobileActionSheet, new MobileActionSheet({ ...{ 'onAddAction': {} }, ...{ 'onProjectAction': {} }, addModelValue: ((__VLS_ctx.mobileAddVisible)), moreModelValue: ((__VLS_ctx.mobileMoreVisible)), project: ((__VLS_ctx.currentMobileProject)), activeTab: ((__VLS_ctx.activeTab)), }));
    const __VLS_184 = __VLS_183({ ...{ 'onAddAction': {} }, ...{ 'onProjectAction': {} }, addModelValue: ((__VLS_ctx.mobileAddVisible)), moreModelValue: ((__VLS_ctx.mobileMoreVisible)), project: ((__VLS_ctx.currentMobileProject)), activeTab: ((__VLS_ctx.activeTab)), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    let __VLS_188;
    const __VLS_189 = {
        onAddAction: (__VLS_ctx.handleMobileAddAction)
    };
    const __VLS_190 = {
        onProjectAction: (__VLS_ctx.handleMobileProjectAction)
    };
    let __VLS_185;
    let __VLS_186;
    var __VLS_187;
    __VLS_styleScopedClasses['project-page'];
    __VLS_styleScopedClasses['art-full-height'];
    __VLS_styleScopedClasses['art-table-card'];
    __VLS_styleScopedClasses['table-header'];
    __VLS_styleScopedClasses['left-panel'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['breadcrumb-link'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['actions'];
    __VLS_styleScopedClasses['mobile-toolbar'];
    __VLS_styleScopedClasses['mobile-group-header'];
    __VLS_styleScopedClasses['back-btn'];
    __VLS_styleScopedClasses['group-title'];
    __VLS_styleScopedClasses['mobile-group-header'];
    __VLS_styleScopedClasses['back-btn'];
    __VLS_styleScopedClasses['group-title'];
    __VLS_styleScopedClasses['mobile-tabs'];
    __VLS_styleScopedClasses['mobile-tab-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['mobile-tab-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['mobile-tab-item'];
    __VLS_styleScopedClasses['all-btn'];
    __VLS_styleScopedClasses['mobile-actions'];
    __VLS_styleScopedClasses['icon-btn'];
    __VLS_styleScopedClasses['icon-btn'];
    __VLS_styleScopedClasses['mobile-search-bar'];
    __VLS_styleScopedClasses['archive-tabs'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['project-content'];
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
            ProjectTable: ProjectTable,
            ProjectCards: ProjectCards,
            GroupGrid: GroupGrid,
            ProjectDialog: ProjectDialog,
            GroupDialog: GroupDialog,
            MoveProjectDialog: MoveProjectDialog,
            MobileActionSheet: MobileActionSheet,
            isMobile: isMobile,
            loading: loading,
            groupList: groupList,
            allGroups: allGroups,
            activeTab: activeTab,
            currentGroupId: currentGroupId,
            breadcrumbs: breadcrumbs,
            showAllProjects: showAllProjects,
            showSearch: showSearch,
            searchQuery: searchQuery,
            projectDialogVisible: projectDialogVisible,
            groupDialogVisible: groupDialogVisible,
            moveDialogVisible: moveDialogVisible,
            mobileAddVisible: mobileAddVisible,
            mobileMoreVisible: mobileMoreVisible,
            editingProject: editingProject,
            movingProject: movingProject,
            currentMobileProject: currentMobileProject,
            filteredProjectList: filteredProjectList,
            getProjectList: getProjectList,
            toggleShowAll: toggleShowAll,
            handleTabChange: handleTabChange,
            handleEnterGroup: handleEnterGroup,
            handleBreadcrumbClick: handleBreadcrumbClick,
            openCreateDialog: openCreateDialog,
            viewProject: viewProject,
            viewFiles: viewFiles,
            handleCommand: handleCommand,
            handleUnarchive: handleUnarchive,
            handleDelete: handleDelete,
            handleDeleteGroup: handleDeleteGroup,
            openMobileProjectMenu: openMobileProjectMenu,
            handleMobileAddAction: handleMobileAddAction,
            handleMobileProjectAction: handleMobileProjectAction,
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