<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import { Button } from '@/components/ui/button'

const projectsStore = useProjectsStore()
const { projects, loading } = storeToRefs(projectsStore)

onMounted(() => {
  projectsStore.fetchProjects().catch(() => null)
})

const createProject = () => {
  projectsStore.createProject({ name: 'New Project', color: '#2563eb', icon: 'folder' }).catch(() => null)
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Projects</h2>
      <Button @click="createProject">New Project</Button>
    </div>
    <div v-if="loading" class="text-sm text-muted-foreground">Loading projects...</div>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="project in projects" :key="project.id" class="rounded-xl border p-4">
        <h3 class="font-semibold">{{ project.name }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ project.description || 'No description yet.' }}</p>
      </article>
    </div>
  </section>
</template>
