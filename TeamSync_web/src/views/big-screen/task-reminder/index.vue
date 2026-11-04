<template>
  <div class="ts-screen" :class="{ 'ts-screen--idle': idle }">
    <div class="ts-screen__stage" :style="stageStyle">
      <ScreenTopBar
        :decks="decks"
        :active-index="activeIndex"
        :progress="progress"
        :now="now"
        :paused="paused"
        @select="jumpTo"
        @toggle-play="paused = !paused"
        @toggle-fullscreen="toggleFullscreen"
        @refresh="refresh"
        @exit="exitScreen"
      />

      <AlertRail v-if="overdueTasks.length > 0" :tasks="overdueTasks" />

      <main class="ts-screen__deck">
        <Transition name="deck" mode="out-in">
          <DeckToday
            v-if="activeIndex === 0"
            key="today"
            :data="data"
            :backlog="backlogSegments"
            :health="health"
            @detail="detailOpen = $event"
          />
          <DeckTeam
            v-else-if="activeIndex === 1"
            key="team"
            :data="data"
            @detail="detailOpen = $event"
          />
          <DeckOutlook
            v-else
            key="outlook"
            :data="data"
            :trend="weekTrend"
            @detail="detailOpen = $event"
          />
        </Transition>
      </main>

      <ScreenBottomBar :last-sync-at="lastSyncAt" :sync-failed="syncFailed" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import '@fontsource/manrope/latin-500.css'
  import '@fontsource/manrope/latin-700.css'
  import '@fontsource/manrope/latin-800.css'
  import AlertRail from './components/AlertRail.vue'
  import ScreenBottomBar from './components/ScreenBottomBar.vue'
  import ScreenTopBar from './components/ScreenTopBar.vue'
  import { useAutoFit } from './composables/useAutoFit'
  import { useScreenData } from './composables/useScreenData'
  import DeckOutlook from './decks/DeckOutlook.vue'
  import DeckTeam from './decks/DeckTeam.vue'
  import DeckToday from './decks/DeckToday.vue'
  import type { DeckConfig } from './types'

  /** 单页停留时长 */
  const ROTATE_MS = 22_000
  const TICK_MS = 120
  /** 鼠标静止多久后隐藏操作按钮 */
  const IDLE_MS = 5_000

  const router = useRouter()
  const { stageStyle } = useAutoFit()
  const {
    data,
    backlogSegments,
    health,
    overdueTasks,
    weekTrend,
    now,
    lastSyncAt,
    syncFailed,
    refresh
  } = useScreenData()

  const decks: DeckConfig[] = [
    { key: 'today', title: '今日战情' },
    { key: 'team', title: '团队负载' },
    { key: 'outlook', title: '七日前瞻' }
  ]

  const activeIndex = ref(0)
  const progress = ref(0)
  const paused = ref(false)
  const idle = ref(false)
  /** 某个面板的明细弹层是否展开：展开期间不轮播，否则弹层会被整页切换卸载 */
  const detailOpen = ref(false)

  let elapsed = 0
  let lastTickAt = performance.now()
  let lastActivityAt = Date.now()
  let rotateTimer: ReturnType<typeof setInterval> | null = null
  let idleTimer: ReturnType<typeof setInterval> | null = null

  const jumpTo = (index: number) => {
    activeIndex.value = (index + decks.length) % decks.length
    elapsed = 0
    lastTickAt = performance.now()
    progress.value = 0
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }

    void document.documentElement.requestFullscreen?.()
  }

  const exitScreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    }

    if (window.opener && !window.opener.closed) {
      window.close()
      return
    }

    if (window.history.length > 1) {
      router.back()
      return
    }

    void router.push('/dashboard/console')
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const deckShortcut = Number(event.key)

    if (deckShortcut >= 1 && deckShortcut <= decks.length) {
      jumpTo(deckShortcut - 1)
      return
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        jumpTo(activeIndex.value + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        jumpTo(activeIndex.value - 1)
        break
      case ' ':
        event.preventDefault()
        paused.value = !paused.value
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        break
      case 'r':
      case 'R':
        void refresh()
        break
      case 'Escape':
        if (!document.fullscreenElement) {
          exitScreen()
        }
        break
      default:
        break
    }
  }

  const handleActivity = () => {
    lastActivityAt = Date.now()
    idle.value = false
  }

  onMounted(() => {
    lastTickAt = performance.now()

    rotateTimer = setInterval(() => {
      const tickAt = performance.now()
      const delta = Math.min(tickAt - lastTickAt, 1000)
      lastTickAt = tickAt

      /** 页面不可见时浏览器会节流定时器，回到前台不该突然连翻几页 */
      if (document.visibilityState === 'hidden' || paused.value || detailOpen.value) {
        return
      }

      elapsed += delta

      if (elapsed >= ROTATE_MS) {
        elapsed %= ROTATE_MS
        activeIndex.value = (activeIndex.value + 1) % decks.length
      }

      progress.value = Math.min(elapsed / ROTATE_MS, 1)
    }, TICK_MS)

    idleTimer = setInterval(() => {
      idle.value = Date.now() - lastActivityAt > IDLE_MS
    }, 1000)

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('mousemove', handleActivity)
  })

  onBeforeUnmount(() => {
    if (rotateTimer) {
      clearInterval(rotateTimer)
      rotateTimer = null
    }

    if (idleTimer) {
      clearInterval(idleTimer)
      idleTimer = null
    }

    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('mousemove', handleActivity)
  })
</script>

<style scoped lang="scss">
  .ts-screen {
    --ts-bg: #eef2f7;
    --ts-inset: #fff;
    --ts-line: rgb(15 23 42 / 8%);
    --ts-line-2: rgb(15 23 42 / 14%);
    --ts-ink: #0f172a;
    --ts-ink-2: #475569;
    --ts-ink-3: #94a3b8;
    --ts-cyan: #0891b2;
    --ts-cyan-soft: rgb(8 145 178 / 12%);
    --ts-cyan-line: rgb(8 145 178 / 28%);
    --ts-indigo: #4f46e5;
    --ts-indigo-soft: rgb(79 70 229 / 12%);
    --ts-indigo-line: rgb(79 70 229 / 28%);
    --ts-amber: #d97706;
    --ts-amber-soft: rgb(217 119 6 / 12%);
    --ts-amber-line: rgb(217 119 6 / 28%);
    --ts-rose: #e11d48;
    --ts-rose-soft: rgb(225 29 72 / 12%);
    --ts-rose-line: rgb(225 29 72 / 28%);
    --ts-emerald: #059669;
    --ts-emerald-soft: rgb(5 150 105 / 12%);
    --ts-emerald-line: rgb(5 150 105 / 28%);
    --ts-violet: #7c3aed;
    --ts-violet-soft: rgb(124 58 237 / 12%);
    --ts-violet-line: rgb(124 58 237 / 28%);
    --ts-controls-opacity: 1;

    position: fixed;
    inset: 0;
    z-index: 3000;
    display: grid;
    place-items: center;
    overflow: hidden;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    font-family:
      Manrope,
      -apple-system,
      'PingFang SC',
      'Microsoft YaHei',
      sans-serif;
    color: var(--ts-ink);
    color-scheme: light;
    background:
      radial-gradient(1200px 720px at 10% -12%, rgb(99 102 241 / 10%), transparent 62%),
      radial-gradient(1100px 820px at 94% 112%, rgb(34 211 238 / 10%), transparent 64%),
      var(--ts-bg);
  }

  /* 底纹网格与四周压暗，让面板从背景里浮出来 */
  .ts-screen::before,
  .ts-screen::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
  }

  .ts-screen::before {
    background-image:
      linear-gradient(rgb(15 23 42 / 4%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(15 23 42 / 4%) 1px, transparent 1px);
    background-size: 58px 58px;
  }

  .ts-screen::after {
    background: radial-gradient(125% 95% at 50% 50%, transparent 52%, rgb(15 23 42 / 8%) 100%);
  }

  .ts-screen--idle {
    --ts-controls-opacity: 0;
    --ts-controls-events: none;
  }

  .ts-screen__stage {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 26px;
    transform-origin: center center;
  }

  .ts-screen__deck {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  .deck-enter-active,
  .deck-leave-active {
    transition:
      opacity 320ms ease,
      transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .deck-enter-from {
    opacity: 0;
    transform: translateY(16px);
  }

  .deck-leave-to {
    opacity: 0;
    transform: translateY(-16px);
  }
</style>
