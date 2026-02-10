<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UiFormField } from '@/components/shared'
import { useWorkspaceStore } from '@/stores/workspace'
import { toast } from '@/utils/toast'

const emit = defineEmits<{ success: []; cancel: [] }>()
const store = useWorkspaceStore()
const loading = ref(false)
const form = reactive({ name: '', description: '' })

async function submit() {
  loading.value = true
  try {
    await store.createWorkspace({ name: form.name, description: form.description })
    toast.success('Workspace created')
    emit('success')
  } catch {
    toast.error('Failed to create workspace')
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
      <Button type="submit" :disabled="loading">{{ loading ? 'Creating…' : 'Create workspace' }}</Button>
    </div>
  </form>
</template>
