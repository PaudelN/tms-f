<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-3xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>

      <!-- Form -->
      <div v-else>
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
                Edit Workspace
              </h1>
              <p class="text-muted-foreground">
                Update workspace information
              </p>
            </div>
          </div>
        </div>

        <!-- Form Card -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

              <!-- Metadata Display -->
              <div class="bg-muted rounded-lg p-4 space-y-2">
                <h3 class="text-sm font-semibold text-foreground mb-3">Metadata</h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-muted-foreground">Created:</span>
                    <span class="ml-2 text-foreground font-medium">
                      {{ workspace ? formatDate(workspace.created_at) : 'N/A' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Updated:</span>
                    <span class="ml-2 text-foreground font-medium">
                      {{ workspace ? formatDate(workspace.updated_at) : 'N/A' }}
                    </span>
                  </div>
                </div>
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
                  :disabled="workspaceStore.isLoading || !hasChanges"
                  class="flex-1 gap-2"
                >
                  <svg v-if="workspaceStore.isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ workspaceStore.isLoading ? 'Saving...' : 'Save Changes' }}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loading = ref(true)
const workspace = computed(() => workspaceStore.activeWorkspace)

const form = reactive({
  name: '',
  description: '',
})

const originalForm = reactive({
  name: '',
  description: '',
})

const errors = reactive({
  name: '',
  description: '',
})

const hasChanges = computed(() => {
  return (
    form.name.trim() !== originalForm.name ||
    form.description.trim() !== originalForm.description
  )
})

onMounted(async () => {
  await loadWorkspace()
})

async function loadWorkspace() {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    router.push({ name: 'workspace' })
    return
  }

  loading.value = true
  try {
    await workspaceStore.fetchWorkspace(id)
    
    if (workspace.value) {
      form.name = workspace.value.name
      form.description = workspace.value.description || ''
      
      originalForm.name = workspace.value.name
      originalForm.description = workspace.value.description || ''
    }
  } catch (error) {
    console.error('Failed to load workspace:', error)
    router.push({ name: 'workspace' })
  } finally {
    loading.value = false
  }
}

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
  if (!workspace.value) return

  workspaceStore.clearError()

  if (!validateForm()) {
    return
  }

  try {
    await workspaceStore.updateWorkspace(workspace.value.id, {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    })

    originalForm.name = form.name.trim()
    originalForm.description = form.description.trim()

    router.push({ name: 'workspace-detail', params: { id: workspace.value.id } })
  } catch (error) {
    console.error('Failed to update workspace:', error)
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>