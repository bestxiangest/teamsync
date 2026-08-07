import request from '@/utils/http'

export type RecurrenceUnit = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'HALF_YEAR' | 'YEAR'

export type RecurringPlanStatus = 'ACTIVE' | 'PAUSED' | 'FINISHED'

export type RecurringPlanOccurrenceStatus =
  | 'PENDING'
  | 'DONE'
  | 'SKIPPED'
  | 'DEFERRED'
  | 'CANCELLED'
  | 'OVERDUE'

export type RecurringPlanCurrentOccurrenceStatus = RecurringPlanOccurrenceStatus | 'NONE'

export interface RecurringPlanAssignee {
  userId: number
  nickname?: string
  avatar?: string
}

export interface RecurringPlan {
  id: number
  projectId?: number
  stageId?: number
  title: string
  description?: string
  priority: number
  status: RecurringPlanStatus
  recurrenceUnit: RecurrenceUnit
  intervalCount: number
  startTime: string
  dueTime?: string
  endTime?: string
  nextRunAt?: string
  nextDueTime?: string
  lastRunAt?: string
  timezone?: string
  reminderEnabled: boolean
  reminderMinutesBefore?: number
  autoCreateTask: boolean
  maxOccurrences?: number
  generatedCount: number
  creatorId: number
  creatorName?: string
  creatorAvatar?: string
  assigneeIds?: number[]
  assignees?: RecurringPlanAssignee[]
  overdue?: boolean
  overdueReason?: string
  currentOccurrenceStatus?: RecurringPlanCurrentOccurrenceStatus
  currentOccurrenceActionable?: boolean
  currentOccurrenceId?: number
  currentOccurrenceNo?: number
  currentGeneratedTaskId?: number
  createdAt?: string
  updatedAt?: string
}

export interface RecurringPlanOccurrence {
  id: number
  planId: number
  occurrenceNo: number
  title: string
  status: RecurringPlanOccurrenceStatus
  scheduledStartAt: string
  dueTime?: string
  completedAt?: string
  completedBy?: number
  completedByName?: string
  generatedTaskId?: number
  assignees?: RecurringPlanAssignee[]
  notes?: string
  overdue?: boolean
  overdueReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface RecurringPlanQueryParams {
  current?: number
  size?: number
  keyword?: string
  status?: RecurringPlanStatus
  recurrenceUnit?: RecurrenceUnit
  creatorId?: number
  nextRunStart?: string
  nextRunEnd?: string
}

export interface RecurringPlanOccurrenceQueryParams {
  current?: number
  size?: number
  status?: RecurringPlanOccurrenceStatus
}

export interface RecurringPlanPayload {
  projectId?: number
  stageId?: number
  title: string
  description?: string
  priority?: number
  recurrenceUnit: RecurrenceUnit
  intervalCount: number
  startTime: string
  dueTime?: string
  endTime?: string
  timezone?: string
  reminderEnabled?: boolean
  reminderMinutesBefore?: number
  autoCreateTask?: boolean
  maxOccurrences?: number
  assigneeIds: number[]
}

export interface RecurringPlanOccurrenceActionPayload {
  notes?: string
}

export interface RecurringPlanGeneratedTask {
  id: number
  stageId: number
  title: string
  description?: string
  priority: number
  status: number
  dueTime?: string
  sort?: number
  creatorId?: number
  createdAt?: string
  updatedAt?: string
}

export interface RecurringPlanGenerateTaskResponse {
  planId: number
  occurrenceId: number
  occurrenceNo: number
  projectId: number
  stageId: number
  generatedTaskId: number
  reused: boolean
  task?: RecurringPlanGeneratedTask
  occurrence?: RecurringPlanOccurrence
}

export type RecurringPlanPage = Api.Common.PaginatedResponse<RecurringPlan>

export type RecurringPlanOccurrencePage = Api.Common.PaginatedResponse<RecurringPlanOccurrence>

export function fetchRecurringPlanList(params: RecurringPlanQueryParams) {
  return request.get<RecurringPlanPage>({
    url: '/recurring-plans',
    params
  })
}

export function getRecurringPlan(id: number) {
  return request.get<RecurringPlan>({
    url: `/recurring-plans/${id}`
  })
}

export function createRecurringPlan(data: RecurringPlanPayload) {
  return request.post<RecurringPlan>({
    url: '/recurring-plans',
    data
  })
}

export function updateRecurringPlan(id: number, data: RecurringPlanPayload) {
  return request.put<RecurringPlan>({
    url: `/recurring-plans/${id}`,
    data
  })
}

export function updateRecurringPlanStatus(id: number, status: RecurringPlanStatus) {
  return request.put<RecurringPlan>({
    url: `/recurring-plans/${id}/status`,
    data: { status }
  })
}

export function fetchRecurringPlanOccurrences(
  id: number,
  params: RecurringPlanOccurrenceQueryParams
) {
  return request.get<RecurringPlanOccurrencePage>({
    url: `/recurring-plans/${id}/occurrences`,
    params
  })
}

export function completeRecurringPlanCurrent(
  id: number,
  data?: RecurringPlanOccurrenceActionPayload
) {
  return request.post<RecurringPlan>({
    url: `/recurring-plans/${id}/occurrences/current/complete`,
    data
  })
}

export function generateRecurringPlanCurrentTask(id: number) {
  return request.post<RecurringPlanGenerateTaskResponse>({
    url: `/recurring-plans/${id}/occurrences/current/generate-task`
  })
}

export function skipRecurringPlanCurrent(
  id: number,
  data?: RecurringPlanOccurrenceActionPayload
) {
  return request.post<RecurringPlan>({
    url: `/recurring-plans/${id}/occurrences/current/skip`,
    data
  })
}

export function deferRecurringPlanCurrent(
  id: number,
  data?: RecurringPlanOccurrenceActionPayload
) {
  return request.post<RecurringPlan>({
    url: `/recurring-plans/${id}/occurrences/current/defer`,
    data
  })
}

export function deleteRecurringPlan(id: number) {
  return request.del<string>({
    url: `/recurring-plans/${id}`
  })
}
