<template>
  <aside
    class="ts-root relative flex flex-col h-full border-r border-border bg-sidebar shrink-0 overflow-hidden"
    :style="{ width: isExpanded ? '200px' : '52px' }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Header -->
    <div
      class="flex h-[52px] shrink-0 items-center border-b border-border"
      :class="isExpanded ? 'px-3 gap-2' : 'justify-center'"
    >
      <TooltipProvider :delay-duration="0">
        <Tooltip>
          <TooltipTrigger as-child>
            <button type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <CheckSquare class="h-4 w-4 text-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent v-if="!isExpanded" side="right">Tasks</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <template v-if="isExpanded">
        <span class="flex-1 truncate text-[12px] font-semibold text-foreground">Tasks</span>
        <TooltipProvider :delay-duration="0">
          <Tooltip>
            <TooltipTrigger as-child>
              <button type="button" class="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="togglePin">
                <PinOff v-if="isPinned" class="h-3.5 w-3.5" />
                <Pin v-else class="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{{ isPinned ? 'Unpin' : 'Pin' }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button type="button" class="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="emit('close')">
          <X class="h-3.5 w-3.5" />
        </button>
      </template>
    </div>

    <!-- COLLAPSED: icon rail -->
    <div v-if="!isExpanded" class="flex flex-col items-center gap-0.5 p-1.5 pt-2">
      <TooltipProvider v-for="item in navItems" :key="item.key" :delay-duration="0">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
              :class="activeKey === item.key ? 'bg-accent' : 'hover:bg-accent'"
              @click="handleNav(item)"
            >
              <component :is="item.icon" class="h-4 w-4 shrink-0" :class="item.colorClass" />
              <span v-if="activeKey === item.key" class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" :side-offset="8">
            <p class="font-medium text-[12px]">{{ item.label }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <!-- EXPANDED: labeled list -->
    <div v-else class="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div class="px-2 pt-2 pb-1 shrink-0">
        <p class="px-1 text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">Categories</p>
      </div>
      <Separator />
      <div class="flex flex-col gap-0.5 p-1.5 pt-1.5">
        <button
          v-for="item in navItems"
          :key="item.key"
          type="button"
          class="relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors w-full"
          :class="activeKey === item.key ? 'bg-accent' : 'hover:bg-accent'"
          @click="handleNav(item)"
        >
          <span v-if="activeKey === item.key" class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
          <component :is="item.icon" class="h-4 w-4 shrink-0" :class="item.colorClass" />
          <span class="text-[12.5px] font-medium text-foreground truncate">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  AlertCircle, CheckCircle2, CheckSquare, CircleMinus,
  Pin, PinOff, UserCheck, X,
} from "lucide-vue-next"
import { computed, onMounted, ref, type Component } from "vue"
import { useRoute, useRouter } from "vue-router"

import { Separator }                                     from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { usePipelineStore } from "@/stores/pipeline"
import { useProjectStore }  from "@/stores/project"

const emit = defineEmits<{ (e: "close"): void }>()

const router        = useRouter()
const route         = useRoute()
const projectStore  = useProjectStore()
const pipelineStore = usePipelineStore()

// Expand: hover + pin
const isPinned  = ref(false)
const isHovered = ref(false)
const isExpanded = computed(() => isPinned.value || isHovered.value)
let hoverTimer: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() { if (hoverTimer) clearTimeout(hoverTimer); isHovered.value = true }
function onMouseLeave() {
  if (isPinned.value) return
  hoverTimer = setTimeout(() => { isHovered.value = false }, 120)
}
function togglePin() { isPinned.value = !isPinned.value; if (!isPinned.value) isHovered.value = false }

// Nav items (no functionality yet — all navigate to task index)
interface NavItem { key: string; label: string; icon: Component; colorClass: string }

const navItems: NavItem[] = [
  { key: "my-tasks",      label: "My Tasks",        icon: CheckSquare,  colorClass: "text-primary"          },
  { key: "assigned-by-me",label: "Assigned By Me",  icon: UserCheck,    colorClass: "text-blue-500"         },
  { key: "overdue",       label: "Overdue",          icon: AlertCircle,  colorClass: "text-destructive"      },
  { key: "inactive",      label: "Inactive",         icon: CircleMinus,  colorClass: "text-muted-foreground" },
  { key: "completed",     label: "Completed",        icon: CheckCircle2, colorClass: "text-green-500"        },
]

const activeKey = ref("my-tasks")

// Resolve a pipeline id from route or store for navigation
function getContextPipelineId(): number | null {
  const raw = route.params.pipelineId
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  if (!isNaN(n) && n > 0) return n
  return pipelineStore.activePipeline?.id ?? null
}

function handleNav(item: NavItem) {
  activeKey.value = item.key
  const pipelineId = getContextPipelineId()
  if (pipelineId) {
    router.push({ name: "task-index", params: { pipelineId } })
  }
  // If no pipeline context yet, stay put — functionality to be added later
}

onMounted(async () => {
  // Preload pipelines for context — silent, best-effort
  if (projectStore.projects.length === 0) return
  try {
    await pipelineStore.fetchPipelines({
      projectId: projectStore.projects[0].id,
      page: 1, perPage: 20,
      search: "", sortBy: "name", sortOrder: "asc", filters: [],
    })
  } catch { /**/ }
})
</script>

<style scoped>
.ts-root { transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1); }
</style>