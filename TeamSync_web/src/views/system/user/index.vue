<!-- 用户管理页面 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />

      <!-- 重置密码弹窗 -->
      <ResetPwdDialog
        v-model:visible="resetPwdDialogVisible"
        :user-id="resetPwdUserId"
        :username="resetPwdUsername"
        @submit="handleResetPwdSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, fetchDeleteUser } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import ResetPwdDialog from './modules/reset-pwd-dialog.vue'
  import { ElTag, ElMessageBox, ElImage, ElButton } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 重置密码弹窗
  const resetPwdDialogVisible = ref(false)
  const resetPwdUserId = ref<number>(0)
  const resetPwdUsername = ref<string>('')

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    username: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: undefined
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '注销' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'userInfo',
          label: '用户名',
          minWidth: 280,
          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],
                previewTeleported: true
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.username),
                h('p', { class: 'email' }, row.userEmail)
              ])
            ])
          }
        },
        {
          prop: 'userGender',
          label: '性别',
          minWidth: 80,
          sortable: true,
          formatter: (row) => row.userGender
        },
        { prop: 'userPhone', label: '手机号', minWidth: 130 },
        {
          prop: 'isAdmin',
          label: '管理员',
          minWidth: 100,
          formatter: (row) => {
            const isAdmin = row.isAdmin === true
            return h(
              ElTag,
              { type: isAdmin ? 'danger' : 'info', size: 'small' },
              () => (isAdmin ? '是' : '否')
            )
          }
        },
        {
          prop: 'status',
          label: '状态',
          minWidth: 80,
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type, size: 'small' }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          minWidth: 170,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          minWidth: 200,
          fixed: 'right',
          formatter: (row) =>
            h('div', { class: 'flex items-center gap-1' }, [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              }),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'warning',
                  text: true,
                  onClick: () => showResetPwdDialog(row)
                },
                () => '重置密码'
              )
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records) => {
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = (params: Api.SystemManage.UserSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row ? { ...row } : {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 显示重置密码弹窗
   */
  const showResetPwdDialog = (row: UserListItem): void => {
    resetPwdUserId.value = row.id
    resetPwdUsername.value = row.username
    resetPwdDialogVisible.value = true
  }

  /**
   * 删除用户
   */
  const deleteUser = async (row: UserListItem): Promise<void> => {
    console.log('删除用户:', row)
    try {
      await ElMessageBox.confirm(
        `确定要删除用户「${row.username}」吗？此操作不可恢复！`,
        '删除用户',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 调用删除接口
      await fetchDeleteUser(row.id)
      ElMessage.success('删除成功')
      // 刷新列表
      getData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除用户失败:', error)
        ElMessage.error(error?.message || '删除失败')
      }
    }
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    dialogVisible.value = false
    currentUserData.value = {}
    // 刷新列表
    getData()
  }

  /**
   * 处理重置密码提交事件
   */
  const handleResetPwdSubmit = () => {
    resetPwdDialogVisible.value = false
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
