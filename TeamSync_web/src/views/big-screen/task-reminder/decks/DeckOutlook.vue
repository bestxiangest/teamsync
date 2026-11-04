<template>
  <div class="deck">
    <div class="deck__tiles">
      <StatTile v-for="item in data.sevenDaySummaryCards" :key="item.id" :item="item" />
    </div>

    <div class="deck__body">
      <GlassPanel
        title="未来 7 日到期分布"
        :hint="`合计 ${weekTotal} 项`"
        accent="cyan"
        clickable
        @open="detail = 'week'"
      >
        <div v-if="data.sevenDayCalendar.length === 0" class="empty">未来 7 日暂无到期事项</div>
        <WeekBoard v-else :days="data.sevenDayCalendar" />
      </GlassPanel>

      <div class="deck__side">
        <GlassPanel
          title="七日到期趋势"
          hint="按来源堆叠"
          accent="indigo"
          clickable
          @open="detail = 'trend'"
        >
          <WeekTrend
            :labels="trend.labels"
            :project-tasks="trend.projectTasks"
            :recurring-plans="trend.recurringPlans"
          />
        </GlassPanel>

        <GlassPanel
          title="周期计划提醒"
          :hint="planHint"
          accent="violet"
          clickable
          @open="detail = 'plans'"
        >
          <RecurringPlanTable :rows="data.recurringPlans" />
        </GlassPanel>
      </div>
    </div>

    <DetailDialog
      :open="detail === 'week'"
      title="未来 7 日到期分布"
      :hint="`合计 ${weekTotal} 项 · 含项目任务与周期计划`"
      accent="cyan"
      @close="detail = null"
    >
      <WeekBoard :days="data.sevenDayCalendar" :dense="false" />
    </DetailDialog>

    <DetailDialog
      :open="detail === 'trend'"
      title="七日到期趋势"
      hint="按天拆分到期来源"
      accent="indigo"
      @close="detail = null"
    >
      <DataGrid
        :columns="TREND_COLUMNS"
        :rows="trendRows"
        :row-height="56"
        :scroll="false"
        empty="未来 7 日暂无到期事项"
      >
        <template #cell-date="{ row }">
          <b class="cell-strong">{{ row.date }}</b>
        </template>
        <template #cell-total="{ row }">
          <b class="cell-total">{{ row.total }}</b>
        </template>
      </DataGrid>
    </DetailDialog>

    <DetailDialog
      :open="detail === 'plans'"
      title="周期计划提醒"
      :hint="planHint"
      accent="violet"
      @close="detail = null"
    >
      <RecurringPlanTable :rows="data.recurringPlans" :scroll="false" />
    </DetailDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { TaskReminderScreenData } from '@/api/big-screen'
  import DataGrid from '../components/DataGrid.vue'
  import DetailDialog from '../components/DetailDialog.vue'
  import GlassPanel from '../components/GlassPanel.vue'
  import StatTile from '../components/StatTile.vue'
  import WeekBoard from '../components/WeekBoard.vue'
  import WeekTrend from '../components/charts/WeekTrend.vue'
  import RecurringPlanTable from '../components/tables/RecurringPlanTable.vue'
  import type { DataColumn } from '../types'

  const props = defineProps<{
    data: TaskReminderScreenData
    trend: { labels: string[]; projectTasks: number[]; recurringPlans: number[] }
  }>()

  const emit = defineEmits<{ detail: [boolean] }>()

  const detail = ref<'week' | 'trend' | 'plans' | null>(null)

  watch(detail, (value) => emit('detail', value !== null))

  const TREND_COLUMNS: DataColumn[] = [
    { key: 'date', label: '日期', width: 'minmax(0, 1fr)' },
    { key: 'projectTasks', label: '项目任务', width: 'minmax(0, 1fr)', align: 'center' },
    { key: 'recurringPlans', label: '周期计划', width: 'minmax(0, 1fr)', align: 'center' },
    { key: 'total', label: '合计', width: 'minmax(0, 1fr)', align: 'center' }
  ]

  const weekTotal = computed(() =>
    props.data.sevenDayCalendar.reduce((sum, day) => sum + day.totalCount, 0)
  )

  const overduePlans = computed(
    () => props.data.recurringPlans.filter((plan) => plan.status === 'overdue').length
  )

  const planHint = computed(() => {
    const total = props.data.recurringPlans.length

    return overduePlans.value > 0
      ? `${total} 个计划 · ${overduePlans.value} 个已逾期`
      : `${total} 个计划`
  })

  const trendRows = computed(() =>
    props.data.sevenDayCalendar.map((day) => ({
      date: `${day.dateText} ${day.weekday}`,
      projectTasks: day.tasks.filter((task) => task.type === 'projectTask').length,
      recurringPlans: day.tasks.filter((task) => task.type === 'recurringPlan').length,
      total: day.totalCount
    }))
  )
</script>

<style scoped lang="scss">
  .deck {
    display: grid;
    grid-template-rows: 100px minmax(0, 1fr);
    gap: 12px;
    height: 100%;
    min-height: 0;
  }

  .deck__tiles {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
  }

  .deck__body {
    display: grid;
    grid-template-columns: minmax(0, 1.74fr) minmax(0, 1.26fr);
    gap: 16px;
    min-height: 0;
  }

  .deck__side {
    display: grid;
    grid-template-rows: minmax(0, 0.86fr) minmax(0, 1.14fr);
    gap: 16px;
    min-height: 0;
  }

  .cell-strong {
    font-weight: 750;
    color: var(--ts-ink);
  }

  .cell-total {
    font-size: 19px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--ts-cyan);
  }

  .empty {
    display: grid;
    flex: 1;
    place-items: center;
    min-height: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ts-ink-3);
  }
</style>
