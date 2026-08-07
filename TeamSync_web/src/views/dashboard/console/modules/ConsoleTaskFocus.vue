<template>
  <section class="task-focus">
    <div class="task-focus__header">
      <div>
        <div class="task-focus__eyebrow">优先任务</div>
        <h2 class="task-focus__title">先把最急的事情解决</h2>
      </div>
      <button class="task-focus__view" type="button" @click="$emit('view-all')">
        进入首个项目
        <ArrowRight />
      </button>
    </div>

    <div class="task-focus__chips">
      <span class="task-focus__chip task-focus__chip--danger">逾期 {{ insight.overdueTaskCount }}</span>
      <span class="task-focus__chip task-focus__chip--warning">24 小时内 {{ insight.dueSoonTaskCount }}</span>
      <span class="task-focus__chip">完成率 {{ insight.completionRate }}%</span>
    </div>

    <div class="task-focus__content">
      <div class="task-focus__list-shell">
        <div v-if="tasks.length" class="task-focus__list">
          <button
            v-for="task in tasks"
            :key="`${task.sourceType || 'PROJECT_TASK'}-${task.id}`"
            class="task-focus__item"
            type="button"
            @click="$emit('select-task', task)"
          >
            <div class="task-focus__item-top">
              <span class="task-focus__priority" :class="getPriorityTone(task.priority)">
                {{ getPriorityLabel(task.priority) }}
              </span>
              <span class="task-focus__due" :class="getDueTone(task.dueTime)">
                {{ formatDueLabel(task.dueTime) }}
              </span>
            </div>
            <strong class="task-focus__item-title">{{ task.title }}</strong>
            <p class="task-focus__item-meta">
              <span>{{ task.projectName }}</span>
              <span>·</span>
              <span>{{ task.stageName }}</span>
            </p>
            <div class="task-focus__item-bottom">
              <span>{{ formatExactTime(task.dueTime) }}</span>
              <ArrowRight class="task-focus__item-arrow" />
            </div>
          </button>
        </div>

        <div v-else class="task-focus__empty">当前没有需要立刻处理的任务。</div>
      </div>

      <div class="task-focus__analytics">
        <article class="task-focus__panel task-focus__panel--wide">
          <div class="task-focus__panel-head">
            <span class="task-focus__panel-label">近 7 日任务变化</span>
            <span class="task-focus__panel-note">新增 / 完成 / 逾期</span>
          </div>
          <ConsoleChartSurface :option="trendOption" height="250px" />
        </article>

        <article class="task-focus__panel">
          <div class="task-focus__panel-head">
            <span class="task-focus__panel-label">当前待办优先级</span>
            <span class="task-focus__panel-note">按数量拆开查看</span>
          </div>
          <div class="task-focus__priority-panel">
            <ConsoleChartSurface :option="distributionOption" height="210px" />
            <div class="task-focus__legend">
              <div v-for="item in priorityDistribution" :key="item.priority" class="task-focus__legend-item">
                <span class="task-focus__legend-dot" :class="getPriorityTone(item.priority)"></span>
                <span>{{ getPriorityLabel(item.priority) }}</span>
                <strong>{{ item.count }}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import type {
  DashboardInsight,
  DashboardPriorityDistributionItem,
  DashboardTask,
  DashboardTaskTrendItem
} from '@/api/dashboard'
import type { EChartsOption } from '@/plugins/echarts'
import ConsoleChartSurface from './ConsoleChartSurface.vue'
import {
  formatDueLabel,
  formatExactTime,
  getDueTone,
  getPriorityLabel,
  getPriorityTone
} from './helpers'

const props = defineProps<{
  tasks: DashboardTask[]
  taskTrend: DashboardTaskTrendItem[]
  priorityDistribution: DashboardPriorityDistributionItem[]
  insight: DashboardInsight
  isDark: boolean
}>()

defineEmits<{
  'select-task': [task: DashboardTask]
  'view-all': []
}>()

const trendOption = computed<EChartsOption>(() => ({
  animationDuration: 900,
  color: ['#4f7dff', '#d8a24d', '#db6c7a'],
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: {
      color: '#6b7280'
    }
  },
  grid: {
    top: 42,
    right: 8,
    bottom: 6,
    left: 0,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#9aa3b2'
    },
    data: props.taskTrend.map((item) => item.date)
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: 'rgba(148,163,184,0.12)'
      }
    },
    axisLabel: {
      color: '#9aa3b2'
    }
  },
  series: [
    {
      name: '新增',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: props.taskTrend.map((item) => item.createdCount),
      areaStyle: {
        color: 'rgba(79,125,255,0.12)'
      }
    },
    {
      name: '完成',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: props.taskTrend.map((item) => item.completedCount),
      areaStyle: {
        color: 'rgba(216,162,77,0.12)'
      }
    },
    {
      name: '逾期',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: props.taskTrend.map((item) => item.overdueCount),
      areaStyle: {
        color: 'rgba(219,108,122,0.08)'
      }
    }
  ]
}))

const distributionColors = ['#d8e5ff', '#d8a24d', '#db6c7a']

const distributionOption = computed<EChartsOption>(() => ({
  animationDuration: 900,
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      type: 'pie',
      radius: ['54%', '78%'],
      center: ['50%', '50%'],
      startAngle: 210,
      label: { show: false },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 3
      },
      data: props.priorityDistribution.map((item, index) => ({
        value: item.count,
        name: getPriorityLabel(item.priority),
        itemStyle: {
          color: distributionColors[index] || distributionColors[0]
        }
      }))
    }
  ]
}))
</script>

<style scoped lang="scss">
.task-focus {
  position: relative;
  z-index: 1;
  padding: 1.35rem;
  border-radius: 2.3rem;
  background: #fff;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 18px 40px -34px rgba(15, 23, 42, 0.12);
}

.task-focus__header,
.task-focus__panel-head,
.task-focus__item-top,
.task-focus__item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.task-focus__eyebrow,
.task-focus__panel-label,
.task-focus__panel-note {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  color: var(--console-muted);
}

.task-focus__title {
  margin: 0.45rem 0 0;
  font-family: var(--console-display-font);
  font-size: clamp(1.96rem, 2.8vw, 2.55rem);
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--console-text-strong);
}

.task-focus__view {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.72rem 1rem;
  border: 0;
  border-radius: 999px;
  background: #4f7dff;
  color: #fff;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  box-shadow: 0 16px 30px -24px rgba(79, 125, 255, 0.32);
}

.task-focus__view:hover {
  transform: translateY(-0.12rem);
}

.task-focus__chips {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.task-focus__chip {
  display: inline-flex;
  align-items: center;
  padding: 0.42rem 0.76rem;
  border-radius: 999px;
  background: #f8f9fb;
  color: var(--console-text-soft);
  font-size: 0.84rem;
}

.task-focus__chip--danger {
  color: #b65c68;
}

.task-focus__chip--warning {
  color: #9b866a;
}

.task-focus__content {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: minmax(22rem, 0.9fr) minmax(0, 1.1fr);
  gap: 1rem;
}

.task-focus__list-shell,
.task-focus__panel,
.task-focus__empty {
  border-radius: 1.7rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    0 14px 32px -28px rgba(15, 23, 42, 0.1);
}

.task-focus__list-shell {
  padding: 0.85rem;
}

.task-focus__list {
  display: grid;
  gap: 0.8rem;
}

.task-focus__item {
  padding: 1rem;
  border: 0;
  border-radius: 1.4rem;
  background: #fafafa;
  text-align: left;
  color: inherit;
  transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease;
}

.task-focus__item:hover {
  transform: translateX(0.2rem);
  background: #f5f5f5;
  box-shadow: 0 14px 28px -24px rgba(15, 23, 42, 0.16);
}

.task-focus__priority,
.task-focus__due {
  padding: 0.34rem 0.58rem;
  border-radius: 999px;
  font-size: 0.78rem;
}

.priority-critical,
.due-overdue {
  background: rgba(219, 108, 122, 0.12);
  color: #db6c7a;
}

.priority-urgent,
.due-soon {
  background: rgba(216, 162, 77, 0.14);
  color: #d8a24d;
}

.priority-normal,
.due-safe,
.due-neutral {
  background: rgba(79, 125, 255, 0.12);
  color: #4f7dff;
}

.task-focus__item-title {
  display: block;
  margin-top: 0.75rem;
  font-size: 1.06rem;
  color: var(--console-text-strong);
}

.task-focus__item-meta,
.task-focus__item-bottom {
  color: var(--console-muted);
}

.task-focus__item-meta {
  margin: 0.5rem 0 0;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.86rem;
}

.task-focus__item-bottom {
  margin-top: 0.8rem;
  font-size: 0.84rem;
}

.task-focus__item-arrow {
  width: 1rem;
  height: 1rem;
}

.task-focus__empty {
  padding: 2.6rem 1rem;
  text-align: center;
  color: var(--console-muted);
}

.task-focus__analytics {
  display: grid;
  gap: 1rem;
}

.task-focus__panel {
  padding: 1rem;
}

.task-focus__panel--wide {
  min-height: 18rem;
}

.task-focus__priority-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 10rem;
  align-items: center;
}

.task-focus__legend {
  display: grid;
  gap: 0.7rem;
}

.task-focus__legend-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--console-text-soft);
}

.task-focus__legend-item strong {
  margin-left: auto;
  color: var(--console-text-strong);
}

.task-focus__legend-dot {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 50%;
}

@media (width <= 1100px) {
  .task-focus__content {
    grid-template-columns: 1fr;
  }
}

@media (width <= 760px) {
  .task-focus {
    padding: 1rem;
    border-radius: 1.8rem;
  }

  .task-focus__header {
    flex-direction: column;
    align-items: start;
  }

  .task-focus__priority-panel {
    grid-template-columns: 1fr;
  }
}
</style>
