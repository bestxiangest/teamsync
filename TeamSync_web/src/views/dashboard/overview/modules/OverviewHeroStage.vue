<template>
  <section class="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
    <div class="overview-hero__surface relative overflow-hidden rounded-[38px] px-7 py-8">
      <div class="relative z-10">
        <p class="overview-hero__eyebrow">全平台总览</p>
        <div class="mt-4 max-w-3xl">
          <h1 class="overview-hero__title">平台项目总览</h1>
          <p class="mt-4 text-[clamp(1rem,1.28vw,1.12rem)] leading-8 text-slate-600">
            把推进的速度、风险的轮廓和协作留下的回声，收束成一张可以静下来判断的全景图。
          </p>
        </div>

        <div class="overview-hero__lead mt-6">
          <p class="text-sm leading-7 text-slate-600">
            当前共有
            <span class="font-semibold text-slate-900">{{ summary.projectCount }}</span>
            个项目同时推进，平台平均进度来到
            <span class="font-semibold text-slate-900">{{ summary.averageProgress }}%</span>
            ，最近 7 天累计产生
            <span class="font-semibold text-slate-900">{{ summary.activityCount7d }}</span>
            条协作动态。
            <span v-if="featuredProjectName" class="text-slate-500">
              当前视线正落在「{{ featuredProjectName }}」。
            </span>
          </p>
        </div>

        <div class="mt-7 grid gap-3 md:grid-cols-4">
          <article v-for="item in signalCards" :key="item.label" class="overview-hero__signal">
            <p class="text-xs tracking-[0.28em] text-slate-400">{{ item.label }}</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">{{ item.value }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ item.note }}</p>
          </article>
        </div>
      </div>
    </div>

    <div class="overview-stage relative overflow-hidden rounded-[38px] p-7">
      <div class="overview-stage__mesh"></div>
      <div class="overview-stage__center"></div>
      <div class="overview-stage__ring overview-stage__ring--outer"></div>
      <div class="overview-stage__ring overview-stage__ring--inner"></div>
      <div class="overview-stage__arc overview-stage__arc--left"></div>
      <div class="overview-stage__arc overview-stage__arc--right"></div>

      <div class="relative z-10 grid h-full grid-cols-2 gap-4">
        <article v-for="item in stageCards" :key="item.label" class="overview-stage__stat">
          <p class="text-xs tracking-[0.28em] text-slate-400">{{ item.label }}</p>
          <p class="mt-3 text-[2rem] font-semibold text-slate-900">{{ item.value }}</p>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ item.note }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardOverviewSummary } from '@/api/dashboard'

const props = defineProps<{
  summary: DashboardOverviewSummary
  featuredProjectName?: string
}>()

const signalCards = computed(() => [
  {
    label: '落定比例',
    value: `${props.summary.completionRate}%`,
    note: `已有 ${props.summary.doneTaskCount} 项任务进入完成态`
  },
  {
    label: '待收束事项',
    value: props.summary.pendingTaskCount,
    note: `${props.summary.overdueTaskCount} 项任务已滑入逾期`
  },
  {
    label: '协作回声',
    value: props.summary.commentCount,
    note: `${props.summary.memberCount} 位成员共同留下讨论痕迹`
  },
  {
    label: '健康层次',
    value: `${props.summary.healthyProjectCount}/${props.summary.warningProjectCount}/${props.summary.riskProjectCount}`,
    note: '稳定、观察、风险三层并存'
  }
])

const stageCards = computed(() => [
  {
    label: '活跃项目',
    value: props.summary.projectCount,
    note: '仍在持续推进中的项目数量'
  },
  {
    label: '任务总量',
    value: props.summary.taskCount,
    note: '平台所有项目共同叠加出的工作体量'
  },
  {
    label: '平均进度',
    value: `${props.summary.averageProgress}%`,
    note: '当前平台整体的推进中位感'
  },
  {
    label: '近 7 日动态',
    value: props.summary.activityCount7d,
    note: '一周内沉淀下来的协作记录'
  }
])
</script>

<style scoped>
.overview-hero__surface,
.overview-stage {
  background: #fff;
  box-shadow:
    0 24px 64px -48px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.overview-hero__eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.34em;
  color: #9aa3b2;
}

.overview-hero__title {
  font-family: 'PingFang SC', 'Microsoft YaHei UI', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.86rem, 2.55vw, 2.42rem);
  line-height: 1.06;
  font-weight: 650;
  letter-spacing: -0.04em;
  color: #111827;
}

.overview-hero__lead {
  border-radius: 28px;
  padding: 1rem 1.2rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 14px 34px -30px rgba(15, 23, 42, 0.1);
}

.overview-hero__signal,
.overview-stage__stat {
  border-radius: 24px;
  padding: 1rem 1rem 1.05rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 14px 34px -30px rgba(15, 23, 42, 0.1);
}

.overview-stage__mesh,
.overview-stage__center,
.overview-stage__ring,
.overview-stage__arc {
  position: absolute;
}

.overview-stage__mesh {
  inset: 16% 12%;
  border-radius: 30px;
  background:
    linear-gradient(rgba(17, 24, 39, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 24, 39, 0.05) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 88%);
}

.overview-stage__center {
  inset: 50% auto auto 50%;
  width: 12rem;
  height: 12rem;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 28%, #fff, #f5f5f5 58%, #e5e7eb 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 24px 56px -42px rgba(15, 23, 42, 0.18);
}

.overview-stage__ring {
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
}

.overview-stage__ring--outer {
  width: 22rem;
  height: 10rem;
  border: 1px solid rgba(17, 24, 39, 0.14);
  rotate: -12deg;
}

.overview-stage__ring--inner {
  width: 17rem;
  height: 16rem;
  border: 1px solid rgba(163, 145, 118, 0.16);
  rotate: 28deg;
}

.overview-stage__arc {
  top: 50%;
  width: 11rem;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(17, 24, 39, 0.14), rgba(255, 255, 255, 0));
}

.overview-stage__arc--left {
  left: 4%;
}

.overview-stage__arc--right {
  right: 4%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(163, 145, 118, 0.2), rgba(255, 255, 255, 0));
}
</style>
