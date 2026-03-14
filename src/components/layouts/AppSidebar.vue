<template>
  <Sidebar
    collapsible="icon"
    class="border-r border-border/50 bg-sidebar select-none"
  >
    <!-- ── SidebarHeader (100% unchanged) ──────────────────────────────── -->
    <SidebarHeader class="p-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover v-model:open="wsOpen">
            <PopoverTrigger as-child>
              <SidebarMenuButton
                size="lg"
                role="combobox"
                :aria-expanded="wsOpen"
                class="h-13 w-full rounded-none transition-colors hover:bg-accent/60"
                :class="isSidebarCollapsed ? 'justify-center m-2' : 'gap-3 px-3'"
              >
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-sm ring-1 ring-black/10"
                  :style="{ backgroundColor: workspaceAvatarColor }"
                >
                  {{ workspaceInitial }}
                </div>
                <template v-if="!isSidebarCollapsed">
                  <div class="grid flex-1 text-left leading-tight min-w-0">
                    <span class="truncate text-[12px] font-mono font-semibold tracking-tight text-foreground">
                      {{ workspaceStore.activeWorkspace?.name ?? "Select workspace" }}
                    </span>
                    <span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Workspace
                    </span>
                  </div>
                  <ChevronsUpDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                </template>
              </SidebarMenuButton>
            </PopoverTrigger>

            <PopoverContent
              class="p-1 rounded-md shadow-xl border border-border/60 bg-popover"
              style="width: 268px"
              :side="isSidebarCollapsed ? 'right' : 'bottom'"
              align="start"
              :side-offset="isSidebarCollapsed ? 10 : 2"
            >
              <div class="w-full flex items-center gap-2.5 px-5 py-2 border-b rounded-sm">
                <Search class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Input
                  v-model="wsSearch"
                  placeholder="Search workspaces…"
                  class="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
              </div>
              <div class="max-h-52 overflow-y-auto space-y-1">
                <div
                  v-if="workspacesLoading"
                  class="flex items-center gap-2 px-3 py-3 text-[12px] text-muted-foreground"
                >
                  <Loader2 class="h-3.5 w-3.5 animate-spin" /> Loading workspaces…
                </div>
                <template v-else>
                  <div
                    v-if="filteredWorkspaces.length === 0"
                    class="flex flex-col items-center justify-center py-6 text-muted-foreground/60"
                  >
                    <FolderSearch class="h-6 w-6 mb-2 opacity-70" />
                    <p class="text-center text-[12px] font-medium">No workspaces found</p>
                    <p class="text-[11px] text-muted-foreground/50">Try creating a new workspace</p>
                  </div>
                  <button
                    v-for="ws in filteredWorkspaces"
                    :key="ws.id"
                    type="button"
                    class="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 mt-2 text-left cursor-pointer transition-colors"
                    :class="workspaceStore.activeWorkspace?.id === ws.id ? 'bg-primary-20' : ''"
                    @click="selectWorkspace(ws)"
                  >
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                      :style="{ backgroundColor: getWsColor(ws.name) }"
                    >
                      {{ ws.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="flex-1 truncate text-[13px] font-medium text-foreground">{{ ws.name }}</span>
                    <CheckCircle
                      v-if="workspaceStore.activeWorkspace?.id === ws.id"
                      class="h-3.5 w-3.5 shrink-0 text-primary"
                    />
                  </button>
                </template>
              </div>
              <div class="px-2.5 py-2 flex items-center justify-between border-t rounded-sm">
                <TooltipProvider :delay-duration="200">
                  <div class="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          type="button"
                          variant="link"
                          class="relative cursor-pointer flex items-center justify-center rounded-sm transition-all duration-200"
                          @click="() => { wsOpen = false; goToAddWorkspace() }"
                        >
                          <CirclePlus class="h-4.5 w-4.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                        Add Workspace
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <TooltipProvider :delay-duration="200">
                  <div class="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          type="button"
                          variant="link"
                          class="relative cursor-pointer flex items-center justify-center rounded-sm transition-all duration-200"
                          @click="() => { wsOpen = false; goToWorkspaceIndex() }"
                        >
                          <TextAlignJustify class="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                        View Workspace
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <!-- ── SidebarContent (unchanged except project list items) ──────────── -->
    <SidebarContent class="gap-0 overflow-x-hidden">
      <SidebarGroup class="px-2 pt-2 pb-1.5">
        <SidebarMenu class="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              :is-active="isActiveRoute('dashboard')"
              tooltip="Dashboard"
              class="h-8 gap-2.5 text-[13px] font-medium"
              @click="router.push({ name: 'dashboard' })"
            >
              <LayoutDashboard class="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              :is-active="isActiveRoute('tasks')"
              tooltip="My Tasks"
              class="h-8 gap-2.5 text-[13px] font-medium"
              @click="router.push({ name: 'dashboard' })"
            >
              <CheckSquare class="h-4 w-4 shrink-0" />
              <span>My Tasks</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <div class="mx-3 h-px bg-border/50" />

      <SidebarGroup class="flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-2">
        <!-- Projects label + controls (100% unchanged) -->
        <div
          v-if="workspaceStore.activeWorkspace"
          class="mb-1 flex h-7 items-center justify-between px-1"
        >
          <div v-if="!isSidebarCollapsed" class="flex items-center gap-0">
            <Button
              type="button"
              variant="ghost"
              class="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold uppercase tracking-wide underline transition-colors hover:text-muted-foreground/80"
              @click="goToProjectIndex"
            >
              Projects
            </Button>
            <span
              v-if="projectStore.projects.length > 0 && !isSidebarCollapsed"
              class="rounded-full bg-primary text-white px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-muted-foreground/60 normal-case tracking-normal"
            >
              {{ projectStore.projects.length }}
            </span>
          </div>
          <div v-if="!isSidebarCollapsed" class="flex items-center gap-1.5">
            <DropdownMenu v-model:open="filterOpen">
              <DropdownMenuTrigger as-child>
                <Button
                  type="button"
                  variant="header"
                  size="xs"
                  class="relative cursor-pointer flex items-center justify-center rounded-[9999px] transition-all duration-200"
                  @click="addProject"
                >
                  <Funnel class="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-52 rounded-xl p-1.5 shadow-xl border border-border/60">
                <DropdownMenuLabel class="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Filter by status
                </DropdownMenuLabel>
                <DropdownMenuSeparator class="my-1" />
                <DropdownMenuItem
                  class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] cursor-pointer"
                  :class="!activeStatusFilter ? 'font-semibold' : ''"
                  @select="setFilter(null)"
                >
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50">
                    <span class="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  </span>
                  <span class="flex-1">All statuses</span>
                  <CheckIcon v-if="!activeStatusFilter" class="h-3.5 w-3.5 text-primary shrink-0" />
                </DropdownMenuItem>
                <DropdownMenuSeparator class="my-1" />
                <DropdownMenuItem
                  v-for="st in projectStore.statuses"
                  :key="st.value"
                  class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] cursor-pointer"
                  :class="activeStatusFilter === st.value ? 'font-semibold' : ''"
                  @select="setFilter(st.value)"
                >
                  <span
                    class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                    :style="{ backgroundColor: (st.color ?? '#94a3b8') + '25' }"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: st.color ?? '#94a3b8' }" />
                  </span>
                  <span class="flex-1">{{ st.label }}</span>
                  <CheckIcon v-if="activeStatusFilter === st.value" class="h-3.5 w-3.5 text-primary shrink-0" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="header"
              size="xs"
              class="relative cursor-pointer flex items-center justify-center rounded-[9999px] transition-all duration-200"
              @click="addProject"
            >
              <Plus class="h-3.5 w-3.5" />
            </Button>
          </div>
          <Tooltip v-else>
            <TooltipTrigger as-child>
              <Button
                type="button"
                variant="default"
                size="xs"
                class="relative cursor-pointer flex items-center justify-center h-6 w-6 rounded-[9999px] transition-all duration-200"
                @click="addProject"
              >
                <Plus class="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New project</TooltipContent>
          </Tooltip>
        </div>

        <!-- Active filter chip (100% unchanged) -->
        <div
          v-if="activeStatusFilter && !isSidebarCollapsed"
          class="mb-1.5 flex items-center gap-1 px-1"
        >
          <span
            class="inline-flex cursor-default items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
            :style="{
              backgroundColor: getStatusColor(activeStatusFilter) + '15',
              borderColor: getStatusColor(activeStatusFilter) + '40',
              color: getStatusColor(activeStatusFilter),
            }"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ backgroundColor: getStatusColor(activeStatusFilter) }" />
            {{ getStatusLabel(activeStatusFilter) }}
            <button type="button" class="ml-0.5 rounded-full opacity-60 transition-opacity hover:opacity-100" @click="setFilter(null)">
              <X class="h-2.5 w-2.5" />
            </button>
          </span>
        </div>

        <!-- No workspace selected (100% unchanged) -->
        <SidebarGroupContent v-if="!workspaceStore.activeWorkspace" class="flex-1">
          <Button
            v-if="!isSidebarCollapsed"
            type="button"
            variant="ghost"
            class="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold uppercase tracking-wide underline transition-colors hover:text-muted-foreground/80"
            @click="goToAddWorkspace"
          >
            <CirclePlus class="h-3.5 w-3.5 shrink-0" />
            Add Workspace
          </Button>
          <div
            v-if="!isSidebarCollapsed"
            class="flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground/60"
          >
            <FolderX class="h-5 w-5 opacity-70" />
            <p class="text-[11px] text-center">No workspace selected</p>
          </div>
        </SidebarGroupContent>

        <!-- ── PROJECT LIST — only this block changes ──────────────────── -->
        <SidebarGroupContent
          v-else
          class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <SidebarMenu class="gap-0.5">
            <!-- Loading skeletons (unchanged) -->
            <template v-if="projectsLoading">
              <SidebarMenuItem v-for="i in 5" :key="i">
                <div class="flex items-center gap-2 px-2 py-1.5">
                  <div class="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/20 shrink-0" />
                  <div class="h-3 flex-1 animate-pulse rounded bg-muted-foreground/10" />
                  <div class="h-3 w-5 animate-pulse rounded bg-muted-foreground/10" />
                </div>
              </SidebarMenuItem>
            </template>

            <!-- Empty state (unchanged) -->
            <SidebarMenuItem v-else-if="filteredProjects.length === 0">
              <div class="flex flex-col items-center gap-1.5 px-2 py-6 text-center">
                <FolderOpen class="h-5 w-5 text-muted-foreground/25" />
                <p v-if="!isSidebarCollapsed" class="text-[11px] text-muted-foreground/50">
                  {{ activeStatusFilter ? "No matching projects" : "No projects yet" }}
                </p>
                <button
                  v-if="activeStatusFilter && !isSidebarCollapsed"
                  type="button"
                  class="text-[11px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                  @click="setFilter(null)"
                >
                  Clear filter
                </button>
                <button
                  v-else-if="!isSidebarCollapsed"
                  type="button"
                  class="text-[11px] font-semibold text-primary transition-opacity hover:opacity-80"
                  @click="addProject"
                >
                  + Create project
                </button>
              </div>
            </SidebarMenuItem>

            <!-- ── Collapsible project + pipelines ──────────────────────── -->
            <template v-else>
              <SidebarMenuItem
                v-for="project in filteredProjects"
                :key="project.id"
                class="group/item"
              >
                <!-- Collapsed sidebar: show icon-only button (original behaviour) -->
                <SidebarMenuButton
                  v-if="isSidebarCollapsed"
                  :is-active="isActiveProject(project.id)"
                  :tooltip="project.name"
                  class="h-8 gap-2 text-[13px] font-medium min-w-0"
                  @click="navigateToProject(project)"
                >
                  <span
                    class="h-2 w-2 shrink-0 rounded-full"
                    :style="{ backgroundColor: getStatusColor(safeString(project.status)) }"
                  />
                </SidebarMenuButton>

                <!-- Expanded sidebar: collapsible row -->
                <Collapsible
                  v-else
                  :open="expandedProjects.has(project.id)"
                  class="w-full"
                  @update:open="toggleProject(project)"
                >
                  <!-- Project row -->
                  <div
                    class="group/proj flex items-center w-full rounded-md transition-colors"
                    :class="isActiveProject(project.id) ? 'bg-accent' : 'hover:bg-accent/60'"
                  >
                    <!-- Chevron toggle — only triggers expand/collapse -->
                    <CollapsibleTrigger as-child>
                      <button
                        type="button"
                        class="flex items-center justify-center h-8 w-5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                        @click.stop
                      >
                        <ChevronRight
                          class="h-3 w-3 transition-transform duration-200"
                          :class="expandedProjects.has(project.id) ? 'rotate-90' : ''"
                        />
                      </button>
                    </CollapsibleTrigger>

                    <!-- Project name — clicking navigates to project index -->
                    <button
                      type="button"
                      class="flex flex-1 items-center gap-2 min-w-0 h-8 text-[13px] font-medium"
                      @click="navigateToProject(project)"
                    >
                      <span
                        class="h-2 w-2 shrink-0 rounded-full"
                        :style="{ backgroundColor: getStatusColor(safeString(project.status)) }"
                      />
                      <span class="min-w-0 flex-1 truncate text-left">{{ project.name }}</span>
                      <span
                        v-if="project.task_count !== undefined && !isActiveProject(project.id)"
                        class="shrink-0 text-[10px] tabular-nums text-muted-foreground/40 pr-1"
                      >
                        {{ project.task_count }}
                      </span>
                    </button>

                    <!-- Context menu trigger (unchanged behaviour) -->
                    <button
                      type="button"
                      class="flex items-center justify-center h-8 w-6 shrink-0 text-muted-foreground/30 opacity-0 group-hover/proj:opacity-100 transition-opacity cursor-pointer"
                      @click.stop="openContextMenu(project, $event)"
                    >
                      <MoreHorizontal class="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <!-- Pipeline list (lazy loaded) -->
                  <CollapsibleContent>
                    <div class="ml-5 border-l border-border/40 mt-0.5 mb-1">
                      <!-- Loading state -->
                      <template v-if="pipelinesLoading.has(project.id)">
                        <div v-for="n in 2" :key="n" class="flex items-center gap-2 px-3 py-1.5">
                          <div class="h-2.5 flex-1 animate-pulse rounded bg-muted-foreground/10" />
                        </div>
                      </template>

                      <!-- Empty state -->
                      <template v-else-if="(projectPipelines.get(project.id) ?? []).length === 0">
                        <div class="flex items-center gap-2 px-3 py-2">
                          <span class="text-[11px] text-muted-foreground/40 italic">No pipelines</span>
                          <button
                            type="button"
                            class="ml-auto flex items-center justify-center h-4 w-4 rounded text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                            @click.stop="navigateToPipelineAdd(project.id)"
                          >
                            <Plus class="h-3 w-3" />
                          </button>
                        </div>
                      </template>

                      <!-- Pipeline rows -->
                      <template v-else>
                        <div
                          v-for="pipeline in projectPipelines.get(project.id)"
                          :key="pipeline.id"
                          class="group/pipeline flex items-center gap-1.5 px-2 py-1 mx-1 rounded-md cursor-pointer hover:bg-accent/60 transition-colors"
                          :class="isActivePipeline(pipeline.id) ? 'bg-accent' : ''"
                          @click="navigateToPipelineIndex(project.id)"
                        >
                          <!-- Pipeline dot -->
                          <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" />

                          <!-- Pipeline name -->
                          <span class="flex-1 min-w-0 truncate text-[12px] text-muted-foreground group-hover/pipeline:text-foreground transition-colors">
                            {{ pipeline.name }}
                          </span>

                          <!-- Hover actions: eye + plus -->
                          <div class="flex items-center gap-0.5 opacity-0 group-hover/pipeline:opacity-100 transition-opacity">
                            <button
                              type="button"
                              class="flex items-center justify-center h-4 w-4 rounded text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="View pipeline"
                              @click.stop="navigateToPipelineDetail(pipeline.id)"
                            >
                              <Eye class="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              class="flex items-center justify-center h-4 w-4 rounded text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Add pipeline"
                              @click.stop="navigateToPipelineAdd(project.id)"
                            >
                              <Plus class="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <!-- Add pipeline footer row -->
                        <button
                          type="button"
                          class="flex items-center gap-1.5 w-full px-3 py-1 text-[11px] text-muted-foreground/40 hover:text-primary transition-colors"
                          @click.stop="navigateToPipelineAdd(project.id)"
                        >
                          <Plus class="h-3 w-3" />
                          Add pipeline
                        </button>
                      </template>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </template>
            <!-- ── End collapsible project + pipelines ─────────────────── -->

          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- ── SidebarFooter (100% unchanged) ──────────────────────────────── -->
    <SidebarFooter class="border-t border-border/50 p-0">
      <SidebarMenu class="px-2 pt-1.5 pb-0">
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Settings"
            class="h-8 gap-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
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

    <!-- ── Context menu teleport (100% unchanged) ──────────────────────── -->
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
          class="fixed z-[300] min-w-[180px] overflow-hidden rounded-xl border border-border/60 bg-popover py-1.5 shadow-2xl"
          :style="{ top: `${ctxMenu.y}px`, left: `${ctxMenu.x}px` }"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-accent"
            @click="ctxDetail"
          >
            <Eye class="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> View detail
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-accent"
            @click="ctxEdit"
          >
            <Pencil class="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> Edit project
          </button>
          <div class="mx-2 my-1 h-px bg-border/50" />
          <button
            type="button"
            class="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-destructive transition-colors hover:bg-destructive/10"
            @click="ctxDelete"
          >
            <Trash2 class="h-3.5 w-3.5 shrink-0" /> Delete
          </button>
        </div>
      </Transition>
    </Teleport>
  </Sidebar>
</template>

<script setup lang="ts">
import {
  CheckCircle, CheckIcon, CheckSquare, ChevronsUpDown,
  ChevronRight, CirclePlus, Eye, FolderOpen, FolderSearch,
  FolderX, Funnel, LayoutDashboard, Loader2, MoreHorizontal,
  Pencil, Plus, Search, Settings, TextAlignJustify, Trash2, X,
} from "lucide-vue-next"
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail, useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { notify }             from "@/helpers/toast"
import { usePipelineStore }   from "@/stores/pipeline"
import { useProjectStore, type Project } from "@/stores/project"
import { useWorkspaceStore, type Workspace } from "@/stores/workspace"
import UserProfileMenu        from "../common/UserProfileMenu.vue"
import Button                 from "../ui/button/Button.vue"
import Input                  from "../ui/input/Input.vue"
import TooltipProvider        from "../ui/tooltip/TooltipProvider.vue"

// ── Everything below this line is identical to the original file ──────────────
// except for the three new pipeline sections clearly marked with comments.

const router         = useRouter()
const route          = useRoute()
const workspaceStore = useWorkspaceStore()
const projectStore   = useProjectStore()
// ── NEW ──────────────────────────────────────────────────────────────────────
const pipelineStore  = usePipelineStore()
// ─────────────────────────────────────────────────────────────────────────────

const { state: sidebarState } = useSidebar()
const isSidebarCollapsed = computed(() => sidebarState.value === "collapsed")

// Workspace (all unchanged)
const wsOpen            = ref(false)
const wsSearch          = ref("")
const workspacesLoading = ref(false)

function getWsColor(name: string): string {
  const palette = ["#7C3AED","#2563EB","#059669","#D97706","#DC2626","#0891B2","#DB2777","#0F766E"]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return palette[Math.abs(h) % palette.length]
}

const workspaceInitial     = computed(() => workspaceStore.activeWorkspace?.name?.charAt(0).toUpperCase() ?? "W")
const workspaceAvatarColor = computed(() => workspaceStore.activeWorkspace ? getWsColor(workspaceStore.activeWorkspace.name) : "#7C3AED")
const filteredWorkspaces   = computed(() => {
  const q = wsSearch.value.toLowerCase().trim()
  return q ? workspaceStore.workspaces.filter((ws) => ws.name.toLowerCase().includes(q)) : workspaceStore.workspaces
})

async function selectWorkspace(ws: Workspace) {
  wsOpen.value  = false
  wsSearch.value = ""
  await workspaceStore.fetchWorkspace(ws.id)
  await loadProjects(ws.id)
  router.push({ name: "project-index", params: { workspaceId: ws.id } })
}
function goToAddWorkspace()  { router.push({ name: "workspace-add" }) }
function goToWorkspaceIndex() { router.push({ name: "workspace" }) }

// Status helpers (unchanged)
function safeString(val: unknown): string {
  if (!val) return ""
  if (typeof val === "string") return val
  if (typeof val === "object" && "value" in (val as object)) return String((val as any).value)
  return ""
}
function getStatusColor(sv: string): string {
  return projectStore.statuses.find((s) => s.value === sv)?.color ?? "#94a3b8"
}
function getStatusLabel(sv: string | null): string {
  if (!sv) return ""
  return projectStore.statuses.find((s) => s.value === sv)?.label ?? sv
}

// Filter (unchanged)
const filterOpen        = ref(false)
const activeStatusFilter = ref<string | null>(null)
function setFilter(value: string | null) { activeStatusFilter.value = value; filterOpen.value = false }
const filteredProjects = computed<Project[]>(() =>
  activeStatusFilter.value
    ? projectStore.projects.filter((p) => safeString(p.status) === activeStatusFilter.value)
    : projectStore.projects
)

// Projects (unchanged)
const projectsLoading = ref(false)
async function loadProjects(workspaceId: number) {
  projectsLoading.value = true
  try {
    const res = await projectStore.fetchProjects({ workspaceId, page: 1, perPage: 100 })
    projectStore.projects = res.data ?? []
  } catch { /* silent */ }
  finally { projectsLoading.value = false }
}

function isActiveProject(id: number): boolean {
  const raw = route.params.id
  const rid = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  return !isNaN(rid) && rid === id
}
function isActiveRoute(name: string): boolean { return route.name === name }
function navigateToProject(project: Project) {
  router.push({ name: "project-detail", params: { id: project.id } })
}
function goToProjectIndex() {
  if (workspaceStore.activeWorkspace)
    router.push({ name: "project-index", params: { workspaceId: workspaceStore.activeWorkspace.id } })
}
function addProject() {
  if (workspaceStore.activeWorkspace)
    router.push({ name: "project-add", params: { workspaceId: workspaceStore.activeWorkspace.id } })
  else router.push({ name: "workspace" })
}

// ── NEW — Collapsible project + pipeline state ────────────────────────────────

// Tracks which project rows are expanded
const expandedProjects = ref<Set<number>>(new Set())

// Tracks which projects are currently fetching pipelines
const pipelinesLoading = ref<Set<number>>(new Set())

// projectId → pipeline list cache (lightweight: id + name only)
const projectPipelines = ref<Map<number, { id: number; name: string }[]>>(new Map())

async function loadPipelinesForProject(projectId: number): Promise<void> {
  // Skip if already cached or loading
  if (projectPipelines.value.has(projectId) || pipelinesLoading.value.has(projectId)) return

  pipelinesLoading.value = new Set([...pipelinesLoading.value, projectId])
  try {
    const res = await pipelineStore.fetchPipelines({
      projectId,
      page: 1,
      perPage: 50,
      search: "",
      sortBy: "name",
      sortOrder: "asc",
      filters: [],
    })
    const list = (res.data ?? []).map((p: any) => ({ id: p.id, name: p.name }))
    projectPipelines.value = new Map([...projectPipelines.value, [projectId, list]])
  } catch {
    // On error: store empty array so we don't retry on every hover
    projectPipelines.value = new Map([...projectPipelines.value, [projectId, []]])
  } finally {
    const next = new Set(pipelinesLoading.value)
    next.delete(projectId)
    pipelinesLoading.value = next
  }
}

function toggleProject(project: Project): void {
  const next = new Set(expandedProjects.value)
  if (next.has(project.id)) {
    next.delete(project.id)
  } else {
    next.add(project.id)
    // Lazy-load pipelines on first expand
    loadPipelinesForProject(project.id)
  }
  expandedProjects.value = next
}

function isActivePipeline(pipelineId: number): boolean {
  const raw = route.params.id
  const rid = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  return route.name?.toString().startsWith("pipeline") === true && !isNaN(rid) && rid === pipelineId
}

// Pipeline navigation
function navigateToPipelineIndex(projectId: number): void {
  router.push({ name: "pipeline-index", params: { projectId } })
}
function navigateToPipelineDetail(pipelineId: number): void {
  router.push({ name: "pipeline-detail", params: { id: pipelineId } })
}
function navigateToPipelineAdd(projectId: number): void {
  router.push({ name: "pipeline-add", params: { projectId } })
}

// Invalidate pipeline cache when a project's pipeline list might have changed
// (e.g. after navigating away from pipeline-add or pipeline-detail)
watch(
  () => route.name,
  (newName, oldName) => {
    if (
      oldName?.toString().includes("pipeline") &&
      !newName?.toString().includes("pipeline")
    ) {
      // Clear cache for the active project so it re-fetches on next expand
      const projectIdParam = route.params.projectId
      if (projectIdParam) {
        const pid = Number(Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam)
        if (!isNaN(pid)) {
          const next = new Map(projectPipelines.value)
          next.delete(pid)
          projectPipelines.value = next
        }
      }
    }
  },
)

// ── END NEW ───────────────────────────────────────────────────────────────────

// Context menu (all unchanged)
const ctxMenuRef = ref<HTMLElement | null>(null)
const ctxMenu = reactive<{ open: boolean; project: Project | null; x: number; y: number }>({
  open: false, project: null, x: 0, y: 0,
})
function openContextMenu(project: Project, e: MouseEvent) {
  e.preventDefault(); e.stopPropagation()
  const W = 180, H = 130
  let x = e.clientX + 4, y = e.clientY
  if (x + W > window.innerWidth)  x = e.clientX - W - 4
  if (y + H > window.innerHeight) y = window.innerHeight - H - 8
  Object.assign(ctxMenu, { project, x, y, open: true })
}
function closeCtxMenu() { ctxMenu.open = false; ctxMenu.project = null }
function ctxDetail() {
  if (ctxMenu.project) router.push({ name: "project-detail", params: { id: ctxMenu.project.id } })
  closeCtxMenu()
}
function ctxEdit() {
  if (ctxMenu.project) router.push({ name: "project-edit", params: { id: ctxMenu.project.id } })
  closeCtxMenu()
}
async function ctxDelete() {
  if (!ctxMenu.project) return
  const p = ctxMenu.project
  closeCtxMenu()
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
  if (ctxMenu.open && ctxMenuRef.value && !ctxMenuRef.value.contains(e.target as Node)) closeCtxMenu()
}
function onEsc(e: KeyboardEvent) { if (e.key === "Escape") closeCtxMenu() }

// Lifecycle (all unchanged)
onMounted(async () => {
  document.addEventListener("click", onDocClick)
  document.addEventListener("keydown", onEsc)
  await projectStore.fetchStatuses().catch(() => {})

  workspacesLoading.value = true
  try { await workspaceStore.fetchWorkspaces({ page: 1, perPage: 100 }) }
  catch { /* silent */ }
  finally { workspacesLoading.value = false }

  const rawParam  = route.params.workspaceId
  const routeWsId = rawParam
    ? Array.isArray(rawParam) ? Number(rawParam[0]) : Number(rawParam)
    : null

  if (workspaceStore.isPersistedWorkspaceExpired) workspaceStore.clearActiveWorkspace()

  const persistedWsId = workspaceStore.activeWorkspace?.id ?? null
  const wsId          = routeWsId ?? persistedWsId

  if (wsId) {
    await workspaceStore.fetchWorkspace(wsId).catch(() => {})
    await loadProjects(wsId)
    if (!routeWsId && persistedWsId && route.name === "dashboard") {
      router.replace({ name: "project-index", params: { workspaceId: wsId } })
    }
  }
})
onUnmounted(() => {
  document.removeEventListener("click", onDocClick)
  document.removeEventListener("keydown", onEsc)
})
watch(
  () => route.params.workspaceId,
  async (newId) => {
    if (!newId) return
    const id = Array.isArray(newId) ? Number(newId[0]) : Number(newId)
    if (isNaN(id)) return
    if (workspaceStore.activeWorkspace?.id !== id)
      await workspaceStore.fetchWorkspace(id).catch(() => {})
    await loadProjects(id)
  },
)
</script>