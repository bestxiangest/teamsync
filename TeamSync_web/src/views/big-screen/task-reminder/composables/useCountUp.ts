import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

const EASE_OUT_QUINT = (progress: number) => 1 - Math.pow(1 - progress, 5)

/**
 * 数值滚动动画。
 *
 * 大屏上的指标每次刷新都会跳变，滚动过渡能让观众察觉到"哪个数字变了"。
 */
export function useCountUp(source: Ref<number>, duration = 900) {
  const display = ref(source.value)
  let frame = 0

  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  const run = (from: number, to: number) => {
    stop()

    if (from === to) {
      display.value = to
      return
    }

    const startAt = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startAt) / duration, 1)
      display.value = Math.round(from + (to - from) * EASE_OUT_QUINT(progress))

      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
  }

  watch(source, (to, from) => run(from ?? 0, to))
  onBeforeUnmount(stop)

  return display
}
