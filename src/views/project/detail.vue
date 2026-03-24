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
      <div class="space-y-2.5">
        <SectionHeader :icon="ImageIcon" label="Cover" />
        <div
          class="rounded-lg border border-dashed border-border/60 bg-muted/10 h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/20 hover:border-primary/30 transition-all duration-200 group"
        >
          <ImageIcon
            class="h-7 w-7 opacity-20 group-hover:opacity-35 transition-opacity"
          />
          <p
            class="text-[11px] font-medium opacity-40 group-hover:opacity-55 transition-opacity"
          >
            Click to upload a cover image
          </p>
          <div></div>
        </div>
      </div>

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
         Pipelines tab — UiList fills the flush panel.
         fetchFn reads from the store; if pipelines aren't loaded yet it
         calls fetchProject once, then works client-side from then on.
    ──────────────────────────────────────────────────────────────────────── -->
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
          <!-- ── Row summary ────────────────────────────────────────────── -->
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

    <!-- Delete body (unchanged) -->
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

  // ── UiList — same import paths as the project index page ──────────────────
  import UiList from "@/ui-table/UiList.vue";
  import type { ListFeatures } from "@/ui-table/types/list.types";
  // UniversalFetchParams is the canonical arg type for every fetchFn in this codebase.
  // Its sort fields are `sortBy: string` and `sortOrder: 'asc'|'desc'` — NOT sort.key / sort.order.
  import type { UniversalFetchParams } from "@/ui-table/types/universal.types";

  import { notify } from "@/helpers/toast";

  import Badge from "@/components/ui/badge/Badge.vue";
  import Button from "@/components/ui/button/Button.vue";
  import { useDotColor } from "@/composables/useDotColor";
  import {
    AlignLeft,
    CalendarDays,
    Clock,
    Columns3,
    Eye,
    ImageIcon,
    Layers,
    RefreshCcw,
    SquarePen,
    Trash2,
  } from "lucide-vue-next";

  const { getDotColor } = useDotColor();

  // ── Inline SectionHeader (unchanged) ──────────────────────────────────────
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

  const route = useRoute();
  const router = useRouter();
  const projectStore = useProjectStore();

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);

  // ── Pipeline lazy-mount gate ───────────────────────────────────────────────
  /** UiList is only mounted (v-if) after the user first opens the Pipelines tab. */
  const pipelinesTabActivated = ref(false);

  /**
   * Non-reactive module-level flag.
   * Prevents a second API call when UiList re-invokes the fetchFn for sort /
   * search / its own refresh — once the store has the data we never go back
   * to the network unless the page-level Refresh action resets this flag.
   */
  let pipelinesFetchDone = false;

  // ── UiList fetchFn ─────────────────────────────────────────────────────────
  /**
   * Contract:
   *   arg  → UniversalFetchParams  (sortBy / sortOrder, NOT sort.key / sort.order)
   *   return → { data: T[], meta: { total: number } }  (UniversalApiResponse shape)
   *
   * All client-side; after the initial one-time network call every subsequent
   * UiList operation (sort, search, group, refresh) reads from the Pinia store.
   */
  async function pipelinesFetchFn(params: UniversalFetchParams) {
    // ① One-time lazy fetch — skipped when store already has pipeline data
    if (!pipelinesFetchDone) {
      pipelinesFetchDone = true;
      if (activePipelines.value.length === 0) {
        const id = Number(route.params.id);
        if (id && !isNaN(id)) {
          await projectStore.fetchProject(id);
        }
      }
    }

    // ② Normalise status so groupBy / sortBy can operate on a plain string field
    let rows: any[] = activePipelines.value.map((pl: any) => ({
      ...pl,
      _statusLabel: resolvePipelineLabel(pl.status),
    }));

    // ③ Client-side search — name, description, resolved status label
    if (params?.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (pl) =>
          pl.name?.toLowerCase().includes(q) ||
          pl.description?.toLowerCase().includes(q) ||
          pl._statusLabel?.toLowerCase().includes(q),
      );
    }

    // ④ Client-side sort
    //    UniversalFetchParams exposes `sortBy` (field key) and `sortOrder` ('asc'|'desc').
    //    There is NO `sort.key` / `sort.order` nested object on this type.
    if (params?.sortBy) {
      const key = params.sortBy;
      const order = params.sortOrder ?? "asc";
      rows = [...rows].sort((a, b) => {
        const va = a[key] ?? "";
        const vb = b[key] ?? "";
        if (va < vb) return order === "asc" ? -1 : 1;
        if (va > vb) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    // ⑤ Return the full UniversalApiResponse / UniversalMeta shape.
    //    UniversalMeta requires: total, current_page, per_page, last_page.
    //    This is a client-side result (no real pagination), so we treat the
    //    entire filtered set as a single page.
    const total = rows.length;
    return {
      data: rows,
      meta: {
        total,
        current_page: 1,
        per_page: total,
        last_page: 1,
      },
    };
  }

  // ── UiList features ────────────────────────────────────────────────────────
  const pipelinesFeatures: ListFeatures = {
    sortOptions: [
      { key: "name", label: "Name" },
      { key: "stages_count", label: "Stages" },
      { key: "_statusLabel", label: "Status" },
    ],
    groupBy: [{ key: "_statusLabel", label: "Status" }],
  };

  // ── Tab definitions ────────────────────────────────────────────────────────
  const detailTabs = computed<TabItem[]>(() => [
    {
      id: "pipelines",
      label: "Pipelines",
      icon: Columns3,
      // Count comes from the initial fetchProject; no extra request needed.
      badge:
        (project.value as any)?.active_pipelines_count ??
        (activePipelines.value.length || null),
      // flush:true → UiDetail skips its ScrollArea + padding wrapper so UiList
      // can own the full panel height, sticky header, footer, and scroll.
      flush: true,
    },
  ]);

  // ── Tab change ─────────────────────────────────────────────────────────────
  function onTabChange(tabId: string) {
    if (tabId === "pipelines" && !pipelinesTabActivated.value) {
      pipelinesTabActivated.value = true;
      // fetchFn fires automatically once UiList mounts; no manual call needed.
    }
  }

  // ── Project data ──────────────────────────────────────────────────────────
  const project = computed(() => projectStore.activeProject);

  const activePipelines = computed<any[]>(() =>
    Array.isArray((project.value as any)?.pipelines)
      ? (project.value as any).pipelines
      : [],
  );

  // ── Pipeline status helpers ───────────────────────────────────────────────
  function resolvePipelineLabel(status: any): string {
    if (!status) return "—";
    return typeof status === "object" && "label" in status
      ? status.label
      : String(status);
  }

  // ── Field extractors (unchanged) ──────────────────────────────────────────
  function extractValue(field: unknown): string {
    if (!field) return "";
    if (typeof field === "string") return field;
    if (typeof field === "object" && field !== null && "value" in field)
      return String((field as { value: unknown }).value);
    return "";
  }
  function extractLabel(
    field: unknown,
    list: Array<{ value: string; label: string }>,
  ): string {
    if (!field) return "—";
    if (typeof field === "object" && field !== null && "label" in field)
      return String((field as { label: unknown }).label);
    const raw = typeof field === "string" ? field : extractValue(field);
    if (!raw) return "—";
    const found = list.find((s) => s.value === raw);
    return found
      ? found.label
      : raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ");
  }

  const rawStatusValue = computed(() => extractValue(project.value?.status));
  const currentStatusObj = computed(() =>
    projectStore.statuses.find((s) => s.value === rawStatusValue.value),
  );
  const statusLabel = computed(() =>
    extractLabel(project.value?.status, projectStore.statuses),
  );
  const visibilityLabel = computed(() =>
    extractLabel(project.value?.visibility, projectStore.visibilities),
  );

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusBadge = computed(() => {
    if (!currentStatusObj.value) return undefined;
    return {
      label: currentStatusObj.value.label,
      dot: currentStatusObj.value.dot,
      class: currentStatusObj.value.badge,
    };
  });

  // ── Breadcrumbs ───────────────────────────────────────────────────────────
  const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: "Workspaces", onClick: () => router.push({ name: "workspace" }) },
    {
      label: project.value?.workspace?.name ?? "Workspace",
      onClick: () => {
        if (project.value?.workspace_id) {
          router.push({
            name: "project-index",
            params: { workspaceId: project.value.workspace_id },
          });
        }
      },
    },
    { label: project.value?.name ?? "Project" },
  ]);

  // ── Actions ───────────────────────────────────────────────────────────────
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

  // ── Meta sidebar fields ───────────────────────────────────────────────────
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
      value: project.value?.created_at ? project.value.created_at : "—",
    },
    {
      label: "Last Updated",
      icon: Clock,
      value: project.value?.updated_at ? project.value.updated_at : "—",
    },
  ]);

  // ── Delete dialog config ──────────────────────────────────────────────────
  const deleteDialog = {
    title: "Delete Project",
    description: "This action cannot be undone.",
    confirmLabel: "Delete Project",
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
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

  // ── Navigation ────────────────────────────────────────────────────────────
  function goToPipeline(pipelineId: number) {
    router.push({ name: "pipeline-detail", params: { id: pipelineId } });
  }

  function goToAllPipelines() {
    router.push({
      name: "pipeline-index",
      params: { projectId: project.value?.id },
    });
  }
  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleEdit() {
    router.push({ name: "project-edit", params: { id: project.value?.id } });
  }
  async function handleRefresh() {
    const id = Number(route.params.id);
    if (id) {
      // Reset so the fetchFn re-hits the API on the next UiList call
      pipelinesFetchDone = false;
      await projectStore.fetchProject(id);
    }
  }
  async function confirmDelete() {
    if (!project.value) return;
    deleteLoading.value = true;
    try {
      const name = project.value.name;
      const wsId = project.value.workspace_id;
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
