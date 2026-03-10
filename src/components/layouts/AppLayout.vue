<template>
  <TooltipProvider :delay-duration="0">
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>

        <!-- ── Header ───────────────────────────────────────── -->
        <header class="flex h-11 shrink-0 items-center gap-2 border-b bg-background px-4">

          <!-- Left: trigger + breadcrumb -->
          <div class="flex items-center gap-2 min-w-0">
            <SidebarTrigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-1 data-[orientation=vertical]:h-4" />

            <Breadcrumb class="min-w-0">
              <BreadcrumbList class="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    as-child
                    class="text-[13px] font-medium cursor-pointer"
                  >
                    <button type="button" @click="goToWorkspace">
                      {{ workspaceStore.activeWorkspace?.name ?? 'Workspaces' }}
                    </button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="breadcrumbProject" />
                <BreadcrumbItem v-if="breadcrumbProject">
                  <BreadcrumbPage class="text-[13px] font-semibold truncate max-w-[200px]">
                    {{ breadcrumbProject }}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <!-- Right: theme toggle + invite + new task -->
          <div class="ml-auto flex items-center gap-1.5 shrink-0">

            <!-- Dark / Light mode toggle -->
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
              @click="toggleMode"
            >
              <Sun v-if="isDark" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-[13px] text-muted-foreground"
            >
              Invite
            </Button>

            <Button
              size="sm"
              class="h-7 px-3 text-[12px] font-semibold gap-1"
              @click="handleNewTask"
            >
              <Plus class="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        </header>

        <!-- ── Page content ─────────────────────────────────── -->
        <div class="flex flex-1 flex-col overflow-hidden">
          <RouterView />
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

// ── shadcn-vue ────────────────────────────────────────────────────────────────
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

// ── Local ─────────────────────────────────────────────────────────────────────
import AppSidebar from '../layouts/AppSidebar.vue'
import { useProjectStore } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'

const router = useRouter()
const route  = useRoute()

const workspaceStore = useWorkspaceStore()
const projectStore   = useProjectStore()

// ── Theme ─────────────────────────────────────────────────────────────────────
const mode = useColorMode({
  selector:     'html',
  attribute:    'class',
  modes:        { light: 'light', dark: 'dark' },
  initialValue: 'light',
  storageKey:   'theme-mode',
})

const isDark = computed(() => mode.value === 'dark')

function toggleMode() {
  mode.value = isDark.value ? 'light' : 'dark'
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
const breadcrumbProject = computed<string | null>(() => {
  const raw = route.params.id
  const id  = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  if (!id || isNaN(id)) return null
  const found = projectStore.projects.find((p) => p.id === id)
  if (found) return found.name
  return projectStore.activeProject?.name ?? null
})

// ── Navigation ────────────────────────────────────────────────────────────────
function goToWorkspace(): void {
  if (workspaceStore.activeWorkspace) {
    router.push({ name: 'project-index', params: { workspaceId: workspaceStore.activeWorkspace.id } })
  } else {
    router.push({ name: 'workspace' })
  }
}

function handleNewTask(): void {
  // TODO: wire to task creation modal
}
</script>