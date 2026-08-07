<template>
  <div class="mobile-project-list" v-loading="loading">
    <div v-if="projects.length === 0 && !loading" class="empty-state">
      <ArtSvgIcon icon="ri:folder-open-line" class="empty-icon" />
      <span>{{ activeTab === 'active' ? '暂无项目' : '暂无归档项目' }}</span>
    </div>

    <div
      v-for="project in projects"
      :key="project.id"
      class="mobile-project-card"
      @click="$emit('view', project)"
    >
      <div class="card-header">
        <div class="project-icon-wrapper">
          <div class="project-icon">{{ project.name.charAt(0).toUpperCase() }}</div>
        </div>
        <div class="project-main-info">
          <div class="project-name">{{ project.name }}</div>
          <!-- 显示分组名称 -->
          <div v-if="showGroupName" class="project-group">
            <ElTag size="small" type="info">{{ getGroupName(project.groupId) }}</ElTag>
          </div>
          <div class="project-description" v-if="project.description">
            {{ project.description }}
          </div>
        </div>
        <div class="project-more" @click.stop="$emit('more', project)">
          <ArtSvgIcon icon="ri:more-2-fill" />
        </div>
      </div>

      <div class="card-body">
        <div class="progress-section">
          <div class="progress-label">进度: {{ project.progress || 0 }}%</div>
          <ElProgress :percentage="project.progress || 0" :show-text="false" :stroke-width="4" />
        </div>
      </div>

      <div class="card-footer">
        <div class="footer-action" @click.stop="$emit('view', project)">
          <ArtSvgIcon icon="ri:dashboard-3-line" />
          <span>看板</span>
        </div>
        <div class="footer-action" @click.stop="$emit('files', project)">
          <ArtSvgIcon icon="ri:folder-line" />
          <span>文档</span>
        </div>
        <div class="footer-action" @click.stop="$emit('more', project)">
          <ArtSvgIcon icon="ri:settings-3-line" />
          <span>更多</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type Project, type ProjectGroup } from '@/api/project'

  const props = defineProps<{
    projects: Project[]
    loading: boolean
    activeTab: string
    showGroupName?: boolean
    groups?: ProjectGroup[]
  }>()

  defineEmits(['view', 'files', 'more'])

  /**
   * 获取分组名称
   */
  const getGroupName = (groupId: number): string => {
    if (!props.groups || groupId <= 0) return '根目录'
    const group = props.groups.find((g) => g.id === groupId)
    return group?.name || '未知分组'
  }
</script>

<style lang="scss" scoped>
  .mobile-project-list {
    padding: 10px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 150px);
  }

  .mobile-project-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;

    &:active {
      background-color: #f9f9f9;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .project-icon-wrapper {
        flex-shrink: 0;
        .project-icon {
          width: 44px;
          height: 44px;
          background-color: var(--el-color-primary-light-8);
          color: var(--el-color-primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }
      }

      .project-main-info {
        flex: 1;
        overflow: hidden;

        .project-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-description {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
      }

      .project-more {
        padding: 4px;
        color: var(--el-text-color-secondary);
        font-size: 20px;
      }
    }

    .card-body {
      .progress-section {
        .progress-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 6px;
        }
      }
    }

    .card-footer {
      display: flex;
      border-top: 1px solid var(--el-border-color-lighter);
      padding-top: 12px;
      margin-top: 4px;

      .footer-action {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: var(--el-text-color-regular);
        font-size: 12px;

        .art-svg-icon {
          font-size: 20px;
          color: var(--el-color-primary);
        }

        &:active {
          opacity: 0.7;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: var(--el-text-color-secondary);

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
  }
</style>
