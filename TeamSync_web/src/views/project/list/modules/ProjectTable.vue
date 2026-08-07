<template>
  <ElTable
    v-loading="loading"
    :data="projects"
    stripe
    style="width: 100%"
    :empty-text="activeTab === 'active' ? '暂无项目，点击右上角创建您的第一个项目' : '暂无归档项目'"
  >
    <ElTableColumn prop="id" label="ID" width="80" v-if="0" />
    <ElTableColumn prop="name" label="项目名称" min-width="200">
      <template #default="{ row }">
        <span class="project-name" @click="$emit('view', row)">{{ row.name }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn v-if="showGroupColumn" prop="groupId" label="所属分组" width="150">
      <template #default="{ row }">
        <ElTag v-if="row.groupId > 0" type="info" size="small">
          {{ getGroupName(row.groupId) }}
        </ElTag>
        <span v-else class="text-gray-400">根目录</span>
      </template>
    </ElTableColumn>

    <ElTableColumn prop="description" label="项目描述" min-width="300">
      <template #default="{ row }">
        <span class="description">{{ row.description || '暂无描述' }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn prop="progress" label="进度" width="120">
      <template #default="{ row }">
        <ElProgress :percentage="row.progress || 0" :stroke-width="6" />
      </template>
    </ElTableColumn>

    <ElTableColumn prop="createdAt" label="创建时间" width="180">
      <template #default="{ row }">
        {{ formatDateTime(row.createdAt) }}
      </template>
    </ElTableColumn>

    <ElTableColumn label="操作" width="340" fixed="right">
      <template #default="{ row }">
        <template v-if="activeTab === 'active'">
          <ElButton type="primary" link size="small" @click="$emit('view', row)">
            <ArtSvgIcon icon="ri:dashboard-3-line" class="mr-1" />
            看板
          </ElButton>
          <ElButton type="success" link size="small" @click="$emit('files', row)">
            <ArtSvgIcon icon="ri:folder-line" class="mr-1" />
            文档
          </ElButton>

          <ElDropdown trigger="click" @command="(cmd: string) => $emit('command', cmd, row)">
            <ElButton link size="small" class="ml-2">
              更多<ArtSvgIcon icon="ri:arrow-down-s-line" class="el-icon--right" />
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="move">
                  <ArtSvgIcon icon="ri:folder-transfer-line" class="mr-1" />移动到...
                </ElDropdownItem>

                <ElDropdownItem v-if="isOwner(row)" command="edit">
                  <ArtSvgIcon icon="ri:settings-3-line" class="mr-1" />设置
                </ElDropdownItem>

                <ElDropdownItem v-if="canManageProject(row)" command="archive">
                  <ArtSvgIcon icon="ri:archive-line" class="mr-1" />归档
                </ElDropdownItem>

                <ElDropdownItem
                  v-if="canManageProject(row)"
                  command="delete"
                  divided
                  style="color: var(--el-color-danger)"
                >
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />删除
                </ElDropdownItem>

                <ElDropdownItem
                  v-if="canQuitProject(row)"
                  command="quit"
                  :divided="canManageProject(row)"
                  style="color: var(--el-color-danger)"
                >
                  <ArtSvgIcon icon="ri:logout-box-r-line" class="mr-1" />退出项目
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>

        <template v-else>
          <ElButton type="primary" link size="small" @click="$emit('view', row)">
            <ArtSvgIcon icon="ri:dashboard-3-line" class="mr-1" />
            查看看板
          </ElButton>
          <ElButton v-if="canManageProject(row)" type="success" link size="small" @click="$emit('unarchive', row)">
            <ArtSvgIcon icon="ri:inbox-unarchive-line" class="mr-1" />
            还原项目
          </ElButton>
          <ElButton v-if="canManageProject(row)" type="danger" link size="small" @click="$emit('delete', row)">
            <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
            删除
          </ElButton>
          <ElButton
            v-if="canQuitProject(row)"
            type="danger"
            link
            size="small"
            @click="$emit('command', 'quit', row)"
          >
            <ArtSvgIcon icon="ri:logout-box-r-line" class="mr-1" />
            退出项目
          </ElButton>
        </template>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { type Project, type ProjectGroup } from '@/api/project'
  import { useUserStore } from '@/store/modules/user'

  const userStore = useUserStore()

  const props = defineProps<{
    projects: Project[]
    loading: boolean
    activeTab: string
    showGroupColumn?: boolean
    groups?: ProjectGroup[]
  }>()

  defineEmits(['view', 'files', 'command', 'unarchive', 'delete'])

  const isSystemAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
  })

  const isOwner = (row: Project) => {
    return userStore.info?.userId === row.ownerId
  }

  const canManageProject = (row: Project) => {
    return isOwner(row) || isSystemAdmin.value
  }

  const canQuitProject = (row: Project) => {
    return !isOwner(row)
  }

  const getGroupName = (groupId: number): string => {
    if (!props.groups || groupId <= 0) return '根目录'
    const group = props.groups.find((item) => item.id === groupId)
    return group?.name || '未知分组'
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
</script>

<style lang="scss" scoped>
  .project-name {
    font-weight: 500;
    color: var(--el-color-primary);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .description {
    color: var(--el-text-color-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mr-1 {
    margin-right: 4px;
  }
</style>
