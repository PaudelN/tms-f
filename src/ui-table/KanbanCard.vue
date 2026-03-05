<template>
  <!--
    KanbanCard — entity-agnostic card shell.

    Handles:
    - Drag-source events (dragstart / dragend)
    - Drop-target events (dragenter / dragleave / dragover / drop)
    - Hover state, selection ring, drag-over indicator
    - Slot surface: default (card body), actions (top-right icon tray)

    Entity-specific content is ALWAYS in the parent via slots.
    This component owns zero business logic.
  -->
  <div
    ref="cardEl"
    draggable="true"
    class="group/card relative rounded-xl border bg-card transition-all duration-200 select-none"
    :class="[
      isDraggingThis
        ? 'opacity-40 scale-[0.98] cursor-grabbing shadow-none'
        : 'cursor-grab shadow-sm hover:shadow-md hover:-translate-y-px',
      isDropTarget
        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary/40'
        : 'border-border',
      densityClass,
    ]"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragenter.prevent="onDragEnter"
    @dragleave="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <!-- Drop indicator stripe at top of card -->
    <div
      v-if="isDropTarget"
      class="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-primary transition-all duration-150"
    />

    <!-- Card body — entity-specific content via default slot -->
    <slot :item="item" :is-dragging="isDraggingThis" :stage="stage" />

    <!-- Action tray — appears on hover, top-right corner -->
    <div
      class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150"
      @click.stop
      @mousedown.stop
    >
      <slot name="actions" :item="item" :stage="stage" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { DragContext } from './types/kanban.types'

  // ── Props ──────────────────────────────────────────────────────────────────

  interface Props {
    item: any
    stage: string
    index: number
    density?: 'compact' | 'default' | 'comfortable'
    /** The currently active drag context (from composable) — used to derive drop-target state */
    activeDragCtx?: DragContext | null
  }

  const props = withDefaults(defineProps<Props>(), {
    density: 'default',
    activeDragCtx: null,
  })

  // ── Emits ──────────────────────────────────────────────────────────────────

  const emit = defineEmits<{
    'drag-start': [ctx: DragContext]
    'drag-end': []
    drop: [targetIndex: number]
  }>()

  // ── Template ref ──────────────────────────────────────────────────────────

  const cardEl = ref<HTMLElement | null>(null)

  // ── Local drag state ───────────────────────────────────────────────────────

  const isDraggingThis = ref(false)
  const isDropTarget = ref(false)
  let enterCount = 0 // tracks nested dragenter/dragleave pairs

  // ── Drag source ────────────────────────────────────────────────────────────

  function onDragStart(e: DragEvent): void {
    isDraggingThis.value = true
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      // Store a lightweight payload so external drop zones can read it
      e.dataTransfer.setData(
        'application/kanban-card',
        JSON.stringify({ stage: props.stage, index: props.index }),
      )
    }
    emit('drag-start', {
      item: props.item,
      fromStage: props.stage,
      fromIndex: props.index,
    })
  }

  function onDragEnd(): void {
    isDraggingThis.value = false
    isDropTarget.value = false
    enterCount = 0
    emit('drag-end')
  }

  // ── Drop target ────────────────────────────────────────────────────────────

  function onDragEnter(e: DragEvent): void {
    // Only react when dragging a kanban card from a different position
    if (!props.activeDragCtx) return
    const isSelf =
      props.activeDragCtx.fromStage === props.stage &&
      props.activeDragCtx.fromIndex === props.index
    if (isSelf) return

    enterCount++
    isDropTarget.value = true
  }

  function onDragLeave(): void {
    enterCount = Math.max(0, enterCount - 1)
    if (enterCount === 0) isDropTarget.value = false
  }

  function onDrop(): void {
    isDropTarget.value = false
    enterCount = 0
    emit('drop', props.index)
  }

  // ── Density class ──────────────────────────────────────────────────────────

  const densityClass = computed(() => {
    if (props.density === 'compact') return 'p-2.5'
    if (props.density === 'comfortable') return 'p-5'
    return 'p-3.5'
  })
</script>