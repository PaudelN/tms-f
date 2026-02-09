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
          :show-export-menu="showExportMenu"
          :get-owner-name="getOwnerName"
          @update:filter-owner="filterOwner = $event"
          @update:filter-status="filterStatus = $event"
          @update:current-view="currentView = $event"
          @update:quick-search-query="quickSearchQuery = $event"
          @toggle-export-menu="showExportMenu = !showExportMenu"
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
            }"
            search-placeholder="Search workspaces..."
            :show-refresh="true"
          >
            <template #cell-name="{ row }">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center relative">
                  <span class="text-primary text-sm font-bold">{{ row.name.charAt(0).toUpperCase() }}</span>
                  <button
                    type="button"
                    class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:border-primary transition-colors group"
                    @click.stop="togglePin(row.id)"
                  >
                    <svg
                      class="w-2.5 h-2.5"
                      :class="isPinned(row.id) ? 'text-primary' : 'text-muted-foreground group-hover:text-white'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
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

            <template #cell-actions="{ row }">
              <div class="flex items-center justify-center gap-1">
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-accent text-primary transition-all"
                  title="View"
                  @click="handleView(row.id)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-accent text-foreground transition-all"
                  title="Edit"
                  @click="handleEdit(row.id)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-accent text-orange-600 transition-all"
                  :title="row.isArchived ? 'Unarchive' : 'Archive'"
                  @click="toggleArchive(row.id)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                  title="Delete"
                  @click="handleDelete(row.id, row.name)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <button type="button" class="p-1.5 rounded hover:bg-accent/50" @click.stop="togglePin(item.id)">
                      <svg
                        class="w-3.5 h-3.5"
                        :class="isPinned(item.id) ? 'text-primary' : 'text-muted-foreground'"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                    <button type="button" class="p-1.5 rounded hover:bg-accent/50 text-primary" @click="handleView(item.id)">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
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
                  <button type="button" class="opacity-0 group-hover:opacity-100" @click.stop="togglePin(item.id)">
                    <svg
                      class="w-3.5 h-3.5"
                      :class="isPinned(item.id) ? 'text-primary' : 'text-muted-foreground'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </div>
                <div v-if="item.description" class="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {{ item.description }}
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-border">
                  <span class="text-xs text-muted-foreground">{{ formatDate(item.created_at) }}</span>
                  <div class="flex gap-1">
                    <button type="button" class="p-1.5 rounded hover:bg-accent" @click.stop="handleEdit(item.id)">
                      <svg class="h-3.5 w-3.5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button type="button" class="p-1.5 rounded hover:bg-accent" @click.stop="toggleArchive(item.id)">
                      <svg class="h-3.5 w-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                    </button>
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
            <button type="button" class="text-sm text-primary hover:underline" @click="markAllAsRead">
              Mark all as read
            </button>
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
                  <svg class="w-5 h-5" :class="notification.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="notification.iconPath" />
                  </svg>
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
            <svg v-if="deleteLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
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
              <input
                type="text"
                :value="shareLink"
                readonly
                class="flex-1 px-3 py-2 bg-muted border border-input rounded-lg text-sm text-foreground"
              />
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkspaceFilters from "@/components/workspace/WorkspaceFilters.vue";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader.vue";
import WorkspaceOverview from "@/components/workspace/WorkspaceOverview.vue";
import WorkspaceTabs from "@/components/workspace/WorkspaceTabs.vue";
import { notify } from "@/helpers/toast";
import type { Workspace } from "@/stores/workspace";
import { useWorkspaceStore } from "@/stores/workspace";
import type { ApiResponse, TableColumn, ViewMode } from "@/ui-table/types/table.types";
import UiKanban from "@/ui-table/UiKanban.vue";
import UiList from "@/ui-table/UiList.vue";
import UiTable from "@/ui-table/UiTable.vue";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const activeTab = ref<"overview" | "workspaces" | "notifications">("overview");
const tabs = computed(() => [
  {
    id: "overview" as const,
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "workspaces" as const,
    label: "All Workspaces",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    badge: workspaceStore.totalWorkspaces,
  },
  {
    id: "notifications" as const,
    label: "Notifications",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    badge: notifications.value.filter((notification) => !notification.read).length || undefined,
  },
]);

const currentView = ref<ViewMode>("table");
const deleteModalOpen = ref(false);
const deleteLoading = ref(false);
const workspaceToDelete = ref<{ id: number; name: string } | null>(null);
const showShareModal = ref(false);
const shareLink = ref("https://workspace.app/invite/abc123xyz");
const showExportMenu = ref(false);
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
    iconPath:
      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    id: 2,
    title: "New Task Assigned",
    message: "New task in Product Development",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    id: 3,
    title: "Workspace Archived",
    message: "Old Project has been moved to archive",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
    iconPath: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
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
    iconPath:
      "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    id: 2,
    name: "design.fig",
    size: "8.1 MB",
    uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    iconPath:
      "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    id: 3,
    name: "notes.docx",
    size: "156 KB",
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    iconPath:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 01 17 8.414V19a2 2 0 01-2 2z",
  },
  {
    id: 4,
    name: "budget.xlsx",
    size: "512 KB",
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    iconPath:
      "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 01 17 8.414V19a2 2 0 01-2 2z",
  },
]);

const columns: TableColumn<Workspace>[] = [
  { key: "name", label: "Workspace", sortable: true, width: "35%" },
  { key: "user", label: "Owner", sortable: false, width: "25%" },
  { key: "created_at", label: "Created", sortable: true, width: "20%" },
  { key: "actions", label: "Actions", sortable: false, align: "center", width: "20%" },
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
    notify.success("Workspace deleted", `Removed ${workspaceToDelete.value.name}.`);
    deleteModalOpen.value = false;
    workspaceToDelete.value = null;
  } catch (error) {
    notify.error("Delete failed", "Unable to delete the workspace.");
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
  showExportMenu.value = false;
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
