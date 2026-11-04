<template>
  <header class="topbar">
    <div class="topbar__brand">
      <span class="topbar__logo">
        <img :src="logoUrl" alt="华睿源" />
      </span>
      <div class="topbar__titles">
        <h1>华睿源项目进度看板</h1>
        <p>运营管理中心 · 项目进度公开摘要 · 数据每 60 秒自动刷新</p>
      </div>
    </div>

    <nav class="topbar__decks">
      <button
        v-for="(deck, index) in decks"
        :key="deck.key"
        class="deck-tab"
        :class="{ 'deck-tab--active': index === activeIndex }"
        type="button"
        @click="emit('select', index)"
      >
        <i>{{ index + 1 }}</i>
        {{ deck.title }}
        <span
          v-if="index === activeIndex"
          class="deck-tab__progress"
          :style="{ width: `${Math.round(progress * 100)}%` }"
        ></span>
      </button>
    </nav>

    <div class="topbar__right">
      <div class="topbar__clock">
        <strong>{{ timeText }}</strong>
        <div>
          <span>{{ weekText }}</span>
          <span>{{ dateText }}</span>
        </div>
      </div>

      <div class="topbar__controls">
        <button
          type="button"
          :title="paused ? '继续轮播（空格）' : '暂停轮播（空格）'"
          @click="emit('toggle-play')"
        >
          <component :is="paused ? VideoPlay : VideoPause" />
        </button>
        <button type="button" title="全屏（F）" @click="emit('toggle-fullscreen')">
          <FullScreen />
        </button>
        <button type="button" title="立即刷新（R）" @click="emit('refresh')">
          <Refresh />
        </button>
        <button type="button" title="退出（Esc）" @click="emit('exit')">
          <Close />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Close, FullScreen, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'
  import logoUrl from '@/assets/images/common/logo.webp'

  const props = defineProps<{
    decks: { key: string; title: string }[]
    activeIndex: number
    progress: number
    now: Date
    paused: boolean
  }>()

  const emit = defineEmits<{
    (e: 'select', index: number): void
    (e: 'toggle-play'): void
    (e: 'toggle-fullscreen'): void
    (e: 'refresh'): void
    (e: 'exit'): void
  }>()

  const WEEK_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const pad = (value: number) => String(value).padStart(2, '0')

  const timeText = computed(
    () =>
      `${pad(props.now.getHours())}:${pad(props.now.getMinutes())}:${pad(props.now.getSeconds())}`
  )
  const weekText = computed(() => WEEK_NAMES[props.now.getDay()])
  const dateText = computed(
    () => `${props.now.getFullYear()}/${pad(props.now.getMonth() + 1)}/${pad(props.now.getDate())}`
  )
</script>

<style scoped lang="scss">
  .topbar {
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 24px;
    align-items: center;
    height: 76px;
  }

  .topbar__brand {
    display: flex;
    gap: 16px;
    align-items: center;
    min-width: 0;
  }

  .topbar__logo {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(160deg, rgb(255 255 255 / 92%), rgb(15 23 42 / 4%));
    border: 1px solid var(--ts-line-2);
    border-radius: 14px;

    img {
      width: 30px;
      height: 30px;
      object-fit: contain;
    }
  }

  .topbar__titles {
    min-width: 0;

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      line-height: 1.1;
      color: var(--ts-ink);
      text-shadow: 0 0 30px var(--ts-cyan-soft);
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    p {
      margin: 5px 0 0;
      overflow: hidden;
      font-size: 13px;
      font-weight: 600;
      color: var(--ts-ink-3);
      text-overflow: ellipsis;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
  }

  .topbar__decks {
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
    padding: 6px;
    background: rgb(255 255 255 / 72%);
    border: 1px solid var(--ts-line);
    border-radius: 14px;
  }

  .deck-tab {
    position: relative;
    display: flex;
    gap: 8px;
    align-items: center;
    height: 36px;
    padding: 0 14px;
    overflow: hidden;
    font-size: 15px;
    font-weight: 700;
    color: var(--ts-ink-2);
    letter-spacing: 0.03em;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 10px;
    transition:
      color 200ms ease,
      background-color 200ms ease;

    i {
      display: grid;
      place-items: center;
      width: 18px;
      height: 18px;
      font-size: 11px;
      font-style: normal;
      font-weight: 800;
      color: var(--ts-ink-3);
      background: rgb(15 23 42 / 8%);
      border-radius: 6px;
    }

    &:hover {
      color: var(--ts-ink);
      background: rgb(15 23 42 / 5%);
    }
  }

  .deck-tab--active {
    color: #fff;
    background: var(--ts-cyan);
    box-shadow: 0 6px 20px var(--ts-cyan-line);

    i {
      color: #fff;
      background: rgb(255 255 255 / 18%);
    }

    &:hover {
      color: #fff;
      background: var(--ts-cyan);
    }
  }

  .deck-tab__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgb(255 255 255 / 55%);
    transition: width 140ms linear;
  }

  .topbar__right {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: flex-end;
  }

  .topbar__clock {
    display: flex;
    gap: 12px;
    align-items: center;

    strong {
      font-size: 36px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      color: var(--ts-ink);
      letter-spacing: 0.01em;
    }

    div {
      display: grid;
      gap: 5px;
      padding-left: 12px;
      font-size: 14px;
      font-weight: 650;
      line-height: 1.1;
      color: var(--ts-ink-2);
      border-left: 1px solid var(--ts-line-2);
    }
  }

  .topbar__controls {
    display: flex;
    gap: 6px;
    pointer-events: var(--ts-controls-events, auto);
    opacity: var(--ts-controls-opacity, 1);
    transition: opacity 320ms ease;

    button {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      color: var(--ts-ink-2);
      cursor: pointer;
      background: rgb(15 23 42 / 5%);
      border: 1px solid var(--ts-line);
      border-radius: 10px;
      transition:
        color 180ms ease,
        border-color 180ms ease,
        background-color 180ms ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        color: var(--ts-cyan);
        background: var(--ts-cyan-soft);
        border-color: var(--ts-cyan-line);
      }
    }
  }
</style>
