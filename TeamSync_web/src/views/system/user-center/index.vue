<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="grid grid-cols-[340px_minmax(0,1fr)] gap-5 max-md:grid-cols-1">
      <div class="art-card-sm relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-30 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />

        <div class="relative px-8 pt-18 pb-8">
          <ElAvatar :size="76" :src="form.avatar" class="border-4 border-white shadow-sm">
            {{ displayName.charAt(0) }}
          </ElAvatar>

          <div class="mt-4 flex items-center gap-2">
            <h2 class="text-xl font-semibold text-g-900">{{ displayName }}</h2>
            <ElTag v-if="form.isAdmin" type="danger" size="small">平台管理员</ElTag>
          </div>
          <p class="mt-1 text-sm text-g-600">@{{ form.username || 'unknown' }}</p>

          <div class="mt-6 space-y-3 text-sm text-g-700">
            <div class="flex items-center gap-2">
              <ElIcon><Message /></ElIcon>
              <span>{{ form.email || '未设置提醒邮箱' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <ElIcon><Bell /></ElIcon>
              <span>{{ form.emailReminderEnabled ? '邮件提醒已开启' : '邮件提醒未开启' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <ElIcon><AlarmClock /></ElIcon>
              <span>{{ form.overdueTaskReminderEnabled ? '任务逾期提醒已开启' : '任务逾期提醒未开启' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <ElIcon><CircleCheck /></ElIcon>
              <span>{{ form.taskCompletedEnabled ? '任务完成提醒已开启' : '任务完成提醒未开启' }}</span>
            </div>
          </div>

          <ElButton class="mt-6 w-full" plain @click="goNotifications">
            <template #icon>
              <ElIcon><Bell /></ElIcon>
            </template>
            站内通知中心
          </ElButton>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="art-card-sm">
          <div class="flex items-start justify-between gap-4 border-b border-g-300 px-5 py-4">
            <div>
              <h1 class="text-xl font-normal text-g-900">邮箱提醒设置</h1>
              <p class="mt-1 text-sm text-g-600">用于接收与你相关任务的逾期和完成提醒邮件。</p>
            </div>
            <ElButton :icon="RefreshRight" text @click="loadSettings">刷新</ElButton>
          </div>

          <div class="p-5">
            <ElAlert
              v-if="!form.mailChannelReady"
              type="warning"
              :closable="false"
              class="mb-4"
              title="当前环境还没有配置 SMTP 邮件通道，设置可以先保存，但暂时无法实际发信。"
            />
            <ElAlert
              v-else-if="!form.schedulerEnabled"
              type="info"
              :closable="false"
              class="mb-4"
              title="邮件通道已就绪，但系统级逾期扫描总开关尚未开启。"
            />
            <ElAlert
              v-else
              type="success"
              :closable="false"
              class="mb-4"
              title="邮件通道与定时扫描已就绪，保存后即可按当前规则发送邮件提醒。"
            />

            <ElForm
              ref="formRef"
              :model="form"
              :rules="rules"
              label-position="top"
              class="[&_.el-input]:w-full"
              v-loading="loading"
            >
              <ElFormItem label="提醒邮箱" prop="email">
                <ElInput
                  v-model="form.email"
                  placeholder="请输入你要接收提醒的邮箱地址"
                  clearable
                />
              </ElFormItem>

              <ElFormItem label="邮件提醒总开关">
                <div class="flex w-full items-center justify-between rounded border border-g-200 px-4 py-3">
                  <div>
                    <div class="text-sm font-medium text-g-900">允许系统向我发送邮件提醒</div>
                    <div class="mt-1 text-xs text-g-600">关闭后，所有邮件提醒都会停止发送。</div>
                  </div>
                  <ElSwitch v-model="form.emailReminderEnabled" />
                </div>
              </ElFormItem>

              <ElFormItem label="任务逾期提醒">
                <div class="flex w-full items-center justify-between rounded border border-g-200 px-4 py-3">
                  <div>
                    <div class="text-sm font-medium text-g-900">任务逾期时发送提醒</div>
                    <div class="mt-1 text-xs text-g-600">
                      默认按执行者发送；如果任务没有执行者，则退回通知任务创建人。
                    </div>
                  </div>
                  <ElSwitch
                    v-model="form.overdueTaskReminderEnabled"
                    :disabled="!form.emailReminderEnabled"
                  />
                </div>
              </ElFormItem>

              <ElFormItem label="任务完成提醒">
                <div class="flex w-full items-center justify-between rounded border border-g-200 px-4 py-3">
                  <div>
                    <div class="text-sm font-medium text-g-900">任务完成时发送提醒</div>
                    <div class="mt-1 text-xs text-g-600">
                      任务从未完成或处理中切换为已完成时，提醒关注人、创建人和项目拥有者。
                    </div>
                  </div>
                  <ElSwitch
                    v-model="form.taskCompletedEnabled"
                    :disabled="!form.emailReminderEnabled"
                  />
                </div>
              </ElFormItem>

              <div class="rounded bg-g-100 px-4 py-3 text-xs leading-6 text-g-700">
                当前阶段先提供基础能力：支持邮箱保存、测试发信、逾期任务自动扫描、任务完成事件提醒与基础去重；
                更细的频率、模板和升级规则后续再细化。任务完成提醒默认关闭。
              </div>

              <div class="mt-5 flex flex-wrap justify-end gap-3">
                <ElButton
                  :loading="testing"
                  :disabled="!form.mailChannelReady || !form.email?.trim()"
                  @click="handleSendTestEmail"
                >
                  发送测试邮件
                </ElButton>
                <ElButton type="primary" :loading="saving" @click="handleSave">保存设置</ElButton>
              </div>
            </ElForm>
          </div>
        </div>

        <div class="art-card-sm">
          <div class="border-b border-g-300 px-5 py-4">
            <h1 class="text-xl font-normal text-g-900">当前默认规则</h1>
          </div>
          <div class="px-5 py-4 text-sm leading-7 text-g-700">
            <ul class="list-disc space-y-1 pl-5">
              <li>系统默认每小时整点扫描一次已逾期且未完成的任务。</li>
              <li>优先提醒任务执行者；没有执行者时，退回提醒任务创建人。</li>
              <li>任务完成邮件提醒默认关闭，开启后只提醒关注人、创建人和项目拥有者，并排除本次操作人。</li>
              <li>同一任务对同一用户同一天只提醒一次；今天已经提醒过的任务，今天不会重复发信。</li>
              <li>只有填写邮箱并主动开启开关的用户，才会收到邮件。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { AlarmClock, Bell, CircleCheck, Message, RefreshRight } from '@element-plus/icons-vue'
  import { fetchGetUserInfo } from '@/api/auth'
  import {
    fetchGetReminderSettings,
    fetchSendReminderTestEmail,
    fetchUpdateReminderSettings,
    type ReminderSettings
  } from '@/api/reminder'
  import { useUserStore } from '@/store/modules/user'
  import { useRouter } from 'vue-router'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'UserCenter' })

  const router = useRouter()
  const userStore = useUserStore()
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const saving = ref(false)
  const testing = ref(false)

  const createDefaultForm = (): ReminderSettings => ({
    userId: 0,
    username: '',
    nickname: '',
    avatar: '',
    email: '',
    isAdmin: false,
    emailReminderEnabled: false,
    overdueTaskReminderEnabled: false,
    taskCompletedEnabled: false,
    mailChannelReady: false,
    schedulerEnabled: false
  })

  const form = reactive<ReminderSettings>(createDefaultForm())

  const displayName = computed(() => form.nickname || form.username || '未设置用户')

  const rules = reactive<FormRules>({
    email: [
      {
        validator: (_rule, value, callback) => {
          const trimmed = typeof value === 'string' ? value.trim() : ''
          const required =
            form.emailReminderEnabled || form.overdueTaskReminderEnabled || form.taskCompletedEnabled
          if (required && !trimmed) {
            callback(new Error('开启邮件提醒前，请先填写邮箱'))
            return
          }
          if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            callback(new Error('请输入正确的邮箱格式'))
            return
          }
          callback()
        },
        trigger: ['blur', 'change']
      }
    ]
  })

  watch(
    () => form.emailReminderEnabled,
    (enabled) => {
      if (!enabled) {
        form.overdueTaskReminderEnabled = false
        form.taskCompletedEnabled = false
      }
    }
  )

  watch(
    () => form.overdueTaskReminderEnabled,
    (enabled) => {
      if (enabled) {
        form.emailReminderEnabled = true
      }
    }
  )

  watch(
    () => form.taskCompletedEnabled,
    (enabled) => {
      if (enabled) {
        form.emailReminderEnabled = true
      }
    }
  )

  const applySettings = (data: ReminderSettings) => {
    Object.assign(form, createDefaultForm(), data)
  }

  const loadSettings = async () => {
    loading.value = true
    try {
      const data = await fetchGetReminderSettings()
      applySettings(data)
    } catch (error) {
      console.error('获取邮箱提醒设置失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSave = async () => {
    await formRef.value?.validate()

    saving.value = true
    try {
      const data = await fetchUpdateReminderSettings({
        email: form.email?.trim() || '',
        emailReminderEnabled: form.emailReminderEnabled,
        overdueTaskReminderEnabled: form.overdueTaskReminderEnabled,
        taskCompletedEnabled: form.taskCompletedEnabled
      })
      applySettings(data)
      const latestUserInfo = await fetchGetUserInfo()
      userStore.setUserInfo(latestUserInfo)
      ElMessage.success('邮箱提醒设置已保存')
    } catch (error) {
      console.error('保存邮箱提醒设置失败:', error)
    } finally {
      saving.value = false
    }
  }

  const handleSendTestEmail = async () => {
    await formRef.value?.validateField('email')

    testing.value = true
    try {
      await fetchSendReminderTestEmail({
        email: form.email?.trim() || ''
      })
      ElMessage.success('测试邮件已发送，请检查邮箱')
    } catch (error) {
      console.error('发送测试邮件失败:', error)
    } finally {
      testing.value = false
    }
  }

  const goNotifications = () => {
    router.push('/user/notifications')
  }

  onMounted(() => {
    loadSettings()
  })
</script>
