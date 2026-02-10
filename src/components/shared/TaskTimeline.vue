<script setup lang="ts">
import type { Task } from '@/types/models'

defineProps<{ tasks: Task[] }>()

const duration = (task: Task) => {
  if (!task.startDate || !task.dueDate) return 1
  const start = new Date(task.startDate).getTime()
  const end = new Date(task.dueDate).getTime()
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1)
}
</script>

<template>
  <div class="rounded-xl border p-4">
    <h3 class="mb-4 text-lg font-semibold">Timeline</h3>
    <div class="space-y-3">
      <div v-for="task in tasks" :key="task.id" class="grid grid-cols-[220px_1fr] items-center gap-3">
        <span class="truncate text-sm">{{ task.title }}</span>
        <div class="h-4 rounded bg-muted">
          <div class="h-4 rounded bg-primary" :style="{ width: `${Math.min(100, duration(task) * 8)}%` }" />
        </div>
      </div>
    </div>
  </div>
</template>
