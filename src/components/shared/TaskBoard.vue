<script setup lang="ts">
import { computed } from 'vue'
import type { Task, TaskStatus } from '@/types/models'
import TaskCard from './TaskCard.vue'

interface Props { tasks: Task[] }
const props = defineProps<Props>()
const columns: TaskStatus[] = ['todo', 'in-progress', 'review', 'done']
const byStatus = computed(() => Object.fromEntries(columns.map((status) => [status, props.tasks.filter((task) => task.status === status)])))
</script>

<template>
  <div class="grid gap-4 md:grid-cols-4">
    <section v-for="status in columns" :key="status" class="rounded-xl border border-border bg-muted/50 p-3 space-y-3">
      <h3 class="text-sm font-semibold capitalize">{{ status }} ({{ byStatus[status].length }})</h3>
      <TaskCard v-for="task in byStatus[status]" :key="task.id" :task="task" variant="board" />
    </section>
  </div>
</template>
