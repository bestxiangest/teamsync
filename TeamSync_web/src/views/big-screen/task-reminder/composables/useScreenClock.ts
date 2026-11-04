import { inject, ref, type InjectionKey, type Ref } from 'vue'

/** 大屏统一时钟：由服务端时间校准，所有倒计时和顶部时钟共用同一个 now */
export const SCREEN_NOW_KEY: InjectionKey<Ref<Date>> = Symbol('ts-screen-now')

/** 没有大屏容器时退化为本地时间 */
export function useScreenNow() {
  return inject(SCREEN_NOW_KEY, null) ?? ref(new Date())
}

/**
 * 解析后端下发的本地日期时间。
 *
 * 后端格式为 yyyy-MM-ddTHH:mm:ss；部分数据库字段会带纳秒，Date.parse 只接受毫秒，
 * 因此先把超过三位的秒小数截断，再按浏览器本地时区解析（与屏幕上的挂钟一致）。
 */
export function parseServerDateTime(value: string | null | undefined): number | null {
  if (!value) {
    return null
  }

  const normalized = value.trim().replace(/(\.\d{3})\d+/, '$1')
  const parsed = Date.parse(normalized)

  return Number.isNaN(parsed) ? null : parsed
}

const pad = (value: number) => String(value).padStart(2, '0')

export interface CountdownOptions {
  /** 未到期前缀，默认不显示 */
  futurePrefix?: string
  /** 已逾期前缀，默认「逾期 」 */
  overduePrefix?: string
}

/**
 * 把截止时间格式化为秒级倒计时。
 *
 * 只在拿到绝对截止时间时返回文本；旧接口没有 dueTime 时返回 null，由调用方回退到后端文案。
 * 大屏每刷新一次只校准时钟，不会重算文案，因此读数不会在两次刷新之间停住。
 */
export function formatCountdown(
  dueTime: string | null | undefined,
  now: Date,
  options: CountdownOptions = {}
): string | null {
  const due = parseServerDateTime(dueTime)

  if (due === null) {
    return null
  }

  const diff = due - now.getTime()
  const totalSeconds = Math.floor(Math.abs(diff) / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor(totalSeconds / 3_600) % 24
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = totalSeconds % 60
  const body =
    days > 0
      ? `${days}天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  if (diff < 0) {
    return `${options.overduePrefix ?? '逾期 '}${body}`
  }

  return `${options.futurePrefix ?? ''}${body}`
}
