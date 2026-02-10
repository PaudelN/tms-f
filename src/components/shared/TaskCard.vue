<script setup lang="ts">
import type { Task } from '@/types/models'
import PriorityBadge from './PriorityBadge.vue'
import StatusBadge from './StatusBadge.vue'
import UserAvatar from './UserAvatar.vue'
import { formatRelativeDate } from '@/utils/format'

interface Props {
  task: Task
  variant?: 'list' | 'board'
}

withDefaults(defineProps<Props>(), { variant: 'list' })
const emit = defineEmits<{ open: [task: Task] }>()
</script>

<template>
  <article class="rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md transition cursor-pointer" @click="emit('open', task)">
    <div class="flex items-center justify-between gap-2">
      <h3 class="font-medium" :class="variant === 'board' ? 'text-sm' : 'text-base'">{{ task.title }}</h3>
      <PriorityBadge :priority="task.priority" />
    </div>
    <p v-if="task.description" class="mt-1 text-sm text-muted-foreground line-clamp-1">{{ task.description }}</p>
    <div class="mt-2 flex items-center justify-between gap-2">
      <StatusBadge :status="task.status" />
      <span class="text-xs text-muted-foreground">{{ formatRelativeDate(task.dueDate) }}</span>
    </div>
    <div class="mt-2 flex items-center justify-between">
      <div class="flex gap-1 flex-wrap">
        <span v-for="tag in task.tags.slice(0, 2)" :key="tag" class="text-xs bg-muted rounded px-2 py-0.5">#{{ tag }}</span>
      </div>
      <UserAvatar :name="task.assignee?.name ?? 'U'" />
    </div>
  </article>
</template>
