<template>
  <div class="deck">
    <div class="deck__tiles">
      <StatTile v-for="item in data.summaryCards" :key="item.id" :item="item" />
    </div>

    <div class="deck__body">
      <GlassPanel
        title="逾期与紧急待办"
        :hint="`共 ${data.urgentTasks.length} 项`"
        accent="rose"
        clickable
        @open="detail = 'urgent'"
      >
        <UrgentTaskTable :rows="data.urgentTasks" />
      </GlassPanel>

      <GlassPanel
        title="今日截止时间轴"
        :hint="timelineHint"
        accent="amber"
        clickable
        @open="detail = 'timeline'"
      >
        <TodayTimeline :items="data.todayTimeline" />
      </GlassPanel>

      <div class="deck__side">
        <GlassPanel
          title="任务健康度"
          :hint="`未完成 ${backlog.total} 项`"
          accent="emerald"
          clickable
          class="deck__health"
          @open="detail = 'health'"
        >
          <RiskDonut :items="backlog.items" :total="backlog.total" />
          <div class="meters">
            <div class="meter meter--ok">
              <p>
                任务完成率
                <b>{{ health.completionRate }}%</b>
              </p>
              <i><em :style="{ width: `${health.completionRate}%` }"></em></i>
            </div>
            <div class="meter meter--bad">
              <p>
                待办逾期率
                <b>{{ health.overdueRate }}%</b>
              </p>
              <i><em :style="{ width: `${health.overdueRate}%` }"></em></i>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          title="项目风险预警"
          :hint="riskHint"
          accent="violet"
          clickable
          @open="detail = 'risk'"
        >
          <ProjectRiskTable :rows="data.projectRisks" />
        </GlassPanel>
      </div>
    </div>

    <DetailDialog
      :open="detail === 'urgent'"
      title="逾期与紧急待办"
      :hint="`共 ${data.urgentTasks.length} 项 · 逾期与临近截止排在前面`"
      accent="rose"
      @close="detail = null"
    >
      <UrgentTaskTable :rows="data.urgentTasks" :scroll="false" />
    </DetailDialog>

    <DetailDialog
      :open="detail === 'timeline'"
      title="今日截止时间轴"
      :hint="timelineHint"
      accent="amber"
      @close="detail = null"
    >
      <TodayTimeline :items="data.todayTimeline" :scroll="false" />
    </DetailDialog>

    <DetailDialog
      :open="detail === 'health'"
      title="任务健康度"
      :hint="`未完成任务 ${backlog.total} 项`"
      accent="emerald"
      @close="detail = null"
    >
      <BacklogBreakdown :items="backlog.items" :total="backlog.total" />
    </DetailDialog>

    <DetailDialog
      :open="detail === 'risk'"
      title="项目风险预警"
      :hint="riskHint"
      accent="violet"
      @close="detail = null"
    >
      <ProjectRiskTable :rows="data.projectRisks" :scroll="false" />
    </DetailDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { TaskReminderScreenData } from '@/api/big-screen'
  import BacklogBreakdown from '../components/BacklogBreakdown.vue'
  import DetailDialog from '../components/DetailDialog.vue'
  import GlassPanel from '../components/GlassPanel.vue'
  import RiskDonut from '../components/charts/RiskDonut.vue'
  import StatTile from '../components/StatTile.vue'
  import TodayTimeline from '../components/TodayTimeline.vue'
  import ProjectRiskTable from '../components/tables/ProjectRiskTable.vue'
  import UrgentTaskTable from '../components/tables/UrgentTaskTable.vue'
  import type { DonutItem } from '../types'

  const props = defineProps<{
    data: TaskReminderScreenData
    backlog: { total: number; items: DonutItem[] }
    health: { completionRate: number; overdueRate: number; riskProjects: number }
  }>()

  const emit = defineEmits<{ detail: [boolean] }>()

  const detail = ref<'urgent' | 'timeline' | 'health' | 'risk' | null>(null)

  /** 明细展开时通知外层暂停轮播，否则页面切走会把弹层一起卸载 */
  watch(detail, (value) => emit('detail', value !== null))

  const timelineHint = computed(() => {
    const items = props.data.todayTimeline

    if (items.length === 0) {
      return '今日无截止任务'
    }

    const pending = items.filter((item) => !item.done).length

    return pending === 0
      ? `今日 ${items.length} 项 · 已全部完成`
      : `今日 ${items.length} 项 · 待处理 ${pending} 项`
  })

  const riskHint = computed(
    () => `在办 ${props.data.projectRisks.length} 个 · ${props.health.riskProjects} 个需关注`
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
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 16px;
  }

  .deck__body {
    display: grid;
    grid-template-columns: minmax(0, 1.52fr) minmax(0, 0.86fr) minmax(0, 1.3fr);
    gap: 16px;
    min-height: 0;
  }

  .deck__side {
    display: grid;
    grid-template-rows: minmax(0, 0.94fr) minmax(0, 1.06fr);
    gap: 16px;
    min-height: 0;
  }

  /* 健康度面板的内容是固定的圆环 + 图例，给一个下限，避免被风险面板挤到重叠 */
  .deck__health {
    min-height: 186px;
  }

  .deck__health :deep(.panel__head) {
    padding-bottom: 10px;
    margin-bottom: 12px;
  }

  .deck__health :deep(.panel__body) {
    gap: 12px;
    min-height: 0;
  }

  .meters {
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .meter {
    min-width: 0;

    p {
      display: flex;
      gap: 8px;
      align-items: baseline;
      justify-content: space-between;
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 650;
      color: var(--ts-ink-2);
    }

    b {
      font-size: 18px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      color: var(--meter-ink);
    }

    i {
      display: block;
      height: 6px;
      overflow: hidden;
      background: rgb(15 23 42 / 8%);
      border-radius: 999px;
    }

    em {
      display: block;
      height: 100%;
      background: var(--meter-ink);
      border-radius: inherit;
      box-shadow: 0 0 12px var(--meter-ink);
      transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  .meter--ok {
    --meter-ink: var(--ts-emerald);
  }

  .meter--bad {
    --meter-ink: var(--ts-rose);
  }
</style>
