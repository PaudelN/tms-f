<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()
onMounted(() => { void projectsStore.fetchProjects() })
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold">Projects</h1>
    <div class="grid gap-3 md:grid-cols-2">
      <RouterLink
        v-for="project in projectsStore.projects"
        :key="project.id"
        :to="`/projects/${project.id}`"
        class="rounded-xl border border-border p-4 hover:shadow-md transition"
      >
        <h2 class="font-semibold">{{ project.name }}</h2>
        <p class="text-sm text-muted-foreground mt-1">{{ project.description }}</p>
      </RouterLink>
    </div>
  </section>
</template>
