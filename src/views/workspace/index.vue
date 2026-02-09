<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-[1600px] mx-auto p-8">
      <WorkspaceHeader
        :active-count="activeWorkspacesCount"
        :archived-count="archivedWorkspacesCount"
        :pinned-count="pinnedWorkspaces.length"
        :search-query="quickSearchQuery"
        @update:search-query="quickSearchQuery = $event"
        @create="handleCreate"
      />

      <WorkspaceTabs :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

      <WorkspaceOverview
        v-if="activeTab === 'overview'"
        :total-workspaces="workspaceStore.totalWorkspaces"
        :active-count="activeWorkspacesCount"
        :archived-count="archivedWorkspacesCount"
        :progress-percentage="progressPercentage"
        :top-contributor="topContributor"
        :pinned-workspaces="pinnedWorkspaces"
        :team-activities="teamActivities"
        :recent-files="recentFiles"
        :upcoming-events="upcomingEvents"
        :format-date="formatDate"
        :format-event-date="formatEventDate"
        :get-relative-time="getRelativeTime"
        @view="handleView"
        @toggle-pin="togglePin"
      />

      <div v-else-if="activeTab === 'workspaces'" class="space-y-4">
        <WorkspaceFilters
          :filter-owner="filterOwner"
          :filter-status="filterStatus"
          :current-view="currentView"
          :unique-owners="uniqueOwners"
          :quick-search-query="quickSearchQuery"
          :has-active-filters="hasActiveFilters"
          :get-owner-name="getOwnerName"
          @update:filter-owner="filterOwner = $event"
          @update:filter-status="filterStatus = $event"
          @update:current-view="currentView = $event"
          @update:quick-search-query="quickSearchQuery = $event"
          @export="exportData"
          @share="showShareModal = true"
          @clear-all-filters="clearAllFilters"
        />

        <div class="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
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
              rowKey: 'id',
              selectable: true,
              rowActions,
              bulkActions,
            }"
            search-placeholder="Search workspaces..."
            :show-refresh="true"
          >
            <template #cell-name="{ row }">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center relative">
                  <span class="text-primary text-sm font-bold">{{ row.name.charAt(0).toUpperCase() }}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-card border border-border hover:bg-primary hover:border-primary transition-colors group"
                    @click.stop="togglePin(row.id)"
                  >
                    <Star
                      class="w-2.5 h-2.5"
                      :class="isPinned(row.id) ? 'text-primary' : 'text-muted-foreground group-hover:text-white'"
                    />
                  </Button>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-foreground truncate flex items-center gap-2">
                    {{ row.name }}
                    <span
                      v-if="row.isArchived"
                      class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full"
                    >
                      Archived
                    </span>
                  </div>
                  <div v-if="row.description" class="text-xs text-muted-foreground truncate">
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
                  ></div>
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium text-foreground truncate">{{ row.user.name }}</div>
                  <div class="text-xs text-muted-foreground truncate">{{ row.user.email }}</div>
                </div>
              </div>
              <span v-else class="text-xs text-muted-foreground">No owner</span>
            </template>

            <template #cell-created_at="{ value }">
              <div class="text-sm">
                <div class="text-foreground font-medium">{{ formatDate(value) }}</div>
                <div class="text-xs text-muted-foreground">{{ formatTime(value) }}</div>
              </div>
            </template>

          </UiTable>

          <UiList v-else-if="currentView === 'list'" :items="filteredWorkspaces" :loading="workspaceStore.isLoading">
            <template #item="{ item }">
              <div class="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span class="text-primary text-sm font-bold">{{ item.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="font-medium text-foreground truncate flex items-center gap-2">
                      {{ item.name }}
                      <span
                        v-if="item.isArchived"
                        class="text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full"
                      >
                        Archived
                      </span>
                    </div>
                    <div v-if="item.description" class="text-xs text-muted-foreground truncate">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span class="text-xs text-muted-foreground">{{ formatDate(item.created_at) }}</span>
                  <div class="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7"
                      @click.stop="togglePin(item.id)"
                    >
                      <Star
                        class="h-3.5 w-3.5"
                        :class="isPinned(item.id) ? 'text-primary' : 'text-muted-foreground'"
                      />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 text-primary"
                      @click="handleView(item.id)"
                    >
                      <ChevronRight class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </template>
          </UiList>

          <UiKanban v-else-if="currentView === 'kanban'" :columns="kanbanColumns" :loading="workspaceStore.isLoading">
            <template #item="{ items }">
              <div
                v-for="(item, index) in items"
                :key="index"
                class="bg-background rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group"
                @click="handleView(item.id)"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span class="text-primary text-xs font-bold">{{ item.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="font-medium text-sm text-foreground">{{ item.name }}</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7 opacity-0 group-hover:opacity-100"
                    @click.stop="togglePin(item.id)"
                  >
                    <Star
                      class="h-3.5 w-3.5"
                      :class="isPinned(item.id) ? 'text-primary' : 'text-muted-foreground'"
                    />
                  </Button>
                </div>
                <div v-if="item.description" class="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {{ item.description }}
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-border">
                  <span class="text-xs text-muted-foreground">{{ formatDate(item.created_at) }}</span>
                  <div class="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" class="h-7 w-7" @click.stop="handleEdit(item.id)">
                      <Pencil class="h-3.5 w-3.5 text-foreground" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" class="h-7 w-7" @click.stop="toggleArchive(item.id)">
                      <Archive class="h-3.5 w-3.5 text-orange-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </template>
          </UiKanban>
        </div>
      </div>

      <div v-else-if="activeTab === 'notifications'" class="space-y-4">
        <div class="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div class="p-5 border-b border-border flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">All Notifications</h3>
            <Button variant="link" size="sm" class="px-0" @click="markAllAsRead">
              Mark all as read
            </Button>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="p-5 transition-colors cursor-pointer"
              :class="notification.read ? 'bg-transparent hover:bg-accent' : 'bg-primary/5 hover:bg-primary/10'"
              @click="markAsRead(notification.id)"
            >
              <div class="flex items-start gap-4">
                <div :class="notification.iconBg" class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <component :is="notification.icon" class="w-5 h-5" :class="notification.iconColor" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="text-sm font-semibold text-foreground mb-1">{{ notification.title }}</p>
                      <p class="text-sm text-muted-foreground">{{ notification.message }}</p>
                      <p class="text-xs text-muted-foreground mt-2">{{ getRelativeTime(notification.timestamp) }}</p>
                    </div>
                    <div v-if="!notification.read" class="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <strong class="text-destructive">{{ workspaceToDelete?.name }}</strong
            >? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="deleteModalOpen = false">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="deleteLoading" class="gap-2">
            <Loader2 v-if="deleteLoading" class="animate-spin h-4 w-4" />
            <span>{{ deleteLoading ? "Deleting..." : "Delete" }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showShareModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Workspace</DialogTitle>
          <DialogDescription>Share with your team</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-2">Invite Link</label>
            <div class="flex items-center gap-2">
              <Input type="text" :value="shareLink" readonly class="flex-1" />
              <Button size="sm" @click="copyShareLink">Copy</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showShareModal = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkspaceFilters from "@/features/workspace/components/WorkspaceFilters.vue";
import WorkspaceHeader from "@/features/workspace/components/WorkspaceHeader.vue";
import WorkspaceOverview from "@/features/workspace/components/WorkspaceOverview.vue";
import WorkspaceTabs from "@/features/workspace/components/WorkspaceTabs.vue";
import type { Workspace } from "@/stores/workspace";
import { useWorkspaceStore } from "@/stores/workspace";
import type { ApiResponse, TableColumn, ViewMode } from "@/components/data-table/types/table.types";
import UiKanban from "@/components/data-table/UiKanban.vue";
import UiList from "@/components/data-table/UiList.vue";
import UiTable from "@/components/data-table/UiTable.vue";
import {
  Archive,
  ArchiveRestore,
  Bell,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  Pencil,
  Sparkles,
  Star,
  Trash2,
} from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const activeTab = ref<"overview" | "workspaces" | "notifications">("overview");
const tabs = computed(() => [
  {
    id: "overview" as const,
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "workspaces" as const,
    label: "All Workspaces",
    icon: FolderOpen,
    badge: workspaceStore.totalWorkspaces,
  },
  {
    id: "notifications" as const,
    label: "Notifications",
    icon: Bell,
    badge: notifications.value.filter((notification) => !notification.read).length || undefined,
  },
]);

const currentView = ref<ViewMode>("table");
const deleteModalOpen = ref(false);
const deleteLoading = ref(false);
const workspaceToDelete = ref<{ id: number; name: string } | null>(null);
const showShareModal = ref(false);
const shareLink = ref("https://workspace.app/invite/abc123xyz");
const quickSearchQuery = ref("");
const filterOwner = ref("");
const filterStatus = ref("");
const pinnedWorkspaceIds = ref<number[]>([1, 3]);

const activeWorkspacesCount = computed(() => workspaceStore.workspaces.filter((workspace) => !workspace.isArchived).length || 8);
const archivedWorkspacesCount = computed(
  () => workspaceStore.workspaces.filter((workspace) => workspace.isArchived).length || 2,
);
const progressPercentage = computed(() => {
  const total = activeWorkspacesCount.value + archivedWorkspacesCount.value;
  if (total === 0) return { active: 0, archived: 0 };
  return {
    active: Math.round((activeWorkspacesCount.value / total) * 100),
    archived: Math.round((archivedWorkspacesCount.value / total) * 100),
  };
});
const topContributor = computed(() => ({ name: "Sarah Johnson", workspaceCount: 12 }));
const uniqueOwners = computed(() => {
  const owners = new Map<number, { id: number; name: string }>();
  workspaceStore.workspaces.forEach((workspace) => {
    if (workspace.user) owners.set(workspace.user.id, workspace.user);
  });
  return Array.from(owners.values());
});
const hasActiveFilters = computed(() => !!(quickSearchQuery.value || filterOwner.value || filterStatus.value));
const filteredWorkspaces = computed(() => {
  let filtered = [...workspaceStore.workspaces];
  if (quickSearchQuery.value) {
    const query = quickSearchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (workspace) =>
        workspace.name.toLowerCase().includes(query) ||
        workspace.description?.toLowerCase().includes(query),
    );
  }
  if (filterOwner.value) {
    filtered = filtered.filter((workspace) => workspace.user?.id === Number(filterOwner.value));
  }
  if (filterStatus.value === "active") {
    filtered = filtered.filter((workspace) => !workspace.isArchived);
  } else if (filterStatus.value === "archived") {
    filtered = filtered.filter((workspace) => workspace.isArchived);
  }
  return filtered;
});
const pinnedWorkspaces = computed(() =>
  workspaceStore.workspaces.filter((workspace) => pinnedWorkspaceIds.value.includes(workspace.id)).slice(0, 5),
);
const kanbanColumns = computed(() => {
  const workspaces = filteredWorkspaces.value;
  const active = workspaces.filter((workspace) => !workspace.isArchived);
  const archived = workspaces.filter((workspace) => workspace.isArchived);
  const recent = active.slice(0, Math.ceil(active.length / 2));
  return [
    { id: "recent", title: "Recent", items: recent },
    { id: "active", title: "Active", items: active.slice(recent.length) },
    { id: "archived", title: "Archived", items: archived },
  ];
});

const teamActivities = ref([
  {
    id: 1,
    user: "John Doe",
    action: "created new workspace 'Q1 Planning'",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    badge: "New",
    badgeColor: "bg-green-500/10 text-green-600",
  },
  {
    id: 2,
    user: "Sarah Johnson",
    action: "updated 'Marketing Campaign 2024'",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    badge: "Update",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    id: 3,
    user: "Mike Chen",
    action: "archived 'Old Project'",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    badge: "Archive",
    badgeColor: "bg-orange-500/10 text-orange-600",
  },
  {
    id: 4,
    user: "Emily Davis",
    action: "shared 'Customer Research' with team",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    badge: "Share",
    badgeColor: "bg-blue-500/10 text-blue-600",
  },
]);

const notifications = ref([
  {
    id: 1,
    title: "Workspace Updated",
    message: "Marketing Campaign has been updated by Sarah Johnson",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: false,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    icon: Pencil,
  },
  {
    id: 2,
    title: "New Task Assigned",
    message: "New task in Product Development",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: "Workspace Archived",
    message: "Old Project has been moved to archive",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
    icon: Archive,
  },
]);

const upcomingEvents = ref([
  {
    id: 1,
    title: "Sprint Planning",
    workspace: "Product Development",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    color: "border-primary",
  },
  {
    id: 2,
    title: "Campaign Launch",
    workspace: "Marketing",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    color: "border-green-500",
  },
]);

const recentFiles = ref([
  {
    id: 1,
    name: "Q4_Report.pdf",
    size: "2.4 MB",
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
    icon: FileText,
  },
  {
    id: 2,
    name: "design.fig",
    size: "8.1 MB",
    uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    icon: Sparkles,
  },
  {
    id: 3,
    name: "notes.docx",
    size: "156 KB",
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    icon: FileText,
  },
  {
    id: 4,
    name: "budget.xlsx",
    size: "512 KB",
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    icon: FileSpreadsheet,
  },
]);

const columns: TableColumn<Workspace>[] = [
  { key: "name", label: "Workspace", sortable: true, headerClass: "w-[35%]" },
  { key: "user", label: "Owner", sortable: false, headerClass: "w-[25%]" },
  { key: "created_at", label: "Created", sortable: true, headerClass: "w-[20%]" },
];

const rowActions = [
  {
    label: "View",
    icon: Eye,
    onClick: (row: Workspace) => handleView(row.id),
  },
  {
    label: "Edit",
    icon: Pencil,
    onClick: (row: Workspace) => handleEdit(row.id),
  },
  {
    label: "Archive",
    icon: Archive,
    onClick: (row: Workspace) => toggleArchive(row.id),
    show: (row: Workspace) => !row.isArchived,
  },
  {
    label: "Unarchive",
    icon: ArchiveRestore,
    onClick: (row: Workspace) => toggleArchive(row.id),
    show: (row: Workspace) => row.isArchived,
  },
  {
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onClick: (row: Workspace) => handleDelete(row.id, row.name),
  },
];

const bulkActions = [
  {
    label: "Archive",
    icon: Archive,
    onClick: (rows: Workspace[]) => {
      rows.filter((row) => !row.isArchived).forEach((row) => toggleArchive(row.id));
    },
    disabled: (rows: Workspace[]) => rows.length === 0 || rows.every((row) => row.isArchived),
  },
  {
    label: "Unarchive",
    icon: ArchiveRestore,
    onClick: (rows: Workspace[]) => {
      rows.filter((row) => row.isArchived).forEach((row) => toggleArchive(row.id));
    },
    disabled: (rows: Workspace[]) => rows.length === 0 || rows.every((row) => !row.isArchived),
  },
];

watch(currentView, (newView) => {
  if ((newView === "list" || newView === "kanban") && workspaceStore.workspaces.length === 0) {
    workspaceStore.fetchWorkspaces();
  }
});

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
  } catch (error) {
    console.error("Failed to delete:", error);
  } finally {
    deleteLoading.value = false;
  }
}

function clearAllFilters() {
  quickSearchQuery.value = "";
  filterOwner.value = "";
  filterStatus.value = "";
}
function getOwnerName(ownerId: string): string {
  return uniqueOwners.value.find((owner) => owner.id === Number(ownerId))?.name || "Unknown";
}
function togglePin(id: number) {
  const index = pinnedWorkspaceIds.value.indexOf(id);
  if (index > -1) pinnedWorkspaceIds.value.splice(index, 1);
  else pinnedWorkspaceIds.value.push(id);
}
function isPinned(id: number): boolean {
  return pinnedWorkspaceIds.value.includes(id);
}
function toggleArchive(id: number) {
  const workspace = workspaceStore.workspaces.find((item) => item.id === id);
  if (workspace) workspace.isArchived = !workspace.isArchived;
}
function exportData(format: "csv" | "json") {
  const data = filteredWorkspaces.value;
  if (format === "csv") {
    const headers = ["ID", "Name", "Description", "Owner", "Created At", "Status"];
    const rows = data.map((workspace) => [
      workspace.id,
      workspace.name,
      workspace.description || "",
      workspace.user?.name || "N/A",
      formatDate(workspace.created_at),
      workspace.isArchived ? "Archived" : "Active",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    downloadFile(csv, "workspaces.csv", "text/csv");
  } else {
    downloadFile(JSON.stringify(data, null, 2), "workspaces.json", "application/json");
  }
}
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
function copyShareLink() {
  navigator.clipboard.writeText(shareLink.value);
}
function markAsRead(id: number) {
  const notification = notifications.value.find((item) => item.id === id);
  if (notification) notification.read = true;
}
function markAllAsRead() {
  notifications.value.forEach((notification) => {
    notification.read = true;
  });
}
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-UK", { hour: "2-digit", minute: "2-digit" });
}
function formatEventDate(date?: Date): string {
  if (!date) return "";
  const diffDays = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function getRelativeTime(date: Date): string {
  const diffMs = new Date().getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
</script>
