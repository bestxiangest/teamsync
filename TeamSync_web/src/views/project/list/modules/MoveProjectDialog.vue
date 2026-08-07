<template>
  <ElDialog v-model="visible" title="移动项目" width="400px" :close-on-click-modal="false">
    <ElForm label-position="top">
      <ElFormItem label="选择目标分组">
        <ElSelect v-model="targetGroupId" placeholder="请选择分组" style="width: 100%">
          <ElOption label="根目录 (不放入任何分组)" :value="0" />
          <ElOption v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit"> 确定 </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { moveProject, type ProjectGroup, type Project } from '@/api/project'

  const props = defineProps<{
    modelValue: boolean
    project: Project | null
    groups: ProjectGroup[]
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)
  const targetGroupId = ref<number>(0)

  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.project) {
        targetGroupId.value = props.project.groupId || 0
      }
    }
  )

  const handleSubmit = async () => {
    if (!props.project) return
    loading.value = true
    try {
      await moveProject(props.project.id, targetGroupId.value)
      ElMessage.success('移动成功')
      visible.value = false
      emit('success')
    } catch (error: any) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
</script>
