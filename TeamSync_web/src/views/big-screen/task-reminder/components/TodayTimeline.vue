<template>
  <div v-if="items.length === 0" class="clear">
    <span class="clear__mark">
      <CircleCheckFilled />
    </span>
    <strong>今日没有截止任务</strong>
    <p>今天没有任何任务把截止时间设在今日，优先消化逾期与紧急事项</p>
  </div>

  <component :is="scroll ? ScrollBox : 'div'" v-else v-bind="scroll ? { speed: 22 } : {}">
    <ol class="timeline">
      <li
        v-for="item in items"
        :key="item.id"
        class="timeline__item"
        :class="[`timeline__item--${item.status}`, { 'timeline__item--done': item.done }]"
      >
        <span class="timeline__time">{{ item.time }}</span>
        <span class="timeline__rail"><i></i></span>
        <span class="timeline__text">
          <b>{{ item.taskName }}</b>
          <em>{{ countdownText(item) }}</em>
        </span>
      </li>
    </ol>
  </component>
</template>

<script setup lang="ts">
  import { CircleCheckFilled } from '@element-plus/icons-vue'
  import type { TimelineTaskItem } from '@/api/big-screen'
  import { formatCountdown, useScreenNow } from '../composables/useScreenClock'
  import ScrollBox from './ScrollBox.vue'

  withDefaults(defineProps<{ items: TimelineTaskItem[]; scroll?: boolean }>(), { scroll: true })

  const now = useScreenNow()

  /** 今日时间轴同样跟着统一时钟走，避免与顶部时间、待办倒计时出现两套读数 */
  const countdownText = (item: TimelineTaskItem) => {
    if (item.done) {
      return '已完成'
    }

    return (
      formatCountdown(item.dueTime, now.value, {
        futurePrefix: '剩余 ',
        overduePrefix: '逾期 '
      }) ?? item.countdownText
    )
  }
</script>

<style scoped lang="scss">
  .timeline {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .timeline__item {
    display: grid;
    grid-template-columns: 58px 18px minmax(0, 1fr);
    gap: 12px;
    align-items: stretch;
    min-height: 66px;
  }

  .timeline__time {
    padding-top: 3px;
    font-size: 19px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--ts-ink-2);
  }

  .timeline__rail {
    position: relative;
    display: block;
  }

  .timeline__rail::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 8px;
    width: 2px;
    content: '';
    background: var(--ts-line-2);
  }

  .timeline__item:first-child .timeline__rail::before {
    top: 10px;
  }

  .timeline__item:last-child .timeline__rail::before {
    bottom: auto;
    height: 10px;
  }

  .timeline__rail i {
    position: absolute;
    top: 6px;
    left: 3px;
    z-index: 1;
    width: 12px;
    height: 12px;
    background: var(--line-ink);
    border: 2px solid var(--ts-inset);
    border-radius: 50%;
    box-shadow: 0 0 12px var(--line-ink);
  }

  .timeline__text {
    min-width: 0;
    padding-top: 1px;

    b {
      display: block;
      overflow: hidden;
      font-size: 17px;
      font-weight: 700;
      color: var(--ts-ink);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      display: block;
      margin-top: 5px;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--line-ink);
    }
  }

  .timeline__item--overdue {
    --line-ink: var(--ts-rose);
  }

  .timeline__item--dueSoon,
  .timeline__item--today {
    --line-ink: var(--ts-amber);
  }

  .timeline__item--normal,
  .timeline__item--inProgress {
    --line-ink: var(--ts-cyan);
  }

  /* 已完成的今日任务保留在时间轴上：不然“今日无截止”与“今日已全部完成”在屏幕上无法区分 */
  .timeline__item--done {
    --line-ink: var(--ts-emerald);

    .timeline__time,
    .timeline__text b {
      color: var(--ts-ink-3);
      text-decoration: line-through;
    }
  }

  .clear {
    display: grid;
    flex: 1;
    gap: 4px;
    align-content: center;
    justify-items: center;
    min-height: 0;
    text-align: center;

    strong {
      margin-top: 14px;
      font-size: 20px;
      font-weight: 800;
      color: var(--ts-ink);
      letter-spacing: 0.03em;
    }

    p {
      max-width: 280px;
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.6;
      color: var(--ts-ink-3);
    }
  }

  .clear__mark {
    display: grid;
    place-items: center;
    width: 76px;
    height: 76px;
    color: var(--ts-emerald);
    background: var(--ts-emerald-soft);
    border: 1px solid var(--ts-emerald-line);
    border-radius: 50%;

    svg {
      width: 36px;
      height: 36px;
    }
  }
</style>
