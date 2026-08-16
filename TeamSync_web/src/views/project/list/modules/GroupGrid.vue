<template>
  <div v-if="groups.length > 0" class="group-grid">
    <div v-for="group in groups" :key="group.id" class="group-card" @click="$emit('enter', group)">
      <div class="group-icon">
        <ArtSvgIcon icon="ri:folder-fill" />
      </div>
      <div class="group-info">
        <div class="group-name-row">
          <ElTooltip
            :disabled="!isNameOverflowed(group.id)"
            :content="group.name"
            placement="top"
            :show-after="300"
          >
            <span :ref="(el: any) => setNameEl(el, group.id)" class="group-name">{{
              group.name
            }}</span>
          </ElTooltip>
          <span class="group-sort-badge" v-if="group.sort > 0">#{{ group.sort }}</span>
        </div>
        <div v-if="canDelete(group)" class="group-actions" @click.stop>
          <ElDropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, group)">
            <div class="action-btn more-btn">
              <ArtSvgIcon icon="ri:more-2-fill" />
            </div>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="edit">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />编辑分组
                </ElDropdownItem>
                <ElDropdownItem command="delete" divided style="color: var(--el-color-danger)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />删除分组
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { type ProjectGroup } from '@/api/project'

  const props = defineProps<{
    groups: ProjectGroup[]
    currentUserId?: number
    isPlatformAdmin?: boolean
  }>()

  const emit = defineEmits(['enter', 'edit', 'delete'])

  // ---------- 分组名溢出检测（仅名称被截断时显示 tooltip） ----------
  const nameEls = new Map<number, HTMLElement>()
  const overflowGroupIds = ref<Set<number>>(new Set())

  const setNameEl = (el: unknown, groupId: number) => {
    if (el) nameEls.set(groupId, el as HTMLElement)
    else nameEls.delete(groupId)
  }

  const checkNameOverflow = () => {
    const set = new Set<number>()
    nameEls.forEach((el, id) => {
      if (el.scrollWidth > el.clientWidth + 1) set.add(id)
    })
    overflowGroupIds.value = set
  }

  const isNameOverflowed = (groupId: number) => overflowGroupIds.value.has(groupId)

  watch(
    () => props.groups,
    () => nextTick(checkNameOverflow),
    { deep: true }
  )

  onMounted(() => {
    window.addEventListener('resize', checkNameOverflow)
    nextTick(checkNameOverflow)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkNameOverflow)
  })

  // ---------- 操作下拉（编辑 / 删除） ----------
  const handleCommand = (cmd: string, group: ProjectGroup) => {
    if (cmd === 'edit') {
      emit('edit', group)
      return
    }
    ElMessageBox.confirm('删除共享分组会把其中项目移回根目录，确定删除吗？', '删除分组', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    })
      .then(() => emit('delete', group))
      .catch(() => {})
  }

  const canDelete = (group: ProjectGroup) => {
    return (
      props.isPlatformAdmin === true ||
      (!!props.currentUserId && group.ownerId === props.currentUserId)
    )
  }
</script>

<style lang="scss" scoped>
  .group-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 768px) {
    .group-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 0 4px;
    }
  }

  .group-card {
    display: flex;
    align-items: center;
    background-color: var(--el-fill-color-light);
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background-color: #fff;
      border-color: var(--el-color-primary-light-5);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

      .group-icon {
        transform: scale(1.1);
        color: var(--el-color-primary);
      }
    }

    .group-icon {
      font-size: 36px;
      color: var(--el-color-primary-light-3);
      margin-right: 12px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .group-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      overflow: hidden;
      min-width: 0;

      .group-name-row {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow: hidden;
        flex: 1;

        // ElTooltip 会用 span 包裹内容，需让它撑满剩余宽度，内部名称才能正确截断
        :deep(.el-tooltip__trigger) {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
        }

        .group-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }

        .group-sort-badge {
          font-size: 11px;
          color: var(--el-color-info);
          background-color: var(--el-fill-color);
          padding: 0 6px;
          border-radius: 4px;
          line-height: 18px;
          flex-shrink: 0;
        }
      }

      .group-actions {
        display: flex;
        gap: 2px;
        flex-shrink: 0;

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: all 0.2s;
          cursor: pointer;
          color: var(--el-text-color-regular);

          &.more-btn:hover {
            color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .group-card {
      padding: 12px;

      .group-icon {
        font-size: 24px;
        margin-right: 8px;
      }

      .group-info {
        .group-name-row {
          .group-name {
            font-size: 13px;
          }
        }

        .group-actions {
          .action-btn {
            width: 28px;
            height: 28px;
            font-size: 16px;
          }
        }
      }
    }
  }
</style>
