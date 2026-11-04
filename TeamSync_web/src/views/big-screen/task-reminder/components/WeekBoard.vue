<template>
  <div class="week" :class="dense ? 'week--dense' : 'week--full'">
    <div
      v-for="day in days"
      :key="day.id"
      class="week__row"
      :class="{ 'week__row--today': isToday(day.dateText) }"
    >
      <div class="week__day">
        <strong>{{ day.weekday }}</strong>
        <span>{{ day.dateText }}</span>
      </div>
      <div class="week__count" :class="countLevel(day.totalCount)">{{ day.totalCount }}</div>
      <div class="week__chips">
        <span
          v-for="task in visibleTasks(day.tasks)"
          :key="`${task.type}-${task.id}`"
          class="chip"
          :class="`chip--${task.type}`"
        >
          <i :class="`chip__dot chip__dot--${task.status}`"></i>
          <b>{{ task.title }}</b>
        </span>
        <span v-if="restCount(day.tasks) > 0" class="chip chip--more">
          +{{ restCount(day.tasks) }}
        </span>
        <span v-if="day.tasks.length === 0" class="week__free">当日无到期事项</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CalendarDayItem, CalendarTaskChipItem } from '@/api/big-screen'

  /** 紧凑模式下每天最多展示几个胶囊，其余折叠成 +N，点开明细可看全部 */
  const DENSE_CHIP_CAPACITY = 4

  const props = withDefaults(defineProps<{ days: CalendarDayItem[]; dense?: boolean }>(), {
    dense: true
  })

  const capacity = computed(() => (props.dense ? DENSE_CHIP_CAPACITY : Number.MAX_SAFE_INTEGER))

  const visibleTasks = (tasks: CalendarTaskChipItem[]) => tasks.slice(0, capacity.value)

  const restCount = (tasks: CalendarTaskChipItem[]) => Math.max(tasks.length - capacity.value, 0)

  const todayText = computed(() => {
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${pad(now.getMonth() + 1)}/${pad(now.getDate())}`
  })

  const isToday = (dateText: string) => dateText.includes(todayText.value)

  const countLevel = (count: number) => {
    if (count === 0) {
      return 'week__count--none'
    }

    if (count >= 5) {
      return 'week__count--heavy'
    }

    return count >= 3 ? 'week__count--busy' : 'week__count--light'
  }
</script>

<style scoped lang="scss">
  .week {
    display: grid;
    flex: 1;
    gap: 8px;
    min-height: 0;
  }

  .week--dense {
    grid-template-rows: repeat(7, minmax(0, 1fr));
  }

  .week--full {
    grid-auto-rows: minmax(78px, auto);
  }

  .week__row {
    display: grid;
    grid-template-columns: 88px 46px minmax(0, 1fr);
    gap: 14px;
    align-items: center;
    padding: 8px 12px 8px 10px;
    background: rgb(15 23 42 / 3%);
    border-left: 3px solid transparent;
    border-radius: 12px;
  }

  .week__row--today {
    background: var(--ts-cyan-soft);
    border-left-color: var(--ts-cyan);
  }

  .week__day {
    strong {
      display: block;
      font-size: 17px;
      font-weight: 800;
      color: var(--ts-ink);
      letter-spacing: 0.03em;
    }

    span {
      display: block;
      margin-top: 3px;
      font-size: 14px;
      font-weight: 650;
      font-variant-numeric: tabular-nums;
      color: var(--ts-ink-3);
    }
  }

  .week__count {
    display: grid;
    place-items: center;
    height: 34px;
    font-size: 18px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--count-ink);
    background: var(--count-bg);
    border: 1px solid var(--count-line);
    border-radius: 10px;
  }

  .week__count--none {
    --count-ink: var(--ts-ink-3);
    --count-bg: rgb(15 23 42 / 4%);
    --count-line: var(--ts-line);
  }

  .week__count--light {
    --count-ink: var(--ts-cyan);
    --count-bg: var(--ts-cyan-soft);
    --count-line: var(--ts-cyan-line);
  }

  .week__count--busy {
    --count-ink: var(--ts-amber);
    --count-bg: var(--ts-amber-soft);
    --count-line: var(--ts-amber-line);
  }

  .week__count--heavy {
    --count-ink: var(--ts-rose);
    --count-bg: var(--ts-rose-soft);
    --count-line: var(--ts-rose-line);
  }

  .week__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-content: center;
    min-width: 0;
  }

  .week--dense .week__chips {
    max-height: 66px;
    overflow: hidden;
  }

  .chip {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    max-width: 252px;
    height: 29px;
    padding: 0 11px;
    overflow: hidden;
    font-size: 15px;
    font-weight: 650;
    color: var(--ts-ink);
    white-space: nowrap;
    background: var(--chip-bg);
    border: 1px solid var(--chip-line);
    border-radius: 8px;

    b {
      min-width: 0;
      overflow: hidden;
      font-weight: inherit;
      text-overflow: ellipsis;
    }
  }

  .week--full .chip {
    max-width: 340px;
  }

  .chip--projectTask {
    --chip-bg: rgb(15 23 42 / 4%);
    --chip-line: var(--ts-line-2);
  }

  .chip--recurringPlan {
    --chip-bg: var(--ts-violet-soft);
    --chip-line: var(--ts-violet-line);
  }

  .chip--more {
    --chip-bg: rgb(15 23 42 / 6%);
    --chip-line: var(--ts-line-2);

    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--ts-ink-2);
  }

  .chip__dot {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    background: var(--chip-dot);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--chip-dot);
  }

  .chip__dot--overdue {
    --chip-dot: var(--ts-rose);
  }

  .chip__dot--dueSoon,
  .chip__dot--today {
    --chip-dot: var(--ts-amber);
  }

  .chip__dot--normal,
  .chip__dot--inProgress {
    --chip-dot: var(--ts-cyan);
  }

  .week__free {
    font-size: 14px;
    font-weight: 600;
    color: var(--ts-ink-3);
  }
</style>
