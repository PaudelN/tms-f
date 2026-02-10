<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import ProjectSidebar from '@/components/shared/ProjectSidebar.vue'
import TaskBoard from '@/components/shared/TaskBoard.vue'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'

const route = useRoute()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const { activeProject } = storeToRefs(projectsStore)
const { tasksByStatus } = storeToRefs(tasksStore)

onMounted(async () => {
  await projectsStore.fetchProjects().catch(() => null)
  projectsStore.activeProjectId = String(route.params.id)
  await tasksStore.fetchTasks(String(route.params.id)).catch(() => null)
})

const title = computed(() => activeProject.value?.name ?? 'Project')
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-[280px_1fr]">
    <ProjectSidebar />
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <TaskBoard :columns="tasksByStatus" @move="(id, status, position) => tasksStore.moveTask(id, status, position)" @delete="(task) => tasksStore.deleteTask(task.id)" />
    </div>
  </section>
</template>
