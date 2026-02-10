<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import TaskQuickAdd from '@/components/shared/TaskQuickAdd.vue'
import TaskList from '@/components/shared/TaskList.vue'
import { useTasksStore } from '@/stores/tasks'

const tasksStore = useTasksStore()
const { filteredTasks, loading } = storeToRefs(tasksStore)

onMounted(() => {
  tasksStore.fetchTasks().catch(() => null)
})
</script>

<template>
  <section class="space-y-4">
    <TaskQuickAdd />
    <TaskList :tasks="filteredTasks" :loading="loading" />
  </section>
</template>
