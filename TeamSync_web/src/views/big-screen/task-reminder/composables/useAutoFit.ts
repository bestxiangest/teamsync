import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  type CSSProperties,
  type InjectionKey,
  type Ref
} from 'vue'

/** 大屏设计稿宽度：所有面板都按 1920 × 900 的版式排版 */
export const SCREEN_DESIGN_WIDTH = 1920
/** 最小设计高度：屏幕比 1920:900 更扁时按高度缩放，左右留白而不是把面板压扁 */
export const SCREEN_MIN_DESIGN_HEIGHT = 900

/** 缩放比例 × devicePixelRatio：canvas 实际需要分配的设备像素比 */
export const SCREEN_PIXEL_RATIO_KEY: InjectionKey<Ref<number>> = Symbol('ts-screen-pixel-ratio')

/** 组件里读取 canvas 像素比；没有大屏容器时退化为设备像素比 */
export function useScreenPixelRatio() {
  const fallback = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  return inject(SCREEN_PIXEL_RATIO_KEY, null) ?? ref(fallback)
}

const supportsZoom = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '2')

const round = (value: number, digits = 4) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/**
 * 计算适配比例与舞台尺寸。
 *
 * - 16:9 及更窄的屏幕：以 1920 为设计宽度，纵向设计高度由视口反推，面板的 fr / flex 布局吸收多出来的高度；
 * - 比 1920:900 更扁的超宽屏：锁定 900 设计高度，横向设计宽度由视口反推，
 *   让面板变宽而不是在左右留黑边（左右留白会让明细弹层只盖住中间一块）。
 */
export function resolveScreenFit(
  viewportWidth: number,
  viewportHeight: number,
  designWidth = SCREEN_DESIGN_WIDTH,
  minDesignHeight = SCREEN_MIN_DESIGN_HEIGHT
) {
  const width = Math.max(viewportWidth, 1)
  const height = Math.max(viewportHeight, 1)
  const widthScale = width / designWidth
  const fittedHeight = height / widthScale

  if (fittedHeight >= minDesignHeight) {
    return {
      scale: round(widthScale),
      designWidth,
      designHeight: round(fittedHeight, 2)
    }
  }

  const scale = height / minDesignHeight

  return {
    scale: round(scale),
    designWidth: round(width / scale, 2),
    designHeight: minDesignHeight
  }
}

/**
 * 大屏铺满视口，并保证文字清晰。
 *
 * 用 CSS zoom 而不是 transform: scale：
 * - zoom 会把字体按最终字号重新排版和栅格化，低分辨率或高 DPI 屏幕上不会发虚；
 * - transform 只是放大已经栅格化好的图层，ECharts canvas 也会一起被拉伸；
 * - zoom 下的子元素仍按设计稿像素布局，现有 1920 宽版式不用改写。
 *
 * 老浏览器不支持 zoom 时退回 transform 方案（会保留原来的缩放行为）。
 */
export function useAutoFit(
  designWidth = SCREEN_DESIGN_WIDTH,
  minDesignHeight = SCREEN_MIN_DESIGN_HEIGHT
) {
  const zoomSupported = supportsZoom()
  const initial =
    typeof window === 'undefined'
      ? { scale: 1, designWidth, designHeight: minDesignHeight }
      : resolveScreenFit(window.innerWidth, window.innerHeight, designWidth, minDesignHeight)

  const scale = ref(initial.scale)
  const stageWidth = ref(initial.designWidth)
  const designHeight = ref(initial.designHeight)
  const pixelRatio = ref(
    initial.scale * (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)
  )
  let frame = 0

  const measure = () => {
    const next = resolveScreenFit(
      window.innerWidth,
      window.innerHeight,
      designWidth,
      minDesignHeight
    )

    if (next.scale !== scale.value) {
      scale.value = next.scale
    }

    stageWidth.value = next.designWidth
    designHeight.value = next.designHeight
    pixelRatio.value = scale.value * (window.devicePixelRatio || 1)
  }

  const scheduleMeasure = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(measure)
  }

  /**
   * 窗口拖到另一块显示器时 devicePixelRatio 会变，但 css 尺寸可能完全不变；
   * 轮询一次（1s）比依赖 resize / matchMedia 更稳，变化后让 ECharts 重新分配 canvas 像素。
   */
  let dprTimer: ReturnType<typeof setInterval> | null = null

  const watchPixelRatio = () => {
    const next = scale.value * (window.devicePixelRatio || 1)

    if (next !== pixelRatio.value) {
      pixelRatio.value = next
    }
  }

  const stageStyle = computed<CSSProperties>(() => {
    const box = {
      width: `${stageWidth.value}px`,
      height: `${designHeight.value}px`
    }

    if (zoomSupported) {
      return { ...box, zoom: scale.value }
    }

    return {
      ...box,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) scale(${scale.value})`,
      transformOrigin: 'center center'
    }
  })

  provide(SCREEN_PIXEL_RATIO_KEY, pixelRatio)

  onMounted(() => {
    measure()
    dprTimer = setInterval(watchPixelRatio, 1000)
    window.addEventListener('resize', scheduleMeasure)
    window.addEventListener('orientationchange', scheduleMeasure)
    document.addEventListener('fullscreenchange', scheduleMeasure)
    window.visualViewport?.addEventListener('resize', scheduleMeasure)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)

    if (dprTimer) {
      clearInterval(dprTimer)
      dprTimer = null
    }

    window.removeEventListener('resize', scheduleMeasure)
    window.removeEventListener('orientationchange', scheduleMeasure)
    document.removeEventListener('fullscreenchange', scheduleMeasure)
    window.visualViewport?.removeEventListener('resize', scheduleMeasure)
  })

  return { stageStyle, scale, stageWidth, designHeight, pixelRatio }
}
