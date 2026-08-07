<template>
  <section class="activity-stream">
    <div class="activity-stream__header">
      <div>
        <div class="activity-stream__eyebrow">协作动态</div>
        <h2 class="activity-stream__title">最近发生了什么</h2>
      </div>
    </div>

    <div class="activity-stream__content">
      <article class="activity-stream__panel">
        <div class="activity-stream__panel-head">
          <span class="activity-stream__panel-label">近 7 日活跃度</span>
          <span class="activity-stream__panel-note">按天统计协作记录</span>
        </div>
        <ConsoleChartSurface :option="activityOption" height="260px" />
      </article>

      <div class="activity-stream__timeline-shell">
        <div class="activity-stream__timeline-head">
          <span>动态日志</span>
          <span>{{ activities.length }} 条</span>
        </div>

        <div class="activity-stream__timeline">
          <button
            v-for="(activity, index) in activities"
            :key="activity.id"
            class="activity-stream__item"
            type="button"
            @click="$emit('select-activity', activity)"
          >
            <span class="activity-stream__item-line" :style="getLineStyle(activity.projectId || index)"></span>
            <div class="activity-stream__avatar" :style="getAvatarStyle(activity.projectId || index)">
              <img v-if="activity.operatorAvatar" :src="activity.operatorAvatar" :alt="activity.operatorName" />
              <span v-else>{{ getInitials(activity.operatorName) }}</span>
            </div>
            <div class="activity-stream__body">
              <div class="activity-stream__item-top">
                <span class="activity-stream__operator">{{ activity.operatorName }}</span>
                <span class="activity-stream__action" :class="getActionTone(activity.actionType)">
                  {{ getActionLabel(activity.actionType) }}
                </span>
              </div>
              <strong class="activity-stream__task">{{ activity.taskTitle }}</strong>
              <p class="activity-stream__detail">{{ activity.detail || '留下了一条新的协作记录。' }}</p>
              <div class="activity-stream__meta">
                <span class="activity-stream__project">{{ activity.projectName }}</span>
                <span>{{ formatRelativeTime(activity.createdAt) }}</span>
              </div>
            </div>
          </button>

          <div v-if="!activities.length" class="activity-stream__empty">最近还没有新的动态。</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardActivity, DashboardActivityHeatItem } from '@/api/dashboard'
import type { EChartsOption } from '@/plugins/echarts'
import ConsoleChartSurface from './ConsoleChartSurface.vue'
import {
  formatRelativeTime,
  getAccentColor,
  getActionLabel,
  getActionTone,
  getInitials
} from './helpers'

const props = defineProps<{
  activities: DashboardActivity[]
  activityHeat: DashboardActivityHeatItem[]
  isDark: boolean
}>()

defineEmits<{
  'select-activity': [activity: DashboardActivity]
}>()

const activityOption = computed<EChartsOption>(() => ({
  animationDuration: 900,
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    top: 10,
    right: 8,
    bottom: 8,
    left: 0,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#9aa3b2'
    },
    data: props.activityHeat.map((item) => item.date)
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
      type: 'bar',
      barWidth: 18,
      data: props.activityHeat.map((item) => item.count),
      itemStyle: {
        borderRadius: [999, 999, 0, 0],
        color: '#4f7dff'
      }
    },
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: props.activityHeat.map((item) => item.count),
      lineStyle: {
        width: 2,
        color: '#d8a24d'
      },
      itemStyle: {
        color: '#d8a24d'
      }
    }
  ]
}))

const getLineStyle = (seed: number) => ({
  background: `linear-gradient(180deg, ${getAccentColor(seed)}, transparent)`
})

const getAvatarStyle = (seed: number) => ({
  background: `linear-gradient(135deg, ${getAccentColor(seed)}, rgba(255,255,255,0.28))`
})
</script>

<style scoped lang="scss">
.activity-stream {
  position: relative;
  z-index: 1;
  padding: 1.2rem;
  border-radius: 2.2rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 18px 40px -34px rgba(15, 23, 42, 0.12);
}

.activity-stream__eyebrow,
.activity-stream__panel-label,
.activity-stream__panel-note,
.activity-stream__detail,
.activity-stream__meta,
.activity-stream__project,
.activity-stream__timeline-head {
  font-size: 0.8rem;
  color: var(--console-muted);
}

.activity-stream__eyebrow,
.activity-stream__panel-label {
  letter-spacing: 0.12em;
}

.activity-stream__title {
  margin: 0.42rem 0 0;
  font-family: var(--console-display-font);
  font-size: clamp(1.8rem, 2.5vw, 2.3rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
  color: var(--console-text-strong);
}

.activity-stream__content {
  margin-top: 1.15rem;
  display: grid;
  grid-template-columns: minmax(18rem, 0.9fr) minmax(0, 1.1fr);
  gap: 1rem;
}

.activity-stream__panel,
.activity-stream__timeline-shell,
.activity-stream__item,
.activity-stream__empty {
  border-radius: 1.8rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    0 14px 32px -28px rgba(15, 23, 42, 0.1);
}

.activity-stream__panel,
.activity-stream__timeline-shell {
  padding: 1rem;
}

.activity-stream__panel-head,
.activity-stream__item-top,
.activity-stream__meta,
.activity-stream__timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.activity-stream__timeline-head {
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.activity-stream__timeline {
  display: grid;
  gap: 0.8rem;
  max-height: 28rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.activity-stream__timeline::-webkit-scrollbar {
  width: 6px;
}

.activity-stream__timeline::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.36);
}

.activity-stream__item {
  position: relative;
  padding: 1rem 1rem 1rem 4.7rem;
  border: 0;
  text-align: left;
  color: inherit;
  transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease;
}

.activity-stream__item:hover {
  transform: translateX(0.2rem);
  background: #fafafa;
  box-shadow: 0 14px 28px -24px rgba(15, 23, 42, 0.16);
}

.activity-stream__item-line,
.activity-stream__avatar {
  position: absolute;
  left: 1rem;
}

.activity-stream__item-line {
  top: 0.9rem;
  bottom: 0.9rem;
  width: 2px;
  border-radius: 999px;
}

.activity-stream__avatar {
  top: 1rem;
  width: 2.55rem;
  height: 2.55rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  overflow: hidden;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
}

.activity-stream__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-stream__operator,
.activity-stream__task {
  color: var(--console-text-strong);
}

.activity-stream__operator {
  font-weight: 700;
}

.activity-stream__task {
  display: block;
  margin-top: 0.45rem;
  font-size: 1.04rem;
}

.activity-stream__detail {
  margin: 0.58rem 0 0;
  line-height: 1.7;
}

.activity-stream__meta {
  margin-top: 0.9rem;
}

.activity-stream__project {
  color: var(--console-text-soft);
}

.activity-stream__action {
  padding: 0.34rem 0.62rem;
  border-radius: 999px;
  font-size: 0.8rem;
}

.tone-create {
  background: rgba(79, 125, 255, 0.12);
  color: #4f7dff;
}

.tone-move,
.tone-update {
  background: rgba(79, 125, 255, 0.12);
  color: #4f7dff;
}

.tone-delete {
  background: rgba(219, 108, 122, 0.12);
  color: #db6c7a;
}

.tone-comment {
  background: rgba(216, 162, 77, 0.14);
  color: #d8a24d;
}

.activity-stream__empty {
  padding: 2.4rem 1rem;
  text-align: center;
  color: var(--console-muted);
}

@media (width <= 1100px) {
  .activity-stream__content {
    grid-template-columns: 1fr;
  }
}

@media (width <= 760px) {
  .activity-stream {
    padding: 1rem;
    border-radius: 1.8rem;
  }

  .activity-stream__timeline {
    max-height: 22rem;
  }
}
</style>
