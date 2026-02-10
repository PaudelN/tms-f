<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiMetricGrid from '@/components/shared/UiMetricGrid.vue'
import UiStatCard from '@/components/shared/UiStatCard.vue'
import UiEmptyState from '@/components/shared/UiEmptyState.vue'
import UiErrorBoundary from '@/components/shared/UiErrorBoundary.vue'
import UiTable, { type UiTableColumn } from '@/components/shared/UiTable.vue'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { toast } from '@/utils/toast'
import WorkspaceForm from '@/features/workspace/components/WorkspaceForm.vue'
import WorkspaceDetailPanel from '@/features/workspace/components/WorkspaceDetailPanel.vue'
import UiConfirmDialog from '@/components/shared/UiConfirmDialog.vue'

const workspaceStore = useWorkspaceStore()

const addOpen = ref(false)
const editOpen = ref(false)
const detailOpen = ref(false)
const deleteOpen = ref(false)
const selectedWorkspace = ref<Workspace | null>(null)

const columns: UiTableColumn<Workspace>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description', searchable: true },
  { key: 'user', label: 'Owner', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
]

const pagination = computed(() => ({
  page: workspaceStore.currentPage,
  perPage: workspaceStore.perPage,
  total: workspaceStore.totalWorkspaces,
}))

const activeCount = computed(() => workspaceStore.workspaces.filter((workspace) => !workspace.isArchived).length)
const archivedCount = computed(() => workspaceStore.workspaces.filter((workspace) => workspace.isArchived).length)

onMounted(() => {
  fetchPage(1)
})

async function fetchPage(page: number) {
  await workspaceStore.fetchWorkspaces({ page })
}

function openDetail(row: Workspace) {
  selectedWorkspace.value = row
  detailOpen.value = true
}

function openEdit() {
  if (!selectedWorkspace.value) return
  detailOpen.value = false
  editOpen.value = true
}

async function createWorkspace(payload: { name: string; description?: string }) {
  await toast.promise(workspaceStore.createWorkspace(payload), {
    loading: 'Creating workspace…',
    success: 'Workspace created',
    error: 'Unable to create workspace',
  })
  addOpen.value = false
}

async function updateWorkspace(payload: { name: string; description?: string }) {
  if (!selectedWorkspace.value) return
  await toast.promise(workspaceStore.updateWorkspace(selectedWorkspace.value.id, payload), {
    loading: 'Updating workspace…',
    success: 'Workspace updated',
    error: 'Unable to update workspace',
  })
  editOpen.value = false
  await workspaceStore.fetchWorkspaces({ page: workspaceStore.currentPage })
}

function askDelete(row?: Workspace) {
  if (row) selectedWorkspace.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selectedWorkspace.value) return
  await toast.promise(workspaceStore.deleteWorkspace(selectedWorkspace.value.id), {
    loading: 'Deleting workspace…',
    success: 'Workspace deleted',
    error: 'Unable to delete workspace',
  })
  deleteOpen.value = false
  detailOpen.value = false
}

function onTableAction(payload: { type: string; row: Workspace }) {
  if (payload.type === 'view') openDetail(payload.row)
  if (payload.type === 'edit') {
    selectedWorkspace.value = payload.row
    editOpen.value = true
  }
  if (payload.type === 'delete') askDelete(payload.row)
}
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader
      title="Workspace Control Center"
      description="Calm, high-density workspace management with safe, dialog-driven operations."
      action-label="Add workspace"
      @action="addOpen = true"
    />

    <UiMetricGrid>
      <UiStatCard label="Total Workspaces" :value="workspaceStore.totalWorkspaces" helper="Across all teams" />
      <UiStatCard label="Active" :value="activeCount" helper="Operational spaces" />
      <UiStatCard label="Archived" :value="archivedCount" helper="Historical context" />
      <UiStatCard label="Owners" :value="workspaceStore.workspaces.length ? new Set(workspaceStore.workspaces.map((w) => w.user_id)).size : 0" helper="Distinct ownership" />
    </UiMetricGrid>

    <UiErrorBoundary v-if="workspaceStore.hasError" :message="workspaceStore.errorMessage || 'Unable to load workspaces'" @retry="fetchPage(workspaceStore.currentPage)" />

    <UiEmptyState
      v-else-if="!workspaceStore.isLoading && workspaceStore.workspaces.length === 0"
      title="No workspaces yet"
      description="Create your first workspace to start organizing initiatives."
      cta-label="Create workspace"
      @cta="addOpen = true"
    />

    <UiTable
      v-else
      :data="workspaceStore.workspaces"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      :loading="workspaceStore.isLoading"
      @row-click="openDetail"
      @action="onTableAction"
      @page-change="fetchPage"
      @per-page-change="(value) => workspaceStore.fetchWorkspaces({ page: 1, perPage: value })"
    >
      <template #cell-user="{ value }">
        {{ (value as Workspace['user'])?.name ?? 'Unassigned' }}
      </template>
      <template #cell-created_at="{ value }">
        {{ new Date(String(value)).toLocaleDateString() }}
      </template>
    </UiTable>

    <Dialog :open="addOpen" @update:open="addOpen = $event">
      <DialogContent class="sm:max-w-xl">
        <WorkspaceForm submit-label="Create workspace" :loading="workspaceStore.isLoading" @submit="createWorkspace" @cancel="addOpen = false" />
      </DialogContent>
    </Dialog>

    <Dialog :open="editOpen" @update:open="editOpen = $event">
      <DialogContent class="sm:max-w-xl">
        <WorkspaceForm
          submit-label="Save changes"
          :loading="workspaceStore.isLoading"
          :initial-value="{ name: selectedWorkspace?.name ?? '', description: selectedWorkspace?.description }"
          @submit="updateWorkspace"
          @cancel="editOpen = false"
        />
      </DialogContent>
    </Dialog>

    <Sheet :open="detailOpen" @update:open="detailOpen = $event">
      <SheetContent class="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Workspace Details</SheetTitle>
        </SheetHeader>
        <div class="mt-4">
          <WorkspaceDetailPanel :workspace="selectedWorkspace" @edit="openEdit" @close="detailOpen = false" />
        </div>
      </SheetContent>
    </Sheet>

    <UiConfirmDialog
      :open="deleteOpen"
      title="Delete workspace"
      :description="`Delete ${selectedWorkspace?.name ?? 'this workspace'}? This action cannot be undone.`"
      :loading="workspaceStore.isLoading"
      @update:open="deleteOpen = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
