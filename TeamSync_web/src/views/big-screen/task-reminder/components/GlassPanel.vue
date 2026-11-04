<template>
  <section
    class="panel"
    :class="[`panel--${accent}`, { 'panel--clickable': clickable }]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleOpen"
    @keydown.enter="handleOpen"
    @keydown.space.prevent="handleOpen"
  >
    <header v-if="title" class="panel__head">
      <span class="panel__mark"></span>
      <h2 class="panel__title">{{ title }}</h2>
      <span v-if="hint" class="panel__hint">{{ hint }}</span>
      <div class="panel__extra">
        <slot name="extra" />
      </div>
      <span v-if="clickable" class="panel__more">查看全部 ›</span>
    </header>
    <div class="panel__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { PanelAccent } from '../types'

  const props = withDefaults(
    defineProps<{
      title?: string
      hint?: string
      accent?: PanelAccent
      /** 开启后整块面板可点击，打开明细弹层 */
      clickable?: boolean
    }>(),
    {
      title: '',
      hint: '',
      accent: 'cyan',
      clickable: false
    }
  )

  const emit = defineEmits<{ open: [] }>()

  const handleOpen = () => {
    if (props.clickable) {
      emit('open')
    }
  }
</script>

<style scoped lang="scss">
  .panel {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 16px 18px 18px;
    overflow: hidden;
    background:
      radial-gradient(440px 300px at 0 0, var(--panel-glow) 0%, transparent 72%),
      linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    border: 1px solid var(--ts-line);
    border-radius: 18px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 90%),
      0 18px 40px rgb(15 23 42 / 8%);
  }

  /* 左上角标记，弱化的仪表盘质感 */
  .panel::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 26px;
    height: 26px;
    content: '';
    border-top: 2px solid var(--panel-accent);
    border-left: 2px solid var(--panel-accent);
    border-top-left-radius: 18px;
    opacity: 0.55;
  }

  .panel__head {
    display: flex;
    flex: 0 0 auto;
    gap: 10px;
    align-items: center;
    padding-bottom: 12px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--ts-line);
  }

  .panel__mark {
    width: 4px;
    height: 18px;
    background: var(--panel-accent);
    border-radius: 2px;
    box-shadow: 0 0 12px var(--panel-accent);
  }

  .panel__title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--ts-ink);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .panel__hint {
    font-size: 13px;
    font-weight: 600;
    color: var(--ts-ink-3);
    white-space: nowrap;
  }

  .panel__extra {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-left: auto;
  }

  .panel__more {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 700;
    color: var(--ts-ink-3);
    letter-spacing: 0.04em;
    white-space: nowrap;
    background: rgb(15 23 42 / 4%);
    border: 1px solid var(--ts-line);
    border-radius: 8px;
    transition:
      color 220ms ease,
      border-color 220ms ease;
  }

  .panel--clickable {
    cursor: zoom-in;
    transition:
      border-color 220ms ease,
      box-shadow 220ms ease;
  }

  .panel--clickable:hover,
  .panel--clickable:focus-visible {
    border-color: var(--panel-accent);
    outline: none;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 90%),
      0 20px 46px rgb(15 23 42 / 12%);
  }

  .panel--clickable:hover .panel__more,
  .panel--clickable:focus-visible .panel__more {
    color: var(--panel-accent);
    border-color: var(--panel-accent);
  }

  .panel__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .panel--cyan {
    --panel-accent: var(--ts-cyan);
    --panel-glow: var(--ts-cyan-soft);
  }

  .panel--amber {
    --panel-accent: var(--ts-amber);
    --panel-glow: var(--ts-amber-soft);
  }

  .panel--rose {
    --panel-accent: var(--ts-rose);
    --panel-glow: var(--ts-rose-soft);
  }

  .panel--emerald {
    --panel-accent: var(--ts-emerald);
    --panel-glow: var(--ts-emerald-soft);
  }

  .panel--violet {
    --panel-accent: var(--ts-violet);
    --panel-glow: var(--ts-violet-soft);
  }

  .panel--indigo {
    --panel-accent: var(--ts-indigo);
    --panel-glow: var(--ts-indigo-soft);
  }
</style>
