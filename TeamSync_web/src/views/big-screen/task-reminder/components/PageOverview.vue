<template>
  <div class="screen-page page-overview">
    <div class="kpi-grid kpi-grid--six">
      <KpiCard v-for="item in data.summaryCards" :key="item.id" :item="item" />
    </div>

    <div class="page-overview__layout">
      <PanelCard
        title="高优先级 / 紧急任务"
        action-text="查看全部高优先级任务"
        @action="openDetail('urgentTasks', '全部高优先级任务')"
      >
        <template #icon>
          <WarningFilled />
        </template>
        <div v-if="data.urgentTasks.length === 0" class="empty-state">暂无高优先级任务</div>
        <div v-else class="screen-table urgent-table">
          <div class="screen-table__head">
            <span>任务名称</span>
            <span>所属项目</span>
            <span>负责人</span>
            <span>优先级</span>
            <span>剩余时间</span>
          </div>
          <AutoScrollArea :watch-key="`urgent-${data.urgentTasks.length}`">
            <div class="screen-table__body">
              <div v-for="task in data.urgentTasks" :key="task.id" class="screen-table__row">
                <span class="task-name">
                  <i :class="`status-dot status-dot--${task.status}`"></i>
                  {{ task.taskName }}
                </span>
                <span>{{ task.projectName }}</span>
                <span>{{ task.assigneeName }}</span>
                <span>
                  <StatusBadge
                    :text="task.priority"
                    :tone="priorityToneMap[task.priorityLevel]"
                    size="small"
                  />
                </span>
                <span class="time-text" :class="`time-text--${task.status}`">
                  {{ task.remainingTime }}
                </span>
              </div>
            </div>
          </AutoScrollArea>
        </div>
      </PanelCard>

      <PanelCard title="今日截止任务时间轴">
        <template #icon>
          <Clock />
        </template>
        <TaskTimeline :tasks="data.todayTimeline" />
      </PanelCard>

      <div class="page-overview__right-stack">
        <PanelCard
          title="项目风险预警"
          action-text="查看全部项目"
          dense
          @action="openDetail('projectRisks', '全部项目风险预警')"
        >
          <template #icon>
            <WarningFilled />
          </template>
          <div v-if="data.projectRisks.length === 0" class="empty-state">暂无项目风险</div>
          <div v-else class="screen-table risk-table">
            <div class="screen-table__head">
              <span>项目名称</span>
              <span>整体进度</span>
              <span>逾期任务</span>
              <span>风险等级</span>
            </div>
            <AutoScrollArea :watch-key="`risk-${data.projectRisks.length}`">
              <div class="screen-table__body">
                <div v-for="project in data.projectRisks" :key="project.id" class="screen-table__row">
                  <span>{{ project.projectName }}</span>
                  <span class="progress-cell">
                    <b>{{ project.progress }}%</b>
                    <i>
                      <em :style="{ width: `${project.progress}%` }"></em>
                    </i>
                  </span>
                  <span :class="{ 'danger-number': project.overdueTaskCount > 0 }">
                    {{ project.overdueTaskCount }}
                  </span>
                  <span>
                    <StatusBadge
                      :text="project.riskText"
                      :tone="riskToneMap[project.riskLevel]"
                      size="small"
                    />
                  </span>
                </div>
              </div>
            </AutoScrollArea>
          </div>
        </PanelCard>

        <PanelCard
          title="周期计划提醒"
          action-text="查看全部周期计划"
          dense
          @action="openDetail('recurringPlans', '全部周期计划提醒')"
        >
          <template #icon>
            <Calendar />
          </template>
          <div v-if="data.recurringPlans.length === 0" class="empty-state">暂无周期计划提醒</div>
          <div v-else class="screen-table recurring-table">
            <div class="screen-table__head">
              <span>计划名称</span>
              <span>周期</span>
              <span>下次执行时间</span>
              <span>负责人</span>
              <span>截止时间</span>
            </div>
            <AutoScrollArea :watch-key="`recurring-${data.recurringPlans.length}`">
              <div class="screen-table__body">
                <div v-for="plan in data.recurringPlans" :key="plan.id" class="screen-table__row">
                  <span>{{ plan.planName }}</span>
                  <span>{{ plan.cycle }}</span>
                  <span>{{ plan.nextRunTime }}</span>
                  <span>{{ plan.assigneeName }}</span>
                  <span class="time-text" :class="`time-text--${plan.status}`">{{ plan.dueTime }}</span>
                </div>
              </div>
            </AutoScrollArea>
          </div>
        </PanelCard>
      </div>
    </div>

    <FooterNotice label="提醒说明" :items="footerItems" />
  </div>
</template>

<script setup lang="ts">
  import { Calendar, Clock, WarningFilled } from '@element-plus/icons-vue'
  import type { PriorityLevel, RiskLevel, TaskReminderScreenData } from '@/api/big-screen'
  import AutoScrollArea from './AutoScrollArea.vue'
  import type { ScreenDetailRequest, ScreenDetailType } from './detail-dialog'
  import FooterNotice from './FooterNotice.vue'
  import KpiCard from './KpiCard.vue'
  import PanelCard from './PanelCard.vue'
  import StatusBadge from './StatusBadge.vue'
  import TaskTimeline from './TaskTimeline.vue'

  defineProps<{
    data: TaskReminderScreenData
  }>()

  const emit = defineEmits<{
    (e: 'open-detail', payload: ScreenDetailRequest): void
  }>()

  const openDetail = (type: ScreenDetailType, title: string) => {
    emit('open-detail', { type, title })
  }

  const priorityToneMap: Record<PriorityLevel, 'danger' | 'warning'> = {
    p0: 'danger',
    p1: 'warning',
    p2: 'warning'
  }

  const riskToneMap: Record<RiskLevel, 'danger' | 'warning' | 'success'> = {
    high: 'danger',
    attention: 'warning',
    medium: 'warning',
    normal: 'success',
    low: 'success'
  }

  const footerItems = [
    { text: '红色表示已逾期', tone: 'danger' as const },
    { text: '橙色表示 48 小时内到期', tone: 'warning' as const },
    { text: '大屏每 60 秒自动刷新', tone: 'primary' as const },
    { text: '仅展示任务摘要信息', tone: 'neutral' as const }
  ]
</script>

<style scoped lang="scss">
  .screen-page {
    display: grid;
    height: 100%;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 16px;
  }

  .kpi-grid {
    display: grid;
    gap: 18px;
  }

  .kpi-grid--six {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .page-overview__layout {
    display: grid;
    min-height: 0;
    grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.9fr) minmax(0, 1.05fr);
    gap: 18px;
  }

  .page-overview__right-stack {
    display: grid;
    min-height: 0;
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    gap: 18px;
  }

  .screen-table {
    display: grid;
    height: 100%;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: 8px;
  }

  .screen-table__head,
  .screen-table__row {
    display: grid;
    align-items: center;
    min-width: 0;
  }

  .screen-table__head {
    min-height: 43px;
    color: #475569;
    font-size: 13px;
    font-weight: 800;
    background: #f8fafc;
    border-bottom: 1px solid var(--border-color);
  }

  .screen-table__body {
    min-height: 0;
    overflow: hidden;
  }

  .screen-table__row {
    min-height: 52px;
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 650;
    border-bottom: 1px solid var(--border-color);
  }

  .screen-table__row:last-child {
    border-bottom: 0;
  }

  .screen-table__head span,
  .screen-table__row span {
    min-width: 0;
    padding: 0 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .urgent-table .screen-table__head,
  .urgent-table .screen-table__row {
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr) 72px 92px 88px;
  }

  .risk-table .screen-table__head,
  .risk-table .screen-table__row {
    grid-template-columns: minmax(0, 1fr) minmax(140px, 1fr) 78px 104px;
  }

  .recurring-table .screen-table__head,
  .recurring-table .screen-table__row {
    grid-template-columns: minmax(0, 1fr) 70px 120px 66px 130px;
  }

  .risk-table .screen-table__head span:last-child,
  .risk-table .screen-table__row span:last-child,
  .recurring-table .screen-table__head span:last-child,
  .recurring-table .screen-table__row span:last-child {
    overflow: visible;
    text-overflow: clip;
  }

  .task-name {
    display: flex;
    align-items: center;
    gap: 9px;
    font-weight: 800;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .status-dot--overdue {
    background: var(--danger);
  }

  .status-dot--dueSoon,
  .status-dot--today {
    background: var(--warning);
  }

  .status-dot--normal,
  .status-dot--inProgress {
    background: var(--primary);
  }

  .time-text {
    font-weight: 800;
  }

  .time-text--overdue {
    color: var(--danger);
  }

  .time-text--dueSoon,
  .time-text--today,
  .time-text--attention {
    color: var(--warning);
  }

  .time-text--normal {
    color: #334155;
  }

  .progress-cell {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: center;
    gap: 9px;
  }

  .progress-cell b {
    font-size: 14px;
  }

  .progress-cell i {
    display: block;
    height: 8px;
    overflow: hidden;
    background: #e8eef8;
    border-radius: 999px;
  }

  .progress-cell em {
    display: block;
    height: 100%;
    background: #60a5fa;
    border-radius: inherit;
  }

  .danger-number {
    color: var(--danger);
    font-weight: 900;
  }

  .empty-state {
    display: grid;
    height: 100%;
    place-items: center;
    color: var(--text-secondary);
    font-size: 15px;
  }

  @media (max-width: 1500px) {
    .screen-page {
      gap: 12px;
    }

    .kpi-grid,
    .page-overview__layout,
    .page-overview__right-stack {
      gap: 12px;
    }

    .screen-table__head {
      min-height: 34px;
      font-size: 11px;
    }

    .screen-table__row {
      min-height: 41px;
      font-size: 12px;
    }

    .screen-table__head span,
    .screen-table__row span {
      padding: 0 8px;
    }

    .urgent-table .screen-table__head,
    .urgent-table .screen-table__row {
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.95fr) 56px 76px 70px;
    }

    .risk-table .screen-table__head,
    .risk-table .screen-table__row {
      grid-template-columns: minmax(0, 0.95fr) minmax(98px, 0.9fr) 50px 88px;
    }

    .recurring-table .screen-table__head,
    .recurring-table .screen-table__row {
      grid-template-columns: minmax(0, 1fr) 50px 82px 48px 98px;
    }

    .progress-cell {
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 6px;
    }

    .progress-cell b {
      font-size: 11px;
    }
  }
</style>
