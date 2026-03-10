<template>
  <div
    class="kc3-wrap group/kc3 cursor-pointer select-none"
    @click="emit('view', item.id)"
  >
    <div class="space-y-3">

      <!-- ── Row 1: ID + Visibility ── -->
      <div class="flex items-center justify-between gap-2">

        <!-- ID chip -->
        <div
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
          :style="{ background: 'rgb(var(--color-muted) / 0.6)' }"
        >
          <Hash class="w-2.5 h-2.5 text-muted-foreground/50" />
          <span class="text-[9.5px] font-mono font-bold text-muted-foreground/60 tracking-wider">
            {{ String(item.id).padStart(4, '0') }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Visibility chip -->
          <span
            v-if="item.visibility"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide"
            :style="{ background: 'rgb(var(--color-muted) / 0.6)', color: 'rgb(var(--color-muted-foreground) / 0.6)' }"
          >
            <Globe v-if="item.visibility === 'public'" class="w-2.5 h-2.5" />
            <Lock v-else-if="item.visibility === 'private'" class="w-2.5 h-2.5" />
            <Users v-else class="w-2.5 h-2.5" />
            {{ item.visibility?.value }}
          </span>
        </div>
      </div>

      <!-- ── Row 2: Title + avatar ── -->
      <div class="flex items-start gap-3">

        <!-- Avatar -->
        <div class="kc3-avatar shrink-0 mt-0.5">
          <span class="text-[11px] font-black">{{ initial }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-foreground leading-snug line-clamp-2
                    group-hover/kc3:text-primary transition-colors duration-200 tracking-[-0.01em]">
            {{ item.name }}
          </p>
          <p v-if="item.creator?.name" class="text-[10px] text-muted-foreground/55 truncate mt-0.5 font-medium">
            {{ item.creator.name }}
          </p>
        </div>

        <!-- Done toggle -->
        <button
          type="button"
          class="kc3-done-btn shrink-0 mt-0.5"
          :class="isDone ? 'kc3-done-active' : ''"
          @click.stop
        >
          <Check v-if="isDone" class="w-2.5 h-2.5" :stroke-width="3.5" />
        </button>
      </div>

      <!-- ── Description ── -->
      <p
        v-if="item.description"
        class="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed pl-9"
      >
        {{ item.description }}
      </p>

      <!-- ── Dates ── -->
      <div v-if="item.start_date || item.end_date" class="pl-9 flex items-center gap-2">
        <div
          v-if="item.start_date"
          class="inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 font-medium"
        >
          <CalendarDays class="w-3 h-3 shrink-0" />
          <span class="tabular-nums">{{ formatDate(item.start_date) }}</span>
        </div>
        <span v-if="item.start_date && item.end_date" class="text-muted-foreground/30 text-[10px]">→</span>
        <div
          v-if="item.end_date"
          class="inline-flex items-center gap-1 text-[10px] font-medium"
          :class="isOverdue ? 'text-red-400' : 'text-muted-foreground/50'"
        >
          <span class="tabular-nums">{{ formatDate(item.end_date) }}</span>
        </div>
      </div>

      <!-- ── Footer ── -->
      <div class="flex items-center justify-between gap-2 pt-2 border-t border-border/30">

        <!-- Created date fallback -->
        <div class="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-medium">
          <CalendarDays class="w-3 h-3 shrink-0" />
          <span class="tabular-nums">{{ formattedCreatedAt }}</span>
        </div>

        <!-- Workspace tag -->
        <span
          v-if="item.workspace?.name"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
          :style="{ background: 'rgb(var(--color-muted) / 0.6)', color: 'rgb(var(--color-muted-foreground) / 0.55)' }"
        >
          <Layers class="w-2.5 h-2.5 shrink-0" />
          {{ item.workspace.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Check, Globe, Hash, Layers, Lock, Users } from 'lucide-vue-next'
import type { KanbanStageDefinition } from '@/ui-table/types/kanban.types'
import type { Project } from '@/stores/project'

const props = defineProps<{
  item: Project
  stageMeta: KanbanStageDefinition
}>()

const emit = defineEmits<{
  (e: 'view', id: number): void
  (e: 'edit', id: number): void
}>()

const initial = computed<string>(() => props.item.name?.charAt(0).toUpperCase() ?? '?')

const isDone = computed<boolean>(() =>
  ['completed', 'done', 'closed', 'cancelled'].includes(props.item.status ?? ''),
)

const isOverdue = computed<boolean>(() => {
  if (!props.item.end_date) return false
  return new Date(props.item.end_date) < new Date()
})

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formattedCreatedAt = computed<string>(() => formatDate(props.item.created_at))
</script>

<style scoped>
.kc3-wrap {
  padding: 0;
}

.kc3-avatar {
  width: 28px; height: 28px;
  border-radius: 9px;
  background: rgb(var(--color-primary) / 0.1);
  color: rgb(var(--color-primary));
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}
.group\/kc3:hover .kc3-avatar {
  background: rgb(var(--color-primary));
  color: rgb(var(--color-primary-foreground));
  transform: scale(1.08) rotate(-3deg);
}

.kc3-done-btn {
  width: 17px; height: 17px; border-radius: 6px;
  border: 1.5px solid rgb(var(--color-border) / 0.7);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
}
.kc3-done-btn:hover { border-color: rgb(var(--color-primary)); transform: scale(1.15); }
.kc3-done-active {
  background: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary-foreground));
  border-radius: 6px;
}
</style>