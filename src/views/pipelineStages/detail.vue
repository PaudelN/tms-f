<template>
  <UiDetail
    :loading="stageStore.isDetailLoading"
    loading-text="Loading stage…"
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
      <!-- Color swatch + slug -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <Palette class="h-3.5 w-3.5 text-muted-foreground" />
          <h2
            class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
          >
            Stage Identity
          </h2>
        </div>
        <div
          class="rounded-lg border border-border/40 bg-muted/10 px-4 py-3.5 flex items-center gap-4"
        >
          <div
            class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-border/40"
            :style="stage?.color ? `background:${stage.color}22` : undefined"
            :class="!stage?.color ? 'bg-muted' : ''"
          >
            <span
              class="text-sm font-bold"
              :style="stage?.color ? `color:${stage.color}` : undefined"
              :class="!stage?.color ? 'text-muted-foreground' : ''"
            >
              {{ stage?.display_label?.charAt(0).toUpperCase() ?? "?" }}
            </span>
          </div>
          <div class="space-y-1 min-w-0">
            <p class="text-[13px] font-semibold text-foreground truncate">
              {{ stage?.display_label }}
            </p>
            <p class="text-[11px] font-mono text-muted-foreground truncate">
              slug: {{ stage?.slug }}
            </p>
            <div v-if="stage?.color" class="flex items-center gap-1.5">
              <span
                class="h-3 w-3 rounded-full border border-border/60"
                :style="`background:${stage.color}`"
              />
              <span class="text-[11px] font-mono text-muted-foreground">{{
                stage.color
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- WIP Info -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <Hash class="h-3.5 w-3.5 text-muted-foreground" />
          <h2
            class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
          >
            WIP Limit
          </h2>
        </div>
        <div class="rounded-lg border border-border/40 bg-muted/10 px-4 py-3.5">
          <p v-if="stage?.has_wip_limit" class="text-[13px] text-foreground">
            Max
            <span class="font-bold tabular-nums">{{ stage.wip_limit }}</span>
            tasks allowed in this stage at once.
          </p>
          <p v-else class="text-[12px] text-muted-foreground/60 italic">
            No WIP limit — unlimited tasks can be in this stage.
          </p>
        </div>
      </div>

      <!-- Tasks placeholder -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <CheckSquare class="h-3.5 w-3.5 text-muted-foreground" />
          <h2
            class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
          >
            Tasks
          </h2>
        </div>
        <div
          class="rounded-lg border border-dashed border-border/60 bg-muted/10 px-4 py-6 flex flex-col items-center gap-2 text-center"
        >
          <CheckSquare class="h-7 w-7 text-muted-foreground/25" />
          <p class="text-[12px] font-medium text-muted-foreground/50">
            Tasks coming soon
          </p>
          <p class="text-[11px] text-muted-foreground/40">
            Tasks assigned to this stage will appear here.
          </p>
        </div>
      </div>
    </template>

    <template #activity>
      <ActivityPanel
        v-if="pipelineStage?.id"
        entity-type="pipeline_stages"
        :entity-id="pipelineStage.id"
      />
    </template>

    <template #delete-body>
      <span>
        <strong class="font-semibold">{{ stage?.display_label }}</strong>
        and all its tasks will be permanently removed.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
  import {
    ArrowUpDown,
    CalendarDays,
    CheckSquare,
    Clock,
    FolderKanban,
    Hash,
    Layers,
    Palette,
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
  import { notify } from "@/helpers/toast";
  import { usePipelineStageStore } from "@/stores/pipelineStages";
import ActivityPanel from "@/components/activity/ActivityPanel.vue";

  const route = useRoute();
  const router = useRouter();
  const stageStore = usePipelineStageStore();
  const pipelineStage = computed(() => stageStore.activeStage);

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);

  const stage = computed(() => stageStore.activeStage);

  // ── Status helpers ────────────────────────────────────────────────────────────
  function extractStatusValue(status: any): number | null {
    if (status == null) return null;
    if (typeof status === "number") return status;
    return status?.value ?? null;
  }

  function extractStatusLabel(status: any): string {
    if (status == null) return "—";
    if (typeof status === "object" && "label" in status) return status.label;
    const val = extractStatusValue(status);
    const found = stageStore.statuses.find((s) => s.value === val);
    return found?.label ?? String(val);
  }

  const currentStatusObj = computed(() => {
    const val = extractStatusValue(stage.value?.status);
    return stageStore.statuses.find((s) => s.value === val);
  });

  const statusBadge = computed(() => {
    if (!currentStatusObj.value) return undefined;
    return {
      label: currentStatusObj.value.label,
      dot: currentStatusObj.value.dot,
      class: currentStatusObj.value.badge,
    };
  });

  // ── Breadcrumbs ───────────────────────────────────────────────────────────────
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const s = stage.value;
    return [
      {
        label: "Workspaces",
        onClick: () => router.push({ name: "workspace" }),
      },
      {
        label: s?.pipeline?.project?.workspace?.name ?? "Workspace",
        onClick: () => {
          const wsId = s?.pipeline?.project?.workspace?.id;
          if (wsId)
            router.push({
              name: "project-index",
              params: { workspaceId: wsId },
            });
        },
      },
      {
        label: s?.pipeline?.project?.name ?? "Project",
        onClick: () => {
          const pId = s?.pipeline?.project?.id;
          if (pId) router.push({ name: "project-detail", params: { id: pId } });
        },
      },
      {
        label: "Pipelines",
        onClick: () => {
          const pId = s?.pipeline?.project?.id;
          if (pId)
            router.push({ name: "pipeline-index", params: { projectId: pId } });
        },
      },
      {
        label: s?.pipeline?.name ?? "Pipeline",
        onClick: () => {
          if (s?.pipeline?.id)
            router.push({
              name: "pipeline-detail",
              params: { id: s.pipeline.id },
            });
        },
      },
      {
        label: "Stages",
        onClick: () => {
          if (s?.pipeline_id)
            router.push({
              name: "pipeline-stage-index",
              params: { pipelineId: s.pipeline_id },
            });
        },
      },
      { label: s?.display_label ?? "Stage" },
    ];
  });

  // ── Actions ───────────────────────────────────────────────────────────────────
  const actions = computed<ActionButton[]>(() => [
    {
      id: "refresh",
      label: "Refresh",
      icon: RefreshCcw,
      onClick: handleRefresh,
    },
    { id: "edit", label: "Edit", icon: SquarePen, onClick: handleEdit },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: () => {
        deleteModalOpen.value = true;
      },
    },
  ]);

  // ── Meta fields ───────────────────────────────────────────────────────────────
  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const metaFields = computed<MetaField[]>(() => [
    {
      label: "Creator",
      type: "avatar",
      avatarData: stage.value?.creator
        ? {
            initials: stage.value.creator.name.charAt(0).toUpperCase(),
            name: stage.value.creator.name,
            sub: stage.value.creator.email ?? "",
          }
        : undefined,
    },
    {
      label: "Status",
      type: "badge",
      icon: Radio,
      value: extractStatusLabel(stage.value?.status),
      badgeClass: currentStatusObj.value?.badge,
      dot: currentStatusObj.value?.dot,
    },
    {
      label: "Pipeline",
      value: stage.value?.pipeline?.name ?? "—",
      icon: Layers,
    },
    {
      label: "Project",
      value: stage.value?.pipeline?.project?.name ?? "—",
      icon: FolderKanban,
    },
    {
      label: "Order",
      value:
        stage.value?.display_order != null
          ? String(stage.value.display_order)
          : "—",
      icon: ArrowUpDown,
    },
    {
      label: "WIP Limit",
      value: stage.value?.has_wip_limit
        ? String(stage.value.wip_limit)
        : "Unlimited",
      icon: Hash,
    },
    {
      label: "Created At",
      value: formatDate(stage.value?.created_at),
      icon: CalendarDays,
    },
    {
      label: "Last Updated",
      value: formatDate(stage.value?.updated_at),
      icon: Clock,
    },
    {
      label: "Creator ID",
      value: stage.value?.creator?.id ? `#${stage.value.creator.id}` : "—",
      icon: User,
    },
  ]);

  // ── Delete dialog ─────────────────────────────────────────────────────────────
  const deleteDialog = {
    title: "Delete Stage",
    description: "This action cannot be undone.",
    confirmLabel: "Delete Stage",
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  onMounted(async () => {
    const id = Number(route.params.id);
    if (!id || isNaN(id)) {
      router.push({ name: "workspace" });
      return;
    }
    await Promise.all([stageStore.fetchStatuses(), stageStore.fetchStage(id)]);
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleEdit() {
    router.push({
      name: "pipeline-stage-edit",
      params: { id: stage.value?.id },
    });
  }

  async function handleRefresh() {
    const id = Number(route.params.id);
    if (id) await stageStore.fetchStage(id);
  }

  async function confirmDelete() {
    if (!stage.value) return;
    deleteLoading.value = true;
    try {
      const deletedName = stage.value.display_label;
      const backPipelineId = stage.value.pipeline_id;
      await stageStore.deleteStage(stage.value.id, stage.value.pipeline_id);
      notify.success(
        "Stage deleted",
        `"${deletedName}" was removed successfully.`,
        {
          position: "bottom-right",
        },
      );
      router.push({
        name: "pipeline-stage-index",
        params: { pipelineId: backPipelineId },
      });
    } catch {
      notify.error("Delete failed", "We couldn't delete this stage.", {
        position: "bottom-right",
      });
    } finally {
      deleteLoading.value = false;
    }
  }
</script>
