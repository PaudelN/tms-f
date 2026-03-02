<template>
  <UiForm
    mode="create"
    :breadcrumbs="breadcrumbs"
    title="New Workspace"
    description="Create a workspace to organise your projects and tasks."
    :tips="tips"
    :submitting="workspaceStore.isLoading"
    :has-changes="hasChanges"
    :error-message="workspaceStore.hasError ? workspaceStore.errorMessage : null"
    submit-label="Create Workspace"
    @submit="handleSubmit"
    @cancel="router.back()"
  >
    <template #fields>
      <UiFormField
        label="Workspace Name"
        id="name"
        :error="errors.name"
        required
        hint="Between 3 and 255 characters."
      >
        <div class="group relative">
          <FolderKanban class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-violet-500" />
          <Input
            id="name"
            v-model="form.name"
            placeholder="e.g. Marketing Q3"
            class="h-12 rounded-xl border-border/70 bg-white/75 pl-10 shadow-sm transition-all hover:border-violet-300/70 hover:shadow focus-visible:ring-2 focus-visible:ring-violet-500/30 dark:bg-slate-950/45"
            :class="errors.name ? 'border-destructive focus-visible:ring-destructive/30' : ''"
            @input="errors.name = ''"
          />
        </div>
      </UiFormField>

      <UiFormField label="Description" id="description" :error="errors.description">
        <div class="group relative">
          <Text class="pointer-events-none absolute left-3 top-3.5 z-10 h-4 w-4 text-muted-foreground/70 transition-colors group-focus-within:text-violet-500" />
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="What is this workspace for?"
            :rows="4"
            class="min-h-28 resize-none rounded-xl border-border/70 bg-white/75 pl-10 shadow-sm transition-all hover:border-violet-300/70 hover:shadow focus-visible:ring-2 focus-visible:ring-violet-500/30 dark:bg-slate-950/45"
            :class="errors.description ? 'border-destructive focus-visible:ring-destructive/30' : ''"
            @input="errors.description = ''"
          />
        </div>

        <template #hint-right>
          <span class="text-[10px] tabular-nums" :class="form.description.length > 900 ? 'text-amber-500' : 'text-muted-foreground/45'">
            {{ form.description.length }} / 1000
          </span>
        </template>
      </UiFormField>
    </template>
  </UiForm>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FolderKanban, Text } from 'lucide-vue-next'
import { useWorkspaceStore } from '@/stores/workspace'
import UiForm from '@/components/common/UiForm.vue'
import UiFormField from '@/components/common/UiFormField.vue'
import type { FormBreadcrumb, FormTip } from '@/components/common/UiForm.vue'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const form = reactive({ name: '', description: '' })
const errors = reactive({ name: '', description: '' })
const hasChanges = computed(() => form.name.trim().length > 0 || form.description.trim().length > 0)

const breadcrumbs: FormBreadcrumb[] = [
  { label: 'Workspaces', onClick: () => router.push({ name: 'workspace' }) },
  { label: 'New Workspace' },
]

const tips: FormTip[] = [
  { type: 'pro', text: 'Short, specific names are easier for teammates to recognise at a glance.' },
  { type: 'info', text: 'Descriptions are optional but help clarify the workspace purpose.' },
  { type: 'default', text: 'You can rename or update these details any time from settings.' },
]

function validate() {
  errors.name = ''
  errors.description = ''
  let ok = true

  if (!form.name.trim()) {
    errors.name = 'Workspace name is required'
    ok = false
  } else if (form.name.trim().length < 3) {
    errors.name = 'Must be at least 3 characters'
    ok = false
  } else if (form.name.trim().length > 255) {
    errors.name = 'Must not exceed 255 characters'
    ok = false
  }

  if (form.description.length > 1000) {
    errors.description = 'Must not exceed 1000 characters'
    ok = false
  }

  return ok
}

async function handleSubmit() {
  workspaceStore.clearError()
  if (!validate()) return

  try {
    const ws = await workspaceStore.createWorkspace({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    })
    router.push({ name: 'workspace-detail', params: { id: ws.id } })
  } catch (e) {
    console.error(e)
  }
}
</script>
