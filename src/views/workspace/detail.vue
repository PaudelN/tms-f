<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Loading State -->
      <div v-if="workspaceStore.isDetailLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <Spinner class="h-12 w-12 text-primary mx-auto mb-4" />
          <p class="text-muted-foreground">Loading workspace details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="workspaceStore.hasError" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle class="h-8 w-8 text-destructive" />
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="mt-1 text-muted-foreground hover:text-foreground"
              title="Go back"
              @click="router.back()"
            >
              <ArrowLeft class="h-5 w-5" />
            </Button>

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
              <Pencil class="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" @click="handleDelete" class="gap-2">
              <Trash2 class="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <!-- Info Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Owner Card -->
          <Card class="clamorphism border-border/70 shadow-lg">
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2">
                <User class="h-5 w-5 text-primary" />
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
          <Card class="clamorphism border-border/70 shadow-lg">
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2">
                <Info class="h-5 w-5 text-primary" />
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
              <AlignLeft class="h-5 w-5 text-primary" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-foreground leading-relaxed">{{ workspace.description }}</p>
          </CardContent>
        </Card>

        <!-- Activity Timeline -->
        <Card class="clamorphism border-border/70 shadow-lg">
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Clock class="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-center py-8">
              <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Clock class="h-6 w-6 text-muted-foreground" />
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
            <Spinner v-if="deleteLoading" class="h-4 w-4" />
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
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { AlignLeft, AlertCircle, ArrowLeft, Clock, Info, Pencil, Trash2, User } from 'lucide-vue-next'

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
