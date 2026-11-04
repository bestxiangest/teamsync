<template>
  <div class="deck">
    <div class="deck__tiles">
      <StatTile v-for="item in data.assigneeSummaryCards" :key="item.id" :item="item" />
    </div>

    <div class="deck__body">
      <GlassPanel
        title="责任人待办墙"
        :hint="wallHint"
        accent="cyan"
        clickable
        @open="detail = 'wall'"
      >
        <div v-if="visibleMembers.length === 0" class="empty">暂无成员待办数据</div>
        <div v-else class="wall">
          <MemberCard v-for="member in visibleMembers" :key="member.id" :member="member" />
        </div>
      </GlassPanel>

      <div class="deck__side">
        <GlassPanel
          title="成员负载分布"
          :hint="`${data.workloadRanking.length} 人 · 按待办量排序`"
          accent="amber"
          clickable
          @open="detail = 'load'"
        >
          <div v-if="data.workloadRanking.length === 0" class="empty">暂无负载数据</div>
          <div v-else class="load">
            <div
              v-for="item in visibleRanking"
              :key="item.rank"
              :class="`load__row load__row--${RISK_ACCENT[item.riskLevel]}`"
            >
              <span class="load__rank">{{ item.rank }}</span>
              <span class="load__name">{{ item.name }}</span>
              <span class="load__bar">
                <i :style="{ width: `${barWidth(item.todoCount)}%` }"></i>
              </span>
              <span class="load__count">{{ item.todoCount }}</span>
              <StatusPill :text="item.riskText" :tone="RISK_TONE[item.riskLevel]" />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          title="跨项目协作阻塞"
          :hint="`${data.collaborationReminders.length} 项待跟进`"
          accent="violet"
          clickable
          @open="detail = 'collaboration'"
        >
          <CollaborationTable :rows="data.collaborationReminders" />
        </GlassPanel>
      </div>
    </div>

    <DetailDialog
      :open="detail === 'wall'"
      title="责任人待办墙"
      :hint="`${data.assigneeWall.length} 人 · 每人列出全部未完成任务`"
      accent="cyan"
      @close="detail = null"
    >
      <div class="wall wall--full">
        <MemberCard
          v-for="member in data.assigneeWall"
          :key="member.id"
          :member="member"
          :capacity="Number.MAX_SAFE_INTEGER"
        />
      </div>
    </DetailDialog>

    <DetailDialog
      :open="detail === 'load'"
      title="成员负载分布"
      :hint="`${data.workloadRanking.length} 人 · 待办量由高到低`"
      accent="amber"
      @close="detail = null"
    >
      <DataGrid
        :columns="LOAD_COLUMNS"
        :rows="data.workloadRanking"
        :row-height="56"
        :scroll="false"
        empty="暂无负载数据"
      >
        <template #cell-name="{ row }">
          <b class="cell-strong">{{ row.name }}</b>
        </template>
        <template #cell-riskText="{ row }">
          <StatusPill :text="row.riskText" :tone="RISK_TONE[row.riskLevel]" dot />
        </template>
      </DataGrid>
    </DetailDialog>

    <DetailDialog
      :open="detail === 'collaboration'"
      title="跨项目协作阻塞"
      :hint="`${data.collaborationReminders.length} 项待跟进`"
      accent="violet"
      @close="detail = null"
    >
      <CollaborationTable :rows="data.collaborationReminders" :scroll="false" />
    </DetailDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { RiskLevel, TaskReminderScreenData } from '@/api/big-screen'
  import DataGrid from '../components/DataGrid.vue'
  import DetailDialog from '../components/DetailDialog.vue'
  import GlassPanel from '../components/GlassPanel.vue'
  import MemberCard from '../components/MemberCard.vue'
  import StatTile from '../components/StatTile.vue'
  import StatusPill from '../components/StatusPill.vue'
  import CollaborationTable from '../components/tables/CollaborationTable.vue'
  import type { DataColumn, PillTone } from '../types'

  /** 墙面一屏放 6 张卡，其余在明细里展开 */
  const WALL_CAPACITY = 6
  const RANKING_CAPACITY = 7

  const props = defineProps<{
    data: TaskReminderScreenData
  }>()

  const emit = defineEmits<{ detail: [boolean] }>()

  const detail = ref<'wall' | 'load' | 'collaboration' | null>(null)

  watch(detail, (value) => emit('detail', value !== null))

  const RISK_TONE: Record<RiskLevel, PillTone> = {
    high: 'danger',
    attention: 'warning',
    medium: 'warning',
    normal: 'success',
    low: 'success'
  }

  const RISK_ACCENT: Record<RiskLevel, string> = {
    high: 'rose',
    attention: 'amber',
    medium: 'amber',
    normal: 'cyan',
    low: 'cyan'
  }

  const LOAD_COLUMNS: DataColumn[] = [
    { key: 'rank', label: '排名', width: '64px', align: 'center' },
    { key: 'name', label: '成员', width: 'minmax(0, 1fr)' },
    { key: 'todoCount', label: '待办', width: '90px', align: 'center' },
    { key: 'todayDueCount', label: '今日到期', width: '110px', align: 'center' },
    { key: 'overdueCount', label: '逾期', width: '90px', align: 'center' },
    { key: 'riskText', label: '负载评估', width: '124px' }
  ]

  const visibleMembers = computed(() => props.data.assigneeWall.slice(0, WALL_CAPACITY))
  const visibleRanking = computed(() => props.data.workloadRanking.slice(0, RANKING_CAPACITY))

  const wallHint = computed(() => {
    const total = props.data.assigneeWall.length

    return total > WALL_CAPACITY
      ? `共 ${total} 人 · 展示最紧张的 ${WALL_CAPACITY} 人`
      : `共 ${total} 人`
  })

  const maxTodo = computed(() =>
    Math.max(...props.data.workloadRanking.map((item) => item.todoCount), 1)
  )

  const barWidth = (value: number) => Math.max((value / maxTodo.value) * 100, 6)
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
    grid-template-columns: minmax(0, 1.62fr) minmax(0, 1.38fr);
    gap: 16px;
    min-height: 0;
  }

  .deck__side {
    display: grid;
    grid-template-rows: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 16px;
    min-height: 0;
  }

  .wall {
    display: grid;
    flex: 1;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    min-height: 0;
  }

  /* 明细里卡片按内容自然撑开，逐个列出全部待办 */
  .wall--full {
    flex: none;
    grid-template-rows: none;
    grid-auto-rows: auto;
    align-items: start;
  }

  .load {
    display: grid;
    flex: 1;
    grid-auto-rows: minmax(0, 1fr);
    gap: 6px;
    align-content: stretch;
    min-height: 0;
  }

  .load__row {
    display: grid;
    grid-template-columns: 26px 84px minmax(0, 1fr) 40px 88px;
    gap: 12px;
    align-items: center;
  }

  .load__rank {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    font-size: 14px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--load-ink);
    background: rgb(15 23 42 / 5%);
    border: 1px solid var(--ts-line);
    border-radius: 8px;
  }

  .load__name {
    overflow: hidden;
    font-size: 17px;
    font-weight: 750;
    color: var(--ts-ink);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .load__bar {
    display: block;
    height: 12px;
    overflow: hidden;
    background: rgb(15 23 42 / 8%);
    border-radius: 999px;

    i {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, rgb(15 23 42 / 15%), var(--load-ink));
      border-radius: inherit;
      box-shadow: 0 0 14px var(--load-ink);
      transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  .load__count {
    font-size: 20px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--ts-ink);
    text-align: right;
  }

  .load__row--rose {
    --load-ink: var(--ts-rose);
  }

  .load__row--amber {
    --load-ink: var(--ts-amber);
  }

  .load__row--cyan {
    --load-ink: var(--ts-cyan);
  }

  .cell-strong {
    font-weight: 750;
    color: var(--ts-ink);
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
