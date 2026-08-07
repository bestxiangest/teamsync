<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑项目' : '新建项目'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="top"
    >
      <ElFormItem label="项目名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="请输入项目名称"
          maxlength="100"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="项目描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          placeholder="请输入项目描述（选填）"
          :rows="4"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    createProject,
    updateProject,
    type ProjectCreateParams,
    type Project
  } from '@/api/project'

  const props = defineProps<{
    modelValue: boolean
    project?: Project | null
    groupId?: number
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const isEdit = computed(() => !!props.project)

  const formData = reactive<ProjectCreateParams>({
    name: '',
    description: '',
    groupId: 0
  })

  const formRules: FormRules = {
    name: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 1, max: 100, message: '项目名称长度在 1 到 100 个字符', trigger: 'blur' }
    ]
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        if (props.project) {
          formData.name = props.project.name
          formData.description = props.project.description || ''
          formData.groupId = props.project.groupId || 0
        } else {
          formData.name = ''
          formData.description = ''
          formData.groupId = props.groupId || 0
        }
      }
    }
  )

  const handleClose = () => {
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      loading.value = true
      try {
        if (isEdit.value && props.project) {
          await updateProject(props.project.id, {
            name: formData.name.trim(),
            description: formData.description?.trim() || ''
          })
          ElMessage.success('项目更新成功')
        } else {
          await createProject({
            name: formData.name.trim(),
            description: formData.description?.trim() || '',
            groupId: formData.groupId
          })
          ElMessage.success('项目创建成功')
        }
        visible.value = false
        emit('success')
      } catch (error: any) {
        console.error('操作失败:', error)
      } finally {
        loading.value = false
      }
    })
  }
</script>
