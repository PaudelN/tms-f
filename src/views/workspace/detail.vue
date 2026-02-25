<template>
  <div class="min-h-screen bg-background p-6">
    <UiDialog
      :open="open"
      title="Workspace details"
      description="Minimal detail layout"
      :modal="false"
      :fullscreen-to="{ name: 'workspace-edit', params: { id: workspace?.id || Number(route.params.id) } }"
      content-class="sm:max-w-xl"
      @update:open="handleClose"
    >
      <div v-if="workspaceStore.isDetailLoading" class="py-8 text-center text-sm text-muted-foreground">Loading...</div>
      <div v-else-if="workspace" class="space-y-3 text-sm">
        <div class="rounded-md border p-3">
          <p class="text-xs text-muted-foreground">Name</p>
          <p class="font-medium">{{ workspace.name }}</p>
        </div>
        <div class="rounded-md border p-3">
          <p class="text-xs text-muted-foreground">Description</p>
          <p>{{ workspace.description || 'No description' }}</p>
        </div>
        <div class="rounded-md border p-3">
          <p class="text-xs text-muted-foreground">Created</p>
          <p>{{ formatDate(workspace.created_at) }}</p>
        </div>
      </div>

      <template #footer>
        <Button type="button" variant="outline" @click="router.push({ name: 'workspace' })">Back</Button>
        <Button v-if="workspace" type="button" @click="router.push({ name: 'workspace-edit', params: { id: workspace.id } })">Edit</Button>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { UiDialog } from '@/components/ui/dialog'
import { useWorkspaceStore } from '@/stores/workspace'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const open = ref(true)

const workspace = computed(() => workspaceStore.activeWorkspace)

onMounted(loadWorkspace)

async function loadWorkspace() {
  const id = Number(route.params.id)
  if (!id) {
    router.push({ name: 'workspace' })
    return
  }

  await workspaceStore.fetchWorkspace(id)
}

function handleClose(nextOpen: boolean) {
  open.value = nextOpen
  if (!nextOpen) router.push({ name: 'workspace' })
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
