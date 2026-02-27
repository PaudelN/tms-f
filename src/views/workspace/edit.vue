<template>
  <div :class="inDialog ? 'space-y-4' : 'min-h-screen bg-background p-6'">
    <div :class="inDialog ? 'space-y-4' : 'mx-auto max-w-4xl space-y-6'">
      <div v-if="!inDialog" class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Edit workspace</h1>
          <p class="text-muted-foreground">Refine settings and keep data up to date.</p>
        </div>
        <Button variant="outline" @click="router.back">Back</Button>
      </div>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Update information</CardTitle>
            <CardDescription>Changes save directly to your workspace.</CardDescription>
          </div>
          <Badge v-if="hasChanges" class="bg-amber-500/15 text-amber-600">
            <CircleDot class="mr-1 h-3 w-3 animate-pulse" />
            Unsaved changes
          </Badge>
        </CardHeader>
        <CardContent>
          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input id="name" v-model="form.name" required />
            </div>
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="form.description" rows="5" />
            </div>

            <Alert v-if="workspaceStore.hasError" variant="destructive">
              <AlertTitle>Update failed</AlertTitle>
              <AlertDescription>{{ workspaceStore.errorMessage }}</AlertDescription>
            </Alert>

            <div :class="['flex gap-2', inDialog ? 'sticky bottom-0 bg-background pb-1' : 'pt-2']">
              <Button type="button" variant="outline" class="flex-1" @click="handleCancel">Cancel</Button>
              <Button type="submit" class="flex-1" :disabled="workspaceStore.isLoading || !hasChanges">
                {{ workspaceStore.isLoading ? 'Saving...' : 'Save changes' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleDot } from 'lucide-vue-next'
import { useWorkspaceStore } from '@/stores/workspace'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = withDefaults(defineProps<{ inDialog?: boolean; workspaceId?: number }>(), {
  inDialog: false,
  workspaceId: undefined,
})
const emit = defineEmits<{ (e: 'done'): void }>()

const workspaceStore = useWorkspaceStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ name: '', description: '' })
const original = reactive({ name: '', description: '' })

const hasChanges = computed(() => form.name !== original.name || form.description !== original.description)

onMounted(loadWorkspace)

async function loadWorkspace() {
  const id = props.workspaceId ?? Number(route.params.id)
  if (!id) return
  const item = await workspaceStore.fetchWorkspace(id)
  form.name = item.name
  form.description = item.description ?? ''
  original.name = form.name
  original.description = form.description
}

async function handleSubmit() {
  const id = props.workspaceId ?? Number(route.params.id)
  if (!id) return
  await workspaceStore.updateWorkspace(id, { name: form.name, description: form.description || undefined })
  emit('done')
  if (!props.inDialog) router.push({ name: 'workspace-detail', params: { id } })
}

function handleCancel() {
  emit('done')
  if (!props.inDialog) router.back()
}
</script>
