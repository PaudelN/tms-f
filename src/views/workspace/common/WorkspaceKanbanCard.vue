<template>
  <div
    class="kc3-wrap group/kc3 cursor-pointer select-none"
    @click="emit('view', item.id)"
  >
    <div class="space-y-3">

      <!-- ── Row 1: ID + Priority ── -->
      <div class="flex items-center justify-between gap-2">

        <!-- ID chip -->
        <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
          :style="{ background: 'rgb(var(--color-muted) / 0.6)' }">
          <Hash class="w-2.5 h-2.5 text-muted-foreground/50" />
          <span class="text-[9.5px] font-mono font-bold text-muted-foreground/60 tracking-wider">
            {{ String(item.id).padStart(4, '0') }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <span v-if="item.is_archived" class="kc3-dot-tag" style="background: rgb(var(--color-muted)); color: rgb(var(--color-muted-foreground))">
            <Archive class="w-2.5 h-2.5" />
          </span>
          <!-- Colored dot priority indicators -->
          <div v-if="item.priority === 'high'" class="flex items-center gap-1 px-2 py-0.5 rounded-full" style="background: rgb(239 68 68 / 0.1)">
            <span class="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span class="text-[9px] font-bold text-red-500 uppercase tracking-wide">High</span>
          </div>
          <div v-else-if="item.priority === 'medium'" class="flex items-center gap-1 px-2 py-0.5 rounded-full" style="background: rgb(245 158 11 / 0.1)">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span class="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Med</span>
          </div>
          <div v-else-if="item.priority === 'low'" class="flex items-center gap-1 px-2 py-0.5 rounded-full" style="background: rgb(var(--color-muted))">
            <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <span class="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">Low</span>
          </div>
        </div>
      </div>

      <!-- ── Row 2: Title + avatar ── -->
      <div class="flex items-start gap-3">

        <!-- Avatar — Bordio style: soft pill with initial -->
        <div class="kc3-avatar shrink-0 mt-0.5">
          <span class="text-[11px] font-black">{{ initial }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-foreground leading-snug line-clamp-2
                    group-hover/kc3:text-primary transition-colors duration-200 tracking-[-0.01em]">
            {{ item.name }}
          </p>
          <p v-if="item.user?.name" class="text-[10px] text-muted-foreground/55 truncate mt-0.5 font-medium">
            {{ item.user.name }}
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

      <!-- ── Progress ── -->
      <div v-if="item.progress !== undefined" class="pl-9 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[9px] text-muted-foreground/50 font-semibold uppercase tracking-wide">Progress</span>
          <span class="text-[9px] font-bold text-muted-foreground/60 tabular-nums">{{ item.progress ?? 0 }}%</span>
        </div>
        <div class="h-1 rounded-full bg-muted overflow-hidden">
          <div
            class="h-full rounded-full transition-[width] duration-700 ease-out"
            :style="{ width: `${item.progress ?? 0}%`, background: 'rgb(var(--color-primary))' }"
          />
        </div>
      </div>

      <!-- ── Footer ── -->
      <div class="flex items-center justify-between gap-2 pt-2 border-t border-border/30">

        <!-- Date -->
        <div class="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-medium">
          <CalendarDays class="w-3 h-3 shrink-0" />
          <span class="tabular-nums">{{ formattedDate }}</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-2">
          <span class="kc3-stat">
            <MessageSquare class="w-3 h-3" />
            {{ item.comment_count ?? 0 }}
          </span>
          <span class="kc3-stat">
            <Paperclip class="w-3 h-3" />
            {{ item.attachment_count ?? 0 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Hash, Archive, Check, CalendarDays, MessageSquare, Paperclip } from 'lucide-vue-next'
import type { KanbanStageDefinition } from '@/ui-table/types/kanban.types'

interface WorkspaceItem {
  id: number; name: string; description?: string; status?: string
  priority?: string; progress?: number; comment_count?: number
  attachment_count?: number; is_archived?: boolean; created_at?: string
  user?: { name?: string }
}

const props = defineProps<{ item: WorkspaceItem; stageMeta: KanbanStageDefinition }>()
const emit = defineEmits<{ (e: 'view', id: number): void; (e: 'edit', id: number): void }>()

const initial = computed<string>(() => props.item.name?.charAt(0).toUpperCase() ?? '?')
const isDone = computed<boolean>(() => ['done', 'completed', 'closed'].includes(props.item.status ?? ''))
const formattedDate = computed<string>(() => {
  if (!props.item.created_at) return '—'
  return new Date(props.item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})
</script>

<style scoped>
/* Wrapper */
.kc3-wrap {
  padding: 0;
}

/* Avatar — Bordio soft rounded pill */
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

/* Done button */
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

/* Dot tag */
.kc3-dot-tag {
  display: inline-flex; align-items: center;
  padding: 2px 5px; border-radius: 4px;
  font-size: 9px; font-weight: 700;
}

/* Stats */
.kc3-stat {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 500;
  color: rgb(var(--color-muted-foreground) / 0.5);
  transition: color 0.15s ease;
}
.kc3-wrap:hover .kc3-stat { color: rgb(var(--color-muted-foreground) / 0.7); }
</style>