<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/models'
import TaskCard from './TaskCard.vue'
import EmptyState from './EmptyState.vue'

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()
const groups = computed(() => ({
  todo: props.tasks.filter((task) => task.status === 'todo'),
  'in-progress': props.tasks.filter((task) => task.status === 'in-progress'),
  review: props.tasks.filter((task) => task.status === 'review'),
  done: props.tasks.filter((task) => task.status === 'done'),
}))
</script>

<template>
  <div v-if="tasks.length" class="space-y-6">
    <section v-for="[status, statusTasks] in Object.entries(groups)" :key="status" class="space-y-2">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{{ status }} ({{ statusTasks.length }})</h2>
      <TaskCard v-for="task in statusTasks" :key="task.id" :task="task" />
    </section>
  </div>
  <EmptyState v-else title="No tasks" description="Create a task to get started." />
</template>
