<template>
  <ElDrawer
    v-model="visible"
    size="420px"
    direction="rtl"
    :with-header="false"
    :close-on-click-modal="false"
    @open="handleDrawerOpen"
    @closed="handleDrawerClosed"
  >
    <div class="member-drawer">
      <div class="drawer-header">
        <div>
          <div class="drawer-title">全部成员</div>
          <div class="drawer-subtitle">共 {{ members.length }} 人</div>
        </div>
        <ElButton text :icon="Close" @click="visible = false" />
      </div>

      <div class="invite-panel">
        <div class="invite-control">
          <ElSelect
            v-model="inviteUserId"
            class="invite-select"
            clearable
            filterable
            reserve-keyword
            placeholder="搜索昵称、用户名或邮箱"
            :disabled="!canManageMembers"
            :loading="platformUserLoading"
            :filter-method="filterInviteUsers"
            @visible-change="handleInviteSelectVisibleChange"
            @clear="resetInviteSearch"
            @keyup.enter="handleInvite"
          >
            <template #prefix>
              <ElIcon><Search /></ElIcon>
            </template>
            <ElOption
              v-for="user in filteredInviteUserOptions"
              :key="user.id"
              :label="user.label"
              :value="user.id"
              :disabled="user.disabled"
            >
              <div class="invite-user-option">
                <ElAvatar :size="28" :src="user.avatar">{{ getAvatarText(user.label) }}</ElAvatar>
                <div class="invite-user-content">
                  <div class="invite-user-name">
                    <span>{{ user.label }}</span>
                    <ElTag v-if="user.disabled" size="small" type="info">已在项目</ElTag>
                  </div>
                  <div class="invite-user-meta">
                    <span>{{ user.username }}</span>
                    <span v-if="user.email">{{ user.email }}</span>
                  </div>
                </div>
              </div>
            </ElOption>
            <template #empty>
              <div class="invite-empty">
                {{ platformUserLoading ? '正在加载成员...' : '没有匹配的平台成员' }}
              </div>
            </template>
          </ElSelect>
          <ElButton
            type="primary"
            :loading="inviting"
            :disabled="!canManageMembers || !inviteUserId"
            @click="handleInvite"
          >
            邀请
          </ElButton>
        </div>
        <div v-if="canManageMembers" class="invite-tip">
          点击输入框会显示全部平台成员，输入昵称、用户名或邮箱可模糊筛选；新成员默认以“项目成员”加入。
        </div>
        <div v-else class="invite-tip muted">
          仅项目拥有者、项目管理员或平台管理员可以邀请成员。
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-title">成员列表</div>
        <ElButton text @click="permissionDialogVisible = true">权限规则</ElButton>
      </div>

      <ElInput v-model="keyword" class="search-input" placeholder="搜索成员" clearable>
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>

      <div class="member-list" v-loading="loading">
        <div v-if="filteredMembers.length === 0 && !loading" class="empty-state">
          <ArtSvgIcon icon="ri:team-line" />
          <span>暂无匹配成员</span>
        </div>

        <div
          v-for="member in filteredMembers"
          :key="member.userId"
          class="member-row"
          :class="{ active: activeSettingsUserId === member.userId }"
        >
          <div class="member-main">
            <ElAvatar :size="40" :src="member.avatar">
              {{ (member.nickname || member.username)?.charAt(0) }}
            </ElAvatar>
            <div class="member-content">
              <div class="member-name-line">
                <span class="member-name">{{ member.nickname || member.username }}</span>
                <ArtSvgIcon
                  v-if="member.projectOwner || member.role === 'owner'"
                  icon="ri:vip-crown-2-fill"
                  class="role-crown owner"
                />
                <ArtSvgIcon
                  v-else-if="member.role === 'admin'"
                  icon="ri:vip-crown-2-line"
                  class="role-crown admin"
                />
              </div>
              <div class="member-meta">
                <span>{{ member.roleLabel }}</span>
                <span v-if="member.platformAdmin" class="platform-flag">平台管理员</span>
                <span v-if="member.userId === currentUserId" class="self-flag">你</span>
              </div>
            </div>
          </div>

          <ElPopover
            :visible="activeSettingsUserId === member.userId"
            placement="left-start"
            :width="300"
            trigger="click"
            :teleported="false"
            popper-class="member-settings-popover"
            @show="activeSettingsUserId = member.userId"
            @hide="activeSettingsUserId = null"
          >
            <template #reference>
              <ElButton
                text
                circle
                class="more-btn"
                :icon="MoreFilled"
                @click.stop="toggleSettings(member.userId)"
              />
            </template>

            <div class="settings-card">
              <div class="settings-header">
                <span>成员设置</span>
                <ElButton text :icon="Close" @click="closeSettings" />
              </div>

              <div class="settings-role-list">
                <div class="settings-role-item static">
                  <ElCheckbox :model-value="member.projectOwner || member.role === 'owner'" disabled />
                  <span>项目拥有者</span>
                </div>

                <div
                  v-for="option in roleOptions"
                  :key="option.code"
                  class="settings-role-item"
                  :class="{
                    checked: isRoleChecked(member, option.code),
                    disabled: !canChangeToRole(member, option.code),
                    loading: updatingRoleUserId === member.userId
                  }"
                  @click="handleRoleChange(member, option.code, option.value, option.label)"
                >
                  <ElCheckbox :model-value="isRoleChecked(member, option.code)" disabled />
                  <span>{{ option.label }}</span>
                </div>
              </div>

              <div v-if="!member.canEditRole && !member.canRemove" class="readonly-tip">
                当前成员角色仅展示，不可由你调整。
              </div>

              <div class="settings-actions">
                <button type="button" class="action-link" @click="permissionDialogVisible = true">
                  <ElIcon><Setting /></ElIcon>
                  <span>管理项目权限</span>
                </button>
                <button
                  v-if="member.canRemove"
                  type="button"
                  class="action-link danger"
                  :disabled="removingId === member.userId"
                  @click="handleRemove(member)"
                >
                  <ElIcon><Delete /></ElIcon>
                  <span>移除成员</span>
                </button>
              </div>
            </div>
          </ElPopover>
        </div>
      </div>
    </div>
  </ElDrawer>

  <ElDialog
    v-model="permissionDialogVisible"
    title="项目权限规则"
    width="720px"
    :close-on-click-modal="false"
  >
    <div class="permission-dialog">
      <div class="permission-notice">
        <ElIcon><InfoFilled /></ElIcon>
        <span>平台管理员拥有最高权限，可邀请成员并调整任意非拥有者角色；项目拥有者仍保持唯一。</span>
      </div>

      <div class="permission-table">
        <div class="permission-head role">角色</div>
        <div class="permission-head">可邀请成员</div>
        <div class="permission-head">成员管理</div>
        <div class="permission-head">任务与评论</div>
        <div class="permission-head">列表管理</div>
        <div class="permission-head">项目文档</div>

        <template v-for="item in permissionMatrix" :key="item.role">
          <div class="permission-cell role">{{ item.role }}</div>
          <div class="permission-cell">{{ item.invite }}</div>
          <div class="permission-cell">{{ item.memberManage }}</div>
          <div class="permission-cell">{{ item.task }}</div>
          <div class="permission-cell">{{ item.stage }}</div>
          <div class="permission-cell">{{ item.files }}</div>
        </template>
      </div>

      <ul class="rule-list">
        <li>项目拥有者、平台管理员可将普通成员提升为项目管理员。</li>
        <li>平台管理员不依赖项目内角色，始终具备最高操作权限。</li>
        <li>项目管理员可邀请成员，并管理普通成员 / 项目访客 / 任务访客，但不能新增管理员。</li>
        <li>项目访客为只读角色，可看项目、看板、任务和文档。</li>
        <li>任务访客仅可查看看板与任务详情，不可访问项目文档。</li>
      </ul>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Close, Delete, InfoFilled, MoreFilled, Search, Setting } from '@element-plus/icons-vue'
  import { fetchGetUserList } from '@/api/system-manage'
  import {
    getProjectMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    type Member,
    type MemberRoleCode
  } from '@/api/member'
  import { useUserStore } from '@/store/modules/user'

  const props = defineProps<{
    projectId: number
  }>()

  const emit = defineEmits<{
    updated: []
  }>()

  const visible = defineModel<boolean>('visible', { default: false })

  const userStore = useUserStore()
  const members = ref<Member[]>([])
  const platformUserOptions = ref<InviteUserOption[]>([])
  const loading = ref(false)
  const platformUserLoading = ref(false)
  const inviting = ref(false)
  const inviteUserId = ref<number>()
  const inviteSearchKeyword = ref('')
  const keyword = ref('')
  const removingId = ref<number | null>(null)
  const updatingRoleUserId = ref<number | null>(null)
  const activeSettingsUserId = ref<number | null>(null)
  const permissionDialogVisible = ref(false)
  const USER_OPTION_PAGE_SIZE = 500

  interface InviteUserOption {
    id: number
    label: string
    username: string
    avatar?: string
    email?: string
    searchText: string
    disabled?: boolean
  }

  const roleOptions: Array<{ code: Exclude<MemberRoleCode, 'owner'>; value: number; label: string }> = [
    { code: 'admin', value: 2, label: '项目管理员' },
    { code: 'member', value: 1, label: '项目成员' },
    { code: 'project_guest', value: 3, label: '项目访客' },
    { code: 'task_guest', value: 4, label: '任务访客' }
  ]

  const permissionMatrix = [
    {
      role: '项目拥有者',
      invite: '完整',
      memberManage: '完整',
      task: '完整',
      stage: '完整',
      files: '完整'
    },
    {
      role: '项目管理员',
      invite: '可邀请',
      memberManage: '可管理普通成员与访客',
      task: '完整',
      stage: '完整',
      files: '完整'
    },
    {
      role: '项目成员',
      invite: '不可',
      memberManage: '不可',
      task: '可创建 / 编辑 / 评论',
      stage: '不可',
      files: '可上传 / 修改'
    },
    {
      role: '项目访客',
      invite: '不可',
      memberManage: '不可',
      task: '只读',
      stage: '不可',
      files: '只读'
    },
    {
      role: '任务访客',
      invite: '不可',
      memberManage: '不可',
      task: '只读',
      stage: '不可',
      files: '不可访问'
    }
  ]

  const currentUserId = computed(() => userStore.info?.userId)

  const projectMemberIds = computed(() => new Set(members.value.map((member) => member.userId)))

  const isPlatformAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
  })

  const currentMember = computed(() => {
    if (!currentUserId.value) return undefined
    return members.value.find((member) => member.userId === currentUserId.value)
  })

  const currentRole = computed<MemberRoleCode | null>(() => {
    return currentMember.value?.role ?? null
  })

  const canManageMembers = computed(() => {
    return isPlatformAdmin.value || currentRole.value === 'owner' || currentRole.value === 'admin'
  })

  const canAssignAdmin = computed(() => {
    return isPlatformAdmin.value || currentRole.value === 'owner'
  })

  const filteredMembers = computed(() => {
    const query = keyword.value.trim().toLowerCase()
    if (!query) return members.value

    return members.value.filter((member) => {
      return [member.username, member.nickname, member.roleLabel]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(query))
    })
  })

  const inviteUserOptions = computed<InviteUserOption[]>(() => {
    const memberIds = projectMemberIds.value
    return platformUserOptions.value.map((user) => ({
      ...user,
      disabled: memberIds.has(user.id)
    }))
  })

  const filteredInviteUserOptions = computed(() => {
    const query = inviteSearchKeyword.value.trim().toLowerCase()
    const options = inviteUserOptions.value
    if (!query) return options
    return options.filter((user) => user.searchText.includes(query))
  })

  const selectedInviteUser = computed(() => {
    if (!inviteUserId.value) return undefined
    return inviteUserOptions.value.find((user) => user.id === inviteUserId.value)
  })

  const handleDrawerOpen = async () => {
    await Promise.all([fetchMembers(), loadPlatformUsers()])
  }

  const fetchMembers = async () => {
    if (!props.projectId) return

    loading.value = true
    try {
      const data = await getProjectMembers(props.projectId)
      members.value = data || []
      if (
        activeSettingsUserId.value &&
        !members.value.some((member) => member.userId === activeSettingsUserId.value)
      ) {
        activeSettingsUserId.value = null
      }
    } catch (error) {
      console.error('获取成员列表失败:', error)
      ElMessage.error('获取成员列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadPlatformUsers = async () => {
    platformUserLoading.value = true
    try {
      const records = await fetchAllPlatformUsers()
      platformUserOptions.value = records.map((item) => {
        const user = item as Api.SystemManage.UserListItem & { email?: string }
        const label = user.nickname || user.username || `用户 ${user.id}`
        const username = user.username || ''
        const email = user.userEmail || user.email || ''
        return {
          id: Number(user.id),
          label,
          username,
          avatar: user.avatar,
          email,
          searchText: [label, username, email].filter(Boolean).join(' ').toLowerCase()
        }
      })
    } catch (error) {
      console.error('获取平台成员失败:', error)
      ElMessage.error('获取平台成员失败')
    } finally {
      platformUserLoading.value = false
    }
  }

  const fetchAllPlatformUsers = async () => {
    const records: Api.SystemManage.UserListItem[] = []
    let current = 1
    let total = 0
    do {
      const result = await fetchGetUserList({ current, size: USER_OPTION_PAGE_SIZE })
      const pageRecords = result?.records || []
      records.push(...pageRecords)
      total = Number(result?.total || records.length)
      current += 1
      if (pageRecords.length === 0) break
    } while (records.length < total)
    return records
  }

  const handleDrawerClosed = () => {
    keyword.value = ''
    inviteUserId.value = undefined
    inviteSearchKeyword.value = ''
    activeSettingsUserId.value = null
  }

  const handleInviteSelectVisibleChange = async (isVisible: boolean) => {
    if (isVisible && platformUserOptions.value.length === 0) {
      await loadPlatformUsers()
    }
    if (!isVisible) {
      inviteSearchKeyword.value = ''
    }
  }

  const filterInviteUsers = (query: string) => {
    inviteSearchKeyword.value = query
  }

  const resetInviteSearch = () => {
    inviteSearchKeyword.value = ''
  }

  const toggleSettings = (userId: number) => {
    activeSettingsUserId.value = activeSettingsUserId.value === userId ? null : userId
  }

  const closeSettings = () => {
    activeSettingsUserId.value = null
  }

  const isRoleChecked = (member: Member, roleCode: MemberRoleCode) => {
    if (roleCode === 'owner') {
      return member.projectOwner || member.role === 'owner'
    }
    return member.role === roleCode
  }

  const canChangeToRole = (member: Member, roleCode: Exclude<MemberRoleCode, 'owner'>) => {
    if (!member.canEditRole || member.userId === currentUserId.value) return false
    if (roleCode === 'admin' && !canAssignAdmin.value) return false
    return true
  }

  const handleInvite = async () => {
    if (!canManageMembers.value) {
      ElMessage.warning('仅项目拥有者、项目管理员或平台管理员可以邀请成员')
      return
    }

    const selectedUser = selectedInviteUser.value
    if (!selectedUser) {
      ElMessage.warning('请从下拉框选择要邀请的平台成员')
      return
    }

    if (selectedUser.disabled) {
      ElMessage.warning('该成员已经在项目中')
      return
    }

    inviting.value = true
    try {
      const newMember = await inviteMember(props.projectId, selectedUser.username)
      inviteUserId.value = undefined
      inviteSearchKeyword.value = ''
      await fetchMembers()
      emit('updated')
      ElMessage.success(`已邀请 ${newMember.nickname || newMember.username} 加入项目`)
    } catch (error) {
      console.error('邀请成员失败:', error)
    } finally {
      inviting.value = false
    }
  }

  const handleRoleChange = async (
    member: Member,
    roleCode: Exclude<MemberRoleCode, 'owner'>,
    roleType: number,
    roleLabel: string
  ) => {
    if (isRoleChecked(member, roleCode)) return

    if (!canChangeToRole(member, roleCode)) {
      if (roleCode === 'admin' && !canAssignAdmin.value) {
        ElMessage.warning('只有项目拥有者或平台管理员可以设置项目管理员')
      }
      return
    }

    updatingRoleUserId.value = member.userId
    try {
      await updateMemberRole(props.projectId, member.userId, roleType)
      await fetchMembers()
      emit('updated')
      activeSettingsUserId.value = member.userId
      ElMessage.success(`已将 ${member.nickname || member.username} 设置为${roleLabel}`)
    } catch (error) {
      console.error('更新成员角色失败:', error)
    } finally {
      updatingRoleUserId.value = null
    }
  }

  const handleRemove = async (member: Member) => {
    if (!member.canRemove) return

    try {
      await ElMessageBox.confirm(
        `确定要将“${member.nickname || member.username}”移出项目吗？`,
        '移除成员',
        {
          confirmButtonText: '移除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )

      removingId.value = member.userId
      await removeMember(props.projectId, member.userId)
      await fetchMembers()
      emit('updated')
      closeSettings()
      ElMessage.success('成员已移除')
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('移除成员失败:', error)
      }
    } finally {
      removingId.value = null
    }
  }

  const getAvatarText = (name?: string) => {
    return name?.trim()?.charAt(0) || '用'
  }

  defineExpose({
    fetchMembers
  })
</script>

<style lang="scss" scoped>
  .member-drawer {
    display: flex;
    flex-direction: column;
    height: 100%;
    color: var(--el-text-color-primary);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .drawer-title {
    font-size: 20px;
    font-weight: 600;
  }

  .drawer-subtitle {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .invite-panel {
    padding: 14px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(64, 158, 255, 0.03));
    border: 1px solid rgba(64, 158, 255, 0.12);
    border-radius: 16px;
  }

  .invite-tip {
    margin-top: 10px;
    font-size: 12px;
    color: var(--el-color-primary);

    &.muted {
      color: var(--el-text-color-secondary);
    }
  }

  .invite-control {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
  }

  .invite-select {
    width: 100%;
  }

  .invite-user-option {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
    padding: 2px 0;
  }

  .invite-user-content {
    min-width: 0;
    flex: 1;
  }

  .invite-user-name {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;

    span {
      overflow: hidden;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .invite-user-meta {
    display: flex;
    gap: 8px;
    min-width: 0;
    margin-top: 2px;
    font-size: 11px;
    color: var(--el-text-color-secondary);

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .invite-empty {
    padding: 10px 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .toolbar-title {
    font-size: 14px;
    font-weight: 600;
  }

  .search-input {
    margin-bottom: 16px;
  }

  .member-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 999px;
    }
  }

  .member-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #fff;
    border: 1px solid transparent;
    border-radius: 14px;
    transition: all 0.2s ease;

    &:hover,
    &.active {
      border-color: rgba(64, 158, 255, 0.18);
      background: rgba(64, 158, 255, 0.04);
      box-shadow: 0 8px 18px rgba(17, 24, 39, 0.06);
    }
  }

  .member-main {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .member-content {
    min-width: 0;
  }

  .member-name-line {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .member-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .role-crown {
    font-size: 16px;

    &.owner {
      color: #f59e0b;
    }

    &.admin {
      color: #fb923c;
    }
  }

  .member-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .platform-flag {
    color: var(--el-color-danger);
  }

  .self-flag {
    color: var(--el-color-primary);
  }

  .more-btn {
    flex-shrink: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    gap: 10px;
    color: var(--el-text-color-placeholder);

    :deep(.art-svg-icon) {
      font-size: 40px;
    }
  }

  .settings-card {
    padding: 4px 2px;
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .settings-role-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .settings-role-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.checked {
      background: rgba(64, 158, 255, 0.08);
    }

    &.disabled {
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;

      &:hover {
        background: transparent;
      }
    }

    &.static {
      cursor: default;

      &:hover {
        background: transparent;
      }
    }

    :deep(.el-checkbox) {
      pointer-events: none;
    }
  }

  .readonly-tip {
    margin-top: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .settings-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .action-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    color: var(--el-text-color-primary);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;

    &.danger {
      color: var(--el-color-danger);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .permission-dialog {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .permission-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--el-fill-color-light);
    border-radius: 12px;
    color: var(--el-text-color-secondary);
  }

  .permission-table {
    display: grid;
    grid-template-columns: 1.1fr repeat(5, 1fr);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 14px;
    overflow: hidden;
  }

  .permission-head,
  .permission-cell {
    padding: 12px 10px;
    font-size: 13px;
    border-right: 1px solid var(--el-border-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .permission-head {
    font-weight: 600;
    background: var(--el-fill-color-light);
  }

  .permission-head.role,
  .permission-cell.role {
    font-weight: 600;
  }

  .permission-table > :nth-last-child(-n + 6) {
    border-bottom: none;
  }

  .permission-table > :nth-child(6n) {
    border-right: none;
  }

  .rule-list {
    margin: 0;
    padding-left: 18px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.8;
  }
</style>
