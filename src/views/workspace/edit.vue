<template>
  <div class="min-h-screen bg-background p-6">
    <div class="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Edit workspace</h1>
          <p class="text-sm text-muted-foreground">Minimal full page edit view.</p>
        </div>
        <Button type="button" variant="ghost" @click="router.push({ name: 'workspace' })">Back to list</Button>
      </div>

      <div v-if="loading" class="py-8 text-sm text-muted-foreground">Loading workspace...</div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" required placeholder="Workspace name" />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" rows="4" placeholder="Optional description" />
        </div>

        <p class="text-xs text-muted-foreground">
          Updated {{ workspace ? formatDate(workspace.updated_at) : 'N/A' }}
        </p>

        <p v-if="workspaceStore.hasError" class="text-sm text-destructive">{{ workspaceStore.errorMessage }}</p>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="router.push({ name: 'workspace-detail', params: { id: workspace?.id } })">
            Cancel
          </Button>
          <Button type="submit" :disabled="workspaceStore.isLoading || !hasChanges">Save</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWorkspaceStore } from '@/stores/workspace'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loading = ref(true)
const workspace = computed(() => workspaceStore.activeWorkspace)

const form = reactive({
  name: '',
  description: '',
})

const originalForm = reactive({
  name: '',
  description: '',
})

const hasChanges = computed(() => {
  return form.name.trim() !== originalForm.name || form.description.trim() !== originalForm.description
})

onMounted(async () => {
  await loadWorkspace()
})

async function loadWorkspace() {
  const id = Number(route.params.id)
  if (!id || Number.isNaN(id)) {
    router.push({ name: 'workspace' })
    return
  }

  loading.value = true
  const record = await workspaceStore.fetchWorkspace(id)
  form.name = record.name
  form.description = record.description || ''
  originalForm.name = record.name
  originalForm.description = record.description || ''
  loading.value = false
}

async function handleSubmit() {
  if (!workspace.value) return

  await workspaceStore.updateWorkspace(workspace.value.id, {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
  })

  router.push({ name: 'workspace-detail', params: { id: workspace.value.id } })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
