<template>
  <footer class="footer-notice">
    <div class="footer-notice__label">
      <BellFilled />
      <strong>{{ label }}</strong>
    </div>
    <div class="footer-notice__items">
      <span
        v-for="item in items"
        :key="item.text"
        class="footer-notice__item"
        :class="`footer-notice__item--${item.tone}`"
      >
        <i v-if="item.tone !== 'neutral'"></i>
        {{ item.text }}
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { BellFilled } from '@element-plus/icons-vue'

  interface FooterNoticeItem {
    text: string
    tone: 'danger' | 'warning' | 'success' | 'primary' | 'neutral'
  }

  defineProps<{
    label: string
    items: FooterNoticeItem[]
  }>()
</script>

<style scoped lang="scss">
  .footer-notice {
    display: grid;
    min-height: 56px;
    grid-template-columns: 220px minmax(0, 1fr);
    align-items: center;
    gap: 18px;
    padding: 0 24px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: var(--screen-shadow);
  }

  .footer-notice__label {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--primary);
    font-size: 18px;

    svg {
      width: 28px;
      height: 28px;
    }

    strong {
      font-weight: 900;
    }
  }

  .footer-notice__items {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: center;
    gap: 0;
  }

  .footer-notice__item {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 18px;
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    border-left: 1px solid #cbd5e1;

    i {
      width: 14px;
      height: 14px;
      flex: 0 0 auto;
      border-radius: 50%;
    }
  }

  .footer-notice__item--danger i {
    background: var(--danger);
  }

  .footer-notice__item--warning i {
    background: var(--warning);
  }

  .footer-notice__item--success i {
    background: var(--success);
  }

  .footer-notice__item--primary i {
    background: var(--primary);
  }

  @media (max-width: 1500px) {
    .footer-notice {
      min-height: 44px;
      grid-template-columns: 170px minmax(0, 1fr);
      padding: 0 16px;
    }

    .footer-notice__label {
      gap: 9px;
      font-size: 16px;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .footer-notice__item {
      gap: 8px;
      padding: 0 12px;
      font-size: 13px;

      i {
        width: 11px;
        height: 11px;
      }
    }
  }
</style>
