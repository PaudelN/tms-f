<template>
  <UiDetail
    :loading="workspaceStore.isDetailLoading"
    loading-text="Loading workspace…"
    :breadcrumbs="breadcrumbs"
    :status-badge="{ label: 'Active' }"
    :actions="actions"
    :meta-fields="metaFields"
    :meta-default-size="22"
    :delete-open="deleteModalOpen"
    :delete-loading="deleteLoading"
    :delete-dialog="deleteDialog"
    activity-coming-soon
    @update:delete-open="deleteModalOpen = $event"
    @confirm-delete="confirmDelete"
  >
    <!-- ── Right panel content ── -->
    <template #content>

      <!-- Cover -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <ImageIcon class="h-3.5 w-3.5 text-muted-foreground" />
          <h2 class="text-[12px] font-semibold tracking-tight">Cover</h2>
        </div>
        <div class="rounded-lg border border-dashed border-border/60 bg-muted/15 h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/25 hover:border-primary/30 transition-all duration-200 group">
          <ImageIcon class="h-7 w-7 opacity-20 group-hover:opacity-40 transition-opacity" />
          <p class="text-[11px] font-medium opacity-40 group-hover:opacity-60 transition-opacity">Click to upload a cover image</p>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <AlignLeft class="h-3.5 w-3.5 text-muted-foreground" />
          <h2 class="text-[12px] font-semibold tracking-tight">Description</h2>
        </div>
        <div
          v-if="workspace?.description"
          class="text-[13px] text-foreground/80 leading-relaxed rounded-lg bg-muted/20 border border-border/40 px-4 py-3.5"
        >
          {{ workspace.description }}
        </div>
        <div
          v-else
          class="text-[12px] text-muted-foreground/60 italic rounded-lg bg-muted/10 border border-dashed border-border/40 px-4 py-3.5 cursor-pointer hover:bg-muted/20 hover:text-muted-foreground transition-all duration-200"
          @click="handleEdit"
        >
          No description yet — click to add one.
        </div>
      </div>

    </template>

    <!-- ── Delete dialog body ── -->
    <template #delete-body>
      <span>
        <strong class="font-semibold">{{ workspace?.name }}</strong>
        and all its projects and tasks will be permanently removed.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'

import UiDetail from '@/components/common/UiDetail.vue'
import type { ActionButton, BreadcrumbItem, MetaField } from '@/components/common/UiDetail.vue'

import { AlignLeft, ArchiveRestore, CalendarDays, Clock, ImageIcon, Lock, SquarePen, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const deleteModalOpen = ref(false)
const deleteLoading = ref(false)

const workspace = computed(() => workspaceStore.activeWorkspace)

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Workspaces', onClick: () => router.push({ name: 'workspace' }) },
  { label: workspace.value?.name ?? 'Workspace' },
])

const actions = computed<ActionButton[]>(() => [
  {
    id: 'archive',
    label: 'Archive',
    icon: ArchiveRestore,
    onClick: () => {},
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: SquarePen,
    onClick: handleEdit,
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    onClick: () => { deleteModalOpen.value = true },
  },
])

const metaFields = computed<MetaField[]>(() => [
  { label: 'Created At', value: formatDate(workspace.value?.created_at), icon: CalendarDays },
  { label: 'Updated At', value: formatDate(workspace.value?.updated_at), icon: Clock },
  { label: 'Visibility', value: 'Private', icon: Lock },
  { label: 'Status', type: 'badge', value: 'Active' },
  {
    label: 'Owner',
    type: 'avatar',
    avatarData: workspace.value?.user ? {
      initials: workspace.value.user.name.charAt(0).toUpperCase(),
      name: workspace.value.user.name,
      sub: workspace.value.user.email,
    } : undefined,
  },
])

const deleteDialog = {
  title: 'Delete Workspace',
  description: 'This action cannot be undone.',
  confirmLabel: 'Delete Workspace',
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) router.push({ name: 'workspace' })
  else await workspaceStore.fetchWorkspace(id)
})

function handleEdit() {
  router.push({ name: 'workspace-edit', params: { id: workspace.value?.id } })
}

async function confirmDelete() {
  if (!workspace.value) return
  deleteLoading.value = true
  await workspaceStore.deleteWorkspace(workspace.value.id)
  deleteLoading.value = false
  router.push({ name: 'workspace' })
}

function formatDate(date?: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>