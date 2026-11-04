<template>
  <!-- 舞台与弹层在同一棵组件树里，defer 让 Teleport 等父级 DOM 挂载后再查找目标 -->
  <Teleport to=".ts-screen__stage" defer>
    <Transition name="detail">
      <div v-if="open" class="detail" @click.self="emit('close')">
        <section class="detail__panel" :class="`detail__panel--${accent}`">
          <header class="detail__head">
            <span class="detail__mark"></span>
            <h2 class="detail__title">{{ title }}</h2>
            <span v-if="hint" class="detail__hint">{{ hint }}</span>
            <button type="button" class="detail__close" @click="emit('close')">
              关闭
              <em>Esc</em>
            </button>
          </header>
          <div class="detail__body">
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from 'vue'
  import type { PanelAccent } from '../types'

  const props = withDefaults(
    defineProps<{
      open: boolean
      title: string
      hint?: string
      accent?: PanelAccent
    }>(),
    {
      hint: '',
      accent: 'cyan'
    }
  )

  const emit = defineEmits<{ close: [] }>()

  /** 捕获阶段拦截：弹层打开时独占键盘，避免大屏快捷键把正在看的明细切走 */
  const handleKeydown = (event: KeyboardEvent) => {
    if (!props.open) {
      return
    }

    event.stopPropagation()

    if (event.key === 'Escape') {
      event.preventDefault()
      emit('close')
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown, true))
  onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown, true))
</script>

<style scoped lang="scss">
  /* 通过 Teleport 挂到舞台内：absolute 覆盖整个舞台，并跟随 zoom 一起缩放 */
  .detail {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 28px 32px;
    background: rgb(15 23 42 / 35%);
    backdrop-filter: blur(7px);
  }

  .detail__panel {
    display: flex;
    flex-direction: column;
    width: min(1680px, 100%);
    max-height: 100%;
    padding: 20px 24px 22px;
    overflow: hidden;
    background:
      radial-gradient(620px 380px at 0 0, var(--panel-glow) 0%, transparent 70%),
      linear-gradient(180deg, #fff 0%, #f1f5f9 100%);
    border: 1px solid var(--panel-accent);
    border-radius: 20px;
    box-shadow: 0 40px 90px rgb(15 23 42 / 18%);
  }

  .detail__head {
    display: flex;
    flex: 0 0 auto;
    gap: 12px;
    align-items: center;
    padding-bottom: 14px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--ts-line-2);
  }

  .detail__mark {
    width: 5px;
    height: 24px;
    background: var(--panel-accent);
    border-radius: 3px;
    box-shadow: 0 0 14px var(--panel-accent);
  }

  .detail__title {
    margin: 0;
    font-size: 26px;
    font-weight: 800;
    color: var(--ts-ink);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .detail__hint {
    font-size: 15px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    color: var(--ts-ink-2);
    white-space: nowrap;
  }

  .detail__close {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    height: 34px;
    padding: 0 14px;
    margin-left: auto;
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    color: var(--ts-ink-2);
    cursor: pointer;
    background: rgb(15 23 42 / 5%);
    border: 1px solid var(--ts-line-2);
    border-radius: 10px;
    transition:
      color 200ms ease,
      border-color 200ms ease;

    em {
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      color: var(--ts-ink-3);
    }

    &:hover {
      color: var(--panel-accent);
      border-color: var(--panel-accent);
    }
  }

  /* 明细里的信息一次铺开，用真实滚动条替代外面的自动轮播 */
  .detail__body {
    flex: 1;
    min-height: 0;
    padding-right: 8px;
    overflow: hidden auto;
    overscroll-behavior: contain;
    scrollbar-color: var(--panel-accent) rgb(15 23 42 / 6%);
    scrollbar-width: thin;
  }

  .detail__body::-webkit-scrollbar {
    width: 8px;
  }

  .detail__body::-webkit-scrollbar-track {
    background: rgb(15 23 42 / 5%);
    border-radius: 99px;
  }

  .detail__body::-webkit-scrollbar-thumb {
    background: var(--panel-accent);
    border-radius: 99px;
    opacity: 0.7;
  }

  .detail__panel--cyan {
    --panel-accent: var(--ts-cyan);
    --panel-glow: var(--ts-cyan-soft);
  }

  .detail__panel--amber {
    --panel-accent: var(--ts-amber);
    --panel-glow: var(--ts-amber-soft);
  }

  .detail__panel--rose {
    --panel-accent: var(--ts-rose);
    --panel-glow: var(--ts-rose-soft);
  }

  .detail__panel--emerald {
    --panel-accent: var(--ts-emerald);
    --panel-glow: var(--ts-emerald-soft);
  }

  .detail__panel--violet {
    --panel-accent: var(--ts-violet);
    --panel-glow: var(--ts-violet-soft);
  }

  .detail__panel--indigo {
    --panel-accent: var(--ts-indigo);
    --panel-glow: var(--ts-indigo-soft);
  }

  .detail-enter-active,
  .detail-leave-active {
    transition: opacity 240ms ease;

    .detail__panel {
      transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  .detail-enter-from,
  .detail-leave-to {
    opacity: 0;

    .detail__panel {
      transform: scale(0.97);
    }
  }
</style>
