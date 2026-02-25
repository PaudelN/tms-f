<template>
  <div class="min-h-screen bg-background p-6">
    <div class="mx-auto max-w-4xl space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold">Workspaces</h1>
        <Button type="button" size="sm" @click="openAddDialog">Add workspace</Button>
      </div>

      <div class="rounded-lg border border-border bg-card">
        <button
          v-for="workspace in workspaceStore.workspaces"
          :key="workspace.id"
          type="button"
          class="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-accent"
          @click="openDetailDialog(workspace)"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ workspace.name }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ workspace.description || 'No description' }}</p>
          </div>
          <span class="text-xs text-muted-foreground">{{ formatDate(workspace.created_at) }}</span>
        </button>

        <div v-if="!workspaceStore.isLoading && workspaceStore.workspaces.length === 0" class="p-6 text-center text-sm text-muted-foreground">
          No workspaces found.
        </div>
      </div>
    </div>

    <UiDialog
      :open="dialogOpen"
      :title="dialogTitle"
      :description="dialogDescription"
      :fullscreen-to="fullscreenRoute"
      @update:open="dialogOpen = $event"
    >
      <div v-if="activeMode === 'detail' && selectedWorkspace" class="space-y-3 text-sm">
        <div class="rounded-md border p-3">
          <p class="text-xs text-muted-foreground">Name</p>
          <p class="font-medium">{{ selectedWorkspace.name }}</p>
        </div>
        <div class="rounded-md border p-3">
          <p class="text-xs text-muted-foreground">Description</p>
          <p>{{ selectedWorkspace.description || 'No description' }}</p>
        </div>
        <div class="rounded-md border p-3">
          <p class="text-xs text-muted-foreground">Owner</p>
          <p>{{ selectedWorkspace.user?.name || 'Unassigned' }}</p>
        </div>
      </div>

      <form v-else class="space-y-3" @submit.prevent="submitForm">
        <div class="space-y-1">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" placeholder="Workspace name" required />
        </div>
        <div class="space-y-1">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" rows="3" placeholder="Optional description" />
        </div>
      </form>

      <template #footer>
        <div class="flex w-full justify-between gap-2">
          <div class="flex gap-2">
            <Button v-if="activeMode === 'detail' && selectedWorkspace" type="button" variant="outline" @click="openEditDialog(selectedWorkspace)">
              Edit
            </Button>
            <Button
              v-if="activeMode === 'detail' && selectedWorkspace"
              type="button"
              variant="destructive"
              :disabled="workspaceStore.isLoading"
              @click="removeWorkspace(selectedWorkspace.id)"
            >
              Delete
            </Button>
          </div>
          <div class="flex gap-2">
            <Button type="button" variant="outline" @click="dialogOpen = false">Close</Button>
            <Button
              v-if="activeMode !== 'detail'"
              type="button"
              :disabled="workspaceStore.isLoading"
              @click="submitForm"
            >
              {{ activeMode === 'add' ? 'Create' : 'Save' }}
            </Button>
          </div>
        </div>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UiDialog } from '@/components/ui/dialog'

const workspaceStore = useWorkspaceStore()

const dialogOpen = ref(false)
const selectedWorkspace = ref<Workspace | null>(null)
const activeMode = ref<'detail' | 'edit' | 'add'>('detail')

const form = reactive({
  name: '',
  description: '',
})

onMounted(async () => {
  if (!workspaceStore.workspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
})

const dialogTitle = computed(() => {
  if (activeMode.value === 'add') return 'Add workspace'
  if (activeMode.value === 'edit') return 'Edit workspace'
  return selectedWorkspace.value?.name || 'Workspace details'
})

const dialogDescription = computed(() => {
  if (activeMode.value === 'detail') return 'Quick details in place.'
  return 'Minimal editor powered by UiDialog.'
})

const fullscreenRoute = computed(() => {
  if (activeMode.value === 'add') return { name: 'workspace-add' }
  if (!selectedWorkspace.value) return undefined
  return activeMode.value === 'edit'
    ? { name: 'workspace-edit', params: { id: selectedWorkspace.value.id } }
    : { name: 'workspace-detail', params: { id: selectedWorkspace.value.id } }
})

function openDetailDialog(workspace: Workspace) {
  selectedWorkspace.value = workspace
  activeMode.value = 'detail'
  dialogOpen.value = true
}

function openAddDialog() {
  selectedWorkspace.value = null
  activeMode.value = 'add'
  form.name = ''
  form.description = ''
  dialogOpen.value = true
}

function openEditDialog(workspace: Workspace) {
  selectedWorkspace.value = workspace
  activeMode.value = 'edit'
  form.name = workspace.name
  form.description = workspace.description || ''
}

async function submitForm() {
  if (!form.name.trim()) return

  if (activeMode.value === 'add') {
    await workspaceStore.createWorkspace({ name: form.name.trim(), description: form.description.trim() || undefined })
  }

  if (activeMode.value === 'edit' && selectedWorkspace.value) {
    const updated = await workspaceStore.updateWorkspace(selectedWorkspace.value.id, {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    })
    selectedWorkspace.value = updated
    activeMode.value = 'detail'
  }

  form.name = ''
  form.description = ''
}

async function removeWorkspace(id: number) {
  await workspaceStore.deleteWorkspace(id)
  dialogOpen.value = false
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
