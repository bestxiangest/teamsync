<template>
  <DataGrid
    :columns="RISK_COLUMNS"
    :rows="rows"
    :scroll="scroll"
    :row-height="scroll ? 50 : 56"
    empty="暂无在办项目"
  >
    <template #cell-projectName="{ row }">
      <b class="cell-strong">{{ row.projectName }}</b>
    </template>
    <template #cell-progress="{ row }">
      <span class="progress">
        <i><em :style="{ width: `${row.progress}%` }"></em></i>
        <b>{{ row.progress }}%</b>
      </span>
    </template>
    <template #cell-overdueTaskCount="{ row }">
      <span :class="{ overdue: row.overdueTaskCount > 0 }">{{ row.overdueTaskCount }}</span>
    </template>
    <template #cell-riskText="{ row }">
      <StatusPill :text="row.riskText" :tone="RISK_TONE[row.riskLevel]" dot />
    </template>
  </DataGrid>
</template>

<script setup lang="ts">
  import type { ProjectRiskItem, RiskLevel } from '@/api/big-screen'
  import DataGrid from '../DataGrid.vue'
  import StatusPill from '../StatusPill.vue'
  import type { DataColumn, PillTone } from '../../types'

  withDefaults(defineProps<{ rows: ProjectRiskItem[]; scroll?: boolean }>(), { scroll: true })

  const RISK_TONE: Record<RiskLevel, PillTone> = {
    high: 'danger',
    attention: 'warning',
    medium: 'warning',
    normal: 'success',
    low: 'success'
  }

  const RISK_COLUMNS: DataColumn[] = [
    { key: 'projectName', label: '项目名称', width: 'minmax(0, 1fr)' },
    { key: 'progress', label: '整体进度', width: 'minmax(130px, 1fr)' },
    { key: 'pendingTaskCount', label: '待办', width: '62px', align: 'center' },
    { key: 'overdueTaskCount', label: '逾期', width: '62px', align: 'center' },
    { key: 'riskText', label: '风险等级', width: '104px' }
  ]
</script>

<style scoped lang="scss">
  .cell-strong {
    font-weight: 750;
    color: var(--ts-ink);
  }

  .overdue {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--ts-rose);
  }

  .progress {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 44px;
    gap: 10px;
    align-items: center;

    i {
      display: block;
      height: 7px;
      overflow: hidden;
      background: rgb(15 23 42 / 8%);
      border-radius: 999px;
    }

    em {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, var(--ts-indigo), var(--ts-cyan));
      border-radius: inherit;
      transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    b {
      font-size: 15px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--ts-ink);
      text-align: right;
    }
  }
</style>
