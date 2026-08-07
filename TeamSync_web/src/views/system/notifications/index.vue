<template>
  <div class="notification-page art-full-height">
    <ElCard class="art-table-card notification-card" shadow="never">
      <div class="page-head">
        <div class="title-block">
          <div class="eyebrow">
            <ArtSvgIcon icon="ri:notification-3-line" />
            <span>站内提醒</span>
          </div>
          <h3>通知中心</h3>
          <p>{{ unreadCount > 0 ? `${unreadCount} 条通知待处理` : '当前没有未读通知' }}</p>
        </div>

        <div class="head-actions">
          <ElButton @click="loadNotifications">
            <template #icon>
              <ArtSvgIcon icon="ri:refresh-line" />
            </template>
            刷新
          </ElButton>
          <ElButton
            :disabled="selectedUnreadIds.length === 0"
            @click="handleMarkSelectedRead"
          >
            <template #icon>
              <ArtSvgIcon icon="ri:check-double-line" />
            </template>
            标记选中已读
          </ElButton>
          <ElButton
            type="primary"
            :disabled="unreadCount === 0"
            @click="handleMarkAllRead"
          >
            全部已读
          </ElButton>
        </div>
      </div>

      <div class="filter-bar">
        <ElRadioGroup v-model="readFilter" @change="handleReadFilterChange">
          <ElRadioButton value="all">全部</ElRadioButton>
          <ElRadioButton value="unread">未读</ElRadioButton>
        </ElRadioGroup>

        <ElSelect
          v-model="query.type"
          clearable
          placeholder="通知类型"
          class="type-select"
          @change="handleSearch"
          @clear="handleSearch"
        >
          <ElOption
            v-for="item in notificationTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </div>

      <ElTable
        v-loading="loading"
        :data="notifications"
        row-key="id"
        height="100%"
        class="notification-table"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="46" />
        <ElTableColumn label="状态" width="86">
          <template #default="{ row }">
            <ElTag :type="row.read ? 'info' : 'danger'" effect="light" size="small">
              {{ row.read ? '已读' : '未读' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="通知" min-width="320">
          <template #default="{ row }">
            <div class="notification-main">
              <div class="notification-title-line">
                <span class="type-icon" :class="notificationTypeMeta(row.type).className">
                  <ArtSvgIcon class="type-icon-svg" :icon="notificationTypeMeta(row.type).icon" />
                </span>
                <span class="title">{{ row.title }}</span>
                <ElTag size="small" effect="plain">
                  {{ notificationTypeMeta(row.type).label }}
                </ElTag>
              </div>
              <p>{{ row.content || '无通知内容' }}</p>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="来源" min-width="130">
          <template #default="{ row }">
            <span>{{ sourceTypeLabel(row.sourceType) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="时间" min-width="170">
          <template #default="{ row }">
            <span>{{ formatTime(row.createdAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="210" fixed="right" align="right">
          <template #default="{ row }">
            <ElButton v-if="!row.read" link type="primary" @click="handleMarkRead(row)">
              已读
            </ElButton>
            <ElButton
              link
              type="primary"
              :disabled="!row.targetPath"
              @click="handleGoTarget(row)"
            >
              去处理
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="table-footer">
        <ElPagination
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadNotifications"
          @current-change="loadNotifications"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    fetchNotificationList,
    fetchNotificationUnreadCount,
    markAllNotificationsRead,
    markNotificationRead,
    markNotificationsRead,
    type NotificationItem,
    type NotificationQueryParams,
    type NotificationType
  } from '@/api/reminder'

  defineOptions({ name: 'SystemNotifications' })

  interface NotificationTypeMeta {
    label: string
    icon: string
    className: string
  }

  const router = useRouter()
  const loading = ref(false)
  const notifications = ref<NotificationItem[]>([])
  const selectedRows = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const readFilter = ref<'all' | 'unread'>('all')

  const query = reactive<NotificationQueryParams>({
    current: 1,
    size: 20,
    type: '',
    unreadOnly: false
  })

  const pagination = reactive({
    total: 0
  })

  const notificationTypeOptions: Array<{ label: string; value: NotificationType }> = [
    { label: '任务到期', value: 'TASK_DUE' },
    { label: '任务逾期', value: 'TASK_OVERDUE' },
    { label: '任务完成', value: 'TASK_COMPLETED' },
    { label: '周期计划到期', value: 'RECURRING_PLAN_DUE' },
    { label: '周期计划逾期', value: 'RECURRING_PLAN_OVERDUE' },
    { label: '加入项目', value: 'PROJECT_MEMBER_JOINED' },
    { label: '角色调整', value: 'PROJECT_MEMBER_ROLE_UPDATED' },
    { label: '移出项目', value: 'PROJECT_MEMBER_REMOVED' },
    { label: '成员退出', value: 'PROJECT_MEMBER_QUIT' }
  ]

  const typeMetaMap: Record<NotificationType, NotificationTypeMeta> = {
    TASK_DUE: { label: '任务到期', icon: 'ri:time-line', className: 'is-warning' },
    TASK_OVERDUE: { label: '任务逾期', icon: 'ri:alarm-warning-line', className: 'is-danger' },
    TASK_COMPLETED: {
      label: '任务完成',
      icon: 'ri:checkbox-circle-line',
      className: 'is-success'
    },
    RECURRING_PLAN_DUE: { label: '周期计划到期', icon: 'ri:repeat-2-line', className: 'is-primary' },
    RECURRING_PLAN_OVERDUE: {
      label: '周期计划逾期',
      icon: 'ri:error-warning-line',
      className: 'is-danger'
    },
    PROJECT_MEMBER_JOINED: { label: '加入项目', icon: 'ri:user-add-line', className: 'is-success' },
    PROJECT_MEMBER_ROLE_UPDATED: {
      label: '角色调整',
      icon: 'ri:user-settings-line',
      className: 'is-info'
    },
    PROJECT_MEMBER_REMOVED: {
      label: '移出项目',
      icon: 'ri:user-unfollow-line',
      className: 'is-warning'
    },
    PROJECT_MEMBER_QUIT: { label: '成员退出', icon: 'ri:user-shared-line', className: 'is-info' }
  }

  const selectedUnreadIds = computed(() =>
    selectedRows.value.filter((item) => !item.read).map((item) => item.id)
  )

  const loadNotifications = async () => {
    loading.value = true
    try {
      const [page, unread] = await Promise.all([
        fetchNotificationList(query),
        fetchNotificationUnreadCount()
      ])
      notifications.value = page?.records || []
      pagination.total = page?.total || 0
      unreadCount.value = unread?.unreadCount || 0
    } catch (error) {
      console.error('加载通知列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleReadFilterChange = () => {
    query.unreadOnly = readFilter.value === 'unread'
    handleSearch()
  }

  const handleSearch = () => {
    query.current = 1
    loadNotifications()
  }

  const handleSelectionChange = (rows: NotificationItem[]) => {
    selectedRows.value = rows
  }

  const handleMarkRead = async (row: NotificationItem) => {
    await markNotificationRead(row.id)
    ElMessage.success('通知已标记为已读')
    loadNotifications()
  }

  const handleMarkSelectedRead = async () => {
    if (selectedUnreadIds.value.length === 0) return
    await markNotificationsRead({ ids: selectedUnreadIds.value })
    ElMessage.success('选中通知已标记为已读')
    loadNotifications()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    ElMessage.success('全部通知已标记为已读')
    loadNotifications()
  }

  const handleGoTarget = async (row: NotificationItem) => {
    if (!row.read) {
      await markNotificationRead(row.id)
    }
    if (row.targetPath) {
      await router.push(row.targetPath)
    }
  }

  const notificationTypeMeta = (type: NotificationType): NotificationTypeMeta => {
    return typeMetaMap[type] || {
      label: type || '通知',
      icon: 'ri:notification-3-line',
      className: 'is-primary'
    }
  }

  const sourceTypeLabel = (sourceType?: string) => {
    const map: Record<string, string> = {
      TASK: '任务',
      RECURRING_PLAN: '周期计划',
      PROJECT: '项目'
    }
    return sourceType ? map[sourceType] || sourceType : '-'
  }

  const formatTime = (value?: string) => {
    if (!value) return '-'
    const time = dayjs(value)
    return time.isValid() ? time.format('YYYY-MM-DD HH:mm') : '-'
  }

  onMounted(() => {
    loadNotifications()
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .notification-page {
    min-height: 0;
  }

  .notification-card {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
  }

  .page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .title-block {
    min-width: 0;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--el-color-primary);
    font-size: 13px;
  }

  .title-block h3 {
    margin: 6px 0 0;
    color: var(--el-text-color-primary);
    font-size: 22px;
    font-weight: 600;
  }

  .title-block p {
    margin: 5px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .head-actions,
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  .filter-bar {
    justify-content: space-between;
    padding: 16px 0;
  }

  .type-select {
    width: 220px;
  }

  .notification-table {
    flex: 1;
    min-height: 0;
  }

  .notification-main {
    min-width: 0;
  }

  .notification-title-line {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
  }

  .notification-title-line .title {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notification-main p {
    display: -webkit-box;
    margin: 6px 0 0;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .type-icon {
    display: inline-flex;
    flex: 0 0 28px;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
  }

  .type-icon-svg {
    width: 16px;
    height: 16px;
    background: transparent !important;
  }

  .type-icon.is-primary {
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  }

  .type-icon.is-success {
    color: var(--el-color-success);
    background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
  }

  .type-icon.is-warning {
    color: var(--el-color-warning);
    background: color-mix(in srgb, var(--el-color-warning) 12%, transparent);
  }

  .type-icon.is-danger {
    color: var(--el-color-danger);
    background: color-mix(in srgb, var(--el-color-danger) 12%, transparent);
  }

  .type-icon.is-info {
    color: var(--el-color-info);
    background: color-mix(in srgb, var(--el-color-info) 12%, transparent);
  }

  .table-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }

  @media screen and (width <= 768px) {
    .page-head {
      display: block;
    }

    .head-actions {
      justify-content: flex-start;
      margin-top: 14px;
    }

    .filter-bar {
      align-items: flex-start;
      justify-content: flex-start;
    }

    .type-select {
      width: 100%;
    }

    .table-footer {
      justify-content: flex-start;
      overflow-x: auto;
    }
  }
</style>
