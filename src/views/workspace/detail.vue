<template>
  <div class="min-h-screen bg-background p-6">
    <div class="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Workspace detail</h1>
          <p class="text-sm text-muted-foreground">Minimal full page detail view.</p>
        </div>
        <Button type="button" variant="ghost" @click="router.push({ name: 'workspace' })">Back to list</Button>
      </div>

      <div v-if="workspaceStore.isDetailLoading" class="py-8 text-sm text-muted-foreground">Loading workspace...</div>

      <div v-else-if="workspace" class="space-y-4">
        <div>
          <p class="text-lg font-semibold">{{ workspace.name }}</p>
          <p class="text-sm text-muted-foreground">{{ workspace.description || 'No description' }}</p>
        </div>

        <div class="rounded-md border border-border p-3 text-sm">
          <p>ID: {{ workspace.id }}</p>
          <p>Created: {{ formatDate(workspace.created_at) }}</p>
          <p>Updated: {{ formatDate(workspace.updated_at) }}</p>
        </div>

        <div class="flex justify-between gap-2">
          <Button type="button" variant="destructive" :disabled="workspaceStore.isLoading" @click="deleteWorkspace">Delete</Button>
          <Button type="button" @click="router.push({ name: 'workspace-edit', params: { id: workspace.id } })">Edit</Button>
        </div>
      </div>

      <p v-else class="text-sm text-muted-foreground">Workspace not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspace'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const workspace = computed(() => workspaceStore.activeWorkspace)

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id || Number.isNaN(id)) {
    router.push({ name: 'workspace' })
    return
  }

  await workspaceStore.fetchWorkspace(id)
})

async function deleteWorkspace() {
  if (!workspace.value) return
  await workspaceStore.deleteWorkspace(workspace.value.id)
  router.push({ name: 'workspace' })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
