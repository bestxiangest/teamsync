<template>
  <span class="status-badge" :class="[`status-badge--${tone}`, `status-badge--${size}`]">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      text: string
      tone?: 'danger' | 'warning' | 'success' | 'primary' | 'purple' | 'neutral'
      size?: 'small' | 'medium'
    }>(),
    {
      tone: 'neutral',
      size: 'medium'
    }
  )
</script>

<style scoped lang="scss">
  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
  }

  .status-badge--small {
    min-width: 40px;
    padding: 5px 7px;
    font-size: 12px;
  }

  .status-badge--medium {
    padding: 7px 10px;
    font-size: 14px;
  }

  .status-badge--danger {
    color: var(--danger);
    background: #fff1f2;
    border-color: #fecdd3;
  }

  .status-badge--warning {
    color: var(--warning);
    background: #fff7ed;
    border-color: #fed7aa;
  }

  .status-badge--success {
    color: var(--success);
    background: #ecfdf5;
    border-color: #bbf7d0;
  }

  .status-badge--primary {
    color: var(--primary);
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  .status-badge--purple {
    color: var(--purple);
    background: #f5f3ff;
    border-color: #ddd6fe;
  }

  .status-badge--neutral {
    color: var(--text-secondary);
    background: #f8fafc;
    border-color: var(--border-color);
  }
</style>
