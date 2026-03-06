<template>
  <div
    class="space-y-2.5 cursor-pointer select-none group/ec"
    @click="emit('view', item.id)"
  >

    <!-- ── Row 1: ID + priority ── -->
    <div class="flex items-center justify-between gap-2 min-w-0">

      <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted shrink-0">
        <Hash class="w-2.5 h-2.5 text-muted-foreground" />
        <span class="text-[10px] font-black text-muted-foreground tabular-nums tracking-wide">
          {{ String(item.id).padStart(4, '0') }}
        </span>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <Badge v-if="item.is_archived" variant="secondary" class="text-[9px] h-4 px-1.5 font-extrabold uppercase tracking-wide gap-0.5">
          <Archive class="w-2.5 h-2.5" />
          Archived
        </Badge>
        <Badge v-if="item.priority === 'high'" variant="destructive" class="text-[9px] h-4 px-1.5 font-extrabold uppercase tracking-wide gap-0.5">
          <ArrowUp class="w-2.5 h-2.5" />
          High
        </Badge>
        <Badge v-else-if="item.priority === 'medium'" variant="outline" class="text-[9px] h-4 px-1.5 font-extrabold uppercase tracking-wide gap-0.5 text-primary border-primary/30">
          <ArrowRight class="w-2.5 h-2.5" />
          Med
        </Badge>
        <Badge v-else-if="item.priority === 'low'" variant="secondary" class="text-[9px] h-4 px-1.5 font-extrabold uppercase tracking-wide gap-0.5">
          <ArrowDown class="w-2.5 h-2.5" />
          Low
        </Badge>
      </div>
    </div>

    <!-- ── Row 2: Avatar + name + completion ── -->
    <div class="flex items-start gap-2.5 pr-1">

      <!-- Avatar -->
      <div
        class="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center
               justify-content-center shrink-0 flex items-center justify-center
               text-xs font-black transition-transform duration-150 group-hover/ec:scale-105"
      >
        {{ initial }}
      </div>

      <!-- Name + owner -->
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-bold text-foreground leading-snug line-clamp-2
                  group-hover/ec:text-primary transition-colors duration-150">
          {{ item.name }}
        </p>
        <p v-if="item.user?.name" class="text-[10px] text-muted-foreground truncate mt-0.5 font-medium">
          {{ item.user.name }}
        </p>
      </div>

      <!-- Done toggle -->
      <button
        type="button"
        class="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center
               shrink-0 mt-0.5 transition-all duration-150"
        :class="isDone
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-border hover:border-primary'"
        @click.stop
      >
        <Check v-if="isDone" class="w-2.5 h-2.5" :stroke-width="3" />
      </button>
    </div>

    <!-- ── Row 3: Description ── -->
    <p
      v-if="item.description"
      class="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-0.5"
    >
      {{ item.description }}
    </p>

    <!-- ── Row 4: Progress bar ── -->
    <div v-if="item.progress !== undefined" class="flex items-center gap-2">
      <div class="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          :style="{ width: `${item.progress ?? 0}%` }"
        />
      </div>
      <span class="text-[9px] font-extrabold text-muted-foreground shrink-0 tabular-nums">
        {{ item.progress ?? 0 }}%
      </span>
    </div>

    <!-- ── Row 5: Footer ── -->
    <div class="flex items-center justify-between gap-2 pt-2 border-t border-border">

      <!-- Date -->
      <div class="flex items-center gap-1 text-[10px] text-muted-foreground font-medium shrink-0">
        <CalendarDays class="w-3 h-3 shrink-0" />
        <span class="tabular-nums">{{ formattedDate }}</span>
      </div>

      <!-- Stats + stage badge -->
      <div class="flex items-center gap-2 min-w-0">

        <div class="flex items-center gap-0.5 text-[10px] text-muted-foreground font-semibold">
          <MessageSquare class="w-3 h-3" />
          <span>{{ item.comment_count ?? 0 }}</span>
        </div>

        <div class="flex items-center gap-0.5 text-[10px] text-muted-foreground font-semibold">
          <Paperclip class="w-3 h-3" />
          <span>{{ item.attachment_count ?? 0 }}</span>
        </div>

        <!-- Stage badge -->
        <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted shrink-0 max-w-[88px]">
          <span
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :class="stageMeta.dot ?? 'bg-primary'"
          />
          <span class="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wide truncate">
            {{ stageMeta.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Hash, Archive,
  ArrowUp, ArrowRight, ArrowDown,
  Check, CalendarDays,
  MessageSquare, Paperclip,
} from 'lucide-vue-next'
import Badge from '@/components/ui/badge/Badge.vue'
import type { KanbanStageDefinition } from '@/ui-table/types/kanban.types'

// ── Props ─────────────────────────────────────────────────────────────────────
interface WorkspaceItem {
  id:               number
  name:             string
  description?:     string
  status?:          string
  priority?:        string
  progress?:        number
  comment_count?:   number
  attachment_count?: number
  is_archived?:     boolean
  created_at?:      string
  user?: {
    name?: string
  }
}

const props = defineProps<{
  item:      WorkspaceItem
  stageMeta: KanbanStageDefinition
}>()

const emit = defineEmits<{
  (e: 'view', id: number): void
  (e: 'edit', id: number): void
}>()

// ── Computed ──────────────────────────────────────────────────────────────────
const initial = computed<string>(() => props.item.name?.charAt(0).toUpperCase() ?? '?')

const isDone = computed<boolean>(() =>
  ['done', 'completed', 'closed'].includes(props.item.status ?? '')
)

const formattedDate = computed<string>(() => {
  if (!props.item.created_at) return '—'
  return new Date(props.item.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
})
</script>