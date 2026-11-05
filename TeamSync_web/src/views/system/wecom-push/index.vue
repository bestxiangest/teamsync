<template>
  <div class="wecom-page">
    <div class="art-card-sm p-5" v-loading="loading">
      <div class="section-heading">
        <div>
          <h1 class="text-xl text-g-900">企业微信推送</h1>
          <p class="mt-2 text-sm text-g-600">将所选项目的任务完成情况定时推送到企业微信群。</p>
        </div>
        <ElButton :disabled="saving || loading" @click="load">刷新配置</ElButton>
      </div>
      <ElAlert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon />
      <template v-if="settings">
        <ElAlert
          v-if="!settings.encryptionReady || !settings.dispatchEnabled"
          class="mb-5"
          type="warning"
          :closable="false"
          show-icon
          :title="
            !settings.encryptionReady
              ? '服务端尚未配置 Webhook 加密密钥'
              : '服务端尚未开启企业微信推送'
          "
          description="请按部署说明设置 TEAMSYNC_WECOM_ENCRYPTION_KEY 和 TEAMSYNC_WECOM_ENABLED=true，然后重启后端。"
        />
        <ElForm label-position="top" :disabled="saving">
          <ElFormItem label="群消息推送 Webhook">
            <div class="w-full">
              <ElInput
                v-model="form.webhookUrl"
                type="password"
                show-password
                autocomplete="new-password"
                :placeholder="
                  settings.webhookConfigured
                    ? '已配置，留空保留原地址；填写新地址可替换'
                    : '请输入企业微信群消息推送 Webhook 地址'
                "
              />
              <p class="field-hint"
                >在目标企业微信群创建“消息推送”（原群机器人），复制 Webhook
                到此处。地址加密保存，不回显。</p
              >
            </div>
          </ElFormItem>
          <ElFormItem label="推送项目">
            <div class="w-full">
              <div class="actions">
                <ElButton @click="openProjectDialog">选择项目</ElButton>
                <span class="text-sm text-g-600"
                  >已选 {{ form.projectIds.length }} / {{ projects.length }} 个未归档项目</span
                >
              </div>
              <div v-if="selectedProjects.length" class="selected-projects">
                <ElTag
                  v-for="project in selectedProjects"
                  :key="project.id"
                  :closable="!saving"
                  @close="form.projectIds = form.projectIds.filter((id) => id !== project.id)"
                  >{{ project.name }}</ElTag
                >
              </div>
              <p class="field-hint">仅列出未归档项目；统计时再次排除已归档、已删除项目。</p>
              <p v-if="removedProjects" class="text-sm text-orange-600"
                >有 {{ removedProjects }} 个原选项目已不可用，本次已移除，请保存更新。</p
              >
            </div>
          </ElFormItem>
          <div class="schedule-grid">
            <div class="schedule-card">
              <div class="section-heading">
                <h2>当日任务完成情况</h2>
                <ElSwitch v-model="form.dailyEnabled" active-text="启用" />
              </div>
              <ElFormItem label="周一至周五推送时间（可多选）">
                <div class="w-full">
                  <ElButton :disabled="!form.dailyEnabled" @click="openTimeDialog('DAILY')"
                    >选择时间</ElButton
                  >
                  <div v-if="form.dailyTimes.length" class="selected-times">
                    <ElTag
                      v-for="time in form.dailyTimes"
                      :key="time"
                      :closable="form.dailyEnabled && !saving"
                      @close="form.dailyTimes = form.dailyTimes.filter((value) => value !== time)"
                      >{{ time }}</ElTag
                    >
                  </div>
                  <p v-else class="field-hint">尚未选择推送时间</p>
                </div>
              </ElFormItem>
              <p class="field-hint"
                >汇总全部任务及今日到期情况，仅提醒今天到期及历史逾期的未完成任务。</p
              >
            </div>
            <div class="schedule-card">
              <div class="section-heading">
                <h2>未来一周任务提醒</h2>
                <ElSwitch v-model="form.weeklyEnabled" active-text="启用" />
              </div>
              <ElFormItem label="周一至周五推送时间（可多选）">
                <div class="w-full">
                  <ElButton :disabled="!form.weeklyEnabled" @click="openTimeDialog('WEEKLY')"
                    >选择时间</ElButton
                  >
                  <div v-if="form.weeklyTimes.length" class="selected-times">
                    <ElTag
                      v-for="time in form.weeklyTimes"
                      :key="time"
                      :closable="form.weeklyEnabled && !saving"
                      @close="form.weeklyTimes = form.weeklyTimes.filter((value) => value !== time)"
                      >{{ time }}</ElTag
                    >
                  </div>
                  <p v-else class="field-hint">尚未选择推送时间</p>
                </div>
              </ElFormItem>
              <p class="field-hint"
                >从推送时刻起计算未来 7 天，仅提醒此范围内到期的未完成任务，超过 7 天不展示。</p
              >
            </div>
          </div>
          <ElAlert
            class="my-5"
            type="info"
            :closable="false"
            title="两类推送均在周一至周五按各自所选时间发送，周六、周日不自动推送。时间统一为北京时间。平台总览包含所选未归档项目的全部任务。日报提醒今天到期及历史逾期的未完成任务；周报提醒推送时刻起未来 7 天内到期的未完成任务。无截止日期任务不提醒。"
          />
          <div class="actions">
            <span v-if="dirty" class="text-sm text-g-600">配置已修改，请保存后预览或推送。</span>
            <ElButton type="primary" :loading="saving" :disabled="loading" @click="save"
              >保存配置</ElButton
            >
          </div>
        </ElForm>
      </template>
    </div>

    <div v-if="settings" class="art-card-sm p-5">
      <div class="section-heading">
        <div>
          <h2 class="text-lg">预览与手动推送</h2>
          <p class="field-hint"
            >使用已保存配置。手动推送会发送真实任务到群内，可在下方查看队列进度。</p
          >
        </div>
      </div>
      <div class="actions">
        <ElSelect
          v-model="reportType"
          class="report-type"
          :disabled="previewing || sending"
          @change="preview = null"
        >
          <ElOption label="当日任务完成情况" value="DAILY" />
          <ElOption label="未来一周任务提醒" value="WEEKLY" />
        </ElSelect>
        <ElButton
          :loading="previewing"
          :disabled="dirty || !form.projectIds.length || saving || loading"
          @click="showPreview"
          >预览消息</ElButton
        >
        <ElButton type="success" :loading="sending" :disabled="!canSend" @click="send"
          >推送到群</ElButton
        >
      </div>
      <template v-if="preview">
        <p class="mt-5 text-sm text-g-600"
          >{{ preview.startDate }} ～ {{ preview.endDate }} · 共
          {{ preview.messages.length }} 条消息</p
        >
        <p class="my-3"
          >统计范围：所选 {{ preview.projectCount }} 个未归档项目。平台总任务{{
            preview.total
          }}，已完成{{ preview.completed }}，处理中{{ preview.processing }}，未开始{{
            preview.notStarted
          }}，已逾期{{ preview.overdue }}</p
        >
        <p class="my-3">
          未完成{{ preview.total - preview.completed }}，提醒明细{{
            preview.tasks.length
          }}项（仅含已设置截止日期）。 {{ reportType === 'DAILY' ? '今日' : '未来7天' }}到期{{
            preview.periodTotal
          }}：已完成{{ preview.periodCompleted }}，处理中{{ preview.periodProcessing }}，未开始{{
            preview.periodNotStarted
          }}
        </p>
        <ElTable
          :data="preview.tasks"
          stripe
          max-height="480"
          :empty-text="
            reportType === 'DAILY'
              ? '暂无今日到期或历史逾期的未完成任务'
              : '暂无未来7天内到期的未完成任务'
          "
        >
          <ElTableColumn type="index" label="序号" width="65" />
          <ElTableColumn
            prop="projectName"
            label="项目名称"
            min-width="130"
            show-overflow-tooltip
          />
          <ElTableColumn prop="title" label="任务标题" min-width="190" show-overflow-tooltip />
          <ElTableColumn label="负责人" min-width="140"
            ><template #default="{ row }">{{ row.assignees || '未分配' }}</template></ElTableColumn
          >
          <ElTableColumn label="优先级" width="100"
            ><template #default="{ row }">{{
              priorityLabels[row.priority] || '普通'
            }}</template></ElTableColumn
          >
          <ElTableColumn label="任务状态" width="100"
            ><template #default="{ row }">{{
              statusLabels[row.status] || '未知'
            }}</template></ElTableColumn
          >
          <ElTableColumn label="截止时间" min-width="165"
            ><template #default="{ row }">{{
              row.dueTime ? row.dueTime.replace('T', ' ').slice(0, 16) : '未设置'
            }}</template></ElTableColumn
          >
          <ElTableColumn prop="deadlineHint" label="到期提示" min-width="120" />
        </ElTable>
        <ElCollapse class="mt-4">
          <ElCollapseItem title="查看实际发送的消息文本" name="messages">
            <pre
              v-for="(message, index) in preview.messages"
              :key="index"
              class="message-preview"
              >{{ message }}</pre
            >
          </ElCollapseItem>
        </ElCollapse>
      </template>
    </div>

    <div v-if="settings" class="art-card-sm p-5">
      <div class="section-heading">
        <div
          ><h2 class="text-lg">最近发送记录</h2
          ><p class="field-hint">显示最近 30 次推送，时间为北京时间；队列处理中会自动刷新。</p></div
        >
        <ElButton :loading="jobsLoading" @click="loadJobs">刷新记录</ElButton>
      </div>
      <ElTable :data="jobs" stripe empty-text="暂无推送记录">
        <ElTableColumn prop="createdAt" label="创建时间" min-width="170" />
        <ElTableColumn label="类型" width="90"
          ><template #default="{ row }">{{
            row.reportType === 'DAILY' ? '日报' : '周报'
          }}</template></ElTableColumn
        >
        <ElTableColumn label="触发方式" width="100"
          ><template #default="{ row }">{{
            row.triggerType === 'MANUAL' ? '手动推送' : '定时推送'
          }}</template></ElTableColumn
        >
        <ElTableColumn label="状态" width="100"
          ><template #default="{ row }"
            ><ElTag :type="jobTag(row.status)">{{ jobLabel(row.status) }}</ElTag></template
          ></ElTableColumn
        >
        <ElTableColumn label="成功条数" width="100"
          ><template #default="{ row }"
            >{{ row.sentParts }} / {{ row.totalParts }}</template
          ></ElTableColumn
        >
        <ElTableColumn prop="errorMessage" label="失败原因" min-width="220" />
      </ElTable>
    </div>

    <ElDialog
      v-model="projectDialogVisible"
      title="选择推送项目"
      width="min(880px, calc(100vw - 32px))"
      append-to-body
    >
      <ElInput
        v-model="projectSearch"
        clearable
        placeholder="搜索项目名称"
        aria-label="搜索项目名称"
      />
      <div class="selection-toolbar">
        <ElCheckbox
          :model-value="allFilteredProjectsSelected"
          :indeterminate="someFilteredProjectsSelected"
          :disabled="!filteredProjects.length"
          @change="toggleFilteredProjects"
          >全选搜索结果（{{ filteredProjects.length }}）</ElCheckbox
        >
        <ElButton text :disabled="!draftProjectIds.length" @click="draftProjectIds = []"
          >清空全部</ElButton
        >
      </div>
      <div class="project-options">
        <ElCheckboxGroup v-model="draftProjectIds" class="project-checkbox-grid">
          <ElCheckbox
            v-for="project in filteredProjects"
            :key="project.id"
            :value="project.id"
            border
            >{{ project.name }}</ElCheckbox
          >
        </ElCheckboxGroup>
        <ElEmpty
          v-if="!filteredProjects.length"
          description="没有匹配的未归档项目"
          :image-size="64"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <span class="text-sm text-g-600">已选 {{ draftProjectIds.length }} 个项目</span>
          <div class="actions">
            <ElButton @click="projectDialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="confirmProjects">确认选择</ElButton>
          </div>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="timeDialogVisible"
      :title="timeDialogType === 'DAILY' ? '选择当日任务推送时间' : '选择未来一周提醒推送时间'"
      width="min(760px, calc(100vw - 32px))"
      append-to-body
    >
      <p class="field-hint">周一至周五执行，周末跳过；北京时间，每半小时一个时间点，可多选。</p>
      <ElCheckboxGroup v-model="draftTimes" class="time-checkbox-grid">
        <ElCheckbox v-for="time in timeOptions" :key="time" :value="time" border>{{
          time
        }}</ElCheckbox>
      </ElCheckboxGroup>
      <template #footer>
        <div class="dialog-footer">
          <span class="text-sm text-g-600">已选 {{ draftTimes.length }} 个时间点</span>
          <div class="actions">
            <ElButton :disabled="!draftTimes.length" @click="draftTimes = []">清空</ElButton>
            <ElButton @click="timeDialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="confirmTimes">确认选择</ElButton>
          </div>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    fetchWecomJobs,
    fetchWecomPreview,
    fetchWecomProjects,
    fetchWecomSettings,
    saveWecomSettings,
    sendWecomReport,
    type WecomJob,
    type WecomPreview,
    type WecomProject,
    type WecomReportType,
    type WecomSettings,
    type WecomSettingsRequest
  } from '@/api/wecom-push'

  defineOptions({ name: 'WecomPush' })

  const loading = ref(false)
  const saving = ref(false)
  const sending = ref(false)
  const previewing = ref(false)
  const jobsLoading = ref(false)
  const loadError = ref('')
  const removedProjects = ref(0)
  const settings = ref<WecomSettings | null>(null)
  const projects = ref<WecomProject[]>([])
  const jobs = ref<WecomJob[]>([])
  const preview = ref<WecomPreview | null>(null)
  const reportType = ref<WecomReportType>('DAILY')
  const form = reactive<WecomSettingsRequest>({
    webhookUrl: '',
    dailyEnabled: false,
    dailyTimes: [],
    weeklyEnabled: false,
    weeklyTimes: [],
    projectIds: []
  })
  const projectDialogVisible = ref(false)
  const projectSearch = ref('')
  const draftProjectIds = ref<number[]>([])
  const timeDialogVisible = ref(false)
  const timeDialogType = ref<WecomReportType>('DAILY')
  const draftTimes = ref<string[]>([])
  const selectedProjects = computed(() =>
    projects.value.filter((p) => form.projectIds.includes(p.id))
  )
  const filteredProjects = computed(() => {
    const keyword = projectSearch.value.trim().toLocaleLowerCase()
    return projects.value.filter((p) => p.name.toLocaleLowerCase().includes(keyword))
  })
  const filteredSelectedCount = computed(
    () => filteredProjects.value.filter((p) => draftProjectIds.value.includes(p.id)).length
  )
  const allFilteredProjectsSelected = computed(
    () =>
      filteredProjects.value.length > 0 &&
      filteredSelectedCount.value === filteredProjects.value.length
  )
  const someFilteredProjectsSelected = computed(
    () => filteredSelectedCount.value > 0 && !allFilteredProjectsSelected.value
  )
  const savedForm = ref('')
  const dirty = computed(() => JSON.stringify(form) !== savedForm.value)
  const canSend = computed(
    () =>
      !dirty.value &&
      !loading.value &&
      !saving.value &&
      !!settings.value?.webhookConfigured &&
      settings.value.encryptionReady &&
      settings.value.dispatchEnabled &&
      form.projectIds.length > 0
  )
  const timeOptions = Array.from(
    { length: 48 },
    (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`
  )
  const priorityLabels: Record<number, string> = { 1: '普通', 2: '紧急', 3: '非常紧急' }
  const statusLabels: Record<number, string> = { 0: '未开始', 1: '已完成', 2: '处理中' }
  const jobLabels: Record<WecomJob['status'], string> = {
    PENDING: '排队中',
    SENDING: '发送中',
    SUCCESS: '已成功',
    FAILED: '失败'
  }
  let pollTimer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  function openProjectDialog() {
    draftProjectIds.value = [...form.projectIds]
    projectSearch.value = ''
    projectDialogVisible.value = true
  }

  function toggleFilteredProjects(checked: string | number | boolean) {
    const visibleIds = new Set(filteredProjects.value.map((p) => p.id))
    draftProjectIds.value = checked
      ? [...new Set([...draftProjectIds.value, ...visibleIds])]
      : draftProjectIds.value.filter((id) => !visibleIds.has(id))
  }

  function confirmProjects() {
    form.projectIds = [...draftProjectIds.value].sort((a, b) => a - b)
    projectDialogVisible.value = false
  }

  function openTimeDialog(type: WecomReportType) {
    timeDialogType.value = type
    draftTimes.value = [...(type === 'DAILY' ? form.dailyTimes : form.weeklyTimes)]
    timeDialogVisible.value = true
  }

  function confirmTimes() {
    const times = [...draftTimes.value].sort()
    if (timeDialogType.value === 'DAILY') form.dailyTimes = times
    else form.weeklyTimes = times
    timeDialogVisible.value = false
  }

  function jobTag(status: WecomJob['status']) {
    return status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'danger' : 'info'
  }

  function jobLabel(status: WecomJob['status']) {
    return jobLabels[status]
  }

  function applySettings(value: WecomSettings) {
    settings.value = value
    Object.assign(form, {
      webhookUrl: '',
      dailyEnabled: value.dailyEnabled,
      dailyTimes: [...value.dailyTimes],
      weeklyEnabled: value.weeklyEnabled,
      weeklyTimes: [...value.weeklyTimes],
      projectIds: [...value.projectIds]
    })
    savedForm.value = JSON.stringify(form)
  }

  async function load() {
    loading.value = true
    loadError.value = ''
    try {
      const [config, options] = await Promise.all([fetchWecomSettings(), fetchWecomProjects()])
      projects.value = options
      applySettings(config)
      const valid = new Set(options.map((p) => p.id))
      form.projectIds = config.projectIds.filter((id) => valid.has(id))
      removedProjects.value = config.projectIds.length - form.projectIds.length
      preview.value = null
      await loadJobs()
    } catch {
      loadError.value =
        '配置加载失败。请确认账号具备平台管理员权限，并已在数据库执行 doc/sql/wecom_push.sql，然后重试。'
    } finally {
      loading.value = false
    }
  }

  async function save() {
    if ((form.dailyEnabled || form.weeklyEnabled) && !form.projectIds.length)
      return void ElMessage.warning('请至少选择一个项目')
    if (form.dailyEnabled && !form.dailyTimes.length)
      return void ElMessage.warning('请选择日报推送时间')
    if (form.weeklyEnabled && !form.weeklyTimes.length)
      return void ElMessage.warning('请选择周报推送时间')
    saving.value = true
    try {
      applySettings(await saveWecomSettings({ ...form, webhookUrl: form.webhookUrl.trim() }))
      preview.value = null
      removedProjects.value = 0
      ElMessage.success('推送配置已保存')
    } catch {
      /* 请求层显示错误 */
    } finally {
      saving.value = false
    }
  }

  async function showPreview() {
    previewing.value = true
    try {
      preview.value = await fetchWecomPreview(reportType.value)
    } catch {
      /* 请求层显示错误 */
    } finally {
      previewing.value = false
    }
  }

  async function send() {
    const type = reportType.value
    sending.value = true
    try {
      await sendWecomReport(type)
      ElMessage.success('已加入发送队列，请查看发送记录')
      await loadJobs()
    } catch {
      /* 请求层显示错误 */
    } finally {
      sending.value = false
    }
  }

  async function loadJobs() {
    if (jobsLoading.value) return
    if (pollTimer) clearTimeout(pollTimer)
    jobsLoading.value = true
    try {
      jobs.value = await fetchWecomJobs()
      if (!disposed && jobs.value.some((j) => j.status === 'PENDING' || j.status === 'SENDING')) {
        pollTimer = setTimeout(loadJobs, 5000)
      }
    } catch {
      /* 请求层显示错误，停止自动刷新 */
    } finally {
      jobsLoading.value = false
    }
  }

  onMounted(load)
  onBeforeUnmount(() => {
    disposed = true
    if (pollTimer) clearTimeout(pollTimer)
  })
</script>

<style scoped lang="scss">
  .wecom-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section-heading {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .schedule-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .schedule-card {
    padding: 20px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  .field-hint {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .actions :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  .selected-projects,
  .selected-times {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .selected-projects {
    max-height: 160px;
    overflow: auto;
  }

  .selected-projects :deep(.el-tag) {
    height: auto;
    min-height: 24px;
    padding-block: 4px;
    white-space: normal;
  }

  .selected-projects :deep(.el-tag__content) {
    overflow-wrap: anywhere;
  }

  .selection-toolbar,
  .dialog-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .selection-toolbar {
    margin-block: 16px;
  }

  .project-options {
    height: min(360px, 45vh);
    overflow: auto;
  }

  .project-checkbox-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 1px;
  }

  .project-checkbox-grid :deep(.el-checkbox) {
    height: auto;
    min-height: 40px;
    padding-block: 10px;
    margin-right: 0;
  }

  .project-checkbox-grid :deep(.el-checkbox__label) {
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .time-checkbox-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
    max-height: 50vh;
    padding: 1px;
    margin-top: 16px;
    overflow: auto;
  }

  .time-checkbox-grid :deep(.el-checkbox) {
    justify-content: center;
    padding-inline: 8px;
    margin-right: 0;
  }

  .report-type {
    width: 220px;
  }

  .message-preview {
    padding: 12px;
    margin: 12px 0;
    overflow: auto;
    font-size: 12px;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  @media (width <= 768px) {
    .schedule-grid,
    .project-checkbox-grid {
      grid-template-columns: 1fr;
    }

    .time-checkbox-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .section-heading {
      flex-wrap: wrap;
    }
  }
</style>
