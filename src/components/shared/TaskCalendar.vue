<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/models'

interface Props { tasks: Task[] }
const props = defineProps<Props>()
const datedTasks = computed(() => props.tasks.filter((task) => task.dueDate))
</script>

<template>
  <div class="rounded-xl border border-border p-4">
    <h3 class="font-semibold mb-3">Calendar Snapshot</h3>
    <ul class="space-y-2">
      <li v-for="task in datedTasks" :key="task.id" class="flex items-center justify-between text-sm">
        <span>{{ task.title }}</span>
        <span class="text-muted-foreground">{{ new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(task.dueDate as Date) }}</span>
      </li>
    </ul>
  </div>
</template>
