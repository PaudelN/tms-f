<template>
  <Sidebar collapsible="icon">

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- HEADER — Workspace Combobox                               -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <SidebarHeader class="border-b border-sidebar-border/60 pb-2">
      <SidebarMenu>
        <SidebarMenuItem>

          <!-- Collapsed -->
          <SidebarMenuButton
            v-if="isSidebarCollapsed"
            size="lg"
            tooltip="Switch Workspace"
            class="justify-center px-2"
            @click="wsOpen = true"
          >
            <div
              class="flex aspect-square h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold text-white shrink-0"
              :style="{ backgroundColor: workspaceAvatarColor }"
            >
              {{ workspaceInitial }}
            </div>
          </SidebarMenuButton>

          <!-- Expanded: Combobox -->
          <Popover v-else v-model:open="wsOpen">
            <PopoverTrigger as-child>
              <SidebarMenuButton
                size="lg"
                role="combobox"
                :aria-expanded="wsOpen"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full gap-3"
              >
                <div
                  class="flex aspect-square h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold text-white shrink-0 shadow-sm"
                  :style="{ backgroundColor: workspaceAvatarColor }"
                >
                  {{ workspaceInitial }}
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span class="truncate font-semibold text-[13px]">
                    {{ workspaceStore.activeWorkspace?.name ?? 'Select Workspace' }}
                  </span>
                  <span class="truncate text-[11px] text-muted-foreground">Workspace</span>
                </div>
                <ChevronsUpDown class="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              </SidebarMenuButton>
            </PopoverTrigger>

            <PopoverContent
              class="p-0 rounded-xl shadow-xl border border-border/80 bg-popover"
              style="width: 240px"
              align="start"
              :side-offset="6"
            >
              <Command>
                <div class="flex items-center gap-2 border-b border-border/60 px-3 py-2">
                  <Search class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <CommandInput
                    placeholder="Search workspaces…"
                    class="h-7 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground border-0 shadow-none p-0 focus-visible:ring-0"
                  />
                </div>
                <CommandList class="max-h-60 py-1.5 px-1">
                  <div
                    v-if="workspacesLoading"
                    class="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground"
                  >
                    <Loader2 class="h-3.5 w-3.5 animate-spin" /> Loading…
                  </div>
                  <template v-else>
                    <CommandEmpty class="py-5 text-center text-sm text-muted-foreground">
                      No workspaces found.
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        v-for="ws in workspaceStore.workspaces"
                        :key="ws.id"
                        :value="ws.name"
                        class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer"
                        @select="() => selectWorkspace(ws)"
                      >
                        <div
                          class="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white shrink-0"
                          :style="{ backgroundColor: getWsColor(ws.name) }"
                        >
                          {{ ws.name.charAt(0).toUpperCase() }}
                        </div>
                        <span class="flex-1 text-sm font-medium truncate">{{ ws.name }}</span>
                        <CheckIcon
                          v-if="workspaceStore.activeWorkspace?.id === ws.id"
                          class="h-3.5 w-3.5 text-primary shrink-0"
                        />
                      </CommandItem>
                    </CommandGroup>
                    <div class="h-px bg-border/60 mx-2 my-1" />
                    <CommandGroup>
                      <CommandItem
                        value="__new__"
                        class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer text-muted-foreground"
                        @select="() => { wsOpen = false; goToAddWorkspace() }"
                      >
                        <div class="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/30 shrink-0">
                          <Plus class="h-3.5 w-3.5" />
                        </div>
                        <span class="text-sm font-medium">New workspace</span>
                      </CommandItem>
                    </CommandGroup>
                  </template>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- CONTENT                                                   -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <SidebarContent class="gap-0">

      <!-- ── Nav items ────────────────────────────────────────── -->
      <SidebarGroup class="px-2 py-2">
        <SidebarMenu class="gap-0.5">

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search"
              class="h-8 text-[13px] text-muted-foreground hover:text-foreground"
              @click="openSearch"
            >
              <Search class="h-4 w-4 shrink-0" />
              <span>Search</span>
              <kbd class="ml-auto inline-flex select-none items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                ⌘K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              :is-active="isActiveRoute('inbox')"
              tooltip="Inbox"
              class="h-8 text-[13px]"
              @click="router.push({ name: 'dashboard' })"
            >
              <Inbox class="h-4 w-4 shrink-0" />
              <span>Inbox</span>
              <Badge v-if="inboxCount > 0" class="ml-auto h-4 min-w-4 px-1 text-[10px] leading-none">
                {{ inboxCount }}
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              :is-active="isActiveRoute('tasks')"
              tooltip="My Tasks"
              class="h-8 text-[13px]"
              @click="router.push({ name: 'dashboard' })"
            >
              <CheckSquare class="h-4 w-4 shrink-0" />
              <span>My Tasks</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              :is-active="isActiveRoute('dashboard')"
              tooltip="Dashboard"
              class="h-8 text-[13px]"
              @click="router.push({ name: 'dashboard' })"
            >
              <LayoutDashboard class="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarGroup>

      <div class="mx-3 h-px bg-sidebar-border/50" />

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- PROJECTS SECTION                                          -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <SidebarGroup class="flex-1 min-h-0 flex flex-col px-2 py-2">

        <!-- Header row -->
        <SidebarGroupLabel class="group/label flex items-center justify-between h-7 px-1 mb-0.5">
          <!-- Clickable label → project index / all projects -->
          <button
            type="button"
            class="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            @click="goToProjectIndex"
          >
            Projects
            <span
              v-if="projectStore.projects.length > 0 && !isSidebarCollapsed"
              class="text-[9px] font-bold tabular-nums opacity-60 normal-case tracking-normal"
            >
              {{ projectStore.projects.length }}
            </span>
          </button>

          <!-- Filter + Add — always visible (not hover-only) -->
          <div class="flex items-center gap-0.5">
            <!-- Status filter dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-5 w-5 transition-colors"
                  :class="activeStatusFilter
                    ? 'text-primary'
                    : 'text-muted-foreground/50 hover:text-muted-foreground'"
                  :title="activeStatusFilter ? `Filter: ${getStatusLabel(activeStatusFilter)}` : 'Filter by status'"
                >
                  <SlidersHorizontal class="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-48 rounded-xl">
                <DropdownMenuLabel class="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pb-1">
                  Filter by status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="gap-2 cursor-pointer text-sm"
                  @click="activeStatusFilter = null"
                >
                  <span class="h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                  All statuses
                  <Check v-if="activeStatusFilter === null" class="ml-auto h-3.5 w-3.5 text-primary" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-for="st in projectStore.statuses"
                  :key="st.value"
                  class="gap-2 cursor-pointer text-sm"
                  @click="activeStatusFilter = st.value"
                >
                  <span class="h-2 w-2 rounded-full shrink-0" :style="{ backgroundColor: st.color ?? '#94a3b8' }" />
                  {{ st.label }}
                  <Check v-if="activeStatusFilter === st.value" class="ml-auto h-3.5 w-3.5 text-primary" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Add project -->
            <Button
              variant="ghost"
              size="icon"
              class="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground"
              title="New project"
              @click="addProject"
            >
              <Plus class="h-3 w-3" />
            </Button>
          </div>
        </SidebarGroupLabel>

        <!-- Active filter pill -->
        <div v-if="activeStatusFilter && !isSidebarCollapsed" class="flex items-center gap-1 px-1 mb-1.5">
          <span class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <span
              class="h-1.5 w-1.5 rounded-full shrink-0"
              :style="{ backgroundColor: getStatusColor(activeStatusFilter) }"
            />
            {{ getStatusLabel(activeStatusFilter) }}
            <button
              type="button"
              class="ml-0.5 leading-none hover:opacity-60 transition-opacity font-bold"
              @click="activeStatusFilter = null"
            >
              ×
            </button>
          </span>
        </div>

        <!-- Project list -->
        <SidebarGroupContent class="flex-1 overflow-y-auto">
          <SidebarMenu class="gap-0.5">

            <!-- Loading -->
            <template v-if="projectsLoading">
              <SidebarMenuItem v-for="i in 5" :key="i">
                <div class="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton class="h-2 w-2 rounded-full shrink-0" />
                  <Skeleton class="h-3 flex-1 rounded" />
                  <Skeleton class="h-3 w-4 rounded" />
                </div>
              </SidebarMenuItem>
            </template>

            <!-- No workspace -->
            <SidebarMenuItem v-else-if="!workspaceStore.activeWorkspace">
              <div class="flex flex-col items-center gap-2 px-2 py-8 text-center">
                <div class="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                  <Building2 class="h-4 w-4 text-muted-foreground/40" />
                </div>
                <p class="text-[11px] text-muted-foreground leading-relaxed">
                  Select a workspace<br />to view projects
                </p>
              </div>
            </SidebarMenuItem>

            <!-- Empty -->
            <SidebarMenuItem v-else-if="filteredProjects.length === 0">
              <div class="flex flex-col items-center gap-2 px-2 py-8 text-center">
                <div class="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                  <FolderOpen class="h-4 w-4 text-muted-foreground/40" />
                </div>
                <p class="text-[11px] text-muted-foreground">
                  {{ activeStatusFilter ? 'No projects match' : 'No projects yet' }}
                </p>
                <button
                  v-if="activeStatusFilter"
                  type="button"
                  class="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                  @click="activeStatusFilter = null"
                >
                  Clear filter
                </button>
                <button
                  v-else
                  type="button"
                  class="text-[11px] text-primary hover:underline underline-offset-2 font-medium"
                  @click="addProject"
                >
                  + Create one
                </button>
              </div>
            </SidebarMenuItem>

            <!-- ── Project rows ─────────────────────────────────── -->
            <template v-for="project in filteredProjects" :key="project.id">
              <SidebarMenuItem>
                <SidebarMenuButton
                  :is-active="isActiveProject(project.id)"
                  :tooltip="project.name"
                  class="gap-2 h-8 text-[13px]"
                  @click="navigateToProject(project)"
                >
                  <span
                    class="h-2 w-2 rounded-full shrink-0"
                    :style="{ backgroundColor: getStatusColor(safeString(project.status)) }"
                  />
                  <span class="flex-1 truncate">{{ project.name }}</span>
                  <span
                    v-if="project.task_count !== undefined && !isActiveProject(project.id)"
                    class="text-[10px] text-muted-foreground/50 tabular-nums shrink-0"
                  >
                    {{ project.task_count }}
                  </span>
                </SidebarMenuButton>

                <!-- Options — ALWAYS visible, not hover-only -->
                <SidebarMenuAction
                  class="right-0.5 opacity-60 hover:opacity-100 transition-opacity"
                  @click.stop="openContextMenu(project, $event)"
                >
                  <MoreHorizontal class="h-3.5 w-3.5" />
                  <span class="sr-only">Options</span>
                </SidebarMenuAction>
              </SidebarMenuItem>

              <!-- ── View switcher — shown under active project ── -->
              <SidebarMenuItem v-if="isActiveProject(project.id) && !isSidebarCollapsed">
                <div class="ml-[18px] mt-0.5 mb-1 pl-2.5 border-l-2 border-sidebar-border/50 space-y-0.5">
                  <button
                    v-for="view in projectViews"
                    :key="view.id"
                    type="button"
                    class="flex w-full items-center gap-2 px-2 py-1 rounded-md text-[12px] transition-colors"
                    :class="
                      isActiveView(view.id)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                    "
                    @click="navigateToView(project, view.id)"
                  >
                    <component :is="view.icon" class="h-3.5 w-3.5 shrink-0" />
                    <span>{{ view.label }}</span>
                  </button>
                </div>
              </SidebarMenuItem>
            </template>

          </SidebarMenu>
        </SidebarGroupContent>

        <!-- "View all" footer link -->
        <div
          v-if="!isSidebarCollapsed && workspaceStore.activeWorkspace && projectStore.projects.length > 0"
          class="pt-1.5 mt-1 border-t border-sidebar-border/30"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 px-2 py-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-sidebar-accent/40 rounded-md transition-colors"
            @click="goToProjectIndex"
          >
            <LayoutList class="h-3 w-3 shrink-0" />
            <span>View all projects</span>
          </button>
        </div>

      </SidebarGroup>
    </SidebarContent>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- FOOTER                                                    -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <SidebarFooter class="relative p-0 border-t border-sidebar-border/60">
      <SidebarMenu class="px-2 pt-2 pb-0">
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Settings"
            class="h-8 text-[13px] text-muted-foreground hover:text-foreground"
            @click="router.push({ name: 'dashboard' })"
          >
            <Settings class="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <UserProfileMenu :collapsed="isSidebarCollapsed" />
    </SidebarFooter>

    <SidebarRail />

    <!-- ── Context menu (teleported to body) ─────────────────── -->
    <Teleport to="body">
      <div
        v-if="ctxMenu.open && ctxMenu.project"
        ref="ctxMenuRef"
        class="fixed z-[300] min-w-[168px] rounded-xl bg-popover border border-border shadow-2xl py-1.5 overflow-hidden"
        :style="{ top: `${ctxMenu.y}px`, left: `${ctxMenu.x}px` }"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-accent transition-colors"
          @click="ctxDetail"
        >
          <Eye class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          View detail
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-accent transition-colors"
          @click="ctxEdit"
        >
          <Pencil class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          Edit project
        </button>
        <div class="h-px bg-border/60 mx-2 my-1" />
        <button
          type="button"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/10 transition-colors"
          @click="ctxDelete"
        >
          <Trash2 class="h-3.5 w-3.5 shrink-0" />
          Delete
        </button>
      </div>
    </Teleport>

  </Sidebar>
</template>

<script setup lang="ts">
import {
  Building2,
  Check,
  CheckIcon,
  CheckSquare,
  ChevronsUpDown,
  Eye,
  FolderOpen,
  Inbox,
  Kanban,
  LayoutDashboard,
  LayoutList,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Table2,
  Trash2,
} from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuAction,
  SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar,
} from '@/components/ui/sidebar'

import UserProfileMenu from '../common/UserProfileMenu.vue'
import { useProjectStore, type Project } from '@/stores/project'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { notify } from '@/helpers/toast'

const router = useRouter()
const route  = useRoute()
const workspaceStore = useWorkspaceStore()
const projectStore   = useProjectStore()

// ── Sidebar collapsed ─────────────────────────────────────────────────────────
const { state: sidebarState } = useSidebar()
const isSidebarCollapsed = computed(() => sidebarState.value === 'collapsed')

// ── Workspace combobox ────────────────────────────────────────────────────────
const wsOpen            = ref(false)
const workspacesLoading = ref(false)

function getWsColor(name: string): string {
  const palette = ['#7C3AED','#2563EB','#059669','#D97706','#DC2626','#0891B2','#DB2777','#0F766E']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return palette[Math.abs(h) % palette.length]
}

const workspaceInitial     = computed(() => workspaceStore.activeWorkspace?.name?.charAt(0).toUpperCase() ?? 'W')
const workspaceAvatarColor = computed(() => workspaceStore.activeWorkspace ? getWsColor(workspaceStore.activeWorkspace.name) : '#7C3AED')

async function selectWorkspace(ws: Workspace) {
  wsOpen.value = false
  await workspaceStore.fetchWorkspace(ws.id)
  await loadProjects(ws.id)
  router.push({ name: 'project-index', params: { workspaceId: ws.id } })
}

function goToAddWorkspace() { router.push({ name: 'workspace-add' }) }

// ── Status helpers — safe against object/string dual shapes ──────────────────
function safeString(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && 'value' in (val as object)) return String((val as any).value)
  return ''
}

function getStatusColor(statusValue: string): string {
  if (!statusValue) return '#94a3b8'
  return projectStore.statuses.find(s => s.value === statusValue)?.color ?? '#94a3b8'
}

function getStatusLabel(statusValue: string | null): string {
  if (!statusValue) return ''
  return projectStore.statuses.find(s => s.value === statusValue)?.label ?? statusValue
}

// ── Status filter ─────────────────────────────────────────────────────────────
const activeStatusFilter = ref<string | null>(null)

const filteredProjects = computed<Project[]>(() => {
  const list = projectStore.projects
  if (!activeStatusFilter.value) return list
  return list.filter(p => safeString(p.status) === activeStatusFilter.value)
})

// ── Project views (sub-nav under active project) ──────────────────────────────
const projectViews = [
  { id: 'list',   label: 'List',   icon: LayoutList },
  { id: 'table',  label: 'Table',  icon: Table2      },
  { id: 'kanban', label: 'Kanban', icon: Kanban      },
]

function isActiveView(viewId: string): boolean {
  return route.query.view === viewId || (!route.query.view && viewId === 'list')
}

function navigateToView(project: Project, viewId: string) {
  router.push({
    name:   'project-index',
    params: { workspaceId: project.workspace_id },
    query:  { view: viewId },
  })
}

// ── Project list ──────────────────────────────────────────────────────────────
const projectsLoading = ref(false)
const inboxCount      = ref(3)

async function loadProjects(workspaceId: number) {
  projectsLoading.value = true
  try {
    const res = await projectStore.fetchProjects({ workspaceId, page: 1, perPage: 100 })
    projectStore.projects = res.data ?? []
  } catch { /* silent */ } finally {
    projectsLoading.value = false
  }
}

function isActiveProject(id: number): boolean {
  const raw = route.params.id
  const routeId = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  return !isNaN(routeId) && routeId === id
}

function isActiveRoute(name: string): boolean { return route.name === name }

function navigateToProject(project: Project) {
  router.push({ name: 'project-detail', params: { id: project.id } })
}

function goToProjectIndex() {
  if (workspaceStore.activeWorkspace) {
    router.push({ name: 'project-index', params: { workspaceId: workspaceStore.activeWorkspace.id } })
  }
}

function addProject() {
  if (workspaceStore.activeWorkspace) {
    router.push({ name: 'project-add', params: { workspaceId: workspaceStore.activeWorkspace.id } })
  } else {
    router.push({ name: 'workspace' })
  }
}

function openSearch() { /* TODO: ⌘K command palette */ }

// ── Context menu ──────────────────────────────────────────────────────────────
const ctxMenuRef = ref<HTMLElement | null>(null)
const ctxMenu = reactive<{ open: boolean; project: Project | null; x: number; y: number }>({
  open: false, project: null, x: 0, y: 0,
})

function openContextMenu(project: Project, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  const MENU_W = 168
  const MENU_H = 130
  let x = e.clientX + 4
  let y = e.clientY
  if (x + MENU_W > window.innerWidth)  x = e.clientX - MENU_W - 4
  if (y + MENU_H > window.innerHeight) y = window.innerHeight - MENU_H - 8
  ctxMenu.project = project
  ctxMenu.x       = x
  ctxMenu.y       = y
  ctxMenu.open    = true
}

function closeCtxMenu() { ctxMenu.open = false; ctxMenu.project = null }

function ctxDetail() {
  if (!ctxMenu.project) return
  router.push({ name: 'project-detail', params: { id: ctxMenu.project.id } })
  closeCtxMenu()
}
function ctxEdit() {
  if (!ctxMenu.project) return
  router.push({ name: 'project-edit', params: { id: ctxMenu.project.id } })
  closeCtxMenu()
}
async function ctxDelete() {
  if (!ctxMenu.project) return
  const p   = ctxMenu.project
  const wsId = p.workspace_id
  closeCtxMenu()
  try {
    await projectStore.deleteProject(p.id, wsId)
    notify.success('Project deleted', `"${p.name}" was removed.`, { position: 'bottom-right' })
    if (isActiveProject(p.id)) {
      router.push({ name: 'project-index', params: { workspaceId: wsId } })
    }
  } catch {
    notify.error('Delete failed', 'Could not delete the project.', { position: 'bottom-right' })
  }
}

function onDocClick(e: MouseEvent) {
  if (ctxMenu.open && ctxMenuRef.value && !ctxMenuRef.value.contains(e.target as Node)) {
    closeCtxMenu()
  }
}
function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') closeCtxMenu() }

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)

  await projectStore.fetchStatuses().catch(() => {})

  workspacesLoading.value = true
  try {
    await workspaceStore.fetchWorkspaces({ page: 1, perPage: 100 })
  } catch { /* silent */ } finally {
    workspacesLoading.value = false
  }

  const rawParam  = route.params.workspaceId
  const routeWsId = rawParam ? (Array.isArray(rawParam) ? Number(rawParam[0]) : Number(rawParam)) : null
  const wsId: number | null = workspaceStore.activeWorkspace?.id ?? routeWsId

  if (wsId) {
    if (!workspaceStore.activeWorkspace) await workspaceStore.fetchWorkspace(wsId).catch(() => {})
    await loadProjects(wsId)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})

watch(
  () => route.params.workspaceId,
  async (newId) => {
    if (!newId) return
    const id = Array.isArray(newId) ? Number(newId[0]) : Number(newId)
    if (isNaN(id)) return
    if (workspaceStore.activeWorkspace?.id !== id) await workspaceStore.fetchWorkspace(id).catch(() => {})
    await loadProjects(id)
  },
)
</script>