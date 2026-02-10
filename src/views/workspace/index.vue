<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import WorkspaceAdd from './add.vue'
import WorkspaceDetail from './detail.vue'
import WorkspaceEdit from './edit.vue'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { UiConfirmDialog, UiErrorBoundary, UiMetricGrid, UiPageHeader, UiSearchInput, UiStatCard, UiTable, UiToolbar } from '@/components/shared'
import { toast } from '@/utils/toast'

const store = useWorkspaceStore()
const search = ref('')
const detailOpen = ref(false)
const formOpen = ref(false)
const deleteOpen = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const selectedId = ref<number | null>(null)

const fallbackRows: Workspace[] = [
  { id: 801, name: 'Platform Operations', description: 'Internal ops workspace', user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), isArchived: false, user: { id: 1, name: 'Ops Team', email: 'ops@example.com' } },
  { id: 802, name: 'Security Program', description: 'Security controls and audit', user_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), isArchived: false, user: { id: 2, name: 'Sec Team', email: 'sec@example.com' } },
]

const rows = computed(() => {
  const base = store.workspaceList.length ? store.workspaceList : fallbackRows
  if (!search.value.trim()) return base
  const query = search.value.toLowerCase()
  return base.filter((row) => row.name.toLowerCase().includes(query) || (row.description ?? '').toLowerCase().includes(query))
})

const columns = [
  { key: 'name', label: 'Workspace', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'user_id', label: 'Owner', sortable: true, type: 'numeric' as const },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: '', type: 'actions' as const },
]

onMounted(async () => {
  try {
    await store.fetchWorkspaces()
  } catch {
    toast.warning('Using local fallback data', 'Backend unavailable for workspace fetch.')
  }
})

function openAdd() {
  formMode.value = 'add'
  formOpen.value = true
}

function openEdit(id: number | null) {
  if (!id) return
  selectedId.value = id
  formMode.value = 'edit'
  formOpen.value = true
}

function handleRowClick(row: Workspace) {
  selectedId.value = row.id
  detailOpen.value = true
}

function handleAction(payload: { type: string; row: Workspace }) {
  selectedId.value = payload.row.id
  if (payload.type === 'edit') {
    openEdit(payload.row.id)
    return
  }

  if (payload.type === 'delete') {
    deleteOpen.value = true
    return
  }

  detailOpen.value = true
}

async function confirmDelete() {
  if (!selectedId.value) return

  try {
    await store.deleteWorkspace(selectedId.value)
    toast.success('Workspace deleted')
  } catch {
    toast.error('Failed to delete workspace')
  } finally {
    deleteOpen.value = false
  }
}

function handleSaved() {
  formOpen.value = false
  detailOpen.value = false
}
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader title="Workspace" description="Dialog-driven CRUD with resilient table interactions.">
      <template #actions>
        <Button class="gap-2" @click="openAdd"><Plus class="h-4 w-4" />New workspace</Button>
      </template>
    </UiPageHeader>

    <UiMetricGrid>
      <UiStatCard label="Total" :value="rows.length" />
      <UiStatCard label="Active" :value="rows.filter((r) => !r.isArchived).length" />
      <UiStatCard label="Archived" :value="rows.filter((r) => r.isArchived).length" />
      <UiStatCard label="Errors" :value="store.error ? 1 : 0" />
    </UiMetricGrid>

    <UiErrorBoundary v-if="store.error && !rows.length" :message="store.error" @retry="store.fetchWorkspaces()" />

    <UiToolbar>
      <UiSearchInput v-model="search" placeholder="Search workspaces" />
      <Button variant="outline" @click="store.fetchWorkspaces()">Refresh</Button>
    </UiToolbar>

    <UiTable :data="rows" :columns="columns" :loading="store.loading" @row-click="handleRowClick" @action="handleAction" />

    <Sheet v-model:open="detailOpen">
      <SheetContent class="w-full sm:max-w-xl">
        <SheetHeader><SheetTitle>Workspace detail</SheetTitle></SheetHeader>
        <div class="mt-4">
          <WorkspaceDetail :id="selectedId" @close="detailOpen = false" @edit="openEdit(selectedId)" />
        </div>
      </SheetContent>
    </Sheet>

    <Dialog v-model:open="formOpen">
      <DialogContent class="rounded-2xl sm:max-w-xl">
        <DialogHeader><DialogTitle>{{ formMode === 'add' ? 'Create workspace' : 'Edit workspace' }}</DialogTitle></DialogHeader>
        <WorkspaceAdd v-if="formMode === 'add'" @success="handleSaved" @cancel="formOpen = false" />
        <WorkspaceEdit v-else :id="selectedId" @success="handleSaved" @cancel="formOpen = false" />
      </DialogContent>
    </Dialog>

    <UiConfirmDialog
      v-model:open="deleteOpen"
      title="Delete workspace"
      description="This action permanently removes the workspace from the list."
      confirm-text="Delete"
      @confirm="confirmDelete"
    />
  </div>
</template>
