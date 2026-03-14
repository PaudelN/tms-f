<template>
  <TooltipProvider :delay-duration="0">
    <SidebarProvider>

      <AppSidebar />

      <SidebarInset class="min-w-0 overflow-hidden">

        <!-- ── Top header ───────────────────────────────────────────────── -->
        <header
          class="flex h-11 shrink-0 items-center gap-2 border-b border-border/40 bg-background/98 backdrop-blur-sm px-3 sticky top-0 z-20"
          style="width: 100%"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <SidebarTrigger class="-ml-0.5 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all" />
            <Separator orientation="vertical" class="mr-0.5 data-[orientation=vertical]:h-4 opacity-50" />

            <!-- ── Breadcrumb ── -->
            <Breadcrumb class="min-w-0">
              <BreadcrumbList class="flex-nowrap min-w-0 gap-1">

                <!-- Workspace -->
                <BreadcrumbItem class="min-w-0 shrink-0">
                  <BreadcrumbLink as-child>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 text-[13px] font-medium truncate max-w-[110px] rounded-md px-1.5 py-0.5 transition-all"
                      :class="
                        breadcrumb.project || breadcrumb.pipeline || breadcrumb.stage
                          ? 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer'
                          : 'text-foreground cursor-default'
                      "
                      @click="goToWorkspace"
                    >
                      {{ workspaceStore.activeWorkspace?.name ?? "Workspaces" }}
                    </button>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <!-- Project -->
                <template v-if="breadcrumb.project">
                  <BreadcrumbSeparator class="shrink-0 opacity-30">
                    <ChevronRight class="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem class="min-w-0 shrink-0">
                    <BreadcrumbLink as-child>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 text-[13px] font-medium truncate max-w-[110px] rounded-md px-1.5 py-0.5 transition-all"
                        :class="
                          breadcrumb.pipeline || breadcrumb.stage
                            ? 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer'
                            : 'text-foreground cursor-default'
                        "
                        @click="goToProject"
                      >
                        {{ breadcrumb.project.name }}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </template>

                <!-- Pipelines index leaf -->
                <template v-if="breadcrumb.showPipelinesIndex && !breadcrumb.pipeline">
                  <BreadcrumbSeparator class="shrink-0 opacity-30">
                    <ChevronRight class="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem class="shrink-0">
                    <BreadcrumbPage class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground px-1.5 py-0.5">
                      <GitBranch class="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      Pipelines
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </template>

                <!-- Pipeline -->
                <template v-if="breadcrumb.pipeline">
                  <BreadcrumbSeparator class="shrink-0 opacity-30">
                    <ChevronRight class="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem class="shrink-0">
                    <BreadcrumbLink as-child>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 text-[13px] font-medium truncate max-w-[110px] rounded-md px-1.5 py-0.5 transition-all"
                        :class="
                          breadcrumb.stage
                            ? 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer'
                            : 'text-foreground cursor-default'
                        "
                        @click="goToPipeline"
                      >
                        <GitBranch class="h-3 w-3 shrink-0 opacity-50" />
                        {{ breadcrumb.pipeline.name }}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </template>

                <!-- Stage -->
                <template v-if="breadcrumb.stage">
                  <BreadcrumbSeparator class="shrink-0 opacity-30">
                    <ChevronRight class="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem class="shrink-0">
                    <BreadcrumbPage class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground px-1.5 py-0.5 max-w-[130px] truncate">
                      <span
                        v-if="breadcrumb.stage.color"
                        class="h-2 w-2 rounded-full shrink-0"
                        :style="`background:${breadcrumb.stage.color}`"
                      />
                      <Layers2 v-else class="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      {{ breadcrumb.stage.displayLabel }}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </template>

                <!-- Generic add label -->
                <template v-if="breadcrumb.addLabel && !breadcrumb.project && !breadcrumb.pipeline && !breadcrumb.stage">
                  <BreadcrumbSeparator class="shrink-0 opacity-30">
                    <ChevronRight class="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem class="shrink-0">
                    <BreadcrumbPage class="text-[13px] font-semibold text-foreground px-1.5 py-0.5">
                      {{ breadcrumb.addLabel }}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </template>

              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <!-- ── Right side actions ── -->
          <div class="flex items-center gap-1 shrink-0">

            <!-- Context quick-nav pill — shows on pipeline/stage routes -->
            <div
              v-if="contextNav.show"
              class="hidden sm:flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5 mr-1"
            >
              <button
                v-for="item in contextNav.items"
                :key="item.label"
                type="button"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all"
                :class="item.active
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'"
                @click="item.onClick"
              >
                <component :is="item.icon" class="h-3 w-3 shrink-0" />
                {{ item.label }}
              </button>
            </div>

            <!-- Theme toggle -->
            <button
              type="button"
              class="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              aria-label="Toggle theme"
              @click="toggleMode"
            >
              <Sun v-if="isDark" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </button>

            <div class="w-px h-4 bg-border/60 mx-0.5" />

            <Button
              variant="ghost"
              size="sm"
              class="h-7 px-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              Invite
            </Button>

            <Button
              size="sm"
              class="h-7 px-3 text-[12px] font-semibold gap-1.5 rounded-lg"
              @click="handleNewTask"
            >
              <Plus class="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        </header>

        <!-- ── Page content ─────────────────────────────────────────────── -->
        <div class="flex flex-1 flex-col overflow-hidden min-w-0">
          <RouterView :key="routeKey" />
        </div>

      </SidebarInset>
    </SidebarProvider>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { ChevronRight, GitBranch, Layers2, LayoutList, Moon, Plus, Sun } from "lucide-vue-next";
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useColorMode } from "@vueuse/core";

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button }    from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppSidebar                from "../layouts/AppSidebar.vue";
import { usePipelineStore }      from "@/stores/pipeline";
import { useProjectStore }       from "@/stores/project";
import { useWorkspaceStore }     from "@/stores/workspace";
import { usePipelineStageStore } from "@/stores/pipelineStages";

const router             = useRouter();
const route              = useRoute();
const workspaceStore     = useWorkspaceStore();
const projectStore       = useProjectStore();
const pipelineStore      = usePipelineStore();
const pipelineStageStore = usePipelineStageStore();

// ── Route key ─────────────────────────────────────────────────────────────────
const routeKey = computed(() => {
  const wsParam = route.params.workspaceId;
  const wsId    = Array.isArray(wsParam) ? wsParam[0] : (wsParam ?? workspaceStore.activeWorkspace?.id ?? "default");
  return `ws-${wsId}`;
});

// ── Theme ──────────────────────────────────────────────────────────────────────
const mode = useColorMode({
  selector: "html", attribute: "class",
  modes: { light: "light", dark: "dark" },
  initialValue: "light", storageKey: "theme-mode",
});
const isDark = computed(() => mode.value === "dark");
function toggleMode() { mode.value = isDark.value ? "light" : "dark"; }

// ── Route helpers ──────────────────────────────────────────────────────────────
const routeName = computed(() => String(route.name ?? ""));

function nestedPipelineId(): number | null {
  const raw = route.params.pipelineId;
  const n   = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
  return isNaN(n) || n === 0 ? null : n;
}
function nestedProjectId(): number | null {
  const raw = route.params.projectId;
  const n   = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
  return isNaN(n) || n === 0 ? null : n;
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────────
const breadcrumb = computed(() => {
  const name = routeName.value;

  // Resolve project
  const pipelineProject = pipelineStore.activePipeline?.project;
  const stageProject    = pipelineStageStore.activeStage?.pipeline?.project;
  const directProject   = projectStore.activeProject ?? (() => {
    const pid = nestedProjectId();
    return pid ? projectStore.projects.find(p => p.id === pid) ?? null : null;
  })();
  const resolvedProject = stageProject ?? pipelineProject ?? directProject ?? null;
  const project = resolvedProject ? { id: resolvedProject.id, name: resolvedProject.name } : null;

  // Resolve pipeline
  const activePipeline  = pipelineStore.activePipeline;
  const stagePipeline   = pipelineStageStore.activeStage?.pipeline;
  const pipelineHintId  = nestedPipelineId();
  const resolvedPipeline = stagePipeline ?? activePipeline ?? null;
  const pipeline =
    name.startsWith("pipeline") && resolvedPipeline
      ? { id: resolvedPipeline.id, name: resolvedPipeline.name }
      : name.startsWith("pipeline-stage") && pipelineHintId && !resolvedPipeline
      ? { id: pipelineHintId, name: "Pipeline" }
      : null;

  // Resolve stage
  const activeStage = pipelineStageStore.activeStage;
  const stage =
    (name === "pipeline-stage-detail" || name === "pipeline-stage-edit") && activeStage
      ? { id: activeStage.id, displayLabel: activeStage.display_label ?? activeStage.name, color: activeStage.color ?? null }
      : null;

  const showPipelinesIndex = name === "pipeline-index" || name === "pipeline-add";

  const addLabel = name.includes("add")
    ? name === "workspace-add"      ? "New Workspace"
    : name === "project-add"        ? "New Project"
    : name === "pipeline-add"       ? "New Pipeline"
    : name === "pipeline-stage-add" ? "New Stage"
    : null
    : null;

  return { project, pipeline, stage, showPipelinesIndex, addLabel };
});

// ── Context nav pill ───────────────────────────────────────────────────────────
// Shows a small segmented control in the header when on pipeline-related routes
// so the user can jump between pipeline index ↔ detail without extra clicks.

const contextNav = computed(() => {
  const name = routeName.value;
  const pl   = breadcrumb.value.pipeline;

  if (!pl) return { show: false, items: [] };

  // Pipeline-level context
  if (
    name === "pipeline-detail" ||
    name === "pipeline-edit" ||
    name === "pipeline-index" ||
    name === "pipeline-stage-index" ||
    name === "pipeline-stage-add" ||
    name === "pipeline-stage-detail" ||
    name === "pipeline-stage-edit"
  ) {
    return {
      show: true,
      items: [
        {
          label:  "Stages",
          icon:   LayoutList,
          active: name === "pipeline-index" || name.startsWith("pipeline-stage"),
          onClick: () => router.push({ name: "pipeline-index", params: { pipelineId: pl.id } }),
        },
        {
          label:  "Overview",
          icon:   GitBranch,
          active: name === "pipeline-detail" || name === "pipeline-edit",
          onClick: () => router.push({ name: "pipeline-detail", params: { id: pl.id } }),
        },
      ],
    };
  }

  return { show: false, items: [] };
});

// ── Navigation ─────────────────────────────────────────────────────────────────
function goToWorkspace() {
  if (workspaceStore.activeWorkspace)
    router.push({ name: "project-index", params: { workspaceId: workspaceStore.activeWorkspace.id } });
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

function handleNewTask() {
  // TODO: open task creation modal
}
</script>