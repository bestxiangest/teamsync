<template>
  <div class="project-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- PC 端头部 -->
      <div v-if="!isMobile" class="table-header">
        <div class="left-panel">
          <h3 class="title">项目列表</h3>
          <!-- 查看全部按钮 -->
          <ElButton
            v-if="activeTab === 'active'"
            :type="showAllProjects ? 'primary' : 'default'"
            size="small"
            class="ml-4"
            @click="toggleShowAll"
          >
            <template #icon>
              <ArtSvgIcon :icon="showAllProjects ? 'ri:layout-grid-line' : 'ri:list-check'" />
            </template>
            {{ showAllProjects ? '分组视图' : '全部项目' }}
          </ElButton>
          <!-- 面包屑 -->
          <ElBreadcrumb v-if="currentGroupId > 0 && !showAllProjects" separator="/" class="ml-4">
            <ElBreadcrumbItem>
              <a @click="handleBreadcrumbClick(null)" class="breadcrumb-link">全部项目</a>
            </ElBreadcrumbItem>
            <ElBreadcrumbItem v-for="item in breadcrumbs" :key="item.id">
              {{ item.name }}
            </ElBreadcrumbItem>
          </ElBreadcrumb>
          <!-- 全部项目模式提示 -->
          <span v-if="showAllProjects" class="ml-4 text-sm text-gray-500">
            （显示全部 {{ filteredProjectList.length }} 个项目）
          </span>
        </div>

        <div class="actions">
          <ElButton
            v-if="currentGroupId === 0 && activeTab === 'active' && !showAllProjects"
            @click="groupDialogVisible = true"
          >
            <template #icon>
              <ArtSvgIcon icon="ri:folder-add-line" />
            </template>
            新建分组
          </ElButton>
          <ElButton type="primary" @click="openCreateDialog" v-ripple>
            <template #icon>
              <ArtSvgIcon icon="ri:add-line" />
            </template>
            新建项目
          </ElButton>
        </div>
      </div>

      <!-- 移动端工具栏 -->
      <div v-else class="mobile-toolbar">
        <!-- 在分组内时显示标题和返回 -->
        <template v-if="currentGroupId > 0 && !showAllProjects">
          <div class="mobile-group-header">
            <div class="back-btn" @click="handleBreadcrumbClick(null)">
              <ArtSvgIcon icon="ri:arrow-left-s-line" />
              <span>返回全部</span>
            </div>
            <div class="group-title">{{ breadcrumbs[0]?.name }}</div>
          </div>
        </template>
        <!-- 全部项目模式显示返回按钮 -->
        <template v-else-if="showAllProjects">
          <div class="mobile-group-header">
            <div class="back-btn" @click="toggleShowAll">
              <ArtSvgIcon icon="ri:arrow-left-s-line" />
              <span>返回分组</span>
            </div>
            <div class="group-title">全部项目</div>
          </div>
        </template>
        <!-- 正常 Tabs -->
        <template v-else>
          <div class="mobile-tabs">
            <div
              class="mobile-tab-item"
              :class="{ active: activeTab === 'active' }"
              @click="handleTabChange('active')"
            >
              进行中
            </div>
            <div
              class="mobile-tab-item"
              :class="{ active: activeTab === 'archived' }"
              @click="handleTabChange('archived')"
            >
              已归档
            </div>
            <div
              class="mobile-tab-item all-btn"
              @click="toggleShowAll"
            >
              全部
            </div>
          </div>
        </template>

        <div class="mobile-actions">
          <div class="icon-btn" @click="showSearch = !showSearch">
            <ArtSvgIcon icon="ri:search-line" />
          </div>
          <div class="icon-btn" @click="mobileAddVisible = true">
            <ArtSvgIcon icon="ri:add-line" />
          </div>
        </div>
      </div>

      <!-- 移动端搜索栏 -->
      <div v-if="isMobile && showSearch" class="mobile-search-bar">
        <ElInput v-model="searchQuery" placeholder="搜索项目..." clearable>
          <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
        </ElInput>
      </div>

      <!-- PC 端归档切换 Tabs -->
      <div v-if="!isMobile" class="archive-tabs">
        <ElRadioGroup v-model="activeTab" @change="handleTabChange(activeTab)">
          <ElRadioButton value="active">
            <ArtSvgIcon icon="ri:folder-open-line" class="mr-1" />
            进行中
          </ElRadioButton>
          <ElRadioButton value="archived">
            <ArtSvgIcon icon="ri:archive-line" class="mr-1" />
            已归档
          </ElRadioButton>
        </ElRadioGroup>
      </div>

      <!-- 内容区 -->
      <div class="project-content">
        <!-- 分组列表 (活跃Tab且在根目录时显示，全部模式下隐藏) -->
        <GroupGrid
          v-if="activeTab === 'active' && currentGroupId === 0 && !showAllProjects"
          :groups="groupList"
          :current-user-id="currentUserId"
          :is-platform-admin="isPlatformAdmin"
          @enter="handleEnterGroup"
          @edit="handleEditGroup"
          @delete="handleDeleteGroup"
        />

        <!-- PC 表格视图 -->
        <ProjectTable
          v-if="!isMobile"
          :projects="filteredProjectList"
          :loading="loading"
          :active-tab="activeTab"
          :show-group-column="showAllProjects"
          :groups="allGroups"
          @view="viewProject"
          @files="viewFiles"
          @command="handleCommand"
          @unarchive="handleUnarchive"
          @delete="handleDelete"
        />

        <!-- 移动端卡片视图 -->
        <ProjectCards
          v-else
          :projects="filteredProjectList"
          :loading="loading"
          :active-tab="activeTab"
          :show-group-name="showAllProjects"
          :groups="allGroups"
          @view="viewProject"
          @files="viewFiles"
          @more="openMobileProjectMenu"
        />
      </div>
    </ElCard>

    <!-- 弹窗组件 -->
    <ProjectDialog
      v-model="projectDialogVisible"
      :project="editingProject"
      :group-id="currentGroupId"
      @success="getProjectList"
    />

    <GroupDialog v-model="groupDialogVisible" :group="editingGroup" @success="getProjectList" @update:model-value="handleGroupDialogClose" />
    <MoveProjectDialog
      v-model="moveDialogVisible"
      :project="movingProject"
      :groups="allGroups"
      @success="getProjectList"
    />

    <MobileActionSheet
      v-model:add-model-value="mobileAddVisible"
      v-model:more-model-value="mobileMoreVisible"
      :project="currentMobileProject"
      :active-tab="activeTab"
      @add-action="handleMobileAddAction"
      @project-action="handleMobileProjectAction"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useMediaQuery } from '@vueuse/core'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchProjectList,
    deleteProject,
    archiveProject,
    unarchiveProject,
    fetchGroupList,
    deleteGroup,
    type Project,
    type ProjectGroup
  } from '@/api/project'
  import { quitProject } from '@/api/member'
  import { useUserStore } from '@/store/modules/user'

  // 子模块导入
  import ProjectTable from './modules/ProjectTable.vue'
  import ProjectCards from './modules/ProjectCards.vue'
  import GroupGrid from './modules/GroupGrid.vue'
  import ProjectDialog from './modules/ProjectDialog.vue'
  import GroupDialog from './modules/GroupDialog.vue'
  import MoveProjectDialog from './modules/MoveProjectDialog.vue'
  import MobileActionSheet from './modules/MobileActionSheet.vue'

  defineOptions({ name: 'ProjectList' })

  const router = useRouter()
  const userStore = useUserStore()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const currentUserId = computed(() => userStore.info?.userId || 0)
  const isPlatformAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
  })

  // 状态变量
  const loading = ref(false)
  const projectList = ref<Project[]>([])
  const groupList = ref<ProjectGroup[]>([])
  const allGroups = ref<ProjectGroup[]>([])
  const activeTab = ref<'active' | 'archived'>('active')
  const currentGroupId = ref<number>(0)
  const breadcrumbs = ref<{ id: number; name: string }[]>([])
  const showAllProjects = ref(false) // 是否显示全部项目（无视分组）

  // 搜索相关
  const showSearch = ref(false)
  const searchQuery = ref('')

  // 弹窗可见性
  const projectDialogVisible = ref(false)
  const groupDialogVisible = ref(false)
  const moveDialogVisible = ref(false)
  const mobileAddVisible = ref(false)
  const mobileMoreVisible = ref(false)

  // 当前操作的对象
  const editingProject = ref<Project | null>(null)
  const movingProject = ref<Project | null>(null)
  const currentMobileProject = ref<Project | null>(null)
  const editingGroup = ref<ProjectGroup | null>(null)

  // 计算过滤后的项目列表
  const filteredProjectList = computed(() => {
    if (!searchQuery.value) return projectList.value
    const query = searchQuery.value.toLowerCase()
    return projectList.value.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    )
  })

  /**
   * 获取数据列表
   */
  const getProjectList = async () => {
    loading.value = true
    try {
      const archived = activeTab.value === 'archived'
      // 如果是全部模式，不传 groupId，后端会返回所有项目
      const queryGroupId = showAllProjects.value ? undefined : (archived ? undefined : currentGroupId.value)
      const projects = await fetchProjectList(archived, queryGroupId)
      projectList.value = projects || []

      // 获取分组列表
      if (allGroups.value.length === 0) {
        const groups = await fetchGroupList()
        allGroups.value = groups || []
      }

      if (!archived && currentGroupId.value === 0 && !showAllProjects.value) {
        const groups = await fetchGroupList()
        groupList.value = groups || []
      }
    } catch (error) {
      console.error('获取列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换全部项目视图
   */
  const toggleShowAll = () => {
    showAllProjects.value = !showAllProjects.value
    if (showAllProjects.value) {
      // 进入全部模式，重置分组状态
      currentGroupId.value = 0
      breadcrumbs.value = []
    }
    getProjectList()
  }

  /**
   * 切换 Tab
   */
  const handleTabChange = (tab: 'active' | 'archived') => {
    activeTab.value = tab
    currentGroupId.value = 0
    breadcrumbs.value = []
    showAllProjects.value = false // 切换 Tab 时重置全部视图
    getProjectList()
  }

  /**
   * 进入分组
   */
  const handleEnterGroup = (group: ProjectGroup) => {
    currentGroupId.value = group.id
    breadcrumbs.value = [{ id: group.id, name: group.name }]
    getProjectList()
  }

  /**
   * 点击面包屑
   */
  const handleBreadcrumbClick = (item: any) => {
    currentGroupId.value = 0
    breadcrumbs.value = []
    getProjectList()
  }

  /**
   * 打开新建项目弹窗
   */
  const openCreateDialog = () => {
    editingProject.value = null
    projectDialogVisible.value = true
  }

  /**
   * 查看项目
   */
  const viewProject = (row: Project) => {
    router.push({
      name: 'KanbanBoard',
      params: { projectId: row.id },
      query: { name: row.name }
    })
  }

  /**
   * 查看看板文档
   */
  const viewFiles = (row: Project) => {
    router.push({
      name: 'ProjectFiles',
      params: { projectId: row.id },
      query: { name: row.name }
    })
  }

  /**
   * 处理操作命令
   */
  const handleCommand = (command: string, row: Project) => {
    switch (command) {
      case 'edit':
        editingProject.value = row
        projectDialogVisible.value = true
        break
      case 'move':
        movingProject.value = row
        moveDialogVisible.value = true
        break
      case 'archive':
        confirmArchive(row)
        break
      case 'unarchive':
        handleUnarchive(row)
        break
      case 'delete':
        confirmDelete(row)
        break
      case 'quit':
        confirmQuit(row)
        break
    }
  }

  // 确认操作
  const confirmArchive = (row: Project) => {
    ElMessageBox.confirm('归档后项目将移入归档箱。确定归档吗？', '归档项目', {
      type: 'warning'
    }).then(() => handleArchive(row))
  }

  const confirmDelete = (row: Project) => {
    ElMessageBox.confirm('确定删除该项目吗？删除后不可恢复！', '删除项目', {
      type: 'error'
    }).then(() => handleDelete(row))
  }

  const confirmQuit = (row: Project) => {
    ElMessageBox.confirm('确定要退出该项目吗？', '退出项目', {
      type: 'warning'
    }).then(() => handleQuit(row))
  }

  /**
   * API 调用
   */
  const handleArchive = async (row: Project) => {
    try {
      await archiveProject(row.id)
      ElMessage.success('项目已归档')
      getProjectList()
    } catch (error) {}
  }

  const handleUnarchive = async (row: Project) => {
    try {
      await unarchiveProject(row.id)
      ElMessage.success('项目已还原')
      getProjectList()
    } catch (error) {}
  }

  const handleDelete = async (row: Project) => {
    try {
      await deleteProject(row.id)
      ElMessage.success('项目删除成功')
      getProjectList()
    } catch (error) {}
  }

  const handleQuit = async (row: Project) => {
    try {
      await quitProject(row.id)
      ElMessage.success('已退出项目')
      getProjectList()
    } catch (error) {}
  }

  const handleDeleteGroup = async (group: ProjectGroup) => {
    try {
      await deleteGroup(group.id)
      ElMessage.success('分组删除成功')
      getProjectList()
    } catch (error) {}
  }

  const handleEditGroup = (group: ProjectGroup) => {
    editingGroup.value = group
    groupDialogVisible.value = true
  }

  const handleGroupDialogClose = (val: boolean) => {
    if (!val) {
      editingGroup.value = null
    }
  }

  /**
   * 移动端特定逻辑
   */
  const openMobileProjectMenu = (project: Project) => {
    currentMobileProject.value = project
    mobileMoreVisible.value = true
  }

  const handleMobileAddAction = (type: string) => {
    mobileAddVisible.value = false
    if (type === 'project') openCreateDialog()
    else groupDialogVisible.value = true
  }

  const handleMobileProjectAction = (cmd: string) => {
    mobileMoreVisible.value = false
    if (currentMobileProject.value) {
      handleCommand(cmd, currentMobileProject.value)
    }
  }

  onMounted(getProjectList)
</script>

<style lang="scss" scoped>
  .project-page {
    padding: 0;
    min-height: 0;

    :deep(.art-table-card) {
      min-height: 0;
    }

    :deep(.art-table-card > .el-card__body) {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .project-content {
      flex: 1;
      min-height: 0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .left-panel {
        display: flex;
        align-items: center;
      }

      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .breadcrumb-link {
        cursor: pointer;
        font-weight: normal;
        color: var(--el-text-color-regular);

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .actions {
        display: flex;
        gap: 12px;
      }
    }

    .archive-tabs {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    // 移动端样式
    .mobile-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0 16px;

      .mobile-group-header {
        display: flex;
        align-items: center;
        flex: 1;
        overflow: hidden;

        .back-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--el-color-primary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-right: 12px;
          padding: 4px 0;

          .art-svg-icon {
            font-size: 18px;
          }
        }

        .group-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .mobile-tabs {
        display: flex;
        background-color: var(--el-fill-color-light);
        border-radius: 8px;
        padding: 4px;

        .mobile-tab-item {
          padding: 6px 16px;
          font-size: 14px;
          border-radius: 6px;
          color: var(--el-text-color-regular);
          cursor: pointer;
          transition: all 0.2s;

          &.active {
            background-color: #fff;
            color: var(--el-color-primary);
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          }

          &.all-btn {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
            font-weight: 500;
          }
        }
      }

      .mobile-actions {
        display: flex;
        gap: 12px;

        .icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: var(--el-fill-color-light);
          color: var(--el-text-color-primary);
          font-size: 18px;

          &:active {
            background-color: var(--el-fill-color);
          }
        }
      }
    }

    .mobile-search-bar {
      margin-bottom: 16px;

      :deep(.el-input__wrapper) {
        border-radius: 10px;
        background-color: var(--el-fill-color-lighter);
        box-shadow: none !important;
        border: 1px solid transparent;

        &.is-focus {
          border-color: var(--el-color-primary-light-5);
          background-color: #fff;
        }
      }
    }
  }

  .mr-1 {
    margin-right: 4px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  @media (max-width: 768px) {
    :deep(.el-card__body) {
      padding: 12px;
    }

    .project-page {
      background-color: #f5f7fa;
    }

    :deep(.art-table-card) {
      background: transparent;
      border: none;
    }
  }
</style>
