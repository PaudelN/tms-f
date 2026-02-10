<script setup lang="ts">
import { computed, onMounted } from 'vue'
import TaskList from '@/components/shared/TaskList.vue'
import { useTasksStore } from '@/stores/tasks'

const tasksStore = useTasksStore()
onMounted(() => { void tasksStore.fetchTasks() })
const myTasks = computed(() => tasksStore.filteredTasks)
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold">My Tasks</h1>
    <input
      :value="tasksStore.searchQuery"
      class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      placeholder="Search tasks"
      @input="tasksStore.setSearchQuery(($event.target as HTMLInputElement).value)"
    >
    <TaskList :tasks="myTasks" />
  </section>
</template>
