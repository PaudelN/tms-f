<template>
  <div
    class="group/tc flex flex-col gap-2 cursor-pointer select-none"
    @click="emit('view', item.id)"
  >
    <!-- ── Row 1: task number + priority ── -->
    <div class="flex items-center justify-between gap-2">
      <div
        class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
        style="background: rgb(var(--color-muted) / 0.6)"
      >
        <Hash class="w-2.5 h-2.5 text-muted-foreground/50" />
        <span class="text-[9.5px] font-mono font-bold text-muted-foreground/60 tracking-wider">
          {{ item.task_number }}
        </span>
      </div>

      <span
        v-if="priorityObj"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border shrink-0"
        :class="priorityObj.badge"
      >
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="priorityObj.dot" />
        {{ priorityObj.label }}
      </span>
    </div>

    <!-- ── Title ── -->
    <p
      class="text-[13px] font-semibold text-foreground leading-snug line-clamp-2
             group-hover/tc:text-primary transition-colors duration-150 tracking-[-0.01em]"
    >
      {{ item.title }}
    </p>

    <!-- ── Description ── -->
    <p
      v-if="item.description"
      class="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed"
    >
      {{ item.description }}
    </p>

    <!-- ── Footer: creator + due date ── -->
    <div class="flex items-center justify-between gap-2 pt-1.5 border-t border-border/30 mt-0.5">
      <div v-if="item.creator" class="flex items-center gap-1.5 min-w-0">
        <div
          class="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
          :style="{ background: avatarColor }"
        >
          {{ item.creator.name.charAt(0).toUpperCase() }}
        </div>
        <span class="text-[10px] text-muted-foreground/55 truncate">
          {{ item.creator.name }}
        </span>
      </div>
      <div v-else class="flex-1" />

      <div
        v-if="item.due_date"
        class="flex items-center gap-1 text-[10px] font-medium shrink-0"
        :class="
          item.is_overdue
            ? 'text-red-500'
            : item.is_due_today
              ? 'text-amber-500'
              : 'text-muted-foreground/50'
        "
      >
        <CalendarDays class="w-3 h-3 shrink-0" />
        <span class="tabular-nums">{{ formattedDue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Hash, CalendarDays } from "lucide-vue-next"
import type { Task } from "@/stores/task"
import type { KanbanStageDefinition } from "@/ui-table/types/kanban.types"

const props = defineProps<{
  item:      Task
  stageMeta: KanbanStageDefinition
}>()

const emit = defineEmits<{
  (e: "view", id: number): void
  (e: "edit", id: number): void
}>()

const priorityObj = computed(() => {
  const p = props.item.priority
  if (!p) return null
  if (typeof p === "object" && "badge" in p) return p
  return null
})

const AVATAR_COLORS = ["#7c6ff7", "#f6a623", "#34c789", "#4a9eff", "#ff6b9d", "#a855f7"]
const avatarColor = computed(() => {
  const name = props.item.creator?.name ?? ""
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
})

const formattedDue = computed(() => {
  if (!props.item.due_date) return ""
  if (props.item.is_due_today) return "Today"
  return new Date(props.item.due_date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  })
})
</script>