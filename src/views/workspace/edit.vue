<template>
  <UiForm
    mode="edit"
    :loading="loading"
    loading-text="Loading workspace…"
    :breadcrumbs="breadcrumbs"
    :title="workspace?.name ?? 'Edit Workspace'"
    description="Update the workspace name and description."
    :tips="tips"
    :submitting="workspaceStore.isLoading"
    :has-changes="hasChanges"
    :error-message="workspaceStore.hasError ? workspaceStore.errorMessage : null"
    submit-label="Save Changes"
    @submit="handleSubmit"
    @cancel="router.back()"
  >
    <template #fields>
      <UiFormField label="Workspace Name" :error="errors.name" required hint="Between 3 and 255 characters.">
        <Input id="name" v-model="form.name" placeholder="e.g. Marketing Q3"
          :class="errors.name ? 'border-destructive' : ''" @input="errors.name = ''" />
      </UiFormField>

      <UiFormField label="Description" :error="errors.description">
        <Textarea id="description" v-model="form.description" placeholder="What is this workspace for?"
          :rows="4" class="resize-none" :class="errors.description ? 'border-destructive' : ''"
          @input="errors.description = ''" />
        <template #hint-right>
          <span class="text-[10px] tabular-nums" :class="form.description.length > 900 ? 'text-amber-500' : 'text-muted-foreground/40'">
            {{ form.description.length }} / 1000
          </span>
        </template>
      </UiFormField>
    </template>
  </UiForm>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import UiForm from '@/components/common/UiForm.vue'
import UiFormField from '@/components/common/UiFormField.vue'
import type { FormBreadcrumb, FormTip } from '@/components/common/UiForm.vue'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loading = ref(true)
const workspace = computed(() => workspaceStore.activeWorkspace)
const form = reactive({ name: '', description: '' })
const original = reactive({ name: '', description: '' })
const errors = reactive({ name: '', description: '' })
const hasChanges = computed(() => form.name.trim() !== original.name || form.description.trim() !== original.description)

const breadcrumbs = computed<FormBreadcrumb[]>(() => [
  { label: 'Workspaces', onClick: () => router.push({ name: 'workspace' }) },
  { label: workspace.value?.name ?? 'Workspace', onClick: () => router.push({ name: 'workspace-detail', params: { id: workspace.value?.id } }) },
  { label: 'Edit' },
])

const tips: FormTip[] = [
  { type: 'warning', text: 'Renaming a workspace does not affect its existing projects or tasks.' },
  { type: 'default', text: 'Keep descriptions concise — one or two sentences is enough.' },
]

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) { router.push({ name: 'workspace' }); return }
  loading.value = true
  try {
    await workspaceStore.fetchWorkspace(id)
    if (workspace.value) {
      form.name = workspace.value.name
      form.description = workspace.value.description ?? ''
      original.name = workspace.value.name
      original.description = workspace.value.description ?? ''
    }
  } catch { router.push({ name: 'workspace' }) }
  finally { loading.value = false }
})

function validate() {
  errors.name = ''; errors.description = ''; let ok = true
  if (!form.name.trim()) { errors.name = 'Workspace name is required'; ok = false }
  else if (form.name.trim().length < 3) { errors.name = 'Must be at least 3 characters'; ok = false }
  else if (form.name.trim().length > 255) { errors.name = 'Must not exceed 255 characters'; ok = false }
  if (form.description.length > 1000) { errors.description = 'Must not exceed 1000 characters'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!workspace.value) return
  workspaceStore.clearError()
  if (!validate()) return
  try {
    await workspaceStore.updateWorkspace(workspace.value.id, { name: form.name.trim(), description: form.description.trim() || undefined })
    original.name = form.name.trim()
    original.description = form.description.trim()
    router.push({ name: 'workspace-detail', params: { id: workspace.value.id } })
  } catch (e) { console.error(e) }
}
</script>