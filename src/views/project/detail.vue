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

      <!-- ── Pipelines ──────────────────────────────────────────────────────── -->
      <div class="space-y-3">
        <!-- Section header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <GitBranch class="h-3.5 w-3.5 text-muted-foreground" />
            <h2 class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
              Pipelines
            </h2>
            <!-- Active count badge -->
            <span
              v-if="activePipelines.length > 0"
              class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              {{ activePipelines.length }} active
            </span>
          </div>
          <!-- "View all" link — goes to the pipeline index for this project -->
          <button
            v-if="activePipelines.length > 0"
            type="button"
            class="text-[11px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            @click="goToPipelineIndex"
          >
            View all
          </button>
        </div>

        <!-- Pipeline list -->
        <div v-if="activePipelines.length > 0" class="space-y-2">
          <button
            v-for="pl in activePipelines"
            :key="pl.id"
            type="button"
            class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 group text-left"
            @click="goToPipeline(pl.id)"
          >
            <!-- Icon -->
            <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <GitBranch class="h-3.5 w-3.5 text-primary" />
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold text-foreground truncate leading-tight">
                {{ pl.name }}
              </p>
              <p
                v-if="pl.description"
                class="text-[11px] text-muted-foreground truncate mt-0.5"
              >
                {{ pl.description }}
              </p>
            </div>

            <!-- Stage count -->
            <div
              v-if="pl.stages_count != null"
              class="flex items-center gap-1 shrink-0"
            >
              <Layers class="h-3 w-3 text-muted-foreground/60" />
              <span class="text-[11px] text-muted-foreground tabular-nums">
                {{ pl.stages_count }}
                {{ pl.stages_count === 1 ? "stage" : "stages" }}
              </span>
            </div>

            <!-- Status dot -->
            <span
              class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0"
              :class="resolvePipelineBadge(pl.status)"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="resolvePipelineDot(pl.status)" />
              {{ resolvePipelineLabel(pl.status) }}
            </span>

            <!-- Arrow -->
            <ChevronRight class="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
          </button>
        </div>

        <!-- ── Empty state ──────────────────────────────────────────────────── -->
        <div
          v-else
          class="rounded-xl border border-dashed border-border/60 bg-muted/10 px-6 py-8 flex flex-col items-center gap-3 text-center"
        >
          <div class="h-11 w-11 rounded-xl bg-muted/30 flex items-center justify-center">
            <GitBranch class="h-5 w-5 text-muted-foreground/40" />
          </div>
          <div>
            <p class="text-[13px] font-semibold text-foreground/70">No pipelines yet</p>
            <p class="text-[11px] text-muted-foreground/60 mt-0.5 max-w-[220px] mx-auto leading-relaxed">
              Pipelines define the workflow stages your tasks will move through.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 transition-colors"
            @click="goToAddPipeline"
          >
            <Plus class="h-3.5 w-3.5" />
            Add Pipeline
          </button>
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
  ChevronRight,
  Clock,
  Eye,
  GitBranch,
  ImageIcon,
  Layers,
  Plus,
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

// Shallow route: /projects/:id
const project = computed(() => projectStore.activeProject);

// ── Pipelines from the loaded detail payload ──────────────────────────────────
// These come from project.pipelines (activePipelines relationship in the API).
// Shape: PipelineListResource — { id, name, slug, description, status, stages_count, creator, ... }
const activePipelines = computed(() =>
  Array.isArray((project.value as any)?.pipelines)
    ? (project.value as any).pipelines
    : [],
);

// ── Pipeline status helpers ───────────────────────────────────────────────────
// Status from PipelineListResource is always an object: { value, label, dot, badge, ... }
// But we normalise defensively in case a raw number comes through.

function resolvePipelineLabel(status: any): string {
  if (!status) return "—";
  if (typeof status === "object" && "label" in status) return status.label;
  return String(status);
}

function resolvePipelineDot(status: any): string {
  if (typeof status === "object" && status !== null && "dot" in status) return status.dot;
  return "bg-muted-foreground";
}

function resolvePipelineBadge(status: any): string {
  if (typeof status === "object" && status !== null && "badge" in status) return status.badge;
  return "";
}

// ── Safe field extractors (for project status / visibility) ───────────────────

function extractValue(field: unknown): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "value" in field)
    return String((field as { value: unknown }).value);
  return "";
}

function extractLabel(
  field: unknown,
  storeList: Array<{ value: string; label: string }>,
): string {
  if (!field) return "—";
  if (typeof field === "object" && field !== null && "label" in field)
    return String((field as { label: unknown }).label);
  const raw   = typeof field === "string" ? field : extractValue(field);
  if (!raw) return "—";
  const found = storeList.find((s) => s.value === raw);
  if (found) return found.label;
  return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ");
}

const rawStatusValue     = computed(() => extractValue(project.value?.status));
const rawVisibilityValue = computed(() => extractValue(project.value?.visibility));

const currentStatusObj = computed(() =>
  projectStore.statuses.find((s) => s.value === rawStatusValue.value),
);

const statusLabel = computed<string>(() =>
  extractLabel(project.value?.status, projectStore.statuses),
);

const visibilityLabel = computed<string>(() =>
  extractLabel(project.value?.visibility, projectStore.visibilities),
);

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
    label:   project.value?.workspace?.name ?? "Workspace",
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

// ── Actions ───────────────────────────────────────────────────────────────────
const actions = computed<ActionButton[]>(() => [
  { id: "refresh", label: "Refresh", icon: RefreshCcw, onClick: handleRefresh },
  { id: "edit",    label: "Edit",    icon: SquarePen,  onClick: handleEdit },
  {
    id:      "delete",
    label:   "Delete",
    icon:    Trash2,
    variant: "destructive",
    onClick: () => { deleteModalOpen.value = true; },
  },
]);

// ── Meta sidebar fields ───────────────────────────────────────────────────────
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

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
    label: "Pipelines",
    value: project.value
      ? `${(project.value as any).active_pipelines_count ?? activePipelines.value.length} active`
      : "—",
    icon: GitBranch,
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
  if (!id || isNaN(id)) { router.push({ name: "workspace" }); return; }
  await Promise.all([
    projectStore.fetchStatuses(),
    projectStore.fetchVisibilities(),
    projectStore.fetchProject(id),
  ]);
});

// ── Navigation helpers ────────────────────────────────────────────────────────
function goToPipeline(pipelineId: number) {
  router.push({ name: "pipeline-detail", params: { id: pipelineId } });
}

function goToPipelineIndex() {
  if (project.value?.id) {
    router.push({ name: "pipeline-index", params: { projectId: project.value.id } });
  }
}

function goToAddPipeline() {
  if (project.value?.id) {
    router.push({ name: "pipeline-add", params: { projectId: project.value.id } });
  }
}

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
    notify.success("Project deleted", `"${deletedName}" was removed successfully.`, {
      position: "bottom-right",
    });
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