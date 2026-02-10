<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WorkspaceForm from '@/features/workspace/components/WorkspaceForm.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { toast } from '@/utils/toast'
import UiPageHeader from '@/components/shared/UiPageHeader.vue'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

onMounted(async () => {
  await workspaceStore.fetchWorkspace(Number(route.params.id))
})

const initialValue = computed(() => ({
  name: workspaceStore.activeWorkspace?.name ?? '',
  description: workspaceStore.activeWorkspace?.description,
}))

async function submit(payload: { name: string; description?: string }) {
  const id = Number(route.params.id)
  await toast.promise(workspaceStore.updateWorkspace(id, payload), {
    loading: 'Updating workspace…',
    success: 'Workspace updated',
    error: 'Unable to update workspace',
  })
  router.push({ name: 'workspace' })
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <UiPageHeader title="Edit Workspace" description="Standalone route kept for compatibility." />
    <div class="rounded-xl border border-border bg-card p-5 shadow-soft">
      <WorkspaceForm submit-label="Save changes" :initial-value="initialValue" :loading="workspaceStore.isLoading" @submit="submit" @cancel="router.back()" />
    </div>
  </div>
</template>
