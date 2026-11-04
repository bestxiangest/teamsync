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
              <ElSelect
                v-model="form.projectIds"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                class="w-full"
                placeholder="选择未归档项目"
              >
                <ElOption
                  v-for="project in projects"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </ElSelect>
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
              <ElFormItem label="每天推送时间（可多选）">
                <ElSelect
                  v-model="form.dailyTimes"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  class="w-full"
                  placeholder="例如 08:00、17:30"
                  :disabled="!form.dailyEnabled"
                >
                  <ElOption v-for="time in timeOptions" :key="time" :label="time" :value="time" />
                </ElSelect>
              </ElFormItem>
              <p class="field-hint"
                >汇总全部任务及今日到期情况，仅提醒已设置截止日期的未完成任务，包含未来到期任务。</p
              >
            </div>
            <div class="schedule-card">
              <div class="section-heading">
                <h2>本周任务完成情况</h2>
                <ElSwitch v-model="form.weeklyEnabled" active-text="启用" />
              </div>
              <ElFormItem label="每周五推送时间（可多选）">
                <ElSelect
                  v-model="form.weeklyTimes"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  class="w-full"
                  placeholder="例如 17:00、17:30"
                  :disabled="!form.weeklyEnabled"
                >
                  <ElOption v-for="time in timeOptions" :key="time" :label="time" :value="time" />
                </ElSelect>
              </ElFormItem>
              <p class="field-hint"
                >本周为周一至周日；汇总全部任务及本周到期情况，仅提醒已设置截止日期的未完成任务。</p
              >
            </div>
          </div>
          <ElAlert
            class="my-5"
            type="info"
            :closable="false"
            title="时间统一为北京时间。平台总览统计所选未归档项目的全部任务，包含无截止日期任务；提醒明细仅展示已设置截止日期的未完成任务，包含未来到期任务。今日／本周到期统计单独列出，已逾期为未完成任务的子集。"
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
          <ElOption label="本周任务完成情况" value="WEEKLY" />
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
          }}项（仅含已设置截止日期）。 {{ reportType === 'DAILY' ? '今日' : '本周' }}到期{{
            preview.periodTotal
          }}：已完成{{ preview.periodCompleted }}，处理中{{ preview.periodProcessing }}，未开始{{
            preview.periodNotStarted
          }}
        </p>
        <ElTable
          :data="preview.tasks"
          stripe
          max-height="480"
          empty-text="暂无已设置截止日期的未完成任务"
        >
          <ElTableColumn type="index" label="序号" width="65" />
          <ElTableColumn
            prop="projectName"
            label="项目名称"
            min-width="130"
            show-overflow-tooltip
          />
          <ElTableColumn prop="id" label="任务编号" min-width="100" />
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
    .schedule-grid {
      grid-template-columns: 1fr;
    }

    .section-heading {
      flex-wrap: wrap;
    }
  }
</style>
