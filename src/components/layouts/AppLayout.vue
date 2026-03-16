<template>
  <TooltipProvider :delay-duration="0">
    <!--
      SidebarProvider defaults:
        --sidebar-width:      16rem  (256px) — expanded
        --sidebar-width-icon: 3rem   (48px)  — collapsed icon-only
      We set icon width to 52px to match our nav items.
      Do NOT override --sidebar-width here or expansion breaks.
    -->
    <!--
      h-screen on SidebarProvider sets the root height anchor.
      Every descendant that needs to fill height uses flex + min-h-0.
    -->
    <SidebarProvider class="h-screen overflow-hidden" style="--sidebar-width-icon: 52px;">

      <AppSidebar
        :active-entity-sidebar="activeEntitySidebar"
        @entity-select="handleEntitySelect"
      />

      <!--
        SidebarInset fills the space right of the icon rail.
        flex-row: entity panel + main column sit side-by-side.
        overflow-hidden: children control their own scroll.
      -->
      <SidebarInset class="flex flex-row min-w-0 h-screen overflow-hidden">

        <!-- ── Entity sidebar: Projects ───────────────────────── -->
        <Transition name="es">
          <ProjectSidebar
            v-if="activeEntitySidebar === 'projects'"
            @close="closeEntitySidebar"
          />
        </Transition>

        <!-- ── Entity sidebar: Tasks ──────────────────────────── -->
        <Transition name="es">
          <TaskSidebar
            v-if="activeEntitySidebar === 'tasks'"
            @close="closeEntitySidebar"
          />
        </Transition>

        <!--
          Main column: header (shrink-0) + page (flex-1 min-h-0).
          min-w-0 prevents flex child from overflowing its container.
          overflow-hidden here; the inner page div does its own overflow-auto.
        -->
        <div class="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">

          <!-- ── Header ──────────────────────────────────────── -->
          <header
            class="layout-header flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-3 z-20"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">

              <!-- Sidebar open/close toggle -->
              <SidebarTrigger
                class="h-7 w-7 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              />

              <Separator
                orientation="vertical"
                class="data-[orientation=vertical]:h-4 opacity-30 mx-0.5 shrink-0"
              />

              <!-- Breadcrumb -->
              <nav class="flex items-center gap-1 min-w-0 flex-nowrap overflow-hidden" aria-label="Breadcrumb">

                <button
                  type="button"
                  class="bc-btn"
                  :class="!breadcrumb.project && !breadcrumb.pipeline && !breadcrumb.stage ? 'bc-btn--leaf' : ''"
                  @click="goToWorkspace"
                >
                  <span class="h-2 w-2 rounded-sm shrink-0" :style="{ backgroundColor: wsAvatarColor }" />
                  {{ workspaceStore.activeWorkspace?.name ?? "Workspaces" }}
                </button>

                <template v-if="breadcrumb.project">
                  <ChevronRight class="h-3 w-3 shrink-0 text-border" />
                  <button
                    type="button"
                    class="bc-btn"
                    :class="!breadcrumb.pipeline && !breadcrumb.stage ? 'bc-btn--leaf' : ''"
                    @click="goToProject"
                  >{{ breadcrumb.project.name }}</button>
                </template>

                <template v-if="breadcrumb.showPipelinesIndex && !breadcrumb.pipeline">
                  <ChevronRight class="h-3 w-3 shrink-0 text-border" />
                  <span class="bc-btn bc-btn--leaf">
                    <GitBranch class="h-3 w-3 shrink-0 opacity-60" />
                    Pipelines
                  </span>
                </template>

                <template v-if="breadcrumb.pipeline">
                  <ChevronRight class="h-3 w-3 shrink-0 text-border" />
                  <button
                    type="button"
                    class="bc-btn"
                    :class="!breadcrumb.stage ? 'bc-btn--leaf' : ''"
                    @click="goToPipeline"
                  >
                    <GitBranch class="h-3 w-3 shrink-0 opacity-50" />
                    {{ breadcrumb.pipeline.name }}
                  </button>
                </template>

                <template v-if="breadcrumb.stage">
                  <ChevronRight class="h-3 w-3 shrink-0 text-border" />
                  <span class="bc-btn bc-btn--leaf">
                    <span
                      v-if="breadcrumb.stage.color"
                      class="h-2 w-2 rounded-full shrink-0"
                      :style="`background:${breadcrumb.stage.color}`"
                    />
                    <Layers2 v-else class="h-3 w-3 shrink-0 opacity-50" />
                    <span class="max-w-[100px] truncate">{{ breadcrumb.stage.displayLabel }}</span>
                  </span>
                </template>

                <template v-if="breadcrumb.addLabel">
                  <ChevronRight class="h-3 w-3 shrink-0 text-border" />
                  <span class="bc-btn bc-btn--leaf">{{ breadcrumb.addLabel }}</span>
                </template>

              </nav>
            </div>

            <!-- Right actions -->
            <div class="flex items-center gap-1 shrink-0">

              <!-- Context nav pill (pipeline routes) -->
              <div
                v-if="contextNav.show"
                class="hidden sm:flex items-center gap-px bg-muted rounded-lg p-1 mr-1"
              >
                <button
                  v-for="item in contextNav.items"
                  :key="item.label"
                  type="button"
                  class="flex items-center gap-1.5 rounded-md px-2.5 py-[5px] text-[11.5px] font-medium transition-all duration-150"
                  :class="item.active
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'"
                  @click="item.onClick"
                >
                  <component :is="item.icon" class="h-3 w-3 shrink-0" />
                  {{ item.label }}
                </button>
              </div>

              <div class="w-px h-4 bg-border shrink-0 mx-0.5" />

              <!-- Theme toggle -->
              <button
                type="button"
                class="header-btn"
                :title="isDark ? 'Light mode' : 'Dark mode'"
                @click="toggleMode"
              >
                <Sun v-if="isDark" class="h-3.5 w-3.5" />
                <Moon v-else class="h-3.5 w-3.5" />
              </button>

              <button type="button" class="header-btn px-2.5 text-[12px] font-medium">
                Invite
              </button>

              <button
                type="button"
                class="flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                @click="handleNewTask"
              >
                <Plus class="h-3.5 w-3.5" />
                New Task
              </button>
            </div>
          </header>

          <!--
            Page content: flex-1 means "take all remaining height after the header".
            min-h-0 breaks the default flex min-height:auto so the div can actually
            shrink and scroll — without this, content overflows and looks half-cut.
            overflow-auto lets the page scroll internally.
          -->
          <div class="flex-1 min-h-0 overflow-auto w-full">
            <RouterView :key="routeKey" />
          </div>

        </div>
      </SidebarInset>

    </SidebarProvider>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  ChevronRight, GitBranch, Layers2, LayoutList,
  Moon, Plus, Sun,
} from "lucide-vue-next"
import { computed, onMounted, ref, watch } from "vue"
import { RouterView, useRoute, useRouter } from "vue-router"
import { useColorMode } from "@vueuse/core"

import { Separator }                                         from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger }    from "@/components/ui/sidebar"
import { TooltipProvider }                                   from "@/components/ui/tooltip"

import AppSidebar      from "@/components/layouts/AppSidebar.vue"
import ProjectSidebar  from "@/views/project/common/ProjectSidebar.vue"
import TaskSidebar     from "@/views/task/common/TaskSidebar.vue"

import { usePipelineStore }      from "@/stores/pipeline"
import { usePipelineStageStore } from "@/stores/pipelineStages"
import { useProjectStore }       from "@/stores/project"
import { useWorkspaceStore }     from "@/stores/workspace"

// ── Routing ───────────────────────────────────────────────────────────────────
const router             = useRouter()
const route              = useRoute()
const workspaceStore     = useWorkspaceStore()
const projectStore       = useProjectStore()
const pipelineStore      = usePipelineStore()
const pipelineStageStore = usePipelineStageStore()

// ── Theme ─────────────────────────────────────────────────────────────────────
const mode = useColorMode({
  selector: "html", attribute: "class",
  modes: { light: "light", dark: "dark" },
  initialValue: "light", storageKey: "theme-mode",
})
const isDark = computed(() => mode.value === "dark")
function toggleMode() { mode.value = isDark.value ? "light" : "dark" }

// ── Workspace avatar colour (for breadcrumb pip) ──────────────────────────────
function getWsColor(name: string): string {
  const p = ["#7C3AED","#2563EB","#059669","#D97706","#DC2626","#0891B2","#DB2777","#0F766E"]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return p[Math.abs(h) % p.length]
}
const wsAvatarColor = computed(() =>
  workspaceStore.activeWorkspace ? getWsColor(workspaceStore.activeWorkspace.name) : "#7C3AED"
)

// ── Route key ─────────────────────────────────────────────────────────────────
const routeKey = computed(() => {
  const p = route.params.workspaceId
  return `ws-${Array.isArray(p) ? p[0] : (p ?? workspaceStore.activeWorkspace?.id ?? "x")}`
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function getParam(key: string): number | null {
  const raw = route.params[key]
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return isNaN(n) || n === 0 ? null : n
}

// ── Entity sidebar state ──────────────────────────────────────────────────────
type EntitySidebar = "projects" | "tasks" | null
const activeEntitySidebar = ref<EntitySidebar>(null)

function routeToEntity(name: string): EntitySidebar {
  if (
    name.startsWith("project") ||
    name.startsWith("pipeline") ||
    name.startsWith("stage")
  ) return "projects"
  if (name.startsWith("task")) return "tasks"
  return null
}

function closeEntitySidebar() {
  activeEntitySidebar.value = null
}

// ── Main nav handler ──────────────────────────────────────────────────────────
async function handleEntitySelect(entity: string) {

  switch (entity) {

    // ── Dashboard ──────────────────────────────────────────────────────────────
    case "dashboard":
      activeEntitySidebar.value = null
      router.push({ name: "dashboard" })
      break

    // ── Projects ───────────────────────────────────────────────────────────────
    case "projects":
      // toggle panel open/close; always navigate to project index
      activeEntitySidebar.value =
        activeEntitySidebar.value === "projects" ? null : "projects"
      if (workspaceStore.activeWorkspace) {
        router.push({
          name: "project-index",
          params: { workspaceId: workspaceStore.activeWorkspace.id },
        })
      }
      break

    // ── Pipelines — close entity sidebar + navigate to pipeline list ──────────
    case "pipelines": {
      // Always close whatever entity sidebar was open
      activeEntitySidebar.value = null

      // Resolve a project id from the current route context
      let projectId =
        getParam("projectId") ??
        getParam("id") ??            // project-detail uses :id
        pipelineStore.activePipeline?.project?.id ??
        projectStore.projects[0]?.id ??
        null

      // If we don't have projects yet, load them first
      if (!projectId && workspaceStore.activeWorkspace) {
        try {
          const res = await projectStore.fetchProjects({
            workspaceId: workspaceStore.activeWorkspace.id,
            page: 1, perPage: 100,
          })
          projectStore.projects = res.data ?? []
          projectId = projectStore.projects[0]?.id ?? null
        } catch { /**/ }
      }

      if (projectId) {
        router.push({ name: "pipeline-index", params: { projectId } })
      } else if (workspaceStore.activeWorkspace) {
        router.push({
          name: "project-index",
          params: { workspaceId: workspaceStore.activeWorkspace.id },
        })
      }
      break
    }

    // ── Pipeline Stages — close entity sidebar + navigate to stage list ────────
    case "pipeline-stages": {
      // Always close whatever entity sidebar was open
      activeEntitySidebar.value = null

      // Resolve a pipeline id from the current route context
      let pipelineId =
        getParam("pipelineId") ??
        pipelineStore.activePipeline?.id ??
        null

      // If no pipeline in route/store, try to fetch one from the first project
      if (!pipelineId) {
        let projectId =
          getParam("projectId") ??
          getParam("id") ??
          projectStore.projects[0]?.id ??
          null

        if (!projectId && workspaceStore.activeWorkspace) {
          try {
            const res = await projectStore.fetchProjects({
              workspaceId: workspaceStore.activeWorkspace.id,
              page: 1, perPage: 100,
            })
            projectStore.projects = res.data ?? []
            projectId = projectStore.projects[0]?.id ?? null
          } catch { /**/ }
        }

        if (projectId) {
          try {
            const res = await pipelineStore.fetchPipelines({
              projectId, page: 1, perPage: 50,
              search: "", sortBy: "name", sortOrder: "asc", filters: [],
            })
            pipelineId = (res.data ?? [])[0]?.id ?? null
          } catch { /**/ }
        }
      }

      if (pipelineId) {
        router.push({ name: "pipeline-stage-index", params: { pipelineId } })
      } else if (workspaceStore.activeWorkspace) {
        // Nowhere sensible to go — land on project index as fallback
        router.push({
          name: "project-index",
          params: { workspaceId: workspaceStore.activeWorkspace.id },
        })
      }
      break
    }

    // ── Tasks ──────────────────────────────────────────────────────────────────
    case "tasks":
      activeEntitySidebar.value =
        activeEntitySidebar.value === "tasks" ? null : "tasks"
      {
        const pipelineId =
          getParam("pipelineId") ?? pipelineStore.activePipeline?.id ?? null
        if (pipelineId) {
          router.push({ name: "task-index", params: { pipelineId } })
        }
      }
      break

    case "settings":
      activeEntitySidebar.value = null
      router.push({ name: "dashboard" })
      break
  }
}

// Sync entity sidebar with back-navigation / direct URL
// Pipelines and stages navigate without a panel — only projects and tasks open one.
watch(
  () => route.name,
  (name) => {
    const str = String(name ?? "")
    // Pipeline and stage routes: ensure sidebar is closed
    if (str.startsWith("pipeline") || str.startsWith("stage")) {
      activeEntitySidebar.value = null
      return
    }
    const entity = routeToEntity(str)
    if (entity && activeEntitySidebar.value === null) {
      activeEntitySidebar.value = entity
    }
  },
)

// ── Breadcrumb ─────────────────────────────────────────────────────────────────
const routeName = computed(() => String(route.name ?? ""))

const breadcrumb = computed(() => {
  const name = routeName.value

  // Resolve project
  const pipelineProject  = pipelineStore.activePipeline?.project
  const stageProject     = pipelineStageStore.activeStage?.pipeline?.project
  const rawProjectId     = route.params.projectId
  const directProjectId  = rawProjectId
    ? Number(Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId)
    : null
  const directProject = projectStore.activeProject
    ?? (directProjectId ? projectStore.projects.find(p => p.id === directProjectId) ?? null : null)
  const resolvedProject  = stageProject ?? pipelineProject ?? directProject ?? null
  const project = resolvedProject ? { id: resolvedProject.id, name: resolvedProject.name } : null

  // Resolve pipeline
  const resolvedPipeline =
    pipelineStageStore.activeStage?.pipeline ??
    pipelineStore.activePipeline ??
    null
  const pipeline = name.startsWith("pipeline") && resolvedPipeline
    ? { id: resolvedPipeline.id, name: resolvedPipeline.name }
    : null

  // Resolve stage
  const activeStage = pipelineStageStore.activeStage
  const stage = (name === "pipeline-stage-detail" || name === "pipeline-stage-edit") && activeStage
    ? {
        id: activeStage.id,
        displayLabel: activeStage.display_label ?? activeStage.name,
        color: activeStage.color ?? null,
      }
    : null

  const showPipelinesIndex = name === "pipeline-index" || name === "pipeline-add"

  const addLabel = name.includes("add")
    ? name === "workspace-add"       ? "New Workspace"
    : name === "project-add"         ? "New Project"
    : name === "pipeline-add"        ? "New Pipeline"
    : name === "pipeline-stage-add"  ? "New Stage"
    : name === "task-add"            ? "New Task"
    : null
    : null

  return { project, pipeline, stage, showPipelinesIndex, addLabel }
})

// ── Context nav pill (pipeline routes) ────────────────────────────────────────
const contextNav = computed(() => {
  const name = routeName.value
  const pl   = breadcrumb.value.pipeline
  if (!pl) return { show: false, items: [] as any[] }

  if (
    name === "pipeline-detail" || name === "pipeline-edit" ||
    name === "pipeline-index"  || name.startsWith("pipeline-stage")
  ) {
    return {
      show: true,
      items: [
        {
          label:   "Stages",
          icon:    LayoutList,
          active:  name === "pipeline-index" || name.startsWith("pipeline-stage"),
          onClick: () => router.push({ name: "pipeline-index", params: { pipelineId: pl.id } }),
        },
        {
          label:   "Overview",
          icon:    GitBranch,
          active:  name === "pipeline-detail" || name === "pipeline-edit",
          onClick: () => router.push({ name: "pipeline-detail", params: { id: pl.id } }),
        },
      ],
    }
  }
  return { show: false, items: [] as any[] }
})

// ── Breadcrumb navigation ─────────────────────────────────────────────────────
function goToWorkspace() {
  if (workspaceStore.activeWorkspace)
    router.push({ name: "project-index", params: { workspaceId: workspaceStore.activeWorkspace.id } })
  else router.push({ name: "workspace" })
}
function goToProject() {
  const p = breadcrumb.value.project
  if (p) router.push({ name: "project-detail", params: { id: p.id } })
}
function goToPipeline() {
  const pl = breadcrumb.value.pipeline
  if (pl) router.push({ name: "pipeline-detail", params: { id: pl.id } })
}
function handleNewTask() { /* wire up modal later */ }

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await projectStore.fetchStatuses().catch(() => {})

  const rawParam  = route.params.workspaceId
  const routeWsId = rawParam ? Number(Array.isArray(rawParam) ? rawParam[0] : rawParam) : null

  if (workspaceStore.isPersistedWorkspaceExpired) workspaceStore.clearActiveWorkspace()

  const wsId = routeWsId ?? workspaceStore.activeWorkspace?.id ?? null
  if (wsId) {
    await workspaceStore.fetchWorkspace(wsId).catch(() => {})
    if (!routeWsId && workspaceStore.activeWorkspace?.id && route.name === "dashboard")
      router.replace({ name: "project-index", params: { workspaceId: wsId } })
  }

  // Set initial entity sidebar from current route
  // Pipeline and stage routes start with no entity panel open
  const initName = String(route.name ?? "")
  if (!initName.startsWith("pipeline") && !initName.startsWith("stage")) {
    activeEntitySidebar.value = routeToEntity(initName)
  }
})

watch(() => route.params.workspaceId, async (newId) => {
  if (!newId) return
  const id = Number(Array.isArray(newId) ? newId[0] : newId)
  if (!isNaN(id) && workspaceStore.activeWorkspace?.id !== id)
    await workspaceStore.fetchWorkspace(id).catch(() => {})
})
</script>

<style scoped>
/* ── Entity sidebar slide-in/out ──────────────────────── */
.es-enter-active {
  transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease;
  overflow: hidden;
}
.es-leave-active {
  transition: width 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 120ms ease;
  overflow: hidden;
}
.es-enter-from,
.es-leave-to  { width: 0 !important; opacity: 0; }
.es-enter-to,
.es-leave-from { opacity: 1; }

/* ── Header ───────────────────────────────────────────── */
.layout-header {
  box-shadow: 0 1px 0 hsl(var(--border));
}

/* ── Breadcrumb buttons ───────────────────────────────── */
.bc-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bc-btn:hover         { background: hsl(var(--accent)); color: hsl(var(--foreground)); }
.bc-btn--leaf         { color: hsl(var(--foreground)); font-weight: 600; cursor: default; }
.bc-btn--leaf:hover   { background: transparent; }

/* ── Generic icon header buttons ─────────────────────── */
.header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  min-width: 28px;
  border-radius: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: transparent;
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
}
.header-btn:hover { background: hsl(var(--accent)); color: hsl(var(--foreground)); }
</style>