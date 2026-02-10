<script setup lang="ts">
import { onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const tasksStore = useTasksStore()
onMounted(() => { void tasksStore.fetchTasks('p1') })
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold">Dashboard</h1>
    <div class="grid gap-4 md:grid-cols-3">
      <article class="rounded-xl border border-border p-4">
        <p class="text-sm text-muted-foreground">Total tasks</p>
        <p class="text-2xl font-semibold">{{ tasksStore.tasks.length }}</p>
      </article>
      <article class="rounded-xl border border-border p-4">
        <p class="text-sm text-muted-foreground">In progress</p>
        <p class="text-2xl font-semibold">{{ tasksStore.tasksByStatus['in-progress'].length }}</p>
      </article>
      <article class="rounded-xl border border-border p-4">
        <p class="text-sm text-muted-foreground">Done</p>
        <p class="text-2xl font-semibold">{{ tasksStore.tasksByStatus.done.length }}</p>
      </article>
    </div>
  </section>
</template>
