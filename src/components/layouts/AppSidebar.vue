<template>
  <Sidebar collapsible="icon" class="app-sidebar border-r border-border bg-sidebar select-none">

    <!-- ══ Workspace switcher ══════════════════════════════════════ -->
    <SidebarHeader class="p-0 border-b border-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover v-model:open="wsOpen">
            <PopoverTrigger as-child>
              <SidebarMenuButton
                size="lg"
                role="combobox"
                :aria-expanded="wsOpen"
                class="h-[52px] w-full rounded-none transition-all duration-200 hover:bg-accent"
                :class="isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'"
              >
                <!-- Workspace avatar -->
                <div
                  class="ws-avatar flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white shadow-sm"
                  :style="{ backgroundColor: wsAvatarColor }"
                >{{ wsInitial }}</div>

                <!-- Expanded: name + chevron -->
                <template v-if="!isSidebarCollapsed">
                  <div class="grid flex-1 text-left leading-tight min-w-0">
                    <span class="truncate text-[12.5px] font-semibold text-foreground tracking-tight">
                      {{ workspaceStore.activeWorkspace?.name ?? "Select workspace" }}
                    </span>
                    <span class="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      Workspace
                    </span>
                  </div>
                  <ChevronsUpDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </template>
              </SidebarMenuButton>
            </PopoverTrigger>

            <!-- Workspace popover -->
            <PopoverContent
              class="p-0 rounded-xl shadow-2xl border border-border bg-popover overflow-hidden"
              style="width: 272px"
              :side="isSidebarCollapsed ? 'right' : 'bottom'"
              align="start"
              :side-offset="isSidebarCollapsed ? 10 : 4"
            >
              <!-- Search -->
              <div class="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted">
                <Search class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  v-model="wsSearch"
                  placeholder="Find workspace…"
                  class="flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>

              <!-- List -->
              <div class="ws-scroll max-h-56 overflow-y-auto py-1.5 px-1.5">
                <div v-if="workspacesLoading" class="flex items-center gap-2.5 px-3 py-3 text-[12px] text-muted-foreground">
                  <Loader2 class="h-3.5 w-3.5 animate-spin" /> Loading…
                </div>
                <template v-else>
                  <div v-if="filteredWorkspaces.length === 0" class="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                    <FolderSearch class="h-7 w-7 opacity-30" />
                    <p class="text-[11.5px] font-medium">No workspaces found</p>
                  </div>
                  <button
                    v-for="ws in filteredWorkspaces"
                    :key="ws.id"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer hover:bg-accent"
                    :class="workspaceStore.activeWorkspace?.id === ws.id ? 'bg-accent' : ''"
                    @click="selectWorkspace(ws)"
                  >
                    <div
                      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white shadow-sm"
                      :style="{ backgroundColor: getWsColor(ws.name) }"
                    >{{ ws.name.charAt(0).toUpperCase() }}</div>
                    <div class="flex-1 min-w-0">
                      <p class="truncate text-[12.5px] font-medium text-foreground">{{ ws.name }}</p>
                    </div>
                    <div v-if="workspaceStore.activeWorkspace?.id === ws.id" class="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  </button>
                </template>
              </div>

              <!-- Footer -->
              <div class="flex items-center border-t border-border bg-muted px-2 py-1.5 gap-1">
                <button
                  type="button"
                  class="ws-footer-btn flex-1"
                  @click="() => { wsOpen = false; router.push({ name: 'workspace-add' }) }"
                >
                  <Plus class="h-3.5 w-3.5" /> New workspace
                </button>
                <button
                  type="button"
                  class="ws-footer-btn"
                  @click="() => { wsOpen = false; router.push({ name: 'workspace' }) }"
                >
                  <LayoutList class="h-3.5 w-3.5" /> Manage
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <!-- ══ Navigation ════════════════════════════════════════════ -->
    <SidebarContent class="gap-0">
      <SidebarGroup class="px-2 pt-2 pb-1">
        <SidebarMenu class="gap-0.5">

          <SidebarMenuItem v-for="item in navItems" :key="item.entity">
            <SidebarMenuButton
              :is-active="isNavActive(item)"
              :tooltip="item.label"
              class="h-9 rounded-lg transition-all duration-150"
              :class="isSidebarCollapsed ? 'justify-center' : 'gap-2.5 px-2.5'"
              @click="$emit('entity-select', item.entity)"
            >
              <!-- Icon with active pip when collapsed -->
              <span class="relative flex shrink-0 items-center justify-center">
                <component :is="item.icon" class="h-4 w-4" />
                <span
                  v-if="isNavActive(item) && isSidebarCollapsed"
                  class="absolute -left-[14px] top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-primary"
                />
              </span>

              <!-- Label + entity indicator (expanded only) -->
              <template v-if="!isSidebarCollapsed">
                <span class="text-[12.5px] font-medium flex-1">{{ item.label }}</span>

                <!-- Small dot if this entity's panel is open -->
                <span
                  v-if="props.activeEntitySidebar === item.entitySidebar && item.entitySidebar"
                  class="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                />
              </template>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

    <!-- ══ Footer ════════════════════════════════════════════════ -->
    <SidebarFooter class="border-t border-border p-0">
      <SidebarMenu class="px-2 pt-1.5 pb-0">
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Settings"
            class="h-9 rounded-lg transition-all duration-150 text-muted-foreground"
            :class="isSidebarCollapsed ? 'justify-center' : 'gap-2.5 px-2.5'"
            @click="router.push({ name: 'dashboard' })"
          >
            <Settings class="h-4 w-4 shrink-0" />
            <span v-if="!isSidebarCollapsed" class="text-[12.5px] font-medium">Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <UserProfileMenu :collapsed="isSidebarCollapsed" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import {
  CheckSquare, ChevronsUpDown, FolderKanban, FolderSearch,
  GitBranch, Layers, LayoutDashboard, LayoutList,
  Loader2, Plus, Search, Settings,
} from "lucide-vue-next"
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail, useSidebar,
} from "@/components/ui/sidebar"

import { useProjectStore }                   from "@/stores/project"
import { useWorkspaceStore, type Workspace } from "@/stores/workspace"
import UserProfileMenu                       from "../common/UserProfileMenu.vue"

// ── Props & emits ─────────────────────────────────────────────────────────────
const props = defineProps<{ activeEntitySidebar: string | null }>()
defineEmits<{ (e: "entity-select", entity: string): void }>()

// ── Stores & routing ──────────────────────────────────────────────────────────
const router         = useRouter()
const route          = useRoute()
const workspaceStore = useWorkspaceStore()
const projectStore   = useProjectStore()

// ── Sidebar collapsed state ───────────────────────────────────────────────────
const { state: sidebarState } = useSidebar()
const isSidebarCollapsed = computed(() => sidebarState.value === "collapsed")

// ── Nav items ─────────────────────────────────────────────────────────────────
// entitySidebar: which entity panel this item should open (null = no panel)
const navItems = [
  { entity: "dashboard",       label: "Dashboard",       icon: LayoutDashboard, entitySidebar: null         },
  { entity: "projects",        label: "Projects",        icon: FolderKanban,    entitySidebar: "projects"   },
  { entity: "pipelines",       label: "Pipelines",       icon: GitBranch,       entitySidebar: "projects"   },
  { entity: "pipeline-stages", label: "Stages",          icon: Layers,          entitySidebar: "projects"   },
  { entity: "tasks",           label: "Tasks",           icon: CheckSquare,     entitySidebar: "tasks"      },
]

function isNavActive(item: typeof navItems[0]): boolean {
  const name = String(route.name ?? "")
  switch (item.entity) {
    case "dashboard":
      return name === "dashboard"
    case "projects":
      return (name.startsWith("project") || props.activeEntitySidebar === "projects")
        && !name.startsWith("pipeline")
        && !name.startsWith("task")
    case "pipelines":
      return name.startsWith("pipeline") && !name.startsWith("pipeline-stage")
    case "pipeline-stages":
      return name.startsWith("pipeline-stage")
    case "tasks":
      return props.activeEntitySidebar === "tasks" || name.startsWith("task")
    default:
      return false
  }
}

// ── Workspace switcher ────────────────────────────────────────────────────────
const wsOpen            = ref(false)
const wsSearch          = ref("")
const workspacesLoading = ref(false)

function getWsColor(name: string): string {
  const p = ["#7C3AED","#2563EB","#059669","#D97706","#DC2626","#0891B2","#DB2777","#0F766E"]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return p[Math.abs(h) % p.length]
}

const wsInitial     = computed(() => workspaceStore.activeWorkspace?.name?.charAt(0).toUpperCase() ?? "W")
const wsAvatarColor = computed(() =>
  workspaceStore.activeWorkspace ? getWsColor(workspaceStore.activeWorkspace.name) : "#7C3AED"
)
const filteredWorkspaces = computed(() => {
  const q = wsSearch.value.toLowerCase().trim()
  return q
    ? workspaceStore.workspaces.filter(ws => ws.name.toLowerCase().includes(q))
    : workspaceStore.workspaces
})

async function selectWorkspace(ws: Workspace) {
  wsOpen.value = false; wsSearch.value = ""
  await workspaceStore.fetchWorkspace(ws.id)
  router.push({ name: "project-index", params: { workspaceId: ws.id } })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  workspacesLoading.value = true
  try { await workspaceStore.fetchWorkspaces({ page: 1, perPage: 100 }) }
  catch { /**/ }
  finally { workspacesLoading.value = false }
  await projectStore.fetchStatuses().catch(() => {})
})
</script>

<style scoped>
/* Hover: avatar scale */
.ws-avatar { transition: transform 200ms ease; }
.ws-avatar:hover { transform: scale(1.08); }

/* Workspace popover footer buttons */
.ws-footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
}
.ws-footer-btn:hover { background: hsl(var(--accent)); color: hsl(var(--foreground)); }

/* Thin scrollbar */
.ws-scroll {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}
.ws-scroll::-webkit-scrollbar       { width: 3px; }
.ws-scroll::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 99px; }
</style>