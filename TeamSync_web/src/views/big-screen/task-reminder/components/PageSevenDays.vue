<template>
  <div class="screen-page page-seven">
    <div class="kpi-grid kpi-grid--five">
      <KpiCard v-for="item in data.sevenDaySummaryCards" :key="item.id" :item="item" />
    </div>

    <div class="page-seven__layout">
      <PanelCard title="未来 7 日截止日历" class="page-seven__calendar-panel">
        <template #icon>
          <Calendar />
        </template>
        <SevenDayCalendar :days="data.sevenDayCalendar" />
      </PanelCard>

      <PanelCard
        title="周期计划执行看板"
        action-text="查看全部周期计划"
        @action="openDetail('recurringPlans', '全部周期计划执行看板')"
      >
        <template #icon>
          <Refresh />
        </template>
        <div v-if="data.recurringPlans.length === 0" class="empty-state">暂无周期计划</div>
        <div v-else class="screen-table recurring-board-table">
          <div class="screen-table__head">
            <span>计划名称</span>
            <span>周期</span>
            <span>下次执行</span>
            <span>负责人</span>
            <span>状态</span>
          </div>
          <AutoScrollArea :watch-key="`recurring-board-${recurringBoardItems.length}`">
            <div class="screen-table__body">
              <div v-for="plan in recurringBoardItems" :key="plan.id" class="screen-table__row">
                <span class="strong-text">{{ plan.planName }}</span>
                <span>{{ plan.cycle }}</span>
                <span>{{ plan.nextRunTime }}</span>
                <span>{{ plan.assigneeName }}</span>
                <span>
                  <StatusBadge :text="plan.statusText" :tone="plan.tone" size="small" />
                </span>
              </div>
            </div>
          </AutoScrollArea>
        </div>
      </PanelCard>

      <PanelCard
        title="每日重点提醒"
        action-text="查看完整未来 7 日任务"
        @action="openDetail('futureTasks', '完整未来 7 日任务')"
      >
        <template #icon>
          <BellFilled />
        </template>
        <div v-if="data.dailyFocus.length === 0" class="empty-state">暂无每日重点提醒</div>
        <div v-else class="screen-table daily-focus-table">
          <div class="screen-table__head">
            <span>日期</span>
            <span>重点任务</span>
            <span>负责人</span>
            <span>截止倒计时</span>
          </div>
          <AutoScrollArea :watch-key="`daily-focus-${data.dailyFocus.length}`">
            <div class="screen-table__body">
              <div v-for="item in data.dailyFocus" :key="item.id" class="screen-table__row">
                <span class="date-cell">
                  <i :class="`status-dot status-dot--${item.status}`"></i>
                  {{ item.dateText }}
                </span>
                <span class="strong-text">{{ item.taskName }}</span>
                <span>{{ item.assigneeName }}</span>
                <span class="time-text" :class="`time-text--${item.status}`">{{ item.countdownText }}</span>
              </div>
            </div>
          </AutoScrollArea>
        </div>
      </PanelCard>

      <PanelCard title="项目节点预告">
        <template #icon>
          <Flag />
        </template>
        <div v-if="data.milestoneCards.length === 0" class="empty-state">暂无项目节点</div>
        <AutoScrollArea v-else :watch-key="`milestones-${data.milestoneCards.length}`">
          <div class="milestone-grid">
            <article
              v-for="item in data.milestoneCards"
              :key="item.id"
              class="milestone-card"
              :class="`milestone-card--${item.tone}`"
            >
              <header>
                <span>{{ item.projectName.slice(0, 1) }}</span>
                <strong>{{ item.projectName }}</strong>
              </header>
              <dl>
                <div>
                  <dt>下一里程碑</dt>
                  <dd>{{ item.milestoneName }}</dd>
                </div>
                <div>
                  <dt>预计日期</dt>
                  <dd>{{ item.expectedDate }}</dd>
                </div>
                <div>
                  <dt>准备度</dt>
                  <dd class="readiness-cell">
                    <i><em :style="{ width: `${item.readiness}%` }"></em></i>
                    <b>{{ item.readiness }}%</b>
                  </dd>
                </div>
                <div>
                  <dt>风险等级</dt>
                  <dd>
                    <span class="risk-dot" :class="`risk-dot--${item.riskLevel}`"></span>
                    {{ item.riskText }}
                  </dd>
                </div>
              </dl>
            </article>
          </div>
        </AutoScrollArea>
      </PanelCard>
    </div>

    <FooterNotice label="大屏使用说明" :items="footerItems" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { BellFilled, Calendar, Flag, Refresh } from '@element-plus/icons-vue'
  import type { RecurringPlanReminderItem, TaskReminderScreenData } from '@/api/big-screen'
  import AutoScrollArea from './AutoScrollArea.vue'
  import type { ScreenDetailRequest, ScreenDetailType } from './detail-dialog'
  import FooterNotice from './FooterNotice.vue'
  import KpiCard from './KpiCard.vue'
  import PanelCard from './PanelCard.vue'
  import SevenDayCalendar from './SevenDayCalendar.vue'
  import StatusBadge from './StatusBadge.vue'

  const props = defineProps<{
    data: TaskReminderScreenData
  }>()

  const emit = defineEmits<{
    (e: 'open-detail', payload: ScreenDetailRequest): void
  }>()

  const openDetail = (type: ScreenDetailType, title: string) => {
    emit('open-detail', { type, title })
  }

  interface RecurringBoardItem extends RecurringPlanReminderItem {
    statusText: string
    tone: 'danger' | 'warning' | 'success'
  }

  const recurringBoardItems = computed<RecurringBoardItem[]>(() =>
    props.data.recurringPlans.map((plan) => {
      if (plan.status === 'attention') {
        return { ...plan, statusText: '需关注', tone: 'warning' }
      }

      if (plan.status === 'dueSoon' || plan.status === 'today') {
        return { ...plan, statusText: '即将执行', tone: 'warning' }
      }

      return { ...plan, statusText: '正常', tone: 'success' }
    })
  )

  const footerItems = [
    { text: '红色为逾期', tone: 'danger' as const },
    { text: '橙色为即将截止', tone: 'warning' as const },
    { text: '蓝色为正常', tone: 'primary' as const },
    { text: '仅展示公开摘要信息', tone: 'neutral' as const }
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

  .kpi-grid--five {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .page-seven__layout {
    display: grid;
    min-height: 0;
    grid-template-columns: minmax(0, 1.38fr) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1.08fr) minmax(0, 0.82fr);
    gap: 18px;
  }

  .page-seven__calendar-panel {
    min-height: 0;
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
    min-height: 38px;
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
    min-height: 42px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 650;
    border-bottom: 1px solid var(--border-color);
  }

  .screen-table__row:last-child {
    border-bottom: 0;
  }

  .screen-table__head span,
  .screen-table__row span {
    min-width: 0;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recurring-board-table .screen-table__head,
  .recurring-board-table .screen-table__row {
    grid-template-columns: minmax(0, 1fr) 66px 112px 66px 106px;
  }

  .recurring-board-table .screen-table__head span:last-child,
  .recurring-board-table .screen-table__row span:last-child {
    overflow: visible;
    text-overflow: clip;
  }

  .daily-focus-table .screen-table__head,
  .daily-focus-table .screen-table__row {
    grid-template-columns: 138px minmax(0, 1.35fr) 110px 120px;
  }

  .strong-text {
    font-weight: 900;
  }

  .date-cell {
    display: flex;
    align-items: center;
    gap: 8px;
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
    font-weight: 900;
  }

  .time-text--overdue {
    color: var(--danger);
  }

  .time-text--dueSoon,
  .time-text--today {
    color: var(--warning);
  }

  .time-text--normal {
    color: #334155;
  }

  .milestone-grid {
    display: grid;
    height: 100%;
    min-height: 0;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .milestone-card {
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 13px;
    padding: 16px;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

  .milestone-card header {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
  }

  .milestone-card header span {
    display: inline-grid;
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    place-items: center;
    color: #fff;
    background: var(--primary);
    border-radius: 50%;
    font-size: 17px;
    font-weight: 900;
  }

  .milestone-card--warning header span {
    background: var(--warning);
  }

  .milestone-card--success header span {
    background: var(--success);
  }

  .milestone-card--purple header span {
    background: var(--purple);
  }

  .milestone-card header strong {
    min-width: 0;
    overflow: hidden;
    color: var(--text-primary);
    font-size: 17px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .milestone-card dl {
    display: grid;
    min-height: 0;
    align-content: space-between;
    gap: 9px;
    margin: 0;
  }

  .milestone-card dl div {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
  }

  .milestone-card dt {
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 700;
  }

  .milestone-card dd {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 800;
  }

  .readiness-cell i {
    display: block;
    width: 90px;
    height: 8px;
    overflow: hidden;
    background: #e8eef8;
    border-radius: 999px;
  }

  .readiness-cell em {
    display: block;
    height: 100%;
    background: #3b82f6;
    border-radius: inherit;
  }

  .readiness-cell b {
    font-weight: 900;
  }

  .risk-dot {
    width: 11px;
    height: 11px;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .risk-dot--high {
    background: var(--danger);
  }

  .risk-dot--medium,
  .risk-dot--attention {
    background: var(--warning);
  }

  .risk-dot--low,
  .risk-dot--normal {
    background: var(--success);
  }

  .empty-state {
    display: grid;
    height: 100%;
    place-items: center;
    color: var(--text-secondary);
    font-size: 15px;
  }

  @media (max-width: 1500px) {
    .screen-page,
    .kpi-grid,
    .page-seven__layout {
      gap: 12px;
    }

    .screen-table__head {
      min-height: 31px;
      font-size: 11px;
    }

    .screen-table__row {
      min-height: 34px;
      font-size: 12px;
    }

    .screen-table__head span,
    .screen-table__row span {
      padding: 0 7px;
    }

    .recurring-board-table .screen-table__head,
    .recurring-board-table .screen-table__row {
      grid-template-columns: minmax(0, 1fr) 48px 78px 48px 86px;
    }

    .daily-focus-table .screen-table__head,
    .daily-focus-table .screen-table__row {
      grid-template-columns: 106px minmax(0, 1.25fr) 78px 88px;
    }

    .milestone-grid {
      gap: 10px;
    }

    .milestone-card {
      gap: 8px;
      padding: 11px;
    }

    .milestone-card header span {
      width: 31px;
      height: 31px;
      font-size: 14px;
    }

    .milestone-card header strong {
      font-size: 14px;
    }

    .milestone-card dl {
      gap: 6px;
    }

    .milestone-card dl div {
      grid-template-columns: 60px minmax(0, 1fr);
      gap: 6px;
    }

    .milestone-card dt,
    .milestone-card dd {
      font-size: 11px;
    }

    .readiness-cell i {
      width: 58px;
      height: 6px;
    }
  }
</style>
