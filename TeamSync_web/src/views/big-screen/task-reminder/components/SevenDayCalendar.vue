<template>
  <div class="seven-day-calendar">
    <article v-for="day in days" :key="day.id" class="seven-day-calendar__day">
      <header>
        <strong>{{ day.weekday }}</strong>
        <span>{{ day.dateText }}</span>
      </header>

      <section>
        <p>项目任务</p>
        <AutoScrollArea :watch-key="`project-${day.id}-${day.tasks.length}`" :speed="1">
          <div class="seven-day-calendar__chip-list">
            <span
              v-for="task in projectTasks(day)"
              :key="task.id"
              class="seven-day-calendar__chip"
              :class="[`seven-day-calendar__chip--${task.status}`, 'seven-day-calendar__chip--project']"
            >
              <i></i>{{ task.title }}
            </span>
          </div>
        </AutoScrollArea>
      </section>

      <section>
        <p>周期计划</p>
        <AutoScrollArea :watch-key="`recurring-${day.id}-${day.tasks.length}`" :speed="1">
          <div class="seven-day-calendar__chip-list">
            <span
              v-for="task in recurringTasks(day)"
              :key="task.id"
              class="seven-day-calendar__chip"
              :class="[
                `seven-day-calendar__chip--${task.status}`,
                'seven-day-calendar__chip--recurring'
              ]"
            >
              <i></i>{{ task.title }}
            </span>
          </div>
        </AutoScrollArea>
      </section>

      <footer>{{ day.totalCount }} 项</footer>
    </article>
  </div>
</template>

<script setup lang="ts">
  import type { CalendarDayItem, CalendarTaskChipItem } from '@/api/big-screen'
  import AutoScrollArea from './AutoScrollArea.vue'

  defineProps<{
    days: CalendarDayItem[]
  }>()

  const projectTasks = (day: CalendarDayItem): CalendarTaskChipItem[] =>
    day.tasks.filter((task) => task.type === 'projectTask')

  const recurringTasks = (day: CalendarDayItem): CalendarTaskChipItem[] =>
    day.tasks.filter((task) => task.type === 'recurringPlan')
</script>

<style scoped lang="scss">
  .seven-day-calendar {
    display: grid;
    height: 100%;
    min-height: 0;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: 10px;
  }

  .seven-day-calendar__day {
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr) minmax(0, 1fr) auto;
    background: #fff;
  }

  .seven-day-calendar__day + .seven-day-calendar__day {
    border-left: 1px solid var(--border-color);
  }

  .seven-day-calendar__day header {
    display: grid;
    gap: 3px;
    padding: 11px 8px 9px;
    color: var(--text-primary);
    text-align: center;
    background: #f8fafc;
    border-bottom: 1px solid var(--border-color);
  }

  .seven-day-calendar__day header strong {
    font-size: 15px;
    font-weight: 900;
  }

  .seven-day-calendar__day header span {
    font-size: 13px;
    font-weight: 700;
  }

  .seven-day-calendar__day section {
    display: grid;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 7px;
    padding: 10px 9px 0;
    overflow: hidden;
  }

  .seven-day-calendar__day section p {
    margin: 0;
    color: #475569;
    font-size: 12px;
    font-weight: 800;
  }

  .seven-day-calendar__chip-list {
    display: grid;
    align-content: start;
    gap: 7px;
  }

  .seven-day-calendar__chip {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 6px;
    min-height: 25px;
    padding: 4px 7px;
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .seven-day-calendar__chip i {
    width: 8px;
    height: 8px;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .seven-day-calendar__chip--project {
    color: #334155;
    background: #fff7ed;
    border-color: #fed7aa;
  }

  .seven-day-calendar__chip--recurring {
    color: #1e3a8a;
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  .seven-day-calendar__chip--overdue i {
    background: var(--danger);
  }

  .seven-day-calendar__chip--dueSoon i,
  .seven-day-calendar__chip--today i {
    background: var(--warning);
  }

  .seven-day-calendar__chip--normal i,
  .seven-day-calendar__chip--inProgress i {
    background: var(--primary);
  }

  .seven-day-calendar__day footer {
    padding: 8px;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 900;
    text-align: center;
  }

  @media (max-width: 1500px) {
    .seven-day-calendar__day header {
      padding: 8px 6px 7px;
    }

    .seven-day-calendar__day section {
      gap: 5px;
      padding: 7px 6px 0;
    }

    .seven-day-calendar__chip {
      min-height: 20px;
      padding: 3px 5px;
      font-size: 10px;
    }

    .seven-day-calendar__day section p,
    .seven-day-calendar__day header span,
    .seven-day-calendar__day footer {
      font-size: 11px;
    }

    .seven-day-calendar__day header strong {
      font-size: 13px;
    }
  }
</style>
