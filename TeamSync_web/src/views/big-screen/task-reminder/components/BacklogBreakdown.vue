<template>
  <div class="breakdown">
    <p class="breakdown__total">
      未完成任务合计
      <b>{{ total }}</b>
      项
    </p>

    <ul class="breakdown__list">
      <li v-for="item in items" :key="item.name">
        <i :style="{ background: item.color, boxShadow: `0 0 12px ${item.color}` }"></i>
        <span>{{ item.name }}</span>
        <span class="breakdown__bar">
          <em :style="{ width: `${percent(item.value)}%`, background: item.color }"></em>
        </span>
        <b>{{ item.value }}</b>
        <var>{{ percent(item.value) }}%</var>
      </li>
    </ul>

    <dl class="breakdown__notes">
      <div v-for="note in NOTES" :key="note.term">
        <dt>{{ note.term }}</dt>
        <dd>{{ note.text }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import type { DonutItem } from '../types'

  const props = defineProps<{ items: DonutItem[]; total: number }>()

  const NOTES = [
    { term: '已逾期', text: '截止时间早于当前时刻，且任务尚未完成' },
    { term: '48 小时内到期', text: '从现在起 48 小时内截止，需要优先安排' },
    { term: '已排期待处理', text: '有截止时间，且在 48 小时之后' },
    { term: '未设置截止', text: '没有填写截止时间，不会进入任何到期与逾期提醒' }
  ]

  const percent = (value: number) => (props.total > 0 ? Math.round((value / props.total) * 100) : 0)
</script>

<style scoped lang="scss">
  .breakdown {
    display: grid;
    gap: 20px;
  }

  .breakdown__total {
    margin: 0;
    font-size: 17px;
    font-weight: 650;
    color: var(--ts-ink-2);

    b {
      margin: 0 6px;
      font-size: 30px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--ts-ink);
    }
  }

  .breakdown__list {
    display: grid;
    gap: 14px;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: grid;
      grid-template-columns: 12px 150px minmax(0, 1fr) 62px 62px;
      gap: 14px;
      align-items: center;
    }

    i {
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }

    span {
      font-size: 17px;
      font-weight: 700;
      color: var(--ts-ink-2);
    }

    b {
      font-size: 24px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--ts-ink);
      text-align: right;
    }

    var {
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--ts-ink-3);
      text-align: right;
    }
  }

  .breakdown__bar {
    display: block;
    height: 12px;
    overflow: hidden;
    background: rgb(15 23 42 / 8%);
    border-radius: 999px;

    em {
      display: block;
      height: 100%;
      border-radius: inherit;
      transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  /* 大屏前常被问“逾期是怎么算的”，把口径写在明细里 */
  .breakdown__notes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 24px;
    padding: 16px 18px;
    margin: 0;
    background: rgb(15 23 42 / 3%);
    border: 1px solid var(--ts-line);
    border-radius: 14px;

    dt {
      font-size: 15px;
      font-weight: 800;
      color: var(--ts-ink);
    }

    dd {
      margin: 5px 0 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.6;
      color: var(--ts-ink-3);
    }
  }
</style>
