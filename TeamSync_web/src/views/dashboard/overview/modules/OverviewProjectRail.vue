<template>
  <aside
    class="overview-project-rail sticky top-4 overflow-hidden rounded-[30px] px-3 py-4 transition-all duration-500"
    :class="{ 'overview-project-rail--collapsed': collapsed }"
  >
    <div class="relative z-10">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="overview-project-rail__eyebrow">项目导航</p>
          <h3 class="mt-2 text-lg font-semibold text-slate-900">
            {{ collapsed ? '项目' : '聚焦项目' }}
          </h3>
          <transition name="rail-fade">
            <p v-if="!collapsed" class="mt-2 text-sm leading-6 text-slate-500">
              像系统菜单一样切换焦点，右侧画面会随之重排。
            </p>
          </transition>
        </div>

        <button
          type="button"
          class="overview-project-rail__toggle"
          :aria-label="collapsed ? '展开项目导航' : '收起项目导航'"
          @click="emit('update:collapsed', !collapsed)"
        >
          <span class="overview-project-rail__toggle-line"></span>
          <span class="overview-project-rail__toggle-line"></span>
          <span class="overview-project-rail__toggle-line"></span>
        </button>
      </div>

      <transition name="rail-fade">
        <div v-if="!collapsed" class="overview-project-rail__summary mt-4">
          共接入 <span class="font-semibold text-slate-900">{{ projects.length }}</span> 个项目，
          左侧切换当前视角，右侧展开对应的推进纹理和风险轮廓。
        </div>
      </transition>

      <div class="mt-4 space-y-1 overflow-y-auto pr-1" :class="collapsed ? 'max-h-[70vh]' : 'max-h-[calc(100vh-15rem)]'">
        <button
          v-for="project in projects"
          :key="project.projectId"
          type="button"
          class="overview-project-rail__item"
          :class="{ 'overview-project-rail__item--active': project.projectId === modelValue }"
          @click="emit('update:modelValue', project.projectId)"
        >
          <span class="overview-project-rail__item-bar"></span>
          <div class="overview-project-rail__avatar">
            <span>{{ getProjectMonogram(project.name) }}</span>
          </div>

          <transition name="rail-slide">
            <div v-if="!collapsed" class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-sm font-medium text-slate-800">{{ project.name }}</p>
                <span class="text-xs text-slate-400">{{ project.progress }}%</span>
              </div>
              <p class="mt-1 truncate text-xs leading-5 text-slate-500">
                {{ project.description || '当前以任务节奏、健康分层和协作密度为主要观察线索。' }}
              </p>
              <div class="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                <span class="overview-project-rail__status" :class="getHealthToneClass(project.healthLevel)">
                  <span class="overview-project-rail__status-dot"></span>
                  {{ healthTextMap[project.healthLevel] || '需要关注' }}
                </span>
                <span>{{ project.pendingCount }} 待办 / {{ project.overdueCount }} 逾期</span>
              </div>
            </div>
          </transition>

          <span class="overview-project-rail__active-dot"></span>
        </button>
      </div>

      <transition name="rail-fade">
        <button
          v-if="!collapsed && selectedProject"
          type="button"
          class="overview-project-rail__cta mt-4 w-full"
          @click="emit('go-board', selectedProject.projectId, selectedProject.name)"
        >
          进入「{{ selectedProject.name }}」看板
        </button>
      </transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { DashboardOverviewProject } from '@/api/dashboard'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  projects: DashboardOverviewProject[]
  collapsed: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'update:collapsed': [value: boolean]
  'go-board': [projectId: number, name: string]
}>()

const healthTextMap: Record<string, string> = {
  healthy: '状态平稳',
  warning: '保持观察',
  risk: '优先照看'
}

const selectedProject = computed(() =>
  props.projects.find((project) => project.projectId === props.modelValue) || props.projects[0] || null
)

const getProjectMonogram = (name: string) => {
  const normalized = name.replace(/\s+/g, '')
  return normalized.slice(0, 2) || '项目'
}

const getHealthToneClass = (level?: string) => {
  switch (level) {
    case 'risk':
      return 'is-risk'
    case 'warning':
      return 'is-warning'
    default:
      return 'is-steady'
  }
}
</script>

<style scoped>
.overview-project-rail {
  background: #fff;
  box-shadow:
    0 20px 52px -40px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.overview-project-rail__eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  color: #9aa3b2;
}

.overview-project-rail__summary {
  border-radius: 18px;
  padding: 0.85rem 0.95rem;
  background: #f8f9fb;
  color: #6b7280;
  line-height: 1.8;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.overview-project-rail__toggle {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.26rem;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 16px;
  background: #f8f9fb;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.98);
  transition: transform 0.28s ease, background 0.28s ease;
}

.overview-project-rail__toggle:hover {
  transform: translateY(-1px);
  background: #edf4ff;
}

.overview-project-rail__toggle-line {
  display: block;
  width: 0.95rem;
  height: 2px;
  margin: 0 auto;
  border-radius: 999px;
  background: #6f90d8;
  transition: transform 0.32s ease;
}

.overview-project-rail--collapsed .overview-project-rail__toggle-line:first-child {
  transform: translateX(0.1rem);
}

.overview-project-rail--collapsed .overview-project-rail__toggle-line:last-child {
  transform: translateX(-0.1rem);
}

.overview-project-rail__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.82rem 0.8rem 0.82rem 0.95rem;
  border-radius: 20px;
  background: transparent;
  color: inherit;
  text-align: left;
  transition:
    transform 0.24s ease,
    background 0.24s ease,
    box-shadow 0.24s ease;
}

.overview-project-rail__item:hover {
  transform: translateX(2px);
  background: #f8f9fb;
}

.overview-project-rail__item--active {
  background: #f5f6f8;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.98);
}

.overview-project-rail__item-bar {
  position: absolute;
  inset: 18% auto 18% 0.2rem;
  width: 3px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.24s ease;
}

.overview-project-rail__item--active .overview-project-rail__item-bar {
  background: #4f7dff;
}

.overview-project-rail__avatar {
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
  letter-spacing: 0.08em;
}

.overview-project-rail__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.overview-project-rail__status-dot {
  width: 0.34rem;
  height: 0.34rem;
  border-radius: 999px;
  background: currentColor;
}

.overview-project-rail__status.is-steady {
  color: #6f90d8;
}

.overview-project-rail__status.is-warning {
  color: #d8a24d;
}

.overview-project-rail__status.is-risk {
  color: #db6c7a;
}

.overview-project-rail__active-dot {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 999px;
  background: #cad8ff;
  transform: translateY(-50%);
  transition: all 0.24s ease;
}

.overview-project-rail__item--active .overview-project-rail__active-dot {
  width: 0.52rem;
  height: 0.52rem;
  background: #4f7dff;
  box-shadow: 0 0 0 6px rgba(79, 125, 255, 0.14);
}

.overview-project-rail__cta {
  border-radius: 9999px;
  padding: 0.95rem 1.25rem;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  background: #4f7dff;
  box-shadow: 0 18px 36px -24px rgba(79, 125, 255, 0.3);
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

.overview-project-rail__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 38px -24px rgba(79, 125, 255, 0.34);
}

.overview-project-rail--collapsed {
  padding-inline: 0.65rem;
}

.overview-project-rail--collapsed .overview-project-rail__item {
  justify-content: center;
  padding-inline: 0.4rem;
}

.rail-fade-enter-active,
.rail-fade-leave-active,
.rail-slide-enter-active,
.rail-slide-leave-active {
  transition: all 0.24s ease;
}

.rail-fade-enter-from,
.rail-fade-leave-to,
.rail-slide-enter-from,
.rail-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
