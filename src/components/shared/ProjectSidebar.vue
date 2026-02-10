<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()
const { projects, activeProjectId } = storeToRefs(projectsStore)
</script>

<template>
  <aside class="w-full rounded-xl border bg-card p-3">
    <h3 class="mb-3 text-sm font-semibold">Projects</h3>
    <button
      v-for="project in projects"
      :key="project.id"
      class="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted"
      :class="{ 'bg-muted font-semibold': project.id === activeProjectId }"
      @click="activeProjectId = project.id"
    >
      <span class="truncate">{{ project.name }}</span>
      <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: project.color }" />
    </button>
  </aside>
</template>
