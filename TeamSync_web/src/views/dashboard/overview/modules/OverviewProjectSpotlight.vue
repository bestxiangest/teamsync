<template>
  <section v-if="project" class="overview-spotlight rounded-[34px] p-6">
    <div class="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-xs font-medium tracking-[0.34em] text-slate-400">项目聚焦</p>
          <span class="overview-spotlight__status" :class="healthToneClass">
            <span class="overview-spotlight__status-dot"></span>
            {{ healthTextMap[project.healthLevel] || '需要关注' }}
          </span>
        </div>

        <div class="mt-4 flex flex-wrap items-start justify-between gap-5">
          <div class="min-w-0 flex-1">
            <h2 class="text-[clamp(1.85rem,3.2vw,2.65rem)] font-semibold leading-tight text-slate-900">{{ project.name }}</h2>
            <p class="mt-3 max-w-3xl text-base leading-8 text-slate-600">
              {{ project.description || '此刻它没有额外注脚，但推进速度、任务压力与协作痕迹已经足够构成一张可读的执行画像。' }}
            </p>
          </div>

          <button type="button" class="overview-spotlight__cta" @click="$emit('go-board', project.projectId, project.name)">
            进入项目看板
          </button>
        </div>

        <div class="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
          <span class="overview-spotlight__chip">负责人 {{ project.ownerName }}</span>
          <span class="overview-spotlight__chip">成员 {{ project.memberCount }} 人</span>
          <span class="overview-spotlight__chip">评论 {{ project.commentCount }} 条</span>
          <span class="overview-spotlight__chip">最近动态 {{ lastActivityText }}</span>
        </div>

        <div class="mt-6 grid gap-3 md:grid-cols-4">
          <article v-for="item in stats" :key="item.label" class="overview-spotlight__stat">
            <p class="text-xs tracking-[0.28em] text-slate-400">{{ item.label }}</p>
            <p class="mt-3 text-2xl font-semibold text-slate-900">{{ item.value }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ item.note }}</p>
          </article>
        </div>
      </div>

      <div class="grid gap-4">
        <div class="overview-spotlight__panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs tracking-[0.32em] text-slate-400">执行画像</p>
              <p class="mt-2 text-lg font-semibold text-slate-800">让进度和健康度同时显影</p>
            </div>
            <div class="overview-spotlight__gauge" :style="gaugeStyle">
              <div class="overview-spotlight__gauge-core">
                <span class="text-3xl font-semibold text-slate-900">{{ project.progress }}%</span>
                <span class="mt-1 text-xs tracking-[0.28em] text-slate-400">进度</span>
              </div>
            </div>
          </div>

          <div class="mt-5 rounded-[24px] bg-[#f8f9fb] px-4 py-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-slate-700">完成率与健康分</span>
              <span class="text-slate-500">{{ project.completionRate }}% / {{ project.healthScore }} 分</span>
            </div>
            <div class="mt-3 flex gap-2">
              <div class="h-2 flex-1 rounded-full bg-slate-200/70">
                <div class="h-full rounded-full bg-[#1f2937]" :style="{ width: `${project.completionRate}%` }"></div>
              </div>
              <div class="h-2 flex-1 rounded-full bg-slate-200/70">
                <div class="h-full rounded-full bg-[#a39176]" :style="{ width: `${project.healthScore}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="overview-spotlight__panel">
          <p class="text-xs tracking-[0.32em] text-slate-400">优先级结构</p>
          <p class="mt-2 text-lg font-semibold text-slate-800">把任务压力拆开来看</p>
          <div class="mt-4 space-y-3">
            <div v-for="item in priorityRows" :key="item.label">
              <div class="mb-2 flex items-center justify-between text-sm">
                <span class="font-medium text-slate-600">{{ item.label }}</span>
                <span class="text-slate-500">{{ item.value }} 项</span>
              </div>
              <div class="h-2 rounded-full bg-slate-200/70">
                <div class="h-full rounded-full" :style="{ width: item.width, background: item.color }"></div>
              </div>
            </div>
          </div>
          <p class="mt-4 text-sm leading-7 text-slate-500">
            目前仍有 <span class="font-semibold text-slate-900">{{ project.pendingCount }}</span> 项任务待收束，
            其中 <span class="font-semibold text-[#b65c68]">{{ project.overdueCount }}</span> 项已经偏离原定节奏。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'
import type { DashboardOverviewProject } from '@/api/dashboard'

const props = defineProps<{
  project: DashboardOverviewProject | null
}>()

defineEmits<{
  'go-board': [projectId: number, name: string]
}>()

const healthTextMap: Record<string, string> = {
  healthy: '状态平稳',
  warning: '保持观察',
  risk: '优先照看'
}

const healthToneClass = computed(() => {
  switch (props.project?.healthLevel) {
    case 'risk':
      return 'overview-spotlight__status--risk'
    case 'warning':
      return 'overview-spotlight__status--warning'
    default:
      return 'overview-spotlight__status--healthy'
  }
})

const stats = computed(() => {
  if (!props.project) {
    return []
  }

  return [
    {
      label: '任务总数',
      value: props.project.taskCount,
      note: `其中 ${props.project.doneCount} 项已经落定`
    },
    {
      label: '近 7 日动态',
      value: props.project.activityCount7d,
      note: '用来衡量最近一周的协作密度'
    },
    {
      label: '评论沉淀',
      value: props.project.commentCount,
      note: '留下的上下文与讨论痕迹'
    },
    {
      label: '成员规模',
      value: props.project.memberCount,
      note: '参与当前项目推进的人数'
    }
  ]
})

const lastActivityText = computed(() => {
  if (!props.project?.lastActivityAt) {
    return '暂无记录'
  }
  return dayjs(props.project.lastActivityAt).format('MM-DD HH:mm')
})

const gaugeStyle = computed(() => {
  const progress = props.project?.progress || 0
  return {
    background: `conic-gradient(#4f7dff 0% ${progress}%, #d8a24d ${progress}% ${Math.min(progress + 16, 100)}%, rgba(226,232,240,0.9) 0)`
  }
})

const priorityRows = computed(() => {
  const project = props.project
  if (!project) {
    return []
  }

  const total = Math.max(project.highPriorityCount + project.mediumPriorityCount + project.normalPriorityCount, 1)
  return [
    {
      label: '高优先级',
      value: project.highPriorityCount,
      width: `${Math.round((project.highPriorityCount / total) * 100)}%`,
      color: '#b65c68'
    },
    {
      label: '中优先级',
      value: project.mediumPriorityCount,
      width: `${Math.round((project.mediumPriorityCount / total) * 100)}%`,
      color: '#a39176'
    },
    {
      label: '常规优先级',
      value: project.normalPriorityCount,
      width: `${Math.round((project.normalPriorityCount / total) * 100)}%`,
      color: '#9ca3af'
    }
  ]
})
</script>

<style scoped>
.overview-spotlight {
  background: #fff;
  box-shadow:
    0 20px 52px -40px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.overview-spotlight__status {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  border-radius: 999px;
  padding: 0.42rem 0.78rem;
  background: #f8f9fb;
  font-size: 0.8rem;
  font-weight: 500;
}

.overview-spotlight__status-dot {
  width: 0.36rem;
  height: 0.36rem;
  border-radius: 999px;
  background: currentColor;
}

.overview-spotlight__status--healthy {
  color: #6f90d8;
}

.overview-spotlight__status--warning {
  color: #d8a24d;
}

.overview-spotlight__status--risk {
  color: #db6c7a;
}

.overview-spotlight__cta {
  border-radius: 9999px;
  padding: 0.9rem 1.25rem;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  background: #4f7dff;
  box-shadow: 0 18px 36px -24px rgba(79, 125, 255, 0.3);
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

.overview-spotlight__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 38px -24px rgba(79, 125, 255, 0.34);
}

.overview-spotlight__chip,
.overview-spotlight__stat,
.overview-spotlight__panel {
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    0 12px 30px -24px rgba(15, 23, 42, 0.1);
}

.overview-spotlight__chip {
  border-radius: 9999px;
  padding: 0.65rem 0.95rem;
}

.overview-spotlight__stat {
  border-radius: 22px;
  padding: 1rem;
}

.overview-spotlight__panel {
  border-radius: 28px;
  padding: 1.25rem;
}

.overview-spotlight__gauge {
  display: grid;
  place-items: center;
  width: 10rem;
  height: 10rem;
  border-radius: 9999px;
  padding: 0.8rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 16px 34px -24px rgba(15, 23, 42, 0.14);
}

.overview-spotlight__gauge-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
}
</style>
