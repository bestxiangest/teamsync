<template>
  <footer class="bottombar">
    <div class="bottombar__legend">
      <span v-for="item in legend" :key="item.text" :class="`legend legend--${item.tone}`">
        <i></i>
        {{ item.text }}
      </span>
    </div>

    <p class="bottombar__keys">
      点击任意面板查看全部明细 · ← → 切换页面 · 数字键直达 · 空格暂停 · F 全屏 · R 刷新
    </p>

    <div class="bottombar__sync" :class="{ 'bottombar__sync--failed': syncFailed }">
      <i class="bottombar__sync-dot"></i>
      {{ syncText }}
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    lastSyncAt: Date | null
    syncFailed: boolean
  }>()

  const legend = [
    { text: '已逾期', tone: 'danger' },
    { text: '48 小时内到期', tone: 'warning' },
    { text: '正常推进', tone: 'info' },
    { text: '周期计划', tone: 'violet' }
  ]

  const pad = (value: number) => String(value).padStart(2, '0')

  const syncText = computed(() => {
    if (!props.lastSyncAt) {
      return props.syncFailed ? '数据同步失败 · 请检查后端服务' : '正在获取数据…'
    }

    const at = props.lastSyncAt
    const clock = `${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}`
    return props.syncFailed ? `同步异常 · 上次成功 ${clock}` : `数据同步正常 · 更新于 ${clock}`
  })
</script>

<style scoped lang="scss">
  .bottombar {
    display: flex;
    flex: 0 0 auto;
    gap: 18px;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding-top: 8px;
    border-top: 1px solid var(--ts-line);
  }

  .bottombar__legend {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .legend {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    font-size: 13px;
    font-weight: 650;
    color: var(--ts-ink-2);

    i {
      width: 9px;
      height: 9px;
      background: var(--legend-ink);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--legend-ink);
    }
  }

  .legend--danger {
    --legend-ink: var(--ts-rose);
  }

  .legend--warning {
    --legend-ink: var(--ts-amber);
  }

  .legend--info {
    --legend-ink: var(--ts-cyan);
  }

  .legend--violet {
    --legend-ink: var(--ts-violet);
  }

  .bottombar__keys {
    margin: 0;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: var(--ts-ink-3);
    text-overflow: ellipsis;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .bottombar__sync {
    display: inline-flex;
    flex: 0 0 auto;
    gap: 9px;
    align-items: center;
    height: 26px;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--ts-emerald);
    background: var(--ts-emerald-soft);
    border: 1px solid var(--ts-emerald-line);
    border-radius: 9px;
  }

  .bottombar__sync--failed {
    color: var(--ts-rose);
    background: var(--ts-rose-soft);
    border-color: var(--ts-rose-line);
  }

  .bottombar__sync-dot {
    width: 7px;
    height: 7px;
    background: currentcolor;
    border-radius: 50%;
    animation: sync-blink 2.4s ease-in-out infinite;
  }

  @keyframes sync-blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.3;
    }
  }
</style>
