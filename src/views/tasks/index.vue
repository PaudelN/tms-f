<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TaskList from '@/components/shared/TaskList.vue'
import TaskBoard from '@/components/shared/TaskBoard.vue'
import TaskCalendar from '@/components/shared/TaskCalendar.vue'
import TaskTimeline from '@/components/shared/TaskTimeline.vue'
import { useTasksStore } from '@/stores/tasks'

const tasksStore = useTasksStore()
const { filteredTasks, tasksByStatus, loading } = storeToRefs(tasksStore)

onMounted(() => {
  tasksStore.fetchTasks().catch(() => null)
})
</script>

<template>
  <section>
    <h2 class="mb-4 text-xl font-semibold">My Tasks</h2>

    <Tabs default-value="list" class="space-y-4">
      <TabsList>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <TaskList :tasks="filteredTasks" :loading="loading" />
      </TabsContent>

      <TabsContent value="board">
        <TaskBoard :columns="tasksByStatus" @move="(id, status, position) => tasksStore.moveTask(id, status, position)" @delete="(task) => tasksStore.deleteTask(task.id)" />
      </TabsContent>

      <TabsContent value="calendar">
        <TaskCalendar :tasks="filteredTasks" />
      </TabsContent>

      <TabsContent value="timeline">
        <TaskTimeline :tasks="filteredTasks" />
      </TabsContent>
    </Tabs>
  </section>
</template>
