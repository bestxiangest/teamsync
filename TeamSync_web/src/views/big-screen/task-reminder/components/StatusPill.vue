<template>
  <span class="pill" :class="[`pill--${tone}`, { 'pill--solid': solid }]">
    <i v-if="dot" class="pill__dot"></i>
    {{ text }}
  </span>
</template>

<script setup lang="ts">
  import type { PillTone } from '../types'

  withDefaults(
    defineProps<{
      text: string
      tone?: PillTone
      dot?: boolean
      solid?: boolean
    }>(),
    {
      tone: 'neutral',
      dot: false,
      solid: false
    }
  )
</script>

<style scoped lang="scss">
  .pill {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    color: var(--pill-ink);
    white-space: nowrap;
    background: var(--pill-bg);
    border: 1px solid var(--pill-line);
    border-radius: 8px;
  }

  .pill--solid {
    color: #fff;
    background: var(--pill-ink);
    border-color: transparent;
  }

  .pill__dot {
    width: 6px;
    height: 6px;
    background: currentcolor;
    border-radius: 50%;
  }

  .pill--danger {
    --pill-ink: var(--ts-rose);
    --pill-bg: var(--ts-rose-soft);
    --pill-line: var(--ts-rose-line);
  }

  .pill--warning {
    --pill-ink: var(--ts-amber);
    --pill-bg: var(--ts-amber-soft);
    --pill-line: var(--ts-amber-line);
  }

  .pill--info {
    --pill-ink: var(--ts-cyan);
    --pill-bg: var(--ts-cyan-soft);
    --pill-line: var(--ts-cyan-line);
  }

  .pill--success {
    --pill-ink: var(--ts-emerald);
    --pill-bg: var(--ts-emerald-soft);
    --pill-line: var(--ts-emerald-line);
  }

  .pill--violet {
    --pill-ink: var(--ts-violet);
    --pill-bg: var(--ts-violet-soft);
    --pill-line: var(--ts-violet-line);
  }

  .pill--neutral {
    --pill-ink: var(--ts-ink-2);
    --pill-bg: rgb(100 116 139 / 12%);
    --pill-line: rgb(100 116 139 / 26%);
  }
</style>
