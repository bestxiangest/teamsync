import request from '@/utils/http'

export type CalendarSourceType =
  | 'TASK'
  | 'RECURRING_PLAN_RUN'

export type CalendarTaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'

export interface CalendarEventQueryParams {
  startDate: string
  endDate: string
  sourceType?: string
  projectId?: number
  adminView?: boolean
  assigneeIds?: string
  statuses?: string
  includeNoDueDate?: boolean
}

export interface CalendarEvent {
  id: string
  sourceType: CalendarSourceType
  sourceId: number
  title: string
  startTime: string
  endTime?: string
  dueTime?: string
  allDay: boolean
  status?: string
  priority?: number
  projectId?: number
  projectName?: string
  colorType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | string
  overdue: boolean
  targetPath?: string
}

export interface CalendarAssignee {
  userId: number
  nickname: string
  avatar?: string
}

export function fetchCalendarEvents(params: CalendarEventQueryParams) {
  return request.get<CalendarEvent[]>({
    url: '/calendar/events',
    params
  })
}

export function fetchCalendarAssignees(projectId?: number) {
  return request.get<CalendarAssignee[]>({
    url: '/calendar/assignees',
    params: { projectId }
  })
}
