<template>
  <section class="metrics-rail">
    <button
      v-for="item in items"
      :key="item.key"
      class="metrics-rail__card"
      :style="getCardStyle(item)"
      type="button"
      @click="$emit('select', item.key)"
    >
      <div class="metrics-rail__header">
        <span class="metrics-rail__eyebrow">{{ item.eyebrow }}</span>
        <span class="metrics-rail__tag">{{ item.tag }}</span>
      </div>
      <div class="metrics-rail__value-wrap">
        <strong class="metrics-rail__value">{{ item.value }}</strong>
        <span v-if="item.suffix" class="metrics-rail__suffix">{{ item.suffix }}</span>
      </div>
      <div class="metrics-rail__chart">
        <ConsoleChartSurface :option="getChartOption(item)" height="84px" />
      </div>
      <div class="metrics-rail__footer">
        <span class="metrics-rail__label">{{ item.label }}</span>
        <span class="metrics-rail__hint">{{ item.hint }}</span>
      </div>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { EChartsOption } from '@/plugins/echarts'
import ConsoleChartSurface from './ConsoleChartSurface.vue'

interface MetricItem {
  key: string
  eyebrow: string
  label: string
  value: number | string
  suffix?: string
  hint: string
  tag: string
  accent: 'amber' | 'cobalt' | 'pearl' | 'mint'
  series: number[]
}

const props = defineProps<{
  items: MetricItem[]
  isDark: boolean
}>()

defineEmits<{
  select: [key: string]
}>()

const accentMap = {
  amber: {
    start: '#d6994e',
    end: '#f1c07f',
    soft: 'rgb(214 153 78 / 0.12)'
  },
  cobalt: {
    start: '#5d87ff',
    end: '#8daafc',
    soft: 'rgb(93 135 255 / 0.12)'
  },
  pearl: {
    start: '#90a5ea',
    end: '#dfe8ff',
    soft: 'rgb(143 165 234 / 0.12)'
  },
  mint: {
    start: '#30ab84',
    end: '#8adbc2',
    soft: 'rgb(48 171 132 / 0.12)'
  }
}

const getCardStyle = (item: MetricItem): CSSProperties => {
  const palette = accentMap[item.accent]
  return {
    '--metric-accent': palette.start,
    '--metric-accent-end': palette.end,
    '--metric-accent-soft': palette.soft
  } as CSSProperties
}

const getChartOption = (item: MetricItem): EChartsOption => {
  const palette = accentMap[item.accent]
  const data = item.series.length ? item.series : [0, 0, 0, 0, 0, 0, 0]

  return {
    animationDuration: 900,
    animationEasing: 'cubicOut',
    grid: {
      top: 8,
      right: 0,
      bottom: 8,
      left: 0
    },
    xAxis: {
      type: 'category',
      show: false,
      data
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: palette.start
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${palette.start}${props.isDark ? '4d' : '2d'}` },
              { offset: 1, color: `${palette.end}00` }
            ]
          }
        }
      }
    ]
  }
}
</script>

<style scoped lang="scss">
.metrics-rail {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}

.metrics-rail__card {
  position: relative;
  grid-column: span 3;
  min-height: 13.6rem;
  padding: 1.15rem;
  display: grid;
  align-content: space-between;
  border: 1px solid var(--console-line);
  border-radius: 1.6rem;
  background: var(--console-panel-fill-strong);
  box-shadow: var(--console-shadow);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease;
}

.metrics-rail__card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 0%, var(--metric-accent-soft), transparent 36%),
    linear-gradient(180deg, rgb(255 255 255 / 0.05), transparent 45%);
  pointer-events: none;
}

.metrics-rail__card::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.22rem;
  background: linear-gradient(180deg, var(--metric-accent), var(--metric-accent-end));
  opacity: 0.9;
}

.metrics-rail__card:hover {
  transform: translateY(-0.28rem);
  border-color: rgb(93 135 255 / 18%);
  box-shadow: 0 1.1rem 2.1rem rgb(0 0 0 / 10%);
}

.metrics-rail__card:nth-child(1) {
  grid-column: span 4;
}

.metrics-rail__card:nth-child(2) {
  grid-column: span 3;
}

.metrics-rail__card:nth-child(3) {
  grid-column: span 2;
}

.metrics-rail__card:nth-child(4) {
  grid-column: span 3;
}

.metrics-rail__header,
.metrics-rail__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.metrics-rail__eyebrow,
.metrics-rail__tag,
.metrics-rail__hint {
  font-size: 0.8rem;
  color: var(--console-muted);
}

.metrics-rail__eyebrow {
  letter-spacing: 0.08em;
}

.metrics-rail__tag {
  padding: 0.34rem 0.55rem;
  border: 1px solid var(--console-subtle-line);
  border-radius: 999px;
  background: var(--console-panel-fill-soft);
}

.metrics-rail__value-wrap,
.metrics-rail__chart {
  position: relative;
  z-index: 1;
}

.metrics-rail__value-wrap {
  display: flex;
  align-items: end;
  gap: 0.42rem;
}

.metrics-rail__value {
  font-family: var(--console-display-font);
  font-size: clamp(3rem, 6vw, 4.1rem);
  line-height: 0.9;
  letter-spacing: -0.08em;
  color: var(--console-text-strong);
}

.metrics-rail__suffix {
  padding-bottom: 0.55rem;
  font-size: 0.92rem;
  color: var(--console-muted);
}

.metrics-rail__label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--console-text-strong);
}

.metrics-rail__chart {
  margin: 0.75rem -0.2rem 0;
}

@media (width <= 1100px) {
  .metrics-rail__card,
  .metrics-rail__card:nth-child(1),
  .metrics-rail__card:nth-child(2),
  .metrics-rail__card:nth-child(3),
  .metrics-rail__card:nth-child(4) {
    grid-column: span 6;
  }
}

@media (width <= 700px) {
  .metrics-rail__card,
  .metrics-rail__card:nth-child(1),
  .metrics-rail__card:nth-child(2),
  .metrics-rail__card:nth-child(3),
  .metrics-rail__card:nth-child(4) {
    grid-column: span 12;
  }
}
</style>
