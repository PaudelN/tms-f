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
    <template #content>
      <!-- ── Cover ──────────────────────────────────────────────────────── -->
      <EntityMediaCover
        morph-type="projects"
        :morph-id="projectId"
        tag="cover"
        label="Cover"
        filter-type="image"
      />

      <!-- ── Description ────────────────────────────────────────────────── -->
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

    <!-- ── Pipelines tab ─────────────────────────────────────────────────── -->
    <template #tab-pipelines>
      <div class="h-full flex flex-col">
        <UiList
          v-if="pipelinesTabActivated"
          bare
          disable-row-click
          list-id="project-pipelines"
          :fetch-fn="pipelinesFetchFn"
          :features="pipelinesFeatures"
          item-key="id"
          class="h-full"
          @row-click="(pl) => goToPipeline(pl.id)"
        >
          <template #item-summary="{ item: pl }">
            <div class="flex items-center gap-3 min-w-0">
              <div class="min-w-0 flex-1">
                <p
                  class="text-[13px] font-semibold text-foreground truncate leading-tight"
                >
                  {{ pl.name }}
                </p>
                <p
                  v-if="pl.description"
                  class="text-[11px] text-muted-foreground/70 truncate mt-0.5"
                >
                  {{ pl.description }}
                </p>
              </div>
              <div
                v-if="pl.stages_count != null"
                class="hidden sm:flex items-center gap-1 shrink-0"
              >
                <Layers class="h-3 w-3 text-muted-foreground/40" />
                <span class="text-[11px] text-muted-foreground/60 tabular-nums">
                  {{ pl.stages_count }}
                  {{ pl.stages_count === 1 ? "stage" : "stages" }}
                </span>
              </div>
              <Badge :color="getDotColor(pl.status?.dot ?? '')">
                {{ resolvePipelineLabel(pl.status) }}
              </Badge>
            </div>
          </template>
        </UiList>
        <div class="pt-3 flex justify-end">
          <Button
            type="button"
            variant="header"
            size="sm"
            class="text-xs font-medium hover:bg-violet-200"
            @click="goToAllPipelines"
          >
            Explore Boards
          </Button>
        </div>
      </div>
    </template>

    <template #delete-body>
      <span>
        <strong class="font-semibold">{{ project?.name }}</strong> and all its
        pipelines and tasks will be permanently removed.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
  import type {
    ActionButton,
    BreadcrumbItem,
    MetaField,
    TabItem,
  } from "@/components/common/UiDetail.vue";
  import UiDetail from "@/components/common/UiDetail.vue";
  import { EntityMediaCover } from "@/components/media";
  import Badge from "@/components/ui/badge/Badge.vue";
  import Button from "@/components/ui/button/Button.vue";
  import { useDotColor } from "@/composables/useDotColor";
  import { notify } from "@/helpers/toast";
  import { useProjectStore } from "@/stores/project";
  import UiList from "@/ui-table/UiList.vue";
  import type { ListFeatures } from "@/ui-table/types/list.types";
  import type { UniversalFetchParams } from "@/ui-table/types/universal.types";
  import {
    AlignLeft,
    CalendarDays,
    Clock,
    Columns3,
    Eye,
    Layers,
    RefreshCcw,
    SquarePen,
    Trash2,
  } from "lucide-vue-next";
  import { computed, defineComponent, h, onMounted, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";

  // ── Inline helper ─────────────────────────────────────────────────────────────

  const SectionHeader = defineComponent({
    props: { icon: Object, label: String },
    setup(props) {
      return () =>
        h("div", { class: "flex items-center gap-2" }, [
          h(props.icon as any, {
            class: "h-3.5 w-3.5 text-muted-foreground/50",
          }),
          h(
            "h2",
            {
              class:
                "text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/60 select-none",
            },
            props.label,
          ),
        ]);
    },
  });

  // ── Setup ─────────────────────────────────────────────────────────────────────

  const { getDotColor } = useDotColor();
  const route = useRoute();
  const router = useRouter();
  const projectStore = useProjectStore();

  const projectId = computed<number | null>(() => {
    const id = Number(route.params.id);
    return !isNaN(id) && id > 0 ? id : null;
  });

  // ── Pipelines tab ─────────────────────────────────────────────────────────────

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const pipelinesTabActivated = ref(false);
  let pipelinesFetchDone = false;

  const project = computed(() => projectStore.activeProject);
  const activePipelines = computed<any[]>(() =>
    Array.isArray((project.value as any)?.pipelines)
      ? (project.value as any).pipelines
      : [],
  );

  async function pipelinesFetchFn(params: UniversalFetchParams) {
    if (!pipelinesFetchDone) {
      pipelinesFetchDone = true;
      if (activePipelines.value.length === 0 && projectId.value)
        await projectStore.fetchProject(projectId.value);
    }
    let rows: any[] = activePipelines.value.map((pl: any) => ({
      ...pl,
      _statusLabel: resolvePipelineLabel(pl.status),
    }));
    if (params?.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (pl) =>
          pl.name?.toLowerCase().includes(q) ||
          pl.description?.toLowerCase().includes(q) ||
          pl._statusLabel?.toLowerCase().includes(q),
      );
    }
    if (params?.sortBy) {
      const { sortBy: key, sortOrder: order = "asc" } = params;
      rows = [...rows].sort((a, b) => {
        const [va, vb] = [a[key] ?? "", b[key] ?? ""];
        return va < vb
          ? order === "asc"
            ? -1
            : 1
          : va > vb
            ? order === "asc"
              ? 1
              : -1
            : 0;
      });
    }
    return {
      data: rows,
      meta: {
        total: rows.length,
        current_page: 1,
        per_page: rows.length,
        last_page: 1,
      },
    };
  }

  const pipelinesFeatures: ListFeatures = {
    sortOptions: [
      { key: "name", label: "Name" },
      { key: "stages_count", label: "Stages" },
      { key: "_statusLabel", label: "Status" },
    ],
    groupBy: [{ key: "_statusLabel", label: "Status" }],
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────────

  const detailTabs = computed<TabItem[]>(() => [
    {
      id: "pipelines",
      label: "Pipelines",
      icon: Columns3,
      badge:
        (project.value as any)?.active_pipelines_count ??
        (activePipelines.value.length || null),
      flush: true,
    },
  ]);

  function onTabChange(tabId: string) {
    if (tabId === "pipelines" && !pipelinesTabActivated.value)
      pipelinesTabActivated.value = true;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function resolvePipelineLabel(status: any): string {
    if (!status) return "—";
    return typeof status === "object" && "label" in status
      ? status.label
      : String(status);
  }

  function extractValue(field: unknown): string {
    if (!field) return "";
    if (typeof field === "string") return field;
    if (typeof field === "object" && field !== null && "value" in field)
      return String((field as any).value);
    return "";
  }

  function extractLabel(
    field: unknown,
    list: Array<{ value: string; label: string }>,
  ): string {
    if (!field) return "—";
    if (typeof field === "object" && field !== null && "label" in field)
      return String((field as any).label);
    const raw = typeof field === "string" ? field : extractValue(field);
    if (!raw) return "—";
    const found = list.find((s) => s.value === raw);
    return found
      ? found.label
      : raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ");
  }

  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ── Computed display ──────────────────────────────────────────────────────────

  const rawStatusValue = computed(() => extractValue(project.value?.status));
  const currentStatusObj = computed(() =>
    projectStore.statuses.find((s) => s.value === rawStatusValue.value),
  );
  const visibilityLabel = computed(() =>
    extractLabel(project.value?.visibility, projectStore.visibilities),
  );

  const statusBadge = computed(() =>
    currentStatusObj.value
      ? {
          label: currentStatusObj.value.label,
          dot: currentStatusObj.value.dot,
          class: currentStatusObj.value.badge,
        }
      : undefined,
  );

  const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: "Workspaces", onClick: () => router.push({ name: "workspace" }) },
    {
      label: project.value?.workspace?.name ?? "Workspace",
      onClick: () => {
        if (project.value?.workspace_id)
          router.push({
            name: "project-index",
            params: { workspaceId: project.value.workspace_id },
          });
      },
    },
    { label: project.value?.name ?? "Project" },
  ]);

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

  const metaFields = computed<MetaField[]>(() => [
    {
      label: "Creator",
      type: "avatar",
      avatarData: project.value?.creator
        ? {
            initials: project.value.creator.name.charAt(0).toUpperCase(),
            name: project.value.creator.name,
            sub: project.value.creator.email,
          }
        : undefined,
    },
    { label: "Visibility", icon: Eye, value: visibilityLabel.value },
    {
      label: "Workspace",
      icon: Layers,
      value: project.value?.workspace?.name ?? "—",
    },
    {
      label: "Pipelines",
      icon: Columns3,
      value: project.value
        ? `${(project.value as any).active_pipelines_count ?? activePipelines.value.length} active`
        : "—",
    },
    {
      label: "Start Date",
      icon: CalendarDays,
      value: formatDate(project.value?.start_date),
    },
    {
      label: "End Date",
      icon: CalendarDays,
      value: formatDate(project.value?.end_date),
    },
    {
      label: "Created At",
      icon: CalendarDays,
      value: project.value?.created_at ?? "—",
    },
    {
      label: "Last Updated",
      icon: Clock,
      value: project.value?.updated_at ?? "—",
    },
  ]);

  const deleteDialog = {
    title: "Delete Project",
    description: "This action cannot be undone.",
    confirmLabel: "Delete Project",
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  onMounted(async () => {
    if (!projectId.value) {
      router.push({ name: "workspace" });
      return;
    }
    await Promise.all([
      projectStore.fetchStatuses(),
      projectStore.fetchVisibilities(),
      projectStore.fetchProject(projectId.value),
    ]);
  });

  watch(projectId, (id) => {
    if (id) {
      pipelinesFetchDone = false;
      projectStore.fetchProject(id);
    }
  });

  // ── Navigation / CRUD ─────────────────────────────────────────────────────────

  function goToPipeline(id: number) {
    router.push({ name: "pipeline-detail", params: { id } });
  }
  function goToAllPipelines() {
    router.push({
      name: "pipeline-index",
      params: { projectId: project.value?.id },
    });
  }
  function handleEdit() {
    router.push({ name: "project-edit", params: { id: project.value?.id } });
  }

  async function handleRefresh() {
    if (!projectId.value) return;
    pipelinesFetchDone = false;
    await projectStore.fetchProject(projectId.value);
  }

  async function confirmDelete() {
    if (!project.value) return;
    deleteLoading.value = true;
    try {
      const { name, workspace_id: wsId } = project.value;
      await projectStore.deleteProject(project.value.id, wsId);
      notify.success("Project deleted", `"${name}" was removed successfully.`, {
        position: "bottom-right",
      });
      router.push({ name: "project-index", params: { workspaceId: wsId } });
    } catch {
      notify.error("Delete failed", "We couldn't delete this project.", {
        position: "bottom-right",
      });
    } finally {
      deleteLoading.value = false;
    }
  }
</script>
