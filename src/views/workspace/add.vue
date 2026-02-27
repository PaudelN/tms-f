<template>
  <div :class="inDialog ? 'space-y-4' : 'min-h-screen bg-background p-6'">
    <div :class="inDialog ? 'space-y-4' : 'mx-auto max-w-4xl space-y-6'">
      <div v-if="!inDialog" class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Create workspace</h1>
          <p class="text-muted-foreground">Set up a polished workspace for your team.</p>
        </div>
        <Button variant="outline" @click="router.back">Back</Button>
      </div>

      <Card class="border-primary/20">
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
          <CardDescription>Choose a clear name and optional description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input id="name" v-model="form.name" placeholder="Product strategy" required />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
            </div>
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="form.description" rows="5" placeholder="Describe this workspace..." />
            </div>

            <Alert v-if="workspaceStore.hasError" variant="destructive">
              <AlertTitle>Could not create workspace</AlertTitle>
              <AlertDescription>{{ workspaceStore.errorMessage }}</AlertDescription>
            </Alert>

            <div :class="['flex gap-2', inDialog ? 'sticky bottom-0 bg-background pb-1' : 'pt-2']">
              <Button type="button" variant="outline" class="flex-1" @click="handleCancel">Cancel</Button>
              <Button type="submit" class="flex-1" :disabled="workspaceStore.isLoading">
                {{ workspaceStore.isLoading ? 'Creating...' : 'Create workspace' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = withDefaults(defineProps<{ inDialog?: boolean }>(), { inDialog: false })
const emit = defineEmits<{ (e: 'done'): void }>()

const workspaceStore = useWorkspaceStore()
const router = useRouter()

const form = reactive({ name: '', description: '' })
const errors = reactive({ name: '' })

async function handleSubmit() {
  errors.name = form.name.trim() ? '' : 'Name is required.'
  if (errors.name) return

  await workspaceStore.createWorkspace({ name: form.name, description: form.description || undefined })
  emit('done')
  if (!props.inDialog) router.push({ name: 'workspace' })
}

function handleCancel() {
  emit('done')
  if (!props.inDialog) router.back()
}
</script>
