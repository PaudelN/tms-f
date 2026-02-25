<template>
  <div class="min-h-screen bg-background p-6">
    <div class="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Add workspace</h1>
          <p class="text-sm text-muted-foreground">Minimal full page create view.</p>
        </div>
        <Button type="button" variant="ghost" @click="router.push({ name: 'workspace' })">Back to list</Button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" required placeholder="Workspace name" />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" rows="4" placeholder="Optional description" />
        </div>

        <p v-if="workspaceStore.hasError" class="text-sm text-destructive">{{ workspaceStore.errorMessage }}</p>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="router.push({ name: 'workspace' })">Cancel</Button>
          <Button type="submit" :disabled="workspaceStore.isLoading">Create</Button>
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
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const form = reactive({
  name: '',
  description: '',
})

async function handleSubmit() {
  workspaceStore.clearError()
  const workspace = await workspaceStore.createWorkspace({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
  })

  router.push({ name: 'workspace-detail', params: { id: workspace.id } })
}
</script>
