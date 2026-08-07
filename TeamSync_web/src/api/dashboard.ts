import request from '@/utils/http'

export interface DashboardStats {
  pendingTaskCount: number
  projectCount: number
  totalCommentCount: number
  doneTaskCount: number
}

export interface DashboardTask {
  id: number
  title: string
  priority: number
  dueTime: string | null
  projectId: number | null
  projectName: string
  stageName: string
  sourceType?: 'PROJECT_TASK' | 'RECURRING_PLAN' | string
}

export interface DashboardActivity {
  id: number
  operatorId: number
  operatorName: string
  operatorAvatar: string | null
  actionType: string
  detail: string
  taskId: number | null
  taskTitle: string
  projectId: number | null
  projectName: string
  createdAt: string
}

export interface DashboardProject {
  id: number
  name: string
  description: string
  role: 'owner' | 'admin' | 'member' | string
}

export interface DashboardInsight {
  overdueTaskCount: number
  dueSoonTaskCount: number
  completionRate: number
  activeProjectCount: number
  activityCount7d: number
}

export interface DashboardTaskTrendItem {
  date: string
  createdCount: number
  completedCount: number
  overdueCount: number
}

export interface DashboardPriorityDistributionItem {
  priority: number
  count: number
}

export interface DashboardActivityHeatItem {
  date: string
  count: number
}

export interface DashboardProjectHealth {
  projectId: number
  name: string
  role: 'owner' | 'admin' | 'member' | string
  progress: number
  pendingCount: number
  doneCount: number
  overdueCount: number
}

export interface DashboardVO {
  stats: DashboardStats
  myTasks: DashboardTask[]
  activities: DashboardActivity[]
  projects: DashboardProject[]
  insight: DashboardInsight
  taskTrend7d: DashboardTaskTrendItem[]
  priorityDistribution: DashboardPriorityDistributionItem[]
  activityHeat7d: DashboardActivityHeatItem[]
  projectHealth: DashboardProjectHealth[]
}

export interface DashboardOverviewSummary {
  projectCount: number
  taskCount: number
  doneTaskCount: number
  pendingTaskCount: number
  overdueTaskCount: number
  completionRate: number
  memberCount: number
  commentCount: number
  activityCount7d: number
  healthyProjectCount: number
  warningProjectCount: number
  riskProjectCount: number
  averageProgress: number
}

export interface DashboardOverviewHealth {
  status: 'healthy' | 'warning' | 'risk' | string
  label: string
  count: number
}

export interface DashboardOverviewProject {
  projectId: number
  name: string
  description: string
  ownerName: string
  progress: number
  healthScore: number
  healthLevel: 'healthy' | 'warning' | 'risk' | string
  taskCount: number
  doneCount: number
  pendingCount: number
  overdueCount: number
  completionRate: number
  memberCount: number
  commentCount: number
  activityCount7d: number
  highPriorityCount: number
  mediumPriorityCount: number
  normalPriorityCount: number
  lastActivityAt: string | null
  updatedAt: string | null
  trend7d: DashboardTaskTrendItem[]
  priorityDistribution: DashboardPriorityDistributionItem[]
}

export interface DashboardOverviewVO {
  summary: DashboardOverviewSummary
  platformTrend7d: DashboardTaskTrendItem[]
  activityHeat7d: DashboardActivityHeatItem[]
  priorityDistribution: DashboardPriorityDistributionItem[]
  healthDistribution: DashboardOverviewHealth[]
  projects: DashboardOverviewProject[]
}

export interface DashboardManagementQuery {
  projectId?: number
  memberId?: number
  startDate?: string
  endDate?: string
}

export interface DashboardOption {
  id: number
  name: string
}

export interface DashboardManagementFilter {
  projectId: number | null
  memberId: number | null
  startDate: string
  endDate: string
}

export interface DashboardManagementSummary {
  taskCount: number
  doneTaskCount: number
  pendingTaskCount: number
  overdueTaskCount: number
  dueSoonTaskCount: number
  completionRate: number
  overdueRate: number
  riskTaskCount: number
  memberCount: number
  activeProjectCount: number
  recurringPlanCount: number
  recurringOccurrenceCount: number
  recurringExecutedCount: number
  recurringCompletedCount: number
  recurringExecutionRate: number
  recurringCompletionRate: number
}

export interface DashboardProjectMetric {
  projectId: number
  projectName: string
  ownerName: string
  progress: number
  healthScore: number
  healthLevel: 'healthy' | 'warning' | 'risk' | string
  taskCount: number
  doneTaskCount: number
  pendingTaskCount: number
  overdueTaskCount: number
  dueSoonTaskCount: number
  highPriorityRiskCount: number
  completionRate: number
  overdueRate: number
  memberCount: number
  recurringPlanCount: number
  recurringExecutionRate: number
  lastActivityAt: string | null
}

export interface DashboardMemberWorkload {
  memberId: number
  memberName: string
  taskCount: number
  doneTaskCount: number
  pendingTaskCount: number
  overdueTaskCount: number
  dueSoonTaskCount: number
  highPriorityCount: number
  recurringPendingCount: number
  completionRate: number
  workloadScore: number
  riskLevel: 'high' | 'attention' | 'normal' | string
}

export interface DashboardRecurringPlanMetric {
  planId: number
  title: string
  projectId: number | null
  projectName: string
  status: string
  assigneeNames: string
  nextRunAt: string | null
  occurrenceCount: number
  executedCount: number
  completedCount: number
  pendingCount: number
  overdueCount: number
  executionRate: number
  completionRate: number
}

export type DashboardManagementProjectMetric = DashboardProjectMetric
export type DashboardManagementMemberWorkload = DashboardMemberWorkload
export type DashboardManagementRecurringPlan = DashboardRecurringPlanMetric

export interface DashboardManagementVO {
  filter: DashboardManagementFilter
  projectOptions: DashboardOption[]
  memberOptions: DashboardOption[]
  summary: DashboardManagementSummary
  taskTrend: DashboardTaskTrendItem[]
  projectMetrics: DashboardProjectMetric[]
  memberWorkloads: DashboardMemberWorkload[]
  recurringPlans: DashboardRecurringPlanMetric[]
}

export function getWorkbenchData() {
  return request.get<DashboardVO>({
    url: '/dashboard/workbench'
  })
}

export function getOverviewData() {
  return request.get<DashboardOverviewVO>({
    url: '/dashboard/overview'
  })
}

export function getManagementData(params: DashboardManagementQuery) {
  return request.get<DashboardManagementVO>({
    url: '/dashboard/management',
    params
  })
}
