<template>
  <UiDetail
    :loading="projectStore.isDetailLoading"
    loading-text="Loading project…"
    :breadcrumbs="breadcrumbs"
    :status-badge="statusBadge"
    :actions="actions"
    :meta-fields="metaFields"
    :meta-default-size="22"
    :tabs="detailTabs"
    :delete-open="deleteModalOpen"
    :delete-loading="deleteLoading"
    :delete-dialog="deleteDialog"
    activity-coming-soon
    @update:delete-open="deleteModalOpen = $event"
    @confirm-delete="confirmDelete"
    @tab-change="onTabChange"
  >
    <!-- ────────────────────────────────────────────────────────────────────
         Detail tab — Cover + Description
    ──────────────────────────────────────────────────────────────────────── -->
    <template #content>
      <!-- Cover -->
      <div class="space-y-2.5">
        <SectionHeader :icon="ImageIcon" label="Cover" />
        <div
          class="rounded-lg border border-dashed border-border/60 bg-muted/10 h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/20 hover:border-primary/30 transition-all duration-200 group"
        >
          <ImageIcon class="h-7 w-7 opacity-20 group-hover:opacity-35 transition-opacity" />
          <p class="text-[11px] font-medium opacity-40 group-hover:opacity-55 transition-opacity">
            Click to upload a cover image
          </p>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-2.5">
        <SectionHeader :icon="AlignLeft" label="Description" />
        <div
          v-if="project?.description"
          class="text-[13px] text-foreground/80 leading-relaxed rounded-lg bg-muted/15 border border-border/40 px-4 py-3.5"
        >
          {{ project.description }}
        </div>
        <div
          v-else
          class="text-[12px] text-muted-foreground/50 italic rounded-lg bg-muted/8 border border-dashed border-border/40 px-4 py-3.5 cursor-pointer hover:bg-muted/15 hover:text-muted-foreground/70 transition-all duration-200"
          @click="handleEdit"
        >
          No description yet — click to add one.
        </div>
      </div>
    </template>

    <!-- ────────────────────────────────────────────────────────────────────
         Pipelines tab — lazy-loaded on first visit
    ──────────────────────────────────────────────────────────────────────── -->
    <template #tab-pipelines>

      <!-- Skeleton while fetching -->
      <template v-if="pipelinesLoading">
        <div class="space-y-2.5">
          <div
            v-for="i in 3"
            :key="i"
            class="h-[62px] rounded-xl border border-border/30 bg-muted/15 animate-pulse"
            :style="`animation-delay: ${i * 80}ms`"
          />
        </div>
      </template>

      <template v-else>
        <!-- Section header row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <SectionHeader :icon="GitBranch" label="Pipelines" />
            <span
              v-if="activePipelines.length > 0"
              class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary leading-none"
            >
              {{ activePipelines.length }} active
            </span>
          </div>
          <button
            v-if="activePipelines.length > 0"
            type="button"
            class="text-[11px] font-medium text-muted-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors"
            @click="goToPipelineIndex"
          >
            View all
          </button>
        </div>

        <!-- Pipeline rows -->
        <div v-if="activePipelines.length > 0" class="space-y-2">
          <button
            v-for="pl in activePipelines"
            :key="pl.id"
            type="button"
            class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-150 group text-left"
            @click="goToPipeline(pl.id)"
          >
            <!-- Icon blob -->
            <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <GitBranch class="h-3.5 w-3.5 text-primary" />
            </div>

            <!-- Name + description -->
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold text-foreground truncate leading-tight">
                {{ pl.name }}
              </p>
              <p v-if="pl.description" class="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                {{ pl.description }}
              </p>
            </div>

            <!-- Stage count -->
            <div v-if="pl.stages_count != null" class="flex items-center gap-1 shrink-0">
              <Layers class="h-3 w-3 text-muted-foreground/40" />
              <span class="text-[11px] text-muted-foreground/60 tabular-nums">
                {{ pl.stages_count }} {{ pl.stages_count === 1 ? "stage" : "stages" }}
              </span>
            </div>

            <!-- Status badge -->
            <span
              class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0"
              :class="resolvePipelineBadge(pl.status)"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="resolvePipelineDot(pl.status)" />
              {{ resolvePipelineLabel(pl.status) }}
            </span>

            <!-- Arrow -->
            <ChevronRight class="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 group-hover:text-primary/50 transition-colors" />
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="rounded-xl border border-dashed border-border/50 bg-muted/8 px-6 py-10 flex flex-col items-center gap-3 text-center"
        >
          <div class="h-11 w-11 rounded-xl bg-muted/40 flex items-center justify-center">
            <GitBranch class="h-5 w-5 text-muted-foreground/30" />
          </div>
          <div>
            <p class="text-[13px] font-semibold text-foreground/60">No pipelines yet</p>
            <p class="text-[11px] text-muted-foreground/50 mt-1 max-w-[220px] mx-auto leading-relaxed">
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
      </template>
    </template>

    <!-- Delete body -->
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
import { computed, defineComponent, h, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  ActionButton,
  BreadcrumbItem,
  MetaField,
  TabItem,
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

// ── Inline SectionHeader helper (avoids creating a separate file) ──────────────
const SectionHeader = defineComponent({
  props: { icon: Object, label: String },
  setup(props) {
    return () =>
      h("div", { class: "flex items-center gap-2" }, [
        h(props.icon as any, { class: "h-3.5 w-3.5 text-muted-foreground/50" }),
        h(
          "h2",
          { class: "text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/60 select-none" },
          props.label,
        ),
      ]);
  },
});

const route        = useRoute();
const router       = useRouter();
const projectStore = useProjectStore();

const deleteModalOpen  = ref(false);
const deleteLoading    = ref(false);

// ── Lazy pipeline fetch ───────────────────────────────────────────────────────
/** true once the Pipelines tab has been visited and data is in the store */
const pipelinesLoaded  = ref(false);
const pipelinesLoading = ref(false);

// ── Tab definitions ───────────────────────────────────────────────────────────
const detailTabs = computed<TabItem[]>(() => [
  {
    id:    "pipelines",
    label: "Pipelines",
    icon:  GitBranch,
    badge: pipelinesLoaded.value
      ? ((project.value as any)?.active_pipelines_count ?? activePipelines.value.length ?? null)
      : null,
  },
]);

// ── Tab change — ONLY place where pipeline fetch is triggered ─────────────────
async function onTabChange(tabId: string) {
  if (tabId !== "pipelines" || pipelinesLoaded.value) return;

  const id = Number(route.params.id);
  if (!id || isNaN(id)) return;

  pipelinesLoading.value = true;
  try {
    // Replace with a dedicated store action (e.g. fetchPipelines) if your API
    // supports a separate endpoint — avoids re-fetching the whole project.
    await projectStore.fetchProject(id);
    pipelinesLoaded.value = true;
  } finally {
    pipelinesLoading.value = false;
  }
}

// ── Project data ──────────────────────────────────────────────────────────────
const project = computed(() => projectStore.activeProject);

const activePipelines = computed(() =>
  Array.isArray((project.value as any)?.pipelines)
    ? (project.value as any).pipelines
    : [],
);

// ── Pipeline status helpers ───────────────────────────────────────────────────
function resolvePipelineLabel(status: any): string {
  if (!status) return "—";
  return typeof status === "object" && "label" in status ? status.label : String(status);
}
function resolvePipelineDot(status: any): string {
  return typeof status === "object" && status !== null && "dot" in status
    ? status.dot
    : "bg-muted-foreground";
}
function resolvePipelineBadge(status: any): string {
  return typeof status === "object" && status !== null && "badge" in status ? status.badge : "";
}

// ── Safe field extractors ─────────────────────────────────────────────────────
function extractValue(field: unknown): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "value" in field)
    return String((field as { value: unknown }).value);
  return "";
}
function extractLabel(field: unknown, list: Array<{ value: string; label: string }>): string {
  if (!field) return "—";
  if (typeof field === "object" && field !== null && "label" in field)
    return String((field as { label: unknown }).label);
  const raw = typeof field === "string" ? field : extractValue(field);
  if (!raw) return "—";
  const found = list.find((s) => s.value === raw);
  return found ? found.label : raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ");
}

const rawStatusValue   = computed(() => extractValue(project.value?.status));
const currentStatusObj = computed(() =>
  projectStore.statuses.find((s) => s.value === rawStatusValue.value),
);
const statusLabel      = computed(() => extractLabel(project.value?.status, projectStore.statuses));
const visibilityLabel  = computed(() => extractLabel(project.value?.visibility, projectStore.visibilities));

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
        router.push({ name: "project-index", params: { workspaceId: project.value.workspace_id } });
      }
    },
  },
  { label: project.value?.name ?? "Project" },
]);

// ── Actions ───────────────────────────────────────────────────────────────────
const actions = computed<ActionButton[]>(() => [
  { id: "refresh", label: "Refresh", icon: RefreshCcw, onClick: handleRefresh },
  { id: "edit",    label: "Edit",    icon: SquarePen,  onClick: handleEdit    },
  {
    id: "delete", label: "Delete", icon: Trash2, variant: "destructive",
    onClick: () => { deleteModalOpen.value = true; },
  },
]);

// ── Meta sidebar fields ───────────────────────────────────────────────────────
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  { label: "Status",     type: "badge", icon: Radio,       value: statusLabel.value,    badgeClass: currentStatusObj.value?.badge, dot: currentStatusObj.value?.dot },
  { label: "Visibility", icon: Eye,     value: visibilityLabel.value },
  { label: "Workspace",  icon: Layers,  value: project.value?.workspace?.name ?? "—" },
  {
    label: "Pipelines",
    icon:  GitBranch,
    value: project.value
      ? `${(project.value as any).active_pipelines_count ?? activePipelines.value.length} active`
      : "—",
  },
  { label: "Start Date",   icon: CalendarDays, value: formatDate(project.value?.start_date)  },
  { label: "End Date",     icon: CalendarDays, value: formatDate(project.value?.end_date)    },
  { label: "Created At",   icon: CalendarDays, value: formatDate(project.value?.created_at) },
  { label: "Last Updated", icon: Clock,        value: formatDate(project.value?.updated_at) },
  { label: "Creator ID",   icon: User,         value: project.value?.creator?.id ? `#${project.value.creator.id}` : "—" },
]);

// ── Delete dialog config ──────────────────────────────────────────────────────
const deleteDialog = {
  title:        "Delete Project",
  description:  "This action cannot be undone.",
  confirmLabel: "Delete Project",
};

// ── Lifecycle — does NOT fetch pipelines ─────────────────────────────────────
onMounted(async () => {
  const id = Number(route.params.id);
  if (!id || isNaN(id)) { router.push({ name: "workspace" }); return; }
  await Promise.all([
    projectStore.fetchStatuses(),
    projectStore.fetchVisibilities(),
    projectStore.fetchProject(id), // core project only — no pipelines yet
  ]);
});

// ── Navigation ────────────────────────────────────────────────────────────────
function goToPipeline(pipelineId: number) {
  router.push({ name: "pipeline-detail", params: { id: pipelineId } });
}
function goToPipelineIndex() {
  if (project.value?.id)
    router.push({ name: "pipeline-index", params: { projectId: project.value.id } });
}
function goToAddPipeline() {
  if (project.value?.id)
    router.push({ name: "pipeline-add", params: { projectId: project.value.id } });
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
    const name = project.value.name;
    const wsId = project.value.workspace_id;
    await projectStore.deleteProject(project.value.id, wsId);
    notify.success("Project deleted", `"${name}" was removed successfully.`, { position: "bottom-right" });
    router.push({ name: "project-index", params: { workspaceId: wsId } });
  } catch {
    notify.error("Delete failed", "We couldn't delete this project.", { position: "bottom-right" });
  } finally {
    deleteLoading.value = false;
  }
}
</script>