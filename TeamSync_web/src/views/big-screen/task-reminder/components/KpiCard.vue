<template>
  <article class="kpi-card" :class="`kpi-card--${item.tone}`">
    <div class="kpi-card__icon">
      <component :is="iconComponent" />
    </div>
    <div class="kpi-card__content">
      <p class="kpi-card__label">{{ item.label }}</p>
      <strong class="kpi-card__value">{{ item.value }}</strong>
      <p class="kpi-card__trend" :class="`kpi-card__trend--${item.trendDirection}`">
        <span>{{ item.trendText }}</span>
        <span v-if="item.trendDirection === 'up'" class="kpi-card__arrow">↑</span>
        <span v-else-if="item.trendDirection === 'down'" class="kpi-card__arrow">↓</span>
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Component } from 'vue'
  import {
    Calendar,
    CircleCheckFilled,
    Clock,
    DocumentChecked,
    Folder,
    Refresh,
    Trophy,
    UserFilled,
    WarningFilled
  } from '@element-plus/icons-vue'
  import type { KpiCardItem, KpiIconKey } from '@/api/big-screen'

  const props = defineProps<{
    item: KpiCardItem
  }>()

  const iconMap: Record<KpiIconKey, Component> = {
    task: DocumentChecked,
    calendar: Calendar,
    clock: Clock,
    warning: WarningFilled,
    refresh: Refresh,
    folder: Folder,
    user: UserFilled,
    crown: Trophy,
    check: CircleCheckFilled,
    team: UserFilled
  }

  const iconComponent = computed(() => iconMap[props.item.icon])
</script>

<style scoped lang="scss">
  .kpi-card {
    display: grid;
    min-width: 0;
    min-height: 104px;
    grid-template-columns: 62px minmax(0, 1fr);
    align-items: center;
    gap: 18px;
    padding: 18px 20px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    box-shadow: var(--screen-shadow);
  }

  .kpi-card__icon {
    display: inline-flex;
    width: 62px;
    height: 62px;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-radius: 50%;
    box-shadow: inset 0 -10px 18px rgb(15 23 42 / 12%);

    svg {
      width: 32px;
      height: 32px;
    }
  }

  .kpi-card--primary .kpi-card__icon {
    background: linear-gradient(180deg, #3b82f6 0%, var(--primary) 100%);
  }

  .kpi-card--warning .kpi-card__icon {
    background: linear-gradient(180deg, #f59e0b 0%, #f97316 100%);
  }

  .kpi-card--danger .kpi-card__icon {
    background: linear-gradient(180deg, #fb7185 0%, var(--danger) 100%);
  }

  .kpi-card--success .kpi-card__icon {
    background: linear-gradient(180deg, #22c55e 0%, var(--success) 100%);
  }

  .kpi-card--purple .kpi-card__icon {
    background: linear-gradient(180deg, #8b5cf6 0%, var(--purple) 100%);
  }

  .kpi-card__content {
    min-width: 0;
  }

  .kpi-card__label {
    margin: 0 0 5px;
    overflow: hidden;
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kpi-card__value {
    display: block;
    color: var(--text-primary);
    font-size: 40px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0;
  }

  .kpi-card__trend {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 7px 0 0;
    color: var(--text-secondary);
    font-size: 15px;
    line-height: 1.2;
  }

  .kpi-card__trend--up {
    color: var(--danger);
  }

  .kpi-card__trend--down {
    color: var(--success);
  }

  .kpi-card__trend--flat {
    color: var(--text-secondary);
  }

  .kpi-card__arrow {
    font-size: 18px;
    font-weight: 900;
    line-height: 1;
  }

  @media (max-width: 1500px) {
    .kpi-card {
      min-height: 86px;
      grid-template-columns: 50px minmax(0, 1fr);
      gap: 13px;
      padding: 13px 15px;
      border-radius: 12px;
    }

    .kpi-card__icon {
      width: 50px;
      height: 50px;

      svg {
        width: 26px;
        height: 26px;
      }
    }

    .kpi-card__label {
      font-size: 14px;
    }

    .kpi-card__value {
      font-size: 32px;
    }

    .kpi-card__trend {
      margin-top: 5px;
      font-size: 13px;
    }
  }
</style>
