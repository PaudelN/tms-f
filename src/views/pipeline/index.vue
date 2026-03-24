<template>
  <div class="h-full flex flex-col bg-background overflow-hidden">
    <div
      class="flex flex-col min-h-0 w-full mx-auto"
      :class="currentView === 'kanban' ? 'h-full' : 'flex-1 p-8'"
    >
      <div :class="currentView === 'kanban' ? 'px-8 pt-8 shrink-0' : ''">
        <UiHeader
          title="Boards"
          :stats="headerStats"
          :show-views="true"
          :show-refresh="true"
          :current-view="currentView"
          create-label="Add Board"
          show-search
          :search-value="searchQuery"
          search-placeholder="Search boards..."
          show-filter
          show-add-task
          :pipeline-id="kanbanActivePipelineId ?? undefined"
          :active-filter-count="activeFilterCount"
          :filter-values="commonFilter"
          :filter-creator-options="[]"
          :filter-tag-options="[]"
          @create="handleCreate"
          @update:current-view="onViewChange"
          @update:search-value="handleSearch"
          @refresh="onRefresh"
          @apply-filters="applyFilters"
          @task-created="onRefresh"
        >
          <template #filter-extra="{ draft, on }">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between min-h-5">
                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Status
                  </span>
                  <span
                    v-if="
                      Array.isArray(draft.status) && draft.status.length > 0
                    "
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
                  v-for="status in pipelineStore.statuses"
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
                    :class="status.dot"
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
      </div>

      <!-- ── Views ──────────────────────────────────────────────────────────── -->
      <div
        class="flex flex-col"
        :class="currentView === 'kanban' ? 'flex-1 min-h-0' : 'flex-1 min-h-0'"
      >
        <!-- TABLE (unchanged) -->
        <UiTable
          v-if="currentView === 'table'"
          ref="tableRef"
          class="min-h-0 max-h-full"
          table-id="pipelines-table"
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
              <div
                class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
              >
                <span class="text-primary text-sm font-bold">
                  {{ row.name?.charAt(0).toUpperCase() ?? "?" }}
                </span>
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
          <template #cell-status="{ row }">
            <span
              class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border"
              :class="extractStatusBadge(row.status)"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="extractStatusDot(row.status)"
              />
              {{ extractStatusLabel(row.status) }}
            </span>
          </template>
          <template #cell-stages_count="{ row }">
            <span class="text-sm tabular-nums">{{
              row.stages_count ?? 0
            }}</span>
          </template>
          <template #cell-creator="{ row }">
            <span class="text-sm">{{ row.creator?.name ?? "—" }}</span>
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
                    <Trash2 class="h-3.5 w-3.5 shrink-0" /> Delete
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </template>
        </UiTable>

        <!-- LIST (unchanged) -->
        <UiList
          v-else-if="currentView === 'list'"
          ref="listRef"
          class="flex-1 min-h-0"
          list-id="pipelines-list"
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
                <span class="text-primary text-sm font-bold">
                  {{ item.name?.charAt(0).toUpperCase() ?? "?" }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-sm font-semibold text-foreground truncate">{{
                  item.name
                }}</span>
                <p
                  v-if="item.description"
                  class="text-xs text-muted-foreground truncate mt-0.5"
                >
                  {{ item.description }}
                </p>
              </div>
              <span
                class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0"
                :class="extractStatusBadge(item.status)"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="extractStatusDot(item.status)"
                />
                {{ extractStatusLabel(item.status) }}
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
                    Creator
                  </p>
                  <p class="text-sm font-medium">
                    {{ item.creator?.name ?? "—" }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                  >
                    Stages
                  </p>
                  <p class="text-sm font-medium">
                    {{ item.stages_count ?? 0 }}
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

        <!-- ── KANBAN ─────────────────────────────────────────────────────── -->
        <!--
          Columns = pipeline stages from GET /pipelines/{id}/stages
          Cards   = fake tasks for now, keyed by stage id (ready for real tasks later)
          Reorder = POST /pipelines/{id}/stages/reorder  ← already exists
          Move    = optimistic local only for now
        -->
        <template v-else-if="currentView === 'kanban'">
          <!-- Board area -->
          <div class="flex-1 min-h-0 relative">
            <!-- Stages loading -->
            <div
              v-if="kanbanStagesLoading"
              class="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
            </div>

            <!-- No stages yet -->
            <div
              v-else-if="!kanbanStagesLoading && kanbanStages.length === 0"
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
            >
              <div
                class="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center"
              >
                <Columns3 class="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p class="text-sm font-semibold">No stages yet</p>
              <p class="text-xs text-muted-foreground max-w-xs">
                This board has no stages. Add stages to see the kanban board.
              </p>
              <button
                type="button"
                class="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                @click="
                  kanbanActivePipelineId && handleView(kanbanActivePipelineId)
                "
              >
                <Plus class="h-3.5 w-3.5" /> Manage Stages
              </button>
            </div>

            <!-- The board -->
            <UiKanban
              v-else
              ref="kanbanRef"
              class="h-full"
              :stages="kanbanStages"
              :fetch-fn="kanbanFetchFn"
              :config="kanbanConfig"
              :features="kanbanFeatures"
              :search-query="searchQuery"
              :external-filter="commonFilter"
              item-key="id"
              @move="onKanbanMove"
              @reorder="onKanbanReorder"
            >
              <template #card="{ item, stageMeta }">
                <TaskKanbanCard
                  :item="item"
                  :stage-meta="stageMeta"
                  @view="
                    router.push({ name: 'task-detail', params: { id: $event } })
                  "
                  @edit="
                    router.push({ name: 'task-edit', params: { id: $event } })
                  "
                />
              </template>

              <template #card-actions="{ item }">
                <button
                  type="button"
                  class="h-6 w-6 rounded-md flex items-center justify-center bg-card/80 border border-border/60 hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  @click.stop="
                    router.push({ name: 'task-edit', params: { id: item.id } })
                  "
                >
                  <Pencil class="h-3 w-3" />
                </button>
                <button
                  type="button"
                  class="h-6 w-6 rounded-md flex items-center justify-center bg-card/80 border border-border/60 hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  @click.stop="
                    router.push({
                      name: 'task-detail',
                      params: { id: item.id },
                    })
                  "
                >
                  <Eye class="h-3 w-3" />
                </button>
              </template>
            </UiKanban>
          </div>
        </template>
      </div>
    </div>

    <!-- Delete dialog (unchanged) -->
    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Board</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{
              pipelineToDelete?.name
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
    Columns3,
    Eye,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    Trash2Icon,
  } from "lucide-vue-next";
  import { computed, onMounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import UiHeader from "@/components/common/UiHeader.vue";
  import UiKanban from "@/ui-table/UiKanban.vue";
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
  import { usePipelineStore } from "@/stores/pipeline";
  import { useUniversalInteractions } from "@/ui-table/composables/useUniversalInteractions";

  import type { Pipeline, PipelineStagePreview } from "@/stores/pipeline";
  import { Task, useTaskStore } from "@/stores/task";
  import { useKanbanApi } from "@/ui-table/composables/useKanbanApi";
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
  import type {
    UniversalFetchParams,
    ViewMode,
  } from "@/ui-table/types/universal.types";
  import TaskKanbanCard from "../task/common/TaskKanbanCard.vue";

  // ── Core ──────────────────────────────────────────────────────────────────────
  const route = useRoute();
  const router = useRouter();
  const pipelineStore = usePipelineStore();
  const taskStore = useTaskStore();

  interface KanbanPipelineTab {
    id: number;
    name: string;
    _color: string;
  }

  const kanbanPipelineList = ref<KanbanPipelineTab[]>([]);
  const kanbanActivePipelineId = ref<number | null>(null);

  const projectId = computed(() => Number(route.params.projectId));

  // ── View ──────────────────────────────────────────────────────────────────────
  const currentView = ref<ViewMode>("kanban");
  const tableRef = ref();
  const listRef = ref();
  const kanbanRef = ref();

  function onViewChange(view: ViewMode) {
    currentView.value = view;
    if (
      view === "kanban" &&
      kanbanStages.value.length === 0 &&
      !kanbanStagesLoading.value
    ) {
      initKanban();
    }
  }

  function onRefresh() {
    if (currentView.value === "table") tableRef.value?.refresh?.();
    else if (currentView.value === "list") listRef.value?.refresh?.();
    else if (currentView.value === "kanban") {
      kanbanRef.value?.refresh?.();
      reloadKanbanStages();
    }
    pipelineStore.fetchStatusCounts(projectId.value);
  }

  // ── Universal interactions (unchanged) ───────────────────────────────────────
  const {
    searchQuery,
    activeFilterCount,
    handleSearch,
    applyFilters,
    commonFilter,
  } = useUniversalInteractions({ debounceMs: 400 });

  // ── Table fetch fn (unchanged) ────────────────────────────────────────────────
  function tableFetchFn(params: UniversalFetchParams) {
    return pipelineStore.fetchPipelines({
      ...params,
      projectId: projectId.value,
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // KANBAN
  // ═════════════════════════════════════════════════════════════════════════════

  // ── Pipeline list for the tab bar ─────────────────────────────────────────────
  // We fetch a lightweight list of pipelines so the user can switch which
  // pipeline's board they are viewing. Only visible when there are 2+.

  const PIPELINE_COLORS = [
    "#7c6ff7",
    "#f6a623",
    "#34c789",
    "#4a9eff",
    "#ff6b9d",
    "#a855f7",
    "#00c4cc",
    "#8bc34a",
  ];

  interface KanbanPipelineTab {
    id: number;
    name: string;
    _color: string;
  }

  const kanbanApi = useKanbanApi<Task>(
    () => `pipelines/${kanbanActivePipelineId.value}/tasks`,
  );

  async function loadKanbanPipelineList(): Promise<void> {
    try {
      const res = await pipelineStore.fetchPipelines({
        page: 1,
        perPage: 100,
        search: "",
        sortBy: "name",
        sortOrder: "asc",
        projectId: projectId.value,
        filters: [],
      });
      kanbanPipelineList.value = (res.data as Pipeline[]).map((p, i) => ({
        id: p.id,
        name: p.name,
        _color: PIPELINE_COLORS[i % PIPELINE_COLORS.length],
      }));
      if (
        kanbanPipelineList.value.length > 0 &&
        !kanbanActivePipelineId.value
      ) {
        kanbanActivePipelineId.value = kanbanPipelineList.value[0].id;
      }
    } catch {
      notify.error("Failed to load pipelines", "", {
        position: "bottom-right",
      });
    }
  }

  // ── Stage column definitions ──────────────────────────────────────────────────
  // Columns come from GET /pipelines/{id}/stages, sorted by display_order.
  // stage.id (as string) is the column key used by UiKanban internally.

  const rawStages = ref<PipelineStagePreview[]>([]);
  const kanbanStagesLoading = ref(false);

  const kanbanStages = computed<KanbanStageDefinition[]>(() =>
    rawStages.value.map((s, i) => ({
      value: String(s.id),
      label: s.display_label ?? s.name,
      color: s.color ?? PIPELINE_COLORS[i % PIPELINE_COLORS.length],
      wipLimit: s.wip_limit ?? undefined,
    })),
  );

  async function reloadKanbanStages(): Promise<void> {
    const pid = kanbanActivePipelineId.value;
    if (!pid) return;
    kanbanStagesLoading.value = true;
    try {
      rawStages.value = await pipelineStore.fetchStagesForKanban(pid);
    } finally {
      kanbanStagesLoading.value = false;
    }
  }

  async function initKanban(): Promise<void> {
    await loadKanbanPipelineList();
    await reloadKanbanStages();
  }

  // ── Fake tasks ────────────────────────────────────────────────────────────────
  // Each stage bucket holds pre-generated placeholder cards so the board
  // feels alive. Replace kanbanFetchFn + both event handlers when real
  // tasks exist — nothing else in this file needs to change.

  interface FakeTask {
    id: string;
    title: string;
    description: string;
    _priority: string;
    _priorityClass: string;
    _assignee: string;
    _avatarInitial: string;
    _avatarColor: string;
    _due: string;
  }

  const FAKE_TITLES = [
    "Update onboarding flow",
    "Fix login redirect bug",
    "Write API docs",
    "Design new dashboard",
    "Code review PR #42",
    "Add unit tests",
    "Migrate to v3 schema",
    "Audit permissions",
    "Deploy to staging",
    "Sync with design team",
    "Refactor auth module",
    "QA regression run",
  ];
  const FAKE_DESCS = [
    "Needs UX sign-off before dev.",
    "Reported by 3 customers.",
    "",
    "High priority — due end of sprint.",
    "",
    "Cover edge cases for null inputs.",
  ];
  const FAKE_ASSIGNEES = [
    { name: "Alex Kim", initial: "A", color: "#7c6ff7" },
    { name: "Sara Patel", initial: "S", color: "#34c789" },
    { name: "James Wu", initial: "J", color: "#f6a623" },
    { name: "Mia Lopez", initial: "M", color: "#ff6b9d" },
  ];
  const FAKE_PRIORITIES = [
    { label: "High", cls: "bg-red-500/15 text-red-600" },
    { label: "Medium", cls: "bg-amber-400/15 text-amber-600" },
    { label: "Low", cls: "bg-emerald-500/15 text-emerald-600" },
  ];
  const FAKE_DUES = ["Today", "Tomorrow", "Fri", "Next Mon", "—"];

  // stageId (string) → FakeTask[]
  const fakeTasks = ref<Record<string, FakeTask[]>>({});
  let _seed = 0;

  function makeFakeTask(stageId: string): FakeTask {
    const i = _seed++;
    const pri = FAKE_PRIORITIES[i % FAKE_PRIORITIES.length];
    const ass = FAKE_ASSIGNEES[i % FAKE_ASSIGNEES.length];
    return {
      id: `fake-${stageId}-${i}`,
      title: FAKE_TITLES[i % FAKE_TITLES.length],
      description: FAKE_DESCS[i % FAKE_DESCS.length],
      _priority: pri.label,
      _priorityClass: pri.cls,
      _assignee: ass.name,
      _avatarInitial: ass.initial,
      _avatarColor: ass.color,
      _due: FAKE_DUES[i % FAKE_DUES.length],
    };
  }

  // ── Kanban fetch fn ────────────────────────────────────────────────────────────
  // UiKanban calls this once per column passing kanbanStage = stage.id (string).
  // Returns fake tasks filtered by search.
  // ↳ When real tasks exist: replace the Promise.resolve with an axios call.
  function kanbanFetchFn(params: UniversalFetchParams) {
    const pid = kanbanActivePipelineId.value;
    if (!pid) {
      return Promise.resolve({
        data: [],
        meta: { current_page: 1, last_page: 1, total: 0, per_page: 50 },
      });
    }
    return taskStore.fetchTasks({ ...params, pipelineId: pid });
  }

  // ── Kanban config ─────────────────────────────────────────────────────────────
  const kanbanConfig: KanbanConfig = { perPage: 50, debounceMs: 300 };
  const kanbanFeatures: KanbanFeatures = {
    dragDrop: true,
    intraStageReorder: true,
  };

  async function onKanbanMove(event: KanbanMoveEvent<Task>): Promise<void> {
    try {
      await kanbanApi.move({
        model_id: event.item.id,
        column_id: event.toStage, // stage id as string e.g. "42"
      });
    } catch (err: unknown) {
      notify.error(
        "Move failed",
        err instanceof Error ? err.message : "Could not save card position.",
        { position: "bottom-right" },
      );
      kanbanRef.value?.refreshColumn(event.fromStage);
      kanbanRef.value?.refreshColumn(event.toStage);
    }
  }

  // ── @reorder — intra-column reorder ──────────────────────────────────────────
  async function onKanbanReorder(event: KanbanReorderEvent): Promise<void> {
    try {
      await kanbanApi.reorder({
        stage_value: event.stage,
        ordered_ids: event.orderedIds,
      });
    } catch (err: unknown) {
      notify.error(
        "Reorder failed",
        err instanceof Error ? err.message : "Could not save card order.",
        { position: "bottom-right" },
      );
      kanbanRef.value?.refreshColumn(event.stage);
    }
  }

  // ── Header stats (unchanged) ──────────────────────────────────────────────────
  const headerStats = computed(() =>
    pipelineStore.statuses.map((s) => ({
      label: s.label,
      color: s.color ?? undefined,
      dot: s.dot ?? undefined,
      value: pipelineStore.statusCounts[String(s.value)] ?? 0,
    })),
  );

  // ── Status helpers (unchanged) ────────────────────────────────────────────────
  function extractStatusValue(status: Pipeline["status"]): number | null {
    if (status == null) return null;
    if (typeof status === "number") return status;
    return (status as any).value ?? null;
  }
  function extractStatusLabel(status: Pipeline["status"]): string {
    if (status == null) return "—";
    if (typeof status === "object" && "label" in status!)
      return (status as any).label;
    const val = extractStatusValue(status);
    return (
      pipelineStore.statuses.find((s) => s.value === val)?.label ?? String(val)
    );
  }
  function extractStatusDot(status: Pipeline["status"]): string {
    if (typeof status === "object" && status !== null && "dot" in status)
      return (status as any).dot;
    const val = extractStatusValue(status);
    return (
      pipelineStore.statuses.find((s) => s.value === val)?.dot ??
      "bg-muted-foreground"
    );
  }
  function extractStatusBadge(status: Pipeline["status"]): string {
    if (typeof status === "object" && status !== null && "badge" in status)
      return (status as any).badge;
    const val = extractStatusValue(status);
    return pipelineStore.statuses.find((s) => s.value === val)?.badge ?? "";
  }

  // ── Filter helpers (unchanged) ────────────────────────────────────────────────
  function isStatusSelected(
    draft: Record<string, any>,
    value: number,
  ): boolean {
    return Array.isArray(draft.status) && draft.status.includes(value);
  }
  function toggleStatus(
    draft: Record<string, any>,
    on: (k: string, v: any) => void,
    value: number,
  ) {
    const current: number[] = Array.isArray(draft.status)
      ? [...draft.status]
      : [];
    const idx = current.indexOf(value);
    idx === -1 ? current.push(value) : current.splice(idx, 1);
    on("status", current.length ? current : null);
  }

  // ── Table config (unchanged) ──────────────────────────────────────────────────
  const tableConfig: TableConfig = {
    defaultPerPage: 10,
    defaultSortBy: "created_at",
    defaultSortOrder: "desc",
    debounceMs: 400,
    persistState: true,
  };
  const tableColumns: TableColumn<Pipeline>[] = [
    { key: "name", label: "Pipeline", sortable: true, width: "35%" },
    { key: "status", label: "Status", sortable: false, width: "15%" },
    { key: "stages_count", label: "Stages", sortable: false, width: "10%" },
    { key: "creator", label: "Creator", sortable: false, width: "20%" },
    { key: "created_at", label: "Created", sortable: true, width: "10%" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "center",
      width: "10%",
    },
  ];
  const tableFeatures: TableFeatures<Pipeline> = {
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

  // ── List config (unchanged) ───────────────────────────────────────────────────
  const listConfig: ListConfig = {
    pageSize: 25,
    debounceMs: 400,
    defaultSortBy: "created_at",
    defaultSortOrder: "desc",
  };
  const listFeatures: ListFeatures = {
    sortOptions: [
      { key: "name", label: "Name (A → Z)" },
      { key: "created_at", label: "Created" },
    ],
  };

  // ── CRUD (unchanged) ──────────────────────────────────────────────────────────
  const handleCreate = () =>
    router.push({
      name: "pipeline-add",
      params: { projectId: projectId.value },
    });
  const handleView = (id: number) =>
    router.push({ name: "pipeline-detail", params: { id } });
  const handleEdit = (id: number) =>
    router.push({ name: "pipeline-edit", params: { id } });

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const pipelineToDelete = ref<{ id: number; name: string } | null>(null);

  function confirmDeletePrompt(id: number, name: string) {
    pipelineToDelete.value = { id, name };
    deleteModalOpen.value = true;
  }
  async function confirmDelete() {
    if (!pipelineToDelete.value) return;
    deleteLoading.value = true;
    try {
      await pipelineStore.deletePipeline(
        pipelineToDelete.value.id,
        projectId.value,
      );
      deleteModalOpen.value = false;
      pipelineToDelete.value = null;
      notify.success(
        "Pipeline deleted",
        "The pipeline was removed successfully.",
        { position: "bottom-right" },
      );
      onRefresh();
    } catch {
      notify.error("Delete failed", "We couldn't delete the pipeline.", {
        position: "bottom-right",
      });
    } finally {
      deleteLoading.value = false;
    }
  }

  // ── Helpers (unchanged) ───────────────────────────────────────────────────────
  function formatDate(d: string): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  onMounted(async () => {
    await pipelineStore.fetchStatuses();
    pipelineStore.fetchStatusCounts(projectId.value);
    loadKanbanPipelineList();
    if (currentView.value === "kanban") {
      initKanban();
    }
  });
</script>
