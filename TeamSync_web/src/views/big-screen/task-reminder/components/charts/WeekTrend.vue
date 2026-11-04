<template>
  <div class="trend">
    <div class="trend__legend">
      <span class="trend__key trend__key--task">项目任务</span>
      <span class="trend__key trend__key--plan">周期计划</span>
    </div>
    <div ref="chartRef" class="trend__canvas"></div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { echarts } from '@/plugins/echarts'
  import { useScreenPixelRatio } from '../../composables/useAutoFit'

  const props = defineProps<{
    labels: string[]
    projectTasks: number[]
    recurringPlans: number[]
  }>()

  const chartRef = ref<HTMLElement>()
  const pixelRatio = useScreenPixelRatio()
  let chart: ReturnType<typeof echarts.init> | null = null
  let observer: ResizeObserver | null = null

  /** 每天的到期量是离散计数，用柱状堆叠而不是平滑曲线，避免插值出根本不存在的“趋势” */
  const barFill = (color: string) =>
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color },
      { offset: 1, color: `${color}55` }
    ])

  const render = () => {
    const totals = props.labels.map(
      (_, index) => (props.projectTasks[index] ?? 0) + (props.recurringPlans[index] ?? 0)
    )

    chart?.setOption({
      animationDuration: 700,
      animationEasing: 'quinticOut',
      grid: { top: 36, right: 12, bottom: 34, left: 12, containLabel: false },
      xAxis: {
        type: 'category',
        data: props.labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#647089',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 17,
          margin: 14
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(15,23,42,0.06)' } }
      },
      series: [
        {
          name: '项目任务',
          type: 'bar',
          stack: 'due',
          barMaxWidth: 38,
          itemStyle: { color: barFill('#0891b2'), borderRadius: [4, 4, 0, 0] },
          data: props.projectTasks
        },
        {
          name: '周期计划',
          type: 'bar',
          stack: 'due',
          barMaxWidth: 38,
          itemStyle: { color: barFill('#7c3aed'), borderRadius: [6, 6, 0, 0] },
          label: {
            show: true,
            position: 'top',
            distance: 8,
            color: '#0f172a',
            fontSize: 15,
            fontWeight: 'bold',
            formatter: (params: { dataIndex: number }) => String(totals[params.dataIndex] ?? 0)
          },
          data: props.recurringPlans
        }
      ]
    })
  }

  /** 与甜甜圈一致：按 zoom 比例放大 canvas 像素，避免缩放后柱体与文字发虚 */
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

    /** 字体加载完成后轴标签宽度会变，重绘一次对齐网格 */
    void document.fonts?.ready.then(() => chart?.resize())
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    chart?.dispose()
    chart = null
  })

  watch(() => [props.labels, props.projectTasks, props.recurringPlans], render, { deep: true })
  watch(pixelRatio, initChart)
</script>

<style scoped lang="scss">
  .trend {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .trend__legend {
    display: flex;
    flex: 0 0 auto;
    gap: 18px;
    justify-content: flex-end;
  }

  .trend__key {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    font-size: 14px;
    font-weight: 650;
    color: var(--ts-ink-2);
  }

  .trend__key::before {
    width: 12px;
    height: 12px;
    content: '';
    background: var(--key-ink);
    border-radius: 4px;
    box-shadow: 0 0 10px var(--key-ink);
  }

  .trend__key--task {
    --key-ink: var(--ts-cyan);
  }

  .trend__key--plan {
    --key-ink: var(--ts-violet);
  }

  .trend__canvas {
    flex: 1;
    min-height: 0;
  }
</style>
