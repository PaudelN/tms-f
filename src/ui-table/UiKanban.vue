<template>
  <div
    class="aurora-root flex flex-col"
    :class="isFullscreen ? 'aurora-fullscreen' : 'aurora-normal'"
  >
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- TOOLBAR                                                         -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="aurora-toolbar shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border bg-background">

      <!-- Left cluster -->
      <div class="flex items-center gap-1 shrink-0">
        <!-- Collapse all -->
        <button type="button" class="aurora-btn aurora-btn-ghost" title="Collapse all columns" @click="collapseAll">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        </button>
        <!-- Expand all -->
        <button type="button" class="aurora-btn aurora-btn-ghost" title="Expand all columns" @click="expandAll">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>

        <div class="aurora-divider" />

        <!-- Density -->
        <button type="button" class="aurora-btn aurora-btn-ghost aurora-btn-labeled" :title="`Density: ${density}`" @click="cycleDensity">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path v-if="density === 'compact'"      stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            <path v-else-if="density === 'default'" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else                            stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
          </svg>
          <span class="aurora-btn-label">{{ density }}</span>
        </button>

        <div class="aurora-divider" />

        <!-- Filter -->
        <button
          type="button"
          class="aurora-btn aurora-btn-ghost aurora-btn-labeled"
          :class="filterActive ? 'aurora-btn-active' : ''"
          @click="filterActive = !filterActive"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span class="aurora-btn-label">Filter</span>
        </button>

        <!-- Sort -->
        <button
          type="button"
          class="aurora-btn aurora-btn-ghost aurora-btn-labeled"
          :class="sortActive ? 'aurora-btn-active' : ''"
          @click="sortActive = !sortActive"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
          </svg>
          <span class="aurora-btn-label">Sort</span>
        </button>

        <!-- Group -->
        <button
          type="button"
          class="aurora-btn aurora-btn-ghost aurora-btn-labeled"
          :class="groupActive ? 'aurora-btn-active' : ''"
          @click="groupActive = !groupActive"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
          </svg>
          <span class="aurora-btn-label">Group</span>
        </button>

        <div class="aurora-divider" />

        <!-- Search toggle -->
        <button
          type="button"
          class="aurora-btn aurora-btn-ghost"
          :class="showSearch ? 'aurora-btn-active' : ''"
          title="Search"
          @click="showSearch = !showSearch"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
        </button>

        <!-- Inline search input -->
        <transition name="aurora-search-slide">
          <div v-if="showSearch" class="aurora-search-wrap">
            <svg class="aurora-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search cards…"
              class="aurora-search-input"
            />
            <button v-if="searchQuery" type="button" class="aurora-search-clear" @click="searchQuery = ''">
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </transition>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Right cluster -->
      <div class="flex items-center gap-1 shrink-0">
        <!-- Total items -->
        <span class="aurora-total-badge">
          {{ totalItems }} items
        </span>

        <div class="aurora-divider" />

        <!-- Refresh -->
        <button type="button" class="aurora-btn aurora-btn-ghost" title="Refresh all columns" @click="refresh">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            :class="refreshing ? 'animate-spin' : ''">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>

        <!-- Export -->
        <button type="button" class="aurora-btn aurora-btn-ghost" title="Export board">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>

        <!-- Fullscreen -->
        <button type="button" class="aurora-btn aurora-btn-ghost" @click="isFullscreen = !isFullscreen">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              :d="isFullscreen
                ? 'M9 9V4.5M9 9H4.5M9 15v4.5M9 15H4.5M15 9h4.5M15 9V4.5M15 15h4.5M15 15v4.5'
                : 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter bar (contextual) -->
    <transition name="aurora-filterbar">
      <div v-if="filterActive || sortActive" class="aurora-filterbar shrink-0 border-b border-border bg-muted px-4 py-2 flex items-center gap-3">
        <span class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {{ filterActive ? 'Filters' : 'Sort' }}
        </span>
        <Badge variant="outline" class="text-[10px] cursor-pointer hover:bg-accent" @click="filterActive = false; sortActive = false">
          Clear all
        </Badge>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- BOARD                                                           -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="aurora-board flex gap-3 px-4 py-4 overflow-x-auto flex-1 min-h-0">

      <template v-for="(stage, si) in stages" :key="stage.value">

        <!-- ── COLLAPSED state → thin vertical strip ── -->
        <div
          v-if="collapsedStages.has(stage.value)"
          class="aurora-collapsed-strip shrink-0 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300"
          @click="toggleStage(stage.value)"
        >
          <!-- Stage icon -->
          <div class="aurora-col-icon-sm" :style="{ color: `rgb(var(${stageVar(si)}))` }">
            <component :is="'svg'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="stageIcon(si)" />
            </component>
          </div>
          <!-- Rotated label -->
          <span class="aurora-rotated-label" :style="{ color: `rgb(var(${stageVar(si)}))` }">
            {{ stage.label }}
          </span>
          <!-- Count -->
          <div class="aurora-collapsed-count" :style="{ background: `rgb(var(${stageVar(si)}))` }">
            {{ col(stage.value).items.length }}
          </div>
        </div>

        <!-- ── EXPANDED column ── -->
        <div
          v-else
          class="aurora-column flex flex-col shrink-0 rounded-2xl border border-border bg-card transition-all duration-200"
          :class="isDragging && dragOverStage === stage.value ? 'aurora-col-drop-active' : ''"
          :style="{ width: resolvedColumnWidth }"
          @dragenter.prevent="dragOverStage = stage.value"
        >
          <!-- ── Column Header ── -->
          <div
            class="shrink-0 rounded-t-2xl border-b border-border"
            :style="{ background: `rgb(var(${stageVar(si)}) / 0.06)` }"
          >
            <!-- Top accent line -->
            <div class="h-1 rounded-t-2xl" :style="{ background: `rgb(var(${stageVar(si)}))` }" />

            <div class="px-4 pt-3 pb-3 flex flex-col gap-2">
              <!-- Row 1: icon + label + collapse -->
              <div class="flex items-center gap-2.5">
                <!-- Stage icon -->
                <div
                  class="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border"
                  :style="{
                    background: `rgb(var(${stageVar(si)}) / 0.12)`,
                    borderColor: `rgb(var(${stageVar(si)}) / 0.2)`,
                    color: `rgb(var(${stageVar(si)}))`
                  }"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="stageIcon(si)" />
                  </svg>
                </div>

                <!-- Label -->
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-extrabold text-foreground truncate leading-tight">{{ stage.label }}</p>
                  <p class="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {{ col(stage.value).loading ? 'Loading…' : `${col(stage.value).items.length} task${col(stage.value).items.length !== 1 ? 's' : ''}` }}
                  </p>
                </div>

                <!-- Loading spinner -->
                <svg v-if="col(stage.value).loading" class="animate-spin h-3.5 w-3.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z" />
                </svg>

                <!-- WIP badge -->
                <Badge
                  v-if="stage.wipLimit"
                  variant="outline"
                  class="text-[10px] font-bold shrink-0 h-5 px-1.5"
                  :class="col(stage.value).items.length >= stage.wipLimit ? 'border-destructive text-destructive' : 'text-muted-foreground'"
                >
                  {{ col(stage.value).items.length }}/{{ stage.wipLimit }}
                </Badge>

                <!-- Collapse button -->
                <button type="button" class="aurora-col-action-btn shrink-0" title="Collapse column" @click="toggleStage(stage.value)">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M15 4.5V9m0 0h4.5M9 15v4.5M9 15H4.5M15 19.5V15m0 0h4.5" />
                  </svg>
                </button>
              </div>

              <!-- Row 2: column action buttons -->
              <div class="flex items-center gap-1">
                <button type="button" class="aurora-col-chip" @click="loadColumn(stage.value)">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Refresh
                </button>
                <button type="button" class="aurora-col-chip" :style="{ color: `rgb(var(${stageVar(si)}))` }">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
                <button type="button" class="aurora-col-chip ml-auto">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- ── Scrollable Card List ── -->
          <div class="aurora-cards-scroll flex-1 min-h-0 overflow-y-auto px-3 py-2">
            <draggable
              :model-value="filteredItems(stage.value)"
              :item-key="itemKey"
              group="kanban"
              :animation="200"
              ghost-class="aurora-ghost"
              chosen-class="aurora-chosen"
              drag-class="aurora-dragging"
              :disabled="features?.dragDrop === false || col(stage.value).loading"
              :data-stage="stage.value"
              class="aurora-drop-list flex flex-col gap-2 min-h-16"
              :class="isDragging ? 'aurora-drop-list-active' : ''"
              :style="{ paddingBottom: isDragging ? '96px' : '6px' }"
              @update:model-value="(val) => setItems(stage.value, val)"
              @start="(e) => onDragStart(e, stage.value)"
              @end="onDragEnd"
            >
              <template #item="{ element: item }">
                <div
                  class="aurora-card relative bg-background border border-border rounded-xl overflow-visible
                         cursor-grab active:cursor-grabbing transition-all duration-200 group/card"
                  :class="[
                    densityPadding,
                    landingCard?.id === item[itemKey] ? 'aurora-land' : ''
                  ]"
                  :style="{ '--aurora-accent': `rgb(var(${stageVar(si)}))` }"
                >
                  <!-- Top accent stripe -->
                  <div class="aurora-card-top-stripe" />

                  <!-- Hover actions -->
                  <div
                    v-if="$slots['card-actions']"
                    class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                    @click.stop @mousedown.stop @pointerdown.stop
                  >
                    <slot name="card-actions" :item="item" :stage="stage.value" :stage-meta="stage" />
                  </div>

                  <slot name="card" :item="item" :stage="stage.value" :stage-meta="stage">
                    <p class="text-sm font-semibold text-foreground truncate">
                      {{ (item as Record<string, unknown>).name ?? item.id }}
                    </p>
                  </slot>
                </div>
              </template>

              <template #header>
                <div v-if="col(stage.value).loading" class="flex flex-col gap-2 pb-2">
                  <div v-for="n in 3" :key="n" class="aurora-skeleton animate-pulse rounded-xl" />
                </div>
              </template>

              <template #footer>
                <div
                  v-if="!col(stage.value).loading && filteredItems(stage.value).length === 0 && !col(stage.value).error"
                  class="aurora-empty-state"
                >
                  <div class="aurora-empty-icon" :style="{ color: `rgb(var(${stageVar(si)}))` }">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p class="text-[11px] text-muted-foreground font-semibold">
                    {{ searchQuery ? 'No matches' : `No tasks in ${stage.label}` }}
                  </p>
                  <p v-if="!searchQuery" class="text-[10px] text-muted-foreground">Drag tasks here or add new</p>
                </div>

                <div v-if="col(stage.value).error" class="aurora-error-state">
                  <p class="text-[11px] text-destructive font-semibold">{{ col(stage.value).error }}</p>
                  <button type="button" class="aurora-col-chip text-destructive border-destructive" @click="loadColumn(stage.value)">Retry</button>
                </div>

                <!-- Add task button at bottom of list -->
                <button
                  type="button"
                  class="aurora-add-task-btn w-full"
                  :style="{ '--aurora-accent': `rgb(var(${stageVar(si)}))` }"
                >
                  <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add task
                </button>
              </template>
            </draggable>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: number | string; [key: string]: any }">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { KanbanConfig, KanbanFeatures, KanbanMoveEvent, KanbanReorderEvent, KanbanStageDefinition } from './types/kanban.types'
import type { UniversalApiResponse, UniversalFetchParams } from './types/universal.types'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'

interface SortableEvent { from: Element; to: Element; newIndex: number; oldIndex: number }
interface ColumnState { items: T[]; loading: boolean; error: string | null }

interface Props {
  fetchFn:   (params: UniversalFetchParams) => Promise<UniversalApiResponse<T>>
  stages:    KanbanStageDefinition[]
  config?:   KanbanConfig
  features?: KanbanFeatures
  itemKey?:  string
}

const props = withDefaults(defineProps<Props>(), {
  itemKey: 'id',
  features: () => ({ dragDrop: true, intraStageReorder: true }),
})

const emit = defineEmits<{
  (e: 'move',    event: KanbanMoveEvent<T>): void
  (e: 'reorder', event: KanbanReorderEvent): void
}>()

const resolvedColumnWidth = computed(() => props.config?.columnWidth ?? '300px')
const resolvedPerPage     = computed(() => props.config?.perPage     ?? 50)

// ── Column data ──
const columnData = reactive<Record<string, ColumnState>>({})
function col(sv: string): ColumnState {
  if (!columnData[sv]) columnData[sv] = { items: [], loading: false, error: null }
  return columnData[sv]
}
function setItems(sv: string, items: T[]) { col(sv).items = items }

async function loadColumn(sv: string) {
  const s = col(sv); s.loading = true; s.error = null
  try {
    const r = await props.fetchFn({ page: 1, perPage: resolvedPerPage.value, search: '', sortBy: null, sortOrder: null, kanbanStage: sv })
    s.items = Array.isArray(r.data) ? r.data : []
  } catch { s.error = 'Failed to load.' } finally { s.loading = false }
}

watch(() => props.stages, (ns) => {
  for (const st of ns) {
    const ex = columnData[st.value]
    if (!ex || (!ex.loading && ex.items.length === 0 && !ex.error)) loadColumn(st.value)
  }
}, { immediate: true })

// ── UI state ──
type Density = 'compact' | 'default' | 'comfortable'
const density         = ref<Density>('default')
const isFullscreen    = ref(false)
const collapsedStages = ref(new Set<string>())
const isDragging      = ref(false)
const dragOverStage   = ref<string | null>(null)
const landingCard     = ref<{ id: string | number } | null>(null)
const searchQuery     = ref('')
const showSearch      = ref(false)
const filterActive    = ref(false)
const sortActive      = ref(false)
const refreshing      = ref(false)
const searchInput     = ref<HTMLInputElement | null>(null)

const densityPadding = computed(() => ({
  compact:     'px-3 py-2.5',
  default:     'px-4 py-3',
  comfortable: 'px-5 py-4',
}[density.value]))

function cycleDensity() {
  const o: Density[] = ['compact', 'default', 'comfortable']
  density.value = o[(o.indexOf(density.value) + 1) % o.length]
}

function toggleStage(sv: string) {
  collapsedStages.value.has(sv) ? collapsedStages.value.delete(sv) : collapsedStages.value.add(sv)
}

function collapseAll() {
  props.stages.forEach(s => collapsedStages.value.add(s.value))
}

function expandAll() {
  collapsedStages.value.clear()
}

// ── Search filter (client-side only, no store mutation) ──
function filteredItems(sv: string): T[] {
  if (!searchQuery.value.trim()) return col(sv).items
  const q = searchQuery.value.toLowerCase()
  return col(sv).items.filter(item =>
    Object.values(item).some(v => String(v).toLowerCase().includes(q))
  )
}

watch(showSearch, async (v) => {
  if (v) { await nextTick(); searchInput.value?.focus() }
})

// ── Stage theming using CSS variables (no hardcoded colors) ──
// Maps stage index to --color-* CSS variable names from their tailwind.css
const stageVars = [
  '--color-primary',
  '--color-ring',
  '--color-primary',
  '--color-destructive',
  '--color-ring',
]

function stageVar(i: number): string {
  // Use stage colorClass if it contains a meaningful hint, otherwise cycle
  const stage = props.stages[i]
  if (stage?.dot?.includes('violet') || stage?.dot?.includes('purple')) return '--color-primary'
  if (stage?.dot?.includes('red') || stage?.dot?.includes('destructive')) return '--color-destructive'
  return stageVars[i % stageVars.length]
}

// ── Stage icons (per column index) ──
const icons = [
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  'M13 10V3L4 14h7v7l9-11h-7z',
  'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'M5 13l4 4L19 7',
]
function stageIcon(i: number): string { return icons[i % icons.length] }

// ── Drag ──
let dragFromStage: string | null = null

function onDragStart(_e: DragEvent, sv: string) {
  dragFromStage = sv; isDragging.value = true; dragOverStage.value = sv
}

function onDragEnd(event: SortableEvent) {
  const from = event.from.getAttribute('data-stage') ?? dragFromStage
  const to   = event.to.getAttribute('data-stage')   ?? from
  dragFromStage = null; isDragging.value = false

  if (to) {
    const item = col(to).items[event.newIndex] as T | undefined
    if (item) {
      landingCard.value = { id: item[props.itemKey] }
      setTimeout(() => { landingCard.value = null }, 450)
    }
  }

  dragOverStage.value = null
  if (!from || !to) return

  if (from !== to) {
    const item = col(to).items[event.newIndex] as T | undefined
    if (!item) return
    const meta = props.stages.find(s => s.value === to)
    if (meta?.wipLimit && col(to).items.length > meta.wipLimit) { loadColumn(from); loadColumn(to); return }
    emit('move', { item, fromStage: from, toStage: to, newIndex: event.newIndex })
  } else if (props.features?.intraStageReorder !== false) {
    emit('reorder', { stage: to, orderedIds: col(to).items.map(i => i[props.itemKey]) })
  }
}

// ── Public API ──
const totalItems    = computed(() => props.stages.reduce((n, s) => n + col(s.value).items.length, 0))
const columnCounts  = computed(() => {
  const c: Record<string, number> = {}
  for (const s of props.stages) c[s.value] = col(s.value).items.length
  return c
})
function refreshColumn(sv: string) { loadColumn(sv) }
async function refresh() {
  refreshing.value = true
  await Promise.all(props.stages.map(s => loadColumn(s.value)))
  refreshing.value = false
}
defineExpose({ refresh, refreshColumn, columnCounts })
</script>

<style>
/* ══════════════════════════════════════════════════════════════════════
   AURORA KANBAN — Theme-adaptive, uses --color-* CSS variables only
   ══════════════════════════════════════════════════════════════════════ */

.aurora-root { background: rgb(var(--color-background)); color: rgb(var(--color-foreground)); }
.aurora-fullscreen { position: fixed; inset: 0; z-index: 50; overflow: hidden; }
.aurora-normal { position: relative; height: 100%; }

/* ── Toolbar ── */
.aurora-toolbar { background: rgb(var(--color-background)); }

.aurora-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  padding: 4px 7px; border-radius: 7px; border: none; cursor: pointer;
  font-size: 11px; font-weight: 600;
  transition: all 0.15s ease;
}
.aurora-btn-ghost {
  background: transparent;
  color: rgb(var(--color-muted-foreground));
}
.aurora-btn-ghost:hover {
  background: rgb(var(--color-accent));
  color: rgb(var(--color-foreground));
}
.aurora-btn-active {
  background: rgb(var(--color-primary));
  color: rgb(var(--color-primary-foreground));
}
.aurora-btn-label {
  font-size: 11px; font-weight: 600; text-transform: capitalize;
}
.aurora-btn-labeled { padding: 4px 9px; }

.aurora-divider { width: 1px; height: 18px; background: rgb(var(--color-border)); margin: 0 2px; flex-shrink: 0; }

.aurora-total-badge {
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 9999px;
  background: rgb(var(--color-muted));
  color: rgb(var(--color-muted-foreground));
}

/* ── Search ── */
.aurora-search-wrap {
  display: flex; align-items: center; gap: 5px;
  background: rgb(var(--color-muted));
  border: 1.5px solid rgb(var(--color-border));
  border-radius: 8px;
  padding: 3px 8px;
  min-width: 180px; max-width: 260px;
  overflow: hidden;
}
.aurora-search-icon { width: 13px; height: 13px; color: rgb(var(--color-muted-foreground)); flex-shrink: 0; }
.aurora-search-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 12px; color: rgb(var(--color-foreground));
  font-weight: 500;
}
.aurora-search-input::placeholder { color: rgb(var(--color-muted-foreground)); }
.aurora-search-clear {
  border: none; background: none; cursor: pointer; padding: 1px;
  color: rgb(var(--color-muted-foreground)); border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
}
.aurora-search-clear:hover { color: rgb(var(--color-foreground)); }

.aurora-search-slide-enter-active,
.aurora-search-slide-leave-active { transition: all 0.2s ease; }
.aurora-search-slide-enter-from,
.aurora-search-slide-leave-to { opacity: 0; transform: scaleX(0.8); transform-origin: left; }

/* ── Filter bar ── */
.aurora-filterbar { background: rgb(var(--color-muted)); }
.aurora-filterbar-enter-active,
.aurora-filterbar-leave-active { transition: all 0.2s ease; max-height: 48px; }
.aurora-filterbar-enter-from,
.aurora-filterbar-leave-to { max-height: 0; opacity: 0; overflow: hidden; }

/* ── Board layout ── */
.aurora-board { align-items: flex-start; }

/* ── Column ── */
.aurora-column {
  height: 100%;
  max-height: calc(100vh - 8.5rem);
  display: flex;
  flex-direction: column;
  background: rgb(var(--color-card));
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04);
}

.aurora-col-drop-active {
  box-shadow:
    0 0 0 2px rgb(var(--color-primary)),
    0 8px 32px -8px rgba(0,0,0,0.15) !important;
  transform: scale(1.006);
  transition: all 0.15s ease-out;
}

/* ── Column header actions ── */
.aurora-col-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 7px; border: none; cursor: pointer;
  background: transparent; color: rgb(var(--color-muted-foreground));
  transition: all 0.15s ease; flex-shrink: 0;
}
.aurora-col-action-btn:hover {
  background: rgb(var(--color-accent));
  color: rgb(var(--color-foreground));
}

.aurora-col-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 5px; border: none; cursor: pointer;
  font-size: 11px; font-weight: 600;
  background: rgb(var(--color-muted));
  color: rgb(var(--color-muted-foreground));
  transition: all 0.15s ease;
}
.aurora-col-chip:hover {
  background: rgb(var(--color-accent));
  color: rgb(var(--color-foreground));
}

/* ── Scrollable cards ── */
.aurora-cards-scroll {
  overflow-y: auto; scroll-behavior: smooth;
  scrollbar-width: thin; scrollbar-color: transparent transparent;
}
.aurora-cards-scroll:hover { scrollbar-color: rgba(var(--color-muted-foreground),0.25) transparent; }
.aurora-cards-scroll::-webkit-scrollbar { width: 4px; }
.aurora-cards-scroll::-webkit-scrollbar-track { background: transparent; }
.aurora-cards-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 9999px; }
.aurora-cards-scroll:hover::-webkit-scrollbar-thumb { background: rgb(var(--color-muted-foreground) / 0.2); }

/* ── Drop list ── */
.aurora-drop-list { transition: padding-bottom 0.2s ease; }
.aurora-drop-list-active {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0, transparent 6px,
    rgb(var(--color-muted)) 6px, rgb(var(--color-muted)) 7px
  );
  border-radius: 10px;
  padding: 6px;
}

/* ── Cards ── */
.aurora-card {
  will-change:auto;
  background: rgb(var(--color-background));
}

.aurora-card-top-stripe {
  position: absolute; top: 0; left: 12%; right: 12%;
  height: 2px; border-radius: 0 0 4px 4px;
  background: var(--aurora-accent, rgb(var(--color-primary)));
  opacity: 0; transition: opacity 0.15s ease;
}
.aurora-card:hover .aurora-card-top-stripe { opacity: 1; }

.aurora-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px -6px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.06) !important;
  border-color: var(--aurora-accent, rgb(var(--color-primary))) !important;
}

/* ── Skeleton ── */
.aurora-skeleton {
  height: 80px;
  background: rgb(var(--color-muted));
  border: 1px solid rgb(var(--color-border));
}

/* ── Empty / Error states ── */
.aurora-empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 32px 16px;
  border: 2px dashed rgb(var(--color-border));
  border-radius: 12px; margin-bottom: 4px;
}
.aurora-empty-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgb(var(--color-muted));
  display: flex; align-items: center; justify-content: center;
}
.aurora-error-state {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 20px 16px;
  border: 2px dashed rgb(var(--color-destructive));
  border-radius: 12px; margin-bottom: 4px;
  opacity: 0.7;
}

/* ── Add task button ── */
.aurora-add-task-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 10px 12px; border-radius: 10px;
  font-size: 12px; font-weight: 700;
  color: rgb(var(--color-muted-foreground));
  background: transparent;
  border: 2px dashed rgb(var(--color-border));
  cursor: pointer; transition: all 0.15s ease;
}
.aurora-add-task-btn:hover {
  border-color: var(--aurora-accent, rgb(var(--color-primary)));
  color: var(--aurora-accent, rgb(var(--color-primary)));
  background: rgb(var(--color-muted));
}

/* ── Collapsed strip ── */
.aurora-collapsed-strip {
  width: 48px; padding: 14px 0 14px;
  display: flex; flex-direction: column; align-items: center;
  height: 100%; max-height: calc(100vh - 8.5rem);
  gap: 10px;
  background: rgb(var(--color-card));
}
.aurora-collapsed-strip:hover { background: rgb(var(--color-accent)); }
.aurora-col-icon-sm { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.aurora-rotated-label {
  writing-mode: vertical-rl; text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
  white-space: nowrap;
}
.aurora-collapsed-count {
  width: 22px; height: 22px; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: white;
  margin-top: auto; margin-bottom: 4px;
}

/* ══════════════════════
   45° DRAG STATES
   ══════════════════════ */

/* Ghost: dashed dotted placeholder — VISIBLE with pattern */
.aurora-ghost {
  opacity: 1 !important;
  background: repeating-linear-gradient(
    -45deg,
    transparent 0, transparent 5px,
    rgb(var(--color-muted)) 5px, rgb(var(--color-muted)) 6px
  ) !important;
  border: 2px dashed rgb(var(--color-border)) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
}
.aurora-ghost > * { opacity: 0 !important; }

/* Chosen: the moment of grabbing */
.aurora-chosen {
  transform: rotate(3deg) scale(1.03) !important;
  box-shadow: 0 12px 32px -6px rgba(0,0,0,0.2) !important;
  cursor: grabbing !important;
  z-index: 200 !important;
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out !important;
}

/* Dragging: FULL 45-DEGREE TILT as requested */
.aurora-dragging {
  transform: rotate(45deg) scale(0.85) !important;
  box-shadow:
    0 32px 64px -12px rgba(0,0,0,0.3),
    0 16px 32px -8px rgba(0,0,0,0.15),
    0 0 0 2px rgb(var(--color-primary)) !important;
  z-index: 9999 !important;
  opacity: 0.94 !important;
  cursor: grabbing !important;
  border-radius: 12px !important;
  transition: none !important;
}

/* Landing: spring snap animation */
@keyframes aurora-land {
  0%   { transform: rotate(-4deg) scale(1.04) translateY(-4px); }
  35%  { transform: rotate(1.5deg) scale(0.97) translateY(2px); }
  65%  { transform: rotate(-0.5deg) scale(1.01) translateY(0); }
  100% { transform: rotate(0deg) scale(1) translateY(0); }
}
.aurora-land { animation: aurora-land 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards !important; }
</style>