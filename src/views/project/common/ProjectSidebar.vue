<template>
  <aside
    class="ps-root relative flex flex-col h-full border-r border-border bg-sidebar shrink-0 overflow-hidden"
    :style="{ width: isExpanded ? '240px' : '52px' }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- ══ Header ══════════════════════════════════════════════ -->
    <div
      class="flex h-[52px] shrink-0 items-center border-b border-border"
      :class="isExpanded ? 'px-3 gap-2' : 'justify-center'"
    >
      <TooltipProvider :delay-duration="0">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-accent"
            >
              <FolderKanban class="h-4 w-4 text-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent v-if="!isExpanded" side="right">Projects</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <template v-if="isExpanded">
        <span class="flex-1 min-w-0 truncate text-[12px] font-semibold text-foreground">
          {{ workspaceStore.activeWorkspace?.name ?? 'Projects' }}
        </span>
        <TooltipProvider :delay-duration="0">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                @click="togglePin"
              >
                <PinOff v-if="isPinned" class="h-3.5 w-3.5" />
                <Pin v-else class="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{{ isPinned ? 'Unpin' : 'Pin open' }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          @click="emit('close')"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </template>
    </div>

    <!-- ══ COLLAPSED: icon dots per project ═══════════════════ -->
    <div v-if="!isExpanded" class="flex flex-col items-center gap-1 p-1.5 pt-2">
      <template v-if="projectsLoading">
        <div v-for="i in 4" :key="i" class="h-8 w-8 rounded-lg bg-muted animate-pulse" />
      </template>
      <template v-else>
        <TooltipProvider
          v-for="project in projectStore.projects.slice(0, 8)"
          :key="project.id"
          :delay-duration="0"
        >
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                :class="isActiveProject(project.id) ? 'bg-accent' : 'hover:bg-accent'"
                @click="navigateToProject(project)"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :style="{ backgroundColor: getStatusColor(safeString(project.status)) }"
                />
                <span
                  v-if="isActiveProject(project.id)"
                  class="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-primary"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{{ project.name }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider :delay-duration="0">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                @click="addProject"
              >
                <Plus class="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">New Project</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </template>
    </div>

    <!-- ══ EXPANDED: full sidebar content ═════════════════════ -->
    <template v-else>
      <!-- Search -->
      <div class="px-2 pt-2 pb-1.5 shrink-0">
        <div class="flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5 focus-within:border-primary transition-colors">
          <Search class="h-3 w-3 shrink-0 text-muted-foreground" />
          <input
            v-model="search"
            placeholder="Search projects…"
            class="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button v-if="search" type="button" class="text-muted-foreground hover:text-foreground" @click="search = ''">
            <X class="h-3 w-3" />
          </button>
        </div>
      </div>

      <!-- Status filter via Collapsible -->
      <Collapsible v-model:open="filterOpen" class="shrink-0 px-2 pb-1">
        <CollapsibleTrigger
          class="flex w-full items-center justify-between rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <span>Status</span>
          <ChevronDown
            class="h-3 w-3 text-muted-foreground transition-transform duration-150"
            :class="filterOpen ? 'rotate-180' : ''"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="flex flex-wrap gap-1 px-1 pt-1.5 pb-1">
            <button
              type="button"
              class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors"
              :class="!activeStatusFilter
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'"
              @click="activeStatusFilter = null"
            >All</button>
            <button
              v-for="st in projectStore.statuses"
              :key="st.value"
              type="button"
              class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors"
              :class="activeStatusFilter === st.value
                ? 'font-semibold'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'"
              :style="activeStatusFilter === st.value
                ? { borderColor: st.color ?? '#94a3b8', color: st.color ?? '#94a3b8', backgroundColor: (st.color ?? '#94a3b8') + '18' }
                : {}"
              @click="activeStatusFilter = activeStatusFilter === st.value ? null : st.value"
            >
              <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: st.color ?? '#94a3b8' }" />
              {{ st.label }}
            </button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <!-- Project list -->
      <div class="ps-scroll flex-1 overflow-y-auto px-1 py-1">
        <!-- Loading -->
        <template v-if="projectsLoading">
          <div v-for="i in 5" :key="i" class="flex items-center gap-2 px-2 py-2">
            <div class="h-2 w-2 rounded-full bg-muted animate-pulse shrink-0" />
            <div class="h-2.5 flex-1 rounded bg-muted animate-pulse" />
          </div>
        </template>

        <!-- Empty -->
        <template v-else-if="filteredProjects.length === 0">
          <div class="flex flex-col items-center gap-2 py-8 px-3 text-center">
            <FolderOpen class="h-6 w-6 text-muted-foreground opacity-40" />
            <p class="text-[11px] text-muted-foreground">
              {{ activeStatusFilter ? 'No matching projects' : 'No projects yet' }}
            </p>
            <button
              v-if="!activeStatusFilter"
              type="button"
              class="text-[11px] font-semibold text-primary hover:opacity-80 transition-opacity"
              @click="addProject"
            >+ Create project</button>
          </div>
        </template>

        <!-- Project items — Collapsible reveals pipelines -->
        <template v-else>
          <Collapsible
            v-for="project in filteredProjects"
            :key="project.id"
            :open="expandedProjects.has(project.id)"
            @update:open="toggleProjectExpand(project)"
          >
            <div
              class="group flex items-center rounded-md transition-colors"
              :class="isActiveProject(project.id) ? 'bg-accent' : 'hover:bg-accent'"
            >
              <CollapsibleTrigger as-child>
                <button
                  type="button"
                  class="flex h-8 w-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  @click.stop
                >
                  <ChevronRight
                    class="h-3 w-3 transition-transform duration-150"
                    :class="expandedProjects.has(project.id) ? 'rotate-90' : ''"
                  />
                </button>
              </CollapsibleTrigger>

              <button
                type="button"
                class="flex flex-1 items-center gap-2 h-8 min-w-0 pr-2 text-left"
                @click="navigateToProject(project)"
              >
                <span
                  class="h-1.5 w-1.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: getStatusColor(safeString(project.status)) }"
                />
                <span class="flex-1 truncate text-[12.5px] font-medium text-foreground">
                  {{ project.name }}
                </span>
                <span
                  v-if="project.task_count != null && !isActiveProject(project.id)"
                  class="shrink-0 text-[10px] text-muted-foreground tabular-nums"
                >{{ project.task_count }}</span>
              </button>

              <button
                type="button"
                class="flex h-8 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-accent transition-all"
                @click.stop="openContextMenu(project, $event)"
              >
                <MoreHorizontal class="h-3.5 w-3.5" />
              </button>
            </div>

            <!-- Pipeline sub-list -->
            <CollapsibleContent>
              <div class="ml-5 border-l border-border mt-0.5 mb-1">
                <template v-if="pipelinesLoading.has(project.id)">
                  <div v-for="n in 2" :key="n" class="flex items-center gap-2 pl-3 pr-2 py-1.5">
                    <div class="h-2 flex-1 rounded bg-muted animate-pulse" />
                  </div>
                </template>

                <template v-else-if="(projectPipelines.get(project.id) ?? []).length === 0">
                  <div class="flex items-center justify-between pl-3 pr-2 py-1.5">
                    <span class="text-[11px] text-muted-foreground italic opacity-60">No pipelines</span>
                    <button
                      type="button"
                      class="flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                      @click.stop="navigateToPipelineAdd(project.id)"
                    >
                      <Plus class="h-3 w-3" />
                    </button>
                  </div>
                </template>

                <!-- Each pipeline — Collapsible reveals stages -->
                <template v-else>
                  <Collapsible
                    v-for="pipeline in projectPipelines.get(project.id)"
                    :key="pipeline.id"
                    :open="expandedPipelines.has(pipeline.id)"
                    @update:open="togglePipelineExpand(pipeline)"
                  >
                    <div
                      class="group flex items-center rounded-md mx-1 transition-colors"
                      :class="isActivePipeline(pipeline.id) ? 'bg-accent' : 'hover:bg-accent'"
                    >
                      <CollapsibleTrigger as-child>
                        <button
                          type="button"
                          class="flex h-7 w-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          @click.stop
                        >
                          <ChevronRight
                            class="h-2.5 w-2.5 transition-transform duration-150"
                            :class="expandedPipelines.has(pipeline.id) ? 'rotate-90' : ''"
                          />
                        </button>
                      </CollapsibleTrigger>

                      <button
                        type="button"
                        class="flex flex-1 items-center gap-1.5 h-7 min-w-0 pr-1.5 text-left"
                        @click="navigateToPipelineDetail(pipeline.id)"
                      >
                        <GitBranch class="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span class="flex-1 truncate text-[11.5px] text-foreground">{{ pipeline.name }}</span>
                      </button>
                    </div>

                    <!-- Stage sub-list -->
                    <CollapsibleContent>
                      <div class="ml-4 border-l border-border mt-0.5 mb-0.5">
                        <template v-if="stagesLoading.has(pipeline.id)">
                          <div class="ml-2 my-1 h-5 rounded bg-muted animate-pulse" />
                        </template>
                        <template v-else-if="(pipelineStages.get(pipeline.id) ?? []).length === 0">
                          <p class="pl-3 py-1 text-[10.5px] text-muted-foreground italic opacity-60">No stages</p>
                        </template>
                        <button
                          v-for="stage in pipelineStages.get(pipeline.id)"
                          v-else
                          :key="stage.id"
                          type="button"
                          class="flex w-full items-center gap-1.5 pl-3 pr-2 py-1 rounded-md mx-1 text-left transition-colors hover:bg-accent"
                          :class="isActiveStage(stage.id) ? 'bg-accent' : ''"
                          @click="navigateToStage(stage)"
                        >
                          <span
                            class="h-1.5 w-1.5 shrink-0 rounded-full"
                            :style="{ backgroundColor: stage.color ?? '#94a3b8' }"
                          />
                          <span class="flex-1 truncate text-[11px] text-foreground">{{ stage.name }}</span>
                        </button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <button
                    type="button"
                    class="flex w-full items-center gap-1.5 pl-3 py-1 text-[10.5px] text-muted-foreground hover:text-primary transition-colors"
                    @click.stop="navigateToPipelineAdd(project.id)"
                  >
                    <Plus class="h-2.5 w-2.5" />
                    Add pipeline
                  </button>
                </template>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <!-- New project -->
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors mt-0.5"
            @click="addProject"
          >
            <Plus class="h-3 w-3" />
            New project
          </button>
        </template>
      </div>
    </template>

    <!-- Context menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="ctxMenu.open && ctxMenu.project"
          ref="ctxMenuRef"
          class="fixed z-[500] min-w-[184px] overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-2xl"
          :style="{ top: `${ctxMenu.y}px`, left: `${ctxMenu.x}px` }"
        >
          <div class="px-3 py-1.5 border-b border-border">
            <p class="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">Project</p>
            <p class="text-[12.5px] font-semibold text-foreground truncate">{{ ctxMenu.project.name }}</p>
          </div>
          <div class="py-1">
            <button type="button" class="ps-ctx-item" @click="ctxDetail">
              <Eye class="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> View detail
            </button>
            <button type="button" class="ps-ctx-item" @click="ctxEdit">
              <Pencil class="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> Edit project
            </button>
            <button type="button" class="ps-ctx-item" @click="ctxAddPipeline">
              <GitBranch class="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> Add pipeline
            </button>
          </div>
          <div class="h-px bg-border mx-2" />
          <div class="py-1">
            <button type="button" class="ps-ctx-item text-destructive" @click="ctxDelete">
              <Trash2 class="h-3.5 w-3.5 shrink-0" /> Delete project
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import {
  ChevronDown, ChevronRight, Eye, FolderKanban, FolderOpen,
  GitBranch, MoreHorizontal, Pencil, Pin, PinOff, Plus,
  Search, Trash2, X,
} from "lucide-vue-next"
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"

import { notify }           from "@/helpers/toast"
import { usePipelineStore } from "@/stores/pipeline"
import { usePipelineStageStore } from "@/stores/pipelineStages"
import { useProjectStore, type Project } from "@/stores/project"
import { useWorkspaceStore } from "@/stores/workspace"

// ── Emits ─────────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  (e: "close"): void
}>()

// ── Stores ────────────────────────────────────────────────────────────────────
const router             = useRouter()
const route              = useRoute()
const workspaceStore     = useWorkspaceStore()
const projectStore       = useProjectStore()
const pipelineStore      = usePipelineStore()
const pipelineStageStore = usePipelineStageStore()

// ── Expand state (hover + pin) ────────────────────────────────────────────────
const isPinned   = ref(false)
const isHovered  = ref(false)
const isExpanded = computed(() => isPinned.value || isHovered.value)

let hoverTimeout: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() {
  if (hoverTimeout) clearTimeout(hoverTimeout)
  isHovered.value = true
}
function onMouseLeave() {
  if (isPinned.value) return
  hoverTimeout = setTimeout(() => { isHovered.value = false }, 120)
}
function togglePin() {
  isPinned.value = !isPinned.value
  if (!isPinned.value) isHovered.value = false
}

// ── Status helpers ────────────────────────────────────────────────────────────
function safeString(val: unknown): string {
  if (!val) return ""
  if (typeof val === "string") return val
  if (typeof val === "object" && "value" in (val as object)) return String((val as any).value)
  return ""
}
function getStatusColor(sv: string): string {
  return projectStore.statuses.find((s) => s.value === sv)?.color ?? "#94a3b8"
}

// ── Search & filter ───────────────────────────────────────────────────────────
const search             = ref("")
const filterOpen         = ref(false)
const activeStatusFilter = ref<string | null>(null)

const filteredProjects = computed<Project[]>(() => {
  let list = projectStore.projects
  if (activeStatusFilter.value)
    list = list.filter((p) => safeString(p.status) === activeStatusFilter.value)
  if (search.value.trim())
    list = list.filter((p) => p.name.toLowerCase().includes(search.value.toLowerCase()))
  return list
})

// ── Projects ──────────────────────────────────────────────────────────────────
const projectsLoading = ref(false)

async function loadProjects() {
  if (!workspaceStore.activeWorkspace) return
  projectsLoading.value = true
  try {
    const res = await projectStore.fetchProjects({
      workspaceId: workspaceStore.activeWorkspace.id,
      page: 1, perPage: 100,
    })
    projectStore.projects = res.data ?? []
  } catch { /* silent */ }
  finally { projectsLoading.value = false }
}

function isActiveProject(id: number): boolean {
  const raw = route.params.id
  const rid = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  return !isNaN(rid) && rid === id
}

function navigateToProject(project: Project) {
  router.push({ name: "project-detail", params: { id: project.id } })
}

function addProject() {
  if (workspaceStore.activeWorkspace)
    router.push({ name: "project-add", params: { workspaceId: workspaceStore.activeWorkspace.id } })
  else router.push({ name: "workspace" })
}

// ── Pipeline expand ───────────────────────────────────────────────────────────
const expandedProjects = ref<Set<number>>(new Set())
const pipelinesLoading = ref<Set<number>>(new Set())
const projectPipelines = ref<Map<number, { id: number; name: string }[]>>(new Map())

async function loadPipelinesForProject(projectId: number): Promise<void> {
  if (projectPipelines.value.has(projectId) || pipelinesLoading.value.has(projectId)) return
  pipelinesLoading.value = new Set([...pipelinesLoading.value, projectId])
  try {
    const res = await pipelineStore.fetchPipelines({
      projectId, page: 1, perPage: 50,
      search: "", sortBy: "name", sortOrder: "asc", filters: [],
    })
    const list = (res.data ?? []).map((p: any) => ({ id: p.id, name: p.name }))
    projectPipelines.value = new Map([...projectPipelines.value, [projectId, list]])
  } catch {
    projectPipelines.value = new Map([...projectPipelines.value, [projectId, []]])
  } finally {
    const next = new Set(pipelinesLoading.value)
    next.delete(projectId)
    pipelinesLoading.value = next
  }
}

function toggleProjectExpand(project: Project) {
  const next = new Set(expandedProjects.value)
  if (next.has(project.id)) { next.delete(project.id) }
  else { next.add(project.id); loadPipelinesForProject(project.id) }
  expandedProjects.value = next
}

function isActivePipeline(id: number): boolean {
  const raw = route.params.id
  const rid = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  return String(route.name ?? "").startsWith("pipeline") && !isNaN(rid) && rid === id
}

function navigateToPipelineDetail(id: number) {
  router.push({ name: "pipeline-detail", params: { id } })
}
function navigateToPipelineAdd(projectId: number) {
  router.push({ name: "pipeline-add", params: { projectId } })
}

// ── Stage expand ──────────────────────────────────────────────────────────────
const expandedPipelines = ref<Set<number>>(new Set())
const stagesLoading     = ref<Set<number>>(new Set())
const pipelineStages    = ref<Map<number, { id: number; name: string; color: string | null }[]>>(new Map())

async function loadStagesForPipeline(pipelineId: number): Promise<void> {
  if (pipelineStages.value.has(pipelineId) || stagesLoading.value.has(pipelineId)) return
  stagesLoading.value = new Set([...stagesLoading.value, pipelineId])
  try {
    const res = await pipelineStageStore.fetchStages({ pipelineId, page: 1, perPage: 100 })
    const list = (res.data ?? []).map((s: any) => ({ id: s.id, name: s.name, color: s.color ?? null }))
    pipelineStages.value = new Map([...pipelineStages.value, [pipelineId, list]])
  } catch {
    pipelineStages.value = new Map([...pipelineStages.value, [pipelineId, []]])
  } finally {
    const next = new Set(stagesLoading.value)
    next.delete(pipelineId)
    stagesLoading.value = next
  }
}

function togglePipelineExpand(pipeline: { id: number; name: string }) {
  const next = new Set(expandedPipelines.value)
  if (next.has(pipeline.id)) { next.delete(pipeline.id) }
  else { next.add(pipeline.id); loadStagesForPipeline(pipeline.id) }
  expandedPipelines.value = next
}

function isActiveStage(id: number): boolean {
  const raw = route.params.id
  const rid = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  return String(route.name ?? "").startsWith("pipeline-stage") && !isNaN(rid) && rid === id
}

function navigateToStage(stage: { id: number }) {
  router.push({ name: "pipeline-stage-detail", params: { id: stage.id } })
}

// ── Context menu ──────────────────────────────────────────────────────────────
const ctxMenuRef = ref<HTMLElement | null>(null)
const ctxMenu = reactive<{ open: boolean; project: Project | null; x: number; y: number }>({
  open: false, project: null, x: 0, y: 0,
})

function openContextMenu(project: Project, e: MouseEvent) {
  e.preventDefault(); e.stopPropagation()
  const W = 184, H = 180
  let x = e.clientX + 4, y = e.clientY
  if (x + W > window.innerWidth)  x = e.clientX - W - 4
  if (y + H > window.innerHeight) y = window.innerHeight - H - 8
  Object.assign(ctxMenu, { project, x, y, open: true })
}
function closeCtx() { ctxMenu.open = false; ctxMenu.project = null }

function ctxDetail()       { if (ctxMenu.project) router.push({ name: "project-detail", params: { id: ctxMenu.project.id } }); closeCtx() }
function ctxEdit()         { if (ctxMenu.project) router.push({ name: "project-edit",   params: { id: ctxMenu.project.id } }); closeCtx() }
function ctxAddPipeline()  { if (ctxMenu.project) navigateToPipelineAdd(ctxMenu.project.id); closeCtx() }

async function ctxDelete() {
  if (!ctxMenu.project) return
  const p = ctxMenu.project; closeCtx()
  try {
    await projectStore.deleteProject(p.id, p.workspace_id)
    notify.success("Project deleted", `"${p.name}" was removed.`, { position: "bottom-right" })
    if (isActiveProject(p.id))
      router.push({ name: "project-index", params: { workspaceId: p.workspace_id } })
  } catch {
    notify.error("Delete failed", "Could not delete the project.", { position: "bottom-right" })
  }
}

function onDocClick(e: MouseEvent) {
  if (ctxMenu.open && ctxMenuRef.value && !ctxMenuRef.value.contains(e.target as Node)) closeCtx()
}
function onEsc(e: KeyboardEvent) { if (e.key === "Escape") closeCtx() }

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  document.addEventListener("click", onDocClick)
  document.addEventListener("keydown", onEsc)
  await projectStore.fetchStatuses().catch(() => {})
  await loadProjects()
})

onUnmounted(() => {
  document.removeEventListener("click", onDocClick)
  document.removeEventListener("keydown", onEsc)
  if (hoverTimeout) clearTimeout(hoverTimeout)
})

watch(() => workspaceStore.activeWorkspace?.id, () => loadProjects())
</script>

<style scoped>
.ps-root {
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ps-scroll {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}
.ps-scroll::-webkit-scrollbar        { width: 3px; }
.ps-scroll::-webkit-scrollbar-thumb  { background: hsl(var(--border)); border-radius: 99px; }

.ps-ctx-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  font-size: 12.5px;
  transition: background 100ms ease;
}
.ps-ctx-item:hover { background: hsl(var(--accent)); }
</style>