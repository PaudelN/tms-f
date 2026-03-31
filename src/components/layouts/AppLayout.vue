<template>
  <TooltipProvider :delay-duration="0">
    <SidebarProvider
      class="h-screen overflow-hidden"
      style="--sidebar-width: 224px; --sidebar-width-icon: 50px"
    >
      <AppSidebar />

      <SidebarInset class="flex flex-col min-w-0 h-screen overflow-hidden">
        <header
          class="bg-sidebar border-b shrink-0 flex h-11 items-center gap-2 px-3 z-20"
          style="box-shadow: 0 1px 0 rgb(var(--color-border) / 0.25)"
        >
          <!-- Left: sidebar toggle + breadcrumb -->
          <div class="flex items-center gap-1.5 min-w-0 flex-1">
            <SidebarTrigger
              class="flex items-center justify-center h-7 w-7 shrink-0 rounded-lg text-muted-foreground/70 transition-colors duration-100 hover:bg-accent hover:text-foreground"
            />

            <nav
              class="flex items-center gap-0.5 min-w-0 flex-nowrap overflow-hidden"
              aria-label="Breadcrumb"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-medium text-muted-foreground/70 cursor-pointer whitespace-nowrap transition-colors duration-100 max-w-[120px] overflow-hidden text-ellipsis hover:bg-accent hover:text-foreground"
                :class="
                  !breadcrumb.project &&
                  !breadcrumb.pipeline &&
                  !breadcrumb.stage
                    ? 'text-foreground font-semibold cursor-default hover:bg-transparent'
                    : ''
                "
                @click="goToWorkspace"
              ></button>

              <template v-if="breadcrumb.project">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-medium text-muted-foreground/70 cursor-pointer whitespace-nowrap transition-colors duration-100 max-w-[120px] overflow-hidden text-ellipsis hover:bg-accent hover:text-foreground"
                  :class="
                    !breadcrumb.pipeline && !breadcrumb.stage
                      ? 'text-foreground font-semibold cursor-default hover:bg-transparent'
                      : ''
                  "
                  @click="goToProject"
                >
                  <span class="truncate max-w-[80px]">{{
                    breadcrumb.project.name
                  }}</span>
                </button>
              </template>

              <template
                v-if="breadcrumb.showPipelinesIndex && !breadcrumb.pipeline"
              >
                <ChevronRight
                  class="h-3 w-3 shrink-0 text-muted-foreground/30"
                />
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-semibold text-foreground cursor-default whitespace-nowrap"
                  >Boards</span
                >
              </template>

              <template v-if="breadcrumb.pipeline">
                <ChevronRight
                  class="h-3 w-3 shrink-0 text-muted-foreground/30"
                />
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-medium text-muted-foreground/70 cursor-pointer whitespace-nowrap transition-colors duration-100 max-w-[120px] overflow-hidden text-ellipsis hover:bg-accent hover:text-foreground"
                  :class="
                    !breadcrumb.stage
                      ? 'text-foreground font-semibold cursor-default hover:bg-transparent'
                      : ''
                  "
                  @click="goToPipeline"
                >
                  <span class="truncate max-w-[80px]">{{
                    breadcrumb.pipeline.name
                  }}</span>
                </button>
              </template>

              <template v-if="breadcrumb.stage">
                <ChevronRight
                  class="h-3 w-3 shrink-0 text-muted-foreground/30"
                />
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-semibold text-foreground cursor-default whitespace-nowrap"
                >
                  <span
                    v-if="breadcrumb.stage.color"
                    class="h-1.5 w-1.5 rounded-full shrink-0"
                    :style="`background:${breadcrumb.stage.color}`"
                  />
                  <span class="max-w-[80px] truncate">{{
                    breadcrumb.stage.displayLabel
                  }}</span>
                </span>
              </template>

              <template v-if="breadcrumb.addLabel">
                <ChevronRight
                  class="h-3 w-3 shrink-0 text-muted-foreground/30"
                />
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-semibold text-foreground cursor-default whitespace-nowrap"
                  >{{ breadcrumb.addLabel }}</span
                >
              </template>
            </nav>
          </div>

          <!-- Center: search -->
          <div
            class="hidden md:flex items-center gap-2 h-7 rounded-[9px] px-2.5 w-52 cursor-text bg-muted/50 border border-border/40 transition-[border-color,background] duration-150 focus-within:border-primary/40 focus-within:bg-background"
          >
            <IconSearch class="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            <input
              placeholder="Search…"
              class="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <kbd
              class="hidden sm:block text-[9px] font-bold text-muted-foreground/30"
              >⌘K</kbd
            >
          </div>

          <!-- Right -->
          <div class="flex items-center gap-1 shrink-0">
            <!-- Pipeline view tabs -->
            <div
              v-if="contextNav.show"
              class="hidden sm:flex items-center gap-px bg-muted/60 border border-border/40 rounded-[9px] p-0.5 mr-1"
            >
              <button
                v-for="item in contextNav.items"
                :key="item.label"
                type="button"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] text-[11.5px] font-medium text-muted-foreground transition-all duration-150 cursor-pointer hover:text-foreground"
                :class="
                  item.active
                    ? 'bg-background text-foreground shadow-[0_1px_3px_rgb(0_0_0/0.06)]'
                    : ''
                "
                @click="item.onClick"
              >
                <component :is="item.icon" class="h-3 w-3 shrink-0" />
                {{ item.label }}
              </button>
            </div>

            <!-- Theme toggle -->
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  type="button"
                  class="inline-flex items-center justify-center h-7 min-w-7 rounded-lg text-muted-foreground/70 bg-transparent cursor-pointer transition-colors duration-100 relative hover:bg-accent hover:text-foreground"
                  @click="toggleMode"
                >
                  <IconSun v-if="isDark" class="h-3.5 w-3.5" />
                  <IconMoon v-else class="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent class="text-xs">{{
                isDark ? "Light mode" : "Dark mode"
              }}</TooltipContent>
            </Tooltip>

            <!-- Notifications -->
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  type="button"
                  class="inline-flex items-center justify-center h-7 min-w-7 rounded-lg text-muted-foreground/70 bg-transparent cursor-pointer transition-colors duration-100 relative hover:bg-accent hover:text-foreground"
                >
                  <IconBell class="h-3.5 w-3.5" />
                  <span
                    class="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent class="text-xs">Notifications</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <div class="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
          <RouterView :key="routeKey" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  </TooltipProvider>
</template>

<script setup lang="ts">
  import { useColorMode } from "@vueuse/core";
  import { ChevronRight } from "lucide-vue-next";
  import { computed, defineComponent, h, onMounted, watch } from "vue";
  import { RouterView, useRoute, useRouter } from "vue-router";

  import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar";
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

  import AppSidebar from "@/components/layouts/AppSidebar.vue";

  import { usePipelineStore } from "@/stores/pipeline";
  import { usePipelineStageStore } from "@/stores/pipelineStages";
  import { useProjectStore } from "@/stores/project";
  import { useWorkspaceStore } from "@/stores/workspace";

  const IconSun = defineComponent({
    render: () =>
      h(
        "svg",
        { width: 14, height: 14, viewBox: "0 0 20 20", fill: "currentColor" },
        [
          h("path", {
            "fill-rule": "evenodd",
            d: "M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm-.464 4.95.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 1.414zm2.12-10.607a1 1 0 0 1 0 1.414l-.706.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM17 11a1 1 0 1 0 0-2h-1a1 1 0 1 0 0 2h1zm-7 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM5.05 6.464A1 1 0 1 0 6.465 5.05l-.708-.707a1 1 0 0 0-1.414 1.414l.707.707zm1.414 8.486-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414zM4 11a1 1 0 1 0 0-2H3a1 1 0 0 0 0 2h1z",
            "clip-rule": "evenodd",
          }),
        ],
      ),
  });
  const IconMoon = defineComponent({
    render: () =>
      h(
        "svg",
        { width: 14, height: 14, viewBox: "0 0 20 20", fill: "currentColor" },
        [
          h("path", {
            d: "M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586z",
          }),
        ],
      ),
  });
  const IconBell = defineComponent({
    render: () =>
      h(
        "svg",
        { width: 14, height: 14, viewBox: "0 0 20 20", fill: "currentColor" },
        [
          h("path", {
            d: "M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zM10 18a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z",
          }),
        ],
      ),
  });
  const IconSearch = defineComponent({
    render: () =>
      h(
        "svg",
        { width: 14, height: 14, viewBox: "0 0 20 20", fill: "currentColor" },
        [
          h("path", {
            "fill-rule": "evenodd",
            d: "M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z",
            "clip-rule": "evenodd",
          }),
        ],
      ),
  });

  const router = useRouter();
  const route = useRoute();
  const workspaceStore = useWorkspaceStore();
  const projectStore = useProjectStore();
  const pipelineStore = usePipelineStore();
  const pipelineStageStore = usePipelineStageStore();

  const mode = useColorMode({
    selector: "html",
    attribute: "class",
    modes: { light: "light", dark: "dark" },
    initialValue: "light",
    storageKey: "theme-mode",
  });
  const isDark = computed(() => mode.value === "dark");
  function toggleMode() {
    mode.value = isDark.value ? "light" : "dark";
  }

  const WS_PALETTE = [
    "#7C3AED",
    "#2563EB",
    "#059669",
    "#D97706",
    "#DC2626",
    "#0891B2",
    "#DB2777",
    "#0F766E",
  ];
  function hashColor(name: string): string {
    let h = 0;
    for (let i = 0; i < name.length; i++)
      h = name.charCodeAt(i) + ((h << 5) - h);
    return WS_PALETTE[Math.abs(h) % WS_PALETTE.length];
  }
  const wsAvatarColor = computed(() =>
    workspaceStore.activeWorkspace
      ? hashColor(workspaceStore.activeWorkspace.name)
      : "#7C3AED",
  );

  const routeKey = computed(() => {
    const wsId = route.params.workspaceId;
    const ws = Array.isArray(wsId)
      ? wsId[0]
      : (wsId ?? workspaceStore.activeWorkspace?.id ?? "x");
    const projectId = route.params.projectId ?? "";
    const pipelineId = route.params.pipelineId ?? "";
    return `${String(route.name ?? "page")}-ws-${ws}-p-${projectId}-pl-${pipelineId}`;
  });
  const routeName = computed(() => String(route.name ?? ""));

  const breadcrumb = computed(() => {
    const name = routeName.value;
    const pipelineProject = pipelineStore.activePipeline?.project;
    const stageProject = pipelineStageStore.activeStage?.pipeline?.project;
    const rawProjectId = route.params.projectId;
    const directProjectId = rawProjectId
      ? Number(Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId)
      : null;
    const directProject =
      projectStore.activeProject ??
      (directProjectId
        ? (projectStore.projects.find((p) => p.id === directProjectId) ?? null)
        : null);
    const resolvedProject =
      stageProject ?? pipelineProject ?? directProject ?? null;
    const project = resolvedProject
      ? { id: resolvedProject.id, name: resolvedProject.name }
      : null;
    const resolvedPipeline =
      pipelineStageStore.activeStage?.pipeline ??
      pipelineStore.activePipeline ??
      null;
    const pipeline =
      name.startsWith("pipeline") && resolvedPipeline
        ? { id: resolvedPipeline.id, name: resolvedPipeline.name }
        : null;
    const activeStage = pipelineStageStore.activeStage;
    const stage =
      (name === "pipeline-stage-detail" || name === "pipeline-stage-edit") &&
      activeStage
        ? {
            id: activeStage.id,
            displayLabel: activeStage.display_label ?? activeStage.name,
            color: activeStage.color ?? null,
          }
        : null;
    const showPipelinesIndex =
      name === "pipeline-index" || name === "pipeline-add";
    const addLabel = name.includes("add")
      ? name === "workspace-add"
        ? "New Workspace"
        : name === "project-add"
          ? "New Project"
          : name === "pipeline-add"
            ? "New Board"
            : name === "pipeline-stage-add"
              ? "New Stage"
              : name === "task-add"
                ? "New Task"
                : null
      : null;
    return { project, pipeline, stage, showPipelinesIndex, addLabel };
  });

  const contextNav = computed(() => {
    const name = routeName.value;
    const pl = breadcrumb.value.pipeline;
    if (!pl)
      return {
        show: false,
        items: [] as {
          label: string;
          icon: any;
          active: boolean;
          onClick: () => void;
        }[],
      };
    if (
      ["pipeline-detail", "pipeline-edit", "pipeline-index"].includes(name) ||
      name.startsWith("pipeline-stage")
    ) {
      return {
        show: true,
      };
    }
    return { show: false, items: [] };
  });

  function goToWorkspace() {
    if (workspaceStore.activeWorkspace)
      router.push({
        name: "project-index",
        params: { workspaceId: workspaceStore.activeWorkspace.id },
      });
    else router.push({ name: "workspace" });
  }
  function goToProject() {
    const p = breadcrumb.value.project;
    if (p) router.push({ name: "project-detail", params: { id: p.id } });
  }
  function goToPipeline() {
    const pl = breadcrumb.value.pipeline;
    if (pl) router.push({ name: "pipeline-detail", params: { id: pl.id } });
  }

  onMounted(async () => {
    const rawParam = route.params.workspaceId;
    const routeWsId = rawParam
      ? Number(Array.isArray(rawParam) ? rawParam[0] : rawParam)
      : null;
    if (workspaceStore.isPersistedWorkspaceExpired)
      workspaceStore.clearActiveWorkspace();
    const wsId = routeWsId ?? workspaceStore.activeWorkspace?.id ?? null;
    if (wsId) {
      await workspaceStore.fetchWorkspace(wsId).catch(() => {});
      if (
        !routeWsId &&
        workspaceStore.activeWorkspace?.id &&
        route.name === "dashboard"
      )
        router.replace({
          name: "project-index",
          params: { workspaceId: wsId },
        });
    }
  });

  watch(
    () => route.params.workspaceId,
    async (newId) => {
      if (!newId) return;
      const id = Number(Array.isArray(newId) ? newId[0] : newId);
      if (!isNaN(id) && workspaceStore.activeWorkspace?.id !== id)
        await workspaceStore.fetchWorkspace(id).catch(() => {});
    },
  );
</script>
