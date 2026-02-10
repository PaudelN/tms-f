<script setup lang="ts">
import { useRouter } from 'vue-router'
import WorkspaceForm from '@/features/workspace/components/WorkspaceForm.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { toast } from '@/utils/toast'
import UiPageHeader from '@/components/shared/UiPageHeader.vue'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

async function submit(payload: { name: string; description?: string }) {
  await toast.promise(workspaceStore.createWorkspace(payload), {
    loading: 'Creating workspace…',
    success: 'Workspace created',
    error: 'Unable to create workspace',
  })
  router.push({ name: 'workspace' })
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <UiPageHeader title="Create Workspace" description="Standalone route kept for compatibility." />
    <div class="rounded-xl border border-border bg-card p-5 shadow-soft">
      <WorkspaceForm submit-label="Create workspace" :loading="workspaceStore.isLoading" @submit="submit" @cancel="router.back()" />
    </div>
  </div>
</template>
