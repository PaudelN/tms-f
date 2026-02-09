<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="router.back()"
            class="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            title="Go back"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-4xl font-bold text-foreground mb-2">
              Create Workspace
            </h1>
            <p class="text-muted-foreground">
              Add a new workspace to organize your work
            </p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Workspace Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name Field -->
            <div class="space-y-2">
              <Label for="name" class="text-sm font-semibold text-foreground">
                Workspace Name
                <span class="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Enter workspace name"
                :class="{ 'border-destructive focus:border-destructive focus:ring-destructive': errors.name }"
                required
              />
              <p v-if="errors.name" class="text-xs text-destructive mt-1">
                {{ errors.name }}
              </p>
            </div>

            <!-- Description Field -->
            <div class="space-y-2">
              <Label for="description" class="text-sm font-semibold text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Enter workspace description (optional)"
                rows="4"
                :class="{ 'border-destructive focus:border-destructive focus:ring-destructive': errors.description }"
              />
              <p v-if="errors.description" class="text-xs text-destructive mt-1">
                {{ errors.description }}
              </p>
              <p class="text-xs text-muted-foreground">
                Provide a brief description of what this workspace is for
              </p>
            </div>

            <!-- Error Alert -->
            <Alert v-if="workspaceStore.hasError" variant="destructive">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {{ workspaceStore.errorMessage }}
              </AlertDescription>
            </Alert>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                @click="router.back()"
                class="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                :disabled="workspaceStore.isLoading"
                class="flex-1 gap-2"
              >
                <svg v-if="workspaceStore.isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ workspaceStore.isLoading ? 'Creating...' : 'Create Workspace' }}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Tips Card -->
      <Card class="mt-6">
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg class="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-sm text-muted-foreground">
              Choose a clear, descriptive name that helps you identify the workspace quickly
            </p>
          </div>
          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg class="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-sm text-muted-foreground">
              Add a description to help team members understand the workspace's purpose
            </p>
          </div>
          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg class="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-sm text-muted-foreground">
              You can always edit these details later from the workspace settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const form = reactive({
  name: '',
  description: '',
})

const errors = reactive({
  name: '',
  description: '',
})

function validateForm(): boolean {
  errors.name = ''
  errors.description = ''

  let isValid = true

  if (!form.name.trim()) {
    errors.name = 'Workspace name is required'
    isValid = false
  } else if (form.name.trim().length < 3) {
    errors.name = 'Workspace name must be at least 3 characters'
    isValid = false
  } else if (form.name.trim().length > 255) {
    errors.name = 'Workspace name must not exceed 255 characters'
    isValid = false
  }

  if (form.description && form.description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  workspaceStore.clearError()

  if (!validateForm()) {
    return
  }

  try {
    const workspace = await workspaceStore.createWorkspace({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    })

    router.push({ name: 'workspace-detail', params: { id: workspace.id } })
  } catch (error) {
    console.error('Failed to create workspace:', error)
  }
}
</script>