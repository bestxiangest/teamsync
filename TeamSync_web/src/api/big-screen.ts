import request from '@/utils/http'

export type KpiTone = 'primary' | 'warning' | 'danger' | 'success' | 'purple'
export type TrendDirection = 'up' | 'down' | 'flat'
export type TaskStatus = 'overdue' | 'dueSoon' | 'today' | 'normal' | 'inProgress'
export type PriorityLevel = 'p0' | 'p1' | 'p2'
export type RiskLevel = 'high' | 'attention' | 'normal' | 'medium' | 'low'
export type CalendarTaskType = 'projectTask' | 'recurringPlan'
export type KpiIconKey =
  | 'task'
  | 'calendar'
  | 'clock'
  | 'warning'
  | 'refresh'
  | 'folder'
  | 'user'
  | 'crown'
  | 'check'
  | 'team'

export interface KpiCardItem {
  id: string
  label: string
  value: number
  trendText: string
  trendDirection: TrendDirection
  tone: KpiTone
  icon: KpiIconKey
}

export interface UrgentTaskItem {
  id: number
  taskName: string
  projectName: string
  assigneeName: string
  priority: string
  priorityLevel: PriorityLevel
  remainingTime: string
  /** 绝对截止时间（yyyy-MM-ddTHH:mm:ss），前端据此秒级倒计时 */
  dueTime?: string | null
  status: TaskStatus
}

export interface TimelineTaskItem {
  id: number
  time: string
  taskName: string
  countdownText: string
  /** 绝对截止时间（yyyy-MM-ddTHH:mm:ss），前端据此秒级倒计时 */
  dueTime?: string | null
  status: TaskStatus
  /** 今日到期且已完成：用于区分「今日无截止任务」与「今日任务已全部完成」 */
  done: boolean
}

export interface ProjectRiskItem {
  id: number
  projectName: string
  progress: number
  pendingTaskCount: number
  overdueTaskCount: number
  riskLevel: RiskLevel
  riskText: string
}

export interface RecurringPlanReminderItem {
  id: number
  planName: string
  cycle: string
  nextRunTime: string
  assigneeName: string
  dueTime: string
  status: TaskStatus | 'attention'
}

export interface AssigneeTaskItem {
  id: number
  title: string
  status: 'dueToday' | 'inProgress' | 'overdue'
}

export interface AssigneeOverviewItem {
  id: number
  name: string
  position: string
  department: string
  completionRate: number
  todoCount: number
  todayDueCount: number
  overdueCount: number
  tasks: AssigneeTaskItem[]
}

export interface WorkloadRankingItem {
  rank: number
  name: string
  todoCount: number
  todayDueCount: number
  overdueCount: number
  riskLevel: RiskLevel
  riskText: string
}

export interface CollaborationReminderItem {
  id: number
  projectName: string
  blocker: string
  people: string
  urgency: 'high' | 'medium' | 'low'
  urgencyText: string
}

export interface CalendarTaskChipItem {
  id: number
  title: string
  type: CalendarTaskType
  status: TaskStatus
}

export interface CalendarDayItem {
  id: number
  weekday: string
  dateText: string
  tasks: CalendarTaskChipItem[]
  totalCount: number
}

export interface TaskReminderScreenData {
  /** 后端生成数据时的服务器时间，用于校准屏幕时钟 */
  serverTime?: string | null
  summaryCards: KpiCardItem[]
  /** 管理快照：完成率、待办逾期率、未排期、风险项目、负载风险成员 */
  managementSnapshotCards: KpiCardItem[]
  urgentTasks: UrgentTaskItem[]
  todayTimeline: TimelineTaskItem[]
  projectRisks: ProjectRiskItem[]
  recurringPlans: RecurringPlanReminderItem[]
  assigneeSummaryCards: KpiCardItem[]
  assigneeWall: AssigneeOverviewItem[]
  workloadRanking: WorkloadRankingItem[]
  collaborationReminders: CollaborationReminderItem[]
  sevenDaySummaryCards: KpiCardItem[]
  sevenDayCalendar: CalendarDayItem[]
}

export function fetchTaskReminderScreenData() {
  return request.get<TaskReminderScreenData>({
    url: '/big-screen/task-reminder',
    showErrorMessage: false
  })
}
