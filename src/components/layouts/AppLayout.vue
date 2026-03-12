<template>
  <TooltipProvider :delay-duration="0">
    <SidebarProvider>

      <AppSidebar />

      <SidebarInset class="min-w-0 overflow-hidden">

        <header
          class="flex h-11 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 sticky top-0 z-20"
          style="width: 100%"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <SidebarTrigger class="-ml-1 h-7 w-7 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" class="mr-1 data-[orientation=vertical]:h-4" />

            <Breadcrumb v-if="!isAddRoute" class="min-w-0">
              <BreadcrumbList class="flex-nowrap min-w-0">
                <BreadcrumbItem class="min-w-0 shrink-0">
                  <BreadcrumbLink as-child class="text-[13px] font-medium cursor-pointer">
                    <button
                      type="button"
                      class="truncate max-w-50 text-muted-foreground hover:text-foreground transition-colors"
                      @click="goToWorkspace"
                    >
                      {{ workspaceStore.activeWorkspace?.name ?? 'Workspaces' }}
                    </button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="breadcrumbProject && !isAddRoute" class="shrink-0" />
                <BreadcrumbItem v-if="breadcrumbProject && !isAddRoute" class="min-w-0">
                  <BreadcrumbPage class="text-[13px] font-semibold truncate max-w-[200px] block">
                    {{ breadcrumbProject }}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              class="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
              @click="toggleMode"
            >
              <Sun v-if="isDark" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </button>

            <Button
              variant="ghost"
              size="sm"
              class="h-7 px-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              Invite
            </Button>

            <Button
              size="sm"
              class="h-7 px-3 text-[12px] font-semibold gap-1.5"
              @click="handleNewTask"
            >
              <Plus class="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        </header>

        <!-- routeKey forces full remount when workspace changes so page
             components re-run onMounted / watchers with the new workspaceId -->
        <div class="flex flex-1 flex-col overflow-hidden min-w-0">
          <RouterView :key="routeKey" />
        </div>

      </SidebarInset>
    </SidebarProvider>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { Moon, Plus, Sun } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

import AppSidebar from '../layouts/AppSidebar.vue'
import { useProjectStore } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'

const router         = useRouter()
const route          = useRoute()
const workspaceStore = useWorkspaceStore()
const projectStore   = useProjectStore()

// Force full page remount whenever the workspaceId in the URL changes.
// Keying off route.params directly (not the store) ensures the key updates
// the instant the URL changes — before any async store fetch completes.
const routeKey = computed(() => {
  const wsParam = route.params.workspaceId
  const wsId    = Array.isArray(wsParam) ? wsParam[0] : (wsParam ?? workspaceStore.activeWorkspace?.id ?? 'default')
  return `ws-${wsId}`
})

// Theme
const mode = useColorMode({
  selector:     'html',
  attribute:    'class',
  modes:        { light: 'light', dark: 'dark' },
  initialValue: 'light',
  storageKey:   'theme-mode',
})
const isDark = computed(() => mode.value === 'dark')
function toggleMode() { mode.value = isDark.value ? 'light' : 'dark' }

// Breadcrumb
const breadcrumbProject = computed<string | null>(() => {
  const raw = route.params.id
  const id  = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  if (!id || isNaN(id)) return null
  return projectStore.projects.find(p => p.id === id)?.name
    ?? projectStore.activeProject?.name
    ?? null
})

// Hide project breadcrumb segment on any route whose name contains 'add'
const isAddRoute = computed(() =>
  typeof route.name === 'string' && route.name.includes('add'),
)

// Navigation
function goToWorkspace() {
  if (workspaceStore.activeWorkspace) {
    router.push({ name: 'project-index', params: { workspaceId: workspaceStore.activeWorkspace.id } })
  } else {
    router.push({ name: 'workspace' })
  }
}

function handleNewTask() {
  // TODO: open task creation modal
}
</script>