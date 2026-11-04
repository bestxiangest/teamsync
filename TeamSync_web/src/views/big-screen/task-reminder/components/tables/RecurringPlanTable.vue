<template>
  <DataGrid
    :columns="PLAN_COLUMNS"
    :rows="rows"
    :scroll="scroll"
    :row-height="scroll ? 52 : 56"
    empty="暂无启用中的周期计划"
  >
    <template #cell-planName="{ row }">
      <span class="cell-name">
        <i class="dot"></i>
        <b>{{ row.planName }}</b>
      </span>
    </template>
    <template #cell-cycle="{ row }">
      <StatusPill :text="row.cycle" tone="violet" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :text="STATUS_TEXT[row.status]" :tone="STATUS_TONE[row.status]" dot />
    </template>
  </DataGrid>
</template>

<script setup lang="ts">
  import type { RecurringPlanReminderItem } from '@/api/big-screen'
  import DataGrid from '../DataGrid.vue'
  import StatusPill from '../StatusPill.vue'
  import type { DataColumn, PillTone } from '../../types'

  type PlanStatus = RecurringPlanReminderItem['status']

  withDefaults(defineProps<{ rows: RecurringPlanReminderItem[]; scroll?: boolean }>(), {
    scroll: true
  })

  const STATUS_TEXT: Record<PlanStatus, string> = {
    overdue: '已逾期',
    today: '今日执行',
    dueSoon: '48 小时内',
    normal: '按期待执行',
    inProgress: '进行中',
    attention: '需关注'
  }

  const STATUS_TONE: Record<PlanStatus, PillTone> = {
    overdue: 'danger',
    today: 'warning',
    dueSoon: 'warning',
    normal: 'success',
    inProgress: 'info',
    attention: 'warning'
  }

  const PLAN_COLUMNS: DataColumn[] = [
    { key: 'planName', label: '周期计划', width: 'minmax(0, 1.3fr)' },
    { key: 'cycle', label: '频率', width: '96px' },
    { key: 'nextRunTime', label: '下次执行', width: '168px' },
    { key: 'assigneeName', label: '责任人', width: 'minmax(0, 0.9fr)' },
    { key: 'status', label: '状态', width: '128px' }
  ]
</script>

<style scoped lang="scss">
  .cell-name {
    display: flex;
    gap: 10px;
    align-items: center;
    overflow: hidden;
  }

  .cell-name b {
    overflow: hidden;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dot {
    flex: 0 0 auto;
    width: 9px;
    height: 9px;
    background: var(--ts-violet);
    border-radius: 50%;
    box-shadow: 0 0 9px var(--ts-violet);
  }
</style>
