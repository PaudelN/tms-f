<template>
  <UiDetail
    :loading="pipelineStore.isDetailLoading"
    loading-text="Loading pipeline…"
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
      <!-- Description -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <AlignLeft class="h-3.5 w-3.5 text-muted-foreground" />
          <h2 class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
            Description
          </h2>
        </div>
        <div
          v-if="pipeline?.description"
          class="text-[13px] text-foreground/80 leading-relaxed rounded-lg bg-muted/20 border border-border/40 px-4 py-3.5"
        >
          {{ pipeline.description }}
        </div>
        <div
          v-else
          class="text-[12px] text-muted-foreground/60 italic rounded-lg bg-muted/10 border border-dashed border-border/40 px-4 py-3.5 cursor-pointer hover:bg-muted/20 hover:text-muted-foreground transition-all duration-200"
          @click="handleEdit"
        >
          No description yet — click to add one.
        </div>
      </div>

      <!-- Stages placeholder — coming next phase -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Layers class="h-3.5 w-3.5 text-muted-foreground" />
            <h2 class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
              Stages
            </h2>
            <span
              v-if="pipeline?.stages_count"
              class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {{ pipeline.stages_count }}
            </span>
          </div>
        </div>
        <div class="rounded-lg border border-dashed border-border/60 bg-muted/10 px-4 py-6 flex flex-col items-center gap-2 text-center">
          <Layers class="h-7 w-7 text-muted-foreground/25" />
          <p class="text-[12px] font-medium text-muted-foreground/50">
            Pipeline stages coming soon
          </p>
          <p class="text-[11px] text-muted-foreground/40">
            Stages let you define the steps tasks move through in this pipeline.
          </p>
        </div>
      </div>
    </template>

    <template #delete-body>
      <span>
        <strong class="font-semibold">{{ pipeline?.name }}</strong>
        and all its stages will be permanently removed.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
import {
  AlignLeft,
  CalendarDays,
  Clock,
  FolderKanban,
  Layers,
  Radio,
  RefreshCcw,
  SquarePen,
  Trash2,
  User,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  ActionButton,
  BreadcrumbItem,
  MetaField,
} from "@/components/common/UiDetail.vue";
import UiDetail from "@/components/common/UiDetail.vue";
import { notify }          from "@/helpers/toast";
import { usePipelineStore } from "@/stores/pipeline";

const route         = useRoute();
const router        = useRouter();
const pipelineStore = usePipelineStore();

const deleteModalOpen = ref(false);
const deleteLoading   = ref(false);

// Shallow route: /pipelines/:id
const pipeline = computed(() => pipelineStore.activePipeline);

// ── Status helpers ────────────────────────────────────────────────────────────
// Status may arrive as integer or full object — normalise both shapes.

function extractStatusValue(status: any): number | null {
  if (status == null)             return null;
  if (typeof status === "number") return status;
  return status?.value ?? null;
}

function extractStatusLabel(status: any): string {
  if (status == null) return "—";
  if (typeof status === "object" && "label" in status) return status.label;
  const val   = extractStatusValue(status);
  const found = pipelineStore.statuses.find((s) => s.value === val);
  if (found) return found.label;
  return String(val);
}

const currentStatusObj = computed(() => {
  const val = extractStatusValue(pipeline.value?.status);
  return pipelineStore.statuses.find((s) => s.value === val);
});

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
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const p = pipeline.value;
  return [
    {
      label:   "Workspaces",
      onClick: () => router.push({ name: "workspace" }),
    },
    {
      label:   p?.project?.workspace?.name ?? "Workspace",
      onClick: () => {
        if (p?.project?.workspace?.id) {
          router.push({
            name:   "project-index",
            params: { workspaceId: p.project.workspace.id },
          });
        }
      },
    },
    {
      label:   p?.project?.name ?? "Project",
      onClick: () => {
        if (p?.project?.id) {
          router.push({ name: "project-detail", params: { id: p.project.id } });
        }
      },
    },
    {
      label:   "Pipelines",
      onClick: () => {
        if (p?.project?.id) {
          router.push({ name: "pipeline-index", params: { projectId: p.project.id } });
        }
      },
    },
    { label: p?.name ?? "Pipeline" },
  ];
});

// ── Actions ───────────────────────────────────────────────────────────────────
const actions = computed<ActionButton[]>(() => [
  { id: "refresh", label: "Refresh",  icon: RefreshCcw, onClick: handleRefresh },
  { id: "edit",    label: "Edit",     icon: SquarePen,  onClick: handleEdit },
  {
    id:      "delete",
    label:   "Delete",
    icon:    Trash2,
    variant: "destructive",
    onClick: () => { deleteModalOpen.value = true; },
  },
]);

// ── Meta fields ───────────────────────────────────────────────────────────────
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
    avatarData: pipeline.value?.creator
      ? {
          initials: pipeline.value.creator.name.charAt(0).toUpperCase(),
          name:     pipeline.value.creator.name,
          sub:      pipeline.value.creator.email,
        }
      : undefined,
  },
  {
    label:      "Status",
    type:       "badge",
    icon:       Radio,
    value:      extractStatusLabel(pipeline.value?.status),
    badgeClass: currentStatusObj.value?.badge,
    dot:        currentStatusObj.value?.dot,
  },
  {
    label: "Project",
    value: pipeline.value?.project?.name ?? "—",
    icon:  FolderKanban,
  },
  {
    label: "Workspace",
    value: pipeline.value?.project?.workspace?.name ?? "—",
    icon:  Layers,
  },
  {
    label: "Stages",
    value: pipeline.value?.stages_count != null
      ? String(pipeline.value.stages_count)
      : "0",
    icon: Layers,
  },
  {
    label: "Created At",
    value: formatDate(pipeline.value?.created_at),
    icon:  CalendarDays,
  },
  {
    label: "Last Updated",
    value: formatDate(pipeline.value?.updated_at),
    icon:  Clock,
  },
  {
    label: "Creator ID",
    value: pipeline.value?.creator?.id ? `#${pipeline.value.creator.id}` : "—",
    icon:  User,
  },
]);

// ── Delete dialog ─────────────────────────────────────────────────────────────
const deleteDialog = {
  title:        "Delete Pipeline",
  description:  "This action cannot be undone.",
  confirmLabel: "Delete Pipeline",
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  const id = Number(route.params.id);
  if (!id || isNaN(id)) { router.push({ name: "workspace" }); return; }
  await Promise.all([
    pipelineStore.fetchStatuses(),
    pipelineStore.fetchPipeline(id),
  ]);
});

// ── Handlers ─────────────────────────────────────────────────────────────────
function handleEdit() {
  router.push({ name: "pipeline-edit", params: { id: pipeline.value?.id } });
}

async function handleRefresh() {
  const id = Number(route.params.id);
  if (id) await pipelineStore.fetchPipeline(id);
}

async function confirmDelete() {
  if (!pipeline.value) return;
  deleteLoading.value = true;
  try {
    const deletedName   = pipeline.value.name;
    const backProjectId = pipeline.value.project_id;
    await pipelineStore.deletePipeline(pipeline.value.id, pipeline.value.project_id);
    notify.success("Pipeline deleted", `"${deletedName}" was removed successfully.`, {
      position: "bottom-right",
    });
    router.push({ name: "pipeline-index", params: { projectId: backProjectId } });
  } catch {
    notify.error("Delete failed", "We couldn't delete this pipeline.", {
      position: "bottom-right",
    });
  } finally {
    deleteLoading.value = false;
  }
}
</script>