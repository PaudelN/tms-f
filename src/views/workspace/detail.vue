<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import WorkspaceDetailPanel from '@/features/workspace/components/WorkspaceDetailPanel.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import UiPageHeader from '@/components/shared/UiPageHeader.vue'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

onMounted(async () => {
  await workspaceStore.fetchWorkspace(Number(route.params.id))
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <UiPageHeader title="Workspace Detail" description="Standalone route kept for compatibility." />
    <div class="rounded-xl border border-border bg-card p-5 shadow-soft">
      <WorkspaceDetailPanel :workspace="workspaceStore.activeWorkspace" @edit="router.push({ name: 'workspace-edit', params: { id: workspaceStore.activeWorkspace?.id } })" @close="router.back()" />
      <Button class="mt-4" variant="outline" @click="router.push({ name: 'workspace' })">Back to list</Button>
    </div>
  </div>
</template>
