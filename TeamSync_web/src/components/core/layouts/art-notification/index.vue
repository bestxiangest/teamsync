<!-- 通知组件 -->
<template>
  <div
    v-show="visible"
    class="art-notification-panel art-card-sm !shadow-xl"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    @click.stop
  >
    <div class="notification-head">
      <div>
        <span class="notification-title">通知中心</span>
        <small>{{ unreadCount > 0 ? `${unreadCount} 条未读` : '暂无未读' }}</small>
      </div>
      <ElButton link type="primary" :disabled="unreadCount === 0" @click="handleMarkAllRead">
        全部已读
      </ElButton>
    </div>

    <ul class="notification-tabs">
      <li
        v-for="(item, index) in barList"
        :key="item.key"
        :class="{ 'bar-active': barActiveIndex === index }"
        @click="changeBar(index)"
      >
        {{ item.name }} ({{ item.num }})
      </li>
    </ul>

    <div class="notification-body" v-loading="loading">
      <ul v-if="currentList.length > 0" class="notification-list">
        <li v-for="item in currentList" :key="item.id" @click="handleNotificationClick(item)">
          <div class="notification-icon" :class="notificationTypeMeta(item.type).iconClass">
            <ArtSvgIcon class="notification-item-svg" :icon="notificationTypeMeta(item.type).icon" />
          </div>
          <div class="notification-content">
            <div class="notification-row">
              <h4>{{ item.title }}</h4>
              <span v-if="!item.read" class="unread-dot"></span>
            </div>
            <p>{{ item.content }}</p>
            <small>{{ formatTime(item.createdAt) }}</small>
          </div>
        </li>
      </ul>

      <div v-else class="notification-empty">
        <ArtSvgIcon class="notification-empty-svg" icon="system-uicons:inbox" />
        <p>{{ emptyText }}</p>
      </div>
    </div>

    <div class="notification-footer">
      <ElButton class="w-full" @click="handleViewAll" v-ripple>查看全部通知</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Client, type IMessage } from '@stomp/stompjs'
  import dayjs from 'dayjs'
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    fetchNotificationList,
    fetchNotificationUnreadCount,
    markAllNotificationsRead,
    markNotificationRead,
    type NotificationItem,
    type NotificationType,
    type NotificationUnreadCount
  } from '@/api/reminder'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'ArtNotification' })

  const props = defineProps<{
    value: boolean
  }>()

  const emit = defineEmits<{
    'update:value': [value: boolean]
    'unread-change': [value: number]
  }>()

  interface BarItem {
    key: string
    name: string
    num: number
  }

  interface NotificationStyle {
    icon: string
    iconClass: string
  }

  const router = useRouter()
  const userStore = useUserStore()
  const show = ref(false)
  const visible = ref(false)
  const loading = ref(false)
  const barActiveIndex = ref(0)
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const client = ref<Client>()

  const pendingTypes: NotificationType[] = [
    'TASK_DUE',
    'TASK_OVERDUE',
    'RECURRING_PLAN_DUE',
    'RECURRING_PLAN_OVERDUE'
  ]

  const barList = computed<BarItem[]>(() => [
    { key: 'all', name: '全部', num: notifications.value.length },
    { key: 'unread', name: '未读', num: unreadCount.value },
    {
      key: 'pending',
      name: '待办',
      num: notifications.value.filter((item) => pendingTypes.includes(item.type)).length
    }
  ])

  const currentList = computed(() => {
    if (barActiveIndex.value === 1) {
      return notifications.value.filter((item) => !item.read)
    }
    if (barActiveIndex.value === 2) {
      return notifications.value.filter((item) => pendingTypes.includes(item.type))
    }
    return notifications.value
  })

  const emptyText = computed(() => {
    const currentTab = barList.value[barActiveIndex.value]
    return currentTab ? `暂无${currentTab.name}通知` : '暂无通知'
  })

  const showNotice = (open: boolean) => {
    if (open) {
      visible.value = true
      loadNotifications()
      setTimeout(() => {
        show.value = true
      }, 5)
    } else {
      show.value = false
      setTimeout(() => {
        visible.value = false
      }, 350)
    }
  }

  const changeBar = (index: number) => {
    barActiveIndex.value = index
  }

  const loadNotifications = async () => {
    loading.value = true
    try {
      const [page, unread] = await Promise.all([
        fetchNotificationList({ current: 1, size: 20 }),
        fetchNotificationUnreadCount()
      ])
      notifications.value = page?.records || []
      syncUnreadCount(unread?.unreadCount || 0)
    } catch (error) {
      console.error('获取站内通知失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadUnreadCount = async () => {
    try {
      const data = await fetchNotificationUnreadCount()
      syncUnreadCount(data?.unreadCount || 0)
    } catch (error) {
      console.error('获取未读通知数失败:', error)
    }
  }

  const syncUnreadCount = (value: number) => {
    unreadCount.value = value
    emit('unread-change', value)
  }

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await markNotificationRead(item.id)
        item.read = true
        syncUnreadCount(Math.max(unreadCount.value - 1, 0))
      } catch (error) {
        console.error('标记通知已读失败:', error)
      }
    }

    if (item.targetPath) {
      await router.push(item.targetPath)
      emit('update:value', false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
      syncUnreadCount(0)
    } catch (error) {
      console.error('全部标记已读失败:', error)
    }
  }

  const handleViewAll = async () => {
    await router.push('/user/notifications')
    emit('update:value', false)
  }

  const notificationTypeMeta = (type: NotificationType): NotificationStyle => {
    const map: Record<NotificationType, NotificationStyle> = {
      TASK_DUE: { icon: 'ri:time-line', iconClass: 'is-warning' },
      TASK_OVERDUE: { icon: 'ri:alarm-warning-line', iconClass: 'is-danger' },
      TASK_COMPLETED: { icon: 'ri:checkbox-circle-line', iconClass: 'is-success' },
      RECURRING_PLAN_DUE: { icon: 'ri:repeat-2-line', iconClass: 'is-primary' },
      RECURRING_PLAN_OVERDUE: { icon: 'ri:error-warning-line', iconClass: 'is-danger' },
      PROJECT_MEMBER_JOINED: { icon: 'ri:user-add-line', iconClass: 'is-success' },
      PROJECT_MEMBER_ROLE_UPDATED: { icon: 'ri:user-settings-line', iconClass: 'is-info' },
      PROJECT_MEMBER_REMOVED: { icon: 'ri:user-unfollow-line', iconClass: 'is-warning' },
      PROJECT_MEMBER_QUIT: { icon: 'ri:user-shared-line', iconClass: 'is-info' }
    }
    return map[type] || { icon: 'ri:notification-3-line', iconClass: 'is-primary' }
  }

  const formatTime = (value?: string) => {
    if (!value) return '-'
    const time = dayjs(value)
    return time.isValid() ? time.format('YYYY-MM-DD HH:mm') : '-'
  }

  const getWsUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.VITE_API_PROXY_URL
      ? new URL(import.meta.env.VITE_API_PROXY_URL).host
      : window.location.host
    return `${protocol}//${host}/ws`
  }

  const connectNotificationSocket = () => {
    const userId = userStore.info?.userId
    if (!userId || client.value?.active) return

    client.value = new Client({
      brokerURL: getWsUrl(),
      connectHeaders: {
        Authorization: `Bearer ${userStore.accessToken || ''}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (message) => {
        if (import.meta.env.DEV) console.log('[NotificationSocket]', message)
      },
      onConnect: () => {
        client.value?.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
          try {
            const data = JSON.parse(message.body) as NotificationUnreadCount
            syncUnreadCount(data.unreadCount || 0)
            loadNotifications()
          } catch (error) {
            console.error('解析通知 WebSocket 消息失败:', error)
          }
        })
      }
    })

    client.value.activate()
  }

  watch(
    () => props.value,
    (newValue) => {
      showNotice(newValue)
    }
  )

  onMounted(() => {
    loadUnreadCount()
    connectNotificationSocket()
  })

  onBeforeUnmount(() => {
    client.value?.deactivate()
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .art-notification-panel {
    @apply absolute 
    top-14.5 
    right-5 
    w-96 
    h-125 
    overflow-hidden 
    transition-all 
    duration-300
    origin-top 
    will-change-[top,left] 
    max-[640px]:top-[65px]
    max-[640px]:right-0
    max-[640px]:w-full 
    max-[640px]:h-[80vh];
  }

  .notification-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 14px 10px;
  }

  .notification-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .notification-head small {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .notification-tabs {
    display: flex;
    align-items: flex-end;
    height: 46px;
    padding: 0 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .notification-tabs li {
    height: 46px;
    margin-right: 20px;
    overflow: hidden;
    font-size: 13px;
    line-height: 46px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    user-select: none;
  }

  .bar-active {
    color: var(--theme-color) !important;
    border-bottom: 2px solid var(--theme-color);
  }

  .notification-body {
    height: calc(100% - 116px);
    overflow-y: auto;
  }

  .notification-list li {
    display: flex;
    gap: 12px;
    padding: 13px 14px;
    cursor: pointer;
  }

  .notification-list li:hover {
    background: var(--el-fill-color-lighter);
  }

  .notification-icon {
    display: flex;
    flex: 0 0 36px;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .notification-item-svg {
    width: 18px;
    height: 18px;
    background: transparent !important;
  }

  .notification-icon.is-primary {
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  }

  .notification-icon.is-success {
    color: var(--el-color-success);
    background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
  }

  .notification-icon.is-warning {
    color: var(--el-color-warning);
    background: color-mix(in srgb, var(--el-color-warning) 12%, transparent);
  }

  .notification-icon.is-danger {
    color: var(--el-color-danger);
    background: color-mix(in srgb, var(--el-color-danger) 12%, transparent);
  }

  .notification-icon.is-info {
    color: var(--el-color-info);
    background: color-mix(in srgb, var(--el-color-info) 12%, transparent);
  }

  .notification-content {
    min-width: 0;
    flex: 1;
  }

  .notification-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .notification-row h4 {
    overflow: hidden;
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notification-content p {
    display: -webkit-box;
    margin: 5px 0 0;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.45;
    color: var(--el-text-color-secondary);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .notification-content small {
    display: block;
    margin-top: 6px;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }

  .unread-dot {
    width: 7px;
    height: 7px;
    margin-left: auto;
    background: var(--el-color-danger);
    border-radius: 999px;
  }

  .notification-empty {
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-placeholder);
  }

  .notification-empty-svg {
    width: 46px;
    height: 46px;
    background: transparent !important;
  }

  .notification-empty p {
    margin: 12px 0 0;
    font-size: 12px;
  }

  .notification-footer {
    padding: 12px 14px 14px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
