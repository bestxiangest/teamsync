<template>
  <ElDialog
    v-model="dialogVisible"
    title="重置密码"
    width="400px"
    align-center
    :close-on-click-modal="false"
  >
    <div class="mb-4">
      <span class="text-gray-500">用户名：</span>
      <span class="font-medium">{{ username }}</span>
    </div>

    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="新密码" prop="newPassword">
        <ElInput
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
          show-password
        />
      </ElFormItem>

      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
          确认重置
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchResetUserPwd } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    userId: number
    username: string
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

  // 表单实例
  const formRef = ref<FormInstance>()

  // 提交loading
  const submitLoading = ref(false)

  // 表单数据
  const formData = reactive({
    newPassword: '',
    confirmPassword: ''
  })

  // 确认密码校验
  const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
    if (value !== formData.newPassword) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }

  // 表单验证规则
  const rules: FormRules = {
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      { validator: validateConfirmPassword, trigger: 'blur' }
    ]
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    formData.newPassword = ''
    formData.confirmPassword = ''
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        resetForm()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitLoading.value = true

      await fetchResetUserPwd({
        id: props.userId,
        newPassword: formData.newPassword
      })

      ElMessage.success('密码重置成功')
      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      console.error('重置密码失败:', error)
      if (error?.message) {
        ElMessage.error(error.message)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>
