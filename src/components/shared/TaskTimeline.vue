<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/models'

interface Props { tasks: Task[] }
const props = defineProps<Props>()
const rows = computed(() => props.tasks.filter((task) => task.startDate && task.dueDate))
const toWidth = (task: Task): string => {
  const start = (task.startDate as Date).getTime()
  const end = (task.dueDate as Date).getTime()
  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.max(1, Math.round((end - start) / dayMs))
  return `${Math.min(100, Math.max(12, days * 8))}%`
}
</script>

<template>
  <div class="space-y-2 rounded-xl border bg-card p-4">
    <div v-for="task in rows" :key="task.id" class="grid grid-cols-[180px_1fr] items-center gap-3">
      <p class="truncate text-sm">{{ task.title }}</p>
      <div class="h-6 rounded bg-muted">
        <div class="h-6 rounded bg-primary/70" :style="{ width: toWidth(task) }" />
      </div>
    </div>
  </div>
</template>
