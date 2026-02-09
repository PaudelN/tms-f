<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-5xl mx-auto">
      <!-- Loading State -->
      <div v-if="workspaceStore.isDetailLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-muted-foreground">Loading workspace details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="workspaceStore.hasError" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg class="h-8 w-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2">Error Loading Workspace</h3>
          <p class="text-muted-foreground mb-4">{{ workspaceStore.errorMessage }}</p>
          <div class="flex gap-3 justify-center">
            <Button variant="outline" @click="router.back()">Go Back</Button>
            <Button @click="loadWorkspace">Try Again</Button>
          </div>
        </div>
      </div>

      <!-- Workspace Detail -->
      <div v-else-if="workspace" class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <button
              @click="router.back()"
              class="mt-1 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
              title="Go back"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <h1 class="text-4xl font-bold text-foreground mb-2">
                {{ workspace.name }}
              </h1>
              <p v-if="workspace.description" class="text-muted-foreground">
                {{ workspace.description }}
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" @click="handleEdit" class="gap-2">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
            <Button variant="destructive" @click="handleDelete" class="gap-2">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        </div>

        <!-- Info Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Owner Card -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2">
                <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Owner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="workspace.user" class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span class="text-primary text-lg font-bold">
                    {{ workspace.user.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="font-semibold text-foreground">{{ workspace.user.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ workspace.user.email }}</p>
                </div>
              </div>
              <p v-else class="text-muted-foreground">No owner assigned</p>
            </CardContent>
          </Card>

          <!-- Metadata Card -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2">
                <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Information
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-border">
                <span class="text-sm font-medium text-muted-foreground">Workspace ID</span>
                <span class="text-sm font-semibold text-foreground">{{ workspace.id }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-border">
                <span class="text-sm font-medium text-muted-foreground">Created</span>
                <span class="text-sm font-semibold text-foreground">{{ formatDate(workspace.created_at) }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span class="text-sm font-semibold text-foreground">{{ formatDate(workspace.updated_at) }}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Description Card -->
        <Card v-if="workspace.description">
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-foreground leading-relaxed">{{ workspace.description }}</p>
          </CardContent>
        </Card>

        <!-- Activity Timeline -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-center py-8">
              <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm text-muted-foreground">No recent activity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong class="text-destructive">{{ workspace?.name }}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="deleteModalOpen = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="deleteLoading"
            class="gap-2"
          >
            <svg v-if="deleteLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ deleteLoading ? 'Deleting...' : 'Delete' }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const deleteModalOpen = ref(false)
const deleteLoading = ref(false)

const workspace = computed(() => workspaceStore.activeWorkspace)

onMounted(() => {
  loadWorkspace()
})

async function loadWorkspace() {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    router.push({ name: 'workspace' })
    return
  }

  try {
    await workspaceStore.fetchWorkspace(id)
  } catch (error) {
    console.error('Failed to load workspace:', error)
  }
}

function handleEdit() {
  router.push({ name: 'workspace-edit', params: { id: workspace.value?.id } })
}

function handleDelete() {
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!workspace.value) return

  deleteLoading.value = true
  try {
    await workspaceStore.deleteWorkspace(workspace.value.id)
    router.push({ name: 'workspace' })
  } catch (error) {
    console.error('Failed to delete workspace:', error)
  } finally {
    deleteLoading.value = false
    deleteModalOpen.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>