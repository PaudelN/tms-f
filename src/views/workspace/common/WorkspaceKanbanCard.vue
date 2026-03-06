<template>
  <div class="aurora-ec space-y-2.5 cursor-pointer group/ec" @click="emit('view', item.id)">

    <!-- ── Row 1: ID + priority tags ── -->
    <div class="flex items-center justify-between gap-2">
      <span class="aurora-ec-id">{{ idLabel }}</span>
      <div class="flex items-center gap-1 flex-wrap justify-end">
        <span v-if="item.is_archived" class="aurora-ec-tag aurora-ec-tag-arc">Archived</span>
        <span v-if="item.priority === 'high'"   class="aurora-ec-tag aurora-ec-tag-high">↑ High</span>
        <span v-if="item.priority === 'medium'" class="aurora-ec-tag aurora-ec-tag-med">→ Med</span>
        <span v-if="item.priority === 'low'"    class="aurora-ec-tag aurora-ec-tag-low">↓ Low</span>
      </div>
    </div>

    <!-- ── Row 2: Avatar + name + check ── -->
    <div class="flex items-start gap-2.5 pr-2">
      <!-- Avatar -->
      <div class="aurora-ec-avatar shrink-0">
        <span class="text-xs font-black">{{ initial }}</span>
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
      <!-- Done check -->
      <div
        class="aurora-ec-check shrink-0 mt-0.5"
        :class="isDone ? 'aurora-ec-check-done' : ''"
        @click.stop
      >
        <svg v-if="isDone" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
    </div>

    <!-- ── Row 3: Description ── -->
    <p v-if="item.description" class="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-0.5">
      {{ item.description }}
    </p>

    <!-- ── Row 4: Progress bar (if has sub-tasks hint) ── -->
    <div v-if="item.progress !== undefined" class="aurora-ec-progress-wrap">
      <div class="aurora-ec-progress-bar">
        <div class="aurora-ec-progress-fill" :style="{ width: `${item.progress ?? 0}%` }" />
      </div>
      <span class="aurora-ec-progress-pct">{{ item.progress ?? 0 }}%</span>
    </div>

    <!-- ── Row 5: Footer ── -->
    <div class="flex items-center justify-between pt-2 border-t border-border">
      <!-- Date -->
      <div class="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
        <svg class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="tabular-nums">{{ formattedDate }}</span>
      </div>

      <!-- Meta stats -->
      <div class="flex items-center gap-3">
        <span class="aurora-ec-meta-stat">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          8
        </span>
        <span class="aurora-ec-meta-stat">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
          1
        </span>
        <!-- Stage dot badge -->
        <span class="aurora-ec-stage-badge">
          <span class="aurora-ec-stage-dot" :class="stageMeta.dot ?? 'bg-primary'" />
          {{ stageMeta.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Workspace } from '@/stores/workspace'
import type { KanbanStageDefinition } from '@/ui-table/types/kanban.types'

const props = defineProps<{
  item:      Workspace & { progress?: number; priority?: string }
  stageMeta: KanbanStageDefinition
}>()

const emit = defineEmits<{
  (e: 'view', id: number): void
  (e: 'edit', id: number): void
}>()

const initial  = computed(() => props.item.name?.charAt(0).toUpperCase() ?? '?')
const idLabel  = computed(() => `#${String(props.item.id).padStart(4, '0')}`)
const isDone   = computed(() => ['done', 'completed', 'closed'].includes(props.item.status ?? ''))

const formattedDate = computed(() => {
  if (!props.item.created_at) return '—'
  return new Date(props.item.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
})
</script>

<style>
/* Aurora Enterprise Card */
.aurora-ec { }

/* ID */
.aurora-ec-id {
  font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums;
  color: rgb(var(--color-muted-foreground));
  background: rgb(var(--color-muted)); padding: 2px 7px; border-radius: 5px;
  flex-shrink: 0;
}

/* Tags */
.aurora-ec-tag {
  display: inline-flex; align-items: center;
  padding: 1px 6px; border-radius: 4px;
  font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
}
.aurora-ec-tag-arc  { background: rgb(var(--color-muted)); color: rgb(var(--color-muted-foreground)); }
.aurora-ec-tag-high { background: rgb(var(--color-destructive)); color: rgb(var(--color-destructive-foreground)); }
.aurora-ec-tag-med  { background: rgb(var(--color-muted)); color: rgb(var(--color-foreground)); }
.aurora-ec-tag-low  { background: rgb(var(--color-muted)); color: rgb(var(--color-muted-foreground)); }

/* Avatar */
.aurora-ec-avatar {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgb(var(--color-primary));
  color: rgb(var(--color-primary-foreground));
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s ease;
}
.group\/ec:hover .aurora-ec-avatar { transform: scale(1.05); }

/* Check circle */
.aurora-ec-check {
  width: 18px; height: 18px; border-radius: 9999px;
  border: 2px solid rgb(var(--color-border));
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s ease, background 0.15s ease;
  cursor: pointer; flex-shrink: 0;
}
.aurora-ec-check:hover { border-color: rgb(var(--color-primary)); }
.aurora-ec-check-done {
  background: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary-foreground));
}

/* Progress */
.aurora-ec-progress-wrap { display: flex; align-items: center; gap: 6px; }
.aurora-ec-progress-bar  {
  flex: 1; height: 3px; border-radius: 9999px;
  background: rgb(var(--color-muted)); overflow: hidden;
}
.aurora-ec-progress-fill {
  height: 100%; border-radius: 9999px;
  background: rgb(var(--color-primary));
  transition: width 0.4s ease;
}
.aurora-ec-progress-pct { font-size: 9px; font-weight: 800; color: rgb(var(--color-muted-foreground)); flex-shrink: 0; }

/* Meta stats */
.aurora-ec-meta-stat {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 600; color: rgb(var(--color-muted-foreground));
}

/* Stage badge */
.aurora-ec-stage-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
  background: rgb(var(--color-muted)); padding: 2px 7px; border-radius: 5px;
  color: rgb(var(--color-muted-foreground));
}
.aurora-ec-stage-dot {
  width: 5px; height: 5px; border-radius: 9999px; flex-shrink: 0;
  background: rgb(var(--color-primary));
}
</style>