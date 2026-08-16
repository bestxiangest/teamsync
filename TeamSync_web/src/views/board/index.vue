<template>
  <div class="kanban-page">
    <!-- 头部 -->
    <div class="kanban-header">
      <div class="header-top">
        <div class="header-left">
          <ElButton :icon="ArrowLeft" @click="goBack" circle />
          <h2 class="title">{{ projectName }}</h2>
        </div>
        <div class="header-right">
          <!-- 新建任务按钮（选择列） -->
          <ElDropdown
            v-if="canManageTasks"
            trigger="click"
            @command="(stageId: number) => openCreateDialog(stageId)"
          >
            <ElButton type="primary">
              <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
              新建任务
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-for="stage in stages" :key="stage.id" :command="stage.id">
                  {{ stage.name }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>

          <!-- 文档入口按钮 -->
          <ElButton v-if="canViewFiles" type="success" @click="goToFiles">
            <template #icon><ArtSvgIcon icon="ri:folder-line" /></template>
            文档
          </ElButton>

          <!-- 成员头像堆叠 -->
          <div class="member-avatars" @click="memberDialogVisible = true">
            <ElAvatar
              v-for="(member, index) in members.slice(0, 4)"
              :key="member.userId"
              :size="32"
              :src="member.avatar"
              :style="{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 10 - index }"
            >
              {{ member.nickname?.charAt(0) || member.username?.charAt(0) }}
            </ElAvatar>
            <span v-if="members.length > 4" class="more-count">+{{ members.length - 4 }}</span>
            <span class="member-label">{{ members.length }} 成员</span>
          </div>

          <!-- WebSocket 连接状态 -->
          <span class="ws-status" :class="{ connected: wsConnected }">
            <ArtSvgIcon :icon="wsConnected ? 'ri:wifi-line' : 'ri:wifi-off-line'" />
            {{ wsConnected ? '实时同步' : '离线' }}
          </span>
          <ElButton type="primary" @click="refreshBoard">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            刷新
          </ElButton>
        </div>
      </div>

      <!-- 项目进度条 -->
      <div class="header-progress">
        <div class="progress-info">
          <span class="progress-label">项目进度（自动）</span>
          <span class="progress-value">{{ projectProgress }}%</span>
        </div>
        <div class="progress-bar-wrapper">
          <ElProgress
            :percentage="projectProgress"
            :stroke-width="10"
            :show-text="false"
            :color="progressColor"
          />
        </div>
      </div>
    </div>

    <!-- 看板主体 -->
    <div class="kanban-container" v-loading="loading">
      <div class="kanban-scroll" ref="boardContainerRef" @wheel="handleBoardWheel">
        <!-- 阶段列 -->
        <div v-for="stage in stages" :key="stage.id" class="stage-column">
          <!-- 列标题 -->
          <div class="stage-header">
            <!-- 编辑模式 -->
            <ElInput
              v-if="stage.isEditing"
              v-model="editingStageName"
              size="small"
              class="stage-name-input"
              @blur="saveStageName(stage)"
              @keyup.enter="saveStageName(stage)"
              @keyup.escape="cancelEditStage(stage)"
              :ref="(el: any) => setStageInputRef(el, stage.id)"
            />
            <!-- 显示模式 -->
            <span
              v-else
              class="stage-name"
              @dblclick="canManageStages && enableEditStage(stage)"
              title="双击编辑"
            >
              {{ stage.name }}
            </span>
            <div class="stage-header-right">
              <span class="task-count">{{ stage.tasks.length }}</span>
              <ElDropdown
                v-if="canManageStages"
                trigger="click"
                @command="(cmd: string) => handleStageCommand(cmd, stage)"
              >
                <ElButton
                  :icon="MoreFilled"
                  type="primary"
                  plain
                  size="small"
                  circle
                  class="stage-more-btn"
                  aria-label="列表设置"
                  title="列表设置"
                />
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="rename">
                      <ArtSvgIcon icon="ri:edit-line" class="mr-1" /> 重命名
                    </ElDropdownItem>
                    <ElDropdownItem command="sort">
                      <ArtSvgIcon icon="ri:sort-asc" class="mr-1" /> 设置排序号
                    </ElDropdownItem>
                    <ElDropdownItem command="delete" divided>
                      <span style="color: var(--el-color-danger)">
                        <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" /> 删除列
                      </span>
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </div>
          </div>

          <!-- 任务列表（滚动容器） -->
          <div class="task-list">
            <draggable
              v-model="stage.tasks"
              group="task-group"
              item-key="id"
              class="task-drag-area"
              ghost-class="ghost-card"
              drag-class="dragging-card"
              :animation="200"
              :empty-insert-threshold="120"
              :fallback-tolerance="3"
              :scroll="true"
              :scroll-sensitivity="80"
              :scroll-speed="12"
              :swap-threshold="0.65"
              :disabled="!canManageTasks"
              @change="(evt: any) => handleChange(evt, stage)"
            >
              <template #item="{ element: task }">
                <div class="task-item-wrapper" @click="openEditDialog(task)">
                  <!-- 已完成任务：紧凑单行显示 -->
                  <div v-if="task.status === 1" class="task-card-compact">
                    <ArtSvgIcon icon="ri:check-line" class="compact-check-icon" />
                    <span class="compact-title">{{ task.title }}</span>
                  </div>
                  <!-- 未完成任务：完整卡片显示 -->
                  <div
                    v-else
                    class="task-card"
                    :class="{
                      'status-pending': task.status === 0,
                      'status-progress': task.status === 2,
                      [getPriorityClass(task.priority)]: true
                    }"
                  >
                    <!-- 优先级标签 -->
                    <div class="priority-bar" :class="getPriorityClass(task.priority)"></div>
                    <!-- 状态标识条 -->
                    <div class="status-bar" :class="getStatusClass(task.status)"></div>

                    <div class="task-content">
                      <!-- 任务标题行 -->
                      <div class="task-title-row">
                        <h4 class="task-title">{{ task.title }}</h4>
                      </div>

                      <!-- 状态选择器和进度条 -->
                      <div class="task-status-row">
                        <ElSelect
                          :model-value="task.status"
                          @click.stop
                          @change="(val) => handleChangeStatus(task, Number(val))"
                          class="task-status-select"
                          size="small"
                          :disabled="!canManageTasks"
                        >
                          <ElOption :value="0" label="未开始">
                            <span class="status-option">
                              <span class="status-dot status-pending"></span>
                              未开始
                            </span>
                          </ElOption>
                          <ElOption :value="2" label="处理中">
                            <span class="status-option">
                              <span class="status-dot status-progress"></span>
                              处理中
                            </span>
                          </ElOption>
                          <ElOption :value="1" label="已完成">
                            <span class="status-option">
                              <span class="status-dot status-completed"></span>
                              已完成
                            </span>
                          </ElOption>
                        </ElSelect>
                        <!-- 子任务进度条 -->
                        <div
                          class="task-progress-wrapper"
                          v-if="getTaskSubTaskProgress(task.id).total > 0"
                        >
                          <ElProgress
                            :percentage="getTaskSubTaskProgress(task.id).percentage"
                            :stroke-width="6"
                            :show-text="false"
                            class="task-progress-bar"
                          />
                          <span class="task-progress-text">
                            {{ getTaskSubTaskProgress(task.id).completed }} /
                            {{ getTaskSubTaskProgress(task.id).total }}
                          </span>
                        </div>
                      </div>

                      <!-- 任务描述 -->
                      <p v-if="task.description" class="task-desc">
                        {{ truncateText(task.description, 60) }}
                      </p>

                      <!-- 任务底部信息 -->
                      <div class="task-footer">
                        <!-- 截止时间 -->
                        <div
                          v-if="task.dueTime"
                          class="due-time"
                          :class="{ overdue: isOverdue(task.dueTime) && task.status !== 1 }"
                        >
                          <ArtSvgIcon icon="ri:time-line" />
                          <span>{{ formatDueTime(task.dueTime) }}</span>
                        </div>

                        <!-- 负责人头像 -->
                        <div class="assignees" v-if="task.assignees && task.assignees.length > 0">
                          <ElAvatar
                            v-for="(assignee, idx) in task.assignees.slice(0, 3)"
                            :key="assignee.userId"
                            :size="24"
                            :src="assignee.avatar"
                            :alt="assignee.nickname"
                            :style="{ marginLeft: idx > 0 ? '-6px' : '0', zIndex: 10 - idx }"
                            class="assignee-avatar"
                          >
                            {{ assignee.nickname?.charAt(0) }}
                          </ElAvatar>
                          <span v-if="task.assignees.length > 3" class="assignee-more">
                            +{{ task.assignees.length - 3 }}
                          </span>
                        </div>
                        <div class="creator" v-else>
                          <ElAvatar :size="24" :src="task.creatorAvatar" :alt="task.creatorName">
                            {{ task.creatorName?.charAt(0) }}
                          </ElAvatar>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template #footer>
                <div v-if="stage.tasks.length === 0" class="empty-stage">
                  <ArtSvgIcon icon="ri:inbox-line" />
                  <span>暂无任务</span>
                </div>
              </template>
            </draggable>

            <div v-if="canManageTasks" class="add-task-btn" @click="openCreateDialog(stage.id)">
              <ArtSvgIcon icon="ri:add-line" />
              <span>添加任务</span>
            </div>
          </div>
        </div>

        <!-- 添加新列 -->
        <div v-if="canManageStages" class="add-stage-column">
          <!-- 默认状态：显示按钮 -->
          <div v-if="!isAddingStage" class="add-stage-btn" @click="startAddStage">
            <ArtSvgIcon icon="ri:add-line" />
            <span>添加列表</span>
          </div>
          <!-- 编辑状态：输入框 -->
          <div v-else class="add-stage-form">
            <ElInput
              ref="newStageInputRef"
              v-model="newStageName"
              placeholder="输入列表名称..."
              size="default"
              @keyup.enter="confirmAddStage"
              @keyup.escape="cancelAddStage"
            />
            <div class="add-stage-actions">
              <ElButton type="primary" size="small" @click="confirmAddStage" :loading="addingStage">
                添加
              </ElButton>
              <ElButton size="small" @click="cancelAddStage">取消</ElButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成员管理弹窗 -->
    <MemberDialog
      v-model:visible="memberDialogVisible"
      :project-id="projectId"
      @updated="fetchMembers"
    />

    <!-- 任务详情弹窗（新建/编辑） -->
    <TaskDetailDialog
      ref="taskDialogRef"
      :project-id="projectId"
      @success="handleTaskDialogSuccess"
      @subtask-updated="handleSubTaskUpdated"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowLeft, MoreFilled } from '@element-plus/icons-vue'
  import draggable from 'vuedraggable'
  import {
    getBoardList,
    moveTask,
    updateTask,
    createStage,
    updateStage,
    deleteStage,
    type BoardStage,
    type BoardTask
  } from '@/api/board'
  import { getProject } from '@/api/project'
  import { useBoardSocket, type BoardMessage } from '@/hooks/useBoardSocket'
  import { useUserStore } from '@/store/modules/user'
  import { getProjectMembers, type Member, type MemberRoleCode } from '@/api/member'
  import { getSubTasks, type SubTask } from '@/api/subtask'
  import MemberDialog from './components/MemberDialog.vue'
  import TaskDetailDialog from './components/TaskDetailDialog.vue'

  defineOptions({ name: 'KanbanBoard' })

  const userStore = useUserStore()

  // 成员相关
  const members = ref<Member[]>([])
  const memberDialogVisible = ref(false)
  const isPlatformAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return (
      userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
    )
  })
  const currentUserId = computed(() => userStore.info?.userId)
  const currentMember = computed(() => {
    if (!currentUserId.value) return undefined
    return members.value.find((member) => member.userId === currentUserId.value)
  })
  const currentProjectRole = computed<MemberRoleCode | null>(() => {
    if (isPlatformAdmin.value) return 'owner'
    return currentMember.value?.role ?? null
  })
  const canManageTasks = computed(() => {
    return ['owner', 'admin', 'member'].includes(currentProjectRole.value || '')
  })
  const canManageStages = computed(() => {
    return ['owner', 'admin'].includes(currentProjectRole.value || '')
  })
  const canViewFiles = computed(() => {
    return currentProjectRole.value !== 'task_guest'
  })

  const route = useRoute()
  const router = useRouter()

  // 项目信息
  const projectId = ref<number>(0)
  const projectName = ref<string>('项目看板')

  // 看板数据
  const stages = ref<BoardStage[]>([])
  const loading = ref(false)
  const handledRouteTaskId = ref<number>()
  const currentTimestamp = ref(Date.now())
  let dueTimeRefreshTimer: number | undefined
  // 看板滚动容器引用
  const boardContainerRef = ref<HTMLElement | null>(null)

  /**
   * 看板横向滚动：支持在任意位置（包括任务卡片上）按住 Shift + 滚轮左右滚动。
   * 浏览器原生 shift+wheel 只会滚动最近的可滚动祖先（任务列内部的垂直滚动区），
   * 不会继续向上滚动看板容器，因此这里手动接管并滚动看板本身。
   */
  const handleBoardWheel = (e: WheelEvent) => {
    if (!e.shiftKey) return
    const board = boardContainerRef.value
    if (!board) return
    e.preventDefault()
    // shift 按下时滚轮垂直增量通常由浏览器转为水平，这里统一取水平/垂直方向中更大的增量
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    if (delta !== 0) {
      board.scrollLeft += delta
    }
  }

  // 项目进度相关
  const getTaskProgressValue = (task: BoardTask): number => {
    if (task.status === 1) return 100

    const subTaskProgress = getTaskSubTaskProgress(task.id)
    if (subTaskProgress.total > 0) {
      return subTaskProgress.percentage
    }

    if (task.status === 2) return 50
    return 0
  }

  const projectProgress = computed(() => {
    const allTasks = stages.value.flatMap((stage) => stage.tasks)
    if (allTasks.length === 0) return 0

    const totalProgress = allTasks.reduce((sum, task) => sum + getTaskProgressValue(task), 0)
    return Math.round(totalProgress / allTasks.length)
  })

  // 进度条颜色（根据进度值动态变化）
  const progressColor = computed(() => {
    if (projectProgress.value < 30) return '#f56c6c'
    if (projectProgress.value < 70) return '#e6a23c'
    return '#67c23a'
  })

  // 监听 popover 打开时同步临时进度值

  // 任务弹窗引用
  const taskDialogRef = ref<InstanceType<typeof TaskDetailDialog>>()

  // 子任务数据缓存（taskId -> SubTask[]）
  const taskSubTasksCache = ref<Map<number, SubTask[]>>(new Map())
  const taskSubTasksLoading = ref<Set<number>>(new Set())

  // ==================== Stage 管理相关 ====================
  // 新建列相关
  const isAddingStage = ref(false)
  const newStageName = ref('')
  const addingStage = ref(false)
  const newStageInputRef = ref<InstanceType<(typeof import('element-plus'))['ElInput']>>()

  // 编辑列名相关
  const editingStageName = ref('')
  const stageInputRefs = ref<Map<number, any>>(new Map())

  /**
   * 设置 stage input 的 ref
   */
  const setStageInputRef = (el: any, stageId: number) => {
    if (el) {
      stageInputRefs.value.set(stageId, el)
    }
  }

  const confirmAddStage = async () => {
    if (!canManageStages.value) {
      ElMessage.warning('当前角色不能管理列表结构')
      return
    }

    const name = newStageName.value.trim()
    if (!name) {
      ElMessage.warning('请输入列表名称')
      return
    }

    addingStage.value = true
    try {
      await createStage({ projectId: projectId.value, name })
      ElMessage.success('列表创建成功')
      cancelAddStage()
      fetchBoard()
    } catch (error) {
      console.error('创建列表失败:', error)
      ElMessage.error('创建列表失败')
    } finally {
      addingStage.value = false
    }
  }

  /**
   * 开始添加新列
   */
  const startAddStage = () => {
    if (!canManageStages.value) {
      ElMessage.warning('当前角色不能管理列表结构')
      return
    }

    isAddingStage.value = true
    newStageName.value = ''
    nextTick(() => {
      newStageInputRef.value?.focus()
    })
  }

  /**
   * 取消添加新列
   */
  const cancelAddStage = () => {
    isAddingStage.value = false
    newStageName.value = ''
  }

  /**
   * 确认添加新列
   */
  /* const confirmAddStageLegacy = async () => {
    const name = newStageName.value.trim()
    if (!name) {
      ElMessage.warning('请输入列表名称')
      return
    }

    addingStage.value = true
    try {
      await createStage({ projectId: projectId.value, name })
      ElMessage.success('列表创建成功')
      cancelAddStage()
      fetchBoard() // 刷新看板
      console.error('创建列表失败:', error)
      ElMessage.error('创建列表失败')
    } finally {
      addingStage.value = false
    }
  } */

  /**
   * 启用 Stage 编辑模式
   */
  const enableEditStage = (stage: BoardStage) => {
    if (!canManageStages.value) {
      ElMessage.warning('当前角色不能管理列表结构')
      return
    }

    // 先关闭其他正在编辑的
    stages.value.forEach((s) => (s.isEditing = false))
    stage.isEditing = true
    editingStageName.value = stage.name
    nextTick(() => {
      const input = stageInputRefs.value.get(stage.id)
      input?.focus()
      input?.select()
    })
  }

  /**
   * 取消编辑 Stage
   */
  const cancelEditStage = (stage: BoardStage) => {
    stage.isEditing = false
    editingStageName.value = ''
  }

  /**
   * 保存 Stage 名称
   */
  const saveStageName = async (stage: BoardStage) => {
    const newName = editingStageName.value.trim()

    // 如果名称没变或为空，取消编辑
    if (!newName || newName === stage.name) {
      cancelEditStage(stage)
      return
    }

    try {
      await updateStage(stage.id, { name: newName })
      stage.name = newName
      ElMessage.success('列表名称已更新')
    } catch (error) {
      console.error('更新列表名称失败:', error)
      ElMessage.error('更新列表名称失败')
    } finally {
      cancelEditStage(stage)
    }
  }

  /**
   * 处理 Stage 下拉菜单命令
   */
  const handleStageCommand = (command: string, stage: BoardStage) => {
    if (!canManageStages.value) {
      ElMessage.warning('当前角色不能管理列表结构')
      return
    }

    switch (command) {
      case 'rename':
        enableEditStage(stage)
        break
      case 'sort':
        handleSortStage(stage)
        break
      case 'delete':
        handleDeleteStage(stage)
        break
    }
  }

  /**
   * 设置 Stage 排序号
   */
  const handleSortStage = async (stage: BoardStage) => {
    try {
      const { value } = await ElMessageBox.prompt(
        '排序号越小，列表越靠前；相同排序号按创建顺序排列。',
        `设置「${stage.name}」排序号`,
        {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          inputValue: String(stage.sort ?? 0),
          inputPattern: /^\d+$/,
          inputErrorMessage: '请输入大于或等于 0 的整数'
        }
      )
      const sort = Number.parseInt(value, 10)
      await updateStage(stage.id, { sort })
      ElMessage.success('列表排序已更新')
      await fetchBoard()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('更新列表排序失败:', error)
        ElMessage.error('更新列表排序失败')
      }
    }
  }

  /**
   * 删除 Stage
   */
  const handleDeleteStage = async (stage: BoardStage) => {
    // 检查是否有任务
    if (stage.tasks && stage.tasks.length > 0) {
      ElMessage.warning(`该列下还有 ${stage.tasks.length} 个任务，请先移动或删除任务`)
      return
    }

    try {
      await ElMessageBox.confirm(`确定删除列表「${stage.name}」吗？此操作不可撤销。`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteStage(stage.id)
      ElMessage.success('列表已删除')
      fetchBoard() // 刷新看板
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除列表失败:', error)
        ElMessage.error('删除列表失败')
      }
    }
  }

  /**
   * 对每个阶段的任务排序：未完成在前、已完成在后
   */
  const sortTasksInStages = () => {
    stages.value.forEach((stage) => {
      stage.tasks.sort((a, b) => {
        if (a.status === 1 && b.status !== 1) return 1
        if (a.status !== 1 && b.status === 1) return -1
        return 0 // 保持原有 sort 顺序
      })
    })
  }

  /**
   * 获取看板数据
   */
  const fetchBoard = async () => {
    if (!projectId.value) return

    loading.value = true
    try {
      const data = await getBoardList(projectId.value)
      stages.value = data || []

      // 对任务排序：未完成在前、已完成在后
      sortTasksInStages()

      // 数据加载完成后，强制滚动到最左侧（移动端适配）
      await nextTick()
      if (boardContainerRef.value) {
        boardContainerRef.value.scrollTo({ left: 0, behavior: 'auto' })
        boardContainerRef.value.scrollLeft = 0 // 双重保险
      }

      // 获取所有任务的子任务数据
      await fetchAllTasksSubTasks()
      await openTaskFromRouteQuery()
    } catch (error) {
      console.error('获取看板数据失败:', error)
      ElMessage.error('获取看板数据失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取所有任务的子任务数据
   */
  const fetchAllTasksSubTasks = async () => {
    const allTaskIds: number[] = []
    stages.value.forEach((stage) => {
      stage.tasks.forEach((task) => {
        allTaskIds.push(task.id)
      })
    })

    // 并发获取所有任务的子任务数据
    const promises = allTaskIds.map((taskId) => fetchTaskSubTasks(taskId))
    await Promise.all(promises)
  }

  /**
   * 获取单个任务的子任务数据
   */
  const fetchTaskSubTasks = async (taskId: number) => {
    // 如果已经在加载或已缓存，跳过
    if (taskSubTasksLoading.value.has(taskId) || taskSubTasksCache.value.has(taskId)) {
      return
    }

    taskSubTasksLoading.value.add(taskId)
    try {
      const data = await getSubTasks(taskId)
      taskSubTasksCache.value.set(taskId, data || [])
    } catch (error) {
      console.error(`获取任务 ${taskId} 的子任务失败:`, error)
      // 即使失败也设置空数组，避免重复请求
      taskSubTasksCache.value.set(taskId, [])
    } finally {
      taskSubTasksLoading.value.delete(taskId)
    }
  }

  /**
   * 获取任务的子任务进度
   */
  const getTaskSubTaskProgress = (taskId: number) => {
    const subTasks = taskSubTasksCache.value.get(taskId) || []
    const total = subTasks.length
    const completed = subTasks.filter((s) => s.status === 1).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      percentage
    }
  }

  /**
   * 获取项目成员
   */
  const fetchMembers = async () => {
    if (!projectId.value) return

    try {
      const data = await getProjectMembers(projectId.value)
      members.value = data || []
    } catch (error) {
      console.error('获取成员列表失败:', error)
    }
  }

  /**
   * 获取项目详情（包含进度）
   */
  const fetchProjectInfo = async () => {
    if (!projectId.value) return

    try {
      const data = await getProject(projectId.value)
      if (data?.name && !route.query.name) {
        projectName.value = data.name
      }
    } catch (error) {
      console.error('获取项目信息失败:', error)
    }
  }

  /**
   * 保存项目进度
   */
  /* const saveProgressRemoved = async () => {
      ElMessage.success('进度已更新')
    } catch (error) {
      console.error('保存进度失败:', error)
      ElMessage.error('保存进度失败')
    } finally {
      savingProgress.value = false
    }
  } */

  /**
   * 刷新看板
   */
  const refreshBoard = () => {
    fetchBoard()
  }

  /**
   * 返回项目列表
   */
  const goBack = () => {
    router.push('/project/list')
  }

  /**
   * 跳转到项目文档
   */
  const goToFiles = () => {
    if (!canViewFiles.value) {
      ElMessage.warning('当前角色不能访问项目文档')
      return
    }

    router.push({
      name: 'ProjectFiles',
      params: { projectId: projectId.value },
      query: { name: projectName.value }
    })
  }

  /**
   * 处理拖拽变化
   */
  const handleChange = async (evt: any, stage: BoardStage) => {
    if (!canManageTasks.value) {
      fetchBoard()
      ElMessage.warning('当前角色不能移动任务')
      return
    }

    const { added, moved } = evt

    if (added) {
      const task = added.element as BoardTask
      const newIndex = added.newIndex
      await handleMoveTask(task.id, stage.id, newIndex)
    } else if (moved) {
      const task = moved.element as BoardTask
      const newIndex = moved.newIndex
      await handleMoveTask(task.id, stage.id, newIndex)
    }
  }

  /**
   * 调用移动任务 API
   */
  const handleMoveTask = async (taskId: number, targetStageId: number, newSort: number) => {
    try {
      await moveTask(taskId, { targetStageId, newSort })
    } catch (error) {
      console.error('移动任务失败:', error)
      ElMessage.error('移动任务失败，请刷新重试')
      fetchBoard()
    }
  }

  /**
   * 打开新建任务弹窗
   */
  const openCreateDialog = (stageId: number) => {
    if (!canManageTasks.value) {
      ElMessage.warning('当前角色不能创建任务')
      return
    }

    taskDialogRef.value?.openCreate(stageId)
  }

  /**
   * 打开编辑任务弹窗
   */
  const openEditDialog = (task: BoardTask) => {
    taskDialogRef.value?.openEdit(task)
    // 刷新该任务的子任务数据
    fetchTaskSubTasks(task.id)
  }

  const resolveRouteTaskId = () => {
    const rawTaskId = Array.isArray(route.query.taskId) ? route.query.taskId[0] : route.query.taskId
    const taskId = Number(rawTaskId)
    return Number.isFinite(taskId) && taskId > 0 ? taskId : undefined
  }

  const findBoardTask = (taskId: number) => {
    for (const stage of stages.value) {
      const task = stage.tasks.find((item) => item.id === taskId)
      if (task) return task
    }
    return undefined
  }

  const openTaskFromRouteQuery = async () => {
    const taskId = resolveRouteTaskId()
    if (!taskId || handledRouteTaskId.value === taskId) return
    handledRouteTaskId.value = taskId
    const task = findBoardTask(taskId)
    if (!task) {
      ElMessage.warning('未在当前看板找到该任务')
      return
    }
    await nextTick()
    openEditDialog(task)
  }

  /**
   * 监听任务弹窗的成功事件，刷新子任务数据
   */
  const handleTaskDialogSuccess = () => {
    fetchBoard() // 这会自动调用 fetchAllTasksSubTasks
  }

  /**
   * 监听子任务更新事件，实时更新对应任务的子任务缓存
   */
  const handleSubTaskUpdated = async (taskId: number) => {
    // 清除缓存和加载状态，强制重新获取
    taskSubTasksCache.value.delete(taskId)
    taskSubTasksLoading.value.delete(taskId)
    // 重新获取该任务的子任务数据
    await fetchTaskSubTasks(taskId)
  }

  /**
   * 切换任务状态
   */
  const handleChangeStatus = async (task: BoardTask, newStatus: number) => {
    if (!canManageTasks.value) {
      ElMessage.warning('当前角色不能修改任务状态')
      return
    }

    const taskId = task.id

    try {
      await updateTask(taskId, { status: newStatus })

      // 在 stages 中找到并更新对应的任务（确保响应式更新）
      // 使用 Vue 的响应式方式更新数组中的对象
      for (let i = 0; i < stages.value.length; i++) {
        const stage = stages.value[i]
        const taskIndex = stage.tasks.findIndex((t) => t.id === taskId)
        if (taskIndex !== -1) {
          // 直接修改数组中的对象属性
          stages.value[i].tasks[taskIndex].status = newStatus
          break
        }
      }

      // 重新排序：未完成在前、已完成在后
      sortTasksInStages()

      const statusText = newStatus === 0 ? '未开始' : newStatus === 1 ? '已完成' : '处理中'
      ElMessage.success(`任务状态已更新为：${statusText}`)
    } catch (error) {
      console.error('更新任务状态失败:', error)
      ElMessage.error('更新状态失败')
    }
  }

  /**
   * 获取优先级样式类
   */
  const getPriorityClass = (priority: number): string => {
    switch (priority) {
      case 3:
        return 'priority-critical'
      case 2:
        return 'priority-high'
      default:
        return 'priority-normal'
    }
  }

  /**
   * 获取状态样式类
   */
  const getStatusClass = (status: number): string => {
    switch (status) {
      case 0:
        return 'status-pending'
      case 2:
        return 'status-progress'
      case 1:
        return 'status-completed'
      default:
        return 'status-pending'
    }
  }

  /**
   * 格式化截止时间
   */
  const formatDueTime = (dateStr: string): string => {
    if (!dateStr) return ''
    const dueTimestamp = new Date(dateStr).getTime()
    if (Number.isNaN(dueTimestamp)) return ''

    const diffMs = dueTimestamp - currentTimestamp.value
    if (diffMs === 0) return '已到期'

    const totalHours = Math.max(1, Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60)))
    const days = Math.floor(totalHours / 24)
    const hours = totalHours % 24
    const duration = days > 0 ? `${days}天${hours}小时` : `${hours}小时`
    return diffMs > 0 ? `${duration}后到期` : `已逾期${duration}`
  }

  /**
   * 判断是否逾期
   */
  const isOverdue = (dateStr: string): boolean => {
    if (!dateStr) return false
    const dueTimestamp = new Date(dateStr).getTime()
    return !Number.isNaN(dueTimestamp) && dueTimestamp <= currentTimestamp.value
  }

  /**
   * 截断文本
   */
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  /**
   * WebSocket 消息处理
   */
  const handleSocketMessage = (message: BoardMessage) => {
    console.log('[Kanban] 收到实时更新:', message.action)

    // 如果是自己的操作，不需要刷新（因为已经在操作后刷新了）
    // 可以通过 userId 判断，但为了简化，这里统一刷新
    // 也可以根据 action 类型做更精细的更新

    // 显示提示（可选）
    if (message.userId && message.userId !== userStore.info?.userId) {
      const actionText: Record<string, string> = {
        TASK_CREATED: '创建了新任务',
        TASK_UPDATED: '更新了任务',
        TASK_DELETED: '删除了任务',
        TASK_MOVED: '移动了任务'
      }
      const text = actionText[message.action] || '更新了看板'
      ElMessage.info({
        message: `${message.username || '其他用户'} ${text}`,
        duration: 2000
      })
    }

    // 刷新看板数据
    fetchBoard()
  }

  // WebSocket 连接（传递响应式引用，hook 会监听变化自动连接）
  const { connected: wsConnected } = useBoardSocket(projectId, handleSocketMessage)

  watch(
    () => route.query.taskId,
    () => {
      handledRouteTaskId.value = undefined
      openTaskFromRouteQuery()
    }
  )

  // 初始化
  onMounted(() => {
    projectId.value = Number(route.params.projectId) || 1
    projectName.value = (route.query.name as string) || '项目看板'
    dueTimeRefreshTimer = window.setInterval(() => {
      currentTimestamp.value = Date.now()
    }, 60 * 1000)
    fetchBoard()
    fetchMembers()
    fetchProjectInfo()
  })

  onUnmounted(() => {
    if (dueTimeRefreshTimer !== undefined) {
      window.clearInterval(dueTimeRefreshTimer)
    }
  })
</script>

<style lang="scss" scoped>
  .kanban-page {
    display: flex;
    flex-direction: column;
    height: var(--art-full-height, calc(100dvh - 120px));
    min-height: 0 !important;
    overflow: hidden;
    background: var(--el-bg-color-page);
  }

  .kanban-header {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    padding: 16px 24px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ws-status {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 16px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);

      i {
        font-size: 14px;
      }

      &.connected {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }
    }

    .member-avatars {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 4px;
      border-radius: 20px;
      background: var(--el-fill-color-light);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--el-fill-color);
      }

      :deep(.el-avatar) {
        border: 2px solid var(--el-bg-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .more-count {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin-left: -8px;
        font-size: 11px;
        font-weight: 500;
        color: var(--el-text-color-secondary);
        background: var(--el-fill-color);
        border: 2px solid var(--el-bg-color);
        border-radius: 50%;
      }

      .member-label {
        margin-left: 8px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    // 项目进度条样式
    .header-progress {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--el-border-color-extra-light);

      .progress-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;

        .progress-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }

        .progress-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          min-width: 40px;
        }
      }

      .progress-bar-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;

        :deep(.el-progress) {
          flex: 1;

          .el-progress-bar__outer {
            border-radius: 5px;
          }

          .el-progress-bar__inner {
            border-radius: 5px;
            transition:
              width 0.3s ease,
              background-color 0.3s ease;
          }
        }
      }
    }
  }

  // 进度调整弹出框
  .progress-popover {
    .popover-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 16px;
    }

    :deep(.el-slider) {
      margin-bottom: 16px;

      .el-input-number {
        width: 60px;
      }
    }

    .popover-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }

  .kanban-container {
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
    padding: 20px;
  }

  .kanban-scroll {
    display: flex;
    align-items: stretch;
    gap: 16px;
    height: 100%;
    min-height: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 16px;

    // Firefox 滚动条（WebKit 的 ::-webkit-scrollbar 见底部非 scoped 样式块）
    scrollbar-width: thin;
    scrollbar-color: var(--el-border-color) var(--el-fill-color-light);
  }

  .stage-column {
    flex-shrink: 0;
    width: 300px;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--el-fill-color-lighter);
    border-radius: 12px;
  }

  .stage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .stage-name {
      flex: 1;
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      cursor: pointer;
      padding: 4px 8px;
      margin: -4px -8px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background: var(--el-fill-color);
      }
    }

    .stage-name-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        padding: 2px 8px;
      }
    }

    .stage-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .task-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 500;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color);
      border-radius: 12px;
    }

    .stage-more-btn {
      opacity: 1;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 1px 3px rgba(64, 158, 255, 0.18);
      transition: all 0.2s ease;

      &:hover,
      &:focus-visible {
        color: var(--el-color-white);
        background: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }
    }
  }

  // 新建列样式
  .add-stage-column {
    flex-shrink: 0;
    width: 300px;
    min-height: 120px;
  }

  .add-stage-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 48px;
    background: var(--el-fill-color-light);
    border-radius: 12px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color);
      color: var(--el-color-primary);
    }

    i {
      font-size: 18px;
    }
  }

  .add-stage-form {
    background: var(--el-fill-color-lighter);
    border-radius: 12px;
    padding: 12px;

    :deep(.el-input) {
      margin-bottom: 12px;
    }

    .add-stage-actions {
      display: flex;
      gap: 8px;
    }
  }

  .task-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .task-drag-area {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 12px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-light);
      border-radius: 3px;
    }
  }

  .task-item-wrapper {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  // 已完成任务紧凑卡片
  .task-card-compact {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    border-left: 4px solid #67c23a;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }

    .compact-check-icon {
      color: #67c23a;
      font-size: 16px;
      flex-shrink: 0;
    }

    .compact-title {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-decoration: line-through;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .task-card {
    position: relative;
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    min-height: 120px; // 增加卡片高度

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    /* 优先级背景色 */
    &.priority-normal {
      background: rgba(103, 194, 58, 0.05); // 普通 - 浅绿色背景
    }

    &.priority-high {
      background: rgba(230, 162, 60, 0.05); // 紧急 - 浅橙色背景
    }

    &.priority-critical {
      background: rgba(245, 108, 108, 0.08); // 非常紧急 - 浅红色背景
    }

    /* 状态标识条 */
    .status-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-radius: 8px 0 0 8px;
      z-index: 1;

      &.status-pending {
        background: #909399; // 灰色 - 未开始
      }

      &.status-progress {
        background: #409eff; // 蓝色 - 处理中
      }

      &.status-completed {
        background: #67c23a; // 绿色 - 已完成
      }
    }

    /* 未开始状态样式 */
    &.status-pending {
      border-left: 4px solid #909399;
    }

    /* 处理中状态样式 */
    &.status-progress {
      border-left: 4px solid #409eff;
    }
  }

  /* 任务标题行 */
  .task-title-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }

  /* 状态选择器行 */
  .task-status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .task-checkbox {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .priority-bar {
    position: absolute;
    top: 0;
    left: 4px; // 放在状态条右侧
    width: 3px;
    height: 100%;
    z-index: 1;

    &.priority-normal {
      background: #67c23a;
    }

    &.priority-high {
      background: #e6a23c;
    }

    &.priority-critical {
      background: #f56c6c;
    }
  }

  .task-content {
    padding: 14px 14px 14px 20px; // 增加内边距，使卡片更高，左侧留出状态条和优先级条的空间
  }

  .task-title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    line-height: 1.4;
    flex: 1;
    transition:
      color 0.2s,
      text-decoration 0.2s;
  }

  .task-desc {
    margin: 0 0 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  .task-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .due-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    i {
      font-size: 14px;
    }

    &.overdue {
      color: #f56c6c;
    }
  }

  .creator {
    :deep(.el-avatar) {
      border: 2px solid var(--el-bg-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  .assignees {
    display: flex;
    align-items: center;

    .assignee-avatar {
      border: 2px solid var(--el-bg-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    .assignee-more {
      margin-left: 4px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
    }
  }

  .empty-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    padding: 24px 16px;
    color: var(--el-text-color-placeholder);
    pointer-events: none;

    i {
      font-size: 28px;
      margin-bottom: 8px;
    }

    span {
      font-size: 13px;
    }
  }

  /* 添加任务按钮 */
  .add-task-btn {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 0 12px 12px;
    padding: 10px;
    border: 2px dashed var(--el-border-color);
    border-radius: 8px;
    background: var(--el-bg-color);
    box-shadow: 0 -8px 18px rgba(31, 45, 61, 0.06);
    color: var(--el-text-color-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    i {
      font-size: 16px;
    }
  }

  /* 拖拽样式 */
  .ghost-card {
    opacity: 0.5;
    background: var(--el-color-primary-light-9);
    border: 2px dashed var(--el-color-primary);
    border-radius: 8px;
  }

  .dragging-card {
    opacity: 0.9;
    transform: rotate(3deg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  /* 弹窗底部 */
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-right {
      display: flex;
      gap: 8px;
    }
  }

  /* 优先级选项 */
  .priority-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.priority-normal {
        background: #67c23a;
      }

      &.priority-high {
        background: #e6a23c;
      }

      &.priority-critical {
        background: #f56c6c;
      }
    }
  }

  /* 工具类 */
  .mr-1 {
    margin-right: 4px;
  }

  /* === 任务状态选择器 === */
  .task-status-select {
    width: 100px;
    flex-shrink: 0;

    :deep(.el-input__wrapper) {
      padding: 0 8px;
    }
  }

  /* === 任务进度条 === */
  .task-progress-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .task-progress-bar {
    flex: 1;
    min-width: 60px;

    :deep(.el-progress-bar__outer) {
      border-radius: 4px;
    }

    :deep(.el-progress-bar__inner) {
      border-radius: 4px;
    }
  }

  .task-progress-text {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .status-option {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &.status-pending {
        background: #909399; // 灰色 - 未开始
      }

      &.status-progress {
        background: #409eff; // 蓝色 - 处理中
      }

      &.status-completed {
        background: #67c23a; // 绿色 - 已完成
      }
    }
  }

  /* ==================== 移动端紧凑模式 ==================== */
  @media only screen and (max-width: 768px) {
    .kanban-page {
      height: calc(100dvh - 100px - env(safe-area-inset-bottom));
      min-height: 0;
    }

    .kanban-header {
      padding: 12px 16px;

      .header-top {
        flex-wrap: wrap;
        gap: 8px;
      }

      .header-left {
        gap: 8px;

        .title {
          font-size: 16px;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .header-right {
        gap: 8px;

        // 隐藏 WebSocket 状态文字
        .ws-status {
          padding: 4px 8px;
          font-size: 0;

          i {
            font-size: 14px;
          }
        }

        // 简化成员显示
        .member-avatars {
          padding: 2px 8px 2px 2px;

          :deep(.el-avatar) {
            width: 28px !important;
            height: 28px !important;
          }

          .member-label {
            display: none;
          }
        }

        // 隐藏刷新按钮文字
        .el-button {
          span {
            display: none;
          }
        }
      }

      // 进度条紧凑化
      .header-progress {
        margin-top: 8px;
        padding-top: 8px;
        gap: 12px;

        .progress-info {
          gap: 4px;

          .progress-label {
            font-size: 12px;
          }

          .progress-value {
            font-size: 13px;
          }
        }
      }
    }

    .kanban-container {
      padding: 12px;
    }

    .kanban-scroll {
      gap: 8px;
      padding-bottom: 12px;
      // 启用平滑滚动
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }

    // 核心：70vw 列宽
    .stage-column {
      width: 70vw;
      min-width: 70vw;
      flex-shrink: 0;
      scroll-snap-align: start;
      border-radius: 10px;
    }

    .stage-header {
      padding: 10px 12px;

      .stage-name {
        font-size: 14px;
        padding: 2px 4px;
        margin: -2px -4px;
      }

      .stage-header-right {
        gap: 4px;
      }

      .task-count {
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        font-size: 11px;
      }

      // 移动端始终显示更多按钮
      .stage-more-btn {
        opacity: 1;
      }
    }

    .task-list {
      padding: 0;
    }

    .task-drag-area {
      padding: 8px;
    }

    // 紧凑任务卡片
    .task-card {
      margin-bottom: 8px;
      border-radius: 6px;

      &:hover {
        transform: none; // 移动端禁用悬浮动画
      }
    }

    .task-content {
      padding: 8px 8px 8px 12px;
    }

    .task-title-row {
      margin-bottom: 4px;
      gap: 6px;
    }

    .task-title {
      font-size: 13px;
      line-height: 1.4;
      // 限制两行显示
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    // 移动端隐藏描述
    .task-desc {
      display: none;
    }

    .task-footer {
      margin-top: 4px;
    }

    .due-time {
      font-size: 11px;

      i {
        font-size: 12px;
      }
    }

    .creator {
      :deep(.el-avatar) {
        width: 16px !important;
        height: 16px !important;
        font-size: 10px !important;
      }
    }

    .empty-stage {
      padding: 16px 12px;

      i {
        font-size: 24px;
      }

      span {
        font-size: 12px;
      }
    }

    .add-task-btn {
      margin: 0 8px 8px;
      padding: 8px;
      font-size: 13px;

      i {
        font-size: 14px;
      }
    }

    // 添加列紧凑化
    .add-stage-column {
      width: 70vw;
      min-width: 70vw;
      scroll-snap-align: start;
    }

    .add-stage-btn {
      height: 40px;
      font-size: 13px;
      border-radius: 10px;
    }

    .add-stage-form {
      padding: 10px;
      border-radius: 10px;
    }
  }
</style>

<!--
  看板横向滚动条样式：必须非 scoped。
  原因：① Vue scoped 会给选择器追加 [data-v] 属性，WebKit 无法识别带属性选择器的
       滚动条伪元素；② 全局 reset.scss 中 `::-webkit-scrollbar { height: 0 !important }`
       会把横向滚动条高度压为 0（不可见），这里用更高特异性的选择器 + !important 覆盖。
-->
<style lang="scss">
  .kanban-scroll::-webkit-scrollbar {
    height: 8px !important;
  }

  .kanban-scroll::-webkit-scrollbar-track {
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .kanban-scroll::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 4px;
  }

  .kanban-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--el-border-color-darker);
  }
</style>
