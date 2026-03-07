<template>
  <div class="h-full flex flex-col bg-background overflow-hidden">
    <div class="flex flex-col flex-1 min-h-0 w-full mx-auto p-8">
      <UiHeader
        title="Workspaces"
        :stats="headerStats"
        :show-views="true"
        :show-refresh="true"
        :current-view="currentView"
        create-label="Add Workspace"
        show-search
        :search-value="searchQuery"
        search-placeholder="Search workspaces..."
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
                <span
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Status</span
                >
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
                v-for="status in workspaceStore.statuses"
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
                  :class="
                    STAGE_STYLE[status.value]?.dot ?? 'bg-muted-foreground'
                  "
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
          table-id="workspaces-table"
          :columns="tableColumns"
          :fetch-fn="workspaceStore.fetchWorkspaces"
          :external-search="searchQuery"
          :external-filter="commonFilter"
          :features="tableFeatures"
          :config="tableConfig"
          @row-click="handleView($event.id)"
        >
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
              >
                <span class="text-primary text-sm font-bold">{{
                  row.name?.charAt(0).toUpperCase() ?? "?"
                }}</span>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-foreground truncate">
                  {{ row.name }}
                </p>
                <p
                  v-if="row.description"
                  class="text-xs text-muted-foreground truncate"
                >
                  {{ row.description }}
                </p>
              </div>
            </div>
          </template>

          <template #cell-user="{ row }">
            <span class="text-sm">{{ row.user?.name ?? "—" }}</span>
          </template>

          <!-- Actions column: "…" → popover menu -->
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
                <PopoverContent
                  align="end"
                  :side-offset="6"
                  class="w-40 p-1.5 rounded-xl border border-border bg-popover shadow-xl"
                >
                  <button
                    type="button"
                    class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-foreground"
                    @click="handleView(row.id)"
                  >
                    <Eye class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    View
                  </button>
                  <button
                    type="button"
                    class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-foreground"
                    @click="handleEdit(row.id)"
                  >
                    <Pencil
                      class="h-3.5 w-3.5 text-muted-foreground shrink-0"
                    />
                    Edit
                  </button>
                  <div class="h-px bg-border my-1" />
                  <button
                    type="button"
                    class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                    @click="confirmDeletePrompt(row.id, row.name)"
                  >
                    <Trash2 class="h-3.5 w-3.5 shrink-0" />
                    Delete
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </template>
        </UiTable>

        <!-- LIST -->
        <!-- Row click → detail page. Chevron click → expand accordion. -->
        <UiList
          v-else-if="currentView === 'list'"
          ref="listRef"
          class="flex-1 min-h-0"
          list-id="workspaces-list"
          :fetch-fn="workspaceStore.fetchWorkspaces"
          :features="listFeatures"
          :config="listConfig"
          :external-search="searchQuery"
          :external-filter="commonFilter"
          item-key="id"
          @row-click="handleView($event.id)"
        >
          <template #item-summary="{ item }">
            <div class="flex items-center gap-3 w-full min-w-0">
              <div
                class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
              >
                <span class="text-primary text-sm font-bold">{{
                  item.name?.charAt(0).toUpperCase() ?? "?"
                }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span
                    class="text-sm font-semibold text-foreground truncate"
                    >{{ item.name }}</span
                  >
                  <span
                    v-if="item.is_archived"
                    class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full shrink-0"
                    >Archived</span
                  >
                </div>
                <p
                  v-if="item.description"
                  class="text-xs text-muted-foreground truncate mt-0.5"
                >
                  {{ item.description }}
                </p>
              </div>
            </div>
          </template>

          <!-- No Eye button needed — row click handles navigation -->
          <template #item-expanded="{ item }">
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                  >
                    Owner
                  </p>
                  <p class="text-sm font-medium">
                    {{ item.user?.name ?? "—" }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                  >
                    Status
                  </p>
                  <p class="text-sm font-medium capitalize">
                    {{ item.status ?? "—" }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                  >
                    Created
                  </p>
                  <p class="text-sm font-medium">
                    {{ formatDate(item.created_at) }}
                  </p>
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
          :fetch-fn="workspaceStore.fetchWorkspaces"
          :board-fetch-fn="workspaceStore.fetchKanbanBoard"
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
            <WorkspaceKanbanCard
              :item="item"
              :stage-meta="stageMeta"
              @view="handleView"
              @edit="handleEdit"
            />
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
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{
              workspaceToDelete?.name
            }}</strong
            >? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="deleteModalOpen = false"
            >Cancel</Button
          >
          <Button
            variant="destructive"
            :disabled="deleteLoading"
            class="gap-2"
            @click="confirmDelete"
          >
            <Spinner v-if="deleteLoading" class="h-4 w-4" />
            {{ deleteLoading ? "Deleting…" : "Delete" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import {
    ArchiveIcon,
    Check,
    Eye,
    MoreHorizontal,
    Pencil,
    Trash2,
    Trash2Icon,
  } from "lucide-vue-next";
  import { computed, onMounted, ref } from "vue";
  import { useRouter } from "vue-router";

  import UiHeader from "@/components/common/UiHeader.vue";
  import UiKanban from "@/ui-table/UiKanban.vue";
  import UiList from "@/ui-table/UiList.vue";
  import UiTable from "@/ui-table/UiTable.vue";
  import WorkspaceKanbanCard from "./common/WorkspaceKanbanCard.vue";

  import Button from "@/components/ui/button/Button.vue";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
  import Spinner from "@/components/ui/spinner/Spinner.vue";

  import { notify } from "@/helpers/toast";
  import { useWorkspaceStore, type Workspace } from "@/stores/workspace";
  import { useKanbanApi } from "@/ui-table/composables/useKanbanApi";
  import { useUniversalInteractions } from "@/ui-table/composables/useUniversalInteractions";

  import type {
    KanbanConfig,
    KanbanFeatures,
    KanbanMoveEvent,
    KanbanReorderEvent,
    KanbanStageDefinition,
  } from "@/ui-table/types/kanban.types";
  import type { ListConfig, ListFeatures } from "@/ui-table/types/list.types";
  import type {
    TableColumn,
    TableConfig,
    TableFeatures,
  } from "@/ui-table/types/table.types";
  import type { ViewMode } from "@/ui-table/types/universal.types";

  // ── Core ──────────────────────────────────────────────────────────────────────
  const router = useRouter();
  const workspaceStore = useWorkspaceStore();
  const kanbanApi = useKanbanApi<Workspace>("/workspaces");

  // ── View ──────────────────────────────────────────────────────────────────────
  const currentView = ref<ViewMode>("table");
  const tableRef = ref();
  const listRef = ref();
  const kanbanRef = ref();

  function onViewChange(view: ViewMode) {
    currentView.value = view;
  }

  function onRefresh() {
    if (currentView.value === "table") tableRef.value?.refresh?.();
    else if (currentView.value === "list") listRef.value?.refresh?.();
    else if (currentView.value === "kanban") kanbanRef.value?.refresh?.();
    workspaceStore.fetchStatusCounts();
  }

  // ── Universal interactions ─────────────────────────────────────────────────────
  const {
    searchQuery,
    activeFilterCount,
    handleSearch,
    applyFilters,
    commonFilter,
  } = useUniversalInteractions({ debounceMs: 400 });

  // ── Header stats ───────────────────────────────────────────────────────────────
  // All three views use store.statusCounts (single API fetch).
  // Kanban additionally uses live column counts when the kanban panel is active
  // so dragging a card gives instant feedback before the API responds.
  const headerStats = computed(() =>
    workspaceStore.statuses.map((s) => ({
      label: s.label,
      dot: s.dot,
      value:
        currentView.value === "kanban"
          ? (kanbanRef.value?.columnCounts?.[s.value] ??
            workspaceStore.statusCounts[s.value] ??
            0)
          : (workspaceStore.statusCounts[s.value] ?? 0),
    })),
  );

  // ── Table config ───────────────────────────────────────────────────────────────
  const tableConfig: TableConfig = {
    defaultPerPage: 10,
    defaultSortBy: "created_at",
    defaultSortOrder: "desc",
    debounceMs: 400,
    persistState: true,
  };

  const tableColumns: TableColumn<Workspace>[] = [
    { key: "name", label: "Workspace", sortable: true, width: "40%" },
    { key: "user", label: "Owner", sortable: false, width: "25%" },
    { key: "created_at", label: "Created", sortable: true, width: "20%" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "center",
      width: "15%",
    },
  ];

  const tableFeatures: TableFeatures<Workspace> = {
    selection: { enabled: true },
    bulkActions: [
      {
        label: "Archive Selected",
        icon: ArchiveIcon,
        disabled: (r) => r.length === 0,
        onClick: () => tableRef.value?.refresh(),
      },
      {
        label: "Delete Selected",
        icon: Trash2Icon,
        disabled: (r) => r.length === 0,
        onClick: () => tableRef.value?.refresh(),
      },
    ],
  };

  // ── List config ────────────────────────────────────────────────────────────────
  const listConfig: ListConfig = {
    pageSize: 25,
    debounceMs: 400,
    defaultSortBy: "created_at",
    defaultSortOrder: "desc",
  };

  const listFeatures: ListFeatures = {
    groupBy: [
      { key: "status", label: "Status" },
      { key: "user.name", label: "Owner" },
    ],
    sortOptions: [
      { key: "name", label: "Name (A → Z)" },
      { key: "created_at", label: "Created" },
    ],
  };

  // ── Kanban stages ─────────────────────────────────────────────────────────────
  const STAGE_STYLE: Record<
    string,
    Pick<
      KanbanStageDefinition,
      "colorClass" | "textClass" | "borderClass" | "dot"
    >
  > = {
    active: {
      dot: "bg-emerald-500",
      colorClass: "bg-emerald-500/10",
      textClass: "text-emerald-600",
      borderClass: "border-emerald-500/30",
    },
    archived: {
      dot: "bg-orange-500",
      colorClass: "bg-orange-500/10",
      textClass: "text-orange-600",
      borderClass: "border-orange-500/30",
    },
    pending: {
      dot: "bg-violet-500",
      colorClass: "bg-violet-500/10",
      textClass: "text-violet-600",
      borderClass: "border-violet-500/30",
    },
    on_hold: {
      dot: "bg-amber-500",
      colorClass: "bg-amber-500/10",
      textClass: "text-amber-600",
      borderClass: "border-amber-500/30",
    },
    completed: {
      dot: "bg-blue-500",
      colorClass: "bg-blue-500/10",
      textClass: "text-blue-600",
      borderClass: "border-blue-500/30",
    },
  };

  const kanbanStages = computed<KanbanStageDefinition[]>(() =>
    workspaceStore.statuses.map((s) => ({
      value: s.value,
      label: s.label,
      ...(STAGE_STYLE[s.value] ?? {}),
    })),
  );

  const kanbanConfig: KanbanConfig = { perPage: 50 };
  const kanbanFeatures: KanbanFeatures = {
    dragDrop: true,
    intraStageReorder: true,
  };

  function isStatusSelected(
    draft: Record<string, any>,
    value: string,
  ): boolean {
    return Array.isArray(draft.status) && draft.status.includes(value);
  }

  function toggleStatus(
    draft: Record<string, any>,
    on: (key: string, value: any) => void,
    value: string,
  ) {
    const current: string[] = Array.isArray(draft.status)
      ? [...draft.status]
      : [];
    const idx = current.indexOf(value);
    idx === -1 ? current.push(value) : current.splice(idx, 1);
    on("status", current.length ? current : null);
  }

  // ── Kanban events ──────────────────────────────────────────────────────────────
  async function onKanbanMove(event: KanbanMoveEvent<Workspace>) {
    try {
      await kanbanApi.move({
        model_id: event.item.id,
        column_id: event.toStage,
      });
      notify.success("Status updated", "The card was moved.");
      // Refresh counts so table/list header stats also reflect the move
      workspaceStore.fetchStatusCounts();
    } catch {
      notify.error("Could not move card", "Please try again.");
      kanbanRef.value?.refreshColumn(event.fromStage);
      kanbanRef.value?.refreshColumn(event.toStage);
    }
  }

  async function onKanbanReorder(event: KanbanReorderEvent) {
    try {
      await kanbanApi.reorder({
        stage_value: event.stage,
        ordered_ids: event.orderedIds,
      });
      notify.info("Order updated", "Changes have been saved.");
    } catch {
      notify.error("Could not save order", "Please try again.");
      kanbanRef.value?.refreshColumn(event.stage);
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────────
  const handleCreate = () => router.push({ name: "workspace-add" });
  const handleView = (id: number) =>
    router.push({ name: "workspace-detail", params: { id } });
  const handleEdit = (id: number) =>
    router.push({ name: "workspace-edit", params: { id } });

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const workspaceToDelete = ref<{ id: number; name: string } | null>(null);

  function confirmDeletePrompt(id: number, name: string) {
    workspaceToDelete.value = { id, name };
    deleteModalOpen.value = true;
  }

  async function confirmDelete() {
    if (!workspaceToDelete.value) return;
    deleteLoading.value = true;
    try {
      await workspaceStore.deleteWorkspace(workspaceToDelete.value.id);
      deleteModalOpen.value = false;
      workspaceToDelete.value = null;
      notify.success("Workspace deleted", "The workspace has been removed.");
      onRefresh();
    } catch {
      notify.error("Could not delete workspace", "Please try again.");
    } finally {
      deleteLoading.value = false;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────────
  function formatDate(d: string): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────────
  onMounted(async () => {
    await workspaceStore.fetchStatuses();
    // Single API call — populates header stats for all three views
    workspaceStore.fetchStatusCounts();
  });
</script>
