<script setup lang="ts">
import { reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UiSelect from '@/components/shared/UiSelect.vue'
import UiDialogHeader from '@/components/shared/UiDialogHeader.vue'
import UiFormActions from '@/components/shared/UiFormActions.vue'
import UiFormField from '@/components/shared/UiFormField.vue'
import type { WorkspaceFormData } from '@/types/workspace'

const emit = defineEmits<{ submit: [payload: WorkspaceFormData]; cancel: [] }>()

const form = reactive<WorkspaceFormData>({
  name: '',
  description: '',
  owner: '',
  status: 'Active',
})

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <div class="space-y-4">
    <UiDialogHeader title="Create workspace" description="Add a new workspace without leaving your list context." />
    <UiFormField label="Name"><Input v-model="form.name" placeholder="Workspace name" /></UiFormField>
    <UiFormField label="Owner"><Input v-model="form.owner" placeholder="Owner name" /></UiFormField>
    <UiFormField label="Status">
      <UiSelect v-model="form.status">
        <SelectTrigger><SelectValue placeholder="Choose status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Paused">Paused</SelectItem>
          <SelectItem value="Archived">Archived</SelectItem>
        </SelectContent>
      </UiSelect>
    </UiFormField>
    <UiFormField label="Description"><Textarea v-model="form.description" placeholder="What does this workspace do?" /></UiFormField>
    <UiFormActions>
      <Button variant="outline" @click="emit('cancel')">Cancel</Button>
      <Button @click="submit">Create</Button>
    </UiFormActions>
  </div>
</template>
