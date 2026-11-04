<template>
  <div v-if="rows.length === 0" class="grid-empty">{{ empty }}</div>

  <div v-else class="grid">
    <div class="grid__head" :style="{ gridTemplateColumns: template }">
      <span
        v-for="column in columns"
        :key="column.key"
        :style="{ textAlign: column.align ?? 'left' }"
      >
        {{ column.label }}
      </span>
    </div>

    <component
      :is="scroll ? ScrollBox : 'div'"
      v-bind="scroll ? { speed } : { class: 'grid__static' }"
    >
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="grid__row"
        :style="{ gridTemplateColumns: template, height: `${rowHeight}px` }"
      >
        <span
          v-for="column in columns"
          :key="column.key"
          :style="{ textAlign: column.align ?? 'left' }"
        >
          <slot :name="`cell-${column.key}`" :row="row" :index="index">
            {{ text(row, column.key) }}
          </slot>
        </span>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
  import { computed } from 'vue'
  import ScrollBox from './ScrollBox.vue'
  import type { DataColumn } from '../types'

  const props = withDefaults(
    defineProps<{
      columns: DataColumn[]
      rows: T[]
      empty?: string
      rowHeight?: number
      speed?: number
      /** 关闭后逐行静态铺开，由外层容器负责滚动；明细弹层用这种模式 */
      scroll?: boolean
    }>(),
    {
      empty: '暂无数据',
      rowHeight: 52,
      speed: 26,
      scroll: true
    }
  )

  const template = computed(() =>
    props.columns.map((column) => column.width ?? 'minmax(0, 1fr)').join(' ')
  )

  const text = (row: T, key: string) => (row as Record<string, unknown>)[key]
</script>

<style scoped lang="scss">
  .grid {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .grid__head {
    display: grid;
    flex: 0 0 auto;
    align-items: center;
    height: 36px;
    padding-bottom: 8px;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ts-ink-3);
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--ts-line);
  }

  .grid__row {
    display: grid;
    align-items: center;
    font-size: 15px;
    font-weight: 650;
    color: var(--ts-ink);
    border-radius: 10px;
  }

  .grid__row:nth-child(even) {
    background: rgb(15 23 42 / 3%);
  }

  .grid__head > span,
  .grid__row > span {
    display: block;
    min-width: 0;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grid-empty {
    display: grid;
    flex: 1;
    place-items: center;
    min-height: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ts-ink-3);
  }

  .grid__static {
    display: flex;
    flex-direction: column;
  }
</style>
