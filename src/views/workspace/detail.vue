<template>
  <div :class="inDialog ? 'space-y-4' : 'min-h-screen bg-background p-6'">
    <div :class="inDialog ? 'space-y-4' : 'mx-auto max-w-5xl space-y-6'">
      <div v-if="!inDialog" class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Workspace detail</h1>
          <p class="text-muted-foreground">Complete overview with activity and metadata.</p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="router.back">Back</Button>
          <Button @click="handleEdit">Edit</Button>
        </div>
      </div>

      <div v-if="workspaceStore.isDetailLoading" class="rounded-xl border p-8 text-center text-muted-foreground">Loading workspace...</div>
      <div v-else-if="workspace" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between gap-3">
              <div>
                <CardTitle class="text-2xl">{{ workspace.name }}</CardTitle>
                <CardDescription>{{ workspace.description || 'No description provided.' }}</CardDescription>
              </div>
              <Badge :variant="workspace.isArchived ? 'secondary' : 'default'">{{ workspace.isArchived ? 'Archived' : 'Active' }}</Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-3">
            <div><p class="text-xs text-muted-foreground">ID</p><p class="font-medium">{{ workspace.id }}</p></div>
            <div><p class="text-xs text-muted-foreground">Created</p><p class="font-medium">{{ formatDate(workspace.created_at) }}</p></div>
            <div><p class="text-xs text-muted-foreground">Updated</p><p class="font-medium">{{ formatDate(workspace.updated_at) }}</p></div>
          </CardContent>
        </Card>

        <div class="flex gap-2" v-if="inDialog">
          <Button variant="outline" class="flex-1" @click="emit('done')">Close</Button>
          <Button class="flex-1" @click="handleEdit">Edit workspace</Button>
          <Button variant="destructive" class="flex-1" @click="handleDelete">Delete</Button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{{ workspace?.name }}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteModalOpen = false">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = withDefaults(defineProps<{ inDialog?: boolean; workspaceId?: number }>(), {
  inDialog: false,
  workspaceId: undefined,
})
const emit = defineEmits<{ (e: 'done'): void; (e: 'edit', id: number): void }>()

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const deleteModalOpen = ref(false)
const workspace = computed(() => workspaceStore.activeWorkspace)

onMounted(loadWorkspace)

async function loadWorkspace() {
  const id = props.workspaceId ?? Number(route.params.id)
  if (!id) return
  await workspaceStore.fetchWorkspace(id)
}

function handleEdit() {
  if (!workspace.value) return
  if (props.inDialog) {
    emit('edit', workspace.value.id)
    return
  }
  router.push({ name: 'workspace-edit', params: { id: workspace.value.id } })
}

function handleDelete() {
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!workspace.value) return
  await workspaceStore.deleteWorkspace(workspace.value.id)
  deleteModalOpen.value = false
  emit('done')
  if (!props.inDialog) router.push({ name: 'workspace' })
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
