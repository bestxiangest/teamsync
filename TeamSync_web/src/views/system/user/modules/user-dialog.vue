<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
    align-center
    :close-on-click-modal="false"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="用户名" prop="username">
        <ElInput
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
        />
      </ElFormItem>

      <ElFormItem v-if="!isEdit" label="密码" prop="password">
        <ElInput
          v-model="formData.password"
          type="password"
          placeholder="请输入密码（至少6位）"
          show-password
        />
      </ElFormItem>

      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="formData.nickname" placeholder="请输入昵称" />
      </ElFormItem>

      <ElFormItem label="手机号" prop="userPhone">
        <ElInput v-model="formData.userPhone" placeholder="请输入手机号" maxlength="11" />
      </ElFormItem>

      <ElFormItem label="邮箱" prop="userEmail">
        <ElInput v-model="formData.userEmail" placeholder="请输入邮箱" />
      </ElFormItem>

      <ElFormItem label="性别" prop="userGender">
        <ElRadioGroup v-model="formData.userGender">
          <ElRadio :value="0">未知</ElRadio>
          <ElRadio :value="1">男</ElRadio>
          <ElRadio :value="2">女</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择状态">
          <ElOption label="在线" value="1" />
          <ElOption label="离线" value="2" />
          <ElOption label="异常" value="3" />
          <ElOption label="注销" value="4" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="管理员" prop="isAdmin">
        <ElSwitch
          v-model="formData.isAdmin"
          active-text="是"
          inactive-text="否"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchAddUser, fetchUpdateUser } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 是否编辑模式
  const isEdit = computed(() => props.type === 'edit')

  // 对话框标题
  const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

  // 表单实例
  const formRef = ref<FormInstance>()

  // 提交loading
  const submitLoading = ref(false)

  // 表单数据
  const formData = reactive({
    id: undefined as number | undefined,
    username: '',
    password: '',
    nickname: '',
    userPhone: '',
    userEmail: '',
    userGender: 0,
    status: '1',
    isAdmin: false
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    userPhone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    userEmail: [
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ]
  }

  /**
   * 性别文字转数字
   */
  const genderTextToNumber = (genderText: string | undefined): number => {
    if (!genderText) return 0
    if (genderText === '男') return 1
    if (genderText === '女') return 2
    return 0
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    if (isEdit.value && props.userData) {
      const row = props.userData
      Object.assign(formData, {
        id: row.id,
        username: row.username || '',
        password: '',
        nickname: row.nickname || '',
        userPhone: row.userPhone || '',
        userEmail: row.userEmail || '',
        userGender: genderTextToNumber(row.userGender),
        status: row.status || '1',
        isAdmin: row.isAdmin === true
      })
    } else {
      // 新增模式，重置表单
      Object.assign(formData, {
        id: undefined,
        username: '',
        password: '',
        nickname: '',
        userPhone: '',
        userEmail: '',
        userGender: 0,
        status: '1',
        isAdmin: false
      })
    }
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitLoading.value = true

      if (isEdit.value) {
        // 编辑用户
        await fetchUpdateUser({
          id: formData.id!,
          username: formData.username,
          nickname: formData.nickname,
          userPhone: formData.userPhone,
          userEmail: formData.userEmail,
          userGender: formData.userGender,
          status: formData.status,
          isAdmin: formData.isAdmin
        })
        ElMessage.success('更新成功')
      } else {
        // 新增用户
        await fetchAddUser({
          username: formData.username,
          password: formData.password,
          nickname: formData.nickname,
          userPhone: formData.userPhone,
          userEmail: formData.userEmail,
          userGender: formData.userGender,
          status: formData.status,
          isAdmin: formData.isAdmin
        })
        ElMessage.success('添加成功')
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      console.error('提交失败:', error)
      if (error?.message) {
        ElMessage.error(error.message)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>
