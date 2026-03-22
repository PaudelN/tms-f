<template>
  <div class="h-full flex flex-col bg-background overflow-hidden">
    <div class="flex flex-col flex-1 min-h-0 w-full mx-auto p-8">
      <UiHeader
        :title="isMyTasks ? 'My Tasks' : 'Tasks'"
        :stats="headerStats"
        :show-views="true"
        :show-kanban="false"
        :show-refresh="true"
        :current-view="currentView"
        :create-label="isMyTasks ? undefined : 'Add Task'"
        show-search
        :search-value="searchQuery"
        :search-placeholder="
          isMyTasks ? 'Search my tasks...' : 'Search tasks...'
        "
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
            <!-- Priority filter -->
            <div>
              <div class="flex items-center justify-between min-h-5 mb-2">
                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Priority
                  </span>
                  <span
                    v-if="
                      Array.isArray(draft.priority) && draft.priority.length > 0
                    "
                    class="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                    style="box-shadow: 0 0 6px rgb(var(--color-primary) / 0.6)"
                  />
                </div>
                <button
                  v-if="
                    Array.isArray(draft.priority) && draft.priority.length > 0
                  "
                  type="button"
                  class="text-[10px] font-semibold text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                  @click="on('priority', null)"
                >
                  Clear
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in taskStore.priorities"
                  :key="p.value"
                  type="button"
                  class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150"
                  :class="
                    isPrioritySelected(draft, p.value)
                      ? 'border-primary/40 bg-primary/8 text-foreground shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  "
                  @click="togglePriority(draft, on, p.value)"
                >
                  <span class="h-2 w-2 rounded-full shrink-0" :class="p.dot" />
                  {{ p.label }}
                  <span
                    v-if="isPrioritySelected(draft, p.value)"
                    class="h-3.5 w-3.5 flex items-center justify-center rounded-full bg-primary shrink-0"
                  >
                    <Check class="h-2 w-2 text-primary-foreground" />
                  </span>
                </button>
              </div>
            </div>

            <!-- Stage filter — only shown when in pipeline context -->
            <div v-if="!isMyTasks">
              <div class="flex items-center justify-between min-h-5 mb-2">
                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Stage
                  </span>
                  <span
                    v-if="Array.isArray(draft.stage) && draft.stage.length > 0"
                    class="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                    style="box-shadow: 0 0 6px rgb(var(--color-primary) / 0.6)"
                  />
                </div>
                <button
                  v-if="Array.isArray(draft.stage) && draft.stage.length > 0"
                  type="button"
                  class="text-[10px] font-semibold text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                  @click="on('stage', null)"
                >
                  Clear
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in stages"
                  :key="s.id"
                  type="button"
                  class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150"
                  :class="
                    isStageSelected(draft, s.id)
                      ? 'border-primary/40 bg-primary/8 text-foreground shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  "
                  @click="toggleStage(draft, on, s.id)"
                >
                  <span
                    class="h-2 w-2 rounded-full shrink-0"
                    :style="{ background: s.color ?? '#94a3b8' }"
                  />
                  {{ s.display_label ?? s.name }}
                  <span
                    v-if="isStageSelected(draft, s.id)"
                    class="h-3.5 w-3.5 flex items-center justify-center rounded-full bg-primary shrink-0"
                  >
                    <Check class="h-2 w-2 text-primary-foreground" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </UiHeader>

      <div class="flex-1 min-h-0 flex flex-col">
        <!-- ── TABLE ─────────────────────────────────────────────────────── -->
        <UiTable
          v-if="currentView === 'table'"
          ref="tableRef"
          class="min-h-0 max-h-full"
          table-id="tasks-table"
          :columns="tableColumns"
          :fetch-fn="tableFetchFn"
          :external-search="searchQuery"
          :external-filter="commonFilter"
          :features="tableFeatures"
          :config="tableConfig"
          @row-click="handleView($event.id)"
        >
          <!-- Task number + title -->
          <template #cell-title="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
              >
                <span class="text-primary text-[10px] font-bold font-mono">
                  {{ row.task_number?.slice(-4) ?? "?" }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-foreground truncate">
                  {{ row.title }}
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

          <!-- Priority -->
          <template #cell-priority="{ row }">
            <span
              v-if="extractPriorityObj(row.priority)"
              class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border"
              :class="extractPriorityObj(row.priority)!.badge"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="extractPriorityObj(row.priority)!.dot"
              />
              {{ extractPriorityObj(row.priority)!.label }}
            </span>
            <span v-else class="text-sm text-muted-foreground">—</span>
          </template>

          <!-- Pipeline — only visible in my-tasks mode -->
          <template #cell-pipeline="{ row }">
            <span v-if="row.pipeline" class="text-sm text-foreground">
              {{ row.pipeline.name }}
            </span>
            <span v-else class="text-sm text-muted-foreground">—</span>
          </template>

          <!-- Stage -->
          <template #cell-stage="{ row }">
            <div v-if="row.stage" class="flex items-center gap-1.5">
              <span
                class="h-2 w-2 rounded-full shrink-0"
                :style="{ background: row.stage.color ?? '#94a3b8' }"
              />
              <span class="text-sm text-foreground">{{
                row.stage.display_label
              }}</span>
            </div>
            <span v-else class="text-sm text-muted-foreground">—</span>
          </template>

          <!-- Due date -->
          <template #cell-due_date="{ row }">
            <span
              v-if="row.due_date"
              class="text-sm tabular-nums"
              :class="
                row.is_overdue
                  ? 'text-red-500 font-semibold'
                  : row.is_due_today
                    ? 'text-amber-500 font-semibold'
                    : 'text-foreground'
              "
            >
              {{ formatDate(row.due_date) }}
              <span v-if="row.is_overdue" class="text-[10px] font-bold ml-1"
                >Overdue</span
              >
              <span
                v-else-if="row.is_due_today"
                class="text-[10px] font-bold ml-1"
                >Today</span
              >
            </span>
            <span v-else class="text-sm text-muted-foreground">—</span>
          </template>

          <!-- Creator -->
          <template #cell-creator="{ row }">
            <span class="text-sm">{{ row.creator?.name ?? "—" }}</span>
          </template>

          <!-- Actions -->
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
                    @click="confirmDeletePrompt(row.id, row.title)"
                  >
                    <Trash2 class="h-3.5 w-3.5 shrink-0" /> Delete
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </template>
        </UiTable>

        <!-- ── LIST ──────────────────────────────────────────────────────── -->
        <UiList
          v-else-if="currentView === 'list'"
          ref="listRef"
          class="flex-1 min-h-0"
          list-id="tasks-list"
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
              <div
                class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
              >
                <span class="text-primary text-[10px] font-bold font-mono">
                  {{ item.task_number?.slice(-4) ?? "?" }}
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <span
                  class="text-sm font-semibold text-foreground truncate block"
                >
                  {{ item.title }}
                </span>
                <!-- In my-tasks mode show pipeline · stage as subtitle -->
                <p
                  v-if="isMyTasks && item.pipeline?.name"
                  class="text-xs text-muted-foreground truncate mt-0.5"
                >
                  {{ item.pipeline.name }}
                  <span v-if="item.stage?.display_label">
                    · {{ item.stage.display_label }}</span
                  >
                </p>
                <p
                  v-else-if="item.description"
                  class="text-xs text-muted-foreground truncate mt-0.5"
                >
                  {{ item.description }}
                </p>
              </div>

              <span
                v-if="extractPriorityObj(item.priority)"
                class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0"
                :class="extractPriorityObj(item.priority)!.badge"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="extractPriorityObj(item.priority)!.dot"
                />
                {{ extractPriorityObj(item.priority)!.label }}
              </span>
            </div>
          </template>

          <template #item-expanded="{ item }">
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                  >
                    Stage
                  </p>
                  <div v-if="item.stage" class="flex items-center gap-1.5">
                    <span
                      class="h-2 w-2 rounded-full shrink-0"
                      :style="{ background: item.stage.color ?? '#94a3b8' }"
                    />
                    <p class="text-sm font-medium">
                      {{ item.stage.display_label }}
                    </p>
                  </div>
                  <p v-else class="text-sm font-medium">—</p>
                </div>
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                  >
                    Due Date
                  </p>
                  <p
                    class="text-sm font-medium"
                    :class="
                      item.is_overdue
                        ? 'text-red-500'
                        : item.is_due_today
                          ? 'text-amber-500'
                          : ''
                    "
                  >
                    {{ item.due_date ? formatDate(item.due_date) : "—" }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                  >
                    {{ isMyTasks ? "Pipeline" : "Creator" }}
                  </p>
                  <p class="text-sm font-medium">
                    {{
                      isMyTasks
                        ? (item.pipeline?.name ?? "—")
                        : (item.creator?.name ?? "—")
                    }}
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
                  @click.stop="confirmDeletePrompt(item.id, item.title)"
                >
                  <Trash2 class="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </template>
        </UiList>
      </div>
    </div>

    <!-- ── Delete dialog ─────────────────────────────────────────────────── -->
    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{ taskToDelete?.title }}</strong
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
  import axios from "@/lib/axios";
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
  import { useRoute, useRouter } from "vue-router";

  import UiHeader from "@/components/common/UiHeader.vue";
  import UiList from "@/ui-table/UiList.vue";
  import UiTable from "@/ui-table/UiTable.vue";

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
  import { useTaskStore, type Task } from "@/stores/task";
  import { useUniversalInteractions } from "@/ui-table/composables/useUniversalInteractions";

  import type { TaskPriorityObject } from "@/stores/task";
  import type { ListConfig, ListFeatures } from "@/ui-table/types/list.types";
  import type {
    TableColumn,
    TableConfig,
    TableFeatures,
  } from "@/ui-table/types/table.types";
  import type {
    UniversalFetchParams,
    ViewMode,
  } from "@/ui-table/types/universal.types";

  // ── Core ──────────────────────────────────────────────────────────────────────
  const route = useRoute();
  const router = useRouter();
  const taskStore = useTaskStore();

  // Detects whether we are on /tasks/my (my-tasks route) vs a pipeline task list
  const isMyTasks = computed(() => route.name === "my-tasks");
  const isAllTasks = computed(() => route.name === "task-all"); 
  const pipelineId = computed(() => Number(route.params.pipelineId));

  // ── View ──────────────────────────────────────────────────────────────────────
  const currentView = ref<ViewMode>("table");
  const tableRef = ref();
  const listRef = ref();

  function onViewChange(view: ViewMode) {
    if (view === "kanban") return;
    currentView.value = view;
  }

  function onRefresh() {
    if (currentView.value === "table") tableRef.value?.refresh?.();
    else if (currentView.value === "list") listRef.value?.refresh?.();
  }

  // ── Universal interactions ────────────────────────────────────────────────────
  const {
    searchQuery,
    activeFilterCount,
    handleSearch,
    applyFilters,
    commonFilter,
  } = useUniversalInteractions({ debounceMs: 400 });

  // ── Stages (only loaded in pipeline context) ──────────────────────────────────
  const stages = ref<
    { id: number; name: string; display_label: string; color: string | null }[]
  >([]);

  async function loadStages(): Promise<void> {
    if (isMyTasks.value || !pipelineId.value) return;
    try {
      const { data } = await axios.get(
        `/pipelines/${pipelineId.value}/stages`,
        {
          params: {
            per_page: 200,
            sort_by: "display_order",
            sort_order: "asc",
          },
        },
      );
      stages.value = data.data ?? [];
    } catch {
      // non-fatal
    }
  }

  // ── Fetch fn — branches on route name ────────────────────────────────────────
  function tableFetchFn(params: UniversalFetchParams) {
    if (isMyTasks.value) return taskStore.fetchMyTasks(params);
    if (isAllTasks.value) return taskStore.fetchAllTasks(params);
    return taskStore.fetchTasks({ ...params, pipelineId: pipelineId.value });
  }

  // ── Header stats ──────────────────────────────────────────────────────────────
  const headerStats = computed(() =>
    taskStore.priorities.map((p) => ({
      label: p.label,
      color: p.color ?? undefined,
      dot: p.dot ?? undefined,
      value: 0,
    })),
  );

  // ── Table columns — pipeline column shown only in my-tasks ────────────────────
  const tableColumns = computed<TableColumn<Task>[]>(() => {
    const cols: TableColumn<Task>[] = [
      { key: "title", label: "Task", sortable: true, width: "35%" },
      { key: "priority", label: "Priority", sortable: false, width: "12%" },
    ];
    if (isMyTasks.value) {
      cols.push({
        key: "pipeline",
        label: "Pipeline",
        sortable: false,
        width: "18%",
      });
    }
    cols.push(
      { key: "stage", label: "Stage", sortable: false, width: "15%" },
      { key: "due_date", label: "Due", sortable: true, width: "13%" },
      { key: "creator", label: "Creator", sortable: false, width: "15%" },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        align: "center",
        width: "10%",
      },
    );
    return cols;
  });

  // ── Priority helpers ──────────────────────────────────────────────────────────
  function extractPriorityObj(
    priority: Task["priority"],
  ): TaskPriorityObject | null {
    if (!priority) return null;
    if (typeof priority === "object" && "badge" in priority)
      return priority as TaskPriorityObject;
    const found = taskStore.priorities.find((p) => p.value === priority);
    return found ?? null;
  }

  // ── Filter helpers ────────────────────────────────────────────────────────────
  function isPrioritySelected(
    draft: Record<string, any>,
    value: string,
  ): boolean {
    return Array.isArray(draft.priority) && draft.priority.includes(value);
  }

  function togglePriority(
    draft: Record<string, any>,
    on: (k: string, v: any) => void,
    value: string,
  ) {
    const current: string[] = Array.isArray(draft.priority)
      ? [...draft.priority]
      : [];
    const idx = current.indexOf(value);
    idx === -1 ? current.push(value) : current.splice(idx, 1);
    on("priority", current.length ? current : null);
  }

  function isStageSelected(draft: Record<string, any>, id: number): boolean {
    return Array.isArray(draft.stage) && draft.stage.includes(id);
  }

  function toggleStage(
    draft: Record<string, any>,
    on: (k: string, v: any) => void,
    id: number,
  ) {
    const current: number[] = Array.isArray(draft.stage)
      ? [...draft.stage]
      : [];
    const idx = current.indexOf(id);
    idx === -1 ? current.push(id) : current.splice(idx, 1);
    on("stage", current.length ? current : null);
  }

  // ── Table / list config ───────────────────────────────────────────────────────
  const tableConfig: TableConfig = {
    defaultPerPage: 25,
    defaultSortBy: "sort_order",
    defaultSortOrder: "asc",
    debounceMs: 400,
    persistState: true,
  };

  const tableFeatures: TableFeatures<Task> = {
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

  const listConfig: ListConfig = {
    pageSize: 25,
    debounceMs: 400,
    defaultSortBy: "sort_order",
    defaultSortOrder: "asc",
  };

  const listFeatures: ListFeatures = {
    sortOptions: [
      { key: "title", label: "Title (A → Z)" },
      { key: "due_date", label: "Due Date" },
      { key: "sort_order", label: "Default order" },
    ],
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  function handleCreate() {
    if (isMyTasks.value) return; // no pipeline context — button is hidden anyway
    router.push({ name: "task-add", params: { pipelineId: pipelineId.value } });
  }

  function handleView(id: number) {
    router.push({ name: "task-detail", params: { id } });
  }

  function handleEdit(id: number) {
    router.push({ name: "task-edit", params: { id } });
  }

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const taskToDelete = ref<{ id: number; title: string } | null>(null);

  function confirmDeletePrompt(id: number, title: string) {
    taskToDelete.value = { id, title };
    deleteModalOpen.value = true;
  }

  async function confirmDelete() {
    if (!taskToDelete.value) return;
    deleteLoading.value = true;
    try {
      await taskStore.deleteTask(taskToDelete.value.id);
      deleteModalOpen.value = false;
      taskToDelete.value = null;
      notify.success("Task deleted", "The task was removed successfully.", {
        position: "bottom-right",
      });
      onRefresh();
    } catch {
      notify.error("Delete failed", "We couldn't delete the task.", {
        position: "bottom-right",
      });
    } finally {
      deleteLoading.value = false;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  onMounted(async () => {
    await taskStore.fetchPriorities();
    loadStages();
  });
</script>
