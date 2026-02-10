<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import TaskList from '@/components/shared/TaskList.vue'
import TaskBoard from '@/components/shared/TaskBoard.vue'
import TaskCalendar from '@/components/shared/TaskCalendar.vue'
import TaskTimeline from '@/components/shared/TaskTimeline.vue'
import TaskQuickAdd from '@/components/shared/TaskQuickAdd.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTasksStore } from '@/stores/tasks'

const route = useRoute()
const store = useTasksStore()
const selectedTaskId = ref<string | null>(null)

onMounted(async () => {
  await store.fetchTasks(String(route.params.id))
})

const selectedTask = computed(() => store.filteredTasks.find((task) => task.id === selectedTaskId.value) ?? null)
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Project {{ route.params.id }}</h2>
    <TaskQuickAdd @create="(parsed) => store.createTask({ title: parsed.title, dueDate: parsed.dueDate?.toISOString(), tags: parsed.tags, priority: parsed.priority, projectId: String(route.params.id) })" />

    <Tabs default-value="list">
      <TabsList>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>
      <TabsContent value="list"><TaskList :tasks="store.filteredTasks" @task-click="(task) => selectedTaskId = task.id" @task-edit="(task) => selectedTaskId = task.id" @task-delete="(task) => store.deleteTask(task.id)" @task-status-change="(task, status) => store.updateTaskStatus(task.id, status)"/></TabsContent>
      <TabsContent value="board"><TaskBoard :columns="store.tasksByStatus" @move="(taskId, status) => store.updateTaskStatus(taskId, status)" @edit="(task) => selectedTaskId = task.id" /></TabsContent>
      <TabsContent value="calendar"><TaskCalendar :tasks="store.filteredTasks" /></TabsContent>
      <TabsContent value="timeline"><TaskTimeline :tasks="store.filteredTasks" /></TabsContent>
    </Tabs>

    <p v-if="selectedTask" class="text-sm text-muted-foreground">Selected: {{ selectedTask.title }}</p>
  </section>
</template>
