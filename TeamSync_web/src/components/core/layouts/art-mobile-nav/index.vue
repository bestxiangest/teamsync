<template>
  <!-- 移动端底部导航栏 -->
  <nav class="mobile-nav">
    <div
      v-for="item in navItems"
      :key="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="handleNavClick(item)"
    >
      <component :is="item.icon" class="nav-icon" />
      <span class="nav-label">{{ item.label }}</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { HomeFilled, FolderOpened, ChatDotRound, User } from '@element-plus/icons-vue'

  defineOptions({ name: 'ArtMobileNav' })

  const router = useRouter()
  const route = useRoute()

  // 导航项配置
  const navItems = [
    {
      path: '/dashboard/console',
      label: '工作台',
      icon: HomeFilled,
      matchPaths: ['/dashboard', '/console']
    },
    {
      path: '/project/list',
      label: '项目',
      icon: FolderOpened,
      matchPaths: ['/project', '/board']
    },
    {
      path: '/message',
      label: '消息',
      icon: ChatDotRound,
      matchPaths: ['/message']
    },
    {
      path: '/user/center',
      label: '我的',
      icon: User,
      matchPaths: ['/profile', '/user', '/system/user-center']
    }
  ]

  // 判断当前路由是否激活
  const isActive = (path: string) => {
    const item = navItems.find((nav) => nav.path === path)
    if (!item) return false
    return item.matchPaths.some((matchPath) => route.path.startsWith(matchPath))
  }

  // 处理导航点击
  const handleNavClick = (item: (typeof navItems)[0]) => {
    // 消息和我的暂时只是占位，可以跳转到对应页面或提示
    if (item.path === '/message') {
      ElMessage.info('消息功能开发中...')
      return
    }
    if (item.path === '/user/center') {
      router.push({ name: 'UserCenter' })
      return
    }
    router.push(item.path)
  }
</script>

<style lang="scss" scoped>
  .mobile-nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 50px;
    padding-bottom: env(safe-area-inset-bottom); // 适配 iPhone 底部安全区
    background: var(--default-box-color, #fff);
    border-top: 1px solid var(--el-border-color-lighter, #ebeef5);

    .nav-item {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--el-text-color-secondary, #909399);
      cursor: pointer;
      transition: color 0.2s ease;

      &:active {
        opacity: 0.7;
      }

      &.active {
        color: var(--el-color-primary, #409eff);

        .nav-icon {
          transform: scale(1.1);
        }
      }

      .nav-icon {
        width: 22px;
        height: 22px;
        margin-bottom: 2px;
        transition: transform 0.2s ease;
      }

      .nav-label {
        font-size: 11px;
        line-height: 1.2;
      }
    }
  }

  // 暗黑模式适配
  :root.dark {
    .mobile-nav {
      background: var(--default-box-color, #1e1e1e);
      border-top-color: var(--el-border-color-darker, #4c4d4f);
    }
  }
</style>
