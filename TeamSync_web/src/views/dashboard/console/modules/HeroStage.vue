<template>
  <section class="hero-stage">
    <div class="hero-stage__copy">
      <article class="hero-stage__glass hero-stage__glass--lead">
        <span class="hero-stage__eyebrow">
          <span class="hero-stage__eyebrow-dot"></span>
          今日工作台
        </span>

        <div class="hero-stage__headline">
          <h1 class="hero-stage__title">{{ greeting }}</h1>
          <div class="hero-stage__title-ribbon">今天的协作重点已经浮现，先把最紧要的那一段推进下去。</div>
        </div>
      </article>

      <article class="hero-stage__glass hero-stage__glass--summary">
        <p class="hero-stage__summary">
          你当前还有 {{ stats.pendingTaskCount }} 项待办，其中 {{ insight.overdueTaskCount }} 项已经逾期，
          另有 {{ insight.dueSoonTaskCount }} 项会在 24 小时内到期。先处理任务，再观察项目负载和团队动态，节奏会更稳。
        </p>

        <div class="hero-stage__insight-strip">
          <div class="hero-stage__insight-pill">
            <span>完成率</span>
            <strong>{{ insight.completionRate }}%</strong>
          </div>
          <div class="hero-stage__insight-pill">
            <span>活跃项目</span>
            <strong>{{ insight.activeProjectCount }}</strong>
          </div>
          <div class="hero-stage__insight-pill">
            <span>近 7 日动态</span>
            <strong>{{ insight.activityCount7d }}</strong>
          </div>
        </div>
      </article>

      <div class="hero-stage__actions">
        <button
          v-for="item in quickActions"
          :key="item.key"
          class="hero-stage__action"
          type="button"
          @click="$emit('action', item.key)"
        >
          <span class="hero-stage__action-topline">
            <component :is="item.icon" class="hero-stage__action-icon" />
            <span>{{ item.caption }}</span>
          </span>
          <strong>{{ item.label }}</strong>
          <span class="hero-stage__action-value">{{ item.value }}</span>
          <ArrowRight class="hero-stage__action-arrow" />
        </button>
      </div>
    </div>

    <div class="hero-stage__visual">
      <div class="hero-stage__toolbar">
        <span class="hero-stage__toolbar-label">数据中枢</span>
        <ElButton class="hero-stage__refresh" link @click="$emit('refresh')">
          <ElIcon><RefreshRight /></ElIcon>
          <span>刷新数据</span>
        </ElButton>
      </div>

      <HeroScene :enabled="sceneEnabled" :is-dark="isDark" />

      <div class="hero-stage__metric-nebula">
        <button
          v-for="(item, index) in metricItems"
          :key="item.key"
          class="hero-stage__metric-node"
          :class="[`hero-stage__metric-node--${index + 1}`, `hero-stage__metric-node--${item.accent}`]"
          type="button"
          @click="$emit('select-metric', item.key)"
        >
          <span class="hero-stage__metric-core"></span>
          <span class="hero-stage__metric-eyebrow">{{ item.eyebrow }}</span>
          <strong class="hero-stage__metric-value">
            {{ item.value }}
            <small>{{ item.suffix }}</small>
          </strong>
          <span class="hero-stage__metric-label">{{ item.label }}</span>
          <span class="hero-stage__metric-hint">{{ item.hint }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowRight, RefreshRight } from '@element-plus/icons-vue'
import type { DashboardInsight, DashboardStats } from '@/api/dashboard'
import HeroScene from './HeroScene.vue'

interface HeroQuickAction {
  key: string
  label: string
  caption: string
  value: string
  icon: Component
}

interface HeroMetricItem {
  key: string
  eyebrow: string
  label: string
  value: number | string
  suffix?: string
  hint: string
  accent: 'ink' | 'stone' | 'slate' | 'rose'
}

defineProps<{
  greeting: string
  stats: DashboardStats
  insight: DashboardInsight
  quickActions: HeroQuickAction[]
  metricItems: HeroMetricItem[]
  isDark: boolean
  sceneEnabled: boolean
}>()

defineEmits<{
  action: [key: string]
  'select-metric': [key: string]
  refresh: []
}>()
</script>

<style scoped lang="scss">
.hero-stage {
  display: grid;
  grid-template-columns: minmax(22rem, 0.94fr) minmax(0, 1.26fr);
  gap: 1.2rem;
}

.hero-stage__copy,
.hero-stage__visual {
  position: relative;
  min-height: 100%;
}

.hero-stage__glass {
  position: relative;
  overflow: hidden;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 18px 40px -34px rgba(15, 23, 42, 0.14);
}

.hero-stage__glass::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.6), transparent 42%),
    radial-gradient(circle at 100% 0%, rgba(163, 145, 118, 0.08), transparent 24%);
  pointer-events: none;
}

.hero-stage__glass--lead {
  padding: 1.45rem 1.55rem 1.55rem;
  border-radius: 2.4rem;
}

.hero-stage__glass--summary {
  margin-top: 1rem;
  padding: 1.1rem 1.15rem 1.15rem;
  border-radius: 2rem;
}

.hero-stage__eyebrow,
.hero-stage__toolbar-label,
.hero-stage__metric-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--console-muted);
}

.hero-stage__eyebrow-dot {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--console-ink), var(--console-stone));
}

.hero-stage__headline {
  margin-top: 1rem;
}

.hero-stage__title {
  margin: 0;
  font-family: var(--console-display-font);
  font-size: clamp(2.85rem, 4.9vw, 4.85rem);
  font-weight: 650;
  line-height: 0.94;
  letter-spacing: -0.06em;
  color: var(--console-text-strong);
}

.hero-stage__title-ribbon {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  min-height: 3rem;
  padding: 0.72rem 1rem;
  border-radius: 999px;
  background: #f6f7f9;
  font-size: clamp(0.98rem, 1.45vw, 1.18rem);
  font-weight: 600;
  line-height: 1.4;
  color: var(--console-text-soft);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.hero-stage__summary {
  margin: 0;
  font-size: 0.97rem;
  line-height: 1.9;
  color: var(--console-text-soft);
}

.hero-stage__insight-strip {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.hero-stage__insight-pill {
  padding: 0.84rem 0.92rem;
  border-radius: 1.15rem;
  background: #f8f9fb;
}

.hero-stage__insight-pill span {
  display: block;
  font-size: 0.8rem;
  color: var(--console-muted);
}

.hero-stage__insight-pill strong {
  display: block;
  margin-top: 0.34rem;
  font-family: var(--console-display-font);
  font-size: 1.36rem;
  letter-spacing: -0.04em;
  color: var(--console-text-strong);
}

.hero-stage__actions {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.hero-stage__action {
  position: relative;
  min-height: 7.4rem;
  padding: 1rem 1.05rem;
  border-radius: 1.65rem;
  background: #fff;
  text-align: left;
  color: inherit;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    0 16px 34px -30px rgba(15, 23, 42, 0.12);
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.hero-stage__action:hover {
  transform: translateY(-0.18rem);
  background: #fafafa;
  box-shadow: 0 18px 38px -30px rgba(15, 23, 42, 0.16);
}

.hero-stage__action-topline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--console-muted);
}

.hero-stage__action-icon {
  width: 1rem;
  height: 1rem;
  color: var(--console-ink);
}

.hero-stage__action strong {
  display: block;
  margin-top: 0.72rem;
  font-size: 1rem;
  color: var(--console-text-strong);
}

.hero-stage__action-value {
  display: block;
  margin-top: 0.26rem;
  font-family: var(--console-display-font);
  font-size: 1.6rem;
  font-weight: 650;
  letter-spacing: -0.04em;
  color: var(--console-text-strong);
}

.hero-stage__action-arrow {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  width: 1rem;
  height: 1rem;
  color: var(--console-text-strong);
}

.hero-stage__visual {
  min-height: 37rem;
  padding: 1rem;
  border-radius: 2.6rem;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 18px 40px -34px rgba(15, 23, 42, 0.14);
  overflow: hidden;
}

.hero-stage__toolbar {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.hero-stage__refresh {
  color: var(--console-ink);
}

.hero-stage__metric-nebula {
  position: absolute;
  inset: 4.1rem 1rem 1rem;
  z-index: 2;
  pointer-events: none;
}

.hero-stage__metric-node {
  position: absolute;
  width: 10.4rem;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  color: inherit;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.24s ease;
}

.hero-stage__metric-node:hover {
  transform: translateY(-0.18rem);
}

.hero-stage__metric-core {
  position: relative;
  display: block;
  width: 4.3rem;
  height: 4.3rem;
  border-radius: 50%;
  box-shadow:
    inset 0 0.08rem 0.4rem rgba(255, 255, 255, 0.52),
    0 0.9rem 1.6rem rgba(15, 23, 42, 0.12);
}

.hero-stage__metric-core::before {
  content: '';
  position: absolute;
  inset: 0.46rem;
  border-radius: 50%;
  background: radial-gradient(circle at 28% 28%, rgba(255, 255, 255, 0.94), transparent 46%);
}

.hero-stage__metric-node--ink .hero-stage__metric-core {
  background: radial-gradient(circle at 30% 26%, rgba(255, 255, 255, 0.98), rgba(79, 125, 255, 0.3) 42%, rgba(255, 255, 255, 0.1));
}

.hero-stage__metric-node--stone .hero-stage__metric-core {
  background: radial-gradient(circle at 30% 26%, rgba(255, 249, 242, 0.98), rgba(216, 162, 77, 0.34) 42%, rgba(255, 255, 255, 0.1));
}

.hero-stage__metric-node--slate .hero-stage__metric-core {
  background: radial-gradient(circle at 30% 26%, rgba(255, 255, 255, 0.98), rgba(127, 152, 216, 0.28) 42%, rgba(255, 255, 255, 0.1));
}

.hero-stage__metric-node--rose .hero-stage__metric-core {
  background: radial-gradient(circle at 30% 26%, rgba(255, 244, 245, 0.98), rgba(219, 108, 122, 0.28) 42%, rgba(255, 255, 255, 0.1));
}

.hero-stage__metric-value {
  display: block;
  margin-top: 0.58rem;
  font-family: var(--console-display-font);
  font-size: 2rem;
  font-weight: 650;
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: var(--console-text-strong);
}

.hero-stage__metric-value small {
  margin-left: 0.15rem;
  font-size: 0.82rem;
  font-weight: 600;
}

.hero-stage__metric-label {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--console-text-strong);
}

.hero-stage__metric-hint {
  display: block;
  margin-top: 0.28rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--console-muted);
}

.hero-stage__metric-node--1 {
  top: 11%;
  left: 2%;
}

.hero-stage__metric-node--2 {
  top: 2%;
  right: 8%;
}

.hero-stage__metric-node--3 {
  right: 1%;
  bottom: 18%;
}

.hero-stage__metric-node--4 {
  left: 12%;
  bottom: 9%;
}

@media (width <= 1100px) {
  .hero-stage {
    grid-template-columns: 1fr;
  }

  .hero-stage__visual {
    min-height: 40rem;
  }
}

@media (width <= 760px) {
  .hero-stage__glass--lead,
  .hero-stage__glass--summary,
  .hero-stage__visual {
    border-radius: 1.8rem;
  }

  .hero-stage__insight-strip,
  .hero-stage__actions {
    grid-template-columns: 1fr;
  }

  .hero-stage__metric-nebula {
    position: relative;
    inset: auto;
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .hero-stage__metric-node {
    position: relative;
    inset: auto;
    width: auto;
  }
}
</style>
