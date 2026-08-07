<template>
  <section class="project-gallery">
    <div class="project-gallery__header">
      <div>
        <div class="project-gallery__eyebrow">项目视角</div>
        <h2 class="project-gallery__title">项目切换与推进概览</h2>
      </div>
    </div>

    <div class="project-gallery__content">
      <aside class="project-gallery__rail">
        <div class="project-gallery__rail-head">
          <span>项目列表</span>
          <span>{{ galleryItems.length }} 个</span>
        </div>

        <div v-if="galleryItems.length" class="project-gallery__list">
          <button
            v-for="project in galleryItems"
            :key="project.projectId"
            class="project-gallery__item"
            :class="{ 'project-gallery__item--active': project.projectId === currentProject?.projectId }"
            type="button"
            @click="selectedProjectId = project.projectId"
          >
            <span class="project-gallery__item-bar"></span>
            <div class="project-gallery__item-avatar">{{ getMonogram(project.name) }}</div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <strong class="truncate text-sm font-medium text-slate-800">{{ project.name }}</strong>
                <span class="text-xs text-slate-400">{{ clampPercent(project.progress) }}%</span>
              </div>
              <p class="mt-1 truncate text-xs text-slate-500">
                {{ getRoleLabel(project.role) }} · {{ project.pendingCount }} 待办 / {{ project.overdueCount }} 逾期
              </p>
            </div>
            <span class="project-gallery__item-dot"></span>
          </button>
        </div>

        <div v-else class="project-gallery__empty">当前没有可展示的项目健康数据。</div>
      </aside>

      <div v-if="currentProject" class="project-gallery__spotlight">
        <div class="project-gallery__spotlight-top">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <span class="project-gallery__role">{{ getRoleLabel(currentProject.role) }}</span>
              <span class="project-gallery__project-id">#{{ currentProject.projectId }}</span>
            </div>
            <h3 class="project-gallery__name">{{ currentProject.name }}</h3>
            <p class="project-gallery__desc">
              {{ currentProject.description || '当前优先展示任务负载、完成进度与风险压力，帮助你在一个界面里切换项目节奏。' }}
            </p>
          </div>

          <div class="project-gallery__ring" :style="getRingStyle(currentProject.progress)">
            <span>{{ clampPercent(currentProject.progress) }}%</span>
          </div>
        </div>

        <div class="project-gallery__stats">
          <div>
            <span>待办</span>
            <strong>{{ currentProject.pendingCount }}</strong>
          </div>
          <div>
            <span>完成</span>
            <strong>{{ currentProject.doneCount }}</strong>
          </div>
          <div>
            <span>逾期</span>
            <strong>{{ currentProject.overdueCount }}</strong>
          </div>
        </div>

        <div class="project-gallery__actions">
          <button
            type="button"
            class="project-gallery__cta"
            @click="$emit('select-project', currentProject.projectId, currentProject.name)"
          >
            进入项目看板
          </button>
          <span class="project-gallery__note">右侧图表仍保留全局负载对比，左侧负责切换当前焦点。</span>
        </div>

        <article class="project-gallery__panel">
          <div class="project-gallery__panel-head">
            <span class="project-gallery__panel-label">项目负载对比</span>
            <span class="project-gallery__panel-note">待办与逾期任务</span>
          </div>
          <ConsoleChartSurface :option="healthOption" height="300px" />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DashboardProject, DashboardProjectHealth } from '@/api/dashboard'
import type { EChartsOption } from '@/plugins/echarts'
import ConsoleChartSurface from './ConsoleChartSurface.vue'
import { clampPercent, getRoleLabel } from './helpers'

const props = defineProps<{
  projects: DashboardProject[]
  projectHealth: DashboardProjectHealth[]
  isDark: boolean
}>()

defineEmits<{
  'select-project': [projectId: number, projectName: string]
}>()

const selectedProjectId = ref<number | null>(null)

const galleryItems = computed(() => {
  const quickMap = new Map(props.projects.map((item) => [item.id, item]))
  return props.projectHealth.slice(0, 6).map((item) => ({
    ...item,
    description: quickMap.get(item.projectId)?.description || ''
  }))
})

watch(
  galleryItems,
  (items) => {
    if (!items.length) {
      selectedProjectId.value = null
      return
    }

    const exists = items.some((item) => item.projectId === selectedProjectId.value)
    if (!exists) {
      selectedProjectId.value = items[0].projectId
    }
  },
  { immediate: true }
)

const currentProject = computed(() => {
  return galleryItems.value.find((item) => item.projectId === selectedProjectId.value) || galleryItems.value[0] || null
})

const healthOption = computed<EChartsOption>(() => ({
  animationDuration: 900,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
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
    top: 44,
    right: 12,
    bottom: 10,
    left: 0,
    containLabel: true
  },
  xAxis: {
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
  yAxis: {
    type: 'category',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#374151'
    },
    data: galleryItems.value.map((item) => item.name)
  },
  series: [
    {
      name: '待办',
      type: 'bar',
      barWidth: 10,
      data: galleryItems.value.map((item) => item.pendingCount),
      itemStyle: {
        borderRadius: 999,
      color: '#4f7dff'
      }
    },
    {
      name: '逾期',
      type: 'bar',
      barWidth: 10,
      data: galleryItems.value.map((item) => item.overdueCount),
      itemStyle: {
        borderRadius: 999,
      color: '#db6c7a'
      }
    }
  ]
}))

const getRingStyle = (progress: number) => ({
  background: `conic-gradient(#4f7dff ${clampPercent(progress)}%, rgba(226,232,240,0.92) 0)`
})

const getMonogram = (name: string) => {
  const normalized = name.replace(/\s+/g, '')
  return normalized.slice(0, 2) || '项目'
}
</script>

<style scoped lang="scss">
.project-gallery {
  position: relative;
  z-index: 1;
  padding: 1.2rem;
  border-radius: 2.2rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 18px 40px -34px rgba(15, 23, 42, 0.12);
}

.project-gallery__eyebrow,
.project-gallery__panel-label,
.project-gallery__panel-note,
.project-gallery__role,
.project-gallery__project-id,
.project-gallery__stats span,
.project-gallery__rail-head {
  font-size: 0.8rem;
  color: var(--console-muted);
}

.project-gallery__eyebrow,
.project-gallery__panel-label,
.project-gallery__project-id {
  letter-spacing: 0.12em;
}

.project-gallery__title {
  margin: 0.42rem 0 0;
  font-family: var(--console-display-font);
  font-size: clamp(1.8rem, 2.5vw, 2.3rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
  color: var(--console-text-strong);
}

.project-gallery__content {
  margin-top: 1.15rem;
  display: grid;
  grid-template-columns: minmax(16rem, 18.5rem) minmax(0, 1fr);
  gap: 1rem;
}

.project-gallery__rail,
.project-gallery__spotlight,
.project-gallery__panel,
.project-gallery__empty {
  border-radius: 1.8rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    0 14px 32px -28px rgba(15, 23, 42, 0.1);
}

.project-gallery__rail {
  padding: 0.9rem;
}

.project-gallery__rail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.1rem 0.2rem 0.75rem;
  font-weight: 600;
}

.project-gallery__list {
  display: grid;
  gap: 0.35rem;
  max-height: 23.4rem;
  overflow-y: auto;
  padding-right: 0.1rem;
}

.project-gallery__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.82rem 0.8rem 0.82rem 0.95rem;
  border-radius: 18px;
  background: transparent;
  text-align: left;
  color: inherit;
  transition: background 0.24s ease, transform 0.24s ease;
}

.project-gallery__item:hover {
  transform: translateX(2px);
  background: #f8f9fb;
}

.project-gallery__item--active {
  background: #f5f6f8;
}

.project-gallery__item-bar {
  position: absolute;
  inset: 18% auto 18% 0.2rem;
  width: 3px;
  border-radius: 999px;
  background: transparent;
}

.project-gallery__item--active .project-gallery__item-bar {
  background: #4f7dff;
}

.project-gallery__item-avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 0.95rem;
  background: #ecf2ff;
  color: #4f7dff;
  font-size: 0.82rem;
  font-weight: 700;
}

.project-gallery__item-dot {
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 999px;
  background: #cad8ff;
}

.project-gallery__item--active .project-gallery__item-dot {
  background: #4f7dff;
  box-shadow: 0 0 0 6px rgba(79, 125, 255, 0.14);
}

.project-gallery__spotlight {
  padding: 1rem;
}

.project-gallery__spotlight-top,
.project-gallery__panel-head,
.project-gallery__actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.project-gallery__role {
  padding: 0.34rem 0.62rem;
  border-radius: 999px;
  background: #f8f9fb;
}

.project-gallery__name {
  display: block;
  margin-top: 0.7rem;
  font-size: 1.32rem;
  color: var(--console-text-strong);
}

.project-gallery__desc {
  margin: 0.6rem 0 0;
  line-height: 1.7;
  color: var(--console-text-soft);
}

.project-gallery__ring {
  position: relative;
  flex: 0 0 auto;
  width: 5.3rem;
  height: 5.3rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.project-gallery__ring::before {
  content: '';
  position: absolute;
  inset: 0.52rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
}

.project-gallery__ring span {
  position: relative;
  z-index: 1;
  font-family: var(--console-display-font);
  font-size: 1.16rem;
  font-weight: 650;
  color: var(--console-text-strong);
}

.project-gallery__stats {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.project-gallery__stats div {
  padding: 0.8rem 0.75rem;
  border-radius: 1.15rem;
  background: #f8f9fb;
}

.project-gallery__stats strong {
  display: block;
  margin-top: 0.3rem;
  font-size: 1.08rem;
  color: var(--console-text-strong);
}

.project-gallery__actions {
  margin-top: 1rem;
  align-items: center;
}

.project-gallery__cta {
  border-radius: 999px;
  padding: 0.75rem 1.05rem;
  border: 0;
  background: #4f7dff;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 16px 30px -24px rgba(79, 125, 255, 0.32);
}

.project-gallery__note {
  font-size: 0.84rem;
  line-height: 1.7;
  color: var(--console-muted);
}

.project-gallery__panel {
  margin-top: 1rem;
  padding: 1rem;
}

.project-gallery__empty {
  padding: 2.4rem 1rem;
  text-align: center;
  color: var(--console-muted);
}

@media (width <= 1100px) {
  .project-gallery__content {
    grid-template-columns: 1fr;
  }
}

@media (width <= 760px) {
  .project-gallery {
    padding: 1rem;
    border-radius: 1.8rem;
  }

  .project-gallery__stats {
    grid-template-columns: 1fr;
  }

  .project-gallery__actions,
  .project-gallery__spotlight-top {
    flex-direction: column;
  }
}
</style>
