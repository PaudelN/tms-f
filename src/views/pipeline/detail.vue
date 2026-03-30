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
      <!-- Media  -->
      <EntityMediaCover
        v-if="pipeline"
        :morph-type="'pipelines'"
        :morph-id="pipeline.id"
        tag="cover"
        label="Cover"
        filter-type="image"
      />
      <!-- Description -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <AlignLeft class="h-3.5 w-3.5 text-muted-foreground" />
          <h2
            class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
          >
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

      <!-- Stages list -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Layers class="h-3.5 w-3.5 text-muted-foreground" />
            <h2
              class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
            >
              Stages
            </h2>
            <span
              v-if="pipeline?.stages_count"
              class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {{ pipeline.stages_count }}
            </span>
          </div>
          <!-- View all → stage index -->
          <button
            v-if="pipeline?.stages_count && pipeline.stages_count > 0"
            type="button"
            class="text-[11px] font-semibold text-primary hover:underline underline-offset-2 transition-colors"
            @click="goToStages"
          >
            View all
          </button>
        </div>

        <!-- Populated list — up to 5 stages shown inline -->
        <template v-if="pipeline?.stages && pipeline.stages.length > 0">
          <div class="space-y-1.5">
            <div
              v-for="stage in pipeline.stages.slice(0, 5)"
              :key="stage.id"
              class="group flex items-center gap-3 rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 cursor-pointer hover:bg-muted/30 hover:border-border/70 transition-all duration-150"
              @click="goToStage(stage.id)"
            >
              <!-- Color swatch -->
              <div
                class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border border-border/30"
                :style="stage.color ? `background:${stage.color}22` : undefined"
                :class="!stage.color ? 'bg-muted' : ''"
              >
                <span
                  class="text-[11px] font-bold"
                  :style="stage.color ? `color:${stage.color}` : undefined"
                  :class="!stage.color ? 'text-muted-foreground' : ''"
                >
                  {{ stage.display_label.charAt(0).toUpperCase() }}
                </span>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-foreground truncate">
                  {{ stage.display_label }}
                </p>
                <p class="text-[10px] text-muted-foreground font-mono truncate">
                  order: {{ stage.display_order }}
                  <span v-if="stage.wip_limit">
                    · WIP: {{ stage.wip_limit }}</span
                  >
                </p>
              </div>

              <!-- Status badge -->
              <span
                class="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0"
                :class="stage.status.badge"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="stage.status.dot"
                />
                {{ stage.status.label }}
              </span>

              <!-- Chevron hint -->
              <ChevronRight
                class="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors"
              />
            </div>
          </div>

          <!-- Overflow hint when more than 5 stages exist -->
          <button
            v-if="(pipeline?.stages_count ?? 0) > 5"
            type="button"
            class="w-full text-center text-[11px] font-medium text-muted-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-muted/20 transition-colors"
            @click="goToStages"
          >
            + {{ (pipeline.stages_count ?? 0) - 5 }} more stages — view all
          </button>
        </template>

        <!-- Empty state CTA -->
        <template v-else>
          <div
            class="rounded-lg border border-dashed border-border/60 bg-muted/10 px-4 py-6 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-muted/20 transition-colors"
            @click="goToAddStage"
          >
            <Layers class="h-7 w-7 text-muted-foreground/25" />
            <p class="text-[12px] font-medium text-muted-foreground/50">
              No stages yet
            </p>
            <p class="text-[11px] text-muted-foreground/40">
              Click to add the first stage to this pipeline.
            </p>
          </div>
        </template>
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
    ChevronRight,
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
  import { notify } from "@/helpers/toast";
  import { usePipelineStore } from "@/stores/pipeline";
import EntityMediaCover from "@/components/media/EntityMediaCover.vue";

  const route = useRoute();
  const router = useRouter();
  const pipelineStore = usePipelineStore();

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);

  // Shallow route: /pipelines/:id
  const pipeline = computed(() => pipelineStore.activePipeline);

  // ── Status helpers ─────────────────────────────────────────────────────────────

  function extractStatusValue(status: any): number | null {
    if (status == null) return null;
    if (typeof status === "number") return status;
    return status?.value ?? null;
  }

  function extractStatusLabel(status: any): string {
    if (status == null) return "—";
    if (typeof status === "object" && "label" in status) return status.label;
    const val = extractStatusValue(status);
    const found = pipelineStore.statuses.find((s) => s.value === val);
    return found?.label ?? String(val);
  }

  const currentStatusObj = computed(() => {
    const val = extractStatusValue(pipeline.value?.status);
    return pipelineStore.statuses.find((s) => s.value === val);
  });

  // ── Status badge (header chip) ─────────────────────────────────────────────────

  const statusBadge = computed(() => {
    if (!currentStatusObj.value) return undefined;
    return {
      label: currentStatusObj.value.label,
      dot: currentStatusObj.value.dot,
      class: currentStatusObj.value.badge,
    };
  });

  // ── Breadcrumbs ────────────────────────────────────────────────────────────────

  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const p = pipeline.value;
    return [
      {
        label: "Workspaces",
        onClick: () => router.push({ name: "workspace" }),
      },
      {
        label: p?.project?.workspace?.name ?? "Workspace",
        onClick: () => {
          if (p?.project?.workspace?.id) {
            router.push({
              name: "project-index",
              params: { workspaceId: p.project.workspace.id },
            });
          }
        },
      },
      {
        label: p?.project?.name ?? "Project",
        onClick: () => {
          if (p?.project?.id)
            router.push({
              name: "project-detail",
              params: { id: p.project.id },
            });
        },
      },
      {
        label: "Pipelines",
        onClick: () => {
          if (p?.project?.id)
            router.push({
              name: "pipeline-index",
              params: { projectId: p.project.id },
            });
        },
      },
      { label: p?.name ?? "Pipeline" },
    ];
  });

  // ── Actions ────────────────────────────────────────────────────────────────────

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

  // ── Meta fields ────────────────────────────────────────────────────────────────

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
      avatarData: pipeline.value?.creator
        ? {
            initials: pipeline.value.creator.name.charAt(0).toUpperCase(),
            name: pipeline.value.creator.name,
            sub: pipeline.value.creator.email ?? "",
          }
        : undefined,
    },
    {
      label: "Status",
      type: "badge",
      icon: Radio,
      value: extractStatusLabel(pipeline.value?.status),
      badgeClass: currentStatusObj.value?.badge,
      dot: currentStatusObj.value?.dot,
    },
    {
      label: "Project",
      value: pipeline.value?.project?.name ?? "—",
      icon: FolderKanban,
    },
    {
      label: "Workspace",
      value: pipeline.value?.project?.workspace?.name ?? "—",
      icon: Layers,
    },
    {
      label: "Stages",
      value:
        pipeline.value?.stages_count != null
          ? String(pipeline.value.stages_count)
          : "0",
      icon: Layers,
    },
    {
      label: "Created At",
      value: formatDate(pipeline.value?.created_at),
      icon: CalendarDays,
    },
    {
      label: "Last Updated",
      value: formatDate(pipeline.value?.updated_at),
      icon: Clock,
    },
    {
      label: "Creator ID",
      value: pipeline.value?.creator?.id
        ? `#${pipeline.value.creator.id}`
        : "—",
      icon: User,
    },
  ]);

  // ── Delete dialog ──────────────────────────────────────────────────────────────

  const deleteDialog = {
    title: "Delete Pipeline",
    description: "This action cannot be undone.",
    confirmLabel: "Delete Pipeline",
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────────

  onMounted(async () => {
    const id = Number(route.params.id);
    if (!id || isNaN(id)) {
      router.push({ name: "workspace" });
      return;
    }
    await Promise.all([
      pipelineStore.fetchStatuses(),
      pipelineStore.fetchPipeline(id),
    ]);
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────

  function handleEdit() {
    router.push({ name: "pipeline-edit", params: { id: pipeline.value?.id } });
  }

  async function handleRefresh() {
    const id = Number(route.params.id);
    if (id) await pipelineStore.fetchPipeline(id);
  }

  function goToStages() {
    if (pipeline.value?.id) {
      router.push({
        name: "pipeline-stage-index",
        params: { pipelineId: pipeline.value.id },
      });
    }
  }

  function goToStage(stageId: number) {
    router.push({ name: "pipeline-stage-detail", params: { id: stageId } });
  }

  function goToAddStage() {
    if (pipeline.value?.id) {
      router.push({
        name: "pipeline-stage-add",
        params: { pipelineId: pipeline.value.id },
      });
    }
  }

  async function confirmDelete() {
    if (!pipeline.value) return;
    deleteLoading.value = true;
    try {
      const deletedName = pipeline.value.name;
      const backProjectId = pipeline.value.project_id;
      await pipelineStore.deletePipeline(
        pipeline.value.id,
        pipeline.value.project_id,
      );
      notify.success(
        "Pipeline deleted",
        `"${deletedName}" was removed successfully.`,
        {
          position: "bottom-right",
        },
      );
      router.push({
        name: "pipeline-index",
        params: { projectId: backProjectId },
      });
    } catch {
      notify.error("Delete failed", "We couldn't delete this pipeline.", {
        position: "bottom-right",
      });
    } finally {
      deleteLoading.value = false;
    }
  }
</script>
