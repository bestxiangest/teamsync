<template>
  <div class="file-manager">
    <!-- PC 端视图 -->
    <div v-if="!isMobile" class="pc-view">
      <!-- 工具栏 -->
      <div class="toolbar">
        <!-- 面包屑导航 -->
        <ElBreadcrumb separator="/">
          <ElBreadcrumbItem v-for="item in breadcrumb" :key="item.id" @click="navigateTo(item.id)">
            <span class="breadcrumb-item" :class="{ clickable: item.id !== currentParentId }">
              <ArtSvgIcon v-if="item.id === 0" icon="ri:home-4-line" class="mr-1" />
              {{ item.name }}
            </span>
          </ElBreadcrumbItem>
        </ElBreadcrumb>

        <!-- 操作按钮 -->
        <div class="actions">
          <ElButton type="primary" @click="showCreateFolderDialog" v-ripple>
            <template #icon>
              <ArtSvgIcon icon="ri:folder-add-line" />
            </template>
            新建文件夹
          </ElButton>
          <ElUpload
            ref="uploadRef"
            :action="uploadAction"
            :headers="uploadHeaders"
            :data="uploadData"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            multiple
          >
            <ElButton type="success" v-ripple>
              <template #icon>
                <ArtSvgIcon icon="ri:upload-cloud-line" />
              </template>
              上传文件
            </ElButton>
          </ElUpload>
          <ElButton @click="refreshList" v-ripple>
            <template #icon>
              <ArtSvgIcon icon="ri:refresh-line" />
            </template>
            刷新
          </ElButton>
        </div>
      </div>

      <!-- 文件列表 -->
      <ElTable
        v-loading="loading"
        :data="fileList"
        stripe
        style="width: 100%"
        empty-text="暂无文件，点击上方按钮创建文件夹或上传文件"
        @row-dblclick="handleRowDblClick"
      >
        <!-- 名称列 -->
        <ElTableColumn prop="name" label="名称" min-width="300">
          <template #default="{ row }">
            <div class="file-name" @click="handleNameClick(row)">
              <ArtSvgIcon :icon="getFileIcon(row)" class="file-icon" />
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </ElTableColumn>

        <!-- 大小列 -->
        <ElTableColumn prop="fileSizeFormatted" label="大小" width="120">
          <template #default="{ row }">
            {{ row.nodeType === 1 ? row.fileSizeFormatted : '-' }}
          </template>
        </ElTableColumn>

        <!-- 创建人列 -->
        <ElTableColumn prop="creatorName" label="创建人" width="120" />

        <!-- 创建时间列 -->
        <ElTableColumn prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </ElTableColumn>

        <!-- 操作列 -->
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton
              v-if="row.nodeType === 1"
              type="primary"
              link
              size="small"
              @click="handleDownload(row)"
            >
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              下载
            </ElButton>
            <ElButton type="warning" link size="small" @click="showRenameDialog(row)">
              <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
              重命名
            </ElButton>
            <ElPopconfirm
              :title="`确定删除${row.nodeType === 0 ? '文件夹' : '文件'}「${row.name}」吗？`"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <ElButton type="danger" link size="small">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <!-- 移动端视图 -->
    <div v-else class="mobile-view">
      <!-- 顶部导航栏 -->
      <div class="mobile-header">
        <div class="header-left">
          <div v-if="currentParentId !== 0" class="back-btn" @click="handleBack">
            <ArtSvgIcon icon="ri:arrow-left-s-line" />
          </div>
          <span class="current-folder">{{ currentFolderName }}</span>
        </div>
        <div class="header-right">
          <div class="action-btn" @click="showCreateFolderDialog">
            <ArtSvgIcon icon="ri:folder-add-line" />
          </div>
          <ElUpload
            ref="uploadRef"
            :action="uploadAction"
            :headers="uploadHeaders"
            :data="uploadData"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            multiple
            class="mobile-upload"
          >
            <div class="action-btn">
              <ArtSvgIcon icon="ri:upload-cloud-line" />
            </div>
          </ElUpload>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="mobile-file-list" v-loading="loading">
        <div v-if="fileList.length === 0 && !loading" class="empty-state">
          <ArtSvgIcon icon="ri:folder-open-line" class="empty-icon" />
          <span>暂无文件</span>
        </div>

        <div
          v-for="item in fileList"
          :key="item.id"
          class="mobile-file-item"
          @click="handleNameClick(item)"
        >
          <!-- 左侧图标 -->
          <div class="file-icon-wrapper">
            <ArtSvgIcon :icon="getFileIcon(item)" class="file-icon" />
          </div>

          <!-- 中间信息 -->
          <div class="file-info">
            <div class="file-name">{{ item.name }}</div>
            <div class="file-meta">
              <span>{{ formatDateTime(item.createdAt).split(' ')[0] }}</span>
              <span v-if="item.nodeType === 1" class="separator">·</span>
              <span v-if="item.nodeType === 1">{{ item.fileSizeFormatted }}</span>
            </div>
          </div>

          <!-- 右侧更多操作 -->
          <div class="file-actions" @click.stop>
            <ElDropdown trigger="click" @command="(cmd: string) => handleMobileCommand(cmd, item)">
              <div class="more-btn">
                <ArtSvgIcon icon="ri:more-2-fill" />
              </div>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem v-if="item.nodeType === 1" command="download">
                    <ArtSvgIcon icon="ri:download-line" class="mr-1" />下载
                  </ElDropdownItem>
                  <ElDropdownItem command="rename">
                    <ArtSvgIcon icon="ri:edit-line" class="mr-1" />重命名
                  </ElDropdownItem>
                  <ElDropdownItem command="delete" divided style="color: var(--el-color-danger)">
                    <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />删除
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建文件夹弹窗 -->
    <ElDialog
      v-model="folderDialogVisible"
      title="新建文件夹"
      width="400px"
      :close-on-click-modal="false"
      @close="resetFolderForm"
    >
      <ElForm ref="folderFormRef" :model="folderForm" :rules="folderRules" label-width="80px">
        <ElFormItem label="名称" prop="name">
          <ElInput
            v-model="folderForm.name"
            placeholder="请输入文件夹名称"
            maxlength="100"
            show-word-limit
            @keyup.enter="handleCreateFolder"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="folderDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="folderLoading" @click="handleCreateFolder">
          创建
        </ElButton>
      </template>
    </ElDialog>

    <!-- 重命名弹窗 -->
    <ElDialog
      v-model="renameDialogVisible"
      title="重命名"
      width="400px"
      :close-on-click-modal="false"
      @close="resetRenameForm"
    >
      <ElForm ref="renameFormRef" :model="renameForm" :rules="renameRules" label-width="80px">
        <ElFormItem label="名称" prop="name">
          <ElInput
            v-model="renameForm.name"
            placeholder="请输入新名称"
            maxlength="255"
            show-word-limit
            @keyup.enter="handleRename"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="renameDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="renameLoading" @click="handleRename"> 确定 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useMediaQuery } from '@vueuse/core'
  import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules,
    type UploadRawFile
  } from 'element-plus'
  import {
    fetchFileList,
    createFolder,
    deleteFileNode,
    renameFileNode,
    downloadFile,
    FILE_NODE_TYPE,
    type FileNode,
    type BreadcrumbItem
  } from '@/api/file'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'ProjectFiles' })

  const route = useRoute()
  const userStore = useUserStore()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // 从路由参数获取 projectId
  const projectId = computed(() => {
    const id = route.params.projectId
    return id ? Number(id) : 0
  })

  // 状态
  const loading = ref(false)
  const fileList = ref<FileNode[]>([])
  const breadcrumb = ref<BreadcrumbItem[]>([])
  const currentParentId = ref(0)

  // 当前文件夹名称
  const currentFolderName = computed(() => {
    if (breadcrumb.value.length === 0) return '根目录'
    // 如果当前是根目录
    if (currentParentId.value === 0) return '根目录'

    // 查找当前目录名称
    const current = breadcrumb.value.find((item) => item.id === currentParentId.value)
    return current ? current.name : '未知目录'
  })

  // 上传配置
  const uploadRef = ref()
  const uploadAction = computed(() => `/api/files/upload`)
  const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.accessToken}`
  }))
  const uploadData = computed(() => ({
    projectId: projectId.value,
    parentId: currentParentId.value
  }))

  // 新建文件夹弹窗
  const folderDialogVisible = ref(false)
  const folderLoading = ref(false)
  const folderFormRef = ref<FormInstance>()
  const folderForm = reactive({
    name: ''
  })
  const folderRules: FormRules = {
    name: [
      { required: true, message: '请输入文件夹名称', trigger: 'blur' },
      { max: 100, message: '文件夹名称不能超过100个字符', trigger: 'blur' }
    ]
  }

  // 重命名弹窗
  const renameDialogVisible = ref(false)
  const renameLoading = ref(false)
  const renameFormRef = ref<FormInstance>()
  const renameForm = reactive({
    id: 0,
    name: ''
  })
  const renameRules: FormRules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { max: 255, message: '名称不能超过255个字符', trigger: 'blur' }
    ]
  }

  /**
   * 获取文件列表
   */
  const getFileList = async (parentId: number = 0) => {
    loading.value = true
    try {
      const data = await fetchFileList(projectId.value, parentId)
      fileList.value = data?.files || []
      breadcrumb.value = data?.breadcrumb || []
      currentParentId.value = parentId
    } catch (error) {
      console.error('获取文件列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新列表
   */
  const refreshList = () => {
    getFileList(currentParentId.value)
  }

  /**
   * 导航到指定目录
   */
  const navigateTo = (parentId: number) => {
    if (parentId !== currentParentId.value) {
      getFileList(parentId)
    }
  }

  /**
   * 返回上一级 (移动端)
   */
  const handleBack = () => {
    // 找到当前 ID 在面包屑中的索引
    const index = breadcrumb.value.findIndex((item) => item.id === currentParentId.value)
    if (index > 0) {
      // 获取上一级 ID
      const parentId = breadcrumb.value[index - 1].id
      navigateTo(parentId)
    } else if (currentParentId.value !== 0) {
      // 如果面包屑数据异常，尝试直接回根目录
      navigateTo(0)
    }
  }

  /**
   * 点击文件名
   */
  const handleNameClick = (row: FileNode) => {
    if (row.nodeType === FILE_NODE_TYPE.FOLDER) {
      // 进入文件夹
      getFileList(row.id)
    } else {
      // 下载文件
      handleDownload(row)
    }
  }

  /**
   * 双击行
   */
  const handleRowDblClick = (row: FileNode) => {
    if (row.nodeType === FILE_NODE_TYPE.FOLDER) {
      getFileList(row.id)
    }
  }

  /**
   * 下载文件
   */
  const handleDownload = async (row: FileNode) => {
    try {
      ElMessage.info('开始下载...')
      await downloadFile(row.id, row.name)
    } catch (error) {
      console.error('下载失败:', error)
      ElMessage.error('下载失败')
    }
  }

  /**
   * 显示新建文件夹弹窗
   */
  const showCreateFolderDialog = () => {
    folderDialogVisible.value = true
  }

  /**
   * 重置文件夹表单
   */
  const resetFolderForm = () => {
    folderForm.name = ''
    folderFormRef.value?.resetFields()
  }

  /**
   * 创建文件夹
   */
  const handleCreateFolder = async () => {
    if (!folderFormRef.value) return

    await folderFormRef.value.validate(async (valid) => {
      if (!valid) return

      folderLoading.value = true
      try {
        await createFolder({
          projectId: projectId.value,
          parentId: currentParentId.value,
          name: folderForm.name.trim()
        })
        folderDialogVisible.value = false
        resetFolderForm()
        refreshList()
      } catch (error) {
        console.error('创建文件夹失败:', error)
      } finally {
        folderLoading.value = false
      }
    })
  }

  /**
   * 上传前校验
   */
  const beforeUpload = (file: UploadRawFile) => {
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      ElMessage.warning('文件大小不能超过 100MB')
      return false
    }
    return true
  }

  /**
   * 上传成功
   */
  const handleUploadSuccess = (response: any) => {
    if (response.code === 200) {
      ElMessage.success('上传成功')
      refreshList()
    } else {
      ElMessage.error(response.msg || '上传失败')
    }
  }

  /**
   * 上传失败
   */
  const handleUploadError = () => {
    ElMessage.error('上传失败，请重试')
  }

  /**
   * 显示重命名弹窗
   */
  const showRenameDialog = (row: FileNode) => {
    renameForm.id = row.id
    renameForm.name = row.name
    renameDialogVisible.value = true
  }

  /**
   * 重置重命名表单
   */
  const resetRenameForm = () => {
    renameForm.id = 0
    renameForm.name = ''
    renameFormRef.value?.resetFields()
  }

  /**
   * 重命名
   */
  const handleRename = async () => {
    if (!renameFormRef.value) return

    await renameFormRef.value.validate(async (valid) => {
      if (!valid) return

      renameLoading.value = true
      try {
        await renameFileNode(renameForm.id, renameForm.name.trim())
        renameDialogVisible.value = false
        resetRenameForm()
        refreshList()
      } catch (error) {
        console.error('重命名失败:', error)
      } finally {
        renameLoading.value = false
      }
    })
  }

  /**
   * 处理移动端菜单命令
   */
  const handleMobileCommand = (command: string, item: FileNode) => {
    switch (command) {
      case 'download':
        handleDownload(item)
        break
      case 'rename':
        showRenameDialog(item)
        break
      case 'delete':
        ElMessageBox.confirm(
          `确定删除${item.nodeType === 0 ? '文件夹' : '文件'}「${item.name}」吗？`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => handleDelete(item))
        break
    }
  }

  /**
   * 删除节点
   */
  const handleDelete = async (row: FileNode) => {
    try {
      await deleteFileNode(row.id)
      refreshList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  /**
   * 获取文件图标
   */
  const getFileIcon = (row: FileNode): string => {
    if (row.nodeType === FILE_NODE_TYPE.FOLDER) {
      return 'ri:folder-fill'
    }

    const ext = row.extension?.toLowerCase() || ''
    const iconMap: Record<string, string> = {
      // 文档
      pdf: 'ri:file-pdf-line',
      doc: 'ri:file-word-line',
      docx: 'ri:file-word-line',
      xls: 'ri:file-excel-line',
      xlsx: 'ri:file-excel-line',
      ppt: 'ri:file-ppt-line',
      pptx: 'ri:file-ppt-line',
      txt: 'ri:file-text-line',
      md: 'ri:markdown-line',
      // 图片
      jpg: 'ri:image-line',
      jpeg: 'ri:image-line',
      png: 'ri:image-line',
      gif: 'ri-image-line',
      svg: 'ri:image-line',
      webp: 'ri:image-line',
      // 视频
      mp4: 'ri-video-line',
      avi: 'ri-video-line',
      mov: 'ri-video-line',
      // 音频
      mp3: 'ri-music-line',
      wav: 'ri-music-line',
      // 压缩包
      zip: 'ri-file-zip-line',
      rar: 'ri-file-zip-line',
      '7z': 'ri-file-zip-line',
      // 代码
      js: 'ri-javascript-line',
      ts: 'ri-code-line',
      vue: 'ri-vuejs-line',
      java: 'ri-java-line',
      py: 'ri-code-line',
      html: 'ri-html5-line',
      css: 'ri-css3-line',
      json: 'ri-braces-line'
    }

    return iconMap[ext] || 'ri:file-line'
  }

  /**
   * 格式化日期时间
   */
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

  // 监听 projectId 变化（从路由参数）
  watch(
    () => projectId.value,
    (newId) => {
      if (newId) {
        currentParentId.value = 0
        getFileList(0)
      }
    },
    { immediate: true }
  )

  // 初始化
  onMounted(() => {
    if (projectId.value) {
      getFileList(0)
    }
  })
</script>

<style lang="scss" scoped>
  .file-manager {
    padding: 16px;
    background: var(--el-bg-color);
    border-radius: 8px;
    min-height: 400px;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .breadcrumb-item {
        cursor: default;

        &.clickable {
          cursor: pointer;
          color: var(--el-color-primary);

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    }

    .file-name {
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover .name-text {
        color: var(--el-color-primary);
        text-decoration: underline;
      }

      .file-icon {
        font-size: 20px;
        margin-right: 8px;
      }

      .name-text {
        font-weight: 500;
      }
    }

    .text-warning {
      color: var(--el-color-warning);
    }

    .text-danger {
      color: var(--el-color-danger);
    }

    .text-primary {
      color: var(--el-color-primary);
    }

    .text-success {
      color: var(--el-color-success);
    }

    .text-info {
      color: var(--el-color-info);
    }

    .text-secondary {
      color: var(--el-text-color-secondary);
    }

    .text-purple {
      color: #9b59b6;
    }

    :deep(.el-breadcrumb) {
      font-size: 14px;
    }

    :deep(.el-table) {
      --el-table-header-bg-color: var(--el-fill-color-light);
    }
  }

  // 移动端样式
  .mobile-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    // 移除padding以适应全屏
    margin: -16px;
    background-color: var(--el-bg-color);

    .mobile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color-lighter);
      position: sticky;
      top: 0;
      z-index: 10;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          font-size: 20px;
          color: var(--el-text-color-primary);
          cursor: pointer;
        }

        .current-folder {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: var(--el-fill-color-light);
          color: var(--el-color-primary);
          font-size: 20px;
          cursor: pointer;

          &:active {
            background-color: var(--el-fill-color);
          }
        }

        .mobile-upload {
          display: flex;
        }
      }
    }

    .mobile-file-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .mobile-file-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background-color: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;
      transition: background-color 0.2s;

      &:active {
        background-color: var(--el-fill-color-light);
      }

      &:last-child {
        border-bottom: none;
      }

      .file-icon-wrapper {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;

        .file-icon {
          font-size: 28px;
        }
      }

      .file-info {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .file-name {
          font-size: 15px;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-meta {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          display: flex;
          align-items: center;

          .separator {
            margin: 0 4px;
          }
        }
      }

      .file-actions {
        padding: 8px;
        margin-right: -8px;

        .more-btn {
          padding: 4px;
          color: var(--el-text-color-secondary);
          font-size: 20px;
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

      span {
        font-size: 14px;
      }
    }
  }
</style>
