<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UiSelect from '@/components/shared/UiSelect.vue'
import UiDialogHeader from '@/components/shared/UiDialogHeader.vue'
import UiFormActions from '@/components/shared/UiFormActions.vue'
import UiFormField from '@/components/shared/UiFormField.vue'
import type { Workspace, WorkspaceFormData } from '@/types/workspace'

const props = defineProps<{ workspace: Workspace | null }>()
const emit = defineEmits<{ submit: [payload: WorkspaceFormData]; cancel: [] }>()

const form = reactive<WorkspaceFormData>({ name: '', description: '', owner: '', status: 'Active' })

watch(
  () => props.workspace,
  (workspace) => {
    if (!workspace) return
    form.name = workspace.name
    form.description = workspace.description
    form.owner = workspace.owner
    form.status = workspace.status
  },
  { immediate: true },
)

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <div class="space-y-4">
    <UiDialogHeader title="Edit workspace" description="Update workspace settings while keeping context." />
    <UiFormField label="Name"><Input v-model="form.name" /></UiFormField>
    <UiFormField label="Owner"><Input v-model="form.owner" /></UiFormField>
    <UiFormField label="Status">
      <UiSelect v-model="form.status">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Paused">Paused</SelectItem>
          <SelectItem value="Archived">Archived</SelectItem>
        </SelectContent>
      </UiSelect>
    </UiFormField>
    <UiFormField label="Description"><Textarea v-model="form.description" /></UiFormField>
    <UiFormActions>
      <Button variant="outline" @click="emit('cancel')">Cancel</Button>
      <Button @click="submit">Save</Button>
    </UiFormActions>
  </div>
</template>
