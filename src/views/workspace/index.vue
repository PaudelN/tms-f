<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-800 mx-auto p-8">
      <UiHeader
        title="Workspaces"
        :stats="headerStats"
        :show-views="true"
        :show-refresh="true"
        :current-view="currentView"
        create-label="Add Workspace"
        @create="handleCreate"
        @update:current-view="handleViewChange"
        @refresh="onRefresh"
      />

      <div>
        <UiTable
          ref="tableRef"
          v-if="currentView === 'table'"
          table-id="workspaces-table"
          :columns="columns"
          :fetch-fn="fetchWorkspaces"
          :config="{
            defaultPerPage: 10,
            defaultSortBy: 'created_at',
            defaultSortOrder: 'desc',
            debounceMs: 400,
            persistState: true,
          }"
          search-placeholder="Search workspaces..."
          :show-refresh="true"
          :loading="isLoading"
        >
          <!-- <template #cell-name="{ row }">
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

          <template #cell-user="{ row }">
            <div v-if="row.user" class="flex items-center gap-2">
              <div
                class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold relative"
              >
                {{ row.user.name.charAt(0).toUpperCase() }}
                <div
                  v-if="row.user.isOnline"
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card"
                />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium text-foreground truncate">
                  {{ row.user.name }}
                </div>
                <div class="text-xs text-muted-foreground truncate">
                  {{ row.user.email }}
                </div>
              </div>
            </div>
            <span v-else class="text-xs text-muted-foreground">No owner</span>
          </template>

          <template #cell-created_at="{ value }">
            <div class="text-sm">
              <div class="text-foreground font-medium">
                {{ formatDate(value) }}
              </div>
              <div class="text-xs text-muted-foreground">
                {{ formatTime(value) }}
              </div>
            </div>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="text-primary"
                title="View"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Edit"
                @click="handleEdit(row.id)"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="text-orange-600"
                :title="row.isArchived ? 'Unarchive' : 'Archive'"
                @click="toggleArchive(row.id)"
              >
                <Archive class="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="text-destructive"
                title="Delete"
                @click="handleDelete(row.id, row.name)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </template> -->
        </UiTable>

        <UiList
          v-else-if="currentView === 'list'"
          :items="workspaceStore.workspaces"
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
              @click="handleView(item.id)"
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
                    @click.stop="handleEdit(item.id)"
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

    <!-- Share dialog -->
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
  </div>
</template>

<script setup lang="ts">
  import UiHeader from "@/components/common/UiHeader.vue";
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
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { notify } from "@/helpers/toast";
import type { Workspace } from "@/stores/workspace";
import { useWorkspaceStore } from "@/stores/workspace";
import type {
  ApiResponse,
  TableColumn,
  ViewMode,
} from "@/ui-table/types/table.types";
import UiKanban from "@/ui-table/UiKanban.vue";
import UiList from "@/ui-table/UiList.vue";
import UiTable from "@/ui-table/UiTable.vue";
import { Archive, ChevronRight, Pencil, Star } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

  const router = useRouter();
  const workspaceStore = useWorkspaceStore();

  const currentView = ref<ViewMode>("table");
  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const workspaceToDelete = ref<{ id: number; name: string } | null>(null);
  const showShareModal = ref(false);
  const shareLink = ref("https://workspace.app/invite/abc123xyz");
  const pinnedWorkspaceIds = ref<number[]>([1, 3]);
  const isLoading = ref(false);
  const tableRef = ref();

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

  const kanbanColumns = computed(() => {
    const workspaces = workspaceStore.workspaces;
    const active = workspaces.filter((w) => !w.isArchived);
    const archived = workspaces.filter((w) => w.isArchived);
    const recent = active.slice(0, Math.ceil(active.length / 2));
    return [
      { id: "recent", title: "Recent", items: recent },
      { id: "active", title: "Active", items: active.slice(recent.length) },
      { id: "archived", title: "Archived", items: archived },
    ];
  });

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

  // 3. Load data when switching to list/kanban (table fetches via its own fetchFn)
  function handleViewChange(view: ViewMode) {
    currentView.value = view;
    if (view !== "table") fetchData();
  }

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
  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString("en-UK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>
