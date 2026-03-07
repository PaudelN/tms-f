<template>
  <UiDetail
    :loading="workspaceStore.isDetailLoading"
    loading-text="Loading workspace…"
    :breadcrumbs="breadcrumbs"
    :status-badge="statusBadge"
    :actions="actions"
    :meta-fields="metaFields"
    :meta-default-size="22"
    :delete-open="deleteModalOpen"
    :delete-loading="deleteLoading"
    :delete-dialog="deleteDialog"
    activity-coming-soon
    @update:delete-open="deleteModalOpen = $event"
    @confirm-delete="confirmDelete"
  >
    <template #content>
      <!-- Cover -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <ImageIcon class="h-3.5 w-3.5 text-muted-foreground" />
          <h2 class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
            Cover
          </h2>
        </div>
        <div
          class="rounded-lg border border-dashed border-border/60 bg-muted/15 h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/25 hover:border-primary/30 transition-all duration-200 group"
        >
          <ImageIcon class="h-7 w-7 opacity-20 group-hover:opacity-40 transition-opacity" />
          <p class="text-[11px] font-medium opacity-40 group-hover:opacity-60 transition-opacity">
            Click to upload a cover image
          </p>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <AlignLeft class="h-3.5 w-3.5 text-muted-foreground" />
          <h2 class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
            Description
          </h2>
        </div>
        <div
          v-if="workspace?.description"
          class="text-[13px] text-foreground/80 leading-relaxed rounded-lg bg-muted/20 border border-border/40 px-4 py-3.5"
        >
          {{ workspace.description }}
        </div>
        <div
          v-else
          class="text-[12px] text-muted-foreground/60 italic rounded-lg bg-muted/10 border border-dashed border-border/40 px-4 py-3.5 cursor-pointer hover:bg-muted/20 hover:text-muted-foreground transition-all duration-200"
          @click="handleEdit"
        >
          No description yet — click to add one.
        </div>
      </div>
    </template>

    <template #delete-body>
      <span>
        <strong class="font-semibold">{{ workspace?.name }}</strong>
        and all its projects and tasks will be permanently removed.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
import { notify } from "@/helpers/toast";
import { useWorkspaceStore } from "@/stores/workspace";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  ActionButton,
  BreadcrumbItem,
  MetaField,
} from "@/components/common/UiDetail.vue";
import UiDetail from "@/components/common/UiDetail.vue";

import {
  AlignLeft,
  ArchiveRestore,
  CalendarDays,
  Clock,
  ImageIcon,
  Radio,
  RefreshCcw,
  SquarePen,
  Trash2,
  User,
} from "lucide-vue-next";

const route  = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();

const deleteModalOpen = ref(false);
const deleteLoading   = ref(false);

// activeWorkspace is a computed alias for currentWorkspace in the store
const workspace = computed(() => workspaceStore.activeWorkspace);

const currentStatusObj = computed(() =>
  workspaceStore.statuses.find((s) => s.value === workspace.value?.status),
);

const statusBadge = computed(() => {
  if (!currentStatusObj.value) return undefined;
  return {
    label: currentStatusObj.value.label,
    dot:   currentStatusObj.value.dot,
    class: currentStatusObj.value.badge,
  };
});

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: "Workspaces", onClick: () => router.push({ name: "workspace" }) },
  { label: workspace.value?.name ?? "Workspace" },
]);

const actions = computed<ActionButton[]>(() => [
  {
    id:      "refresh",
    label:   "Refresh",
    icon:    RefreshCcw,
    onClick: handleRefresh,
  },
  {
    id:      "archive",
    label:   workspace.value?.is_archived ? "Unarchive" : "Archive",
    icon:    ArchiveRestore,
    onClick: handleArchive,
  },
  {
    id:      "edit",
    label:   "Edit",
    icon:    SquarePen,
    onClick: handleEdit,
  },
  {
    id:      "delete",
    label:   "Delete",
    icon:    Trash2,
    variant: "destructive",
    onClick: () => { deleteModalOpen.value = true; },
  },
]);

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const metaFields = computed<MetaField[]>(() => [
  {
    label:      "Owner",
    type:       "avatar",
    avatarData: workspace.value?.user
      ? {
          initials: workspace.value.user.name.charAt(0).toUpperCase(),
          name:     workspace.value.user.name,
          sub:      workspace.value.user.email,
        }
      : undefined,
  },
  {
    label:      "Status",
    type:       "badge",
    icon:       Radio,
    value:      currentStatusObj.value?.label ?? workspace.value?.status ?? "—",
    badgeClass: currentStatusObj.value?.badge,
    dot:        currentStatusObj.value?.dot,
  },
  {
    label: "Created At",
    value: formatDate(workspace.value?.created_at),
    icon:  CalendarDays,
  },
  {
    label: "Last Updated",
    value: formatDate(workspace.value?.updated_at),
    icon:  Clock,
  },
  {
    label: "Owner ID",
    value: workspace.value?.user_id ? `#${workspace.value.user_id}` : "—",
    icon:  User,
  },
]);

const deleteDialog = {
  title:         "Delete Workspace",
  description:   "This action cannot be undone.",
  confirmLabel:  "Delete Workspace",
};

onMounted(async () => {
  const id = Number(route.params.id);
  if (!id) {
    router.push({ name: "workspace" });
    return;
  }
  // Load statuses (cached after first fetch) and workspace detail in parallel
  await Promise.all([
    workspaceStore.fetchStatuses(),
    workspaceStore.fetchWorkspace(id),
  ]);
});

function handleEdit() {
  router.push({ name: "workspace-edit", params: { id: workspace.value?.id } });
}

async function handleRefresh() {
  const id = Number(route.params.id);
  if (!id) return;

  try {
    await workspaceStore.fetchWorkspace(id);
    notify.info("Workspace refreshed", "Latest workspace details loaded.");
  } catch {
    notify.error("Refresh failed", "Could not refresh workspace details.");
  }
}

async function handleArchive() {
  if (!workspace.value) return;
  try {
    const nextStatus = workspace.value.is_archived ? "active" : "archived";
    await workspaceStore.updateWorkspace(workspace.value.id, {
      name:   workspace.value.name,
      status: nextStatus,
    });
    await workspaceStore.fetchWorkspace(workspace.value.id);
    notify.success("Workspace updated", "Workspace status was updated successfully.");
  } catch {
    notify.error("Update failed", "Could not update workspace status.");
  }
}

async function confirmDelete() {
  if (!workspace.value) return;
  deleteLoading.value = true;
  try {
    await workspaceStore.deleteWorkspace(workspace.value.id);
    notify.success("Workspace deleted", "The workspace was deleted successfully.");
    router.push({ name: "workspace" });
  } catch {
    notify.error("Delete failed", "The workspace could not be deleted.");
  } finally {
    deleteLoading.value = false;
  }
}
</script>