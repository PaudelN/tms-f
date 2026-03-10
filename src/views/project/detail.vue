<template>
  <UiDetail
    :loading="projectStore.isDetailLoading"
    loading-text="Loading project…"
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
          v-if="project?.description"
          class="text-[13px] text-foreground/80 leading-relaxed rounded-lg bg-muted/20 border border-border/40 px-4 py-3.5"
        >
          {{ project.description }}
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
        <strong class="font-semibold">{{ project?.name }}</strong>
        and all its pipelines and tasks will be permanently removed.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  ActionButton,
  BreadcrumbItem,
  MetaField,
} from "@/components/common/UiDetail.vue";
import UiDetail from "@/components/common/UiDetail.vue";
import { notify } from "@/helpers/toast";

import {
  AlignLeft,
  CalendarDays,
  Clock,
  Eye,
  ImageIcon,
  Layers,
  Radio,
  RefreshCcw,
  SquarePen,
  Trash2,
  User,
} from "lucide-vue-next";

const route        = useRoute();
const router       = useRouter();
const projectStore = useProjectStore();

const deleteModalOpen = ref(false);
const deleteLoading   = ref(false);

// ── Shallow route: /projects/:id ─────────────────────────────────────────────
const project = computed(() => projectStore.activeProject);

// ── Safe field extractors ─────────────────────────────────────────────────────
//
// The API may return status/visibility as EITHER:
//   • a plain string:  "draft"
//   • a full object:   { value: "draft", label: "Draft", ... }
//
// These helpers normalize both shapes so the rest of the code
// always works with a predictable string.

/**
 * Always returns the raw string VALUE of a field, regardless of whether
 * the API returned a string or an enum object.
 *
 * "draft"                              → "draft"
 * { value: "draft", label: "Draft" }  → "draft"
 * null / undefined                     → ""
 */
function extractValue(field: unknown): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "value" in field) {
    return String((field as { value: unknown }).value);
  }
  return "";
}

/**
 * Returns the human-readable LABEL of a field.
 * Prefers the object's own .label if present, otherwise
 * looks up the value in the store's enum list, otherwise
 * capitalizes the raw value as a last-resort fallback.
 */
function extractLabel(
  field: unknown,
  storeList: Array<{ value: string; label: string }>,
): string {
  if (!field) return "—";

  // If the API returned the full object with a label, use it directly
  if (typeof field === "object" && field !== null && "label" in field) {
    return String((field as { label: unknown }).label);
  }

  // Otherwise field is a plain string — look it up in the store enum list
  const raw = typeof field === "string" ? field : extractValue(field);
  if (!raw) return "—";

  const found = storeList.find((s) => s.value === raw);
  if (found) return found.label;

  // Last-resort: capitalize + replace underscores
  return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ");
}

// ── Resolved display values ───────────────────────────────────────────────────

const rawStatusValue = computed(() => extractValue(project.value?.status))
const rawVisibilityValue = computed(() => extractValue(project.value?.visibility))

const currentStatusObj = computed(() =>
  projectStore.statuses.find((s) => s.value === rawStatusValue.value),
)

const currentVisibilityObj = computed(() =>
  projectStore.visibilities.find((v) => v.value === rawVisibilityValue.value),
)

const statusLabel = computed<string>(() =>
  extractLabel(project.value?.status, projectStore.statuses),
)

const visibilityLabel = computed<string>(() =>
  extractLabel(project.value?.visibility, projectStore.visibilities),
)

// ── Status badge (header chip) ────────────────────────────────────────────────
const statusBadge = computed(() => {
  if (!currentStatusObj.value) return undefined;
  return {
    label: currentStatusObj.value.label,
    dot:   currentStatusObj.value.dot,
    class: currentStatusObj.value.badge,
  };
});

// ── Breadcrumbs ───────────────────────────────────────────────────────────────
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: "Workspaces", onClick: () => router.push({ name: "workspace" }) },
  {
    label: project.value?.workspace?.name ?? "Workspace",
    onClick: () => {
      if (project.value?.workspace_id) {
        router.push({
          name:   "project-index",
          params: { workspaceId: project.value.workspace_id },
        });
      }
    },
  },
  { label: project.value?.name ?? "Project" },
]);

// ── Action buttons ────────────────────────────────────────────────────────────
const actions = computed<ActionButton[]>(() => [
  {
    id:      "refresh",
    label:   "Refresh",
    icon:    RefreshCcw,
    onClick: handleRefresh,
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

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

// ── Meta sidebar fields ───────────────────────────────────────────────────────
const metaFields = computed<MetaField[]>(() => [
  {
    label:      "Creator",
    type:       "avatar",
    avatarData: project.value?.creator
      ? {
          initials: project.value.creator.name.charAt(0).toUpperCase(),
          name:     project.value.creator.name,
          sub:      project.value.creator.email,
        }
      : undefined,
  },
  {
    label:      "Status",
    type:       "badge",
    icon:       Radio,
    value:      statusLabel.value,
    badgeClass: currentStatusObj.value?.badge,
    dot:        currentStatusObj.value?.dot,
  },
  {
    label: "Visibility",
    icon:  Eye,
    value: visibilityLabel.value,
  },
  {
    label: "Workspace",
    value: project.value?.workspace?.name ?? "—",
    icon:  Layers,
  },
  {
    label: "Start Date",
    value: formatDate(project.value?.start_date),
    icon:  CalendarDays,
  },
  {
    label: "End Date",
    value: formatDate(project.value?.end_date),
    icon:  CalendarDays,
  },
  {
    label: "Created At",
    value: formatDate(project.value?.created_at),
    icon:  CalendarDays,
  },
  {
    label: "Last Updated",
    value: formatDate(project.value?.updated_at),
    icon:  Clock,
  },
  {
    label: "Creator ID",
    value: project.value?.creator?.id ? `#${project.value.creator.id}` : "—",
    icon:  User,
  },
]);

// ── Delete dialog ─────────────────────────────────────────────────────────────
const deleteDialog = {
  title:        "Delete Project",
  description:  "This action cannot be undone.",
  confirmLabel: "Delete Project",
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  const id = Number(route.params.id);
  if (!id || isNaN(id)) {
    router.push({ name: "workspace" });
    return;
  }
  await Promise.all([
    projectStore.fetchStatuses(),
    projectStore.fetchVisibilities(),
    projectStore.fetchProject(id),
  ]);
});

// ── Handlers ─────────────────────────────────────────────────────────────────
function handleEdit() {
  router.push({ name: "project-edit", params: { id: project.value?.id } });
}

async function handleRefresh() {
  const id = Number(route.params.id);
  if (id) await projectStore.fetchProject(id);
}

async function confirmDelete() {
  if (!project.value) return;
  deleteLoading.value = true;
  try {
    const deletedName     = project.value.name;
    const backWorkspaceId = project.value.workspace_id;
    await projectStore.deleteProject(project.value.id, project.value.workspace_id);
    notify.success(
      "Project deleted",
      `"${deletedName}" was removed successfully.`,
      { position: "bottom-right" },
    );
    router.push({ name: "project-index", params: { workspaceId: backWorkspaceId } });
  } catch {
    notify.error("Delete failed", "We couldn't delete this project.", {
      position: "bottom-right",
    });
  } finally {
    deleteLoading.value = false;
  }
}
</script>