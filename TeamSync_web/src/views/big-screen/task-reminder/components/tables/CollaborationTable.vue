<template>
  <DataGrid
    :columns="COLLABORATION_COLUMNS"
    :rows="rows"
    :scroll="scroll"
    :row-height="scroll ? 56 : 58"
    empty="暂无跨项目阻塞"
  >
    <template #cell-projectName="{ row }">
      <b class="cell-strong">{{ row.projectName }}</b>
    </template>
    <template #cell-urgencyText="{ row }">
      <StatusPill :text="row.urgencyText" :tone="URGENCY_TONE[row.urgency]" dot />
    </template>
  </DataGrid>
</template>

<script setup lang="ts">
  import type { CollaborationReminderItem } from '@/api/big-screen'
  import DataGrid from '../DataGrid.vue'
  import StatusPill from '../StatusPill.vue'
  import type { DataColumn, PillTone } from '../../types'

  withDefaults(defineProps<{ rows: CollaborationReminderItem[]; scroll?: boolean }>(), {
    scroll: true
  })

  const URGENCY_TONE: Record<CollaborationReminderItem['urgency'], PillTone> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }

  const COLLABORATION_COLUMNS: DataColumn[] = [
    { key: 'projectName', label: '项目', width: 'minmax(0, 0.9fr)' },
    { key: 'blocker', label: '阻塞项 / 待办事项', width: 'minmax(0, 1.35fr)' },
    { key: 'people', label: '涉及人员', width: 'minmax(0, 0.85fr)' },
    { key: 'urgencyText', label: '紧急度', width: '92px' }
  ]
</script>

<style scoped lang="scss">
  .cell-strong {
    font-weight: 750;
    color: var(--ts-ink);
  }
</style>
