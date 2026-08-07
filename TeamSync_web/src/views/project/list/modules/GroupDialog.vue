<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑分组' : '新建分组'"
    width="400px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <ElFormItem label="分组名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="请输入分组名称"
          maxlength="100"
          show-word-limit
          @keyup.enter="handleSubmit"
        />
      </ElFormItem>
      <ElFormItem label="排序号" prop="sort">
        <ElInputNumber
          v-model="formData.sort"
          :min="0"
          :max="9999"
          placeholder="排序号越小越靠前"
          style="width: 100%"
        />
        <div class="form-tip">数字越小，分组卡片越靠前显示</div>
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
    createGroup,
    updateGroup,
    updateGroupSort,
    type ProjectGroup
  } from '@/api/project'

  const props = defineProps<{
    modelValue: boolean
    group?: ProjectGroup | null
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const isEdit = computed(() => !!props.group)

  const formData = reactive({
    name: '',
    sort: 0
  })

  const formRules: FormRules = {
    name: [
      { required: true, message: '请输入分组名称', trigger: 'blur' },
      { min: 1, max: 100, message: '分组名称长度在 1 到 100 个字符', trigger: 'blur' }
    ]
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        if (props.group) {
          formData.name = props.group.name
          formData.sort = props.group.sort ?? 0
        } else {
          formData.name = ''
          formData.sort = 0
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
        if (isEdit.value && props.group) {
          await updateGroup(props.group.id, formData.name.trim())
          if (formData.sort !== (props.group.sort ?? 0)) {
            await updateGroupSort(props.group.id, formData.sort)
          }
          ElMessage.success('分组更新成功')
        } else {
          await createGroup(formData.name.trim())
          ElMessage.success('分组创建成功')
        }
        visible.value = false
        formData.name = ''
        formData.sort = 0
        emit('success')
      } catch (error: any) {
        console.error(error)
      } finally {
        loading.value = false
      }
    })
  }
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
