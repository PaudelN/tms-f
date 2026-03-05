<template>
  <div class="h-full flex flex-col bg-background overflow-hidden">
    <div class="flex flex-col flex-1 min-h-0 w-full mx-auto p-8">
      <UiHeader
        title="Workspaces"
        :stats="headerStats"
        :show-views="true"
        :show-refresh="true"
        :current-view="currentView"
        :loading="isLoading"
        create-label="Add Workspace"
        show-search
        :search-value="searchQuery"
        search-placeholder="Search workspaces..."
        show-filter
        :active-filter-count="activeFilterCount"
        @create="handleCreate"
        @update:current-view="handleViewChange"
        @update:search-value="handleSearch"
        @refresh="onRefresh"
        @filter="showFilterPanel = true"
      />

      <div class="flex-1 min-h-0 flex flex-col">

        <!-- ── Table View ── -->
        <UiTable
          v-if="currentView === 'table'"
          ref="tableRef"
          class="min-h-0 max-h-full"
          table-id="workspaces-table"
          :columns="tableColumns"
          :fetch-fn="fetchWorkspacesForTable"
          :external-search="searchQuery"
          :features="tableFeatures"
          :config="{
            defaultPerPage: 10,
            defaultSortBy: 'created_at',
            defaultSortOrder: 'desc',
            debounceMs: 400,
            persistState: true,
          }"
          search-placeholder="Search workspaces..."
          @row-click="handleView($event.id)"
        >
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center relative">
                <span class="text-primary text-sm font-bold">{{ row.name?.charAt(0).toUpperCase() ?? '?' }}</span>
                <Button type="button" variant="ghost" size="icon"
                  class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-card border border-border hover:bg-primary hover:border-primary group"
                  @click.stop="togglePin(row.id)">
                  <Star class="h-2.5 w-2.5" :class="isPinned(row.id) ? 'text-primary fill-primary' : 'text-muted-foreground group-hover:text-white'" />
                </Button>
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-foreground truncate flex items-center gap-2">
                  {{ row.name }}
                  <span v-if="row.is_archived" class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full">Archived</span>
                </div>
                <div v-if="row.description" class="text-xs text-muted-foreground truncate">{{ row.description }}</div>
              </div>
            </div>
          </template>
          <template #cell-user="{ row }">
            <span class="text-sm text-foreground">{{ row.user?.name ?? '—' }}</span>
          </template>
          <template #cell-actions="{ row }">
            <div class="flex items-center justify-center">
              <DropdownMenu :open="openRowId === row.id" @update:open="(val: any) => (openRowId = val ? row.id : null)">
                <DropdownMenuTrigger as-child>
                  <button type="button"
                    class="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150 border-0 bg-transparent cursor-pointer"
                    :class="openRowId === row.id ? 'bg-primary/10 text-primary' : ''"
                    @click.stop="openRowId = openRowId === row.id ? null : row.id">
                    <MoreVertical class="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" :side-offset="6" class="w-48 p-1.5 rounded-xl border border-border bg-popover shadow-lg">
                  <div class="px-2.5 py-1.5 mb-1">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</p>
                  </div>
                  <DropdownMenuItem class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors" @click="() => { openRowId = null; handleView(row.id) }">
                    <div class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0"><Eye class="h-3.5 w-3.5 text-primary" /></div>
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors" @click="() => { openRowId = null; handleEdit(row.id) }">
                    <div class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0"><Pencil class="h-3.5 w-3.5 text-primary" /></div>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator class="my-1.5 bg-border" />
                  <DropdownMenuItem class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-orange-600 hover:bg-orange-500/10 focus:bg-orange-500/10 focus:text-orange-600 transition-colors" @click="() => { openRowId = null; toggleArchive(row.id, row.is_archived) }">
                    <div class="h-6 w-6 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0"><Archive class="h-3.5 w-3.5 text-orange-500" /></div>
                    {{ row.is_archived ? 'Unarchive' : 'Archive' }}
                  </DropdownMenuItem>
                  <DropdownMenuItem class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors" @click="() => { openRowId = null; handleDelete(row.id, row.name) }">
                    <div class="h-6 w-6 rounded-md bg-destructive/10 flex items-center justify-center shrink-0"><Trash2 class="h-3.5 w-3.5 text-destructive" /></div>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </template>
        </UiTable>

        <!-- ── List View ── -->
        <UiList
          v-else-if="currentView === 'list'"
          ref="listRef"
          class="flex-1 min-h-0"
          list-id="workspaces-list"
          :fetch-fn="fetchWorkspacesForList"
          :features="listFeatures"
          :config="listConfig"
          :external-search="searchQuery"
          item-key="id"
        >
          <template #item-summary="{ item, isExpanded }">
            <div class="flex items-center gap-3 w-full min-w-0">
              <div class="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 relative">
                <span class="text-primary text-sm font-bold">{{ item.name?.charAt(0).toUpperCase() ?? '?' }}</span>
                <div v-if="!item.is_archived" class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-semibold text-foreground truncate">{{ item.name }}</span>
                  <span v-if="item.is_archived" class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full shrink-0">Archived</span>
                  <span v-if="isPinned(item.id)" class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">Pinned</span>
                </div>
                <p v-if="item.description" class="text-xs text-muted-foreground truncate mt-0.5">{{ item.description }}</p>
              </div>
              <div v-if="!isExpanded" class="flex items-center gap-3 shrink-0 ml-2">
                <span class="text-xs text-muted-foreground hidden sm:block">{{ item.created_at ? formatDate(item.created_at) : '—' }}</span>
              </div>
            </div>
          </template>
          <template #item-actions="{ item }">
            <div class="flex items-center gap-1" @click.stop>
              <Button type="button" variant="ghost" size="icon" class="h-7 w-7 opacity-0 group-hover/row:opacity-100 transition-opacity" @click.stop="togglePin(item.id)">
                <Star class="h-3.5 w-3.5" :class="isPinned(item.id) ? 'text-primary fill-primary' : 'text-muted-foreground'" />
              </Button>
              <Button type="button" variant="ghost" size="icon" class="h-7 w-7 text-primary opacity-0 group-hover/row:opacity-100 transition-opacity" @click.stop="handleView(item.id)">
                <Eye class="h-3.5 w-3.5" />
              </Button>
            </div>
          </template>
          <template #item-expanded="{ item }">
            <div class="space-y-4">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div class="space-y-0.5">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Owner</p>
                  <p class="text-sm text-foreground font-medium">{{ item.user?.name ?? '—' }}</p>
                </div>
                <div class="space-y-0.5">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Created</p>
                  <p class="text-sm text-foreground font-medium">{{ item.created_at ? formatDate(item.created_at) : '—' }}</p>
                </div>
                <div class="space-y-0.5">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                  <p class="text-sm font-medium" :class="item.is_archived ? 'text-orange-600' : 'text-emerald-600'">{{ item.is_archived ? 'Archived' : 'Active' }}</p>
                </div>
              </div>
              <div v-if="item.description" class="space-y-0.5">
                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</p>
                <p class="text-sm text-foreground leading-relaxed">{{ item.description }}</p>
              </div>
              <div class="flex items-center gap-2 pt-1">
                <Button size="sm" variant="outline" class="h-7 px-3 text-xs gap-1.5" @click="handleEdit(item.id)"><Pencil class="h-3 w-3" />Edit</Button>
                <Button size="sm" variant="outline" class="h-7 px-3 text-xs gap-1.5 text-orange-600 border-orange-500/30 hover:bg-orange-500/10" @click="toggleArchive(item.id, item.is_archived)"><Archive class="h-3 w-3" />{{ item.is_archived ? 'Unarchive' : 'Archive' }}</Button>
                <Button size="sm" variant="outline" class="h-7 px-3 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" @click="handleDelete(item.id, item.name)"><Trash2 class="h-3 w-3" />Delete</Button>
              </div>
            </div>
          </template>
          <template #skeleton>
            <div class="flex items-center gap-3 animate-pulse">
              <div class="h-9 w-9 rounded-xl bg-border/80 shrink-0" />
              <div class="flex-1 space-y-2 py-0.5">
                <div class="h-3 bg-border/80 rounded-full w-1/4" />
                <div class="h-2.5 bg-border/60 rounded-full w-2/5" />
              </div>
              <div class="h-2.5 bg-border/60 rounded-full w-20 shrink-0" />
            </div>
          </template>
        </UiList>

        <!-- ── Kanban View ── -->
        <UiKanban
          v-else-if="currentView === 'kanban'"
          ref="kanbanRef"
          class="flex-1 min-h-0"
          kanban-id="workspaces-kanban"
          :stages="kanbanStages"
          :fetch-fn="fetchWorkspacesForKanban"
          :config="kanbanConfig"
          :features="kanbanFeatures"
          :external-search="searchQuery"
          item-key="id"
          @item-moved="onWorkspaceStageChanged"
        >
          <!-- Workspace-specific card body -->
          <template #card="{ item, stageMeta }">
            <div class="space-y-2.5">
              <div class="flex items-start gap-2.5">
                <div class="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span class="text-primary text-xs font-bold">{{ item.name?.charAt(0).toUpperCase() ?? '?' }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-sm font-semibold text-foreground truncate leading-tight">{{ item.name }}</span>
                    <span v-if="item.is_archived" class="text-[10px] font-medium text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded-full shrink-0">Archived</span>
                    <span v-if="isPinned(item.id)" class="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">★</span>
                  </div>
                  <p v-if="item.user?.name" class="text-[11px] text-muted-foreground mt-0.5 truncate">{{ item.user.name }}</p>
                </div>
              </div>
              <p v-if="item.description" class="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{{ item.description }}</p>
              <div class="flex items-center justify-between pt-1.5 border-t border-border/50">
                <span class="text-[10px] text-muted-foreground font-mono">{{ item.created_at ? formatDate(item.created_at) : '—' }}</span>
                <div class="flex items-center gap-1">
                  <span class="h-1.5 w-1.5 rounded-full" :class="stageMeta.dot" />
                  <span class="text-[10px] text-muted-foreground">{{ stageMeta.label }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Card hover actions -->
          <template #card-actions="{ item }">
            <Button type="button" variant="ghost" size="icon"
              class="h-6 w-6 rounded-md bg-card/80 border border-border/60 hover:border-primary/40"
              @click.stop="togglePin(item.id)">
              <Star class="h-3 w-3" :class="isPinned(item.id) ? 'text-primary fill-primary' : 'text-muted-foreground'" />
            </Button>
            <Button type="button" variant="ghost" size="icon"
              class="h-6 w-6 rounded-md bg-card/80 border border-border/60 hover:border-primary/40 text-primary"
              @click.stop="handleView(item.id)">
              <Eye class="h-3 w-3" />
            </Button>
            <Button type="button" variant="ghost" size="icon"
              class="h-6 w-6 rounded-md bg-card/80 border border-border/60 hover:border-destructive/40 text-destructive"
              @click.stop="handleDelete(item.id, item.name)">
              <Trash2 class="h-3 w-3" />
            </Button>
          </template>

          <!-- Workspace-shaped skeleton -->
          <template #skeleton>
            <div class="space-y-2.5 animate-pulse">
              <div class="flex items-start gap-2.5">
                <div class="h-8 w-8 rounded-lg bg-border/80 shrink-0" />
                <div class="flex-1 space-y-1.5 pt-0.5">
                  <div class="h-3 bg-border/80 rounded-full w-3/4" />
                  <div class="h-2 bg-border/60 rounded-full w-1/2" />
                </div>
              </div>
              <div class="h-2 bg-border/50 rounded-full w-full" />
              <div class="h-2 bg-border/40 rounded-full w-4/5" />
              <div class="flex items-center justify-between pt-1.5 border-t border-border/40">
                <div class="h-2 bg-border/50 rounded-full w-16" />
                <div class="h-2 bg-border/40 rounded-full w-12" />
              </div>
            </div>
          </template>
        </UiKanban>

      </div>
    </div>

    <!-- Delete Dialog -->
    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{ workspaceToDelete?.name }}</strong>?
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="deleteModalOpen = false">Cancel</Button>
          <Button variant="destructive" :disabled="deleteLoading" class="gap-2" @click="confirmDelete">
            <Spinner v-if="deleteLoading" class="h-4 w-4" />
            <span>{{ deleteLoading ? 'Deleting...' : 'Delete' }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import type { UiHeaderStat } from '@/components/common/UiHeader.vue'
  import UiHeader from '@/components/common/UiHeader.vue'
  import Button from '@/components/ui/button/Button.vue'
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
  import Spinner from '@/components/ui/spinner/Spinner.vue'
  import { notify } from '@/helpers/toast'
  import type { Workspace } from '@/stores/workspace'
  import { useWorkspaceStore } from '@/stores/workspace'
  import { useUniversalInteractions } from '@/ui-table/composables/useUniversalInteractions'
  import type { ApiResponse, TableColumn, ViewMode } from '@/ui-table/types/table.types'
  import type { ListApiResponse, ListConfig, ListFeatures } from '@/ui-table/types/list.types'
  import type { KanbanApiResponse, KanbanConfig, KanbanFeatures, KanbanFetchParams, Stage } from '@/ui-table/types/kanban.types'
  import UiKanban from '@/ui-table/UiKanban.vue'
  import UiList from '@/ui-table/UiList.vue'
  import UiTable from '@/ui-table/UiTable.vue'
  import { Archive, ArchiveIcon, Eye, MoreVertical, Pencil, Star, Trash2, Trash2Icon } from 'lucide-vue-next'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const workspaceStore = useWorkspaceStore()

  // ── View state ──────────────────────────────────────────────────────────────
  const currentView = ref<ViewMode>('table')
  const isLoading = ref(false)
  const tableRef = ref()
  const listRef = ref()
  const kanbanRef = ref()
  const openRowId = ref<number | null>(null)

  // ── Delete dialog ────────────────────────────────────────────────────────────
  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const workspaceToDelete = ref<{ id: number; name: string } | null>(null)

  // ── Pin state ────────────────────────────────────────────────────────────────
  const pinnedWorkspaceIds = ref<number[]>([])

  // ── Filter panel ─────────────────────────────────────────────────────────────
  const showFilterPanel = ref(false)

  // ── Universal search / filter ─────────────────────────────────────────────────
  const { searchQuery, activeFilterCount, handleSearch, filterItems } =
    useUniversalInteractions({ debounceMs: 400 })

  // ── Header stats ──────────────────────────────────────────────────────────────
  const headerStats = computed<UiHeaderStat[]>(() =>
    workspaceStore.statuses.map((s) => ({
      label: s.label,
      dot: s.dot,
      value: workspaceStore.workspaces.filter((w: any) => {
        if (s.value === 'active') return w.is_active && !w.is_archived
        if (s.value === 'archived') return w.is_archived
        return w.status === s.value
      }).length,
    })),
  )

  // ── Table columns ─────────────────────────────────────────────────────────────
  const tableColumns: TableColumn<Workspace>[] = [
    { key: 'name', label: 'Workspace', sortable: true, width: '35%' },
    { key: 'user', label: 'Owner', sortable: false, width: '25%' },
    { key: 'created_at', label: 'Created', sortable: true, width: '20%' },
    { key: 'actions', label: 'Actions', sortable: false, align: 'center', width: '20%' },
  ]

  // ── Table features ────────────────────────────────────────────────────────────
  const tableFeatures = {
    selection: { enabled: true },
    bulkActions: [
      { label: 'Archive Selected', icon: ArchiveIcon, disabled: (rows: any[]) => rows.length === 0, onClick: async (rows: any[]) => { tableRef.value?.refresh(); tableRef.value?.clearSelection?.() } },
      { label: 'Delete Selected', icon: Trash2Icon, disabled: (rows: any[]) => rows.length === 0, onClick: async (rows: any[]) => { tableRef.value?.refresh(); tableRef.value?.clearSelection?.() } },
    ],
  }

  // ── List config & features ────────────────────────────────────────────────────
  const listConfig: ListConfig = { pageSize: 25, debounceMs: 400, defaultSortBy: 'created_at', defaultSortOrder: 'desc' }
  const listFeatures: ListFeatures = {
    groupBy: [{ key: 'is_archived', label: 'Archive Status' }, { key: 'user.name', label: 'Owner' }],
    sortOptions: [{ key: 'name', label: 'Name (A → Z)' }, { key: 'created_at', label: 'Created Date' }],
  }

  // ── Kanban stages — driven by backend statuses ────────────────────────────────
  const WORKSPACE_WIP_LIMITS: Record<string, number | undefined> = {
    active: undefined,
    archived: undefined,
    // Example: pending: 5
  }

  const kanbanStages = computed<Stage[]>(() =>
    workspaceStore.statuses.map((s) => ({
      value: s.value,
      label: s.label,
      dot: s.dot,
      wipLimit: WORKSPACE_WIP_LIMITS[s.value],
    })),
  )

  const kanbanConfig: KanbanConfig = { pageSize: 10, debounceMs: 400, defaultSortBy: 'created_at', defaultSortOrder: 'desc', columnWidth: '280px' }
  const kanbanFeatures: KanbanFeatures = { dragDrop: true, intraStageReorder: true }

  // ── Fetch functions ───────────────────────────────────────────────────────────

  async function fetchWorkspacesForTable(params: { page: number; perPage: number; search: string; sortBy: string | null; sortOrder: 'asc' | 'desc' | null }): Promise<ApiResponse<Workspace>> {
    const res = await workspaceStore.fetchWorkspaces({ page: params.page, perPage: params.perPage, search: params.search, sortBy: params.sortBy ?? undefined, sortOrder: params.sortOrder ?? undefined })
    return { data: res.data, meta: res.meta }
  }

  async function fetchWorkspacesForList(params: { page: number; perPage: number; search: string; sortBy: string | null; sortOrder: 'asc' | 'desc' | null }): Promise<ListApiResponse<Workspace>> {
    const res = await workspaceStore.fetchWorkspaces({ page: params.page, perPage: params.perPage, search: params.search, sortBy: params.sortBy ?? undefined, sortOrder: params.sortOrder ?? undefined })
    return { data: res.data, meta: res.meta }
  }

  /**
   * Kanban fetch: stage value maps to API filter.
   * params.stage tells the backend which column to load.
   */
  async function fetchWorkspacesForKanban(params: KanbanFetchParams): Promise<KanbanApiResponse<Workspace>> {
    const stageFilter: Record<string, any> =
      params.stage === 'archived'
        ? { is_archived: true }
        : params.stage === 'active'
          ? { is_archived: false, status: 'active' }
          : { status: params.stage }

    const res = await workspaceStore.fetchWorkspaces({
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      sortBy: params.sortBy ?? undefined,
      sortOrder: params.sortOrder ?? undefined,
      ...stageFilter,
      ...(params.filters ?? {}),
    })
    return { data: res.data, meta: res.meta }
  }

  // ── View handling ─────────────────────────────────────────────────────────────

  function handleViewChange(view: ViewMode): void {
    currentView.value = view
    // All three views are self-fetching via their composables — no manual fetch needed
  }

  function onRefresh(): void {
    if (currentView.value === 'table') tableRef.value?.refresh?.()
    else if (currentView.value === 'list') listRef.value?.refresh?.()
    else if (currentView.value === 'kanban') kanbanRef.value?.refresh?.()
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────────

  function handleCreate(): void { router.push({ name: 'workspace-add' }) }
  function handleView(id: number): void { router.push({ name: 'workspace-detail', params: { id } }) }
  function handleEdit(id: number): void { router.push({ name: 'workspace-edit', params: { id } }) }
  function handleDelete(id: number, name: string): void { workspaceToDelete.value = { id, name }; deleteModalOpen.value = true }

  async function confirmDelete(): Promise<void> {
    if (!workspaceToDelete.value) return
    deleteLoading.value = true
    try {
      await workspaceStore.deleteWorkspace(workspaceToDelete.value.id)
      deleteModalOpen.value = false
      workspaceToDelete.value = null
      notify.success('Workspace deleted', 'The workspace was removed successfully.')
      onRefresh()
    } catch {
      notify.error('Delete failed', "We couldn't delete the workspace.")
    } finally {
      deleteLoading.value = false
    }
  }

  function togglePin(id: number): void {
    const i = pinnedWorkspaceIds.value.indexOf(id)
    if (i > -1) pinnedWorkspaceIds.value.splice(i, 1)
    else pinnedWorkspaceIds.value.push(id)
  }
  function isPinned(id: number): boolean { return pinnedWorkspaceIds.value.includes(id) }
  function toggleArchive(id: number, currentState: boolean): void {
    const w = workspaceStore.workspaces.find((item) => item.id === id)
    if (w) (w as any).is_archived = !currentState
    if (currentView.value === 'table') tableRef.value?.refresh?.()
  }

  /**
   * Called by UiKanban after optimistic UI update when a card is dragged between stages.
   * Wire up your store action here to persist the change, then reconcile if it fails.
   */
  async function onWorkspaceStageChanged(item: Workspace, fromStage: string, toStage: string): Promise<void> {
    try {
      // await workspaceStore.updateWorkspaceStatus(item.id, toStage)
      console.log(`Workspace ${item.id} moved: ${fromStage} → ${toStage}`)
      notify.success('Stage updated', `"${item.name}" moved to ${toStage}.`)
    } catch {
      // Reconcile on failure — reload affected columns
      kanbanRef.value?.refreshStage(fromStage)
      kanbanRef.value?.refreshStage(toStage)
      notify.error('Failed to move', 'Could not update the workspace stage.')
    }
  }

  // ── Formatting ────────────────────────────────────────────────────────────────

  function formatDate(dateString: string): string {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  onMounted(async () => {
    // Only statuses needed upfront — all views self-fetch their data
    await workspaceStore.fetchStatuses()
  })
</script>