<template>
  <DataGrid
    :columns="URGENT_COLUMNS"
    :rows="rows"
    :scroll="scroll"
    :row-height="scroll ? 52 : 58"
    empty="当前没有紧急待办，节奏良好"
  >
    <template #cell-taskName="{ row }">
      <span class="cell-name">
        <i :class="`dot dot--${row.status}`"></i>
        <b>{{ row.taskName }}</b>
      </span>
    </template>
    <template #cell-priority="{ row }">
      <StatusPill :text="row.priority" :tone="PRIORITY_TONE[row.priorityLevel]" />
    </template>
    <template #cell-remainingTime="{ row }">
      <span :class="`countdown countdown--${row.status}`">{{ countdownText(row) }}</span>
    </template>
  </DataGrid>
</template>

<script setup lang="ts">
  import type { PriorityLevel, UrgentTaskItem } from '@/api/big-screen'
  import { formatCountdown, useScreenNow } from '../../composables/useScreenClock'
  import DataGrid from '../DataGrid.vue'
  import StatusPill from '../StatusPill.vue'
  import type { DataColumn, PillTone } from '../../types'

  withDefaults(defineProps<{ rows: UrgentTaskItem[]; scroll?: boolean }>(), { scroll: true })

  const now = useScreenNow()

  const PRIORITY_TONE: Record<PriorityLevel, PillTone> = {
    p0: 'danger',
    p1: 'warning',
    p2: 'info'
  }

  const URGENT_COLUMNS: DataColumn[] = [
    { key: 'taskName', label: '任务名称', width: 'minmax(0, 1.6fr)' },
    { key: 'projectName', label: '所属项目', width: 'minmax(0, 1fr)' },
    { key: 'assigneeName', label: '负责人', width: '84px' },
    { key: 'priority', label: '优先级', width: '92px' },
    { key: 'remainingTime', label: '倒计时', width: '140px', align: 'right' }
  ]

  /**
   * 倒计时按绝对截止时间每秒重算，不依赖后端 60 秒前的字符串。
   * 旧接口没有 dueTime 时回退到后端文案，保证兼容。
   */
  const countdownText = (row: UrgentTaskItem) => {
    const live = formatCountdown(row.dueTime, now.value)

    if (live !== null) {
      return live
    }

    if (row.status === 'overdue') {
      return `逾期 ${row.remainingTime.replace('-', '')}`
    }

    return row.remainingTime === '-' ? '未设置截止' : row.remainingTime
  }
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
    background: var(--dot-ink);
    border-radius: 50%;
    box-shadow: 0 0 9px var(--dot-ink);
  }

  .dot--overdue {
    --dot-ink: var(--ts-rose);

    animation: dot-pulse 2.2s ease-in-out infinite;
  }

  .dot--dueSoon,
  .dot--today {
    --dot-ink: var(--ts-amber);
  }

  .dot--normal,
  .dot--inProgress {
    --dot-ink: var(--ts-cyan);
  }

  .countdown {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .countdown--overdue {
    color: var(--ts-rose);
  }

  .countdown--dueSoon,
  .countdown--today {
    color: var(--ts-amber);
  }

  @keyframes dot-pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.35;
    }
  }
</style>
