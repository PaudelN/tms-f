<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import TaskQuickAdd from '@/components/shared/TaskQuickAdd.vue'
import TaskList from '@/components/shared/TaskList.vue'
import TaskBoard from '@/components/shared/TaskBoard.vue'
import TaskCalendar from '@/components/shared/TaskCalendar.vue'
import TaskTimeline from '@/components/shared/TaskTimeline.vue'

const route = useRoute()
const tasksStore = useTasksStore()

onMounted(() => {
  void tasksStore.fetchTasks(route.params.id as string)
})

const view = computed(() => tasksStore.viewType)
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Project {{ route.params.id }}</h1>
      <div class="flex gap-2">
        <button class="rounded-md border px-3 py-1 text-sm" @click="tasksStore.setViewType('list')">List</button>
        <button class="rounded-md border px-3 py-1 text-sm" @click="tasksStore.setViewType('board')">Board</button>
        <button class="rounded-md border px-3 py-1 text-sm" @click="tasksStore.setViewType('calendar')">Calendar</button>
        <button class="rounded-md border px-3 py-1 text-sm" @click="tasksStore.setViewType('timeline')">Timeline</button>
      </div>
    </div>

    <TaskQuickAdd />

    <TaskList v-if="view === 'list'" :tasks="tasksStore.filteredTasks" />
    <TaskBoard v-else-if="view === 'board'" :tasks="tasksStore.filteredTasks" />
    <TaskCalendar v-else-if="view === 'calendar'" :tasks="tasksStore.filteredTasks" />
    <TaskTimeline v-else :tasks="tasksStore.filteredTasks" />
  </section>
</template>
