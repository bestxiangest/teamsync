<!-- 登录页左侧：极光背景 + 艺术标语 -->
<template>
  <div class="login-left-view">
    <!-- Logo -->
    <div class="logo">
      <ArtLogo class="icon" size="46" />
      <h1 class="title">{{ AppConfig.systemInfo.name }}</h1>
    </div>

    <!-- 艺术标语 -->
    <div class="slogan-wrap" v-if="!hideContent">
      <div class="slogan-line slogan-line-1">无界协作，</div>
      <div class="slogan-line slogan-line-2">
        重塑团队<span class="slogan-emphasis">流动</span>之美。
      </div>
      <p class="slogan-sub">打破信息孤岛，让工作像水一样自然流淌。</p>
      <div class="slogan-divider"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'

  defineProps<{
    hideContent?: boolean
  }>()
</script>

<style>
  @import '@/views/auth/login/style.css';
</style>
