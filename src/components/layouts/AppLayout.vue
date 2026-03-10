<template>
  <SidebarProvider>
    <Sidebar variant="sidebar" collapsible="icon">

      <!-- ══ HEADER — Workspace Combobox Switcher ══════════════════ -->
      <SidebarHeader class="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover v-model:open="wsPopoverOpen">
              <PopoverTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  role="combobox"
                  :aria-expanded="wsPopoverOpen"
                  tooltip="Switch workspace"
                  class="data-[state=open]:bg-sidebar-accent
                         data-[state=open]:text-sidebar-accent-foreground"
                >
                  <!-- Loading state — only show during initial fetch, not on every detail load -->
                  <template v-if="isBootstrapping">
                    <div class="flex aspect-square size-8 items-center justify-center shrink-0">
                      <Loader2 class="size-5 animate-spin text-muted-foreground" />
                    </div>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold text-muted-foreground">Loading…</span>
                    </div>
                  </template>

                  <!-- Active workspace -->
                  <template v-else-if="activeWorkspace">
                    <div
                      class="flex aspect-square size-8 items-center justify-center
                             rounded-lg text-white text-xs font-bold shrink-0 select-none"
                      :style="{ background: wsColor(activeWorkspace.id) }"
                    >
                      {{ wsInitial(activeWorkspace.name) }}
                    </div>
                    <div class="grid flex-1 text-left text-sm leading-tight min-w-0">
                      <span class="truncate font-semibold">{{ activeWorkspace.name }}</span>
                      <span class="truncate text-xs text-muted-foreground capitalize">
                        {{ activeWorkspace.status ?? "Workspace" }}
                      </span>
                    </div>
                    <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
                  </template>

                  <!-- No workspaces yet — tap to go to workspace index -->
                  <template v-else>
                    <div
                      class="flex aspect-square size-8 items-center justify-center
                             rounded-lg bg-muted text-muted-foreground text-xs shrink-0 cursor-pointer"
                      @click.stop="goToWorkspaceIndex"
                    >
                      <Plus class="size-4" />
                    </div>
                    <button
                      class="flex-1 truncate text-sm text-muted-foreground text-left hover:text-foreground transition-colors"
                      @click.stop="goToWorkspaceIndex"
                    >
                      Select workspace
                    </button>
                    <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
                  </template>
                </SidebarMenuButton>
              </PopoverTrigger>

              <!-- Combobox dropdown -->
              <PopoverContent
                class="p-0"
                align="start"
                side="bottom"
                :side-offset="4"
                style="width: var(--radix-popover-trigger-width); min-width: 240px;"
              >
                <Command>
                  <CommandInput placeholder="Search workspaces…" class="h-9" />
                  <CommandList>
                    <CommandEmpty>No workspace found.</CommandEmpty>

                    <CommandGroup heading="Your Workspaces">
                      <CommandItem
                        v-for="ws in workspaceStore.workspaces"
                        :key="ws.id"
                        :value="String(ws.id)"
                        class="gap-3 py-2 cursor-pointer"
                        @select="(ev) => selectWorkspace(ev.detail.value as string)"
                      >
                        <div
                          class="flex size-6 shrink-0 items-center justify-center
                                 rounded-md text-white text-[10px] font-bold select-none"
                          :style="{ background: wsColor(ws.id) }"
                        >
                          {{ wsInitial(ws.name) }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="truncate text-sm font-medium leading-none">{{ ws.name }}</p>
                          <p class="truncate text-xs text-muted-foreground mt-0.5 capitalize">
                            {{ ws.status ?? "active" }}
                          </p>
                        </div>
                        <Check
                          class="ml-auto size-4 shrink-0"
                          :class="ws.id === activeWorkspace?.id ? 'opacity-100' : 'opacity-0'"
                        />
                      </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup>
                      <CommandItem
                        value="__all__"
                        class="gap-2 cursor-pointer text-muted-foreground"
                        @select="() => { wsPopoverOpen = false; router.push({ name: 'workspace' }) }"
                      >
                        <LayoutDashboard class="size-4" />
                        <span class="text-sm">All workspaces</span>
                      </CommandItem>
                      <CommandItem
                        value="__create__"
                        class="gap-2 cursor-pointer text-muted-foreground"
                        @select="() => { wsPopoverOpen = false; router.push({ name: 'workspace-add' }) }"
                      >
                        <Plus class="size-4" />
                        <span class="text-sm">Create workspace</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>

        <!-- ══ Projects ══════════════════════════════════════════ -->
        <SidebarGroup class="flex-1 min-h-0 overflow-hidden flex flex-col">

          <div class="flex items-center justify-between shrink-0">
            <SidebarGroupLabel class="p-0 h-auto">Projects</SidebarGroupLabel>
            <div class="flex items-center group-data-[collapsible=icon]:hidden">
              <Button
                v-for="f in (['all', 'active', 'starred'] as const)"
                :key="f"
                variant="ghost"
                size="sm"
                class="h-5 px-1.5 text-[10px] font-mono capitalize rounded"
                :class="
                  projectFilter === f
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                "
                @click="projectFilter = f"
              >
                {{ f }}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-5 text-muted-foreground hover:text-foreground"
                title="New project"
                :disabled="!activeWorkspace"
                @click="activeWorkspace && router.push({
                  name: 'project-add',
                  params: { workspaceId: activeWorkspace.id }
                })"
              >
                <Plus class="size-3" />
              </Button>
            </div>
          </div>

          <SidebarGroupContent class="overflow-y-auto min-h-0 flex-1">
            <SidebarMenu>

              <!-- No active workspace — show a clickable prompt -->
              <div
                v-if="!activeWorkspace && !isBootstrapping"
                class="px-3 py-6 text-center group-data-[collapsible=icon]:hidden"
              >
                <p class="text-xs text-muted-foreground mb-2">No workspace selected</p>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-7 text-xs"
                  @click="goToWorkspaceIndex"
                >
                  Go to workspaces
                </Button>
              </div>

              <!-- Empty filtered list -->
              <div
                v-else-if="activeWorkspace && filteredProjects.length === 0"
                class="px-3 py-6 text-center group-data-[collapsible=icon]:hidden"
              >
                <p class="text-xs font-medium text-muted-foreground">No projects</p>
                <p class="mt-1 text-[11px] text-muted-foreground/60">
                  {{ projectFilter !== "all" ? "Try a different filter" : "Create your first project" }}
                </p>
              </div>

              <!-- Project rows -->
              <SidebarMenuItem
                v-for="project in filteredProjects"
                :key="project.id"
                class="group/proj"
              >
                <SidebarMenuButton
                  as-child
                  :is-active="activeProjectId === project.id"
                  :tooltip="project.name"
                  class="pr-1"
                >
                  <router-link
                    :to="`/workspace/${activeWorkspace?.id}/projects/${project.id}`"
                    class="flex items-center gap-2 w-full min-w-0"
                  >
                    <span
                      class="size-2 rounded-full shrink-0"
                      :style="{ background: project.color }"
                    />
                    <span class="flex-1 truncate text-sm">{{ project.name }}</span>

                    <Badge
                      v-if="project.status === 'archived'"
                      variant="secondary"
                      class="h-4 px-1 text-[9px] font-mono shrink-0
                             group-data-[collapsible=icon]:hidden"
                    >
                      archived
                    </Badge>

                    <span
                      v-else-if="project.taskCount > 0"
                      class="text-[10px] font-mono text-muted-foreground shrink-0
                             group-hover/proj:hidden group-data-[collapsible=icon]:hidden"
                    >
                      {{ project.taskCount }}
                    </span>

                    <div
                      class="hidden group-hover/proj:flex items-center gap-0.5 shrink-0
                             group-data-[collapsible=icon]:hidden"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-5"
                        :class="project.starred ? 'text-amber-400' : 'text-muted-foreground'"
                        @click.prevent="toggleStar(project, $event)"
                      >
                        <Star
                          class="size-3"
                          :fill="project.starred ? 'currentColor' : 'none'"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-5 text-muted-foreground"
                        @click.prevent="activeWorkspace && router.push({
                          name: 'project-edit',
                          params: { workspaceId: activeWorkspace.id, id: project.id }
                        })"
                      >
                        <MoreHorizontal class="size-3" />
                      </Button>
                    </div>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <!-- ══ Workspace-level nav ════════════════════════════════ -->
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in workspaceNav" :key="item.name">
                <SidebarMenuButton
                  as-child
                  :is-active="isActive(item.href)"
                  :tooltip="item.name"
                >
                  <router-link :to="item.href" class="flex items-center">
                    <component :is="item.icon" />
                    <span class="truncate">{{ item.name }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <!-- ══ FOOTER ════════════════════════════════════════════════ -->
      <SidebarFooter>
        <UserProfileMenu />
      </SidebarFooter>

    </Sidebar>

    <!-- ══ INSET ═════════════════════════════════════════════════════ -->
    <SidebarInset class="overflow-hidden min-w-0 flex flex-col h-screen">
      <header
        class="sticky bg-card top-0 z-40 backdrop-blur-md
               supports-backdrop-filter:bg-card shadow-md"
      >
        <div
          class="flex h-16 items-center gap-3 px-4 transition-[height] ease-linear
                 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
          <SidebarTrigger class="-ml-1" />

          <div class="w-px h-4 bg-border shrink-0" />

          <!-- Breadcrumb -->
          <div class="flex items-center gap-1.5 text-sm min-w-0">
            <template v-if="activeWorkspace">
              <button
                class="text-muted-foreground hover:text-foreground transition-colors
                       truncate max-w-[140px] shrink-0"
                @click="router.push({ name: 'workspace-detail', params: { id: activeWorkspace.id } })"
              >
                {{ activeWorkspace.name }}
              </button>
              <template v-if="activeProjectId">
                <span class="text-muted-foreground/40 shrink-0">/</span>
                <span class="font-medium text-foreground truncate max-w-[180px]">
                  {{ filteredProjects.find((p) => p.id === activeProjectId)?.name ?? "Project" }}
                </span>
              </template>
            </template>
            <template v-else>
              <span class="font-medium text-foreground capitalize">
                {{ String(route.name ?? "").replace(/-/g, " ") }}
              </span>
            </template>
          </div>

          <div class="flex-1" />

          <div class="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" class="relative">
              <Bell class="h-5 w-5" />
              <span
                class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full
                       bg-primary ring-1 ring-card"
              />
            </Button>
          </div>
        </div>
      </header>

      <main class="overflow-hidden min-w-0 flex-1 flex flex-col min-h-0">
        <div class="w-full min-w-0 flex-1 flex flex-col min-h-0">
          <router-view />
        </div>
      </main>
    </SidebarInset>

  </SidebarProvider>
</template>

<script setup lang="ts">
import ModeToggle from "@/components/common/ModeToggle.vue";
import UserProfileMenu from "@/components/common/UserProfileMenu.vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  Plus,
  Star,
  Wrench,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWorkspaceStore, type Workspace } from "@/stores/workspace";

const route          = useRoute();
const router         = useRouter();
const workspaceStore = useWorkspaceStore();

// ─────────────────────────────────────────────────────────────────
// BOOTSTRAP
// True only during the very first load before workspaces are fetched.
// Prevents the sidebar from flashing "Select workspace" on every navigation.
// ─────────────────────────────────────────────────────────────────

const isBootstrapping = ref(true);

onMounted(async () => {
  // Always load the full list for the switcher dropdown
  if (workspaceStore.workspaces.length === 0) {
    await workspaceStore.fetchWorkspaces({ page: 1, perPage: 100 });
  }

  // If we're not on a workspace/:id route and there's no currentWorkspace,
  // auto-activate the first workspace OR redirect to the index.
  const routeId = route.params.id ? Number(route.params.id) : null;

  if (!routeId && !workspaceStore.currentWorkspace) {
    const first = workspaceStore.workspaces[0];
    if (first) {
      // Silently pre-load it so the sidebar populates — but DON'T redirect,
      // let the user's current route render normally.
      await workspaceStore.fetchWorkspace(first.id);
    } else {
      // User has no workspaces at all → send them to the index to create one
      router.push({ name: "workspace" });
    }
  }

  isBootstrapping.value = false;
});

// ─────────────────────────────────────────────────────────────────
// ACTIVE WORKSPACE
// Source of truth: currentWorkspace (set by fetchWorkspace).
// Falls back to first in list only as a display hint, never for routing.
// ─────────────────────────────────────────────────────────────────

const activeWorkspace = computed<Workspace | null>(
  () => workspaceStore.currentWorkspace ?? null,
);

// Sync currentWorkspace when the route carries a workspace id param
watch(
  () => route.params.id as string | undefined,
  async (id) => {
    if (!id) return;
    const numId = Number(id);
    if (workspaceStore.currentWorkspace?.id !== numId) {
      await workspaceStore.fetchWorkspace(numId);
    }
  },
  { immediate: true },
);

// ─────────────────────────────────────────────────────────────────
// NAVIGATION HELPERS
// ─────────────────────────────────────────────────────────────────

const wsPopoverOpen = ref(false);

function goToWorkspaceIndex() {
  wsPopoverOpen.value = false;
  router.push({ name: "workspace" });
}

async function selectWorkspace(wsIdStr: string) {
  const wsId = Number(wsIdStr);
  wsPopoverOpen.value = false;

  if (wsId === activeWorkspace.value?.id) return;

  await workspaceStore.fetchWorkspace(wsId);
  projectFilter.value = "all";
  router.push({ name: "workspace-detail", params: { id: wsId } });
}

// ── Visual helpers ────────────────────────────────────────────────
const PALETTE = [
  "#5b6af0", "#ec4899", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#06b6d4", "#f97316",
];
function wsColor(id: number): string { return PALETTE[id % PALETTE.length]; }
function wsInitial(name: string): string {
  return name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────
// PROJECTS — hardcoded until useProjectStore() is built
// TODO: replace with:
//   const projectStore = useProjectStore()
//   watch(activeWorkspace, (ws) => ws && projectStore.fetchForWorkspace(ws.id), { immediate: true })
//   const filteredProjects = computed(() => projectStore.filtered(projectFilter.value))
// ─────────────────────────────────────────────────────────────────

const allProjects = ref([
  { id: 1, workspaceId: 1, name: "Website Redesign",   color: "#5b6af0", status: "active",   taskCount: 24, starred: true  },
  { id: 2, workspaceId: 1, name: "Mobile App",         color: "#ec4899", status: "active",   taskCount: 41, starred: false },
  { id: 3, workspaceId: 1, name: "API v3 Development", color: "#10b981", status: "active",   taskCount: 17, starred: true  },
  { id: 4, workspaceId: 1, name: "Design System",      color: "#f59e0b", status: "active",   taskCount: 8,  starred: false },
  { id: 5, workspaceId: 1, name: "Q4 Marketing",       color: "#6366f1", status: "archived", taskCount: 5,  starred: false },
]);

const projectFilter = ref<"all" | "active" | "starred">("all");

const filteredProjects = computed(() => {
  const wsId = activeWorkspace.value?.id;
  const list = wsId ? allProjects.value.filter((p) => p.workspaceId === wsId) : [];
  if (projectFilter.value === "active")  return list.filter((p) => p.status === "active");
  if (projectFilter.value === "starred") return list.filter((p) => p.starred);
  return list;
});

const activeProjectId = computed(() => {
  const m = route.path.match(/\/projects\/(\d+)/);
  return m ? Number(m[1]) : null;
});

function toggleStar(project: (typeof allProjects.value)[0], e: Event) {
  e.preventDefault();
  e.stopPropagation();
  project.starred = !project.starred;
}

// ─────────────────────────────────────────────────────────────────
// WORKSPACE-LEVEL NAV
// ─────────────────────────────────────────────────────────────────

const workspaceNav = [
  { name: "Settings", icon: Wrench, href: "/settings" },
];

const isActive = (href: string) => route.path.startsWith(href);
</script>