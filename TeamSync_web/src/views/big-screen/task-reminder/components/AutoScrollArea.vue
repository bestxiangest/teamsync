<template>
  <div
    ref="containerRef"
    class="auto-scroll-area"
    :class="{ 'auto-scroll-area--scrolling': canScroll }"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div ref="contentRef" class="auto-scroll-area__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  const props = withDefaults(
    defineProps<{
      watchKey?: string | number
      speed?: number
      delay?: number
    }>(),
    {
      watchKey: '',
      speed: 1,
      delay: 2200
    }
  )

  const containerRef = ref<HTMLElement>()
  const contentRef = ref<HTMLElement>()
  const canScroll = ref(false)

  let scrollTimer: ReturnType<typeof setInterval> | null = null
  let restartTimer: ReturnType<typeof setTimeout> | null = null
  let isPaused = false

  const clearScrollTimer = () => {
    if (scrollTimer) {
      clearInterval(scrollTimer)
      scrollTimer = null
    }
  }

  const clearRestartTimer = () => {
    if (restartTimer) {
      clearTimeout(restartTimer)
      restartTimer = null
    }
  }

  const measure = () => {
    const container = containerRef.value
    const content = contentRef.value

    if (!container || !content) {
      canScroll.value = false
      return
    }

    canScroll.value = content.scrollHeight > container.clientHeight + 4
  }

  const start = () => {
    clearScrollTimer()
    clearRestartTimer()
    measure()

    if (!canScroll.value || isPaused || !containerRef.value) {
      return
    }

    scrollTimer = setInterval(() => {
      const container = containerRef.value

      if (!container) {
        return
      }

      const maxTop = container.scrollHeight - container.clientHeight

      if (maxTop <= 0) {
        return
      }

      if (container.scrollTop >= maxTop - 1) {
        clearScrollTimer()
        restartTimer = setTimeout(() => {
          if (containerRef.value) {
            containerRef.value.scrollTo({ top: 0, behavior: 'smooth' })
          }
          restartTimer = setTimeout(start, props.delay)
        }, props.delay)
        return
      }

      container.scrollTop += props.speed
    }, 70)
  }

  const pause = () => {
    isPaused = true
    clearScrollTimer()
    clearRestartTimer()
  }

  const resume = () => {
    isPaused = false
    start()
  }

  const reset = async () => {
    clearScrollTimer()
    clearRestartTimer()

    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }

    await nextTick()
    start()
  }

  onMounted(() => {
    void reset()
    window.addEventListener('resize', reset)
  })

  onBeforeUnmount(() => {
    clearScrollTimer()
    clearRestartTimer()
    window.removeEventListener('resize', reset)
  })

  watch(
    () => props.watchKey,
    () => {
      void reset()
    }
  )
</script>

<style scoped lang="scss">
  .auto-scroll-area {
    height: 100%;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: rgb(37 99 235 / 35%) transparent;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  .auto-scroll-area--scrolling {
    mask-image: linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%);
  }

  .auto-scroll-area::-webkit-scrollbar {
    width: 6px;
  }

  .auto-scroll-area::-webkit-scrollbar-track {
    background: transparent;
  }

  .auto-scroll-area::-webkit-scrollbar-thumb {
    background: rgb(37 99 235 / 35%);
    border-radius: 999px;
  }

  .auto-scroll-area::-webkit-scrollbar-thumb:hover {
    background: rgb(37 99 235 / 52%);
  }

  .auto-scroll-area__content {
    min-height: min-content;
  }
</style>
