<template>
  <div class="h-full flex flex-col bg-background overflow-hidden">
    <div class="flex flex-col flex-1 min-h-0 w-full mx-auto p-8">
      <UiHeader
        title="Projects"
        :stats="headerStats"
        :show-views="true"
        :show-refresh="true"
        :current-view="currentView"
        create-label="Add Project"
        show-search
        :search-value="searchQuery"
        search-placeholder="Search projects..."
        show-filter
        :active-filter-count="activeFilterCount"
        :filter-values="commonFilter"
        :filter-creator-options="[]"
        :filter-tag-options="[]"
        @create="handleCreate"
        @update:current-view="onViewChange"
        @update:search-value="handleSearch"
        @refresh="onRefresh"
        @apply-filters="applyFilters"
      >
        <template #filter-extra="{ draft, on }">
          <div class="space-y-2.5">
            <div class="flex items-center justify-between min-h-5">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                <span
                  v-if="Array.isArray(draft.status) && draft.status.length > 0"
                  class="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                  style="box-shadow: 0 0 6px rgb(var(--color-primary) / 0.6)"
                />
              </div>
              <button
                v-if="Array.isArray(draft.status) && draft.status.length > 0"
                type="button"
                class="text-[10px] font-semibold text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                @click="on('status', null)"
              >
                Clear
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in projectStore.statuses"
                :key="status.value"
                type="button"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150"
                :class="
                  isStatusSelected(draft, status.value)
                    ? 'border-primary/40 bg-primary/8 text-foreground shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                "
                @click="toggleStatus(draft, on, status.value)"
              >
                <span
                  class="h-2 w-2 rounded-full shrink-0"
                  :class="!status.color ? (STAGE_STYLE[status.value]?.dot ?? 'bg-muted-foreground') : undefined"
                  :style="status.color ? { background: status.color } : undefined"
                />
                {{ status.label }}
                <span
                  v-if="isStatusSelected(draft, status.value)"
                  class="h-3.5 w-3.5 flex items-center justify-center rounded-full bg-primary shrink-0"
                >
                  <Check class="h-2 w-2 text-primary-foreground" />
                </span>
              </button>
            </div>
          </div>
        </template>
      </UiHeader>

      <div class="flex-1 min-h-0 flex flex-col">
        <!-- TABLE -->
        <UiTable
          v-if="currentView === 'table'"
          ref="tableRef"
          class="min-h-0 max-h-full"
          table-id="projects-table"
          :columns="tableColumns"
          :fetch-fn="tableFetchFn"
          :external-search="searchQuery"
          :external-filter="commonFilter"
          :features="tableFeatures"
          :config="tableConfig"
          @row-click="handleView($event.id)"
        >
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <span class="text-primary text-sm font-bold">{{ row.name?.charAt(0).toUpperCase() ?? '?' }}</span>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-foreground truncate">{{ row.name }}</p>
                <p v-if="row.description" class="text-xs text-muted-foreground truncate">{{ row.description }}</p>
              </div>
            </div>
          </template>

          <template #cell-creator="{ row }">
            <span class="text-sm">{{ row.creator?.name ?? '—' }}</span>
          </template>

          <template #cell-visibility="{ row }">
            <span class="inline-flex items-center gap-1.5 text-xs font-medium capitalize">
              <Globe v-if="row.visibility === 'public'" class="h-3.5 w-3.5 text-muted-foreground" />
              <Lock v-else-if="row.visibility === 'private'" class="h-3.5 w-3.5 text-muted-foreground" />
              <Users v-else class="h-3.5 w-3.5 text-muted-foreground" />
              {{ row.visibility?.value ?? '—' }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-center" @click.stop>
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <MoreHorizontal class="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" :side-offset="6" class="w-40 p-1.5 rounded-xl border border-border bg-popover shadow-xl">
                  <button
                    type="button"
                    class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-foreground"
                    @click="handleView(row.id)"
                  >
                    <Eye class="h-3.5 w-3.5 text-muted-foreground shrink-0" /> View
                  </button>
                  <button
                    type="button"
                    class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-foreground"
                    @click="handleEdit(row.id)"
                  >
                    <Pencil class="h-3.5 w-3.5 text-muted-foreground shrink-0" /> Edit
                  </button>
                  <div class="h-px bg-border my-1" />
                  <button
                    type="button"
                    class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                    @click="confirmDeletePrompt(row.id, row.name)"
                  >
                    <Trash2 class="h-3.5 w-3.5 shrink-0" /> Delete
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </template>
        </UiTable>

        <!-- LIST -->
        <UiList
          v-else-if="currentView === 'list'"
          ref="listRef"
          class="flex-1 min-h-0"
          list-id="projects-list"
          :fetch-fn="tableFetchFn"
          :features="listFeatures"
          :config="listConfig"
          :external-search="searchQuery"
          :external-filter="commonFilter"
          item-key="id"
          @row-click="handleView($event.id)"
        >
          <template #item-summary="{ item }">
            <div class="flex items-center gap-3 w-full min-w-0">
              <div class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <span class="text-primary text-sm font-bold">{{ item.name?.charAt(0).toUpperCase() ?? '?' }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-foreground truncate">{{ item.name }}</span>
                </div>
                <p v-if="item.description" class="text-xs text-muted-foreground truncate mt-0.5">{{ item.description }}</p>
              </div>
            </div>
          </template>

          <template #item-expanded="{ item }">
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Creator</p>
                  <p class="text-sm font-medium">{{ item.creator?.name ?? '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Status</p>
                  <p class="text-sm font-medium capitalize">{{ item.status ?? '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Created</p>
                  <p class="text-sm font-medium">{{ formatDate(item.created_at) }}</p>
                </div>
              </div>
              <div class="flex gap-2 pt-1">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                  @click.stop="handleEdit(item.id)"
                >
                  <Pencil class="h-3 w-3" /> Edit
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  @click.stop="confirmDeletePrompt(item.id, item.name)"
                >
                  <Trash2 class="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </template>
        </UiList>

        <!-- KANBAN -->
        <UiKanban
          v-else-if="currentView === 'kanban'"
          ref="kanbanRef"
          class="flex-1 min-h-0"
          :fetch-fn="tableFetchFn"
          :board-fetch-fn="kanbanBoardFetchFn"
          :stages="kanbanStages"
          :config="kanbanConfig"
          :features="kanbanFeatures"
          :search-query="searchQuery"
          :external-filter="commonFilter"
          item-key="id"
          @move="onKanbanMove"
          @reorder="onKanbanReorder"
        >
          <template #card="{ item, stageMeta }">
            <ProjectKanbanCard :item="item" :stage-meta="stageMeta" @view="handleView" @edit="handleEdit" />
          </template>
          <template #card-actions="{ item }">
            <button
              type="button"
              class="h-6 w-6 rounded-md flex items-center justify-center bg-card/80 border border-border/60 hover:border-primary/40 hover:bg-primary/10 text-primary transition-colors"
              @click.stop="handleEdit(item.id)"
            >
              <Pencil class="h-3 w-3" />
            </button>
            <button
              type="button"
              class="h-6 w-6 rounded-md flex items-center justify-center bg-card/80 border border-border/60 hover:border-destructive/40 hover:bg-destructive/10 text-destructive transition-colors"
              @click.stop="confirmDeletePrompt(item.id, item.name)"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </template>
        </UiKanban>
      </div>
    </div>

    <!-- Delete dialog -->
    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{ projectToDelete?.name }}</strong>?
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="deleteModalOpen = false">Cancel</Button>
          <Button variant="destructive" :disabled="deleteLoading" class="gap-2" @click="confirmDelete">
            <Spinner v-if="deleteLoading" class="h-4 w-4" />
            {{ deleteLoading ? 'Deleting…' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ArchiveIcon, Check, Eye, Globe, Lock, MoreHorizontal, Pencil, Trash2, Trash2Icon, Users } from 'lucide-vue-next'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import UiHeader from '@/components/common/UiHeader.vue'
  import UiKanban from '@/ui-table/UiKanban.vue'
  import UiList from '@/ui-table/UiList.vue'
  import UiTable from '@/ui-table/UiTable.vue'
  import ProjectKanbanCard from './common/ProjectKanbanCard.vue'

  import Button from '@/components/ui/button/Button.vue'
  import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
  } from '@/components/ui/dialog'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import Spinner from '@/components/ui/spinner/Spinner.vue'

  import { notify } from '@/helpers/toast'
  import { useProjectStore, type Project } from '@/stores/project'
  import { useKanbanApi } from '@/ui-table/composables/useKanbanApi'
  import { useUniversalInteractions } from '@/ui-table/composables/useUniversalInteractions'

  import type {
    KanbanBoardFetchParams,
    KanbanConfig, KanbanFeatures, KanbanMoveEvent,
    KanbanReorderEvent, KanbanStageDefinition,
  } from '@/ui-table/types/kanban.types'
  import type { ListConfig, ListFeatures } from '@/ui-table/types/list.types'
  import type { TableColumn, TableConfig, TableFeatures } from '@/ui-table/types/table.types'
  import type { UniversalFetchParams, ViewMode } from '@/ui-table/types/universal.types'

  // ── Core ──────────────────────────────────────────────────────────────────────
  const route = useRoute()
  const router = useRouter()
  const projectStore = useProjectStore()

  // workspaceId from route param — all nested API calls use this
  const workspaceId = computed(() => Number(route.params.workspaceId))

  const kanbanApi = useKanbanApi<Project>(`/workspaces/${workspaceId.value}/projects`)

  // ── View ──────────────────────────────────────────────────────────────────────
  const currentView = ref<ViewMode>('table')
  const tableRef = ref()
  const listRef = ref()
  const kanbanRef = ref()

  function onViewChange(view: ViewMode) { currentView.value = view }

  function onRefresh() {
    if (currentView.value === 'table') tableRef.value?.refresh?.()
    else if (currentView.value === 'list') listRef.value?.refresh?.()
    else if (currentView.value === 'kanban') kanbanRef.value?.refresh?.()
    projectStore.fetchStatusCounts(workspaceId.value)
  }

  // ── Universal interactions ────────────────────────────────────────────────────
  const { searchQuery, activeFilterCount, handleSearch, applyFilters, commonFilter } =
    useUniversalInteractions({ debounceMs: 400 })

  // ── Fetch fns — inject workspaceId into every call ────────────────────────────

  function tableFetchFn(params: UniversalFetchParams) {
    return projectStore.fetchProjects({ ...params, workspaceId: workspaceId.value })
  }

  function kanbanBoardFetchFn(params: KanbanBoardFetchParams) {
    return projectStore.fetchKanbanBoard({ ...params, workspaceId: workspaceId.value })
  }

  // ── Header stats ──────────────────────────────────────────────────────────────
  const headerStats = computed(() =>
    projectStore.statuses.map((s) => ({
      label: s.label,
      color: s.color ?? undefined,
      dot: s.dot ?? undefined,
      value:
        currentView.value === 'kanban'
          ? (kanbanRef.value?.columnCounts?.[s.value] ?? projectStore.statusCounts[s.value] ?? 0)
          : (projectStore.statusCounts[s.value] ?? 0),
    })),
  )

  // ── Table config ──────────────────────────────────────────────────────────────
  const tableConfig: TableConfig = {
    defaultPerPage: 10,
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
    debounceMs: 400,
    persistState: true,
  }

  const tableColumns: TableColumn<Project>[] = [
    { key: 'name',       label: 'Project',     sortable: true,  width: '35%' },
    { key: 'creator',    label: 'Creator',     sortable: false, width: '20%' },
    { key: 'visibility', label: 'Visibility',  sortable: false, width: '15%' },
    { key: 'created_at', label: 'Created',     sortable: true,  width: '15%' },
    { key: 'actions',    label: 'Actions',     sortable: false, align: 'center', width: '15%' },
  ]

  const tableFeatures: TableFeatures<Project> = {
    selection: { enabled: true },
    bulkActions: [
      {
        label: 'Archive Selected',
        icon: ArchiveIcon,
        disabled: (r) => r.length === 0,
        onClick: () => tableRef.value?.refresh(),
      },
      {
        label: 'Delete Selected',
        icon: Trash2Icon,
        disabled: (r) => r.length === 0,
        onClick: () => tableRef.value?.refresh(),
      },
    ],
  }

  // ── List config ───────────────────────────────────────────────────────────────
  const listConfig: ListConfig = {
    pageSize: 25,
    debounceMs: 400,
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
  }

  const listFeatures: ListFeatures = {
    groupBy: [
      { key: 'status',       label: 'Status' },
      { key: 'creator.name', label: 'Creator' },
    ],
    sortOptions: [
      { key: 'name',       label: 'Name (A → Z)' },
      { key: 'created_at', label: 'Created' },
    ],
  }

  // ── Kanban stages ─────────────────────────────────────────────────────────────
  const STAGE_STYLE: Record<
    string,
    Pick<KanbanStageDefinition, 'colorClass' | 'textClass' | 'borderClass' | 'dot'>
  > = {
    draft:       { dot: 'bg-slate-400',   colorClass: 'bg-slate-500/10',   textClass: 'text-slate-600',   borderClass: 'border-slate-500/30' },
    in_progress: { dot: 'bg-blue-500',    colorClass: 'bg-blue-500/10',    textClass: 'text-blue-600',    borderClass: 'border-blue-500/30' },
    on_hold:     { dot: 'bg-amber-400',   colorClass: 'bg-amber-500/10',   textClass: 'text-amber-600',   borderClass: 'border-amber-500/30' },
    cancelled:   { dot: 'bg-red-400',     colorClass: 'bg-red-500/10',     textClass: 'text-red-600',     borderClass: 'border-red-500/30' },
    completed:   { dot: 'bg-emerald-500', colorClass: 'bg-emerald-500/10', textClass: 'text-emerald-600', borderClass: 'border-emerald-500/30' },
  }

  const kanbanStages = computed<KanbanStageDefinition[]>(() =>
    projectStore.statuses.map((s) => ({
      value: s.value,
      label: s.label,
      color: s.color ?? undefined,
      ...(STAGE_STYLE[s.value] ?? {}),
    })),
  )

  const kanbanConfig: KanbanConfig = { perPage: 50 }
  const kanbanFeatures: KanbanFeatures = { dragDrop: true, intraStageReorder: true }

  function isStatusSelected(draft: Record<string, any>, value: string): boolean {
    return Array.isArray(draft.status) && draft.status.includes(value)
  }

  function toggleStatus(
    draft: Record<string, any>,
    on: (key: string, value: any) => void,
    value: string,
  ) {
    const current: string[] = Array.isArray(draft.status) ? [...draft.status] : []
    const idx = current.indexOf(value)
    idx === -1 ? current.push(value) : current.splice(idx, 1)
    on('status', current.length ? current : null)
  }

  // ── Kanban events ─────────────────────────────────────────────────────────────
  async function onKanbanMove(event: KanbanMoveEvent<Project>) {
    try {
      await kanbanApi.move({ model_id: event.item.id, column_id: event.toStage })
      notify.success('Stage updated', `"${event.item.name}" moved to ${event.toStage}.`)
      projectStore.fetchStatusCounts(workspaceId.value)
    } catch (err: unknown) {
      notify.error('Move failed', err instanceof Error ? err.message : 'Could not move the card.')
      kanbanRef.value?.refreshColumn(event.fromStage)
      kanbanRef.value?.refreshColumn(event.toStage)
    }
  }

  async function onKanbanReorder(event: KanbanReorderEvent) {
    try {
      await kanbanApi.reorder({ stage_value: event.stage, ordered_ids: event.orderedIds })
    } catch (err: unknown) {
      notify.error('Reorder failed', err instanceof Error ? err.message : 'Could not save order.')
      kanbanRef.value?.refreshColumn(event.stage)
    }
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  const handleCreate = () =>
    router.push({ name: 'project-add', params: { workspaceId: workspaceId.value } })

  // Shallow routes for show / edit
  const handleView = (id: number) => router.push({ name: 'project-detail', params: { id } })
  const handleEdit = (id: number) => router.push({ name: 'project-edit', params: { id } })

  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const projectToDelete = ref<{ id: number; name: string } | null>(null)

  function confirmDeletePrompt(id: number, name: string) {
    projectToDelete.value = { id, name }
    deleteModalOpen.value = true
  }

  async function confirmDelete() {
    if (!projectToDelete.value) return
    deleteLoading.value = true
    try {
      await projectStore.deleteProject(projectToDelete.value.id, workspaceId.value)
      deleteModalOpen.value = false
      projectToDelete.value = null
      notify.success('Project deleted', 'The project was removed successfully.', { position: 'bottom-right' })
      onRefresh()
    } catch {
      notify.error('Delete failed', "We couldn't delete the project.", { position: 'bottom-right' })
    } finally {
      deleteLoading.value = false
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function formatDate(d: string): string {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  onMounted(async () => {
    await projectStore.fetchStatuses()
    projectStore.fetchStatusCounts(workspaceId.value)
  })
</script>