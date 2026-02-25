<template>
  <div class="min-h-screen bg-background p-6">
    <div class="mx-auto max-w-4xl space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Workspaces</h1>
          <p class="text-sm text-muted-foreground">Minimal workspace list view.</p>
        </div>
        <Button type="button" @click="openAddDialog">Add workspace</Button>
      </div>

      <div class="rounded-lg border border-border bg-card">
        <div v-if="workspaceStore.isLoading" class="p-6 text-sm text-muted-foreground">Loading workspaces...</div>

        <ul v-else-if="workspaceStore.workspaces.length" class="divide-y divide-border">
          <li
            v-for="workspace in workspaceStore.workspaces"
            :key="workspace.id"
            class="group flex items-center justify-between gap-3 px-4 py-3"
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-left"
              @click="openDetailDialog(workspace.id)"
            >
              <p class="truncate text-sm font-medium">{{ workspace.name }}</p>
              <p v-if="workspace.description" class="truncate text-xs text-muted-foreground">
                {{ workspace.description }}
              </p>
            </button>

            <div class="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" @click="openDetailDialog(workspace.id)">View</Button>
              <Button type="button" variant="ghost" size="sm" @click="openEditDialog(workspace.id)">Edit</Button>
            </div>
          </li>
        </ul>

        <div v-else class="p-6 text-sm text-muted-foreground">No workspaces found.</div>
      </div>
    </div>

    <UiDialog
      :open="dialogOpen"
      :title="dialogTitle"
      :description="dialogDescription"
      :full-screen-route="fullScreenRoute"
      @update:open="dialogOpen = $event"
    >
      <div class="space-y-4">
        <form v-if="dialogMode === 'add' || dialogMode === 'edit'" class="space-y-4" @submit.prevent="submitForm">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" placeholder="Workspace name" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="form.description" rows="4" placeholder="Optional description" />
          </div>
          <p v-if="workspaceStore.hasError" class="text-sm text-destructive">{{ workspaceStore.errorMessage }}</p>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" @click="dialogOpen = false">Cancel</Button>
            <Button type="submit" :disabled="workspaceStore.isLoading">
              {{ dialogMode === 'add' ? 'Create' : 'Save' }}
            </Button>
          </div>
        </form>

        <div v-else-if="dialogMode === 'detail'" class="space-y-4">
          <div v-if="workspaceStore.isDetailLoading" class="text-sm text-muted-foreground">Loading workspace...</div>
          <template v-else-if="activeWorkspace">
            <div class="space-y-1">
              <p class="text-sm font-medium">{{ activeWorkspace.name }}</p>
              <p class="text-sm text-muted-foreground">{{ activeWorkspace.description || 'No description' }}</p>
            </div>
            <div class="rounded-md border border-border p-3 text-xs text-muted-foreground">
              <p>ID: {{ activeWorkspace.id }}</p>
              <p>Created: {{ formatDate(activeWorkspace.created_at) }}</p>
              <p>Updated: {{ formatDate(activeWorkspace.updated_at) }}</p>
            </div>
            <div class="flex justify-between">
              <Button type="button" variant="destructive" :disabled="workspaceStore.isLoading" @click="removeWorkspace">
                Delete
              </Button>
              <Button type="button" @click="openEditDialog(activeWorkspace.id)">Edit</Button>
            </div>
          </template>
        </div>
      </div>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import UiDialog from '@/components/common/UiDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { computed, onMounted, reactive, ref } from 'vue'

const workspaceStore = useWorkspaceStore()

type DialogMode = 'add' | 'edit' | 'detail'

const dialogOpen = ref(false)
const dialogMode = ref<DialogMode>('detail')
const selectedWorkspaceId = ref<number | null>(null)

const form = reactive({
  name: '',
  description: '',
})

const activeWorkspace = computed<Workspace | null>(() => workspaceStore.activeWorkspace)

const dialogTitle = computed(() => {
  if (dialogMode.value === 'add') return 'Add workspace'
  if (dialogMode.value === 'edit') return 'Edit workspace'
  return 'Workspace details'
})

const dialogDescription = computed(() => {
  if (dialogMode.value === 'add') return 'Create quickly without leaving this page.'
  if (dialogMode.value === 'edit') return 'Update workspace details inline.'
  return 'View workspace information in context.'
})

const fullScreenRoute = computed(() => {
  if (dialogMode.value === 'add') return '/workspace/add'
  if (!selectedWorkspaceId.value) return undefined
  return dialogMode.value === 'edit'
    ? `/workspace/${selectedWorkspaceId.value}/edit`
    : `/workspace/${selectedWorkspaceId.value}`
})

onMounted(async () => {
  await workspaceStore.fetchWorkspaces()
})

async function openDetailDialog(id: number) {
  dialogMode.value = 'detail'
  selectedWorkspaceId.value = id
  dialogOpen.value = true
  await workspaceStore.fetchWorkspace(id)
}

async function openEditDialog(id: number) {
  dialogMode.value = 'edit'
  selectedWorkspaceId.value = id
  dialogOpen.value = true
  const workspace = await workspaceStore.fetchWorkspace(id)
  form.name = workspace.name
  form.description = workspace.description || ''
}

function openAddDialog() {
  workspaceStore.clearError()
  dialogMode.value = 'add'
  selectedWorkspaceId.value = null
  form.name = ''
  form.description = ''
  dialogOpen.value = true
}

async function submitForm() {
  workspaceStore.clearError()
  const payload = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
  }

  if (dialogMode.value === 'add') {
    await workspaceStore.createWorkspace(payload)
  }

  if (dialogMode.value === 'edit' && selectedWorkspaceId.value) {
    await workspaceStore.updateWorkspace(selectedWorkspaceId.value, payload)
  }

  await workspaceStore.fetchWorkspaces()
  dialogOpen.value = false
}

async function removeWorkspace() {
  if (!activeWorkspace.value) return
  await workspaceStore.deleteWorkspace(activeWorkspace.value.id)
  await workspaceStore.fetchWorkspaces()
  dialogOpen.value = false
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
