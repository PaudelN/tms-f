<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/models'

interface Props { tasks: Task[] }
const props = defineProps<Props>()
const grouped = computed<Record<string, Task[]>>(() => {
  const map: Record<string, Task[]> = {}
  props.tasks.forEach((task) => {
    if (!task.dueDate) return
    const key = task.dueDate.toISOString().slice(0, 10)
    map[key] = [...(map[key] ?? []), task]
  })
  return map
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    <article v-for="[day, dayTasks] in Object.entries(grouped)" :key="day" class="rounded-xl border bg-card p-4">
      <h4 class="text-sm font-semibold">{{ day }}</h4>
      <ul class="mt-2 space-y-2 text-sm">
        <li v-for="task in dayTasks" :key="task.id" class="rounded bg-muted/60 px-2 py-1">{{ task.title }}</li>
      </ul>
    </article>
  </div>
</template>
