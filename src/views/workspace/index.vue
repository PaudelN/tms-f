<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiKpiGrid from '@/components/shared/UiKpiGrid.vue'
import UiStatCard from '@/components/shared/UiStatCard.vue'
import UiTable, { type UiTableColumn } from '@/components/shared/UiTable.vue'
import UiErrorBoundary from '@/components/shared/UiErrorBoundary.vue'
import WorkspaceAdd from './add.vue'
import WorkspaceEdit from './edit.vue'
import WorkspaceDetail from './detail.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useWorkspaceCrud } from '@/composables/useWorkspaceCrud'
import type { Workspace } from '@/types/workspace'

const { rows, loading, error, stats, refresh, create, update, remove } = useWorkspaceCrud()

const page = ref(1)
const pageSize = ref(8)
const selected = ref<Workspace[]>([])
const detailOpen = ref(false)
const formOpen = ref(false)
const deleteOpen = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const activeRow = ref<Workspace | null>(null)

const columns: UiTableColumn<Workspace>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'members', label: 'Members', sortable: true },
  { key: 'updatedAt', label: 'Updated', sortable: true },
]

const pagination = computed(() => ({ page: page.value, pageSize: pageSize.value, total: rows.value.length }))

onMounted(refresh)

function openAdd() {
  formMode.value = 'add'
  formOpen.value = true
}

function handleRowAction(payload: { action: string; row: Workspace }) {
  activeRow.value = payload.row
  if (payload.action === 'view') detailOpen.value = true
  if (payload.action === 'edit') {
    formMode.value = 'edit'
    formOpen.value = true
  }
  if (payload.action === 'delete') deleteOpen.value = true
}

async function submitCreate(payload: Parameters<typeof create>[0]) {
  await create(payload)
  formOpen.value = false
}

async function submitEdit(payload: Parameters<typeof update>[1]) {
  if (!activeRow.value) return
  await update(activeRow.value.id, payload)
  formOpen.value = false
}

async function submitDelete() {
  if (!activeRow.value) return
  await remove(activeRow.value.id)
  deleteOpen.value = false
  detailOpen.value = false
}
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader title="Workspace Center" description="Calm, dialog-first operations for managing workspaces.">
      <template #actions>
        <Button class="gap-2" @click="openAdd"><Plus class="size-4" />New workspace</Button>
      </template>
    </UiPageHeader>

    <UiKpiGrid>
      <UiStatCard label="Total" :value="stats.total" hint="All active and archived workspaces" />
      <UiStatCard label="Active" :value="stats.active" />
      <UiStatCard label="Paused" :value="stats.paused" />
      <UiStatCard label="Archived" :value="stats.archived" />
    </UiKpiGrid>

    <UiErrorBoundary v-if="error" :message="error" />

    <UiTable
      :data="rows"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      title="Workspace inventory"
      @update:pagination="(value) => { page = value.page; pageSize = value.pageSize }"
      @select="(rows) => (selected = rows)"
      @action="handleRowAction"
    >
      <template #cell-status="{ value }">
        <span class="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{{ value }}</span>
      </template>
    </UiTable>

    <p v-if="selected.length" class="text-xs text-muted-foreground">{{ selected.length }} selected for bulk actions.</p>

    <Sheet v-model:open="detailOpen">
      <SheetContent class="sm:max-w-xl">
        <SheetHeader><SheetTitle>Workspace detail</SheetTitle></SheetHeader>
        <WorkspaceDetail :workspace="activeRow" @edit="() => { detailOpen = false; formMode = 'edit'; formOpen = true }" @delete="deleteOpen = true" />
      </SheetContent>
    </Sheet>

    <Dialog v-model:open="formOpen">
      <DialogContent class="sm:max-w-2xl">
        <WorkspaceAdd v-if="formMode === 'add'" @cancel="formOpen = false" @submit="submitCreate" />
        <WorkspaceEdit v-else :workspace="activeRow" @cancel="formOpen = false" @submit="submitEdit" />
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
          <AlertDialogDescription>This action is destructive and cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground" @click="submitDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
