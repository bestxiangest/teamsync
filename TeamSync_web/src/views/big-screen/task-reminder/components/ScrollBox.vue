<template>
  <div
    ref="viewportRef"
    class="scroll-box"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div class="scroll-box__track" :style="{ transform: `translate3d(0, ${-offset}px, 0)` }">
      <div ref="contentRef">
        <slot />
      </div>
      <div v-if="looping" :style="{ marginTop: `${gap}px` }" aria-hidden="true">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  const props = withDefaults(
    defineProps<{
      /** 滚动速度，像素 / 秒 */
      speed?: number
      /** 首尾衔接留白 */
      gap?: number
    }>(),
    { speed: 26, gap: 18 }
  )

  const viewportRef = ref<HTMLElement>()
  const contentRef = ref<HTMLElement>()
  const offset = ref(0)
  const looping = ref(false)
  const paused = ref(false)

  let loopLength = 0
  let frame = 0
  let lastTick = 0
  let observer: ResizeObserver | null = null

  const measure = () => {
    const viewport = viewportRef.value
    const content = contentRef.value

    if (!viewport || !content) {
      return
    }

    const overflowing = content.offsetHeight > viewport.clientHeight + 2
    loopLength = content.offsetHeight + props.gap

    if (looping.value !== overflowing) {
      looping.value = overflowing
      offset.value = 0
    }
  }

  const tick = (now: number) => {
    const elapsed = lastTick ? now - lastTick : 0
    lastTick = now

    if (looping.value && !paused.value && loopLength > 0) {
      offset.value = (offset.value + (props.speed * elapsed) / 1000) % loopLength
    }

    frame = requestAnimationFrame(tick)
  }

  onMounted(() => {
    measure()

    if (contentRef.value) {
      observer = new ResizeObserver(measure)
      observer.observe(contentRef.value)
    }

    frame = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    observer?.disconnect()
    observer = null
  })
</script>

<style scoped lang="scss">
  .scroll-box {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;

    /* 上下边缘淡出，条目滚入滚出时不会硬切 */
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0,
      #000 12px,
      #000 calc(100% - 12px),
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0,
      #000 12px,
      #000 calc(100% - 12px),
      transparent 100%
    );
  }

  .scroll-box__track {
    will-change: transform;
  }
</style>
