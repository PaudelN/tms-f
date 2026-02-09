<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-foreground mb-2">Workspaces</h1>
            <p class="text-muted-foreground text-sm">
              Manage and organize your workspaces
            </p>
          </div>
          <button
            @click="handleCreate"
            class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create Workspace</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1"
              >
                Total Workspaces
              </p>
              <p class="text-3xl font-bold text-card-foreground">
                {{ workspaceStore.totalWorkspaces }}
              </p>
            </div>
            <div
              class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1"
              >
                Current Page
              </p>
              <p class="text-3xl font-bold text-card-foreground">
                {{ workspaceStore.currentPage }} /
                {{ workspaceStore.totalPages }}
              </p>
            </div>
            <div
              class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1"
              >
                Per Page
              </p>
              <p class="text-3xl font-bold text-card-foreground">
                {{ workspaceStore.perPage }}
              </p>
            </div>
            <div
              class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- View Mode Navbar -->
      <UiViews v-model="currentView" />

      <!-- Table View -->
      <UiTable
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
        search-placeholder="Search workspaces by name or description..."
        :show-refresh="true"
      >
        <!-- Custom cell: Name with icon -->
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center"
            >
              <span class="text-primary text-sm font-bold">
                {{ row.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-foreground truncate">
                {{ row.name }}
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

        <!-- Custom cell: Owner -->
        <template #cell-user="{ row }">
          <div v-if="row.user" class="flex items-center gap-2">
            <div
              class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold"
            >
              {{ row.user.name.charAt(0).toUpperCase() }}
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

        <!-- Custom cell: Created At -->
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

        <!-- Custom cell: Actions -->
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1">
            <button
              @click="handleView(row.id)"
              class="p-2 rounded-lg hover:bg-accent text-primary transition-all"
              title="View details"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <button
              @click="handleEdit(row.id)"
              class="p-2 rounded-lg hover:bg-accent text-foreground transition-all"
              title="Edit workspace"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <button
              @click="handleDelete(row.id, row.name)"
              class="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
              title="Delete workspace"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </template>
      </UiTable>

      <!-- List View -->
      <UiList
        v-else-if="currentView === 'list'"
        :items="workspaceStore.workspaces"
        :loading="workspaceStore.isLoading"
      >
        <template #item="{ item }">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0"
              >
                <span class="text-primary text-sm font-bold">
                  {{ item.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-foreground truncate">
                  {{ item.name }}
                </div>
                <div
                  v-if="item.description"
                  class="text-xs text-muted-foreground truncate"
                >
                  {{ item.description }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 ml-4">
              <span class="text-xs text-muted-foreground">
                {{ formatDate(item.created_at) }}
              </span>
              <button
                @click="handleView(item.id)"
                class="p-2 rounded-lg hover:bg-accent text-primary transition-all"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </template>
      </UiList>

      <!-- Kanban View -->
      <UiKanban
        v-else-if="currentView === 'kanban'"
        :columns="kanbanColumns"
        :loading="workspaceStore.isLoading"
      >
        <template #item="{ items }">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="bg-card rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
            @click="handleView(item.id)"
          >
            <div class="font-medium text-sm text-foreground mb-1">
              {{ item.name }}
            </div>
            <div
              v-if="item.description"
              class="text-xs text-muted-foreground line-clamp-2"
            >
              {{ item.description }}
            </div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                {{ formatDate(item.created_at) }}
              </span>
              <div class="flex gap-1">
                <button
                  @click.stop="handleEdit(item.id)"
                  class="p-1 rounded hover:bg-accent text-foreground transition-all"
                >
                  <svg
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </UiKanban>
    </div>

    <!-- Delete Confirmation Modal -->
    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{
              workspaceToDelete?.name
            }}</strong
            >? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="deleteModalOpen = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="deleteLoading"
            class="gap-2"
          >
            <svg
              v-if="deleteLoading"
              class="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ deleteLoading ? "Deleting..." : "Delete" }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
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
  import UiViews from "@/ui-table/UiViews.vue";
  import { computed, ref, watch } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const workspaceStore = useWorkspaceStore();

  // View mode state
  const currentView = ref<ViewMode>("table");

  // Delete modal state
  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const workspaceToDelete = ref<{ id: number; name: string } | null>(null);

  // Table columns
  const columns: TableColumn<Workspace>[] = [
    {
      key: "name",
      label: "Workspace",
      sortable: true,
      width: "35%",
    },
    {
      key: "user",
      label: "Owner",
      sortable: false,
      width: "25%",
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      width: "20%",
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "center",
      width: "20%",
    },
  ];

  // Kanban columns computed from workspace data
  const kanbanColumns = computed(() => {
    const workspaces = workspaceStore.workspaces;
    const midpoint = Math.ceil(workspaces.length / 3);

    return [
      {
        id: "active",
        title: "Active",
        items: workspaces.slice(0, midpoint),
      },
      {
        id: "recent",
        title: "Recent",
        items: workspaces.slice(midpoint, midpoint * 2),
      },
      {
        id: "archived",
        title: "Archived",
        items: workspaces.slice(midpoint * 2),
      },
    ];
  });

  // Fetch workspaces when view changes to list or kanban
  watch(currentView, (newView) => {
    if (
      (newView === "list" || newView === "kanban") &&
      workspaceStore.workspaces.length === 0
    ) {
      workspaceStore.fetchWorkspaces();
    }
  });

  // Fetch function for the table
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

    return {
      data: response.data,
      meta: response.meta,
    };
  }

  // Action handlers
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
    } catch (error) {
      console.error("Failed to delete workspace:", error);
    } finally {
      deleteLoading.value = false;
    }
  }

  // Date formatting
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-UK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>
