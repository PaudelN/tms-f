<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const tasksStore = useTasksStore()

onMounted(async () => {
  await tasksStore.fetchTasks()
})

const totals = computed(() => ({
  all: tasksStore.filteredTasks.length,
  todo: tasksStore.tasksByStatus.todo.length,
  progress: tasksStore.tasksByStatus['in-progress'].length,
  done: tasksStore.tasksByStatus.done.length,
}))
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Dashboard</h2>
    <div class="grid gap-3 md:grid-cols-4">
      <article class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">All Tasks</p><p class="text-2xl font-semibold">{{ totals.all }}</p></article>
      <article class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">To do</p><p class="text-2xl font-semibold">{{ totals.todo }}</p></article>
      <article class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">In progress</p><p class="text-2xl font-semibold">{{ totals.progress }}</p></article>
      <article class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Done</p><p class="text-2xl font-semibold">{{ totals.done }}</p></article>
    </div>
  </section>
</template>
