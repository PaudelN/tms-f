<template>
  <div class="min-h-screen bg-background p-6">
    <UiDialog
      :open="open"
      title="Edit workspace"
      description="Minimal update form"
      :modal="false"
      :fullscreen-to="workspace ? { name: 'workspace-detail', params: { id: workspace.id } } : undefined"
      content-class="sm:max-w-xl"
      @update:open="handleClose"
    >
      <div v-if="loading" class="py-8 text-center text-sm text-muted-foreground">Loading...</div>

      <form v-else class="space-y-3" @submit.prevent="handleSubmit">
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
        <Button type="button" :disabled="workspaceStore.isLoading || loading" @click="handleSubmit">Save</Button>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UiDialog } from '@/components/ui/dialog'
import { useWorkspaceStore } from '@/stores/workspace'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const open = ref(true)
const loading = ref(true)

const workspace = computed(() => workspaceStore.activeWorkspace)
const form = reactive({
  name: '',
  description: '',
})

onMounted(loadWorkspace)

async function loadWorkspace() {
  const id = Number(route.params.id)
  if (!id) {
    router.push({ name: 'workspace' })
    return
  }

  loading.value = true
  const item = await workspaceStore.fetchWorkspace(id)
  form.name = item.name
  form.description = item.description || ''
  loading.value = false
}

function handleClose(nextOpen: boolean) {
  open.value = nextOpen
  if (!nextOpen) router.push({ name: 'workspace' })
}

async function handleSubmit() {
  if (!workspace.value || !form.name.trim()) return

  await workspaceStore.updateWorkspace(workspace.value.id, {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
  })

  router.push({ name: 'workspace-detail', params: { id: workspace.value.id } })
}
</script>
