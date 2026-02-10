<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/models'

const props = defineProps<{ tasks: Task[] }>()

const groupedByDate = computed(() => {
  return props.tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!task.dueDate) return acc
    const dueDate = new Date(task.dueDate); const key = dueDate.toISOString().slice(0,10)
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})
})
</script>

<template>
  <div class="rounded-xl border p-4">
    <h3 class="mb-4 text-lg font-semibold">Calendar</h3>
    <div class="space-y-3">
      <div v-for="(tasks, date) in groupedByDate" :key="date" class="rounded-lg border p-3">
        <p class="text-sm font-semibold">{{ date }}</p>
        <ul class="mt-2 space-y-1 text-sm text-muted-foreground">
          <li v-for="task in tasks" :key="task.id">• {{ task.title }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
