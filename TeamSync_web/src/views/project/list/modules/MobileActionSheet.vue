<template>
  <ElDrawer
    v-model="addVisible"
    direction="btt"
    size="auto"
    :with-header="false"
    class="mobile-action-drawer"
  >
    <div class="action-list">
      <div class="action-item" @click="$emit('add-action', 'project')">
        <ArtSvgIcon icon="ri:add-line" />
        <span>新建项目</span>
      </div>
      <div class="action-item" @click="$emit('add-action', 'group')">
        <ArtSvgIcon icon="ri:folder-add-line" />
        <span>新建分组</span>
      </div>
      <div class="action-cancel" @click="addVisible = false">取消</div>
    </div>
  </ElDrawer>

  <ElDrawer
    v-model="moreVisible"
    direction="btt"
    size="auto"
    :with-header="false"
    class="mobile-action-drawer"
  >
    <div class="action-list" v-if="project">
      <div class="action-title">{{ project.name }}</div>

      <template v-if="activeTab === 'active'">
        <div class="action-item" @click="$emit('project-action', 'move')">
          <ArtSvgIcon icon="ri:folder-transfer-line" />
          <span>移动到...</span>
        </div>

        <div v-if="isOwner" class="action-item" @click="$emit('project-action', 'edit')">
          <ArtSvgIcon icon="ri:settings-3-line" />
          <span>设置</span>
        </div>

        <div v-if="canManageProject" class="action-item" @click="$emit('project-action', 'archive')">
          <ArtSvgIcon icon="ri:archive-line" />
          <span>归档</span>
        </div>

        <div v-if="canManageProject" class="action-item danger" @click="$emit('project-action', 'delete')">
          <ArtSvgIcon icon="ri:delete-bin-line" />
          <span>删除</span>
        </div>

        <div v-if="canQuitProject" class="action-item danger" @click="$emit('project-action', 'quit')">
          <ArtSvgIcon icon="ri:logout-box-r-line" />
          <span>退出项目</span>
        </div>
      </template>

      <template v-else>
        <div v-if="canManageProject" class="action-item" @click="$emit('project-action', 'unarchive')">
          <ArtSvgIcon icon="ri:inbox-unarchive-line" />
          <span>还原项目</span>
        </div>
        <div v-if="canManageProject" class="action-item danger" @click="$emit('project-action', 'delete')">
          <ArtSvgIcon icon="ri:delete-bin-line" />
          <span>删除项目</span>
        </div>
        <div v-if="canQuitProject" class="action-item danger" @click="$emit('project-action', 'quit')">
          <ArtSvgIcon icon="ri:logout-box-r-line" />
          <span>退出项目</span>
        </div>
      </template>

      <div class="action-cancel" @click="moreVisible = false">取消</div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { type Project } from '@/api/project'
  import { useUserStore } from '@/store/modules/user'

  const userStore = useUserStore()

  const props = defineProps<{
    addModelValue: boolean
    moreModelValue: boolean
    project: Project | null
    activeTab: string
  }>()

  const isSystemAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
  })

  const isOwner = computed(() => {
    return !!props.project && userStore.info?.userId === props.project.ownerId
  })

  const canManageProject = computed(() => {
    return isOwner.value || isSystemAdmin.value
  })

  const canQuitProject = computed(() => {
    return !!props.project && !isOwner.value
  })

  const emit = defineEmits([
    'update:addModelValue',
    'update:moreModelValue',
    'add-action',
    'project-action'
  ])

  const addVisible = computed({
    get: () => props.addModelValue,
    set: (val) => emit('update:addModelValue', val)
  })

  const moreVisible = computed({
    get: () => props.moreModelValue,
    set: (val) => emit('update:moreModelValue', val)
  })
</script>

<style lang="scss" scoped>
  .mobile-action-drawer {
    :deep(.el-drawer__body) {
      padding: 0;
      background-color: transparent;
    }
  }

  .action-list {
    background-color: #fff;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    overflow: hidden;
    padding-bottom: env(safe-area-inset-bottom);

    .action-title {
      padding: 16px;
      text-align: center;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      font-size: 16px;
      color: var(--el-text-color-primary);
      cursor: pointer;

      &:active {
        background-color: #f5f5f5;
      }

      .art-svg-icon {
        font-size: 20px;
        color: var(--el-text-color-regular);
      }

      &.danger {
        color: var(--el-color-danger);

        .art-svg-icon {
          color: var(--el-color-danger);
        }
      }
    }

    .action-cancel {
      padding: 16px;
      text-align: center;
      font-size: 16px;
      color: var(--el-text-color-regular);
      border-top: 8px solid #f5f5f5;
      cursor: pointer;

      &:active {
        background-color: #f5f5f5;
      }
    }
  }
</style>
