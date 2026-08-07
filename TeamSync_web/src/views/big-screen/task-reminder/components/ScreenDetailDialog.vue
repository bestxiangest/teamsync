<template>
  <ElDialog
    :model-value="modelValue"
    :title="title"
    width="78vw"
    append-to-body
    destroy-on-close
    class="screen-detail-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="emit('closed')"
  >
    <div class="screen-detail-dialog__body">
      <template v-if="type === 'urgentTasks'">
        <div v-if="data.urgentTasks.length === 0" class="empty-state">暂无高优先级任务</div>
        <div v-else class="detail-table detail-table--urgent">
          <div class="detail-table__head">
            <span>任务名称</span>
            <span>所属项目</span>
            <span>负责人</span>
            <span>优先级</span>
            <span>剩余时间</span>
          </div>
          <div v-for="task in data.urgentTasks" :key="task.id" class="detail-table__row">
            <span>{{ task.taskName }}</span>
            <span>{{ task.projectName }}</span>
            <span>{{ task.assigneeName }}</span>
            <span>
              <StatusBadge
                :text="task.priority"
                :tone="priorityToneMap[task.priorityLevel]"
                size="small"
              />
            </span>
            <span class="time-text" :class="`time-text--${task.status}`">{{
              task.remainingTime
            }}</span>
          </div>
        </div>
      </template>

      <template v-else-if="type === 'projectRisks'">
        <div v-if="data.projectRisks.length === 0" class="empty-state">暂无项目风险</div>
        <div v-else class="detail-table detail-table--risk">
          <div class="detail-table__head">
            <span>项目名称</span>
            <span>整体进度</span>
            <span>逾期任务</span>
            <span>风险等级</span>
          </div>
          <div v-for="project in data.projectRisks" :key="project.id" class="detail-table__row">
            <span>{{ project.projectName }}</span>
            <span class="progress-cell">
              <b>{{ project.progress }}%</b>
              <i><em :style="{ width: `${project.progress}%` }"></em></i>
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
      </template>

      <template v-else-if="type === 'recurringPlans'">
        <div v-if="data.recurringPlans.length === 0" class="empty-state">暂无周期计划</div>
        <div v-else class="detail-table detail-table--recurring">
          <div class="detail-table__head">
            <span>计划名称</span>
            <span>执行周期</span>
            <span>下次执行时间</span>
            <span>负责人</span>
            <span>截止时间</span>
          </div>
          <div v-for="plan in data.recurringPlans" :key="plan.id" class="detail-table__row">
            <span>{{ plan.planName }}</span>
            <span>{{ plan.cycle }}</span>
            <span>{{ plan.nextRunTime }}</span>
            <span>{{ plan.assigneeName }}</span>
            <span class="time-text" :class="`time-text--${plan.status}`">{{ plan.dueTime }}</span>
          </div>
        </div>
      </template>

      <template v-else-if="type === 'assignees'">
        <div v-if="data.assigneeWall.length === 0" class="empty-state">暂无责任人待办</div>
        <div v-else class="assignee-detail-grid">
          <article
            v-for="assignee in data.assigneeWall"
            :key="assignee.id"
            class="assignee-detail-card"
          >
            <header>
              <strong>{{ assignee.name }}</strong>
              <span>{{ assignee.position }} / {{ assignee.department }}</span>
            </header>
            <div class="assignee-detail-card__metrics">
              <span>完成率 {{ assignee.completionRate }}%</span>
              <span>待办 {{ assignee.todoCount }}</span>
              <span>今日到期 {{ assignee.todayDueCount }}</span>
              <span>逾期 {{ assignee.overdueCount }}</span>
            </div>
            <AutoScrollArea
              class="assignee-detail-card__tasks"
              :watch-key="`detail-assignee-${assignee.id}-${assignee.tasks.length}`"
              :speed="1"
            >
              <ul>
                <li v-for="task in assignee.tasks" :key="task.id">
                  <span>{{ task.title }}</span>
                  <StatusBadge
                    :text="assigneeStatusTextMap[task.status]"
                    :tone="assigneeStatusToneMap[task.status]"
                    size="small"
                  />
                </li>
              </ul>
            </AutoScrollArea>
          </article>
        </div>
      </template>

      <template v-else-if="type === 'workloadRanking'">
        <div v-if="data.workloadRanking.length === 0" class="empty-state">暂无负载排行</div>
        <div v-else class="detail-table detail-table--ranking">
          <div class="detail-table__head">
            <span>排名</span>
            <span>成员</span>
            <span>待办数</span>
            <span>今日到期</span>
            <span>逾期</span>
            <span>风险等级</span>
          </div>
          <div v-for="rank in data.workloadRanking" :key="rank.rank" class="detail-table__row">
            <span>{{ rank.rank }}</span>
            <span>{{ rank.name }}</span>
            <span>{{ rank.todoCount }}</span>
            <span>{{ rank.todayDueCount }}</span>
            <span :class="{ 'danger-number': rank.overdueCount > 0 }">{{ rank.overdueCount }}</span>
            <span>
              <StatusBadge :text="rank.riskText" :tone="riskToneMap[rank.riskLevel]" size="small" />
            </span>
          </div>
        </div>
      </template>

      <template v-else-if="type === 'collaborationReminders'">
        <div v-if="data.collaborationReminders.length === 0" class="empty-state"
          >暂无跨项目协作提醒</div
        >
        <div v-else class="detail-table detail-table--collaboration">
          <div class="detail-table__head">
            <span>项目</span>
            <span>阻塞项 / 待办事项</span>
            <span>涉及人员</span>
            <span>紧急度</span>
          </div>
          <div v-for="item in data.collaborationReminders" :key="item.id" class="detail-table__row">
            <span>{{ item.projectName }}</span>
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
      </template>

      <template v-else>
        <div v-if="data.dailyFocus.length === 0" class="empty-state">暂无未来 7 日任务</div>
        <div v-else class="detail-table detail-table--future">
          <div class="detail-table__head">
            <span>日期</span>
            <span>重点任务</span>
            <span>负责人</span>
            <span>截止倒计时</span>
          </div>
          <div v-for="item in data.dailyFocus" :key="item.id" class="detail-table__row">
            <span>{{ item.dateText }}</span>
            <span>{{ item.taskName }}</span>
            <span>{{ item.assigneeName }}</span>
            <span class="time-text" :class="`time-text--${item.status}`">{{
              item.countdownText
            }}</span>
          </div>
        </div>
      </template>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import type {
    AssigneeTaskItem,
    CollaborationReminderItem,
    PriorityLevel,
    RiskLevel,
    TaskReminderScreenData
  } from '@/api/big-screen'
  import AutoScrollArea from './AutoScrollArea.vue'
  import type { ScreenDetailType } from './detail-dialog'
  import StatusBadge from './StatusBadge.vue'

  defineProps<{
    modelValue: boolean
    title: string
    type: ScreenDetailType
    data: TaskReminderScreenData
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
  }>()

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

  const urgencyToneMap: Record<
    CollaborationReminderItem['urgency'],
    'danger' | 'warning' | 'success'
  > = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }

  const assigneeStatusTextMap: Record<AssigneeTaskItem['status'], string> = {
    dueToday: '今日到期',
    inProgress: '进行中',
    overdue: '逾期'
  }

  const assigneeStatusToneMap: Record<
    AssigneeTaskItem['status'],
    'danger' | 'warning' | 'primary'
  > = {
    dueToday: 'warning',
    inProgress: 'primary',
    overdue: 'danger'
  }
</script>

<style scoped lang="scss">
  .screen-detail-dialog__body {
    max-height: min(66vh, 680px);
    overflow: auto;
  }

  .detail-table {
    overflow: hidden;
    border: 1px solid #e5eaf3;
    border-radius: 12px;
  }

  .detail-table__head,
  .detail-table__row {
    display: grid;
    align-items: center;
    min-width: 0;
  }

  .detail-table__head {
    min-height: 44px;
    color: #475569;
    font-size: 14px;
    font-weight: 800;
    background: #f8fafc;
    border-bottom: 1px solid #e5eaf3;
  }

  .detail-table__row {
    min-height: 48px;
    color: #0f172a;
    font-size: 15px;
    font-weight: 650;
    border-bottom: 1px solid #e5eaf3;
  }

  .detail-table__row:last-child {
    border-bottom: 0;
  }

  .detail-table__head span,
  .detail-table__row span {
    min-width: 0;
    padding: 0 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail-table--urgent .detail-table__head,
  .detail-table--urgent .detail-table__row {
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) 96px 112px 112px;
  }

  .detail-table--risk .detail-table__head,
  .detail-table--risk .detail-table__row {
    grid-template-columns: minmax(0, 1.1fr) minmax(180px, 1fr) 96px 120px;
  }

  .detail-table--recurring .detail-table__head,
  .detail-table--recurring .detail-table__row {
    grid-template-columns: minmax(0, 1.3fr) 120px 160px 110px 160px;
  }

  .detail-table--ranking .detail-table__head,
  .detail-table--ranking .detail-table__row {
    grid-template-columns: 80px minmax(0, 1fr) 100px 120px 90px 130px;
  }

  .detail-table--collaboration .detail-table__head,
  .detail-table--collaboration .detail-table__row {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.35fr) minmax(0, 1fr) 100px;
  }

  .detail-table--future .detail-table__head,
  .detail-table--future .detail-table__row {
    grid-template-columns: 160px minmax(0, 1.5fr) 130px 140px;
  }

  .progress-cell {
    display: grid;
    grid-template-columns: 50px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
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

  .danger-number,
  .time-text--overdue {
    color: #ef4444;
    font-weight: 900;
  }

  .time-text--dueSoon,
  .time-text--today,
  .time-text--attention {
    color: #f97316;
    font-weight: 900;
  }

  .time-text--normal {
    color: #334155;
    font-weight: 900;
  }

  .assignee-detail-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .assignee-detail-card {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    min-width: 0;
    min-height: 240px;
    max-height: 360px;
    gap: 12px;
    padding: 16px;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e5eaf3;
    border-radius: 12px;
  }

  .assignee-detail-card header {
    display: grid;
    gap: 4px;
  }

  .assignee-detail-card header strong {
    color: #0f172a;
    font-size: 18px;
    font-weight: 900;
  }

  .assignee-detail-card header span,
  .assignee-detail-card__metrics span {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .assignee-detail-card__metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .assignee-detail-card__tasks {
    min-height: 0;
  }

  .assignee-detail-card ul {
    display: grid;
    gap: 8px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .assignee-detail-card li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    color: #0f172a;
    font-size: 14px;
    font-weight: 700;
  }

  .assignee-detail-card li span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-state {
    display: grid;
    min-height: 220px;
    place-items: center;
    color: #64748b;
    font-size: 15px;
    font-weight: 700;
  }
</style>

<style lang="scss">
  .screen-detail-dialog {
    border-radius: 16px;
  }

  .screen-detail-dialog .el-dialog__header {
    padding: 20px 22px 12px;
    margin-right: 0;
    border-bottom: 1px solid #e5eaf3;
  }

  .screen-detail-dialog .el-dialog__title {
    color: #0f172a;
    font-size: 20px;
    font-weight: 900;
  }

  .screen-detail-dialog .el-dialog__body {
    padding: 18px 22px 22px;
  }
</style>
