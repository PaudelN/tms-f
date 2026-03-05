<template>
  <div
    ref="rootEl"
    class="rounded-sm border border-border bg-card flex flex-col transition-all duration-300"
    :class="
      isFullscreen
        ? 'fixed inset-0 z-50 rounded-none bg-background'
        : 'overflow-hidden max-h-full'
    "
  >
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- HEADER                                                                 -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted shrink-0"
    >
      <!-- Left: info icon + total badge -->
      <div class="flex items-center gap-3">
        <!-- Info tooltip -->
        <div class="relative group/info shrink-0">
          <Info class="h-3.5 w-3.5 text-primary cursor-pointer" />
          <div
            class="absolute top-full left-0 mt-2 w-72 z-50 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible pointer-events-none transition-all duration-200"
          >
            <div
              class="rounded-xl border border-border bg-popover shadow-2xl p-4 text-xs space-y-3"
            >
              <div class="flex items-center gap-2">
                <span class="font-semibold text-primary">Kanban View</span>
              </div>
              <p class="text-muted-foreground leading-relaxed">
                Per-stage infinite scroll. Drag cards between columns to move
                items across stages. Each column loads independently.
              </p>
              <div class="space-y-1.5 pt-1 border-t border-border">
                <div
                  v-for="stage in stages"
                  :key="stage.value"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="h-2 w-2 rounded-full shrink-0"
                      :class="stage.dot"
                    />
                    <span class="text-muted-foreground">{{ stage.label }}</span>
                  </div>
                  <span class="font-mono font-bold text-primary">
                    {{ stageStates.get(stage.value)?.total ?? '…' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stage count pills -->
        <div class="flex items-center gap-1.5">
          <div
            v-for="stage in stages"
            :key="stage.value"
            class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/60 border border-border/60"
          >
            <span class="h-1.5 w-1.5 rounded-full shrink-0" :class="stage.dot" />
            <span class="text-[10px] font-mono font-semibold text-foreground tabular-nums">
              {{ stageStates.get(stage.value)?.total ?? '—' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right controls -->
      <div class="flex items-center gap-1 shrink-0">
        <!-- Collapse all toggle -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary hover:text-primary hover:bg-secondary transition-colors"
                :class="allCollapsed ? 'bg-primary/10' : ''"
                @click="toggleCollapseAll"
              >
                <PanelLeftClose v-if="allCollapsed" class="h-4 w-4" />
                <PanelLeftOpen v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="6" class="text-xs rounded-lg">
              {{ allCollapsed ? 'Expand all columns' : 'Collapse all columns' }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Divider -->
        <div class="w-px h-5 bg-border shrink-0 mx-0.5" />

        <!-- Density -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary hover:text-primary hover:bg-secondary"
                @click="cycleDensity"
              >
                <component :is="densityIcon" class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="6" class="text-xs rounded-lg capitalize">
              {{ density }} cards
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Copy as JSON -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary transition-all duration-200"
                @click="copyAllItems"
              >
                <CheckCheck v-if="copyDone" class="h-4 w-4" />
                <Copy v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="6" class="text-xs rounded-lg">
              {{ copyDone ? 'Copied!' : 'Copy all as JSON' }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Fullscreen -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary transition-all duration-200"
                @click="isFullscreen = !isFullscreen"
              >
                <Minimize v-if="isFullscreen" class="h-4 w-4" />
                <Maximize v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="6" class="text-xs rounded-lg">
              {{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- BOARD — horizontally scrollable columns                               -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div class="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
      <div
        class="flex gap-4 h-full p-4"
        :style="{ minWidth: `${stages.length * (parseInt(columnWidth) + 16)}px` }"
      >
        <!-- ── Per-stage column ──────────────────────────────────────────── -->
        <div
          v-for="stage in stages"
          :key="stage.value"
          class="flex flex-col min-h-0 flex-shrink-0"
          :style="{ width: columnWidth }"
        >
          <!-- Column header -->
          <div
            class="flex items-center justify-between px-3.5 py-2.5 rounded-t-xl border border-b-0 border-border bg-muted/80 shrink-0 cursor-pointer select-none"
            @click="toggleColumn(stage.value)"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Stage colour dot with glow -->
              <span
                class="h-2 w-2 rounded-full shrink-0"
                :class="stage.dot"
                :style="{ boxShadow: `0 0 6px currentColor` }"
              />
              <span class="text-xs font-bold text-foreground truncate">
                {{ stage.label }}
              </span>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <!-- Total count badge -->
              <span
                class="text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded-md bg-background/70 text-muted-foreground border border-border/50"
              >
                {{ stageStates.get(stage.value)?.total ?? '…' }}
              </span>

              <!-- WIP limit badge (warns when exceeded) -->
              <span
                v-if="stage.wipLimit"
                class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border transition-colors"
                :class="
                  (stageStates.get(stage.value)?.total ?? 0) > stage.wipLimit
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                "
              >
                WIP {{ stageStates.get(stage.value)?.total ?? 0 }}/{{
                  stage.wipLimit
                }}
              </span>

              <!-- Collapse chevron -->
              <ChevronDown
                class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200"
                :class="collapsedColumns.has(stage.value) ? '-rotate-90' : ''"
              />
            </div>
          </div>

          <!-- Column body — scrollable, acts as drop zone -->
          <div
            v-show="!collapsedColumns.has(stage.value)"
            :ref="(el) => setColumnRef(stage.value, el)"
            class="flex-1 min-h-0 overflow-y-auto rounded-b-xl border border-border bg-muted/30 p-2 space-y-2 transition-all duration-200"
            :class="
              isColumnDropTarget(stage.value)
                ? 'ring-2 ring-primary/40 ring-inset bg-primary/5'
                : ''
            "
            @dragenter.prevent="onColumnDragEnter(stage.value)"
            @dragleave="onColumnDragLeave(stage.value)"
            @dragover.prevent
            @drop.prevent="onColumnDrop(stage.value)"
          >
            <!-- ── Initial loading skeletons ─────────────────────────────── -->
            <template v-if="stageStates.get(stage.value)?.isInitialLoading">
              <div
                v-for="i in 4"
                :key="`sk-${stage.value}-${i}`"
                class="rounded-xl border border-border bg-card p-3.5 animate-pulse"
                :style="{ opacity: 1 - i * 0.18 }"
              >
                <slot name="skeleton" :stage="stage">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2.5">
                      <div class="h-7 w-7 rounded-lg bg-border/80 shrink-0" />
                      <div class="flex-1 space-y-1.5">
                        <div class="h-2.5 bg-border/80 rounded-full w-3/4" />
                        <div class="h-2 bg-border/60 rounded-full w-1/2" />
                      </div>
                    </div>
                    <div class="h-2 bg-border/50 rounded-full w-full mt-3" />
                    <div class="h-2 bg-border/40 rounded-full w-4/5" />
                  </div>
                </slot>
              </div>
            </template>

            <!-- ── Error state ────────────────────────────────────────────── -->
            <template v-else-if="stageStates.get(stage.value)?.error">
              <div
                class="flex flex-col items-center gap-2 py-8 px-3 text-center"
              >
                <div
                  class="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center"
                >
                  <AlertCircle class="h-4 w-4 text-destructive" />
                </div>
                <p class="text-xs text-destructive font-medium">Failed to load</p>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-7 px-3 text-xs mt-1"
                  @click="reload(stage.value)"
                >
                  <RefreshCw class="h-3 w-3 mr-1.5" />
                  Retry
                </Button>
              </div>
            </template>

            <!-- ── Empty state ─────────────────────────────────────────────── -->
            <template
              v-else-if="
                !stageStates.get(stage.value)?.items?.length &&
                !stageStates.get(stage.value)?.isInitialLoading
              "
            >
              <div class="flex flex-col items-center gap-2 py-10 px-3 text-center">
                <slot name="empty" :stage="stage">
                  <div
                    class="h-10 w-10 rounded-xl border-2 border-dashed border-border flex items-center justify-center"
                  >
                    <LayoutGrid class="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p class="text-xs font-medium text-foreground">No items</p>
                  <p class="text-[10px] text-muted-foreground">
                    Drag cards here or add a new item
                  </p>
                </slot>
              </div>
            </template>

            <!-- ── Cards ──────────────────────────────────────────────────── -->
            <template v-else>
              <KanbanCard
                v-for="(item, idx) in stageStates.get(stage.value)?.items"
                :key="resolveItemKey(item, idx)"
                :item="item"
                :stage="stage.value"
                :index="idx"
                :density="density"
                :active-drag-ctx="dragCtx"
                :class="
                  isNewCard(stage.value, resolveItemKey(item, idx))
                    ? 'kanban-card-enter'
                    : ''
                "
                @drag-start="startDrag"
                @drag-end="endDrag"
                @drop="(toIdx) => onCardDrop(stage.value, toIdx)"
              >
                <!-- Forward entity-specific card body -->
                <template #default="slotProps">
                  <slot
                    name="card"
                    v-bind="slotProps"
                    :stage-meta="stage"
                  />
                </template>
                <!-- Forward entity-specific action buttons -->
                <template #actions="slotProps">
                  <slot name="card-actions" v-bind="slotProps" :stage-meta="stage" />
                </template>
              </KanbanCard>

              <!-- Per-column infinite scroll sentinel -->
              <div
                :ref="(el) => setSentinelRef(stage.value, el)"
                class="h-1 w-full"
              />

              <!-- Load-more skeletons -->
              <template v-if="stageStates.get(stage.value)?.isLoadingMore">
                <div
                  v-for="i in 2"
                  :key="`more-sk-${stage.value}-${i}`"
                  class="rounded-xl border border-border bg-card p-3.5 animate-pulse"
                  :style="{ opacity: 1 - i * 0.4 }"
                >
                  <slot name="skeleton" :stage="stage">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2.5">
                        <div class="h-7 w-7 rounded-lg bg-border/80 shrink-0" />
                        <div class="flex-1 space-y-1.5">
                          <div class="h-2.5 bg-border/80 rounded-full w-3/4" />
                          <div class="h-2 bg-border/60 rounded-full w-1/2" />
                        </div>
                      </div>
                    </div>
                  </slot>
                </div>
              </template>

              <!-- End of column -->
              <div
                v-if="!stageStates.get(stage.value)?.hasMore && (stageStates.get(stage.value)?.items?.length ?? 0) > 0"
                class="flex items-center gap-2 py-2 px-1"
              >
                <div class="h-px flex-1 bg-border/50" />
                <span class="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                  all loaded
                </span>
                <div class="h-px flex-1 bg-border/50" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue'
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from '@/components/ui/tooltip'
  import { useIntersectionObserver } from '@vueuse/core'
  import {
    AlertCircle,
    Check,
    CheckCheck,
    ChevronDown,
    Copy,
    GalleryVertical,
    Info,
    LayoutGrid,
    Maximize,
    Maximize2,
    Minimize,
    Minimize2,
    PanelLeftClose,
    PanelLeftOpen,
    RefreshCw,
  } from 'lucide-vue-next'
  import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    watch,
  } from 'vue'
  import KanbanCard from './KanbanCard.vue'
  import { useKanbanInteractions } from './composables/useKanbanInteractions'
  import type {
    DragContext,
    KanbanConfig,
    KanbanFeatures,
    KanbanFetchFn,
    Stage,
  } from './types/kanban.types'

  // ── Props ──────────────────────────────────────────────────────────────────

  interface Props {
    kanbanId: string
    stages: Stage[]
    fetchFn: KanbanFetchFn
    config?: KanbanConfig
    features?: KanbanFeatures
    externalSearch?: string
    externalFilters?: Record<string, any>
    /** Property name or function for unique card key. Default: 'id' */
    itemKey?: string | ((item: any) => string | number)
  }

  const props = withDefaults(defineProps<Props>(), {
    config: () => ({}),
    features: () => ({ dragDrop: true, intraStageReorder: true }),
    itemKey: 'id',
  })

  const emit = defineEmits<{
    'item-moved': [item: any, fromStage: string, toStage: string]
    'item-reordered': [item: any, stage: string, fromIndex: number, toIndex: number]
  }>()

  // ── Composable ─────────────────────────────────────────────────────────────

  const {
    stageStates,
    dragCtx,
    loadMore,
    reload,
    moveItem,
    reorderItem,
    startDrag,
    endDrag,
    handleSearch,
    setFilters,
  } = useKanbanInteractions(
    props.kanbanId,
    props.stages,
    props.fetchFn,
    props.config,
  )

  // ── Column width ───────────────────────────────────────────────────────────

  const columnWidth = computed(() => props.config?.columnWidth ?? '280px')

  // ── External search / filter sync ─────────────────────────────────────────

  watch(
    () => props.externalSearch,
    (val) => { if (val !== undefined) handleSearch(val) },
  )

  watch(
    () => props.externalFilters,
    (val) => { if (val) setFilters(val) },
    { deep: true },
  )

  // ── Fullscreen ─────────────────────────────────────────────────────────────

  const rootEl = ref<HTMLElement | null>(null)
  const isFullscreen = ref(false)

  // ── Column collapse ────────────────────────────────────────────────────────

  const collapsedColumns = ref<Set<string>>(new Set())
  const allCollapsed = computed(
    () => collapsedColumns.value.size === props.stages.length,
  )

  function toggleColumn(value: string): void {
    if (collapsedColumns.value.has(value)) {
      collapsedColumns.value.delete(value)
    } else {
      collapsedColumns.value.add(value)
    }
    collapsedColumns.value = new Set(collapsedColumns.value)
  }

  function toggleCollapseAll(): void {
    if (allCollapsed.value) {
      collapsedColumns.value = new Set()
    } else {
      collapsedColumns.value = new Set(props.stages.map((s) => s.value))
    }
  }

  // ── Density ────────────────────────────────────────────────────────────────

  type Density = 'compact' | 'default' | 'comfortable'
  const densities: Density[] = ['default', 'compact', 'comfortable']
  const density = ref<Density>('default')

  const densityIcon = computed(() => {
    if (density.value === 'compact') return Minimize2
    if (density.value === 'comfortable') return Maximize2
    return GalleryVertical
  })

  function cycleDensity(): void {
    const idx = densities.indexOf(density.value)
    density.value = densities[(idx + 1) % densities.length]
  }

  // ── Copy ───────────────────────────────────────────────────────────────────

  const copyDone = ref(false)

  function copyAllItems(): void {
    const payload: Record<string, any[]> = {}
    for (const stage of props.stages) {
      payload[stage.value] = stageStates.get(stage.value)?.items ?? []
    }
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      copyDone.value = true
      setTimeout(() => (copyDone.value = false), 2000)
    })
  }

  // ── Item key helper ────────────────────────────────────────────────────────

  function resolveItemKey(item: any, fallback: number): string | number {
    if (typeof props.itemKey === 'function') return props.itemKey(item)
    const val = item?.[props.itemKey as string]
    return val != null ? val : `__idx_${fallback}`
  }

  // ── New-card tracking for animations ──────────────────────────────────────

  // Track the most-recently-dropped card key per stage for animation
  const newCardKeys = ref<Map<string, Set<string | number>>>(new Map())

  function isNewCard(stage: string, key: string | number): boolean {
    return newCardKeys.value.get(stage)?.has(key) ?? false
  }

  function markNewCard(stage: string, key: string | number): void {
    if (!newCardKeys.value.has(stage)) newCardKeys.value.set(stage, new Set())
    newCardKeys.value.get(stage)!.add(key)
    setTimeout(() => newCardKeys.value.get(stage)?.delete(key), 700)
  }

  // ── IntersectionObserver: per-column sentinels ─────────────────────────────

  // Maps stageValue → sentinel HTMLElement
  const sentinelRefs = shallowRef(new Map<string, Element | null>())
  // Maps stageValue → scroll container HTMLElement
  const columnRefs = shallowRef(new Map<string, Element | null>())
  // Maps stageValue → cleanup fn from useIntersectionObserver
  const observerCleanups = new Map<string, () => void>()

  function setSentinelRef(stage: string, el: Element | ComponentPublicInstance | null): void {
    const prev = sentinelRefs.value.get(stage)
    const next = (el as Element | null) ?? null
    if (prev === next) return

    // Tear down old observer
    observerCleanups.get(stage)?.()

    sentinelRefs.value.set(stage, next)
    const root = columnRefs.value.get(stage) ?? undefined

    if (next) {
      const { stop } = useIntersectionObserver(
        ref(next) as any,
        ([entry]) => {
          if (
            entry.isIntersecting &&
            !stageStates.get(stage)?.isLoadingMore &&
            !stageStates.get(stage)?.isInitialLoading &&
            stageStates.get(stage)?.hasMore
          ) {
            loadMore(stage)
          }
        },
        { root: root as HTMLElement | undefined, threshold: 0.1 },
      )
      observerCleanups.set(stage, stop)
    }
  }

  function setColumnRef(stage: string, el: Element | ComponentPublicInstance | null): void {
    columnRefs.value.set(stage, (el as Element | null) ?? null)
  }

  onBeforeUnmount(() => {
    for (const cleanup of observerCleanups.values()) cleanup()
  })

  // ── Drag and drop ──────────────────────────────────────────────────────────

  const dragOverColumns = ref<Map<string, number>>(new Map()) // enterCount per column

  const columnDropTarget = ref<string | null>(null)

  function isColumnDropTarget(stageValue: string): boolean {
    return (
      columnDropTarget.value === stageValue &&
      dragCtx.value !== null &&
      dragCtx.value.fromStage !== stageValue
    )
  }

  function onColumnDragEnter(stageValue: string): void {
    if (!dragCtx.value) return
    const count = (dragOverColumns.value.get(stageValue) ?? 0) + 1
    dragOverColumns.value.set(stageValue, count)
    columnDropTarget.value = stageValue
  }

  function onColumnDragLeave(stageValue: string): void {
    const count = Math.max(0, (dragOverColumns.value.get(stageValue) ?? 0) - 1)
    dragOverColumns.value.set(stageValue, count)
    if (count === 0 && columnDropTarget.value === stageValue) {
      columnDropTarget.value = null
    }
  }

  function onColumnDrop(stageValue: string): void {
    columnDropTarget.value = null
    dragOverColumns.value.set(stageValue, 0)

    if (!dragCtx.value) return
    const ctx = dragCtx.value

    if (ctx.fromStage === stageValue) return // same column — handled by card

    // WIP limit check
    const targetStage = props.stages.find((s) => s.value === stageValue)
    const targetState = stageStates.get(stageValue)
    if (
      targetStage?.wipLimit &&
      targetState &&
      targetState.total >= targetStage.wipLimit
    ) {
      endDrag()
      return
    }

    moveItem(ctx.item, ctx.fromStage, stageValue)
    markNewCard(stageValue, resolveItemKey(ctx.item, -1))
    emit('item-moved', ctx.item, ctx.fromStage, stageValue)
    endDrag()
  }

  function onCardDrop(stageValue: string, toIndex: number): void {
    if (!dragCtx.value) return
    const ctx = dragCtx.value

    if (ctx.fromStage !== stageValue) {
      // Cross-stage via card drop indicator
      const targetStage = props.stages.find((s) => s.value === stageValue)
      const targetState = stageStates.get(stageValue)
      if (
        targetStage?.wipLimit &&
        targetState &&
        targetState.total >= targetStage.wipLimit
      ) {
        endDrag()
        return
      }
      moveItem(ctx.item, ctx.fromStage, stageValue, toIndex)
      markNewCard(stageValue, resolveItemKey(ctx.item, -1))
      emit('item-moved', ctx.item, ctx.fromStage, stageValue)
    } else if (props.features?.intraStageReorder !== false) {
      // Same stage reorder
      reorderItem(stageValue, ctx.fromIndex, toIndex)
      emit('item-reordered', ctx.item, stageValue, ctx.fromIndex, toIndex)
    }

    endDrag()
  }

  // ── Expose ─────────────────────────────────────────────────────────────────

  defineExpose({ refresh: () => reload(), refreshStage: reload })

  // ── Type shim (Vue template ref accepts ComponentPublicInstance too) ─────────

  type ComponentPublicInstance = { $el: Element }
</script>

<style scoped>
.kanban-card-enter {
  animation: kanbanCardReveal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes kanbanCardReveal {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>