<template>
  <article class="member" :class="`member--${accent}`">
    <header class="member__head">
      <div class="member__ring" :style="{ '--ring-value': `${member.completionRate}%` }">
        <span>{{ member.completionRate }}%</span>
      </div>
      <div class="member__id">
        <strong>{{ member.name }}</strong>
        <span>{{ member.position }} · {{ member.department }}</span>
      </div>
    </header>

    <div class="member__stats">
      <div v-for="stat in stats" :key="stat.label" :class="`stat stat--${stat.tone}`">
        <span>{{ stat.label }}</span>
        <b>{{ stat.value }}</b>
      </div>
    </div>

    <ul class="member__tasks">
      <li v-for="task in visibleTasks" :key="task.id" :class="`task--${task.status}`">
        <i></i>
        <span>{{ task.title }}</span>
        <em>{{ TASK_STATUS_TEXT[task.status] }}</em>
      </li>
      <li v-if="member.tasks.length === 0" class="member__tasks-rest">暂无进行中的任务</li>
    </ul>
  </article>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AssigneeOverviewItem, AssigneeTaskItem } from '@/api/big-screen'

  const TASK_CAPACITY = 5

  const props = withDefaults(
    defineProps<{
      member: AssigneeOverviewItem
      /** 展开明细时传入更大的容量，卡片内直接列出全部待办 */
      capacity?: number
    }>(),
    { capacity: TASK_CAPACITY }
  )

  const TASK_STATUS_TEXT: Record<AssigneeTaskItem['status'], string> = {
    dueToday: '今日到期',
    inProgress: '进行中',
    overdue: '已逾期'
  }

  /** 待办总量已在上方统计格呈现，这里只列最紧急的几条 */
  const visibleTasks = computed(() => props.member.tasks.slice(0, props.capacity))

  /** 卡片主色跟随最紧急的信号，便于远距离扫读 */
  const accent = computed(() => {
    if (props.member.overdueCount > 0) {
      return 'rose'
    }
    return props.member.todayDueCount > 0 ? 'amber' : 'cyan'
  })

  const stats = computed(() => [
    { label: '待办', value: props.member.todoCount, tone: 'plain' },
    { label: '今日到期', value: props.member.todayDueCount, tone: 'amber' },
    { label: '逾期', value: props.member.overdueCount, tone: 'rose' }
  ])
</script>

<style scoped lang="scss">
  .member {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    min-height: 0;
    padding: 10px 12px;
    overflow: hidden;
    background: radial-gradient(120% 90% at 0 0, var(--member-soft) 0%, transparent 55%), #fff;
    border: 1px solid var(--ts-line);
    border-radius: 15px;
  }

  .member::before {
    position: absolute;
    top: 0;
    left: 16px;
    width: 46px;
    height: 2px;
    content: '';
    background: var(--member-ink);
    box-shadow: 0 0 12px var(--member-ink);
  }

  .member__head {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .member__ring {
    position: relative;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 40px;
    height: 40px;
    background: conic-gradient(
      var(--member-ink) var(--ring-value),
      rgb(15 23 42 / 10%) var(--ring-value)
    );
    border-radius: 50%;

    &::after {
      position: absolute;
      inset: 4px;
      content: '';
      background: var(--ts-inset);
      border-radius: 50%;
    }

    span {
      position: relative;
      z-index: 1;
      font-size: 12px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--ts-ink);
    }
  }

  .member__id {
    min-width: 0;

    strong {
      display: block;
      overflow: hidden;
      font-size: 16px;
      font-weight: 800;
      color: var(--ts-ink);
      text-overflow: ellipsis;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    span {
      display: block;
      margin-top: 3px;
      overflow: hidden;
      font-size: 12px;
      font-weight: 600;
      color: var(--ts-ink-3);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .member__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
  }

  .stat {
    display: flex;
    gap: 4px;
    align-items: baseline;
    justify-content: space-between;
    padding: 2px 6px;
    background: rgb(15 23 42 / 4%);
    border: 1px solid var(--ts-line);
    border-radius: 8px;

    b {
      font-size: 15px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      color: var(--ts-ink);
    }

    span {
      font-size: 11px;
      font-weight: 650;
      color: var(--ts-ink-3);
      white-space: nowrap;
    }
  }

  .stat--amber b {
    color: var(--ts-amber);
  }

  .stat--rose b {
    color: var(--ts-rose);
  }

  .member__tasks {
    display: grid;
    flex: 1;
    gap: 7px;
    align-content: start;
    min-height: 0;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: grid;
      grid-template-columns: 6px minmax(0, 1fr) auto;
      gap: 7px;
      align-items: center;
      font-size: 14px;
      font-weight: 650;
      color: var(--ts-ink-2);
    }

    i {
      width: 6px;
      height: 6px;
      background: var(--task-ink);
      border-radius: 50%;
      box-shadow: 0 0 7px var(--task-ink);
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      color: var(--task-ink);
    }
  }

  .member__tasks li.member__tasks-rest {
    display: block;
    font-size: 13px;
    font-weight: 650;
    color: var(--ts-ink-3);
  }

  .task--overdue {
    --task-ink: var(--ts-rose);
  }

  .task--dueToday {
    --task-ink: var(--ts-amber);
  }

  .task--inProgress {
    --task-ink: var(--ts-cyan);
  }

  .member--rose {
    --member-ink: var(--ts-rose);
    --member-soft: var(--ts-rose-soft);
  }

  .member--amber {
    --member-ink: var(--ts-amber);
    --member-soft: var(--ts-amber-soft);
  }

  .member--cyan {
    --member-ink: var(--ts-cyan);
    --member-soft: var(--ts-cyan-soft);
  }
</style>
