<template>
  <article class="assignee-card">
    <header class="assignee-card__header">
      <div class="assignee-card__identity">
        <span class="assignee-card__avatar">
          <UserFilled />
        </span>
        <div>
          <strong>{{ assignee.name }}</strong>
          <p>{{ assignee.position }} / {{ assignee.department }}</p>
        </div>
      </div>
      <div class="assignee-card__rate" :style="rateStyle">
        <span>{{ assignee.completionRate }}%</span>
        <small>完成率</small>
      </div>
    </header>

    <div class="assignee-card__metrics">
      <div>
        <span>待办</span>
        <strong>{{ assignee.todoCount }}</strong>
      </div>
      <div>
        <span>今日到期</span>
        <strong class="is-warning">{{ assignee.todayDueCount }}</strong>
      </div>
      <div>
        <span>逾期</span>
        <strong class="is-danger">{{ assignee.overdueCount }}</strong>
      </div>
    </div>

    <AutoScrollArea :watch-key="`${assignee.id}-${assignee.tasks.length}`" :speed="1">
      <ul class="assignee-card__tasks">
        <li v-for="task in assignee.tasks" :key="task.id">
          <span>{{ task.title }}</span>
          <StatusBadge :text="statusTextMap[task.status]" :tone="statusToneMap[task.status]" size="small" />
        </li>
      </ul>
    </AutoScrollArea>
  </article>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { UserFilled } from '@element-plus/icons-vue'
  import type { AssigneeOverviewItem, AssigneeTaskItem } from '@/api/big-screen'
  import AutoScrollArea from './AutoScrollArea.vue'
  import StatusBadge from './StatusBadge.vue'

  const props = defineProps<{
    assignee: AssigneeOverviewItem
  }>()

  const statusTextMap: Record<AssigneeTaskItem['status'], string> = {
    dueToday: '今日到期',
    inProgress: '进行中',
    overdue: '逾期'
  }

  const statusToneMap: Record<AssigneeTaskItem['status'], 'danger' | 'warning' | 'primary'> = {
    dueToday: 'warning',
    inProgress: 'primary',
    overdue: 'danger'
  }

  const rateStyle = computed(() => ({
    background: `conic-gradient(var(--primary) ${props.assignee.completionRate * 3.6}deg, #e8eef8 0deg)`
  }))
</script>

<style scoped lang="scss">
  .assignee-card {
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: auto auto minmax(0, 1fr);
    gap: 12px;
    padding: 15px;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

  .assignee-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .assignee-card__identity {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 12px;
  }

  .assignee-card__avatar {
    display: inline-flex;
    width: 46px;
    height: 46px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 50%;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .assignee-card__identity strong {
    display: block;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 900;
    line-height: 1.1;
  }

  .assignee-card__identity p {
    margin: 5px 0 0;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
  }

  .assignee-card__rate {
    position: relative;
    display: grid;
    width: 58px;
    height: 58px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 50%;
  }

  .assignee-card__rate::before {
    position: absolute;
    inset: 6px;
    content: '';
    background: #fff;
    border-radius: inherit;
  }

  .assignee-card__rate span,
  .assignee-card__rate small {
    z-index: 1;
  }

  .assignee-card__rate span {
    align-self: end;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 900;
  }

  .assignee-card__rate small {
    align-self: start;
    color: var(--primary);
    font-size: 10px;
    font-weight: 800;
  }

  .assignee-card__metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
  }

  .assignee-card__metrics div {
    display: grid;
    gap: 4px;
    padding: 8px 4px;
    text-align: center;
  }

  .assignee-card__metrics div + div {
    border-left: 1px solid var(--border-color);
  }

  .assignee-card__metrics span {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .assignee-card__metrics strong {
    color: var(--primary);
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
  }

  .assignee-card__metrics .is-warning {
    color: var(--warning);
  }

  .assignee-card__metrics .is-danger {
    color: var(--danger);
  }

  .assignee-card__tasks {
    display: grid;
    min-height: 0;
    align-content: start;
    gap: 7px;
    padding: 0;
    margin: 0;
    overflow: hidden;
    list-style: none;
  }

  .assignee-card__tasks li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 650;
  }

  .assignee-card__tasks li::before {
    width: 4px;
    height: 4px;
    content: '';
    background: var(--text-secondary);
    border-radius: 50%;
  }

  .assignee-card__tasks li {
    grid-template-columns: 6px minmax(0, 1fr) auto;
  }

  .assignee-card__tasks span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1500px) {
    .assignee-card {
      gap: 8px;
      padding: 11px;
    }

    .assignee-card__avatar {
      width: 38px;
      height: 38px;

      svg {
        width: 23px;
        height: 23px;
      }
    }

    .assignee-card__identity strong {
      font-size: 16px;
    }

    .assignee-card__identity p,
    .assignee-card__metrics span {
      font-size: 11px;
    }

    .assignee-card__rate {
      width: 50px;
      height: 50px;
    }

    .assignee-card__metrics div {
      padding: 6px 3px;
    }

    .assignee-card__metrics strong {
      font-size: 17px;
    }

    .assignee-card__tasks {
      gap: 5px;
    }

    .assignee-card__tasks li {
      font-size: 12px;
    }
  }
</style>
