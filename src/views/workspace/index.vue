<template>
  <div class="h-full flex flex-col bg-background overflow-hidden">
    <div
      class="flex flex-col flex-1 min-h-0 max-w-350 w-full mx-auto px-8 py-6"
    >
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
          class="min-h-0 max-h-full"
          ref="tableRef"
          v-if="currentView === 'table'"
          table-id="workspaces-table"
          :columns="columns"
          :fetch-fn="fetchWorkspaces"
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
          :show-refresh="false"
          @row-click="handleView($event.id)"
        >
          <!-- Name cell -->
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center relative"
              >
                <span class="text-primary text-sm font-bold">
                  {{ row.name?.charAt(0).toUpperCase() ?? "?" }}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-card border border-border hover:bg-primary hover:border-primary group"
                  @click.stop="togglePin(row.id)"
                >
                  <Star
                    class="h-2.5 w-2.5"
                    :class="
                      isPinned(row.id)
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground group-hover:text-white'
                    "
                  />
                </Button>
              </div>
              <div class="min-w-0">
                <div
                  class="font-semibold text-foreground truncate flex items-center gap-2"
                >
                  {{ row.name }}
                  <span
                    v-if="row.is_archived"
                    class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full"
                  >
                    Archived
                  </span>
                </div>
                <div
                  v-if="row.description"
                  class="text-xs text-muted-foreground truncate"
                >
                  {{ row.description }}
                </div>
              </div>
            </div>
          </template>

          <!-- Owner cell -->
          <template #cell-user="{ row }">
            <span class="text-sm text-foreground">
              {{ row.user?.name ?? "—" }}
            </span>
          </template>

          <!-- Actions cell — single "…" dropdown -->
          <template #cell-actions="{ row }">
            <div class="flex items-center justify-center">
              <DropdownMenu
                :open="openRowId === row.id"
                @update:open="(val: any) => (openRowId = val ? row.id : null)"
              >
                <DropdownMenuTrigger as-child>
                  <button
                    type="button"
                    class="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150 border-0 bg-transparent cursor-pointer"
                    :class="
                      openRowId === row.id ? 'bg-primary/10 text-primary' : ''
                    "
                    @click.stop="
                      openRowId = openRowId === row.id ? null : row.id
                    "
                  >
                    <MoreVertical class="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  :align="'end'"
                  :side-offset="6"
                  class="w-48 p-1.5 rounded-xl border border-border bg-popover shadow-lg"
                >
                  <!-- Header label -->
                  <div class="px-2.5 py-1.5 mb-1">
                    <p
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Actions
                    </p>
                  </div>

                  <!-- View -->
                  <DropdownMenuItem
                    class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors"
                    @click="
                      () => {
                        openRowId = null;
                        handleView(row.id);
                      }
                    "
                  >
                    <div
                      class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0"
                    >
                      <Eye class="h-3.5 w-3.5 text-primary" />
                    </div>
                    View details
                  </DropdownMenuItem>

                  <!-- Edit -->
                  <DropdownMenuItem
                    class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors"
                    @click="
                      () => {
                        openRowId = null;
                        handleEdit(row.id);
                      }
                    "
                  >
                    <div
                      class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0"
                    >
                      <Pencil class="h-3.5 w-3.5 text-primary" />
                    </div>
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuSeparator class="my-1.5 bg-border" />

                  <!-- Archive / Unarchive -->
                  <DropdownMenuItem
                    class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-orange-600 hover:bg-orange-500/10 focus:bg-orange-500/10 focus:text-orange-600 transition-colors"
                    @click="
                      () => {
                        openRowId = null;
                        toggleArchive(row.id, row.is_archived);
                      }
                    "
                  >
                    <div
                      class="h-6 w-6 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0"
                    >
                      <Archive class="h-3.5 w-3.5 text-orange-500" />
                    </div>
                    {{ row.is_archived ? "Unarchive" : "Archive" }}
                  </DropdownMenuItem>

                  <!-- Delete -->
                  <DropdownMenuItem
                    class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors"
                    @click="
                      () => {
                        openRowId = null;
                        handleDelete(row.id, row.name);
                      }
                    "
                  >
                    <div
                      class="h-6 w-6 rounded-md bg-destructive/10 flex items-center justify-center shrink-0"
                    >
                      <Trash2 class="h-3.5 w-3.5 text-destructive" />
                    </div>
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
          class="flex-1 min-h-0"
          :items="filteredWorkspaces"
          :loading="isLoading"
        >
          <template #item="{ item }">
            <div
              class="flex items-center justify-between p-4 hover:bg-accent transition-colors"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div
                  class="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-primary text-sm font-bold">
                    {{ item.name?.charAt(0).toUpperCase() ?? "?" }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <div
                    class="font-medium text-foreground truncate flex items-center gap-2"
                  >
                    {{ item.name }}
                    <span
                      v-if="item.is_archived"
                      class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full"
                    >
                      Archived
                    </span>
                  </div>
                  <div
                    v-if="item.description"
                    class="text-xs text-muted-foreground truncate"
                  >
                    {{ item.description }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0 ml-4">
                <span class="text-xs text-muted-foreground">
                  {{ item.created_at ? formatDate(item.created_at) : "—" }}
                </span>
                <div class="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    @click.stop="togglePin(item.id)"
                  >
                    <Star
                      class="h-3.5 w-3.5"
                      :class="
                        isPinned(item.id)
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground'
                      "
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-primary"
                    @click="handleView(item.id)"
                  >
                    <ChevronRight class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </template>
        </UiList>

        <!-- ── Kanban View ── -->
        <UiKanban
          v-else-if="currentView === 'kanban'"
          class="flex-1 min-h-0"
          :columns="kanbanColumns"
          :loading="isLoading"
        >
          <template #item="{ items }">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="bg-background rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group"
              @click="handleView(item.id)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div
                    class="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center"
                  >
                    <span class="text-primary text-xs font-bold">
                      {{ item.name?.charAt(0).toUpperCase() ?? "?" }}
                    </span>
                  </div>
                  <div class="font-medium text-sm text-foreground">
                    {{ item.name }}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="opacity-0 group-hover:opacity-100 h-7 w-7"
                  @click.stop="togglePin(item.id)"
                >
                  <Star
                    class="h-3.5 w-3.5"
                    :class="
                      isPinned(item.id)
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground'
                    "
                  />
                </Button>
              </div>
              <div
                v-if="item.description"
                class="text-xs text-muted-foreground line-clamp-2 mb-3"
              >
                {{ item.description }}
              </div>
              <div
                class="flex items-center justify-between pt-3 border-t border-border"
              >
                <span class="text-xs text-muted-foreground">
                  {{ item.created_at ? formatDate(item.created_at) : "—" }}
                </span>
                <div class="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7"
                    @click.stop="handleEdit(item.id)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7 text-orange-600"
                    @click.stop="toggleArchive(item.id, item.is_archived)"
                  >
                    <Archive class="h-3.5 w-3.5" />
                  </Button>
                </div>
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
            <strong class="text-destructive">{{
              workspaceToDelete?.name
            }}</strong
            >? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="deleteModalOpen = false"
            >Cancel</Button
          >
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="deleteLoading"
            class="gap-2"
          >
            <Spinner v-if="deleteLoading" class="h-4 w-4" />
            <span>{{ deleteLoading ? "Deleting..." : "Delete" }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import type { UiHeaderStat } from "@/components/common/UiHeader.vue";
import UiHeader from "@/components/common/UiHeader.vue";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { notify } from "@/helpers/toast";
import type { Workspace } from "@/stores/workspace";
import { useWorkspaceStore } from "@/stores/workspace";
import { useUniversalInteractions } from "@/ui-table/composables/useUniversalInteractions";
import type {
  ApiResponse,
  TableColumn,
  ViewMode,
} from "@/ui-table/types/table.types";
import UiKanban from "@/ui-table/UiKanban.vue";
import UiList from "@/ui-table/UiList.vue";
import UiTable from "@/ui-table/UiTable.vue";
import {
  Archive,
  ArchiveIcon,
  ChevronRight,
  Eye,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
  Trash2Icon,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

  const router = useRouter();
  const workspaceStore = useWorkspaceStore();

  // ── View state ──────────────────────────────────────────────────────────────
  const currentView = ref<ViewMode>("table");
  const isLoading = ref(false);
  const tableRef = ref();
  const openRowId = ref<number | null>(null);

  // ── Delete dialog ────────────────────────────────────────────────────────────
  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const workspaceToDelete = ref<{ id: number; name: string } | null>(null);

  // ── Pin state ────────────────────────────────────────────────────────────────
  const pinnedWorkspaceIds = ref<number[]>([]);

  // ── Filter panel visibility ──────────────────────────────────────────────────
  const showFilterPanel = ref(false);

  // ── Universal interactions (search/filter — shared across all views) ─────────
  const { searchQuery, activeFilterCount, handleSearch, filterItems } =
    useUniversalInteractions({ debounceMs: 400 });

  // ── Table features ───────────────────────────────────────────────────────────
  const tableFeatures = {
    selection: { enabled: true },
    bulkActions: [
      {
        label: "Archive Selected",
        icon: ArchiveIcon,
        disabled: (rows: any[]) => rows.length === 0,
        onClick: async (rows: any[]) => {
          const ids = rows.map((r) => r.id);
          console.log("Bulk archive:", ids);
          // await workspaceStore.bulkArchive(ids)
          tableRef.value?.refresh();
          tableRef.value?.clearSelection?.();
        },
      },
      {
        label: "Delete Selected",
        icon: Trash2Icon,
        disabled: (rows: any[]) => rows.length === 0,
        onClick: async (rows: any[]) => {
          const ids = rows.map((r) => r.id);
          console.log("Bulk delete:", ids);
          // await workspaceStore.bulkDelete(ids)
          tableRef.value?.refresh();
          tableRef.value?.clearSelection?.();
        },
      },
    ],
  };

  // ── Stats — driven entirely by backend statuses ───────────────────────────────
  const headerStats = computed<UiHeaderStat[]>(() =>
    workspaceStore.statuses.map((s) => ({
      label: s.label,
      dot: s.dot,
      value: workspaceStore.workspaces.filter((w) => {
        if (s.value === "active") return w.is_active && !w.is_archived;
        if (s.value === "archived") return w.is_archived;
        if (s.value === "pending") return w.pending;
        if (s.value === "on_hold") return w.on_hold;
        if (s.value === "completed") return w.completed;
        return w.status === s.value;
      }).length,
    })),
  );

  // ── Filtered workspaces for list/kanban (client-side search) ─────────────────
  const filteredWorkspaces = computed(() =>
    filterItems(workspaceStore.workspaces, ["name", "description"]),
  );

  // ── Kanban columns ────────────────────────────────────────────────────────────
  const kanbanColumns = computed(() => {
    const all = filteredWorkspaces.value;
    const active = all.filter((w) => !w.is_archived);
    const archived = all.filter((w) => w.is_archived);
    const recent = active.slice(0, Math.ceil(active.length / 2));
    return [
      { id: "recent", title: "Recent", items: recent },
      { id: "active", title: "Active", items: active.slice(recent.length) },
      { id: "archived", title: "Archived", items: archived },
    ];
  });

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns: TableColumn<Workspace>[] = [
    { key: "name", label: "Workspace", sortable: true, width: "35%" },
    { key: "user", label: "Owner", sortable: false, width: "25%" },
    { key: "created_at", label: "Created", sortable: true, width: "20%" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "center",
      width: "20%",
    },
  ];

  // ── Data loading ──────────────────────────────────────────────────────────────
  watch(currentView, (v) => {
    if (
      (v === "list" || v === "kanban") &&
      workspaceStore.workspaces.length === 0
    ) {
      fetchData();
    }
  });

  function onRefresh() {
    if (currentView.value === "table") {
      tableRef.value?.refresh?.();
    } else {
      fetchData();
    }
  }

  async function fetchData() {
    isLoading.value = true;
    try {
      await workspaceStore.fetchWorkspaces({ page: 1, perPage: 100 });
    } finally {
      isLoading.value = false;
    }
  }

  function handleViewChange(view: ViewMode) {
    currentView.value = view;
    if (view !== "table") fetchData();
  }

  // ── fetchWorkspaces passed to UiTable ─────────────────────────────────────────
  async function fetchWorkspaces(params: {
    page: number;
    perPage: number;
    search: string;
    sortBy: string | null;
    sortOrder: "asc" | "desc" | null;
  }): Promise<ApiResponse<Workspace>> {
    const response = await workspaceStore.fetchWorkspaces({
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      sortBy: params.sortBy ?? undefined,
      sortOrder: params.sortOrder ?? undefined,
    });
    return { data: response.data, meta: response.meta };
  }

  // ── CRUD handlers ─────────────────────────────────────────────────────────────
  function handleCreate() {
    router.push({ name: "workspace-add" });
  }

  function handleView(id: number) {
    router.push({ name: "workspace-detail", params: { id } });
  }

  function handleEdit(id: number) {
    router.push({ name: "workspace-edit", params: { id } });
  }

  function handleDelete(id: number, name: string) {
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
      notify.success(
        "Workspace deleted",
        "The workspace was removed successfully.",
      );
      if (currentView.value === "table") tableRef.value?.refresh?.();
    } catch {
      notify.error("Delete failed", "We couldn't delete the workspace.");
    } finally {
      deleteLoading.value = false;
    }
  }

  // ── Pin / Archive helpers ─────────────────────────────────────────────────────
  function togglePin(id: number) {
    const i = pinnedWorkspaceIds.value.indexOf(id);
    if (i > -1) pinnedWorkspaceIds.value.splice(i, 1);
    else pinnedWorkspaceIds.value.push(id);
  }

  function isPinned(id: number) {
    return pinnedWorkspaceIds.value.includes(id);
  }

  function toggleArchive(id: number, currentState: boolean) {
    // Optimistic update for list/kanban view
    const w = workspaceStore.workspaces.find((item) => item.id === id);
    if (w) (w as any).is_archived = !currentState;
    // Refresh table when in table view
    if (currentView.value === "table") tableRef.value?.refresh?.();
  }

  // ── Formatting ────────────────────────────────────────────────────────────────
  function formatDate(dateString: string) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  onMounted(async () => {
    // Run both in parallel — statuses for the chips, workspaces for the counts
    await Promise.all([
      workspaceStore.fetchStatuses(),
      workspaceStore.fetchWorkspaces({ page: 1, perPage: 10 }),
    ]);
  });
</script>
