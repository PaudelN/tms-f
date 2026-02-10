<script setup lang="ts">
import { onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import TaskList from '@/components/shared/TaskList.vue'
import { useTasksStore } from '@/stores/tasks'
import { useTaskSearch } from '@/composables/useTaskSearch'

const store = useTasksStore()
const { query } = useTaskSearch((value) => store.setSearchQuery(value))

onMounted(async () => {
  await store.fetchTasks()
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-semibold">My Tasks</h2>
      <div class="flex gap-2">
        <Button variant="outline" @click="store.setQuickFilter('my-tasks')">My tasks</Button>
        <Button variant="outline" @click="store.setQuickFilter('due-today')">Due today</Button>
        <Button variant="outline" @click="store.setQuickFilter('overdue')">Overdue</Button>
      </div>
    </div>
    <input v-model="query" type="search" class="h-10 w-full rounded-md border px-3" placeholder="Search tasks..." />
    <TaskList :tasks="store.filteredTasks" :loading="store.loading" @task-click="() => undefined" @task-edit="() => undefined" @task-delete="(task) => store.deleteTask(task.id)" @task-status-change="(task, status) => store.updateTaskStatus(task.id, status)"/>
  </section>
</template>
