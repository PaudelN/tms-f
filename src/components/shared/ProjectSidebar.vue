<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()
onMounted(() => {
  void projectsStore.fetchProjects()
})
</script>

<template>
  <aside class="w-72 border-r border-border p-4 space-y-2">
    <h2 class="font-semibold">Projects</h2>
    <button
      v-for="project in projectsStore.projects"
      :key="project.id"
      class="w-full rounded-md px-3 py-2 text-left text-sm"
      :class="projectsStore.activeProjectId === project.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
      @click="projectsStore.setActiveProject(project.id)"
    >
      {{ project.name }}
    </button>
  </aside>
</template>
