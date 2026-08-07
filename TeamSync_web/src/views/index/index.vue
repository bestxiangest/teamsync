<!-- 布局容器 -->
<template>
  <div class="app-layout" :class="{ 'is-mobile': isMobile }">
    <!-- PC 端：显示侧边栏 -->
    <aside v-if="!isMobile" id="app-sidebar">
      <ArtSidebarMenu />
    </aside>

    <main id="app-main">
      <!-- PC 端：显示完整 Header -->
      <div v-if="!isMobile" id="app-header">
        <ArtHeaderBar />
      </div>
      <!-- 移动端：显示简化 Header -->
      <div v-else id="app-header-mobile">
        <div class="mobile-header">
          <ElDropdown trigger="click" @command="handleLogoCommand">
            <div class="logo-wrapper">
              <ArtLogo :size="30" />
              <span class="system-title ml-2">TeamSync</span>
              <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-1 dropdown-icon" />
            </div>
            <template #dropdown>
              <ElDropdownMenu class="mobile-logo-dropdown">
                <template v-if="userStore.isLogin">
                  <div class="user-info-section px-4 py-3 border-b border-gray-50 mb-1">
                    <div class="nickname font-600 text-14px">{{
                      userStore.info?.nickname || userStore.info?.username
                    }}</div>
                    <div class="username text-12px text-gray-400 mt-1">{{
                      userStore.info?.username
                    }}</div>
                  </div>
                  <ElDropdownItem command="user-center">
                    <ArtSvgIcon icon="ri:user-line" class="mr-2" />个人中心
                  </ElDropdownItem>
                  <ElDropdownItem command="logout" divided style="color: var(--el-color-danger)">
                    <ArtSvgIcon icon="ri:logout-box-r-line" class="mr-2" />退出登录
                  </ElDropdownItem>
                </template>
                <template v-else>
                  <ElDropdownItem command="login">
                    <ArtSvgIcon icon="ri:login-box-line" class="mr-2" />登录系统
                  </ElDropdownItem>
                </template>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </div>

      <div id="app-content">
        <ArtPageContent />
      </div>
    </main>

    <!-- 移动端：显示底部导航 -->
    <ArtMobileNav v-if="isMobile" />

    <div id="app-global">
      <ArtGlobalComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
  import ArtMobileNav from '@/components/core/layouts/art-mobile-nav/index.vue'
  import ArtLogo from '@/components/core/base/art-logo/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'AppLayout' })

  const router = useRouter()
  const userStore = useUserStore()

  // 使用 VueUse 的 useMediaQuery 判断是否为移动端
  const isMobile = useMediaQuery('(max-width: 768px)')

  // 提供给子组件使用
  provide('isMobile', isMobile)

  /**
   * 处理 Logo 下拉菜单点击
   */
  const handleLogoCommand = (command: string) => {
    switch (command) {
      case 'login':
        router.push({ name: 'Login' })
        break
      case 'user-center':
        router.push({ name: 'UserCenter' })
        break
      case 'logout':
        handleLogout()
        break
    }
  }

  /**
   * 退出登录
   */
  const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logOut()
    })
  }
</script>

<style lang="scss" scoped>
  @use './style';
</style>
