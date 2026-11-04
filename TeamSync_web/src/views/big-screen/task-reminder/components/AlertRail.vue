<template>
  <div class="rail">
    <div class="rail__badge">
      <i class="rail__pulse"></i>
      逾期告警
      <b>{{ tasks.length }}</b>
    </div>

    <div ref="viewportRef" class="rail__viewport">
      <div
        class="rail__track"
        :class="{ 'rail__track--marquee': scrolling }"
        :style="{ animationDuration: `${duration}s` }"
      >
        <div v-for="half in scrolling ? 2 : 1" :key="half" class="rail__half">
          <span v-for="task in tasks" :key="`${half}-${task.id}`" class="rail__item">
            <b>{{ task.taskName }}</b>
            <em>{{ task.projectName }}</em>
            <em>{{ task.assigneeName }}</em>
            <strong>逾期 {{ overdueText(task) }}</strong>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import type { UrgentTaskItem } from '@/api/big-screen'
  import { formatCountdown, useScreenNow } from '../composables/useScreenClock'

  /** 滚动速度，像素 / 秒 */
  const SPEED = 62

  const props = defineProps<{
    tasks: UrgentTaskItem[]
  }>()

  const now = useScreenNow()
  const viewportRef = ref<HTMLElement>()
  const scrolling = ref(false)
  const duration = ref(30)

  /** 告警条也跟统一时钟走；旧接口没有 dueTime 时回退到后端文案 */
  const overdueText = (task: UrgentTaskItem) =>
    formatCountdown(task.dueTime, now.value, { overduePrefix: '' }) ??
    task.remainingTime.replace('-', '')

  let observer: ResizeObserver | null = null

  /** 内容装不满一屏时不滚动，避免出现明显的空档与截断 */
  const measure = () => {
    const viewport = viewportRef.value
    const half = viewport?.querySelector<HTMLElement>('.rail__half')

    if (!viewport || !half) {
      return
    }

    const width = half.scrollWidth
    scrolling.value = width > viewport.clientWidth + 4
    duration.value = Math.max(width / SPEED, 12)
  }

  onMounted(() => {
    measure()

    if (viewportRef.value) {
      observer = new ResizeObserver(measure)
      observer.observe(viewportRef.value)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  watch(() => props.tasks, measure, { deep: true, flush: 'post' })
</script>

<style scoped lang="scss">
  .rail {
    display: flex;
    flex: 0 0 auto;
    gap: 16px;
    align-items: center;
    height: 40px;
    padding-right: 14px;
    overflow: hidden;
    background: linear-gradient(90deg, var(--ts-rose-soft) 0%, rgb(15 23 42 / 3%) 42%);
    border: 1px solid var(--ts-rose-line);
    border-radius: 14px;
  }

  .rail__badge {
    display: flex;
    flex: 0 0 auto;
    gap: 9px;
    align-items: center;
    height: 100%;
    padding: 0 14px;
    font-size: 14px;
    font-weight: 800;
    color: var(--ts-rose);
    letter-spacing: 0.04em;
    background: var(--ts-rose-soft);
    border-right: 1px solid var(--ts-rose-line);

    b {
      padding: 1px 7px;
      font-size: 14px;
      font-variant-numeric: tabular-nums;
      color: #fff;
      background: var(--ts-rose);
      border-radius: 6px;
    }
  }

  .rail__pulse {
    width: 9px;
    height: 9px;
    background: var(--ts-rose);
    border-radius: 50%;
    animation: rail-pulse 2s ease-in-out infinite;
  }

  .rail__viewport {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .rail__track {
    display: flex;
    width: max-content;
  }

  .rail__track--marquee {
    animation-name: rail-marquee;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .rail__half {
    display: flex;
    align-items: center;
  }

  .rail__item {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    padding: 0 20px;
    font-size: 14px;
    color: var(--ts-ink-2);
    white-space: nowrap;

    b {
      font-weight: 750;
      color: var(--ts-ink);
    }

    em {
      font-style: normal;
      font-weight: 600;
    }

    em::before {
      margin-right: 12px;
      color: var(--ts-ink-3);
      content: '·';
    }

    strong {
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--ts-rose);
    }
  }

  @keyframes rail-marquee {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      transform: translate3d(-50%, 0, 0);
    }
  }

  @keyframes rail-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 var(--ts-rose-line);
      opacity: 1;
    }

    50% {
      box-shadow: 0 0 0 7px transparent;
      opacity: 0.45;
    }
  }
</style>
