<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { UiPageHeader, UiTable } from '@/components/shared'
import type { UiTableColumn } from '@/components/shared/UiTable.vue'
import type { Project } from '@/features/projects/types'
import ProjectAdd from './add.vue'
import ProjectDetail from './detail.vue'
import ProjectEdit from './edit.vue'
import { toast } from '@/utils/toast'

const loading = ref(false)
const detailOpen = ref(false)
const formOpen = ref(false)
const editing = ref(false)
const selected = ref<Project | null>(null)

const projects = ref<Project[]>([
  { id: 1, name: 'Atlas Migration', owner: 'Ari Patel', status: 'Active', budget: '$52,000' },
  { id: 2, name: 'Onboarding Hub', owner: 'Nora Vega', status: 'Planning', budget: '$24,000' },
  { id: 3, name: 'Revenue Pulse', owner: 'Jin Park', status: 'Blocked', budget: '$18,500' },
])

const columns: UiTableColumn<Project>[] = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'status', label: 'Status', sortable: true, type: 'badge' },
  { key: 'budget', label: 'Budget', sortable: true },
  { key: 'actions', label: '', type: 'actions' },
]

const rowActions = [
  { label: 'View details', action: 'view' },
  { label: 'Edit', action: 'edit' },
  { label: 'Delete', action: 'delete', destructive: true },
]

const sortedCount = computed(() => projects.value.length)

function openCreate() {
  editing.value = false
  formOpen.value = true
}

function handleAction({ action, row }: { action: string; row: Project }) {
  selected.value = row
  if (action === 'view') detailOpen.value = true
  if (action === 'edit') {
    editing.value = true
    formOpen.value = true
  }
  if (action === 'delete') {
    projects.value = projects.value.filter((item) => item.id !== row.id)
    toast.success('Project deleted')
  }
}

function onCreate(payload: { name: string; owner: string; status: string; budget: string }) {
  projects.value.unshift({ id: Date.now(), ...payload, status: payload.status as Project['status'] })
  formOpen.value = false
  toast.success('Project created')
}

function onUpdate(payload: Project) {
  projects.value = projects.value.map((item) => (item.id === payload.id ? payload : item))
  formOpen.value = false
  detailOpen.value = false
  toast.success('Project updated')
}
</script>

<template>
  <section class="space-y-6">
    <UiPageHeader title="Projects" description="Dialog-driven CRUD with reusable table primitives." action-label="Add project" @action="openCreate" />
    <UiTable :data="projects" :columns="columns" :loading="loading" :row-actions="rowActions" @action="handleAction" />
    <p class="text-xs text-muted-foreground">{{ sortedCount }} active fake records</p>

    <Sheet v-model:open="detailOpen">
      <SheetContent class="w-full sm:max-w-md">
        <ProjectDetail :project="selected" @edit="() => { detailOpen = false; editing = true; formOpen = true }" @close="detailOpen = false" />
      </SheetContent>
    </Sheet>

    <Dialog v-model:open="formOpen">
      <DialogContent class="sm:max-w-lg">
        <ProjectEdit v-if="editing" :project="selected" @success="onUpdate" @cancel="formOpen = false" />
        <ProjectAdd v-else @success="onCreate" @cancel="formOpen = false" />
      </DialogContent>
    </Dialog>
  </section>
</template>
