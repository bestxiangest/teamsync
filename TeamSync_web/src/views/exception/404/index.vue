<!-- 自定义 404 页面，不依赖框架内置异常组件 -->
<template>
  <main class="not-found-page">
    <section class="not-found-card">
      <img :src="imgUrl" alt="404 not found" class="not-found-image" />
      <h1 class="not-found-title">404</h1>
      <p class="not-found-desc">页面不存在，或登录状态已失效，请重新登录。</p>

      <button type="button" class="login-btn" @click="goToLogin">返回登录</button>
      <p class="path-hint">跳转地址：/#/auth/login</p>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import imgUrl from '@imgs/svg/404.svg'

  defineOptions({ name: 'Exception404' })

  const LOGIN_HASH_PATH = '/#/auth/login'
  const userStore = useUserStore()

  const goToLogin = (): void => {
    userStore.logOut(false)
    window.location.replace(LOGIN_HASH_PATH)
  }
</script>

<style scoped>
  .not-found-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%);
  }

  .not-found-card {
    width: min(460px, 100%);
    padding: 32px 28px;
    text-align: center;
    border-radius: 16px;
    background-color: #ffffff;
    box-shadow: 0 16px 40px rgba(24, 39, 75, 0.12);
  }

  .not-found-image {
    width: min(260px, 100%);
    margin: 0 auto 16px;
  }

  .not-found-title {
    margin: 0;
    font-size: 52px;
    line-height: 1;
    color: #1f2d3d;
  }

  .not-found-desc {
    margin: 14px 0 24px;
    color: #596d87;
    font-size: 14px;
    line-height: 1.7;
  }

  .login-btn {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: #1677ff;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .login-btn:hover {
    background: #0e5fd8;
  }

  .path-hint {
    margin-top: 12px;
    color: #8a97a8;
    font-size: 12px;
  }
</style>
