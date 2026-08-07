<template>
  <div v-if="groups.length > 0" class="group-grid">
    <div v-for="group in groups" :key="group.id" class="group-card" @click="$emit('enter', group)">
      <div class="group-icon">
        <ArtSvgIcon icon="ri:folder-fill" />
      </div>
      <div class="group-info">
        <div class="group-name-row">
          <span class="group-name">{{ group.name }}</span>
          <span class="group-sort-badge" v-if="group.sort > 0">#{{ group.sort }}</span>
        </div>
        <div v-if="canDelete(group)" class="group-actions" @click.stop>
          <div class="action-btn edit-btn" @click="$emit('edit', group)" title="编辑分组">
            <ArtSvgIcon icon="ri:edit-line" />
          </div>
          <ElPopconfirm
            title="删除共享分组会把其中项目移回根目录，确定删除吗？"
            width="240"
            @confirm="$emit('delete', group)"
          >
            <template #reference>
              <div class="action-btn delete-btn">
                <ArtSvgIcon icon="ri:delete-bin-line" />
              </div>
            </template>
          </ElPopconfirm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type ProjectGroup } from '@/api/project'

  const props = defineProps<{
    groups: ProjectGroup[]
    currentUserId?: number
    isPlatformAdmin?: boolean
  }>()

  defineEmits(['enter', 'edit', 'delete'])

  const canDelete = (group: ProjectGroup) => {
    return props.isPlatformAdmin === true || (!!props.currentUserId && group.ownerId === props.currentUserId)
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

        .group-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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

          &.edit-btn:hover {
            color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
          }

          &.delete-btn:hover {
            color: var(--el-color-danger);
            background-color: var(--el-color-danger-light-9);
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

      .group-name {
        font-size: 15px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 4px;
        flex: 1;
      }

      .group-actions {
        flex-shrink: 0;

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          color: var(--el-text-color-regular);
          border-radius: 6px;
          transition: all 0.2s;
          cursor: pointer;

          &:hover {
            color: var(--el-color-danger);
            background-color: var(--el-color-danger-light-9);
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
        .group-name {
          font-size: 13px;
        }

        .group-actions {
          .delete-btn {
            width: 28px;
            height: 28px;
            font-size: 16px;
          }
        }
      }
    }
  }
</style>
