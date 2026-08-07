<template>
  <header class="screen-header">
    <div class="screen-header__brand">
      <img class="screen-header__logo" :src="logoUrl" alt="华睿源项目进度看板" />
      <div class="screen-header__titles">
        <div class="screen-header__main-line">
          <h1>华睿源项目进度看板</h1>
          <span class="screen-header__page">页面 {{ pageIndex + 1 }} / {{ pageTotal }} · {{ pageTitle }}</span>
        </div>
        <p>运营管理中心屏 · 项目进度公开摘要 · 数据自动刷新</p>
      </div>
    </div>

    <div class="screen-header__time">
      <strong>{{ timeText }}</strong>
      <div>
        <span>{{ weekText }}</span>
        <span>{{ dateText }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import logoUrl from '@/assets/images/common/logo.webp'

  const props = defineProps<{
    pageTitle: string
    pageIndex: number
    pageTotal: number
    now: Date
  }>()

  const pad = (value: number) => String(value).padStart(2, '0')

  const timeText = computed(() => `${pad(props.now.getHours())}:${pad(props.now.getMinutes())}`)
  const weekText = computed(() => {
    const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return weeks[props.now.getDay()]
  })
  const dateText = computed(
    () =>
      `${props.now.getFullYear()}/${pad(props.now.getMonth() + 1)}/${pad(props.now.getDate())}`
  )
</script>

<style scoped lang="scss">
  .screen-header {
    display: flex;
    min-height: 74px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .screen-header__brand {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 16px;
  }

  .screen-header__logo {
    width: 58px;
    height: 58px;
    flex: 0 0 auto;
    object-fit: contain;
  }

  .screen-header__titles {
    min-width: 0;
  }

  .screen-header__main-line {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 28px;
  }

  .screen-header h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 34px;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .screen-header__page {
    color: #1e293b;
    font-size: 16px;
    font-weight: 800;
    white-space: nowrap;
  }

  .screen-header p {
    margin: 8px 0 0;
    color: var(--text-secondary);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .screen-header__time {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 14px;
    color: var(--text-primary);
  }

  .screen-header__time strong {
    font-size: 48px;
    font-weight: 950;
    line-height: 1;
    letter-spacing: 0;
  }

  .screen-header__time div {
    display: grid;
    gap: 6px;
    color: #334155;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.1;
  }

  @media (max-width: 1500px) {
    .screen-header {
      min-height: 58px;
    }

    .screen-header__logo {
      width: 46px;
      height: 46px;
    }

    .screen-header__brand {
      gap: 12px;
    }

    .screen-header__main-line {
      gap: 18px;
    }

    .screen-header h1 {
      font-size: 27px;
    }

    .screen-header__page {
      font-size: 14px;
    }

    .screen-header p {
      margin-top: 4px;
      font-size: 13px;
    }

    .screen-header__time strong {
      font-size: 39px;
    }

    .screen-header__time div {
      font-size: 13px;
    }
  }

  @media (max-width: 1100px) {
    .screen-header__main-line {
      display: grid;
      gap: 5px;
    }

    .screen-header p {
      display: none;
    }
  }
</style>
