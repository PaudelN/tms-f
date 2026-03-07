<template>
  <div
    class="flex flex-col bg-background text-foreground"
    :class="isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'relative h-full'"
  >

    <!-- ══════════════════════════════════════════════
         TOOLBAR
    ══════════════════════════════════════════════ -->
    <div class="shrink-0 flex items-center gap-0.5 px-3 h-11 border-b border-border bg-card">

      <div class="flex items-center gap-2 mr-1 shrink-0">
        <div class="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
          <LayoutDashboard class="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </div>

      <Separator orientation="vertical" class="h-4 mx-1 shrink-0" />

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground" @click="collapseAll">
              <ChevronsLeft class="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p class="text-xs">Collapse all</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground" @click="expandAll">
              <ChevronsRight class="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p class="text-xs">Expand all</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" class="h-4 mx-1 shrink-0" />

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" class="h-7 px-2.5 gap-1.5 text-muted-foreground" @click="cycleDensity">
              <Rows4      v-if="density === 'compact'"      class="w-3.5 h-3.5" />
              <Rows3      v-else-if="density === 'default'" class="w-3.5 h-3.5" />
              <Rows2      v-else                            class="w-3.5 h-3.5" />
              <span class="text-[11px] font-semibold capitalize">{{ density }}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent><p class="text-xs">Toggle density</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div class="flex-1 min-w-0" />

      <div class="hidden sm:flex items-center gap-1.5 min-w-0 overflow-hidden">
        <button
          v-for="(stage, si) in stages"
          :key="stage.value"
          type="button"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold
                 cursor-pointer whitespace-nowrap select-none shrink-0
                 border-border bg-muted transition-all duration-150"
          :class="collapsedStages.has(stage.value) ? 'opacity-40 line-through text-muted-foreground' : 'text-foreground'"
          :title="collapsedStages.has(stage.value) ? `Expand ${stage.label}` : `Collapse ${stage.label}`"
          @click="toggleStage(stage.value)"
        >
          <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: stageColor(si) }" />
          <span class="truncate max-w-[68px]">{{ stage.label }}</span>
          <span
            class="text-[10px] font-black px-1.5 py-px rounded-full"
            :style="{ background: `${stageColor(si)}1a`, color: stageColor(si) }"
          >{{ col(stage.value).items.length }}</span>
        </button>
      </div>

      <Separator orientation="vertical" class="h-4 mx-1 shrink-0" />

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground" @click="refresh">
              <RefreshCw class="w-3.5 h-3.5" :class="refreshing ? 'animate-spin' : ''" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p class="text-xs">Refresh all columns</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground" @click="isFullscreen = !isFullscreen">
              <Shrink v-if="isFullscreen" class="w-3.5 h-3.5" />
              <Expand v-else              class="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p class="text-xs">{{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

    </div>

    <!-- Search context hint -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-10 opacity-100"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden"
      leave-from-class="max-h-10 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="searchQuery && searchQuery.trim()"
        class="shrink-0 flex items-center gap-2 px-4 py-1.5 border-b border-border"
        style="background: rgb(var(--color-primary) / 0.03)"
      >
        <Search class="w-3.5 h-3.5 text-primary shrink-0" />
        <p class="text-[11px] text-muted-foreground font-medium leading-none">
          Results for
          <span class="font-bold text-foreground">"{{ searchQuery }}"</span>
          <span class="mx-1.5 opacity-30">·</span>
          <span class="font-semibold text-primary">{{ searchResultCount }} task{{ searchResultCount !== 1 ? 's' : '' }}</span>
        </p>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════
         BOARD
    ══════════════════════════════════════════════ -->
    <div class="flex-1 min-h-0 flex gap-2.5 px-3 py-3 overflow-x-auto items-start">

      <template v-for="(stage, si) in stages" :key="stage.value">

        <!-- ── Collapsed strip ── -->
        <div
          v-if="collapsedStages.has(stage.value)"
          class="shrink-0 w-10 flex flex-col items-center rounded-xl border border-border
                 bg-card cursor-pointer transition-colors duration-150 overflow-hidden self-stretch"
          style="min-height: 120px"
          @click="toggleStage(stage.value)"
          @mouseenter="(e) => (e.currentTarget as HTMLElement).style.background = 'rgb(var(--color-accent))'"
          @mouseleave="(e) => (e.currentTarget as HTMLElement).style.background = ''"
        >
          <div class="h-[3px] w-full shrink-0" :style="{ background: stageColor(si) }" />
          <div class="flex flex-col items-center gap-2 py-3 flex-1">
            <component :is="stageIcon(si)" class="w-3.5 h-3.5 shrink-0" :style="{ color: stageColor(si) }" />
            <span
              class="text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
              style="writing-mode: vertical-rl; transform: rotate(180deg)"
              :style="{ color: stageColor(si) }"
            >{{ stage.label }}</span>
            <div
              class="mt-auto mb-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black"
              :style="{ background: stageColor(si) }"
            >{{ col(stage.value).items.length }}</div>
          </div>
        </div>

        <!-- ── Expanded column ── -->
        <div
          v-else
          class="kb-col flex flex-col rounded-xl border border-border bg-card overflow-hidden"
          :style="{
            '--ks': stageColor(si),
            transition: 'box-shadow 0.2s ease',
            boxShadow: isDragging && dragOverStage === stage.value
              ? `0 0 0 2px ${stageColor(si)}, 0 4px 16px -4px rgba(0,0,0,0.1)`
              : '0 1px 3px rgba(0,0,0,0.04)'
          }"
          @dragenter.prevent="dragOverStage = stage.value"
        >

          <!-- Column header -->
          <div class="shrink-0 border-b border-border">
            <div class="h-[3px]" :style="{ background: stageColor(si) }" />

            <div class="px-3 pt-2.5 pb-2 space-y-2">
              <div class="flex items-center gap-2 min-w-0">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ background: `${stageColor(si)}1a`, color: stageColor(si) }"
                >
                  <component :is="stageIcon(si)" class="w-3.5 h-3.5" />
                </div>

                <span class="text-[13px] font-extrabold text-foreground truncate flex-1 leading-none tracking-tight">
                  {{ stage.label }}
                </span>

                <Loader2
                  v-if="col(stage.value).loading"
                  class="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0"
                />

                <span
                  v-else
                  class="shrink-0 text-[11px] font-black px-2 py-0.5 rounded-md leading-none"
                  :style="{ background: `${stageColor(si)}1a`, color: stageColor(si) }"
                >{{ col(stage.value).items.length }}</span>

                <Badge
                  v-if="stage.wipLimit"
                  :variant="col(stage.value).items.length >= stage.wipLimit ? 'destructive' : 'outline'"
                  class="shrink-0 text-[9px] h-5 px-1.5 font-extrabold uppercase tracking-wide"
                >
                  {{ col(stage.value).items.length }}/{{ stage.wipLimit }}
                </Badge>

                <TooltipProvider :delay-duration="300">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button variant="ghost" size="icon" class="h-6 w-6 shrink-0 text-muted-foreground" @click="toggleStage(stage.value)">
                        <PanelLeftClose class="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p class="text-xs">Collapse column</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-[10px] text-muted-foreground font-medium flex-1 truncate leading-none">
                  <template v-if="col(stage.value).loading">Loading…</template>
                  <template v-else-if="searchQuery && searchQuery.trim() && filteredItems(stage.value).length !== col(stage.value).items.length">
                    {{ filteredItems(stage.value).length }} of {{ col(stage.value).items.length }} shown
                  </template>
                  <template v-else>
                    {{ col(stage.value).items.length }} task{{ col(stage.value).items.length !== 1 ? 's' : '' }}
                  </template>
                </span>

                <Button
                  variant="outline"
                  class="h-6 px-2 text-[11px] gap-1 font-semibold shrink-0"
                  :style="{ color: stageColor(si) }"
                >
                  <Plus class="w-3 h-3" />
                  Add
                </Button>

                <TooltipProvider :delay-duration="300">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button variant="ghost" size="icon" class="h-6 w-6 text-muted-foreground shrink-0" @click="loadColumn(stage.value)">
                        <RotateCw class="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p class="text-xs">Reload column</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="ghost" size="icon" class="h-6 w-6 text-muted-foreground shrink-0">
                  <MoreHorizontal class="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Card scroll area -->
          <div class="flex-1 min-h-0 overflow-y-auto px-2.5 pt-2 pb-1">
            <draggable
              :model-value="filteredItems(stage.value)"
              :item-key="itemKey"
              group="kanban"
              :animation="200"
              ghost-class="kb-ghost"
              chosen-class="kb-chosen"
              drag-class="kb-dragging"
              :disabled="features?.dragDrop === false || col(stage.value).loading"
              :data-stage="stage.value"
              class="flex flex-col gap-1.5 min-h-[52px] rounded-lg transition-all duration-200"
              :class="isDragging ? 'kb-dropzone-active' : ''"
              :style="{ paddingBottom: isDragging ? '84px' : '4px', transition: 'padding-bottom 0.2s ease' }"
              @update:model-value="(v: T[]) => setItems(stage.value, v)"
              @start="(_e: Event) => onDragStart(stage.value)"
              @end="onDragEnd"
            >
              <template #item="{ element }">
                <div
                  class="kb-card-wrap group/card rounded-lg"
                  :class="landingCard !== null && landingCard.id === (element as T)[itemKey] ? 'kb-land' : ''"
                  :style="{ '--ks': stageColor(si) }"
                >
                  <div
                    class="relative rounded-lg border border-border bg-background
                           cursor-grab active:cursor-grabbing"
                    :class="densityPadding"
                    style="transition: border-color 0.15s ease, box-shadow 0.15s ease"
                  >
                    <div
                      class="absolute left-0 rounded-r-sm pointer-events-none"
                      style="width: 2.5px; top: 20%; bottom: 20%; transition: opacity 0.15s ease, top 0.15s ease, bottom 0.15s ease; opacity: 0.25;"
                      :style="{ background: stageColor(si) }"
                    />
                    <div
                      class="absolute left-0 rounded-r-sm pointer-events-none opacity-0 group-hover/card:opacity-100"
                      style="width: 2.5px; top: 8%; bottom: 8%; transition: opacity 0.15s ease;"
                      :style="{ background: stageColor(si) }"
                    />

                    <div
                      v-if="$slots['card-actions']"
                      class="absolute top-2 right-2 flex gap-1 z-10
                             opacity-0 group-hover/card:opacity-100 transition-opacity duration-150"
                      @click.stop
                      @mousedown.stop
                      @pointerdown.stop
                    >
                      <slot name="card-actions" :item="element" :stage="stage.value" :stage-meta="stage" />
                    </div>

                    <div class="pl-3">
                      <slot name="card" :item="element" :stage="stage.value" :stage-meta="stage">
                        <p class="text-sm font-semibold text-foreground truncate">
                          {{ (element as Record<string, unknown>).name ?? (element as T)[itemKey] }}
                        </p>
                      </slot>
                    </div>
                  </div>
                </div>
              </template>

              <template #header>
                <div v-if="col(stage.value).loading" class="flex flex-col gap-1.5 pb-1">
                  <div
                    v-for="n in 3"
                    :key="n"
                    class="rounded-lg bg-muted border border-border animate-pulse"
                    :style="{
                      height: density === 'compact' ? '56px' : density === 'comfortable' ? '92px' : '72px',
                      animationDelay: `${n * 80}ms`
                    }"
                  />
                </div>
              </template>

              <template #footer>
                <Transition
                  enter-active-class="transition-opacity duration-150"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                >
                  <div
                    v-if="!col(stage.value).loading && filteredItems(stage.value).length === 0 && !col(stage.value).error"
                    class="flex flex-col items-center gap-2 py-8 px-3 mb-1
                           border-2 border-dashed border-border rounded-lg"
                  >
                    <div
                      class="w-9 h-9 rounded-xl flex items-center justify-center"
                      :style="{ background: `${stageColor(si)}14`, color: stageColor(si) }"
                    >
                      <component :is="stageIcon(si)" class="w-4.5 h-4.5" />
                    </div>
                    <p class="text-[11px] font-semibold text-muted-foreground text-center">
                      {{ searchQuery && searchQuery.trim() ? 'No matching tasks' : 'Nothing here yet' }}
                    </p>
                    <p
                      v-if="!(searchQuery && searchQuery.trim())"
                      class="text-[10px] text-muted-foreground/60 text-center"
                    >Drop a card or add a new task</p>
                  </div>
                </Transition>

                <div
                  v-if="col(stage.value).error"
                  class="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1.5
                         border border-destructive/25 bg-destructive/5"
                >
                  <AlertCircle class="w-3.5 h-3.5 text-destructive shrink-0" />
                  <p class="text-[11px] text-destructive font-semibold flex-1 truncate">{{ col(stage.value).error }}</p>
                  <button type="button" class="text-[10px] font-bold text-destructive hover:underline shrink-0" @click="loadColumn(stage.value)">Retry</button>
                </div>

                <button type="button" class="kb-add-btn group/add">
                  <Plus class="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/add:rotate-90" />
                  Add task
                </button>

                <slot name="column-footer" :stage="stage.value" :stage-meta="stage" />
              </template>
            </draggable>
          </div>

          <slot name="column-action" :stage="stage.value" :stage-meta="stage" />
        </div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: number | string; [key: string]: any }">
import { computed, reactive, ref, watch } from 'vue'
import draggable from 'vuedraggable'

import Button    from '@/components/ui/button/Button.vue'
import Badge     from '@/components/ui/badge/Badge.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import {
  LayoutDashboard,
  ChevronsLeft, ChevronsRight,
  Rows4, Rows3, Rows2,
  RefreshCw, Expand, Shrink, Search,
  Loader2, Plus, RotateCw, MoreHorizontal,
  PanelLeftClose, AlertCircle,
  ClipboardList, Zap, Settings2, CheckCircle2, CircleCheck,
} from 'lucide-vue-next'

import type { Component } from 'vue'
import type {
  KanbanConfig,
  KanbanFeatures,
  KanbanMoveEvent,
  KanbanReorderEvent,
  KanbanStageDefinition,
} from './types/kanban.types'
import type { UniversalApiResponse, UniversalFetchParams } from './types/universal.types'

// ── Local types ───────────────────────────────────────────────────────────────

interface SortableEvent {
  from:     Element
  to:       Element
  newIndex: number
  oldIndex: number
}

// Items kept as unknown[] internally to avoid Vue reactive unwrap fighting generics.
// Every read/write casts back to T[].
interface ColumnState {
  items:   unknown[]
  loading: boolean
  error:   string | null
}

interface Props {
  fetchFn:         (params: UniversalFetchParams) => Promise<UniversalApiResponse<T>>
  stages:          KanbanStageDefinition[]
  config?:         KanbanConfig
  features?:       KanbanFeatures
  itemKey?:        string
  searchQuery?:    string
  externalFilter?: Record<string, any> | null
}

// ── Props / emits ─────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<Props>(), {
  itemKey:     'id',
  searchQuery: '',
  features:    () => ({ dragDrop: true, intraStageReorder: true }),
})

const emit = defineEmits<{
  (e: 'move',    event: KanbanMoveEvent<T>): void
  (e: 'reorder', event: KanbanReorderEvent): void
}>()

// ── Column state ──────────────────────────────────────────────────────────────
// Using unknown[] for items inside reactive() sidesteps Vue's UnwrapRefSimple<T>
// generic constraint error. All public helpers cast to T[] at the boundary.

const columnData      = reactive<Record<string, ColumnState>>({})
const resolvedPerPage = computed<number>(() => props.config?.perPage ?? 50)

function col(sv: string): ColumnState {
  if (!columnData[sv]) {
    columnData[sv] = { items: [], loading: false, error: null }
  }
  return columnData[sv] as ColumnState
}

// Read items cast to T[]
function colItems(sv: string): T[] {
  return col(sv).items as T[]
}

// Write items — always cast to unknown[] for storage
function setItems(sv: string, items: T[]): void {
  col(sv).items = items as unknown[]
}

async function loadColumn(sv: string): Promise<void> {
  const s = col(sv)
  s.loading = true
  s.error   = null
  try {
    const r = await props.fetchFn({
      page:        1,
      perPage:     resolvedPerPage.value,
      search:      props.searchQuery ?? '',
      sortBy:      null,
      sortOrder:   null,
      kanbanStage: sv,
      // null → undefined: UniversalFetchParams.filters is typed as | undefined
      filters:     props.externalFilter ?? undefined,
    })
    s.items = Array.isArray(r.data) ? (r.data as unknown[]) : []
  } catch {
    s.error = 'Failed to load.'
  } finally {
    s.loading = false
  }
}

// Reload all columns when stages list changes (e.g. on mount)
watch(
  () => props.stages,
  (stages: KanbanStageDefinition[]) => {
    for (const st of stages) {
      const ex = columnData[st.value]
      if (!ex || (!ex.loading && ex.items.length === 0 && !ex.error)) {
        loadColumn(st.value)
      }
    }
  },
  { immediate: true },
)

// Shared debounce timer for both search and filter watchers
let reloadDebounceTimer: ReturnType<typeof setTimeout> | null = null

function scheduleReload(): void {
  if (reloadDebounceTimer) clearTimeout(reloadDebounceTimer)
  reloadDebounceTimer = setTimeout(() => {
    for (const st of props.stages) loadColumn(st.value)
  }, props.config?.debounceMs ?? 400)
}

watch(() => props.searchQuery, scheduleReload)
watch(() => props.externalFilter, scheduleReload, { deep: true })

// ── Search (client-side pass) ─────────────────────────────────────────────────

function filteredItems(sv: string): T[] {
  const q = (props.searchQuery ?? '').trim().toLowerCase()
  if (!q) return colItems(sv)
  return colItems(sv).filter((item) =>
    Object.values(item as Record<string, unknown>).some((v) =>
      String(v ?? '').toLowerCase().includes(q)
    )
  )
}

const searchResultCount = computed<number>(() =>
  props.stages.reduce((n, s) => n + filteredItems(s.value).length, 0)
)

// ── UI state ──────────────────────────────────────────────────────────────────

type Density = 'compact' | 'default' | 'comfortable'

const density         = ref<Density>('default')
const isFullscreen    = ref<boolean>(false)
const collapsedStages = ref<Set<string>>(new Set<string>())
const isDragging      = ref<boolean>(false)
const dragOverStage   = ref<string | null>(null)
const landingCard     = ref<{ id: string | number } | null>(null)
const refreshing      = ref<boolean>(false)

const densityPadding = computed<string>(() => {
  const map: Record<Density, string> = {
    compact:     'px-3 py-2',
    default:     'px-3.5 py-3',
    comfortable: 'px-4 py-4',
  }
  return map[density.value]
})

function cycleDensity(): void {
  const order: Density[] = ['compact', 'default', 'comfortable']
  density.value = order[(order.indexOf(density.value) + 1) % order.length]
}

function toggleStage(sv: string): void {
  const next = new Set(collapsedStages.value)
  next.has(sv) ? next.delete(sv) : next.add(sv)
  collapsedStages.value = next
}

function collapseAll(): void {
  collapsedStages.value = new Set(props.stages.map((s) => s.value))
}

function expandAll(): void {
  collapsedStages.value = new Set<string>()
}

// ── Stage theming ─────────────────────────────────────────────────────────────

const cssVarNames: string[] = [
  '--color-primary',
  '--color-ring',
  '--color-primary',
  '--color-destructive',
  '--color-ring',
]

function stageVar(i: number): string {
  const st = props.stages[i]
  if (st?.dot?.includes('violet') || st?.dot?.includes('purple'))   return '--color-primary'
  if (st?.dot?.includes('red')    || st?.dot?.includes('destruct')) return '--color-destructive'
  return cssVarNames[i % cssVarNames.length]
}

function stageColor(i: number): string {
  return `rgb(var(${stageVar(i)}))`
}

const iconList: Component[] = [ClipboardList, Zap, Settings2, CheckCircle2, CircleCheck]

function stageIcon(i: number): Component {
  return iconList[i % iconList.length]
}

// ── Drag ──────────────────────────────────────────────────────────────────────

let dragFromStage: string | null = null

function onDragStart(sv: string): void {
  dragFromStage       = sv
  isDragging.value    = true
  dragOverStage.value = sv
}

function onDragEnd(ev: SortableEvent): void {
  const from = ev.from.getAttribute('data-stage') ?? dragFromStage
  const to   = ev.to.getAttribute('data-stage')   ?? from

  dragFromStage       = null
  isDragging.value    = false

  if (to) {
    const dropped = colItems(to)[ev.newIndex]
    if (dropped) {
      landingCard.value = { id: dropped[props.itemKey] as string | number }
      setTimeout(() => { landingCard.value = null }, 380)
    }
  }

  dragOverStage.value = null
  if (!from || !to) return

  if (from !== to) {
    const moved = colItems(to)[ev.newIndex]
    if (!moved) return
    const meta = props.stages.find((s) => s.value === to)
    if (meta?.wipLimit && colItems(to).length > meta.wipLimit) {
      loadColumn(from)
      loadColumn(to)
      return
    }
    emit('move', { item: moved, fromStage: from, toStage: to, newIndex: ev.newIndex })
  } else if (props.features?.intraStageReorder !== false) {
    emit('reorder', {
      stage:      to,
      orderedIds: colItems(to).map((i) => i[props.itemKey] as string | number),
    })
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

const totalItems = computed<number>(() =>
  props.stages.reduce((n, s) => n + colItems(s.value).length, 0)
)

const columnCounts = computed<Record<string, number>>(() => {
  const c: Record<string, number> = {}
  for (const s of props.stages) c[s.value] = colItems(s.value).length
  return c
})

function refreshColumn(sv: string): void { loadColumn(sv) }

async function refresh(): Promise<void> {
  refreshing.value = true
  await Promise.all(props.stages.map((s) => loadColumn(s.value)))
  refreshing.value = false
}

defineExpose({ refresh, refreshColumn, columnCounts, totalItems })
</script>

<style>
.kb-col {
  flex: 1 0 220px;
  max-width: 370px;
  height: 100%;
  max-height: calc(100vh - 7.5rem);
}

.kb-card-wrap {
  will-change: transform;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.kb-card-wrap:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px -3px rgba(0,0,0,0.08), 0 2px 5px -2px rgba(0,0,0,0.05);
}
.kb-card-wrap:hover > div {
  border-color: var(--ks);
}

.kb-add-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 2px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px dashed rgb(var(--color-border));
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--color-muted-foreground));
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.kb-add-btn:hover {
  border-color: var(--ks);
  color: var(--ks);
  background: rgb(var(--color-muted));
}

.kb-dropzone-active {
  background-image: radial-gradient(circle, rgb(var(--color-border)) 1px, transparent 1px);
  background-size: 16px 16px;
  background-position: center;
}

.kb-ghost {
  opacity: 1 !important;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0px, transparent 5px,
    rgb(var(--color-muted)) 5px, rgb(var(--color-muted)) 6px
  ) !important;
  border: 1.5px dashed rgb(var(--color-border)) !important;
  border-radius: 8px !important;
  box-shadow: none !important;
}
.kb-ghost > * { opacity: 0 !important; }

.kb-chosen {
  opacity: 0.97 !important;
  transform: scale(1.012) translateY(-1px) rotate(1deg) !important;
  box-shadow:
    0 8px 20px -4px rgba(0,0,0,0.1),
    0 3px 8px  -2px rgba(0,0,0,0.06) !important;
  cursor: grabbing !important;
  z-index: 200 !important;
  border-radius: 8px !important;
  background: rgb(var(--color-background)) !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease !important;
}

.kb-dragging {
  transform: scale(0.975) translateY(-3px) rotate(2.5deg) !important;
  box-shadow:
    0 24px 48px -10px rgba(0,0,0,0.16),
    0  8px 20px  -5px rgba(0,0,0,0.1),
    0  0   0  1.5px rgb(var(--color-primary) / 0.35) !important;
  opacity: 0.95 !important;
  z-index: 9999 !important;
  cursor: grabbing !important;
  border-radius: 8px !important;
  background: rgb(var(--color-background)) !important;
  transition: none !important;
  will-change: transform !important;
}

@keyframes kb-settle {
  0%   { transform: translateY(-4px) scale(1.018) rotate(1.5deg); }
  55%  { transform: translateY(1px)  scale(0.993) rotate(-0.3deg); }
  100% { transform: translateY(0)    scale(1)     rotate(0deg); }
}
.kb-land {
  animation: kb-settle 0.28s cubic-bezier(0.34, 1.4, 0.64, 1) forwards !important;
}
</style>