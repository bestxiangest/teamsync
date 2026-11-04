<template>
  <div class="donut">
    <div class="donut__chart">
      <div ref="chartRef" class="donut__canvas"></div>
      <div class="donut__center">
        <strong>{{ total }}</strong>
        <span>待处理任务</span>
      </div>
    </div>

    <ul class="donut__legend">
      <li v-for="item in items" :key="item.name">
        <i :style="{ background: item.color, boxShadow: `0 0 12px ${item.color}` }"></i>
        <span>{{ item.name }}</span>
        <b>{{ item.value }}</b>
        <em>{{ percent(item.value) }}%</em>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { echarts } from '@/plugins/echarts'
  import { useScreenPixelRatio } from '../../composables/useAutoFit'
  import type { DonutItem } from '../../types'

  const props = defineProps<{
    items: DonutItem[]
    total: number
  }>()

  const chartRef = ref<HTMLElement>()
  const pixelRatio = useScreenPixelRatio()
  let chart: ReturnType<typeof echarts.init> | null = null
  let observer: ResizeObserver | null = null

  const percent = (value: number) => (props.total > 0 ? Math.round((value / props.total) * 100) : 0)

  const render = () => {
    chart?.setOption({
      animationDuration: 900,
      animationEasing: 'quinticOut',
      series: [
        {
          type: 'pie',
          radius: ['64%', '92%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { disabled: true },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 3,
            borderRadius: 5
          },
          data: props.items.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    })
  }

  /**
   * 大屏用 zoom 缩放，canvas 需要按"设计像素 × 缩放 × DPR"分配真实像素，
   * 否则图表会被浏览器二次拉伸，看起来发虚、圆心也会和中间的数字错位。
   */
  const initChart = () => {
    if (!chartRef.value) {
      return
    }

    chart?.dispose()
    chart = echarts.init(chartRef.value, undefined, {
      renderer: 'canvas',
      devicePixelRatio: Math.max(pixelRatio.value, 0.1)
    })
    render()
  }

  onMounted(() => {
    initChart()

    if (chartRef.value) {
      observer = new ResizeObserver(() => chart?.resize())
      observer.observe(chartRef.value)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    chart?.dispose()
    chart = null
  })

  watch(() => props.items, render, { deep: true })
  watch(pixelRatio, initChart)
</script>

<style scoped lang="scss">
  .donut {
    display: grid;
    flex: 1 1 0;
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: minmax(0, 168px) minmax(0, 1fr);
    gap: 18px;
    align-items: stretch;
    min-height: 0;
    overflow: hidden;
  }

  /* 高度不够时圆环跟着收缩，而不是保持 168px 撑出面板压到下方指标 */
  .donut__chart {
    position: relative;
    width: 100%;
    max-width: 168px;
    height: 100%;
    min-height: 0;
    max-height: 168px;
    margin-block: auto;
    justify-self: center;
  }

  .donut__canvas {
    width: 100%;
    height: 100%;
  }

  .donut__center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: grid;
    gap: 5px;
    text-align: center;
    transform: translate(-50%, -50%);

    strong {
      font-size: 38px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      color: var(--ts-ink);
    }

    span {
      font-size: 13px;
      font-weight: 650;
      color: var(--ts-ink-3);
      letter-spacing: 0.04em;
    }
  }

  .donut__legend {
    display: grid;
    gap: 8px;
    align-content: center;
    min-height: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
    list-style: none;

    li {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr) auto 44px;
      gap: 10px;
      align-items: center;
      padding-bottom: 4px;
      line-height: 1.15;
      border-bottom: 1px solid var(--ts-line);
    }

    li:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    i {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }

    span {
      overflow: hidden;
      font-size: 14px;
      font-weight: 650;
      color: var(--ts-ink-2);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    b {
      font-size: 18px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      color: var(--ts-ink);
    }

    em {
      font-size: 13px;
      font-style: normal;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--ts-ink-3);
      text-align: right;
    }
  }
</style>
