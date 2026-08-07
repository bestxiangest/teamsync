<template>
  <section class="overview-chart-panel">
    <div class="relative z-10">
      <div class="mb-4 flex items-start justify-between gap-3">
        <div>
          <p v-if="eyebrow" class="text-xs font-medium tracking-[0.3em] text-slate-400">
            {{ eyebrow }}
          </p>
          <h3 class="mt-1 text-[1.08rem] font-semibold text-slate-800">{{ title }}</h3>
          <p v-if="subtitle" class="mt-1 text-sm leading-6 text-slate-500">{{ subtitle }}</p>
        </div>
        <slot name="extra" />
      </div>
      <div ref="chartRef" class="h-[280px] w-full"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  title: string
  option: EChartsOption
  eyebrow?: string
  subtitle?: string
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const renderChart = async () => {
  await nextTick()
  if (!chartRef.value) {
    return
  }

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  chart.setOption(props.option, true)
}

useResizeObserver(chartRef, () => {
  chart?.resize()
})

watch(
  () => props.option,
  () => {
    renderChart()
  },
  { deep: true }
)

onMounted(() => {
  renderChart()
})

onBeforeUnmount(() => {
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.overview-chart-panel {
  position: relative;
  overflow: hidden;
  padding: 1.25rem;
  border-radius: 32px;
  background: #fff;
  box-shadow:
    0 20px 52px -40px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}
</style>
