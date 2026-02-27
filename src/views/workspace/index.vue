<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-800 mx-auto p-8">
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
        show-sort
        :is-sort-active="isSortActive"
        :show-export="true"
        @create="handleCreate"
        @update:current-view="handleViewChange"
        @update:search-value="handleSearch"
        @refresh="onRefresh"
        @filter="showFilterPanel = true"
        @sort="showSortPanel = true"
        @export="handleExport"
      />

      <div>
        <UiTable
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
        >
          <!-- CUSTOM CELLS -->
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center relative"
              >
                <span class="text-primary text-sm font-bold">{{
                  row.name.charAt(0).toUpperCase()
                }}</span>
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
                    v-if="row.isArchived"
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

          <template #cell-actions="{ row }">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button type="button" variant="ghost" size="icon" class="rounded-full">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-64">
                <DropdownMenuLabel>Workspace actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="openWorkspaceDialog('detail', row)">
                  <div class="mr-2 rounded-md bg-sky-500/15 p-1"><Eye class="h-3.5 w-3.5 text-sky-600" /></div>
                  <div>
                    <div class="text-sm font-medium">View</div>
                    <p class="text-xs text-muted-foreground">Open details in dialog</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem @click="openWorkspaceDialog('edit', row)">
                  <div class="mr-2 rounded-md bg-amber-500/15 p-1"><Pencil class="h-3.5 w-3.5 text-amber-600" /></div>
                  <div>
                    <div class="text-sm font-medium">Edit</div>
                    <p class="text-xs text-muted-foreground">Update workspace settings</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem @click="toggleArchive(row.id)">
                  <div class="mr-2 rounded-md bg-orange-500/15 p-1"><Archive class="h-3.5 w-3.5 text-orange-600" /></div>
                  <div>
                    <div class="text-sm font-medium">{{ row.isArchived ? 'Unarchive' : 'Archive' }}</div>
                    <p class="text-xs text-muted-foreground">Move workspace state</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleDelete(row.id, row.name)">
                  <div class="mr-2 rounded-md bg-destructive/15 p-1"><Trash2 class="h-3.5 w-3.5 text-destructive" /></div>
                  <div>
                    <div class="text-sm font-medium">Delete</div>
                    <p class="text-xs text-muted-foreground">Permanently remove workspace</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </template>
        </UiTable>

        <UiList
          v-else-if="currentView === 'list'"
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
                  <span class="text-primary text-sm font-bold">{{
                    item.name.charAt(0).toUpperCase()
                  }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div
                    class="font-medium text-foreground truncate flex items-center gap-2"
                  >
                    {{ item.name }}
                    <span
                      v-if="item.isArchived"
                      class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full"
                      >Archived</span
                    >
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
                <span class="text-xs text-muted-foreground">{{
                  formatDate(item.created_at)
                }}</span>
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
                  <Button type="button" variant="ghost" size="icon" class="h-8 w-8 text-primary" @click="openWorkspaceDialog('detail', item)">
                    <ChevronRight class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </template>
        </UiList>

        <UiKanban
          v-else-if="currentView === 'kanban'"
          :columns="kanbanColumns"
          :loading="isLoading"
        >
          <template #item="{ items }">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="bg-background rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group"
              @click="openWorkspaceDialog('detail', item)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div
                    class="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center"
                  >
                    <span class="text-primary text-xs font-bold">{{
                      item.name.charAt(0).toUpperCase()
                    }}</span>
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
                <span class="text-xs text-muted-foreground">{{
                  formatDate(item.created_at)
                }}</span>
                <div class="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7"
                    @click.stop="openWorkspaceDialog('edit', item)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7 text-orange-600"
                    @click.stop="toggleArchive(item.id)"
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

    <!-- Delete dialog (unchanged) -->
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

    <!-- Share dialog (unchanged) -->
    <Dialog v-model:open="showShareModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Workspace</DialogTitle>
          <DialogDescription>Share with your team</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-2"
              >Invite Link</label
            >
            <div class="flex items-center gap-2">
              <Input
                type="text"
                :model-value="shareLink"
                readonly
                class="flex-1"
              />
              <Button size="sm" @click="copyShareLink">Copy</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showShareModal = false"
            >Close</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <UiDialog
      v-model:open="workspaceDialog.open"
      :title="workspaceDialog.title"
      :description="workspaceDialog.description"
      :mode="workspaceDialog.mode"
      size="xl"
      :component="workspaceDialog.component"
      :component-props="workspaceDialog.componentProps"
      :sidebar-component="WorkspaceSidebarInfo"
      :sidebar-props="{ workspace: workspaceDialog.workspace }"
      :fullscreen-route="workspaceDialog.fullscreenRoute"
    />
  </div>
</template>

<script setup lang="ts">
  import UiHeader from "@/components/common/UiHeader.vue";
  import UiDialog from "@/components/common/UiDialog.vue";
  import WorkspaceSidebarInfo from "@/components/common/WorkspaceSidebarInfo.vue";
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import WorkspaceAdd from "@/views/workspace/add.vue";
  import WorkspaceDetail from "@/views/workspace/detail.vue";
  import WorkspaceEdit from "@/views/workspace/edit.vue";
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
    Pencil,
    MoreHorizontal,
    Star,
    Trash2,
    Trash2Icon,
  } from "lucide-vue-next";
  import { computed, ref, watch } from "vue";
  const workspaceStore = useWorkspaceStore();

  // ── View state (unchanged) ──────────────────────────────────────────────────
  const currentView = ref<ViewMode>("table");
  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const workspaceToDelete = ref<{ id: number; name: string } | null>(null);
  const showShareModal = ref(false);
  const shareLink = ref("https://workspace.app/invite/abc123xyz");
  const pinnedWorkspaceIds = ref<number[]>([1, 3]);
  const isLoading = ref(false);
  const tableRef = ref();
  const workspaceDialog = ref<any>({
    open: false,
    mode: "detail",
    title: "Workspace",
    description: "",
    component: WorkspaceDetail,
    componentProps: {},
    workspace: null,
    fullscreenRoute: { name: "workspace" },
  });

  // ── Filter/sort panel visibility ────────────────────────────────────────────
  const showFilterPanel = ref(false);
  const showSortPanel = ref(false);

  // ── Universal interactions (search/filter/sort — shared across all views) ───
  const {
    searchQuery,
    sort,
    activeFilterCount,
    handleSearch,
    filterItems,
  } = useUniversalInteractions({
    debounceMs: 400,
    // For table view: search is forwarded via externalSearch prop (watched in UiTable)
    // For list/kanban: filterItems() is used client-side below
  });

  const tableFeatures = {
    selection: {
      enabled: true, // 👈 this shows checkboxes
    },

    bulkActions: [
      {
        label: "Archive Selected",
        icon: ArchiveIcon,

        disabled: (rows: string | any[]) => rows.length === 0,

        onClick: async (rows: any[]) => {
          const ids = rows.map((r: { id: any }) => r.id);
          console.log("NUKESH", ids);

          // await workspaceStore.bulkArchive(ids);

          tableRef.value?.refresh();
          tableRef.value?.clearSelection?.();
        },
      },

      {
        label: "Delete Selected",
        icon: Trash2Icon,

        disabled: (rows: string | any[]) => rows.length === 0,

        onClick: async (rows: any[]) => {
          const ids = rows.map((r: { id: any }) => r.id);
          console.log("NUKESH", ids);

          // await workspaceStore.bulkDelete(ids);

          tableRef.value?.refresh();
          tableRef.value?.clearSelection?.();
        },
      },
    ],
  };

  const isSortActive = computed(
    () => sort.value.column != null && sort.value.order != null,
  );

  // ── Stats (unchanged) ───────────────────────────────────────────────────────
  const activeWorkspacesCount = computed(
    () => workspaceStore.workspaces.filter((w) => !w.isArchived).length || 8,
  );
  const archivedWorkspacesCount = computed(
    () => workspaceStore.workspaces.filter((w) => w.isArchived).length || 2,
  );
  const pinnedWorkspaces = computed(() =>
    workspaceStore.workspaces
      .filter((w) => pinnedWorkspaceIds.value.includes(w.id))
      .slice(0, 5),
  );

  const headerStats = computed(() => [
    { label: "Active", value: activeWorkspacesCount.value, color: "#22c55e" },
    {
      label: "Archived",
      value: archivedWorkspacesCount.value,
      color: "#f97316",
    },
    {
      label: "Pinned",
      value: pinnedWorkspaces.value.length,
      color: "#3b82f6",
    },
  ]);

  // ── Filtered workspaces for list/kanban (client-side via universal search) ──
  const filteredWorkspaces = computed(() =>
    filterItems(workspaceStore.workspaces, ["name", "description"]),
  );

  // ── Kanban columns using filteredWorkspaces so search applies there too ──────
  const kanbanColumns = computed(() => {
    const workspaces = filteredWorkspaces.value;
    const active = workspaces.filter((w) => !w.isArchived);
    const archived = workspaces.filter((w) => w.isArchived);
    const recent = active.slice(0, Math.ceil(active.length / 2));
    return [
      { id: "recent", title: "Recent", items: recent },
      { id: "active", title: "Active", items: active.slice(recent.length) },
      { id: "archived", title: "Archived", items: archived },
    ];
  });

  // ── Table columns (unchanged) ───────────────────────────────────────────────
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

  // ── Data loading (unchanged) ────────────────────────────────────────────────
  watch(currentView, (v) => {
    if (
      (v === "list" || v === "kanban") &&
      workspaceStore.workspaces.length === 0
    )
      workspaceStore.fetchWorkspaces();
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

  // ── fetchWorkspaces passed to UiTable (unchanged signature) ─────────────────
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
      sortBy: params.sortBy || undefined,
      sortOrder: params.sortOrder || undefined,
    });
    return { data: response.data, meta: response.meta };
  }

  // ── Export handler ───────────────────────────────────────────────────────────
  function handleExport(format: "csv" | "json" | "pdf") {
    const data = filteredWorkspaces.value;

    if (!data.length) {
      notify.error("Nothing to export", "There is no data available.");
      return;
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "workspaces.json";
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === "csv") {
      const keys = Object.keys(data[0]);

      const csv =
        keys.join(",") +
        "\n" +
        data
          .map((row) =>
            keys.map((k) => `"${String((row as any)[k] ?? "")}"`).join(","),
          )
          .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "workspaces.csv";
      a.click();

      URL.revokeObjectURL(url);
    }

    if (format === "pdf") {
      notify.info("PDF export", "Hook your PDF generator here.");
    }
  }

  // ── CRUD handlers (unchanged) ───────────────────────────────────────────────
  function handleCreate() {
    openWorkspaceDialog("add");
  }

  function openWorkspaceDialog(mode: "add" | "edit" | "detail", row?: Workspace) {
    const isAdd = mode === "add";
    const id = row?.id;
    workspaceDialog.value = {
      open: true,
      mode,
      title:
        mode === "add"
          ? "Create Workspace"
          : mode === "edit"
            ? `Edit ${row?.name ?? "Workspace"}`
            : row?.name ?? "Workspace details",
      description:
        mode === "add"
          ? "Create without leaving this page"
          : mode === "edit"
            ? "Quick edits with full SPA flow"
            : "Inspect workspace information",
      component: isAdd ? WorkspaceAdd : mode === "edit" ? WorkspaceEdit : WorkspaceDetail,
      componentProps: isAdd
        ? { inDialog: true }
        : { inDialog: true, workspaceId: id },
      workspace: row ?? null,
      fullscreenRoute: isAdd
        ? { name: "workspace-add", params: {} }
        : mode === "edit"
          ? { name: "workspace-edit", params: { id } }
          : { name: "workspace-detail", params: { id } },
    };
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
    } catch {
      notify.error("Delete failed", "We couldn't delete the workspace.");
    } finally {
      deleteLoading.value = false;
    }
  }
  function togglePin(id: number) {
    const i = pinnedWorkspaceIds.value.indexOf(id);
    if (i > -1) pinnedWorkspaceIds.value.splice(i, 1);
    else pinnedWorkspaceIds.value.push(id);
  }
  function isPinned(id: number) {
    return pinnedWorkspaceIds.value.includes(id);
  }
  function toggleArchive(id: number) {
    const w = workspaceStore.workspaces.find((item) => item.id === id);
    if (w) w.isArchived = !w.isArchived;
  }
  function copyShareLink() {
    navigator.clipboard.writeText(shareLink.value);
  }
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
</script>
