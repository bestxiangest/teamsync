<template>
  <section class="panel-card" :class="{ 'panel-card--dense': dense }">
    <header class="panel-card__header">
      <div class="panel-card__title-wrap">
        <span v-if="$slots.icon" class="panel-card__icon">
          <slot name="icon" />
        </span>
        <h2 class="panel-card__title">{{ title }}</h2>
      </div>
      <button
        v-if="actionText"
        class="panel-card__action"
        type="button"
        @click="$emit('action')"
      >
        {{ actionText }}
      </button>
    </header>
    <div class="panel-card__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  defineEmits<{
    (e: 'action'): void
  }>()

  withDefaults(
    defineProps<{
      title: string
      actionText?: string
      dense?: boolean
    }>(),
    {
      actionText: '',
      dense: false
    }
  )
</script>

<style scoped lang="scss">
  .panel-card {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    box-shadow: var(--screen-shadow);
  }

  .panel-card--dense {
    padding: 14px;
  }

  .panel-card__header {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .panel-card__title-wrap {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;
  }

  .panel-card__icon {
    display: inline-flex;
    width: 26px;
    height: 26px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    background: #eff6ff;
    border-radius: 8px;
  }

  .panel-card__title {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .panel-card__action {
    flex: 0 0 auto;
    padding: 0;
    color: var(--primary);
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 0;
    transition: color 160ms ease;
  }

  .panel-card__action:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  .panel-card__body {
    min-height: 0;
    flex: 1;
    overflow: hidden;
  }

  @media (max-width: 1500px) {
    .panel-card {
      padding: 12px;
      border-radius: 12px;
    }

    .panel-card__header {
      margin-bottom: 9px;
    }

    .panel-card__title {
      font-size: 16px;
    }
  }
</style>
