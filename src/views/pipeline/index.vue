<template>
  <div class="h-full flex flex-col bg-background overflow-hidden">
    <div class="flex flex-col flex-1 min-h-0 w-full mx-auto p-8">
      <UiHeader
        title="Pipelines"
        :stats="headerStats"
        :show-views="true"
        :show-refresh="true"
        :current-view="currentView"
        create-label="Add Pipeline"
        show-search
        :search-value="searchQuery"
        search-placeholder="Search pipelines..."
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
                <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </span>
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

      <div class="flex-1 min-h-0 flex flex-col">
        <!-- TABLE -->
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
              <div class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <span class="text-primary text-sm font-bold">
                  {{ row.name?.charAt(0).toUpperCase() ?? "?" }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-foreground truncate">{{ row.name }}</p>
                <p v-if="row.description" class="text-xs text-muted-foreground truncate">
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
              <span class="h-1.5 w-1.5 rounded-full" :class="extractStatusDot(row.status)" />
              {{ extractStatusLabel(row.status) }}
            </span>
          </template>

          <template #cell-stages_count="{ row }">
            <span class="text-sm tabular-nums">
              {{ row.stages_count ?? 0 }}
            </span>
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
              <div class="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <span class="text-primary text-sm font-bold">
                  {{ item.name?.charAt(0).toUpperCase() ?? "?" }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-sm font-semibold text-foreground truncate">{{ item.name }}</span>
                <p v-if="item.description" class="text-xs text-muted-foreground truncate mt-0.5">
                  {{ item.description }}
                </p>
              </div>
              <!-- Status badge inline for list -->
              <span
                class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0"
                :class="extractStatusBadge(item.status)"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="extractStatusDot(item.status)" />
                {{ extractStatusLabel(item.status) }}
              </span>
            </div>
          </template>

          <template #item-expanded="{ item }">
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Creator
                  </p>
                  <p class="text-sm font-medium">{{ item.creator?.name ?? "—" }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Stages
                  </p>
                  <p class="text-sm font-medium">{{ item.stages_count ?? 0 }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Created
                  </p>
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
      </div>
    </div>

    <!-- Delete dialog -->
    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Pipeline</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{ pipelineToDelete?.name }}</strong>?
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="deleteModalOpen = false">Cancel</Button>
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
import { useRoute, useRouter } from "vue-router";

import UiHeader from "@/components/common/UiHeader.vue";
import UiList   from "@/ui-table/UiList.vue";
import UiTable  from "@/ui-table/UiTable.vue";

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

import type { ListConfig, ListFeatures }     from "@/ui-table/types/list.types";
import type { TableColumn, TableConfig, TableFeatures } from "@/ui-table/types/table.types";
import type { UniversalFetchParams, ViewMode } from "@/ui-table/types/universal.types";
import type { Pipeline } from "@/stores/pipeline";

// ── Core ──────────────────────────────────────────────────────────────────────
const route         = useRoute();
const router        = useRouter();
const pipelineStore = usePipelineStore();

// projectId from nested route: /projects/:projectId/pipelines
const projectId = computed(() => Number(route.params.projectId));

// ── View ──────────────────────────────────────────────────────────────────────
// No kanban for pipelines — only table and list
const currentView = ref<ViewMode>("table");
const tableRef    = ref();
const listRef     = ref();

function onViewChange(view: ViewMode) {
  // Guard: pipelines don't support kanban — silently ignore if somehow triggered
  if (view === "kanban") return;
  currentView.value = view;
}

function onRefresh() {
  if (currentView.value === "table") tableRef.value?.refresh?.();
  else if (currentView.value === "list") listRef.value?.refresh?.();
  pipelineStore.fetchStatusCounts(projectId.value);
}

// ── Universal interactions ────────────────────────────────────────────────────
const {
  searchQuery,
  activeFilterCount,
  handleSearch,
  applyFilters,
  commonFilter,
} = useUniversalInteractions({ debounceMs: 400 });

// ── Fetch fn — inject projectId ───────────────────────────────────────────────
function tableFetchFn(params: UniversalFetchParams) {
  return pipelineStore.fetchPipelines({
    ...params,
    projectId: projectId.value,
  });
}

// ── Header stats ──────────────────────────────────────────────────────────────
const headerStats = computed(() =>
  pipelineStore.statuses.map((s) => ({
    label: s.label,
    color: s.color ?? undefined,
    dot:   s.dot   ?? undefined,
    value: pipelineStore.statusCounts[String(s.value)] ?? 0,
  })),
);

// ── Status helpers ────────────────────────────────────────────────────────────
// Status may arrive as a plain number or a full object — normalise both.

function extractStatusValue(status: Pipeline["status"]): number | null {
  if (status == null)          return null;
  if (typeof status === "number") return status;
  return (status as any).value ?? null;
}

function extractStatusLabel(status: Pipeline["status"]): string {
  if (status == null) return "—";
  if (typeof status === "object" && status !== null && "label" in status)
    return (status as any).label;
  const val   = extractStatusValue(status);
  const found = pipelineStore.statuses.find((s) => s.value === val);
  return found?.label ?? String(val);
}

function extractStatusDot(status: Pipeline["status"]): string {
  if (typeof status === "object" && status !== null && "dot" in status)
    return (status as any).dot;
  const val   = extractStatusValue(status);
  const found = pipelineStore.statuses.find((s) => s.value === val);
  return found?.dot ?? "bg-muted-foreground";
}

function extractStatusBadge(status: Pipeline["status"]): string {
  if (typeof status === "object" && status !== null && "badge" in status)
    return (status as any).badge;
  const val   = extractStatusValue(status);
  const found = pipelineStore.statuses.find((s) => s.value === val);
  return found?.badge ?? "";
}

// ── Filter helpers ────────────────────────────────────────────────────────────

function isStatusSelected(draft: Record<string, any>, value: number): boolean {
  return Array.isArray(draft.status) && draft.status.includes(value);
}

function toggleStatus(
  draft: Record<string, any>,
  on: (key: string, value: any) => void,
  value: number,
) {
  const current: number[] = Array.isArray(draft.status) ? [...draft.status] : [];
  const idx = current.indexOf(value);
  idx === -1 ? current.push(value) : current.splice(idx, 1);
  on("status", current.length ? current : null);
}

// ── Table config ──────────────────────────────────────────────────────────────
const tableConfig: TableConfig = {
  defaultPerPage:   10,
  defaultSortBy:    "created_at",
  defaultSortOrder: "desc",
  debounceMs:       400,
  persistState:     true,
};

const tableColumns: TableColumn<Pipeline>[] = [
  { key: "name",         label: "Pipeline", sortable: true,  width: "35%" },
  { key: "status",       label: "Status",   sortable: false, width: "15%" },
  { key: "stages_count", label: "Stages",   sortable: false, width: "10%" },
  { key: "creator",      label: "Creator",  sortable: false, width: "20%" },
  { key: "created_at",   label: "Created",  sortable: true,  width: "10%" },
  { key: "actions",      label: "Actions",  sortable: false, align: "center", width: "10%" },
];

const tableFeatures: TableFeatures<Pipeline> = {
  selection: { enabled: true },
  bulkActions: [
    {
      label:    "Archive Selected",
      icon:     ArchiveIcon,
      disabled: (r) => r.length === 0,
      onClick:  () => tableRef.value?.refresh(),
    },
    {
      label:    "Delete Selected",
      icon:     Trash2Icon,
      disabled: (r) => r.length === 0,
      onClick:  () => tableRef.value?.refresh(),
    },
  ],
};

// ── List config ───────────────────────────────────────────────────────────────
const listConfig: ListConfig = {
  pageSize:         25,
  debounceMs:       400,
  defaultSortBy:    "created_at",
  defaultSortOrder: "desc",
};

const listFeatures: ListFeatures = {
  sortOptions: [
    { key: "name",       label: "Name (A → Z)" },
    { key: "created_at", label: "Created" },
  ],
};

// ── CRUD ──────────────────────────────────────────────────────────────────────
const handleCreate = () =>
  router.push({ name: "pipeline-add", params: { projectId: projectId.value } });

const handleView = (id: number) =>
  router.push({ name: "pipeline-detail", params: { id } });

const handleEdit = (id: number) =>
  router.push({ name: "pipeline-edit", params: { id } });

const deleteModalOpen    = ref(false);
const deleteLoading      = ref(false);
const pipelineToDelete   = ref<{ id: number; name: string } | null>(null);

function confirmDeletePrompt(id: number, name: string) {
  pipelineToDelete.value = { id, name };
  deleteModalOpen.value  = true;
}

async function confirmDelete() {
  if (!pipelineToDelete.value) return;
  deleteLoading.value = true;
  try {
    await pipelineStore.deletePipeline(pipelineToDelete.value.id, projectId.value);
    deleteModalOpen.value  = false;
    pipelineToDelete.value = null;
    notify.success("Pipeline deleted", "The pipeline was removed successfully.", {
      position: "bottom-right",
    });
    onRefresh();
  } catch {
    notify.error("Delete failed", "We couldn't delete the pipeline.", {
      position: "bottom-right",
    });
  } finally {
    deleteLoading.value = false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await pipelineStore.fetchStatuses();
  pipelineStore.fetchStatusCounts(projectId.value);
});
</script>