import request from '@/utils/http'

export interface ReminderSettings {
  userId: number
  username: string
  nickname?: string
  avatar?: string
  email?: string
  isAdmin?: boolean
  emailReminderEnabled: boolean
  overdueTaskReminderEnabled: boolean
  taskCompletedEnabled: boolean
  mailChannelReady: boolean
  schedulerEnabled: boolean
}

export interface UpdateReminderSettingsParams {
  email: string
  emailReminderEnabled: boolean
  overdueTaskReminderEnabled: boolean
  taskCompletedEnabled: boolean
}

export interface ReminderTestEmailParams {
  email?: string
}

export type NotificationType =
  | 'TASK_DUE'
  | 'TASK_OVERDUE'
  | 'TASK_COMPLETED'
  | 'RECURRING_PLAN_DUE'
  | 'RECURRING_PLAN_OVERDUE'
  | 'PROJECT_MEMBER_JOINED'
  | 'PROJECT_MEMBER_ROLE_UPDATED'
  | 'PROJECT_MEMBER_REMOVED'
  | 'PROJECT_MEMBER_QUIT'

export interface NotificationItem {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string
  sourceType?: string
  sourceId?: number
  targetPath?: string
  actorId?: number
  read: boolean
  readAt?: string
  createdAt?: string
}

export interface NotificationQueryParams {
  current?: number
  size?: number
  type?: NotificationType | ''
  unreadOnly?: boolean
}

export interface NotificationUnreadCount {
  unreadCount: number
}

export interface MarkNotificationReadParams {
  ids: number[]
}

export type NotificationPage = Api.Common.PaginatedResponse<NotificationItem>

export function fetchGetReminderSettings() {
  return request.get<ReminderSettings>({
    url: '/user/reminder-settings'
  })
}

export function fetchUpdateReminderSettings(data: UpdateReminderSettingsParams) {
  return request.put<ReminderSettings>({
    url: '/user/reminder-settings',
    data
  })
}

export function fetchSendReminderTestEmail(data: ReminderTestEmailParams) {
  return request.post<void>({
    url: '/user/reminder-settings/test-email',
    data
  })
}

export function fetchNotificationList(params: NotificationQueryParams) {
  return request.get<NotificationPage>({
    url: '/notifications',
    params
  })
}

export function fetchNotificationUnreadCount() {
  return request.get<NotificationUnreadCount>({
    url: '/notifications/unread-count'
  })
}

export function markNotificationRead(id: number) {
  return request.put<NotificationItem>({
    url: `/notifications/${id}/read`
  })
}

export function markNotificationsRead(data: MarkNotificationReadParams) {
  return request.put<string>({
    url: '/notifications/read',
    data
  })
}

export function markAllNotificationsRead() {
  return request.put<string>({
    url: '/notifications/read-all'
  })
}
