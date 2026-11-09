<template>
  <ElDialog
    v-model="visible"
    title="新建任务"
    width="560px"
    :close-on-click-modal="false"
    destroy-on-close
    class="quick-task-dialog"
    @open="handleOpen"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="88px">
      <ElFormItem label="所属项目" prop="projectId">
        <ElTreeSelect
          v-model="projectSelectKey"
          :data="projectTree"
          :loading="groupsLoading"
          node-key="value"
          :props="projectTreeProps"
          filterable
          default-expand-all
          :render-after-expand="false"
          placeholder="选择项目"
          style="width: 100%"
          @change="handleProjectChange"
        />
      </ElFormItem>

      <ElFormItem label="卡片分组" prop="stageId">
        <ElSelect
          v-model="form.stageId"
          placeholder="选择项目看板中的卡片分组"
          style="width: 100%"
          :loading="stagesLoading"
          :disabled="!form.projectId"
        >
          <ElOption v-for="stage in stages" :key="stage.id" :label="stage.name" :value="stage.id" />
        </ElSelect>
        <p v-if="form.projectId && !stagesLoading && stages.length === 0" class="form-tip">
          该项目暂无可用的卡片分组，请先到项目看板创建分组
        </p>
      </ElFormItem>

      <ElFormItem label="任务标题" prop="title">
        <ElInput
          v-model="form.title"
          placeholder="请输入任务标题"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="任务描述">
        <ElInput
          v-model="form.description"
          type="textarea"
          placeholder="补充任务描述（选填）"
          :rows="3"
          maxlength="1000"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="优先级">
        <ElSelect v-model="form.priority" style="width: 100%">
          <ElOption
            v-for="item in priorityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElRow :gutter="12">
        <ElCol :span="12">
          <ElFormItem label="开始时间">
            <ElDatePicker
              v-model="form.startTime"
              type="datetime"
              placeholder="开始时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="截止时间">
            <ElDatePicker
              v-model="form.dueTime"
              type="datetime"
              placeholder="截止时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="负责人">
        <ElSelect
          v-model="form.assigneeIds"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          placeholder="选择负责人"
          style="width: 100%"
          :loading="membersLoading"
          :disabled="!form.projectId"
        >
          <ElOption
            v-for="member in members"
            :key="member.userId"
            :label="member.nickname || member.username"
            :value="member.userId"
          >
            <div class="member-option">
              <ElAvatar :size="22" :src="member.avatar">
                {{ (member.nickname || member.username)?.charAt(0) }}
              </ElAvatar>
              <span>{{ member.nickname || member.username }}</span>
            </div>
          </ElOption>
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="关注人">
        <ElSelect
          v-model="form.followerIds"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          placeholder="选择关注人（选填）"
          style="width: 100%"
          :loading="membersLoading"
          :disabled="!form.projectId"
        >
          <ElOption
            v-for="member in members"
            :key="member.userId"
            :label="member.nickname || member.username"
            :value="member.userId"
            :disabled="form.assigneeIds.includes(member.userId)"
          >
            <div class="member-option">
              <ElAvatar :size="22" :src="member.avatar">
                {{ (member.nickname || member.username)?.charAt(0) }}
              </ElAvatar>
              <span>{{ member.nickname || member.username }}</span>
            </div>
          </ElOption>
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit"> 创建任务 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import dayjs from 'dayjs'
  import { createTask, getBoardList, type BoardStage } from '@/api/board'
  import { getProjectMembers, type Member } from '@/api/member'
  import { fetchGroupList, type Project, type ProjectGroup } from '@/api/project'

  interface ProjectTreeOption {
    value: string
    label: string
    children?: ProjectTreeOption[]
  }

  const projectNodeValue = (projectId: number) => `project-${projectId}`
  const groupNodeValue = (groupId: number) => `group-${groupId}`
  const projectTreeProps = { label: 'label', children: 'children' }

  const props = defineProps<{
    projects: Project[]
    defaultDate: string
    defaultProjectId?: number
  }>()

  const visible = defineModel<boolean>('visible', { default: false })

  const emit = defineEmits<{
    (e: 'success'): void
  }>()

  const priorityOptions = [
    { value: 1, label: '普通' },
    { value: 2, label: '紧急' },
    { value: 3, label: '非常紧急' }
  ]

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const stagesLoading = ref(false)
  const membersLoading = ref(false)
  const stages = ref<BoardStage[]>([])
  const members = ref<Member[]>([])
  const groupOptions = ref<ProjectGroup[]>([])
  const groupsLoading = ref(false)
  const projectSelectKey = ref<string>()
  let groupsLoaded = false
  let projectContextSequence = 0

  const form = reactive({
    projectId: undefined as number | undefined,
    stageId: undefined as number | undefined,
    title: '',
    description: '',
    priority: 1,
    startTime: '',
    dueTime: '',
    assigneeIds: [] as number[],
    followerIds: [] as number[]
  })

  const projectTree = computed<ProjectTreeOption[]>(() => {
    const groupNodeMap = new Map<number, ProjectTreeOption>()
    const groupedNodes: ProjectTreeOption[] = []

    for (const group of groupOptions.value) {
      const groupNode: ProjectTreeOption = {
        value: groupNodeValue(group.id),
        label: group.name,
        children: []
      }
      groupNodeMap.set(group.id, groupNode)
      groupedNodes.push(groupNode)
    }

    const ungroupedProjects: ProjectTreeOption[] = []
    const sortedProjects = [...props.projects].sort((first, second) =>
      first.name.localeCompare(second.name, 'zh-CN')
    )
    for (const project of sortedProjects) {
      const projectNode: ProjectTreeOption = {
        value: projectNodeValue(project.id),
        label: project.name
      }
      const groupNode = project.groupId ? groupNodeMap.get(project.groupId) : undefined
      if (groupNode?.children) {
        groupNode.children.push(projectNode)
      } else {
        ungroupedProjects.push(projectNode)
      }
    }

    const tree = groupedNodes.filter((groupNode) => (groupNode.children?.length || 0) > 0)
    if (ungroupedProjects.length > 0) {
      tree.push({
        value: 'group-ungrouped',
        label: '未分组',
        children: ungroupedProjects
      })
    }
    return tree
  })

  const validateTimeRange = (
    _rule: unknown,
    _value: unknown,
    callback: (error?: Error) => void
  ) => {
    if (!form.startTime || !form.dueTime) {
      callback()
      return
    }
    const startTimestamp = new Date(form.startTime).getTime()
    const dueTimestamp = new Date(form.dueTime).getTime()
    if (startTimestamp >= dueTimestamp) {
      callback(new Error('开始时间必须早于截止时间'))
      return
    }
    callback()
  }

  const rules: FormRules = {
    projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
    stageId: [{ required: true, message: '请选择卡片分组', trigger: 'change' }],
    title: [
      { required: true, message: '请输入任务标题', trigger: 'blur' },
      { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
    ],
    startTime: [{ validator: validateTimeRange, trigger: 'change' }],
    dueTime: [{ validator: validateTimeRange, trigger: 'change' }]
  }

  const resetForm = () => {
    projectContextSequence += 1
    stagesLoading.value = false
    membersLoading.value = false
    projectSelectKey.value = undefined
    form.projectId = undefined
    form.stageId = undefined
    form.title = ''
    form.description = ''
    form.priority = 1
    const baseDate = dayjs(props.defaultDate)
    const datePrefix = baseDate.isValid() ? baseDate.format('YYYY-MM-DD') : ''
    form.startTime = datePrefix ? `${datePrefix}T09:00:00` : ''
    form.dueTime = datePrefix ? `${datePrefix}T18:00:00` : ''
    form.assigneeIds = []
    form.followerIds = []
    stages.value = []
    members.value = []
    formRef.value?.clearValidate()
  }

  const loadProjectContext = async (projectId: number) => {
    const sequence = ++projectContextSequence
    form.stageId = undefined
    form.assigneeIds = []
    form.followerIds = []
    stages.value = []
    members.value = []

    stagesLoading.value = true
    try {
      const board = await getBoardList(projectId)
      if (sequence === projectContextSequence) {
        stages.value = board || []
      }
    } catch (error) {
      console.error('加载项目卡片分组失败:', error)
    } finally {
      if (sequence === projectContextSequence) {
        stagesLoading.value = false
      }
    }

    membersLoading.value = true
    try {
      const data = await getProjectMembers(projectId)
      if (sequence === projectContextSequence) {
        members.value = data || []
      }
    } catch (error) {
      console.error('加载项目成员失败:', error)
    } finally {
      if (sequence === projectContextSequence) {
        membersLoading.value = false
      }
    }
  }

  const projectIdFromKey = (key?: string) => {
    if (!key?.startsWith('project-')) return undefined
    const projectId = Number(key.slice('project-'.length))
    return Number.isFinite(projectId) && projectId > 0 ? projectId : undefined
  }

  const loadGroups = async () => {
    if (groupsLoaded) return
    groupsLoading.value = true
    try {
      groupOptions.value = (await fetchGroupList()) || []
      groupsLoaded = true
    } catch (error) {
      console.error('加载项目分组失败:', error)
    } finally {
      groupsLoading.value = false
    }
  }

  const handleProjectChange = (value?: string | number) => {
    const projectId = typeof value === 'number' ? value : projectIdFromKey(value)
    form.projectId = projectId

    if (!projectId) {
      projectContextSequence += 1
      stages.value = []
      members.value = []
      stagesLoading.value = false
      membersLoading.value = false
      return
    }
    void loadProjectContext(projectId)
  }

  const handleOpen = async () => {
    resetForm()
    await loadGroups()
    const presetProjectId = props.defaultProjectId
    if (presetProjectId && props.projects.some((project) => project.id === presetProjectId)) {
      form.projectId = presetProjectId
      projectSelectKey.value = projectNodeValue(presetProjectId)
      await loadProjectContext(presetProjectId)
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || !form.projectId || !form.stageId) return

    submitting.value = true
    try {
      await createTask({
        projectId: form.projectId,
        stageId: form.stageId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        startTime: form.startTime || undefined,
        dueTime: form.dueTime || undefined,
        assigneeIds: form.assigneeIds.length > 0 ? form.assigneeIds : undefined,
        followerIds: form.followerIds.length > 0 ? form.followerIds : undefined
      })
      ElMessage.success('任务创建成功')
      visible.value = false
      emit('success')
    } catch (error) {
      console.error('创建任务失败:', error)
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .quick-task-dialog {
    :deep(.el-select) {
      width: 100%;
    }
  }

  .form-tip {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: #909399;
  }

  .member-option {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .dialog-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  @media (width <= 760px) {
    :global(.quick-task-dialog.el-dialog) {
      width: calc(100% - 24px) !important;
      margin-top: 8vh;
    }
  }
</style>
