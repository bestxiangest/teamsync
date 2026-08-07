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
  status: TaskStatus
}

export interface TimelineTaskItem {
  id: number
  time: string
  taskName: string
  countdownText: string
  status: TaskStatus
}

export interface ProjectRiskItem {
  id: number
  projectName: string
  progress: number
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

export interface DailyFocusItem {
  id: number
  dateText: string
  taskName: string
  assigneeName: string
  countdownText: string
  status: TaskStatus
}

export interface ProjectMilestoneItem {
  id: number
  projectName: string
  milestoneName: string
  expectedDate: string
  readiness: number
  riskLevel: RiskLevel
  riskText: string
  tone: KpiTone
}

export interface TaskReminderScreenData {
  summaryCards: KpiCardItem[]
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
  dailyFocus: DailyFocusItem[]
  milestoneCards: ProjectMilestoneItem[]
}

export const mockTaskReminderScreenData: TaskReminderScreenData = {
  summaryCards: [
    {
      id: 'pending',
      label: '待处理任务',
      value: 128,
      trendText: '较昨日 +5',
      trendDirection: 'up',
      tone: 'primary',
      icon: 'task'
    },
    {
      id: 'today-due',
      label: '今日到期',
      value: 23,
      trendText: '较昨日 +3',
      trendDirection: 'up',
      tone: 'warning',
      icon: 'calendar'
    },
    {
      id: 'due-soon',
      label: '即将到期(48h)',
      value: 41,
      trendText: '较昨日 -2',
      trendDirection: 'down',
      tone: 'warning',
      icon: 'clock'
    },
    {
      id: 'overdue',
      label: '已逾期',
      value: 12,
      trendText: '需重点关注',
      trendDirection: 'up',
      tone: 'danger',
      icon: 'warning'
    },
    {
      id: 'recurring',
      label: '周期计划待办',
      value: 18,
      trendText: '较昨日 +1',
      trendDirection: 'up',
      tone: 'purple',
      icon: 'refresh'
    },
    {
      id: 'projects',
      label: '项目总数',
      value: 16,
      trendText: '较昨日 ±0',
      trendDirection: 'flat',
      tone: 'success',
      icon: 'folder'
    }
  ],
  urgentTasks: [
    {
      id: 1,
      taskName: '移动端登录异常修复',
      projectName: '移动端重构项目',
      assigneeName: '张伟',
      priority: 'P0 紧急',
      priorityLevel: 'p0',
      remainingTime: '-2h 30m',
      status: 'overdue'
    },
    {
      id: 2,
      taskName: '支付接口联调',
      projectName: '电商平台升级',
      assigneeName: '李娜',
      priority: 'P0 紧急',
      priorityLevel: 'p0',
      remainingTime: '-1h 15m',
      status: 'overdue'
    },
    {
      id: 3,
      taskName: '季度巡检报告提交',
      projectName: '设备管理平台',
      assigneeName: '王强',
      priority: 'P1 高',
      priorityLevel: 'p1',
      remainingTime: '2h 30m',
      status: 'dueSoon'
    },
    {
      id: 4,
      taskName: '首页性能优化',
      projectName: '官网改版',
      assigneeName: '陈晨',
      priority: 'P1 高',
      priorityLevel: 'p1',
      remainingTime: '4h 45m',
      status: 'dueSoon'
    },
    {
      id: 5,
      taskName: '数据看板需求评审',
      projectName: '数据中台',
      assigneeName: '刘洋',
      priority: 'P2 中',
      priorityLevel: 'p2',
      remainingTime: '10h 15m',
      status: 'today'
    },
    {
      id: 6,
      taskName: '原型评审修订',
      projectName: 'CRM 二期',
      assigneeName: '周敏',
      priority: 'P2 中',
      priorityLevel: 'p2',
      remainingTime: '21h 30m',
      status: 'normal'
    }
  ],
  todayTimeline: [
    {
      id: 1,
      time: '09:30',
      taskName: '支付接口联调',
      countdownText: '逾期 1h15m',
      status: 'overdue'
    },
    {
      id: 2,
      time: '10:30',
      taskName: '移动端登录异常修复',
      countdownText: '逾期 2h30m',
      status: 'overdue'
    },
    {
      id: 3,
      time: '13:00',
      taskName: '季度巡检报告提交',
      countdownText: '剩余 2h30m',
      status: 'dueSoon'
    },
    {
      id: 4,
      time: '14:30',
      taskName: '首页性能优化',
      countdownText: '剩余 4h45m',
      status: 'dueSoon'
    },
    {
      id: 5,
      time: '16:00',
      taskName: '数据看板需求评审',
      countdownText: '剩余 10h15m',
      status: 'today'
    },
    {
      id: 6,
      time: '18:30',
      taskName: '原型评审修订',
      countdownText: '剩余 21h30m',
      status: 'normal'
    }
  ],
  projectRisks: [
    {
      id: 1,
      projectName: '官网改版',
      progress: 68,
      overdueTaskCount: 5,
      riskLevel: 'high',
      riskText: '高风险'
    },
    {
      id: 2,
      projectName: 'CRM 二期',
      progress: 45,
      overdueTaskCount: 3,
      riskLevel: 'high',
      riskText: '高风险'
    },
    {
      id: 3,
      projectName: '设备管理平台',
      progress: 72,
      overdueTaskCount: 1,
      riskLevel: 'attention',
      riskText: '关注'
    },
    {
      id: 4,
      projectName: '电商平台升级',
      progress: 89,
      overdueTaskCount: 0,
      riskLevel: 'normal',
      riskText: '正常'
    },
    {
      id: 5,
      projectName: '数据中台',
      progress: 60,
      overdueTaskCount: 0,
      riskLevel: 'normal',
      riskText: '正常'
    }
  ],
  recurringPlans: [
    {
      id: 1,
      planName: '月度服务器巡检',
      cycle: '每月',
      nextRunTime: '05/12 10:00',
      assigneeName: '王强',
      dueTime: '05/12 18:00',
      status: 'dueSoon'
    },
    {
      id: 2,
      planName: '每周运营复盘',
      cycle: '每周一',
      nextRunTime: '05/11 14:00',
      assigneeName: '李娜',
      dueTime: '05/11 18:00',
      status: 'today'
    },
    {
      id: 3,
      planName: '季度权限审计',
      cycle: '每季度',
      nextRunTime: '06/01 09:00',
      assigneeName: '刘洋',
      dueTime: '06/05 18:00',
      status: 'normal'
    },
    {
      id: 4,
      planName: '数据备份校验',
      cycle: '每周五',
      nextRunTime: '05/15 09:30',
      assigneeName: '张伟',
      dueTime: '05/15 12:00',
      status: 'attention'
    }
  ],
  assigneeSummaryCards: [
    {
      id: 'active-members',
      label: '今日需处理成员',
      value: 12,
      trendText: '较昨日 -2',
      trendDirection: 'down',
      tone: 'primary',
      icon: 'user'
    },
    {
      id: 'top-load',
      label: '负载最高成员',
      value: 3,
      trendText: '较昨日 持平',
      trendDirection: 'flat',
      tone: 'warning',
      icon: 'crown'
    },
    {
      id: 'overdue-members',
      label: '逾期责任人',
      value: 4,
      trendText: '较昨日 +1',
      trendDirection: 'up',
      tone: 'danger',
      icon: 'warning'
    },
    {
      id: 'done-today',
      label: '今日完成任务',
      value: 19,
      trendText: '较昨日 +6',
      trendDirection: 'up',
      tone: 'success',
      icon: 'check'
    },
    {
      id: 'collaboration',
      label: '协作中项目',
      value: 16,
      trendText: '较昨日 +3',
      trendDirection: 'up',
      tone: 'purple',
      icon: 'team'
    }
  ],
  assigneeWall: [
    {
      id: 1,
      name: '张伟',
      position: '后端开发',
      department: '技术部',
      completionRate: 68,
      todoCount: 8,
      todayDueCount: 3,
      overdueCount: 2,
      tasks: [
        { id: 1, title: '支付接口联调', status: 'dueToday' },
        { id: 2, title: '月底服务器巡检', status: 'inProgress' },
        { id: 3, title: '季度权限审计', status: 'overdue' }
      ]
    },
    {
      id: 2,
      name: '李娜',
      position: '产品经理',
      department: '产品部',
      completionRate: 72,
      todoCount: 6,
      todayDueCount: 2,
      overdueCount: 1,
      tasks: [
        { id: 1, title: 'CRM 需求确认', status: 'dueToday' },
        { id: 2, title: '首页性能优化', status: 'inProgress' },
        { id: 3, title: '用户反馈分析', status: 'inProgress' }
      ]
    },
    {
      id: 3,
      name: '王强',
      position: '测试工程师',
      department: '测试部',
      completionRate: 56,
      todoCount: 7,
      todayDueCount: 2,
      overdueCount: 3,
      tasks: [
        { id: 1, title: '季度权限审计', status: 'overdue' },
        { id: 2, title: '月底服务器巡检', status: 'dueToday' },
        { id: 3, title: '支付接口联调', status: 'inProgress' }
      ]
    },
    {
      id: 4,
      name: '陈晨',
      position: 'UI 设计师',
      department: '设计部',
      completionRate: 74,
      todoCount: 5,
      todayDueCount: 2,
      overdueCount: 0,
      tasks: [
        { id: 1, title: '官网改版 UI 评审', status: 'dueToday' },
        { id: 2, title: '活动页面视觉优化', status: 'inProgress' },
        { id: 3, title: '设计规范更新', status: 'inProgress' }
      ]
    },
    {
      id: 5,
      name: '刘洋',
      position: '运维工程师',
      department: '运维部',
      completionRate: 64,
      todoCount: 6,
      todayDueCount: 1,
      overdueCount: 2,
      tasks: [
        { id: 1, title: '月底服务器巡检', status: 'dueToday' },
        { id: 2, title: '备份策略校验', status: 'inProgress' },
        { id: 3, title: '告警规则优化', status: 'overdue' }
      ]
    },
    {
      id: 6,
      name: '周敏',
      position: '数据分析师',
      department: '数据部',
      completionRate: 58,
      todoCount: 4,
      todayDueCount: 1,
      overdueCount: 1,
      tasks: [
        { id: 1, title: '数据看板迭代', status: 'dueToday' },
        { id: 2, title: '用户行为分析', status: 'inProgress' },
        { id: 3, title: '指标体系梳理', status: 'overdue' }
      ]
    }
  ],
  workloadRanking: [
    {
      rank: 1,
      name: '张伟',
      todoCount: 8,
      todayDueCount: 3,
      overdueCount: 2,
      riskLevel: 'high',
      riskText: '高风险'
    },
    {
      rank: 2,
      name: '王强',
      todoCount: 7,
      todayDueCount: 2,
      overdueCount: 3,
      riskLevel: 'high',
      riskText: '高风险'
    },
    {
      rank: 3,
      name: '李娜',
      todoCount: 6,
      todayDueCount: 2,
      overdueCount: 1,
      riskLevel: 'attention',
      riskText: '较高风险'
    },
    {
      rank: 4,
      name: '刘洋',
      todoCount: 6,
      todayDueCount: 1,
      overdueCount: 2,
      riskLevel: 'attention',
      riskText: '较高风险'
    },
    {
      rank: 5,
      name: '陈晨',
      todoCount: 5,
      todayDueCount: 2,
      overdueCount: 0,
      riskLevel: 'medium',
      riskText: '中风险'
    },
    {
      rank: 6,
      name: '周敏',
      todoCount: 4,
      todayDueCount: 1,
      overdueCount: 1,
      riskLevel: 'low',
      riskText: '低风险'
    }
  ],
  collaborationReminders: [
    {
      id: 1,
      projectName: '官网改版',
      blocker: 'UI 评审待确认',
      people: '陈晨 / 李娜',
      urgency: 'high',
      urgencyText: '高'
    },
    {
      id: 2,
      projectName: 'CRM 二期',
      blocker: '需求澄清待跟进',
      people: '李娜 / 张伟',
      urgency: 'high',
      urgencyText: '高'
    },
    {
      id: 3,
      projectName: '数据中台',
      blocker: '数据口径待对齐',
      people: '周敏 / 王强',
      urgency: 'medium',
      urgencyText: '中'
    },
    {
      id: 4,
      projectName: '设备管理平台',
      blocker: '接口联调待验证',
      people: '张伟 / 刘洋',
      urgency: 'medium',
      urgencyText: '中'
    },
    {
      id: 5,
      projectName: '电商平台升级',
      blocker: '性能压测待执行',
      people: '刘洋 / 王强',
      urgency: 'low',
      urgencyText: '低'
    }
  ],
  sevenDaySummaryCards: [
    {
      id: 'seven-day-due',
      label: '未来7日到期',
      value: 54,
      trendText: '较昨日 +6',
      trendDirection: 'up',
      tone: 'primary',
      icon: 'calendar'
    },
    {
      id: 'weekly-recurring',
      label: '本周周期计划',
      value: 11,
      trendText: '较昨日 +1',
      trendDirection: 'up',
      tone: 'warning',
      icon: 'refresh'
    },
    {
      id: 'weekly-risk',
      label: '本周高风险项目',
      value: 4,
      trendText: '较昨日 +1',
      trendDirection: 'up',
      tone: 'danger',
      icon: 'warning'
    },
    {
      id: 'early-finish',
      label: '可提前完成事项',
      value: 9,
      trendText: '较昨日 -2',
      trendDirection: 'down',
      tone: 'success',
      icon: 'check'
    },
    {
      id: 'pending-collaboration',
      label: '待确认协作项',
      value: 7,
      trendText: '较昨日 ±0',
      trendDirection: 'flat',
      tone: 'purple',
      icon: 'team'
    }
  ],
  sevenDayCalendar: [
    {
      id: 1,
      weekday: '周一',
      dateText: '05/11',
      totalCount: 4,
      tasks: [
        { id: 1, title: '支付接口联调', type: 'projectTask', status: 'overdue' },
        { id: 2, title: '设备联调测试', type: 'projectTask', status: 'normal' },
        { id: 3, title: '周报提交', type: 'recurringPlan', status: 'today' },
        { id: 4, title: '数据看板校验', type: 'recurringPlan', status: 'normal' }
      ]
    },
    {
      id: 2,
      weekday: '周二',
      dateText: '05/12',
      totalCount: 4,
      tasks: [
        { id: 1, title: '设备管理平台验收', type: 'projectTask', status: 'overdue' },
        { id: 2, title: '合同归档整理', type: 'projectTask', status: 'normal' },
        { id: 3, title: '周计划复盘', type: 'recurringPlan', status: 'normal' },
        { id: 4, title: '每周运营复盘', type: 'recurringPlan', status: 'normal' }
      ]
    },
    {
      id: 3,
      weekday: '周三',
      dateText: '05/13',
      totalCount: 4,
      tasks: [
        { id: 1, title: 'CRM 二期联调', type: 'projectTask', status: 'dueSoon' },
        { id: 2, title: '性能压测', type: 'projectTask', status: 'today' },
        { id: 3, title: '周报提交', type: 'recurringPlan', status: 'normal' },
        { id: 4, title: '数据备份校验', type: 'recurringPlan', status: 'normal' }
      ]
    },
    {
      id: 4,
      weekday: '周四',
      dateText: '05/14',
      totalCount: 4,
      tasks: [
        { id: 1, title: '官网改版上线评审', type: 'projectTask', status: 'overdue' },
        { id: 2, title: '测试用例更新', type: 'projectTask', status: 'normal' },
        { id: 3, title: '周计划复盘', type: 'recurringPlan', status: 'normal' },
        { id: 4, title: '接口健康优化', type: 'recurringPlan', status: 'normal' }
      ]
    },
    {
      id: 5,
      weekday: '周五',
      dateText: '05/15',
      totalCount: 4,
      tasks: [
        { id: 1, title: 'CRM 二期上线', type: 'projectTask', status: 'overdue' },
        { id: 2, title: 'PRD 文档评审', type: 'projectTask', status: 'normal' },
        { id: 3, title: '周报提交', type: 'recurringPlan', status: 'normal' },
        { id: 4, title: '数据看板需求评审', type: 'recurringPlan', status: 'normal' }
      ]
    },
    {
      id: 6,
      weekday: '周六',
      dateText: '05/16',
      totalCount: 2,
      tasks: [
        { id: 1, title: '数据备份校验', type: 'projectTask', status: 'normal' },
        { id: 2, title: '性能监控巡检', type: 'recurringPlan', status: 'normal' }
      ]
    },
    {
      id: 7,
      weekday: '周日',
      dateText: '05/17',
      totalCount: 2,
      tasks: [
        { id: 1, title: '每周运营复盘', type: 'recurringPlan', status: 'normal' },
        { id: 2, title: '问题修复验证', type: 'projectTask', status: 'normal' }
      ]
    }
  ],
  dailyFocus: [
    {
      id: 1,
      dateText: '05/11（周一）',
      taskName: '支付接口联调（含联调文档）',
      assigneeName: 'PO 张磊',
      countdownText: '2h 30m',
      status: 'overdue'
    },
    {
      id: 2,
      dateText: '05/12（周二）',
      taskName: '设备管理平台验收',
      assigneeName: '李娜',
      countdownText: '1天 0h',
      status: 'dueSoon'
    },
    {
      id: 3,
      dateText: '05/13（周三）',
      taskName: 'CRM 二期联调',
      assigneeName: '刘洋',
      countdownText: '2天 0h',
      status: 'dueSoon'
    },
    {
      id: 4,
      dateText: '05/14（周四）',
      taskName: '官网改版上线前评审',
      assigneeName: '周敏',
      countdownText: '3天 0h',
      status: 'normal'
    },
    {
      id: 5,
      dateText: '05/15（周五）',
      taskName: 'CRM 二期上线',
      assigneeName: '王强',
      countdownText: '4天 0h',
      status: 'normal'
    },
    {
      id: 6,
      dateText: '05/16（周六）',
      taskName: '版本回归测试',
      assigneeName: '张伟',
      countdownText: '5天 0h',
      status: 'normal'
    }
  ],
  milestoneCards: [
    {
      id: 1,
      projectName: '官网改版',
      milestoneName: '正式上线',
      expectedDate: '05/14（周四）',
      readiness: 78,
      riskLevel: 'medium',
      riskText: '中风险',
      tone: 'purple'
    },
    {
      id: 2,
      projectName: 'CRM 二期',
      milestoneName: '新功能发布',
      expectedDate: '05/15（周五）',
      readiness: 65,
      riskLevel: 'high',
      riskText: '高风险',
      tone: 'warning'
    },
    {
      id: 3,
      projectName: '设备管理平台',
      milestoneName: '验收交付',
      expectedDate: '05/12（周二）',
      readiness: 82,
      riskLevel: 'medium',
      riskText: '中风险',
      tone: 'success'
    }
  ]
}

export function fetchTaskReminderScreenData() {
  return request.get<TaskReminderScreenData>({
    url: '/big-screen/task-reminder',
    showErrorMessage: false
  })
}

export async function getTaskReminderScreenData(): Promise<TaskReminderScreenData> {
  try {
    return await fetchTaskReminderScreenData()
  } catch (error) {
    console.warn('[TaskReminderScreen] 获取真实大屏数据失败，已使用本地兜底数据:', error)
    return mockTaskReminderScreenData
  }
}
