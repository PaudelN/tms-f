<template>
  <div class="min-h-screen bg-background p-6">
    <UiDialog
      :open="open"
      title="Add workspace"
      description="Minimal create form"
      :modal="false"
      content-class="sm:max-w-xl"
      @update:open="handleClose"
    >
      <form class="space-y-3" @submit.prevent="handleSubmit">
        <div class="space-y-1">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" required placeholder="Workspace name" />
        </div>
        <div class="space-y-1">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" rows="4" placeholder="Optional" />
        </div>
      </form>

      <template #footer>
        <Button type="button" variant="outline" @click="router.push({ name: 'workspace' })">Cancel</Button>
        <Button type="button" :disabled="workspaceStore.isLoading" @click="handleSubmit">Create</Button>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UiDialog } from '@/components/ui/dialog'
import { useWorkspaceStore } from '@/stores/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const open = ref(true)

const form = reactive({
  name: '',
  description: '',
})

function handleClose(nextOpen: boolean) {
  open.value = nextOpen
  if (!nextOpen) router.push({ name: 'workspace' })
}

async function handleSubmit() {
  if (!form.name.trim()) return

  const workspace = await workspaceStore.createWorkspace({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
  })

  router.push({ name: 'workspace-detail', params: { id: workspace.id } })
}
</script>
