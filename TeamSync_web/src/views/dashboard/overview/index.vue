<template>
  <div class="overview-page" v-loading="overviewLoading">
    <header class="page-header">
      <div>
        <p class="page-kicker">项目概览</p>
        <h1>{{ scopeTitle }}</h1>
        <p class="page-subtitle">
          {{ scopeDescription }} 页面只展示项目和平台统计，不把平台任务计入任何管理员个人待办。
        </p>
      </div>
      <div class="header-actions">
        <ElButton :icon="Refresh" @click="loadAll">刷新</ElButton>
        <ElButton :icon="House" @click="goWorkbench">返回工作台</ElButton>
      </div>
    </header>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>{{ isPlatformAdmin ? '全平台项目概况' : '我的可见项目概况' }}</h2>
          <p>项目、任务、成员和风险按当前账号的可见范围统计。</p>
        </div>
      </div>

      <div class="metric-grid">
        <article v-for="item in overviewCards" :key="item.label" class="metric-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </div>

      <div class="chart-grid chart-grid--three">
        <OverviewChartPanel
          title="任务趋势"
          subtitle="最近 7 天新增、完成和逾期"
          :option="overviewTrendOption"
        />
        <OverviewChartPanel
          title="项目健康"
          subtitle="健康、观察、风险项目分布"
          :option="healthOption"
        />
        <OverviewChartPanel
          title="待办优先级"
          subtitle="当前待办任务优先级分布"
          :option="priorityOption"
        />
      </div>

      <section class="data-panel">
        <div class="panel-title">
          <h3>项目明细</h3>
          <span>{{ overviewData.projects.length }} 个项目</span>
        </div>
        <ElTable :data="overviewData.projects" height="420" stripe>
          <ElTableColumn prop="name" label="项目" min-width="200">
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
          <ElTableColumn prop="taskCount" label="任务" width="90" align="center" />
          <ElTableColumn prop="pendingCount" label="待办" width="90" align="center" />
          <ElTableColumn prop="overdueCount" label="逾期" width="90" align="center" />
          <ElTableColumn label="完成率" width="100" align="center">
            <template #default="{ row }">{{ formatRate(row.completionRate) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="memberCount" label="成员" width="90" align="center" />
          <ElTableColumn label="最近活动" width="170">
            <template #default="{ row }">{{
              formatDateTime(row.lastActivityAt || row.updatedAt)
            }}</template>
          </ElTableColumn>
        </ElTable>
      </section>
    </section>

    <section class="section-block" v-loading="managementLoading">
      <div class="section-heading">
        <div>
          <h2>{{ isPlatformAdmin ? '平台管理统计' : '我的项目统计' }}</h2>
          <p>
            {{
              isPlatformAdmin
                ? '这是管理员视角的平台统计，用于管理观察。'
                : '这里仅统计你可见项目范围内的数据。'
            }}
          </p>
        </div>
        <div class="header-actions">
          <ArtExcelExport
            :data="exportRows"
            :columns="exportColumns"
            :filename="exportFilename"
            sheet-name="TeamSync统计"
            :auto-index="true"
            :disabled="exportRows.length === 0"
          >
            导出 XLSX
          </ArtExcelExport>
          <ElButton :disabled="exportRows.length === 0" @click="exportCsv">导出 CSV</ElButton>
        </div>
      </div>

      <div class="filter-row">
        <ElSelect v-model="managementQuery.projectId" clearable filterable placeholder="全部项目">
          <ElOption
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ElSelect>
        <ElSelect v-model="managementQuery.memberId" clearable filterable placeholder="全部成员">
          <ElOption
            v-for="item in memberOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ElSelect>
        <ElDatePicker
          v-model="managementQuery.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="false"
        />
        <ElButton :icon="Refresh" @click="resetManagementFilters">重置</ElButton>
        <ElButton type="primary" :icon="Search" @click="loadManagementData">查询</ElButton>
      </div>

      <div class="metric-grid">
        <article
          v-for="item in managementCards"
          :key="item.label"
          class="metric-card metric-card--soft"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </div>

      <div class="chart-grid">
        <OverviewChartPanel
          title="筛选周期任务趋势"
          :subtitle="managementRangeText"
          :option="managementTrendOption"
        />
        <OverviewChartPanel
          title="成员负载排行"
          subtitle="按待办、临期、逾期和高优先级计算"
          :option="workloadOption"
        />
      </div>

      <ElTabs v-model="activeReportTab" class="report-tabs">
        <ElTabPane label="项目健康与延期" name="projects">
          <ElTable :data="managementData.projectMetrics" height="420" stripe>
            <ElTableColumn prop="projectName" label="项目" min-width="200">
              <template #default="{ row }">
                <ElButton link type="primary" @click="goToBoard(row.projectId, row.projectName)">
                  {{ row.projectName }}
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
            <ElTableColumn prop="taskCount" label="任务" width="90" align="center" />
            <ElTableColumn prop="pendingTaskCount" label="待办" width="90" align="center" />
            <ElTableColumn prop="overdueTaskCount" label="逾期" width="90" align="center" />
            <ElTableColumn prop="dueSoonTaskCount" label="临期" width="90" align="center" />
            <ElTableColumn label="完成率" width="100" align="center">
              <template #default="{ row }">{{ formatRate(row.completionRate) }}</template>
            </ElTableColumn>
            <ElTableColumn label="逾期率" width="100" align="center">
              <template #default="{ row }">{{ formatRate(row.overdueRate) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="recurringPlanCount" label="周期计划" width="110" align="center" />
          </ElTable>
        </ElTabPane>

        <ElTabPane label="成员负载" name="members">
          <ElTable :data="managementData.memberWorkloads" height="420" stripe>
            <ElTableColumn prop="memberName" label="成员" min-width="160" />
            <ElTableColumn label="负载风险" width="120">
              <template #default="{ row }">
                <ElTag :type="workloadTag(row.riskLevel)" effect="light">{{
                  workloadText(row.riskLevel)
                }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="taskCount" label="任务" width="90" align="center" />
            <ElTableColumn prop="pendingTaskCount" label="待办" width="90" align="center" />
            <ElTableColumn prop="dueSoonTaskCount" label="临期" width="90" align="center" />
            <ElTableColumn prop="overdueTaskCount" label="逾期" width="90" align="center" />
            <ElTableColumn prop="highPriorityCount" label="高优先级" width="110" align="center" />
            <ElTableColumn
              prop="recurringPendingCount"
              label="周期待办"
              width="110"
              align="center"
            />
            <ElTableColumn label="完成率" width="100" align="center">
              <template #default="{ row }">{{ formatRate(row.completionRate) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="workloadScore" label="负载分" width="90" align="center" />
          </ElTable>
        </ElTabPane>

        <ElTabPane label="周期计划完成率" name="recurring">
          <ElTable :data="managementData.recurringPlans" height="420" stripe>
            <ElTableColumn prop="title" label="计划" min-width="220" />
            <ElTableColumn prop="projectName" label="项目" min-width="160" />
            <ElTableColumn
              prop="assigneeNames"
              label="负责人"
              min-width="170"
              show-overflow-tooltip
            />
            <ElTableColumn label="下次执行" width="170">
              <template #default="{ row }">{{ formatDateTime(row.nextRunAt) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="occurrenceCount" label="期次" width="80" align="center" />
            <ElTableColumn prop="pendingCount" label="待处理" width="90" align="center" />
            <ElTableColumn prop="overdueCount" label="逾期" width="90" align="center" />
            <ElTableColumn label="执行率" width="100" align="center">
              <template #default="{ row }">{{ formatRate(row.executionRate) }}</template>
            </ElTableColumn>
            <ElTableColumn label="完成率" width="100" align="center">
              <template #default="{ row }">{{ formatRate(row.completionRate) }}</template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>
      </ElTabs>
    </section>
  </div>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type { EChartsOption } from 'echarts'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { House, Refresh, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type {
    DashboardManagementSummary,
    DashboardManagementVO,
    DashboardOption,
    DashboardOverviewSummary,
    DashboardOverviewVO,
    DashboardTaskTrendItem
  } from '@/api/dashboard'
  import { getManagementData, getOverviewData } from '@/api/dashboard'
  import ArtExcelExport from '@/components/core/forms/art-excel-export/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import OverviewChartPanel from './modules/OverviewChartPanel.vue'

  type ReportTab = 'projects' | 'members' | 'recurring'
  type ExportValue = string | number | boolean | null | undefined
  type ExportRow = Record<string, ExportValue>
  type ExportColumnMap = Record<string, { title: string; width?: number }>

  const router = useRouter()
  const userStore = useUserStore()

  const todayText = dayjs().format('YYYY-MM-DD')
  const startText = dayjs().subtract(29, 'day').format('YYYY-MM-DD')

  const overviewLoading = ref(false)
  const managementLoading = ref(false)
  const overviewData = ref<DashboardOverviewVO>(createEmptyOverview())
  const managementData = ref<DashboardManagementVO>(createEmptyManagementData())
  const projectOptions = ref<DashboardOption[]>([])
  const memberOptions = ref<DashboardOption[]>([])
  const activeReportTab = ref<ReportTab>('projects')

  const managementQuery = reactive<{
    projectId?: number
    memberId?: number
    dateRange: [string, string]
  }>({
    projectId: undefined,
    memberId: undefined,
    dateRange: [startText, todayText]
  })

  const isPlatformAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return (
      userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
    )
  })

  const scopeTitle = computed(() => (isPlatformAdmin.value ? '全平台项目概览' : '我的项目概览'))
  const scopeDescription = computed(() =>
    isPlatformAdmin.value
      ? '当前账号是平台管理员，以下为全平台可管理数据。'
      : '以下为当前账号参与或可见的项目数据。'
  )

  const overviewCards = computed(() => {
    const summary = overviewData.value.summary
    return [
      {
        label: '项目数',
        value: summary.projectCount,
        hint: `平均进度 ${summary.averageProgress}%`
      },
      { label: '任务数', value: summary.taskCount, hint: `完成 ${summary.doneTaskCount} 项` },
      {
        label: '待办',
        value: summary.pendingTaskCount,
        hint: `逾期 ${summary.overdueTaskCount} 项`
      },
      {
        label: '完成率',
        value: `${summary.completionRate}%`,
        hint: `${summary.memberCount} 名成员`
      },
      {
        label: '风险项目',
        value: summary.riskProjectCount,
        hint: `${summary.warningProjectCount} 个观察项目`
      },
      {
        label: '近 7 天动态',
        value: summary.activityCount7d,
        hint: `${summary.commentCount} 条评论`
      }
    ]
  })

  const managementCards = computed(() => {
    const summary = managementData.value.summary
    return [
      { label: '筛选任务', value: summary.taskCount, hint: `完成率 ${summary.completionRate}%` },
      { label: '延期风险', value: summary.riskTaskCount, hint: `逾期率 ${summary.overdueRate}%` },
      { label: '成员数', value: summary.memberCount, hint: `${summary.activeProjectCount} 个项目` },
      {
        label: '周期计划',
        value: summary.recurringPlanCount,
        hint: `完成率 ${summary.recurringCompletionRate}%`
      }
    ]
  })

  const managementRangeText = computed(
    () => `${managementQuery.dateRange[0]} 至 ${managementQuery.dateRange[1]}`
  )

  const overviewTrendOption = computed<EChartsOption>(() =>
    buildTrendOption(overviewData.value.platformTrend7d)
  )
  const managementTrendOption = computed<EChartsOption>(() =>
    buildTrendOption(managementData.value.taskTrend)
  )
  const healthOption = computed<EChartsOption>(() => ({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['46%', '70%'],
        data: overviewData.value.healthDistribution.map((item) => ({
          name: item.label,
          value: item.count
        }))
      }
    ]
  }))
  const priorityOption = computed<EChartsOption>(() => ({
    tooltip: { trigger: 'item' },
    grid: { left: 36, right: 20, top: 20, bottom: 32 },
    xAxis: {
      type: 'category',
      data: overviewData.value.priorityDistribution.map((item) => priorityText(item.priority))
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        data: overviewData.value.priorityDistribution.map((item) => item.count),
        barWidth: 28
      }
    ]
  }))
  const workloadOption = computed<EChartsOption>(() => {
    const rows = managementData.value.memberWorkloads.slice(0, 10).reverse()
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 86, right: 20, top: 20, bottom: 28 },
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: { type: 'category', data: rows.map((item) => item.memberName) },
      series: [
        { name: '负载分', type: 'bar', data: rows.map((item) => item.workloadScore), barWidth: 16 }
      ]
    }
  })

  const exportRows = computed<ExportRow[]>(() => {
    if (activeReportTab.value === 'members') {
      return managementData.value.memberWorkloads.map((item) => ({
        成员: item.memberName,
        负载风险: workloadText(item.riskLevel),
        任务数: item.taskCount,
        待办: item.pendingTaskCount,
        临期: item.dueSoonTaskCount,
        逾期: item.overdueTaskCount,
        高优先级: item.highPriorityCount,
        周期待办: item.recurringPendingCount,
        完成率: `${item.completionRate}%`,
        负载分: item.workloadScore
      }))
    }

    if (activeReportTab.value === 'recurring') {
      return managementData.value.recurringPlans.map((item) => ({
        计划: item.title,
        项目: item.projectName,
        负责人: item.assigneeNames,
        下次执行: formatDateTime(item.nextRunAt),
        期次: item.occurrenceCount,
        待处理: item.pendingCount,
        逾期: item.overdueCount,
        执行率: `${item.executionRate}%`,
        完成率: `${item.completionRate}%`
      }))
    }

    return managementData.value.projectMetrics.map((item) => ({
      项目: item.projectName,
      负责人: item.ownerName,
      健康: healthText(item.healthLevel),
      进度: `${item.progress}%`,
      任务数: item.taskCount,
      待办: item.pendingTaskCount,
      逾期: item.overdueTaskCount,
      临期: item.dueSoonTaskCount,
      完成率: `${item.completionRate}%`,
      逾期率: `${item.overdueRate}%`,
      周期计划: item.recurringPlanCount
    }))
  })

  const exportColumns = computed<ExportColumnMap>(() => {
    const first = exportRows.value[0]
    if (!first) return {}
    return Object.keys(first).reduce<ExportColumnMap>((result, key) => {
      result[key] = { title: key, width: 18 }
      return result
    }, {})
  })

  const exportFilename = computed(
    () =>
      `TeamSync-${isPlatformAdmin.value ? '平台' : '项目'}统计-${activeReportTab.value}-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`
  )

  function createEmptySummary(): DashboardOverviewSummary {
    return {
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
    }
  }

  function createEmptyManagementSummary(): DashboardManagementSummary {
    return {
      taskCount: 0,
      doneTaskCount: 0,
      pendingTaskCount: 0,
      overdueTaskCount: 0,
      dueSoonTaskCount: 0,
      completionRate: 0,
      overdueRate: 0,
      riskTaskCount: 0,
      memberCount: 0,
      activeProjectCount: 0,
      recurringPlanCount: 0,
      recurringOccurrenceCount: 0,
      recurringExecutedCount: 0,
      recurringCompletedCount: 0,
      recurringExecutionRate: 0,
      recurringCompletionRate: 0
    }
  }

  function createTrendDefaults(): DashboardTaskTrendItem[] {
    return Array.from({ length: 7 }, (_, index) => ({
      date: dayjs()
        .subtract(6 - index, 'day')
        .format('MM-DD'),
      createdCount: 0,
      completedCount: 0,
      overdueCount: 0
    }))
  }

  function createEmptyOverview(): DashboardOverviewVO {
    return {
      summary: createEmptySummary(),
      platformTrend7d: createTrendDefaults(),
      activityHeat7d: [],
      priorityDistribution: [
        { priority: 1, count: 0 },
        { priority: 2, count: 0 },
        { priority: 3, count: 0 }
      ],
      healthDistribution: [],
      projects: []
    }
  }

  function createEmptyManagementData(): DashboardManagementVO {
    return {
      filter: {
        projectId: null,
        memberId: null,
        startDate: startText,
        endDate: todayText
      },
      projectOptions: [],
      memberOptions: [],
      summary: createEmptyManagementSummary(),
      taskTrend: createTrendDefaults(),
      projectMetrics: [],
      memberWorkloads: [],
      recurringPlans: []
    }
  }

  function buildTrendOption(items: DashboardTaskTrendItem[]): EChartsOption {
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: { left: 36, right: 20, top: 28, bottom: 48 },
      xAxis: { type: 'category', data: items.map((item) => item.date) },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        { name: '新增', type: 'line', smooth: true, data: items.map((item) => item.createdCount) },
        {
          name: '完成',
          type: 'line',
          smooth: true,
          data: items.map((item) => item.completedCount)
        },
        { name: '逾期', type: 'bar', data: items.map((item) => item.overdueCount) }
      ]
    }
  }

  const loadOverviewData = async () => {
    overviewLoading.value = true
    try {
      const response = await getOverviewData()
      overviewData.value = {
        ...createEmptyOverview(),
        ...response,
        summary: {
          ...createEmptySummary(),
          ...(response?.summary || {})
        },
        platformTrend7d: response?.platformTrend7d?.length
          ? response.platformTrend7d
          : createTrendDefaults(),
        projects: response?.projects || []
      }
    } catch {
      overviewData.value = createEmptyOverview()
      ElMessage.error('获取项目概览失败')
    } finally {
      overviewLoading.value = false
    }
  }

  const loadManagementData = async () => {
    managementLoading.value = true
    try {
      const response = await getManagementData({
        projectId: managementQuery.projectId,
        memberId: managementQuery.memberId,
        startDate: managementQuery.dateRange[0],
        endDate: managementQuery.dateRange[1]
      })
      managementData.value = {
        ...createEmptyManagementData(),
        ...response,
        summary: {
          ...createEmptyManagementSummary(),
          ...(response?.summary || {})
        },
        taskTrend: response?.taskTrend?.length ? response.taskTrend : createTrendDefaults(),
        projectMetrics: response?.projectMetrics || [],
        memberWorkloads: response?.memberWorkloads || [],
        recurringPlans: response?.recurringPlans || []
      }
      projectOptions.value = response?.projectOptions || []
      memberOptions.value = response?.memberOptions || []
    } catch {
      managementData.value = createEmptyManagementData()
      projectOptions.value = []
      memberOptions.value = []
      ElMessage.error('获取管理统计失败')
    } finally {
      managementLoading.value = false
    }
  }

  const loadAll = async () => {
    await Promise.all([loadOverviewData(), loadManagementData()])
  }

  const resetManagementFilters = () => {
    managementQuery.projectId = undefined
    managementQuery.memberId = undefined
    managementQuery.dateRange = [startText, todayText]
    loadManagementData()
  }

  const goWorkbench = () => {
    router.push('/dashboard/console')
  }

  const goToBoard = (projectId?: number | null, projectName?: string) => {
    if (!projectId) return
    router.push(`/project/board/${projectId}?name=${encodeURIComponent(projectName || '项目看板')}`)
  }

  const exportCsv = () => {
    if (!exportRows.value.length) return
    const headers = Object.keys(exportRows.value[0])
    const rows = exportRows.value.map((row) =>
      headers.map((header) => toCsvCell(row[header])).join(',')
    )
    const content = `\uFEFF${headers.join(',')}\n${rows.join('\n')}`
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = exportFilename.value.replace(/\.xlsx$/, '.csv')
    link.click()
    URL.revokeObjectURL(url)
  }

  const toCsvCell = (value: ExportValue) => {
    const text = value == null ? '' : String(value)
    return `"${text.replace(/"/g, '""')}"`
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

  const workloadText = (level?: string) => {
    if (level === 'high') return '高风险'
    if (level === 'attention') return '需关注'
    return '正常'
  }

  const workloadTag = (level?: string) => {
    if (level === 'high') return 'danger'
    if (level === 'attention') return 'warning'
    return 'success'
  }

  onMounted(() => {
    loadAll()
  })
</script>

<style scoped lang="scss">
  .overview-page {
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
    min-height: 110px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }

  .metric-card--soft {
    background: #f8fafc;
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

  .chart-grid--three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .data-panel {
    margin-top: 14px;
    padding: 16px;
    min-width: 0;
  }

  .filter-row {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(300px, 1.4fr) auto auto;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
  }

  .report-tabs {
    margin-top: 14px;
  }

  @media (max-width: 1280px) {
    .metric-grid,
    .chart-grid,
    .chart-grid--three {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filter-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .overview-page {
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

    .metric-grid,
    .chart-grid,
    .chart-grid--three,
    .filter-row {
      grid-template-columns: 1fr;
    }
  }
</style>
