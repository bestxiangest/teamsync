<template>
  <main class="task-reminder-screen" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">
    <ScreenHeader
      :page-title="currentPage.title"
      :page-index="currentPageIndex"
      :page-total="pages.length"
      :now="currentTime"
    />

    <button class="screen-exit-button" type="button" @click="exitScreen">退出</button>

    <section class="task-reminder-screen__stage">
      <Transition :name="transitionName" mode="out-in">
        <component
          :is="currentPage.component"
          :key="currentPage.key"
          :data="displayScreenData"
          class="task-reminder-screen__page"
          @open-detail="openDetailDialog"
        />
      </Transition>
    </section>

    <div class="screen-indicator" aria-label="页面轮播状态">
      <span
        v-for="(page, index) in pages"
        :key="page.key"
        role="button"
        tabindex="0"
        class="screen-indicator__dot"
        :class="{ 'screen-indicator__dot--active': index === currentPageIndex }"
        :aria-label="`切换到${page.title}`"
        @click="handleIndicatorClick(index)"
        @keydown.enter.prevent="handleIndicatorClick(index)"
        @keydown.space.prevent="handleIndicatorClick(index)"
      ></span>
      <span class="screen-indicator__text">
        {{ isCarouselPaused ? '鼠标悬停，轮播已暂停' : '20 秒自动切换 · 60 秒刷新数据' }}
      </span>
    </div>

    <ScreenDetailDialog
      v-model="detailDialogVisible"
      :title="detailDialog.title"
      :type="detailDialog.type"
      :data="displayScreenData"
      @closed="resumeCarousel"
    />
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import type { Component } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    getTaskReminderScreenData,
    mockTaskReminderScreenData,
    type TaskReminderScreenData
  } from '@/api/big-screen'
  import PageAssigneeWall from './components/PageAssigneeWall.vue'
  import PageOverview from './components/PageOverview.vue'
  import PageSevenDays from './components/PageSevenDays.vue'
  import ScreenHeader from './components/ScreenHeader.vue'
  import ScreenDetailDialog from './components/ScreenDetailDialog.vue'
  import type { ScreenDetailRequest } from './components/detail-dialog'

  interface ScreenPageConfig {
    key: string
    title: string
    component: Component
  }

  const CAROUSEL_INTERVAL = 20_000
  const DATA_REFRESH_INTERVAL = 60_000
  const router = useRouter()

  const pages: ScreenPageConfig[] = [
    {
      key: 'overview',
      title: '今日任务总览',
      component: PageOverview
    },
    {
      key: 'assignee-wall',
      title: '责任人待办墙',
      component: PageAssigneeWall
    },
    {
      key: 'seven-days',
      title: '未来 7 日提醒',
      component: PageSevenDays
    }
  ]

  const screenData = ref<TaskReminderScreenData>(mockTaskReminderScreenData)
  const currentPageIndex = ref(0)
  const currentTime = ref(new Date())
  const transitionName = ref('screen-slide-next')
  const isCarouselPaused = ref(false)
  const detailDialogVisible = ref(false)
  const detailDialog = ref<ScreenDetailRequest>({
    type: 'urgentTasks',
    title: '全部高优先级任务'
  })

  let carouselTimer: ReturnType<typeof setInterval> | null = null
  let dataRefreshTimer: ReturnType<typeof setInterval> | null = null
  let timeTimer: ReturnType<typeof setInterval> | null = null

  const currentPage = computed(() => pages[currentPageIndex.value])

  const HIDDEN_PERSON_NAME = 'zzn'

  const isHiddenPerson = (name: string | null | undefined) =>
    name?.trim().toLowerCase() === HIDDEN_PERSON_NAME

  const sanitizePersonList = (value: string | null | undefined) => {
    const names = (value ?? '')
      .split(/\s*(?:\/|,|，|、)\s*/)
      .map((name) => name.trim())
      .filter(Boolean)

    return names.filter((name) => !isHiddenPerson(name)).join(' / ')
  }

  const hideDeveloperFromScreenData = (data: TaskReminderScreenData): TaskReminderScreenData => {
    const urgentTasks = data.urgentTasks
      .map((task) => ({ ...task, assigneeName: sanitizePersonList(task.assigneeName) }))
      .filter((task) => task.assigneeName)
    const recurringPlans = data.recurringPlans
      .map((plan) => ({ ...plan, assigneeName: sanitizePersonList(plan.assigneeName) }))
      .filter((plan) => plan.assigneeName)
    const dailyFocus = data.dailyFocus
      .map((item) => ({ ...item, assigneeName: sanitizePersonList(item.assigneeName) }))
      .filter((item) => item.assigneeName)
    const collaborationReminders = data.collaborationReminders
      .map((item) => ({ ...item, people: sanitizePersonList(item.people) }))
      .filter((item) => item.people)

    return {
      ...data,
      urgentTasks,
      recurringPlans,
      dailyFocus,
      collaborationReminders,
      assigneeWall: data.assigneeWall.filter((assignee) => !isHiddenPerson(assignee.name)),
      workloadRanking: data.workloadRanking
        .filter((rank) => !isHiddenPerson(rank.name))
        .map((rank, index) => ({ ...rank, rank: index + 1 }))
    }
  }

  const displayScreenData = computed(() => hideDeveloperFromScreenData(screenData.value))

  const stopCarousel = () => {
    if (carouselTimer) {
      clearInterval(carouselTimer)
      carouselTimer = null
    }
  }

  const startCarousel = () => {
    stopCarousel()
    if (isCarouselPaused.value) {
      return
    }

    carouselTimer = setInterval(() => {
      goToPage(currentPageIndex.value + 1, 'next', false)
    }, CAROUSEL_INTERVAL)
  }

  const goToPage = (
    targetIndex: number,
    direction: 'next' | 'prev',
    restartTimer: boolean = true
  ) => {
    const normalizedIndex = (targetIndex + pages.length) % pages.length
    transitionName.value = direction === 'next' ? 'screen-slide-next' : 'screen-slide-prev'
    currentPageIndex.value = normalizedIndex

    if (restartTimer) {
      startCarousel()
    }
  }

  const handleIndicatorClick = (targetIndex: number) => {
    if (targetIndex === currentPageIndex.value) {
      return
    }

    const direction = targetIndex > currentPageIndex.value ? 'next' : 'prev'
    goToPage(targetIndex, direction)
  }

  const pauseCarousel = () => {
    isCarouselPaused.value = true
    stopCarousel()
  }

  const resumeCarousel = () => {
    if (detailDialogVisible.value) {
      return
    }

    isCarouselPaused.value = false
    startCarousel()
  }

  const openDetailDialog = (payload: ScreenDetailRequest) => {
    detailDialog.value = {
      type: payload.type,
      title: payload.title
    }
    detailDialogVisible.value = true
    pauseCarousel()
  }

  const refreshData = async () => {
    try {
      screenData.value = await getTaskReminderScreenData()
    } catch (error) {
      console.error('[TaskReminderScreen] 刷新大屏数据失败:', error)
    }
  }

  const exitScreen = () => {
    if (window.opener && !window.opener.closed) {
      window.close()
      return
    }

    if (window.history.length > 1) {
      router.back()
      return
    }

    void router.push('/dashboard/console')
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToPage(currentPageIndex.value + 1, 'next')
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToPage(currentPageIndex.value - 1, 'prev')
    }
  }

  onMounted(() => {
    void refreshData()

    timeTimer = setInterval(() => {
      currentTime.value = new Date()
    }, 1000)

    dataRefreshTimer = setInterval(() => {
      void refreshData()
    }, DATA_REFRESH_INTERVAL)

    startCarousel()
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    stopCarousel()

    if (timeTimer) {
      clearInterval(timeTimer)
      timeTimer = null
    }

    if (dataRefreshTimer) {
      clearInterval(dataRefreshTimer)
      dataRefreshTimer = null
    }

    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<style scoped lang="scss">
  .task-reminder-screen {
    --screen-bg: #f5f7fb;
    --card-bg: #ffffff;
    --border-color: #e5eaf3;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --primary: #2563eb;
    --danger: #ef4444;
    --warning: #f97316;
    --success: #16a34a;
    --purple: #7c3aed;
    --screen-shadow: 0 8px 22px rgb(15 23 42 / 5%);

    display: grid;
    width: 100vw;
    height: 100vh;
    grid-template-rows: auto minmax(0, 1fr) 22px;
    gap: 14px;
    padding: 22px 28px 14px;
    overflow: hidden;
    color: var(--text-primary);
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--screen-bg);
  }

  .task-reminder-screen__stage {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .task-reminder-screen__page {
    min-width: 0;
    min-height: 0;
  }

  .screen-exit-button {
    position: fixed;
    right: 28px;
    bottom: 42px;
    z-index: 2600;
    height: 30px;
    padding: 0 14px;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 999px;
    box-shadow: 0 8px 18px rgb(15 23 42 / 9%);
    transition:
      color 160ms ease,
      border-color 160ms ease,
      transform 160ms ease;
  }

  .screen-exit-button:hover {
    color: var(--primary);
    border-color: #bfdbfe;
    transform: translateY(-1px);
  }

  .screen-indicator {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .screen-indicator__dot {
    width: 8px;
    height: 8px;
    padding: 0;
    cursor: pointer;
    background: #cbd5e1;
    border: 0;
    border-radius: 50%;
    transition:
      width 180ms ease,
      background-color 180ms ease,
      transform 180ms ease;
  }

  .screen-indicator__dot:hover {
    background: #93c5fd;
    transform: translateY(-1px);
  }

  .screen-indicator__dot--active {
    width: 22px;
    background: var(--primary);
    border-radius: 999px;
  }

  .screen-indicator__text {
    margin-left: 4px;
    white-space: nowrap;
  }

  .screen-slide-next-enter-active,
  .screen-slide-next-leave-active,
  .screen-slide-prev-enter-active,
  .screen-slide-prev-leave-active {
    transition:
      opacity 260ms ease,
      transform 260ms ease;
  }

  .screen-slide-next-enter-from {
    opacity: 0;
    transform: translateX(18px);
  }

  .screen-slide-next-leave-to {
    opacity: 0;
    transform: translateX(-18px);
  }

  .screen-slide-prev-enter-from {
    opacity: 0;
    transform: translateX(-18px);
  }

  .screen-slide-prev-leave-to {
    opacity: 0;
    transform: translateX(18px);
  }

  @media (max-width: 1500px) {
    .task-reminder-screen {
      grid-template-rows: auto minmax(0, 1fr) 18px;
      gap: 10px;
      padding: 14px 18px 10px;
    }

    .screen-indicator {
      font-size: 11px;
    }
  }
</style>
