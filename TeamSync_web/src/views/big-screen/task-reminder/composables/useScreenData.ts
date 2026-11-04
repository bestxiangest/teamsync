import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import {
  fetchTaskReminderScreenData,
  type KpiCardItem,
  type TaskReminderScreenData
} from '@/api/big-screen'
import { SCREEN_NOW_KEY, parseServerDateTime } from './useScreenClock'

/** 首屏与接口异常时使用空数据，避免公开显示器上出现编造的数字 */
const EMPTY_SCREEN_DATA: TaskReminderScreenData = {
  summaryCards: [],
  managementSnapshotCards: [],
  urgentTasks: [],
  todayTimeline: [],
  projectRisks: [],
  recurringPlans: [],
  assigneeSummaryCards: [],
  assigneeWall: [],
  workloadRanking: [],
  collaborationReminders: [],
  sevenDaySummaryCards: [],
  sevenDayCalendar: []
}

/** 大屏对外展示，屏蔽开发者账号，避免出现在公开显示器上 */
const HIDDEN_PERSON_NAME = 'zzn'
const PERSON_SEPARATOR = /\s*(?:\/|,|，|、)\s*/

const isHiddenPerson = (name: string | null | undefined) =>
  name?.trim().toLowerCase() === HIDDEN_PERSON_NAME

const sanitizePersonList = (value: string | null | undefined) =>
  (value ?? '')
    .split(PERSON_SEPARATOR)
    .map((name) => name.trim())
    .filter((name) => name && !isHiddenPerson(name))
    .join(' / ')

const withVisiblePeople = (data: TaskReminderScreenData): TaskReminderScreenData => ({
  ...data,
  managementSnapshotCards: data.managementSnapshotCards ?? [],
  urgentTasks: data.urgentTasks
    .map((task) => ({ ...task, assigneeName: sanitizePersonList(task.assigneeName) }))
    .filter((task) => task.assigneeName),
  recurringPlans: data.recurringPlans
    .map((plan) => ({ ...plan, assigneeName: sanitizePersonList(plan.assigneeName) }))
    .filter((plan) => plan.assigneeName),
  collaborationReminders: data.collaborationReminders
    .map((item) => ({ ...item, people: sanitizePersonList(item.people) }))
    .filter((item) => item.people),
  assigneeWall: data.assigneeWall.filter((assignee) => !isHiddenPerson(assignee.name)),
  workloadRanking: data.workloadRanking.reduce<typeof data.workloadRanking>((acc, rank) => {
    if (isHiddenPerson(rank.name)) {
      return acc
    }

    acc.push({ ...rank, rank: acc.length + 1 })
    return acc
  }, [])
})

const readMetric = (cards: KpiCardItem[] | undefined, id: string) =>
  cards?.find((card) => card.id === id)?.value ?? 0

export function useScreenData(refreshInterval = 60_000) {
  const raw = ref<TaskReminderScreenData>(EMPTY_SCREEN_DATA)
  const lastSyncAt = ref<Date | null>(null)
  const syncFailed = ref(false)
  /** 服务端挂钟 - 本机时钟，定时刷新时重新校准 */
  const clockOffset = ref(0)
  /** 屏幕统一时钟：顶部时间、倒计时、轮播都读它，避免各自漂移 */
  const now = ref(new Date())

  let timer: ReturnType<typeof setInterval> | null = null
  let clockTimer: ReturnType<typeof setInterval> | null = null

  provide(SCREEN_NOW_KEY, now)

  const tickClock = () => {
    now.value = new Date(Date.now() + clockOffset.value)
  }

  const syncServerClock = (serverTime: string | null | undefined) => {
    const serverNow = parseServerDateTime(serverTime)

    if (serverNow === null) {
      return
    }

    clockOffset.value = serverNow - Date.now()
  }

  const data = computed(() => withVisiblePeople(raw.value))

  /** 待办结构：逾期、48 小时内到期、已排期其余、未设置截止，四段互不重叠且合计等于待办总量 */
  const backlogSegments = computed(() => {
    const cards = data.value.summaryCards
    const pending = readMetric(cards, 'pending')
    const overdue = readMetric(cards, 'overdue')
    const dueSoon = readMetric(cards, 'due-soon')
    const noDue = readMetric(data.value.managementSnapshotCards, 'no-due')
    const scheduled = Math.max(pending - overdue - dueSoon - noDue, 0)

    return {
      total: pending,
      items: [
        { name: '已逾期', value: overdue, color: '#e11d48' },
        { name: '48 小时内到期', value: dueSoon, color: '#d97706' },
        { name: '已排期待处理', value: scheduled, color: '#0284c7' },
        { name: '未设置截止', value: noDue, color: '#64748b' }
      ]
    }
  })

  const health = computed(() => ({
    completionRate: readMetric(data.value.managementSnapshotCards, 'completion-rate'),
    overdueRate: readMetric(data.value.managementSnapshotCards, 'overdue-rate'),
    noDueCount: readMetric(data.value.managementSnapshotCards, 'no-due'),
    riskProjects: readMetric(data.value.managementSnapshotCards, 'risk-projects'),
    workloadRisk: readMetric(data.value.managementSnapshotCards, 'workload-risk')
  }))

  const overdueTasks = computed(() =>
    data.value.urgentTasks.filter((task) => task.status === 'overdue')
  )

  /** 七日到期趋势：按任务来源拆成两条堆叠面积 */
  const weekTrend = computed(() => {
    const days = data.value.sevenDayCalendar

    return {
      labels: days.map((day) => `${day.weekday}\n${day.dateText}`),
      projectTasks: days.map(
        (day) => day.tasks.filter((task) => task.type === 'projectTask').length
      ),
      recurringPlans: days.map(
        (day) => day.tasks.filter((task) => task.type === 'recurringPlan').length
      )
    }
  })

  /** 拉取失败时保留上一份成功数据，屏幕上的旧数据比空白更有价值 */
  const refresh = async () => {
    try {
      const response = await fetchTaskReminderScreenData()
      // 先校准时钟再落数据，首帧倒计时就与服务器时间一致
      syncServerClock(response.serverTime)
      tickClock()
      raw.value = response
      lastSyncAt.value = new Date(now.value.getTime())
      syncFailed.value = false
    } catch (error) {
      syncFailed.value = true
      console.error('[TaskReminderScreen] 大屏数据刷新失败:', error)
    }
  }

  onMounted(() => {
    tickClock()
    void refresh()
    timer = setInterval(() => void refresh(), refreshInterval)
    clockTimer = setInterval(tickClock, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }

    if (clockTimer) {
      clearInterval(clockTimer)
      clockTimer = null
    }
  })

  return {
    data,
    backlogSegments,
    health,
    overdueTasks,
    weekTrend,
    now,
    lastSyncAt,
    syncFailed,
    refresh
  }
}
