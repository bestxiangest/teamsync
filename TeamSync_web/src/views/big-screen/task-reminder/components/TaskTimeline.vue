<template>
  <div class="task-timeline">
    <div v-if="tasks.length === 0" class="task-timeline__empty">暂无今日截止任务</div>
    <AutoScrollArea v-else :watch-key="`timeline-${tasks.length}`">
      <div class="task-timeline__list">
        <article
          v-for="task in tasks"
          :key="task.id"
          class="task-timeline__item"
          :class="`task-timeline__item--${task.status}`"
        >
          <time>{{ task.time }}</time>
          <span class="task-timeline__dot"></span>
          <div class="task-timeline__card">
            <strong>{{ task.taskName }}</strong>
            <span>{{ task.countdownText }}</span>
          </div>
        </article>
      </div>
    </AutoScrollArea>
    <div class="task-timeline__legend">
      <span><i class="legend-danger"></i>已逾期</span>
      <span><i class="legend-warning"></i>48小时内到期</span>
      <span><i class="legend-primary"></i>今日到期</span>
      <span><i class="legend-blue"></i>稍后截止</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TimelineTaskItem } from '@/api/big-screen'
  import AutoScrollArea from './AutoScrollArea.vue'

  defineProps<{
    tasks: TimelineTaskItem[]
  }>()
</script>

<style scoped lang="scss">
  .task-timeline {
    display: grid;
    height: 100%;
    min-height: 0;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 10px;
  }

  .task-timeline__list {
    position: relative;
    display: grid;
    min-height: 0;
    align-content: start;
    gap: 12px;
    padding: 6px 0 6px 2px;
  }

  .task-timeline__list::before {
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 68px;
    width: 2px;
    content: '';
    background: #dbeafe;
    border-radius: 999px;
  }

  .task-timeline__item {
    position: relative;
    display: grid;
    grid-template-columns: 54px 28px minmax(0, 1fr);
    align-items: center;
    gap: 0;
  }

  .task-timeline__item time {
    color: #475569;
    font-size: 15px;
    font-weight: 700;
    text-align: right;
  }

  .task-timeline__dot {
    z-index: 1;
    justify-self: center;
    width: 10px;
    height: 10px;
    background: var(--primary);
    border: 3px solid #dbeafe;
    border-radius: 50%;
  }

  .task-timeline__card {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 50px;
    padding: 10px 14px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(37 99 235 / 5%);
  }

  .task-timeline__card strong {
    min-width: 0;
    overflow: hidden;
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-timeline__card span {
    flex: 0 0 auto;
    color: var(--primary);
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
  }

  .task-timeline__item--overdue .task-timeline__card {
    background: #fff1f2;
    border-color: #fecdd3;
  }

  .task-timeline__item--overdue .task-timeline__card span {
    color: var(--danger);
  }

  .task-timeline__item--overdue .task-timeline__dot {
    background: var(--danger);
  }

  .task-timeline__item--dueSoon .task-timeline__card,
  .task-timeline__item--today .task-timeline__card {
    background: #fff7ed;
    border-color: #fed7aa;
  }

  .task-timeline__item--dueSoon .task-timeline__card span,
  .task-timeline__item--today .task-timeline__card span {
    color: var(--warning);
  }

  .task-timeline__item--dueSoon .task-timeline__dot,
  .task-timeline__item--today .task-timeline__dot {
    background: var(--warning);
  }

  .task-timeline__legend {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: center;
    gap: 16px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .task-timeline__legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .task-timeline__legend i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  .legend-danger {
    background: var(--danger);
  }

  .legend-warning {
    background: var(--warning);
  }

  .legend-primary {
    background: #eab308;
  }

  .legend-blue {
    background: #60a5fa;
  }

  .task-timeline__empty {
    display: grid;
    height: 100%;
    place-items: center;
    color: var(--text-secondary);
    font-size: 15px;
  }

  @media (max-width: 1500px) {
    .task-timeline__item {
      grid-template-columns: 48px 24px minmax(0, 1fr);
    }

    .task-timeline__list::before {
      left: 60px;
    }

    .task-timeline__item time,
    .task-timeline__card strong {
      font-size: 13px;
    }

    .task-timeline__card {
      min-height: 40px;
      padding: 7px 10px;
    }

    .task-timeline__card span,
    .task-timeline__legend {
      font-size: 11px;
    }
  }
</style>
