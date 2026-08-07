<template>
  <div class="calendar-page" v-loading="loading">
    <header class="calendar-header">
      <div>
        <p class="page-kicker">时间视图</p>
        <h1>日历视图</h1>
        <p class="page-subtitle">{{ rangeLabel }}</p>
      </div>
      <div class="header-actions">
        <ElSwitch
          v-if="isPlatformAdmin"
          v-model="adminView"
          active-text="管理员视图"
          inactive-text="个人视图"
        />
        <ElButton :icon="Refresh" @click="loadEvents">刷新</ElButton>
      </div>
    </header>

    <section class="calendar-toolbar">
      <div class="toolbar-group">
        <ElRadioGroup v-model="viewMode" size="small">
          <ElRadioButton label="month">月</ElRadioButton>
          <ElRadioButton label="week">周</ElRadioButton>
          <ElRadioButton label="day">日</ElRadioButton>
        </ElRadioGroup>
        <div class="date-nav">
          <ElButton :icon="ArrowLeft" circle @click="shiftDate(-1)" />
          <ElDatePicker
            v-model="focusDate"
            type="date"
            value-format="YYYY-MM-DD"
            :clearable="false"
            class="focus-picker"
          />
          <ElButton :icon="ArrowRight" circle @click="shiftDate(1)" />
          <ElButton @click="goToday">今天</ElButton>
        </div>
      </div>

      <div class="filter-row">
        <ElCheckboxGroup v-model="selectedSources" size="small">
          <ElCheckboxButton label="TASK">任务</ElCheckboxButton>
          <ElCheckboxButton label="RECURRING">周期计划</ElCheckboxButton>
        </ElCheckboxGroup>
        <ElSelect
          v-model="selectedProjectId"
          clearable
          filterable
          placeholder="全部项目"
          class="project-filter"
        >
          <ElOption
            v-for="project in projectOptions"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </ElSelect>
        <ElSelect
          v-if="isPlatformAdmin && adminView"
          v-model="selectedAssigneeIds"
          multiple
          clearable
          collapse-tags
          :max-collapse-tags="2"
          placeholder="全部负责人"
          class="assignee-filter"
          :loading="assigneesLoading"
        >
          <ElOption
            v-for="assignee in assigneeOptions"
            :key="assignee.userId"
            :label="assignee.nickname"
            :value="assignee.userId"
          />
        </ElSelect>
        <ElSelect
          v-model="selectedStatuses"
          multiple
          collapse-tags
          :max-collapse-tags="2"
          placeholder="任务状态"
          class="status-filter"
        >
          <ElOption
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </ElSelect>
        <ElSwitch
          v-if="viewMode === 'day'"
          v-model="showNoDueDateTasks"
          active-text="查看无截止日期的任务"
        />
      </div>
    </section>

    <section class="summary-row">
      <article v-for="item in summaryItems" :key="item.label" class="summary-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <main class="calendar-layout">
      <section class="calendar-surface">
        <div v-if="viewMode !== 'day'" class="weekday-row">
          <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
        </div>

        <div v-if="viewMode === 'month'" class="month-grid">
          <article
            v-for="day in monthDays"
            :key="day.key"
            class="day-cell"
            :class="{
              'is-muted': !day.inMonth,
              'is-today': day.isToday,
              'is-selected': selectedDate === day.key
            }"
            @click="handleDaySelect(day.key)"
          >
            <header>
              <strong>{{ day.dayNumber }}</strong>
              <span v-if="day.isToday">今天</span>
            </header>
            <div class="event-stack">
              <button
                v-for="event in eventsByDate[day.key]?.slice(0, 4)"
                :key="event.id"
                type="button"
                class="event-chip"
                :class="eventClass(event, day.key)"
                @click.stop="handleEventClick(event)"
              >
                <span class="event-title">{{ event.title }}</span>
              </button>
              <small v-if="(eventsByDate[day.key]?.length || 0) > 4">
                +{{ (eventsByDate[day.key]?.length || 0) - 4 }} 项
              </small>
            </div>
          </article>
        </div>

        <div v-else-if="viewMode === 'week'" class="week-grid">
          <article
            v-for="day in weekDays"
            :key="day.key"
            class="week-column"
            :class="{ 'is-today': day.isToday, 'is-selected': selectedDate === day.key }"
            @click="handleDaySelect(day.key)"
          >
            <header>
              <strong>{{ day.dateText }}</strong>
              <span>{{ day.weekday }}</span>
            </header>
            <div class="event-stack event-stack--week">
              <button
                v-for="event in eventsByDate[day.key]"
                :key="event.id"
                type="button"
                class="event-row"
                :class="eventClass(event, day.key)"
                @click.stop="handleEventClick(event)"
              >
                <small>{{ eventProject(event) }}</small>
                <strong>{{ event.title }}</strong>
                <span>{{ formatDueLabel(event) }}</span>
              </button>
              <p v-if="!eventsByDate[day.key]?.length">无事件</p>
            </div>
          </article>
        </div>

        <div v-else class="day-list">
          <header>
            <div>
              <strong>{{ dayTitle }}</strong>
              <span>{{ selectedDayEvents.length }} 项事件</span>
            </div>
          </header>
          <button
            v-for="event in selectedDayEvents"
            :key="event.id"
            type="button"
            class="day-event"
            :class="eventClass(event, focusDay.format('YYYY-MM-DD'))"
            @click="handleEventClick(event)"
          >
            <span class="day-event__project">{{ eventProject(event) }}</span>
            <span class="day-event__main">
              <strong>{{ event.title }}</strong>
              <small>{{ formatDueLabel(event) }}</small>
            </span>
            <ElTag size="small" effect="plain" :type="tagType(event)">
              {{ eventStatus(event) }}
            </ElTag>
          </button>
          <ElEmpty v-if="selectedDayEvents.length === 0" description="当天没有日历事件" />
        </div>
      </section>

      <aside class="agenda-panel">
        <div class="panel-title">
          <div>
            <p>{{ selectedDateTitle }}</p>
            <strong>{{ selectedDateEvents.length }} 项事件</strong>
          </div>
          <ElIcon><Calendar /></ElIcon>
        </div>
        <div class="agenda-list">
          <button
            v-for="event in selectedDateEvents"
            :key="event.id"
            type="button"
            class="agenda-item"
            :class="eventClass(event, selectedDate)"
            @click="handleEventClick(event)"
          >
            <span>{{ formatAgendaDate(event) }}</span>
            <strong>{{ event.title }}</strong>
            <small>{{ sourceLabel(event.sourceType) }} · {{ eventProject(event) }}</small>
          </button>
          <ElEmpty v-if="selectedDateEvents.length === 0" description="选中日期没有事件" />
        </div>
      </aside>
    </main>

    <TaskDetailDialog
      ref="taskDialogRef"
      :project-id="activeTaskProjectId"
      @success="loadEvents"
    />
  </div>
</template>

<script setup lang="ts">
  import dayjs, { Dayjs } from 'dayjs'
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { ArrowLeft, ArrowRight, Calendar, Refresh } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type {
    CalendarAssignee,
    CalendarEvent,
    CalendarSourceType,
    CalendarTaskStatus
  } from '@/api/calendar'
  import { fetchCalendarAssignees, fetchCalendarEvents } from '@/api/calendar'
  import { getTaskDetail } from '@/api/board'
  import type { Project } from '@/api/project'
  import { fetchProjectList } from '@/api/project'
  import { useUserStore } from '@/store/modules/user'
  import TaskDetailDialog from '@/views/board/components/TaskDetailDialog.vue'

  type ViewMode = 'month' | 'week' | 'day'
  type SourceGroup = 'TASK' | 'RECURRING'

  interface CalendarDay {
    key: string
    dayNumber: string
    dateText: string
    weekday: string
    inMonth: boolean
    isToday: boolean
  }

  const router = useRouter()
  const userStore = useUserStore()
  const weekdays = ['一', '二', '三', '四', '五', '六', '日']
  const statusOptions: Array<{ value: CalendarTaskStatus; label: string }> = [
    { value: 'NOT_STARTED', label: '未开始' },
    { value: 'IN_PROGRESS', label: '处理中' },
    { value: 'COMPLETED', label: '已完成' },
    { value: 'OVERDUE', label: '已逾期' }
  ]

  const viewMode = ref<ViewMode>('month')
  const focusDate = ref(dayjs().format('YYYY-MM-DD'))
  const selectedDate = ref(focusDate.value)
  const adminView = ref(false)
  const selectedSources = ref<SourceGroup[]>(['TASK', 'RECURRING'])
  const selectedProjectId = ref<number>()
  const selectedAssigneeIds = ref<number[]>([])
  const selectedStatuses = ref<CalendarTaskStatus[]>([
    'NOT_STARTED',
    'IN_PROGRESS',
    'OVERDUE'
  ])
  const showNoDueDateTasks = ref(false)
  const loading = ref(false)
  const assigneesLoading = ref(false)
  const events = ref<CalendarEvent[]>([])
  const projectOptions = ref<Project[]>([])
  const assigneeOptions = ref<CalendarAssignee[]>([])
  const taskDialogRef = ref<InstanceType<typeof TaskDetailDialog>>()
  const activeTaskProjectId = ref(0)
  let eventRequestSequence = 0

  const focusDay = computed(() => dayjs(focusDate.value))
  const isPlatformAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return (
      userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
    )
  })

  const visibleRange = computed(() => {
    if (viewMode.value === 'month') {
      const monthStart = focusDay.value.startOf('month')
      const monthEnd = focusDay.value.endOf('month')
      return {
        start: startOfWeek(monthStart),
        end: startOfWeek(monthEnd).add(6, 'day')
      }
    }
    if (viewMode.value === 'week') {
      const start = startOfWeek(focusDay.value)
      return { start, end: start.add(6, 'day') }
    }
    return { start: focusDay.value, end: focusDay.value }
  })

  const rangeLabel = computed(() => {
    const { start, end } = visibleRange.value
    if (start.isSame(end, 'day')) {
      return start.format('YYYY年M月D日')
    }
    return `${start.format('YYYY年M月D日')} 至 ${end.format('YYYY年M月D日')}`
  })

  const sourceTypeParam = computed(() => {
    const values: string[] = []
    if (selectedSources.value.includes('TASK')) {
      values.push('TASK')
    }
    if (selectedSources.value.includes('RECURRING')) {
      values.push('RECURRING_PLAN_RUN')
    }
    return values.join(',')
  })

  const monthDays = computed(() => {
    const days = buildDays(visibleRange.value.start, visibleRange.value.end)
    return days.map((day) => ({
      ...day,
      inMonth: dayjs(day.key).isSame(focusDay.value, 'month')
    }))
  })

  const weekDays = computed(() => buildDays(visibleRange.value.start, visibleRange.value.end))

  const eventsByDate = computed<Record<string, CalendarEvent[]>>(() => {
    const result: Record<string, CalendarEvent[]> = {}
    const rangeStart = visibleRange.value.start.startOf('day')
    const rangeEnd = visibleRange.value.end.startOf('day')

    for (const event of events.value) {
      const eventStart = dayjs(event.startTime).startOf('day')
      const eventEnd = dayjs(event.endTime || event.dueTime || event.startTime).startOf('day')
      if (!eventStart.isValid() || !eventEnd.isValid()) continue

      let cursor = eventStart.isBefore(rangeStart) ? rangeStart : eventStart
      const finalDay = eventEnd.isAfter(rangeEnd) ? rangeEnd : eventEnd
      while (cursor.isBefore(finalDay) || cursor.isSame(finalDay, 'day')) {
        const key = cursor.format('YYYY-MM-DD')
        if (!result[key]) result[key] = []
        result[key].push(event)
        cursor = cursor.add(1, 'day')
      }
    }

    Object.values(result).forEach((items) => {
      items.sort((a, b) => {
        const firstTime = dayjs(a.dueTime || a.startTime).valueOf()
        const secondTime = dayjs(b.dueTime || b.startTime).valueOf()
        return firstTime - secondTime
      })
    })
    return result
  })

  const selectedDayEvents = computed(
    () => eventsByDate.value[focusDay.value.format('YYYY-MM-DD')] || []
  )

  const dayTitle = computed(
    () => `${focusDay.value.format('YYYY年M月D日')} ${weekdayName(focusDay.value)}`
  )

  const selectedDateEvents = computed(() => eventsByDate.value[selectedDate.value] || [])

  const selectedDateTitle = computed(
    () => `${dayjs(selectedDate.value).format('M月D日')} ${weekdayName(dayjs(selectedDate.value))}`
  )

  const summaryItems = computed(() => [
    { label: '任务', value: events.value.filter((item) => item.sourceType === 'TASK').length },
    {
      label: '周期计划',
      value: events.value.filter((item) => item.sourceType.startsWith('RECURRING_PLAN')).length
    },
    {
      label: '处理中',
      value: events.value.filter((item) => item.sourceType === 'TASK' && item.status === '2').length
    },
    { label: '逾期', value: events.value.filter((item) => item.overdue).length }
  ])

  const loadProjects = async () => {
    try {
      projectOptions.value = await fetchProjectList(false)
    } catch (error) {
      console.error('加载项目筛选失败:', error)
    }
  }

  const loadAssignees = async () => {
    if (!isPlatformAdmin.value || !adminView.value) {
      assigneeOptions.value = []
      return
    }
    assigneesLoading.value = true
    try {
      assigneeOptions.value = await fetchCalendarAssignees(selectedProjectId.value)
    } catch (error) {
      console.error('加载负责人筛选失败:', error)
      assigneeOptions.value = []
    } finally {
      assigneesLoading.value = false
    }
  }

  const loadEvents = async () => {
    const requestSequence = ++eventRequestSequence
    if (!sourceTypeParam.value) {
      events.value = []
      loading.value = false
      return
    }
    loading.value = true
    try {
      const result = await fetchCalendarEvents({
        startDate: visibleRange.value.start.format('YYYY-MM-DD'),
        endDate: visibleRange.value.end.format('YYYY-MM-DD'),
        sourceType: sourceTypeParam.value,
        projectId: selectedProjectId.value,
        adminView: isPlatformAdmin.value && adminView.value,
        assigneeIds: selectedAssigneeIds.value.join(',') || undefined,
        statuses: selectedStatuses.value.join(','),
        includeNoDueDate: viewMode.value === 'day' && showNoDueDateTasks.value
      })
      if (requestSequence === eventRequestSequence) {
        events.value = result
      }
    } finally {
      if (requestSequence === eventRequestSequence) {
        loading.value = false
      }
    }
  }

  const shiftDate = (direction: number) => {
    const unit = viewMode.value === 'month' ? 'month' : viewMode.value === 'week' ? 'week' : 'day'
    focusDate.value = focusDay.value.add(direction, unit).format('YYYY-MM-DD')
  }

  const goToday = () => {
    focusDate.value = dayjs().format('YYYY-MM-DD')
  }

  const handleDaySelect = (date: string) => {
    selectedDate.value = date
  }

  const handleEventClick = async (event: CalendarEvent) => {
    if (event.sourceType === 'TASK') {
      if (!event.projectId) {
        ElMessage.warning('无法确定任务所属项目')
        return
      }
      try {
        activeTaskProjectId.value = event.projectId
        const task = await getTaskDetail(event.sourceId)
        await nextTick()
        taskDialogRef.value?.openEdit(task)
      } catch (error) {
        console.error('加载任务详情失败:', error)
      }
      return
    }

    if (!event.targetPath) {
      ElMessage.info('该事件暂无跳转目标')
      return
    }
    router.push(event.targetPath)
  }

  const buildDays = (start: Dayjs, end: Dayjs): CalendarDay[] => {
    const days: CalendarDay[] = []
    let cursor = start
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      days.push({
        key: cursor.format('YYYY-MM-DD'),
        dayNumber: cursor.format('D'),
        dateText: cursor.format('M/D'),
        weekday: weekdayName(cursor),
        inMonth: true,
        isToday: cursor.isSame(dayjs(), 'day')
      })
      cursor = cursor.add(1, 'day')
    }
    return days
  }

  const startOfWeek = (value: Dayjs) => {
    const day = value.day()
    const diff = day === 0 ? 6 : day - 1
    return value.subtract(diff, 'day').startOf('day')
  }

  const weekdayName = (value: Dayjs) => `周${weekdays[(value.day() + 6) % 7]}`

  const formatAgendaDate = (event: CalendarEvent) => {
    const start = dayjs(event.startTime)
    const end = dayjs(event.endTime || event.startTime)
    return start.isSame(end, 'day')
      ? start.format('M/D HH:mm')
      : `${start.format('M/D')} - ${end.format('M/D')}`
  }

  const formatDueLabel = (event: CalendarEvent) => {
    if (!event.dueTime) return '无截止日期'
    return `截止 ${dayjs(event.dueTime).format('M月D日 HH:mm')}`
  }

  const eventProject = (event: CalendarEvent) => event.projectName || '个人事项'

  const sourceLabel = (sourceType: CalendarSourceType) => {
    const map: Record<CalendarSourceType, string> = {
      TASK: '任务',
      RECURRING_PLAN_RUN: '计划执行'
    }
    return map[sourceType] || sourceType
  }

  const eventStatus = (event: CalendarEvent) => {
    if (event.overdue) return '已逾期'
    if (event.sourceType === 'TASK') {
      const map: Record<string, string> = {
        '0': '未开始',
        '1': '已完成',
        '2': '处理中'
      }
      return event.status ? map[event.status] || event.status : '未开始'
    }
    return event.status || '计划'
  }

  const isOverdueOnDate = (event: CalendarEvent, dateKey?: string) => {
    if (!event.overdue || !event.dueTime) return false
    if (!dateKey) return true
    return !dayjs(dateKey).isBefore(dayjs(event.dueTime).startOf('day'), 'day')
  }

  const eventClass = (event: CalendarEvent, dateKey?: string) => {
    const colorType = isOverdueOnDate(event, dateKey) ? 'danger' : event.colorType || 'primary'
    return `event--${colorType}`
  }

  const tagType = (event: CalendarEvent) => {
    if (event.overdue || event.colorType === 'danger') return 'danger'
    if (event.colorType === 'warning') return 'warning'
    if (event.colorType === 'success') return 'success'
    return 'info'
  }

  watch(
    [
      viewMode,
      focusDate,
      selectedSources,
      selectedAssigneeIds,
      selectedStatuses,
      showNoDueDateTasks,
      adminView
    ],
    loadEvents,
    { deep: true }
  )

  watch(focusDate, (date) => {
    selectedDate.value = date
  })

  watch(adminView, async () => {
    selectedAssigneeIds.value = []
    await loadAssignees()
  })

  watch(selectedProjectId, async () => {
    selectedAssigneeIds.value = []
    await Promise.all([loadAssignees(), loadEvents()])
  })

  onMounted(async () => {
    await Promise.all([loadProjects(), loadAssignees()])
    await loadEvents()
  })
</script>

<style scoped lang="scss">
  .calendar-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
    padding: 20px;
    background: #f6f8fb;
  }

  .calendar-header,
  .calendar-toolbar,
  .summary-row,
  .calendar-surface,
  .agenda-panel {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fff;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;

    h1 {
      margin: 2px 0 0;
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
    }
  }

  .page-kicker {
    margin: 0;
    color: #2563eb;
    font-size: 13px;
    font-weight: 700;
  }

  .page-subtitle {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 13px;
  }

  .header-actions,
  .toolbar-group,
  .filter-row,
  .date-nav {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .calendar-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 16px;
  }

  .focus-picker {
    width: 150px;
  }

  .project-filter {
    width: 190px;
  }

  .assignee-filter {
    width: 220px;
  }

  .status-filter {
    width: 240px;
  }

  .summary-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(120px, 1fr));
    gap: 0;
    overflow: hidden;
  }

  .summary-item {
    min-width: 0;
    padding: 14px 16px;
    border-right: 1px solid #edf0f5;

    &:last-child {
      border-right: 0;
    }

    span {
      display: block;
      color: #6b7280;
      font-size: 12px;
    }

    strong {
      display: block;
      margin-top: 4px;
      color: #111827;
      font-size: 22px;
    }
  }

  .calendar-layout {
    display: grid;
    align-items: start;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 16px;
    min-height: 640px;
  }

  .calendar-surface,
  .agenda-panel {
    min-width: 0;
    overflow: hidden;
  }

  .weekday-row {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    border-bottom: 1px solid #edf0f5;

    span {
      padding: 10px 12px;
      color: #6b7280;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }
  }

  .month-grid,
  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .day-cell {
    display: flex;
    flex-direction: column;
    min-height: 118px;
    min-width: 0;
    padding: 10px;
    border-right: 1px solid #edf0f5;
    border-bottom: 1px solid #edf0f5;
    cursor: pointer;
    transition: background-color 0.15s ease, box-shadow 0.15s ease;

    &:nth-child(7n) {
      border-right: 0;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 22px;

      strong {
        color: #1f2937;
        font-size: 14px;
      }

      span {
        color: #2563eb;
        font-size: 12px;
        font-weight: 700;
      }
    }

    &.is-muted {
      background: #fafafa;

      header strong {
        color: #a0a7b4;
      }
    }

    &.is-today {
      box-shadow: inset 0 0 0 1px #2563eb;
    }

    &.is-selected {
      background: #f0f7ff;
      box-shadow: inset 0 0 0 2px #2563eb;
    }
  }

  .event-stack {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 5px;
    min-height: 0;
    margin-top: 8px;

    small,
    p {
      margin: 0;
      color: #9ca3af;
      font-size: 12px;
    }
  }

  .event-chip,
  .event-row,
  .day-event,
  .agenda-item {
    width: 100%;
    min-width: 0;
    border: 0;
    border-left: 3px solid transparent;
    background: #f8fafc;
    color: #1f2937;
    cursor: pointer;
    text-align: left;
  }

  .event-chip {
    display: flex;
    align-items: center;
    height: 24px;
    padding: 0 7px;
    border-radius: 5px;
    font-size: 12px;

    .event-title {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .week-column {
    min-height: 520px;
    min-width: 0;
    padding: 12px;
    border-right: 1px solid #edf0f5;
    cursor: pointer;
    transition: background-color 0.15s ease, box-shadow 0.15s ease;

    &:last-child {
      border-right: 0;
    }

    header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 12px;

      strong {
        color: #111827;
        font-size: 16px;
      }

      span {
        color: #6b7280;
        font-size: 12px;
      }
    }

    &.is-today header strong {
      color: #2563eb;
    }

    &.is-selected {
      background: #f0f7ff;
      box-shadow: inset 0 0 0 2px #2563eb;
    }
  }

  .event-stack--week {
    gap: 8px;
  }

  .event-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 9px 10px;
    border-radius: 6px;

    span,
    small {
      color: #64748b;
      font-size: 12px;
    }

    strong {
      overflow: hidden;
      font-size: 13px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .day-list {
    padding: 16px;

    > header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;

      strong {
        color: #111827;
        font-size: 18px;
      }

      span {
        display: block;
        margin-top: 4px;
        color: #6b7280;
        font-size: 13px;
      }
    }
  }

  .day-event {
    display: grid;
    grid-template-columns: minmax(90px, 140px) minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    min-height: 58px;
    margin-bottom: 10px;
    padding: 10px 12px;
    border-radius: 6px;

    .day-event__project {
      overflow: hidden;
      color: #475569;
      font-size: 13px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .day-event__main {
      min-width: 0;

      strong,
      small {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        margin-top: 4px;
        color: #64748b;
        font-size: 12px;
      }
    }
  }

  .agenda-panel {
    display: flex;
    align-self: start;
    flex-direction: column;
    height: min(720px, calc(100vh - 260px));
    max-height: 720px;
    min-height: 0;
    padding: 14px;
  }

  .panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px solid #edf0f5;

    p {
      margin: 0 0 3px;
      color: #6b7280;
      font-size: 12px;
    }

    strong {
      color: #111827;
      font-size: 16px;
    }

    .el-icon {
      color: #2563eb;
      font-size: 22px;
    }
  }

  .agenda-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    padding-top: 12px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: #cbd5e1;
    }
  }

  .agenda-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 11px;
    border-radius: 6px;

    span,
    small {
      color: #64748b;
      font-size: 12px;
    }

    strong {
      overflow: hidden;
      font-size: 13px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .event--primary {
    border-left-color: #2563eb;
    background: #eff6ff;
  }

  .event--success {
    border-left-color: #16a34a;
    background: #ecfdf3;
  }

  .event--warning {
    border-left-color: #d97706;
    background: #fff7ed;
  }

  .event--danger {
    border-left-color: #dc2626;
    background: #fef2f2;
  }

  .event--info {
    border-left-color: #64748b;
    background: #f8fafc;
  }

  @media (max-width: 1180px) {
    .calendar-layout {
      grid-template-columns: 1fr;
    }

    .agenda-panel {
      height: 360px;
      max-height: 360px;
    }
  }

  @media (max-width: 760px) {
    .calendar-page {
      padding: 12px;
    }

    .calendar-header,
    .calendar-toolbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .filter-row,
    .project-filter,
    .assignee-filter,
    .status-filter {
      width: 100%;
    }

    .summary-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .summary-item:nth-child(2n) {
      border-right: 0;
    }

    .month-grid,
    .week-grid,
    .weekday-row {
      min-width: 720px;
    }

    .calendar-surface {
      overflow-x: auto;
    }

    .day-event {
      grid-template-columns: minmax(80px, 110px) minmax(0, 1fr);

      .el-tag {
        justify-self: flex-start;
        grid-column: 2;
      }
    }
  }
</style>
