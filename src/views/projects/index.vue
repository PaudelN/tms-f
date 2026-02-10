<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useProjectsStore } from '@/stores/projects'

const router = useRouter()
const projectsStore = useProjectsStore()

onMounted(async () => {
  await projectsStore.fetchProjects()
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Projects</h2>
      <Button @click="projectsStore.createProject({ name: 'New Project' })">New Project</Button>
    </div>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="project in projectsStore.projects"
        :key="project.id"
        class="cursor-pointer rounded-xl border bg-card p-4"
        @click="router.push(`/projects/${project.id}`)"
      >
        <h3 class="font-semibold">{{ project.name }}</h3>
        <p class="text-sm text-muted-foreground">{{ project.description || 'No description yet.' }}</p>
      </article>
    </div>
  </section>
</template>
