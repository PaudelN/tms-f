<template>
  <!--
    KanbanCard.vue — Pure display card. Zero drag logic.
    SortableJS (via vuedraggable) handles dragging externally
    through the .kanban-drag-handle class.

    The card's visual identity comes from the stage color (hex from backend).
    A colored top stripe creates the 3D "labeled column" effect.
    Hover elevates the card with enhanced shadow.

    Slots:
      #default      — main card body (entity-specific content)
      #actions      — hover action buttons (top-right tray)
      #badge        — priority / status badge (top-left area)
      #meta         — secondary info row (date, assignee, etc.)
      #footer       — bottom row (counts, icons, progress)
      #header-extra — extra content in the colored stripe area
  -->
  <div
    class="kanban-card group/card relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white transition-all duration-200 select-none"
    :class="[
      densityClass,
      isNew ? 'kanban-card-enter' : '',
    ]"
    :style="cardStyle"
  >
    <!-- ── Colored top stripe ───────────────────────────────────────────── -->
    <!-- 4px solid band in the stage color — creates the 3D labeled effect -->
    <div
      class="absolute inset-x-0 top-0 h-[4px] rounded-t-2xl"
      :style="{ background: stageColor }"
    />

    <!-- ── Colored glow background (subtle tint behind everything) ──────── -->
    <div
      class="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.035]"
      :style="{ background: stageColor }"
    />

    <!-- ── Drag handle (visible on hover, used by SortableJS) ───────────── -->
    <div
      class="kanban-drag-handle absolute left-2 top-1/2 -translate-y-1/2 z-10
             flex h-6 w-4 cursor-grab active:cursor-grabbing
             flex-col items-center justify-center gap-[3px]
             opacity-0 transition-opacity duration-150
             group-hover/card:opacity-40 hover:!opacity-80"
    >
      <span class="h-[3px] w-3 rounded-full bg-current" />
      <span class="h-[3px] w-3 rounded-full bg-current" />
      <span class="h-[3px] w-3 rounded-full bg-current" />
    </div>

    <!-- ── Action tray (top-right, visible on hover) ─────────────────────── -->
    <div
      class="absolute right-2 top-2 z-10 flex items-center gap-1
             opacity-0 transition-opacity duration-150
             group-hover/card:opacity-100"
      @click.stop
      @mousedown.stop
      @pointerdown.stop
    >
      <slot name="actions" :item="item" :stage="stage" />
    </div>

    <!-- ── Card content ──────────────────────────────────────────────────── -->
    <!-- Top padding accounts for the 4px stripe -->
    <div class="flex flex-col gap-2 pt-2">

      <!-- Badge row (priority, labels, etc.) -->
      <div
        v-if="$slots.badge"
        class="flex items-center gap-2"
      >
        <slot name="badge" :item="item" :stage="stage" />
      </div>

      <!-- Main content slot (title, description, etc.) -->
      <slot :item="item" :stage="stage" />

      <!-- Meta row (assignee, date, etc.) -->
      <div
        v-if="$slots.meta"
        class="flex items-center gap-2"
      >
        <slot name="meta" :item="item" :stage="stage" />
      </div>

      <!-- Footer row (counts, progress, icons) -->
      <div
        v-if="$slots.footer"
        class="flex items-center justify-between pt-1 border-t border-gray-100/70"
      >
        <slot name="footer" :item="item" :stage="stage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KanbanStageDefinition } from './types/kanban.types'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  item:      Record<string, any>
  stage:     string                    // stage value (e.g. 'active')
  stageMeta: KanbanStageDefinition               // full stage definition with color, label
  index:     number
  density?:  'compact' | 'default' | 'comfortable'
  isNew?:    boolean                   // triggers entry animation
}

const props = withDefaults(defineProps<Props>(), {
  density: 'default',
  isNew:   false,
})

// ── Computed ───────────────────────────────────────────────────────────────

const stageColor = computed(() => props.stageMeta?.color ?? '#6366f1')

/**
 * Card style: white background + 3D drop shadow.
 * The shadow color is tinted with the stage color for depth.
 * On hover: deeper shadow + slight upward translate (done via CSS class).
 */
const cardStyle = computed(() => ({
  boxShadow: `
    0 1px 3px 0 rgba(0,0,0,0.06),
    0 4px 12px -2px rgba(0,0,0,0.08),
    0 0 0 1px rgba(0,0,0,0.03)
  `,
}))

const densityClass = computed(() => {
  const base = 'pl-6 pr-3' // left padding for drag handle space
  return {
    compact:     `${base} py-2.5`,
    default:     `${base} py-3.5`,
    comfortable: `${base} py-5`,
  }[props.density]
})
</script>

<style scoped>
/* ── 3D hover elevation ───────────────────────────────────────────────────── */
.kanban-card {
  transform: translateY(0);
  will-change: transform, box-shadow;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 2px 6px 0 rgba(0,0,0,0.06),
    0 10px 28px -4px rgba(0,0,0,0.14),
    0 0 0 1px rgba(0,0,0,0.04) !important;
}

/* ── Entry animation for newly dropped cards ─────────────────────────────── */
@keyframes kanbanCardEnter {
  0% {
    opacity: 0;
    transform: scale(0.94) translateY(6px);
  }
  60% {
    transform: scale(1.01) translateY(-1px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.kanban-card-enter {
  animation: kanbanCardEnter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* ── Drag ghost (the placeholder slot while dragging) ────────────────────── */
:global(.sortable-ghost) {
  opacity: 0.25 !important;
  background: #f1f5f9 !important;
  border: 2px dashed #94a3b8 !important;
  box-shadow: none !important;
}

/* ── Drag chosen (the card being dragged) ────────────────────────────────── */
:global(.sortable-chosen) {
  opacity: 0.9;
  transform: rotate(1.5deg) scale(1.03) !important;
  box-shadow: 0 20px 60px -10px rgba(0,0,0,0.25) !important;
  cursor: grabbing !important;
}
</style>