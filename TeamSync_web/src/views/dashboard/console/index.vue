<template>
  <div class="workbench-page" v-loading="loading">
    <header class="page-header">
      <div>
        <p class="page-kicker">工作台</p>
        <h1>{{ greeting }}</h1>
        <p class="page-subtitle">
          这里统计的是你本人负责和参与的事项；管理员的平台数据在下方独立展示，不计入个人待办。
        </p>
      </div>
      <div class="header-actions">
        <ElButton :icon="Refresh" @click="loadAll">刷新</ElButton>
        <ElButton type="primary" :icon="DataAnalysis" @click="goOverview">项目概览</ElButton>
      </div>
    </header>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>我的工作</h2>
          <p>只统计当前账号负责的项目任务、负责的周期计划和本人参与项目。</p>
        </div>
      </div>

      <div class="metric-grid">
        <article v-for="item in personalMetrics" :key="item.label" class="metric-card">
          <ElIcon class="metric-icon"><component :is="item.icon" /></ElIcon>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </div>

      <div class="chart-grid">
        <OverviewChartPanel
          title="我的任务趋势"
          subtitle="最近 7 天新增、完成和逾期任务"
          :option="personalTrendOption"
        />
        <OverviewChartPanel
          title="我的待办优先级"
          subtitle="仅统计当前待处理事项"
          :option="personalPriorityOption"
        />
      </div>

      <div class="content-grid">
        <section class="data-panel">
          <div class="panel-title">
            <h3>我的待办</h3>
            <span>{{ dashboardData.myTasks.length }} 项</span>
          </div>
          <ElTable :data="dashboardData.myTasks" height="320" stripe>
            <ElTableColumn prop="title" label="事项" min-width="220">
              <template #default="{ row }">
                <ElButton link type="primary" @click="handleTaskSelect(row)">
                  {{ row.title }}
                </ElButton>
              </template>
            </ElTableColumn>
            <ElTableColumn label="来源" width="110">
              <template #default="{ row }">{{ sourceText(row.sourceType) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="projectName" label="项目" min-width="150" />
            <ElTableColumn label="截止时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.dueTime) }}</template>
            </ElTableColumn>
            <ElTableColumn label="优先级" width="100">
              <template #default="{ row }">
                <ElTag :type="priorityTag(row.priority)" effect="light">{{
                  priorityText(row.priority)
                }}</ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </section>

        <section class="data-panel">
          <div class="panel-title">
            <h3>我的项目</h3>
            <span>{{ dashboardData.projects.length }} 个</span>
          </div>
          <ElTable :data="dashboardData.projects" height="320" stripe>
            <ElTableColumn prop="name" label="项目" min-width="180">
              <template #default="{ row }">
                <ElButton link type="primary" @click="goToBoard(row.id, row.name)">
                  {{ row.name }}
                </ElButton>
              </template>
            </ElTableColumn>
            <ElTableColumn label="角色" width="110">
              <template #default="{ row }">{{ roleText(row.role) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="description" label="说明" min-width="180" show-overflow-tooltip />
          </ElTable>
        </section>
      </div>

      <section class="data-panel">
        <div class="panel-title">
          <h3>我参与项目的最近动态</h3>
          <span>{{ dashboardData.activities.length }} 条</span>
        </div>
        <ElTable :data="dashboardData.activities" height="300" stripe>
          <ElTableColumn prop="operatorName" label="成员" width="130" />
          <ElTableColumn prop="projectName" label="项目" min-width="150" />
          <ElTableColumn prop="taskTitle" label="任务" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="detail" label="动态" min-width="240" show-overflow-tooltip />
          <ElTableColumn label="时间" width="170">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </ElTableColumn>
        </ElTable>
      </section>
    </section>

    <section v-if="isPlatformAdmin" class="section-block" v-loading="overviewLoading">
      <div class="section-heading">
        <div>
          <h2>平台概览</h2>
          <p>这是管理员能看到的平台运行数据，只用于管理观察，不代表当前账号的个人待办。</p>
        </div>
        <ElButton type="primary" plain :icon="Monitor" @click="goOverview"
          >查看完整项目概览</ElButton
        >
      </div>

      <div class="metric-grid">
        <article
          v-for="item in platformMetrics"
          :key="item.label"
          class="metric-card metric-card--platform"
        >
          <ElIcon class="metric-icon"><component :is="item.icon" /></ElIcon>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </div>

      <div class="chart-grid">
        <OverviewChartPanel
          title="平台任务趋势"
          subtitle="最近 7 天全平台任务变化"
          :option="platformTrendOption"
        />
        <OverviewChartPanel
          title="项目健康分布"
          subtitle="按健康、观察、风险分层统计"
          :option="platformHealthOption"
        />
      </div>

      <section class="data-panel">
        <div class="panel-title">
          <h3>需要关注的项目</h3>
          <span>{{ platformRiskProjects.length }} 个</span>
        </div>
        <ElTable :data="platformRiskProjects" height="320" stripe>
          <ElTableColumn prop="name" label="项目" min-width="190">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goToBoard(row.projectId, row.name)">
                {{ row.name }}
              </ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="ownerName" label="负责人" width="120" />
          <ElTableColumn label="健康" width="110">
            <template #default="{ row }">
              <ElTag :type="healthTag(row.healthLevel)" effect="light">{{
                healthText(row.healthLevel)
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="进度" width="160">
            <template #default="{ row }">
              <ElProgress :percentage="row.progress || 0" :stroke-width="8" />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="pendingCount" label="待办" width="90" align="center" />
          <ElTableColumn prop="overdueCount" label="逾期" width="90" align="center" />
          <ElTableColumn label="完成率" width="100" align="center">
            <template #default="{ row }">{{ formatRate(row.completionRate) }}</template>
          </ElTableColumn>
        </ElTable>
      </section>
    </section>

    <ElDialog
      v-model="reminderAnnouncementVisible"
      width="480px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      align-center
    >
      <div class="notice-dialog">
        <h3>邮箱提醒功能已上线</h3>
        <p
          >你可以为自己开启任务逾期邮件提醒。设置好提醒邮箱后，当你负责的任务逾期，系统会自动发送邮件通知你。</p
        >
        <div class="notice-box">
          <div>入口：个人中心</div>
          <div>设置提醒邮箱、总开关和任务逾期提醒。</div>
        </div>
        <div class="notice-actions">
          <ElButton @click="handleDismissReminderAnnouncement">不想用</ElButton>
          <ElButton type="primary" @click="handleGoReminderSettings">去设置</ElButton>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type { EChartsOption } from 'echarts'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    ChatDotRound,
    Clock,
    DataAnalysis,
    FolderOpened,
    Monitor,
    Refresh,
    Tickets,
    Warning
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    getOverviewData,
    getWorkbenchData,
    type DashboardOverviewVO,
    type DashboardPriorityDistributionItem,
    type DashboardTask,
    type DashboardTaskTrendItem,
    type DashboardVO
  } from '@/api/dashboard'
  import { useUserStore } from '@/store/modules/user'
  import OverviewChartPanel from '../overview/modules/OverviewChartPanel.vue'

  const EMAIL_REMINDER_ANNOUNCEMENT_VERSION = 'email-reminder-feature-2026-03-19'

  const router = useRouter()
  const userStore = useUserStore()

  const loading = ref(false)
  const overviewLoading = ref(false)
  const reminderAnnouncementVisible = ref(false)

  const createTaskTrendDefaults = (): DashboardTaskTrendItem[] =>
    Array.from({ length: 7 }, (_, index) => ({
      date: dayjs()
        .subtract(6 - index, 'day')
        .format('MM-DD'),
      createdCount: 0,
      completedCount: 0,
      overdueCount: 0
    }))

  const createPriorityDefaults = (): DashboardPriorityDistributionItem[] => [
    { priority: 1, count: 0 },
    { priority: 2, count: 0 },
    { priority: 3, count: 0 }
  ]

  const createActivityHeatDefaults = () =>
    Array.from({ length: 7 }, (_, index) => ({
      date: dayjs()
        .subtract(6 - index, 'day')
        .format('MM-DD'),
      count: 0
    }))

  const createEmptyDashboard = (): DashboardVO => ({
    stats: {
      pendingTaskCount: 0,
      projectCount: 0,
      totalCommentCount: 0,
      doneTaskCount: 0
    },
    myTasks: [],
    activities: [],
    projects: [],
    insight: {
      overdueTaskCount: 0,
      dueSoonTaskCount: 0,
      completionRate: 0,
      activeProjectCount: 0,
      activityCount7d: 0
    },
    taskTrend7d: createTaskTrendDefaults(),
    priorityDistribution: createPriorityDefaults(),
    activityHeat7d: createActivityHeatDefaults(),
    projectHealth: []
  })

  const createEmptyOverview = (): DashboardOverviewVO => ({
    summary: {
      projectCount: 0,
      taskCount: 0,
      doneTaskCount: 0,
      pendingTaskCount: 0,
      overdueTaskCount: 0,
      completionRate: 0,
      memberCount: 0,
      commentCount: 0,
      activityCount7d: 0,
      healthyProjectCount: 0,
      warningProjectCount: 0,
      riskProjectCount: 0,
      averageProgress: 0
    },
    platformTrend7d: createTaskTrendDefaults(),
    activityHeat7d: createActivityHeatDefaults(),
    priorityDistribution: createPriorityDefaults(),
    healthDistribution: [],
    projects: []
  })

  const dashboardData = ref<DashboardVO>(createEmptyDashboard())
  const platformData = ref<DashboardOverviewVO>(createEmptyOverview())

  const isPlatformAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return (
      userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
    )
  })

  const greeting = computed(() => {
    const hour = new Date().getHours()
    const nickname = userStore.info.nickname || userStore.info.username || '协作者'
    if (hour < 6) return `凌晨好，${nickname}`
    if (hour < 12) return `早上好，${nickname}`
    if (hour < 18) return `下午好，${nickname}`
    return `晚上好，${nickname}`
  })

  const personalMetrics = computed(() => [
    {
      label: '我的待办',
      value: dashboardData.value.stats.pendingTaskCount,
      hint: `${dashboardData.value.insight.overdueTaskCount} 项逾期`,
      icon: Clock
    },
    {
      label: '24小时临期',
      value: dashboardData.value.insight.dueSoonTaskCount,
      hint: '需要优先处理',
      icon: Warning
    },
    {
      label: '参与项目',
      value: dashboardData.value.stats.projectCount,
      hint: `${dashboardData.value.insight.activeProjectCount} 个推进中`,
      icon: FolderOpened
    },
    {
      label: '我的评论',
      value: dashboardData.value.stats.totalCommentCount,
      hint: `近 7 天 ${dashboardData.value.insight.activityCount7d} 条动态`,
      icon: ChatDotRound
    }
  ])

  const platformMetrics = computed(() => {
    const summary = platformData.value.summary
    return [
      {
        label: '平台项目',
        value: summary.projectCount,
        hint: `平均进度 ${summary.averageProgress}%`,
        icon: FolderOpened
      },
      {
        label: '平台任务',
        value: summary.taskCount,
        hint: `完成率 ${summary.completionRate}%`,
        icon: Tickets
      },
      {
        label: '平台逾期',
        value: summary.overdueTaskCount,
        hint: `${summary.pendingTaskCount} 项待办`,
        icon: Warning
      },
      {
        label: '风险项目',
        value: summary.riskProjectCount,
        hint: `${summary.warningProjectCount} 个需观察`,
        icon: DataAnalysis
      }
    ]
  })

  const platformRiskProjects = computed(() =>
    [...platformData.value.projects]
      .sort((left, right) => {
        const leftWeight =
          healthWeight(left.healthLevel) * 1000 +
          (left.overdueCount || 0) * 10 +
          (left.pendingCount || 0)
        const rightWeight =
          healthWeight(right.healthLevel) * 1000 +
          (right.overdueCount || 0) * 10 +
          (right.pendingCount || 0)
        return rightWeight - leftWeight
      })
      .slice(0, 8)
  )

  const personalTrendOption = computed<EChartsOption>(() =>
    buildTrendOption(dashboardData.value.taskTrend7d)
  )
  const personalPriorityOption = computed<EChartsOption>(() =>
    buildPriorityOption(dashboardData.value.priorityDistribution)
  )
  const platformTrendOption = computed<EChartsOption>(() =>
    buildTrendOption(platformData.value.platformTrend7d)
  )
  const platformHealthOption = computed<EChartsOption>(() => ({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['46%', '70%'],
        data: (platformData.value.healthDistribution || []).map((item) => ({
          name: item.label,
          value: item.count
        }))
      }
    ]
  }))

  const mergeDashboard = (payload?: Partial<DashboardVO> | null): DashboardVO => ({
    ...createEmptyDashboard(),
    ...payload,
    stats: {
      ...createEmptyDashboard().stats,
      ...(payload?.stats || {})
    },
    insight: {
      ...createEmptyDashboard().insight,
      ...(payload?.insight || {})
    },
    myTasks: payload?.myTasks || [],
    activities: payload?.activities || [],
    projects: payload?.projects || [],
    taskTrend7d: payload?.taskTrend7d?.length ? payload.taskTrend7d : createTaskTrendDefaults(),
    priorityDistribution: payload?.priorityDistribution?.length
      ? payload.priorityDistribution
      : createPriorityDefaults(),
    activityHeat7d: payload?.activityHeat7d?.length
      ? payload.activityHeat7d
      : createActivityHeatDefaults(),
    projectHealth: payload?.projectHealth || []
  })

  const mergeOverview = (payload?: Partial<DashboardOverviewVO> | null): DashboardOverviewVO => ({
    ...createEmptyOverview(),
    ...payload,
    summary: {
      ...createEmptyOverview().summary,
      ...(payload?.summary || {})
    },
    platformTrend7d: payload?.platformTrend7d?.length
      ? payload.platformTrend7d
      : createTaskTrendDefaults(),
    activityHeat7d: payload?.activityHeat7d?.length
      ? payload.activityHeat7d
      : createActivityHeatDefaults(),
    priorityDistribution: payload?.priorityDistribution?.length
      ? payload.priorityDistribution
      : createPriorityDefaults(),
    healthDistribution: payload?.healthDistribution || [],
    projects: payload?.projects || []
  })

  const buildTrendOption = (items: DashboardTaskTrendItem[]): EChartsOption => ({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 36, right: 20, top: 28, bottom: 48 },
    xAxis: { type: 'category', data: items.map((item) => item.date) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: '新增', type: 'line', smooth: true, data: items.map((item) => item.createdCount) },
      { name: '完成', type: 'line', smooth: true, data: items.map((item) => item.completedCount) },
      { name: '逾期', type: 'bar', data: items.map((item) => item.overdueCount) }
    ]
  })

  const buildPriorityOption = (items: DashboardPriorityDistributionItem[]): EChartsOption => ({
    tooltip: { trigger: 'item' },
    grid: { left: 36, right: 20, top: 20, bottom: 32 },
    xAxis: { type: 'category', data: items.map((item) => priorityText(item.priority)) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{ type: 'bar', data: items.map((item) => item.count), barWidth: 28 }]
  })

  const loadDashboard = async () => {
    const response = await getWorkbenchData()
    dashboardData.value = mergeDashboard(response)
  }

  const loadPlatformOverview = async () => {
    if (!isPlatformAdmin.value) {
      platformData.value = createEmptyOverview()
      return
    }
    overviewLoading.value = true
    try {
      const response = await getOverviewData()
      platformData.value = mergeOverview(response)
    } catch {
      platformData.value = createEmptyOverview()
      ElMessage.error('获取平台概览失败')
    } finally {
      overviewLoading.value = false
    }
  }

  const loadAll = async () => {
    loading.value = true
    try {
      await loadDashboard()
      await loadPlatformOverview()
    } catch {
      dashboardData.value = createEmptyDashboard()
      ElMessage.error('获取工作台数据失败')
    } finally {
      loading.value = false
    }
  }

  const goOverview = () => {
    router.push('/dashboard/overview')
  }

  const goToBoard = (projectId?: number | null, projectName?: string) => {
    if (!projectId) return
    router.push(`/project/board/${projectId}?name=${encodeURIComponent(projectName || '项目看板')}`)
  }

  const handleTaskSelect = (task: DashboardTask) => {
    if (task.sourceType === 'RECURRING_PLAN') {
      router.push('/project/recurring-plan')
      return
    }
    goToBoard(task.projectId, task.projectName)
  }

  const getReminderAnnouncementKey = () => {
    const userId = userStore.info?.userId
    return userId ? `teamsync:${EMAIL_REMINDER_ANNOUNCEMENT_VERSION}:user:${userId}` : ''
  }

  const hasSeenReminderAnnouncement = () => {
    const key = getReminderAnnouncementKey()
    return !key || localStorage.getItem(key) === 'acknowledged'
  }

  const markReminderAnnouncementSeen = () => {
    const key = getReminderAnnouncementKey()
    if (key) localStorage.setItem(key, 'acknowledged')
  }

  const maybeShowReminderAnnouncement = () => {
    if (!userStore.isLogin || hasSeenReminderAnnouncement()) return
    reminderAnnouncementVisible.value = true
  }

  const handleDismissReminderAnnouncement = () => {
    markReminderAnnouncementSeen()
    reminderAnnouncementVisible.value = false
  }

  const handleGoReminderSettings = () => {
    markReminderAnnouncementSeen()
    reminderAnnouncementVisible.value = false
    router.push({ name: 'UserCenter' })
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-'
    return dayjs(value).format('YYYY-MM-DD HH:mm')
  }

  const formatRate = (value?: number | null) => `${value || 0}%`

  const priorityText = (priority?: number | null) => {
    if (priority === 3) return '高'
    if (priority === 2) return '中'
    return '低'
  }

  const priorityTag = (priority?: number | null) => {
    if (priority === 3) return 'danger'
    if (priority === 2) return 'warning'
    return 'info'
  }

  const sourceText = (sourceType?: string) =>
    sourceType === 'RECURRING_PLAN' ? '周期计划' : '项目任务'

  const roleText = (role?: string) => {
    if (role === 'owner') return '拥有者'
    if (role === 'admin') return '管理员'
    if (role === 'project_guest') return '项目访客'
    if (role === 'task_guest') return '任务访客'
    return '成员'
  }

  const healthText = (level?: string) => {
    if (level === 'healthy') return '健康'
    if (level === 'warning') return '观察'
    return '风险'
  }

  const healthTag = (level?: string) => {
    if (level === 'healthy') return 'success'
    if (level === 'warning') return 'warning'
    return 'danger'
  }

  const healthWeight = (level?: string) => {
    if (level === 'risk') return 3
    if (level === 'warning') return 2
    return 1
  }

  onMounted(() => {
    loadAll()
    maybeShowReminderAnnouncement()
  })
</script>

<style scoped lang="scss">
  .workbench-page {
    min-height: calc(100vh - 1rem);
    padding: 20px;
    background: #f6f8fb;
    color: #1f2937;
  }

  .page-header,
  .section-block,
  .data-panel {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 20px;
  }

  .page-kicker {
    margin: 0 0 6px;
    font-size: 13px;
    color: #64748b;
  }

  .page-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
  }

  .page-subtitle {
    margin: 8px 0 0;
    color: #64748b;
    line-height: 1.7;
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .section-block {
    margin-top: 16px;
    padding: 18px;
  }

  .section-heading,
  .panel-title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .section-heading h2,
  .panel-title h3 {
    margin: 0;
    color: #111827;
  }

  .section-heading h2 {
    font-size: 20px;
  }

  .panel-title h3 {
    font-size: 16px;
  }

  .section-heading p,
  .panel-title span {
    margin: 6px 0 0;
    color: #64748b;
    line-height: 1.6;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .metric-card {
    min-height: 124px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }

  .metric-card--platform {
    background: #f8fafc;
  }

  .metric-icon {
    margin-bottom: 12px;
    color: #2563eb;
    font-size: 22px;
  }

  .metric-card span,
  .metric-card small {
    display: block;
    color: #64748b;
  }

  .metric-card strong {
    display: block;
    margin: 8px 0 4px;
    font-size: 28px;
    line-height: 1.1;
    color: #111827;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  .data-panel {
    padding: 16px;
    min-width: 0;
  }

  .content-grid + .data-panel {
    margin-top: 12px;
  }

  .notice-dialog h3 {
    margin: 0 0 12px;
    font-size: 20px;
    color: #111827;
  }

  .notice-dialog p {
    margin: 0;
    line-height: 1.7;
    color: #4b5563;
  }

  .notice-box {
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    background: #f6f8fb;
    color: #4b5563;
    line-height: 1.8;
  }

  .notice-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  @media (max-width: 1180px) {
    .metric-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .chart-grid,
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .workbench-page {
      padding: 12px;
    }

    .page-header,
    .section-heading {
      display: block;
    }

    .header-actions {
      justify-content: flex-start;
      margin-top: 14px;
    }

    .metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
