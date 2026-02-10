<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UiFormField } from '@/components/shared'
import { useWorkspaceStore } from '@/stores/workspace'
import { toast } from '@/utils/toast'

const props = defineProps<{ id: number | null }>()
const emit = defineEmits<{ success: []; cancel: [] }>()
const store = useWorkspaceStore()
const loading = ref(false)
const form = reactive({ name: '', description: '' })

watch(
  () => props.id,
  (id) => {
    const row = id ? store.getWorkspaceById(id) : null
    form.name = row?.name ?? ''
    form.description = row?.description ?? ''
  },
  { immediate: true },
)

async function submit() {
  if (!props.id) return
  loading.value = true
  try {
    await store.updateWorkspace(props.id, { name: form.name, description: form.description })
    toast.success('Workspace updated')
    emit('success')
  } catch {
    toast.error('Failed to update workspace')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <UiFormField label="Name"><Input v-model="form.name" required /></UiFormField>
    <UiFormField label="Description"><Textarea v-model="form.description" /></UiFormField>
    <div class="flex justify-end gap-2">
      <Button variant="outline" type="button" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" :disabled="loading">{{ loading ? 'Saving…' : 'Save changes' }}</Button>
    </div>
  </form>
</template>
