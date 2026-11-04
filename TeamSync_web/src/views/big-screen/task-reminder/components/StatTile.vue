<template>
  <article class="tile" :class="`tile--${item.tone}`">
    <div class="tile__top">
      <p class="tile__label">{{ item.label }}</p>
      <span class="tile__icon">
        <component :is="iconComponent" />
      </span>
    </div>

    <p class="tile__value">
      <strong>{{ displayValue }}</strong>
      <em v-if="suffix">{{ suffix }}</em>
    </p>

    <p class="tile__caption">
      <i class="tile__caption-dot"></i>
      {{ item.trendText }}
    </p>
  </article>
</template>

<script setup lang="ts">
  import { computed, type Component } from 'vue'
  import {
    Calendar,
    CircleCheckFilled,
    Clock,
    DataLine,
    Folder,
    Refresh,
    Trophy,
    User,
    UserFilled,
    WarningFilled
  } from '@element-plus/icons-vue'
  import type { KpiCardItem, KpiIconKey } from '@/api/big-screen'
  import { useCountUp } from '../composables/useCountUp'

  const props = withDefaults(
    defineProps<{
      item: KpiCardItem
      suffix?: string
    }>(),
    { suffix: '' }
  )

  const iconMap: Record<KpiIconKey, Component> = {
    task: DataLine,
    calendar: Calendar,
    clock: Clock,
    warning: WarningFilled,
    refresh: Refresh,
    folder: Folder,
    user: User,
    crown: Trophy,
    check: CircleCheckFilled,
    team: UserFilled
  }

  const iconComponent = computed(() => iconMap[props.item.icon] ?? DataLine)
  const displayValue = useCountUp(computed(() => props.item.value))
</script>

<style scoped lang="scss">
  .tile {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
    padding: 10px 14px;
    overflow: hidden;
    background:
      radial-gradient(90% 120% at 100% 0, var(--tile-soft) 0%, transparent 62%),
      linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    border: 1px solid var(--ts-line);
    border-radius: 14px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 90%),
      0 16px 34px rgb(15 23 42 / 8%);
  }

  .tile::before {
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    width: 3px;
    content: '';
    background: var(--tile-ink);
    border-radius: 0 3px 3px 0;
    box-shadow: 0 0 14px var(--tile-ink);
  }

  .tile__top {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .tile__label {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: 14px;
    font-weight: 700;
    color: var(--ts-ink-2);
    text-overflow: ellipsis;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .tile__icon {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--tile-ink);
    background: var(--tile-soft);
    border: 1px solid var(--tile-line);
    border-radius: 8px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .tile__value {
    display: flex;
    gap: 4px;
    align-items: baseline;
    margin: 0;
    font-variant-numeric: tabular-nums;
    color: var(--ts-ink);

    strong {
      font-size: 34px;
      font-weight: 800;
      line-height: 1;
      text-shadow: 0 0 22px var(--tile-soft);
      letter-spacing: -0.02em;
    }

    em {
      font-size: 16px;
      font-style: normal;
      font-weight: 800;
      color: var(--tile-ink);
    }
  }

  .tile__caption {
    display: flex;
    gap: 6px;
    align-items: center;
    margin: 0;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: var(--ts-ink-3);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tile__caption-dot {
    flex: 0 0 auto;
    width: 4px;
    height: 4px;
    background: var(--tile-ink);
    border-radius: 50%;
  }

  .tile--primary {
    --tile-ink: var(--ts-cyan);
    --tile-soft: var(--ts-cyan-soft);
    --tile-line: var(--ts-cyan-line);
  }

  .tile--warning {
    --tile-ink: var(--ts-amber);
    --tile-soft: var(--ts-amber-soft);
    --tile-line: var(--ts-amber-line);
  }

  .tile--danger {
    --tile-ink: var(--ts-rose);
    --tile-soft: var(--ts-rose-soft);
    --tile-line: var(--ts-rose-line);
  }

  .tile--success {
    --tile-ink: var(--ts-emerald);
    --tile-soft: var(--ts-emerald-soft);
    --tile-line: var(--ts-emerald-line);
  }

  .tile--purple {
    --tile-ink: var(--ts-violet);
    --tile-soft: var(--ts-violet-soft);
    --tile-line: var(--ts-violet-line);
  }
</style>
