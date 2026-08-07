<template>
  <div ref="chartRef" class="console-chart-surface" :style="surfaceStyle"></div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { echarts, type EChartsOption } from '@/plugins/echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: string
  }>(),
  {
    height: '220px'
  }
)

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const surfaceStyle = computed(() => ({
  height: props.height
}))

const renderChart = () => {
  if (!chartRef.value) {
    return
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption(props.option, true)
  chartInstance.resize()
}

watch(
  () => props.option,
  () => nextTick(renderChart),
  { deep: true }
)

useResizeObserver(chartRef, () => {
  chartInstance?.resize()
})

onMounted(() => {
  nextTick(renderChart)
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped lang="scss">
.console-chart-surface {
  width: 100%;
  min-height: 8rem;
}
</style>
