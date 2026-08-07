<template>
  <div class="screen-page page-assignee">
    <div class="kpi-grid kpi-grid--five">
      <KpiCard v-for="item in data.assigneeSummaryCards" :key="item.id" :item="item" />
    </div>

    <div class="page-assignee__layout">
      <PanelCard
        title="责任人待办墙"
        action-text="查看全部责任人"
        @action="openDetail('assignees', '全部责任人待办')"
      >
        <template #icon>
          <UserFilled />
        </template>
        <div v-if="visibleAssignees.length === 0" class="empty-state">暂无责任人待办数据</div>
        <div v-else class="assignee-grid">
          <AssigneeCard
            v-for="assignee in visibleAssignees"
            :key="assignee.id"
            :assignee="assignee"
          />
        </div>
      </PanelCard>

      <div class="page-assignee__right-stack">
        <PanelCard
          title="负载 / 风险排行"
          action-text="查看全部排名"
          dense
          @action="openDetail('workloadRanking', '全部负载 / 风险排行')"
        >
          <template #icon>
            <Histogram />
          </template>
          <div v-if="data.workloadRanking.length === 0" class="empty-state">暂无负载排行</div>
          <div v-else class="screen-table ranking-table">
            <div class="screen-table__head">
              <span>排名</span>
              <span>成员</span>
              <span>待办数</span>
              <span>今日到期</span>
              <span>逾期</span>
              <span>风险等级</span>
            </div>
            <AutoScrollArea :watch-key="`ranking-${data.workloadRanking.length}`">
              <div class="screen-table__body">
                <div
                  v-for="rank in data.workloadRanking"
                  :key="rank.rank"
                  class="screen-table__row"
                >
                  <span>
                    <b class="rank-index" :class="{ 'rank-index--top': rank.rank <= 2 }">
                      {{ rank.rank }}
                    </b>
                  </span>
                  <span class="strong-text">{{ rank.name }}</span>
                  <span>{{ rank.todoCount }}</span>
                  <span>{{ rank.todayDueCount }}</span>
                  <span :class="{ 'danger-number': rank.overdueCount > 0 }">{{
                    rank.overdueCount
                  }}</span>
                  <span>
                    <StatusBadge
                      :text="rank.riskText"
                      :tone="riskToneMap[rank.riskLevel]"
                      size="small"
                    />
                  </span>
                </div>
              </div>
            </AutoScrollArea>
          </div>
        </PanelCard>

        <PanelCard
          title="跨项目协作提醒"
          action-text="查看全部提醒"
          dense
          @action="openDetail('collaborationReminders', '全部跨项目协作提醒')"
        >
          <template #icon>
            <Connection />
          </template>
          <div v-if="data.collaborationReminders.length === 0" class="empty-state">
            暂无跨项目协作提醒
          </div>
          <div v-else class="screen-table collaboration-table">
            <div class="screen-table__head">
              <span>项目</span>
              <span>阻塞项 / 待办事项</span>
              <span>涉及人员</span>
              <span>紧急度</span>
            </div>
            <AutoScrollArea :watch-key="`collaboration-${data.collaborationReminders.length}`">
              <div class="screen-table__body">
                <div
                  v-for="item in data.collaborationReminders"
                  :key="item.id"
                  class="screen-table__row"
                >
                  <span class="strong-text">{{ item.projectName }}</span>
                  <span>{{ item.blocker }}</span>
                  <span>{{ item.people }}</span>
                  <span>
                    <StatusBadge
                      :text="item.urgencyText"
                      :tone="urgencyToneMap[item.urgency]"
                      size="small"
                    />
                  </span>
                </div>
              </div>
            </AutoScrollArea>
          </div>
        </PanelCard>
      </div>
    </div>

    <FooterNotice label="轮播提示" :items="footerItems" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Connection, Histogram, UserFilled } from '@element-plus/icons-vue'
  import type {
    CollaborationReminderItem,
    RiskLevel,
    TaskReminderScreenData
  } from '@/api/big-screen'
  import AssigneeCard from './AssigneeCard.vue'
  import AutoScrollArea from './AutoScrollArea.vue'
  import type { ScreenDetailRequest, ScreenDetailType } from './detail-dialog'
  import FooterNotice from './FooterNotice.vue'
  import KpiCard from './KpiCard.vue'
  import PanelCard from './PanelCard.vue'
  import StatusBadge from './StatusBadge.vue'

  const props = defineProps<{
    data: TaskReminderScreenData
  }>()

  const visibleAssignees = computed(() => props.data.assigneeWall.slice(0, 6))

  const emit = defineEmits<{
    (e: 'open-detail', payload: ScreenDetailRequest): void
  }>()

  const openDetail = (type: ScreenDetailType, title: string) => {
    emit('open-detail', { type, title })
  }

  const riskToneMap: Record<RiskLevel, 'danger' | 'warning' | 'success'> = {
    high: 'danger',
    attention: 'warning',
    medium: 'warning',
    normal: 'success',
    low: 'success'
  }

  const urgencyToneMap: Record<
    CollaborationReminderItem['urgency'],
    'danger' | 'warning' | 'success'
  > = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }

  const footerItems = [
    { text: '请优先处理红色任务，逾期任务会影响整体进度', tone: 'danger' as const },
    { text: '已完成任务请及时更新状态，保持数据准确', tone: 'warning' as const },
    { text: '跨项目协作请及时沟通，避免阻塞扩散', tone: 'success' as const },
    { text: '大屏每 60 秒刷新一次', tone: 'primary' as const }
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

  .page-assignee__layout {
    display: grid;
    min-height: 0;
    grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.95fr);
    gap: 18px;
  }

  .page-assignee__right-stack {
    display: grid;
    min-height: 0;
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    gap: 18px;
  }

  .assignee-grid {
    display: grid;
    height: 100%;
    min-height: 0;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 14px;
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
    min-height: 38px;
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

  .ranking-table .screen-table__head,
  .ranking-table .screen-table__row {
    grid-template-columns: 58px minmax(0, 1fr) 72px 82px 54px 106px;
  }

  .collaboration-table .screen-table__head,
  .collaboration-table .screen-table__row {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.35fr) minmax(0, 0.95fr) 72px;
  }

  .ranking-table .screen-table__head span:last-child,
  .ranking-table .screen-table__row span:last-child {
    overflow: visible;
    text-overflow: clip;
  }

  .strong-text {
    font-weight: 900;
  }

  .rank-index {
    display: inline-grid;
    width: 24px;
    height: 24px;
    place-items: center;
    color: var(--primary);
    background: #eff6ff;
    border-radius: 50%;
    font-size: 13px;
    font-weight: 900;
  }

  .rank-index--top {
    color: #fff;
    background: var(--danger);
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
    .screen-page,
    .kpi-grid,
    .page-assignee__layout,
    .page-assignee__right-stack {
      gap: 12px;
    }

    .assignee-grid {
      gap: 10px;
    }

    .screen-table__head {
      min-height: 31px;
      font-size: 11px;
    }

    .screen-table__row {
      min-height: 31px;
      font-size: 12px;
    }

    .screen-table__head span,
    .screen-table__row span {
      padding: 0 7px;
    }

    .ranking-table .screen-table__head,
    .ranking-table .screen-table__row {
      grid-template-columns: 40px minmax(0, 1fr) 48px 58px 38px 86px;
    }

    .collaboration-table .screen-table__head,
    .collaboration-table .screen-table__row {
      grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.35fr) minmax(0, 0.9fr) 56px;
    }

    .rank-index {
      width: 20px;
      height: 20px;
      font-size: 11px;
    }
  }
</style>
