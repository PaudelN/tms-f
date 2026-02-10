import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as projectsApi from '@/services/projects.api'
import type { CreateProjectDto, UpdateProjectDto } from '@/types/dto'
import type { Project } from '@/types/models'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const selectedProjectId = ref<string | null>(null)

  const selectedProject = computed(() => projects.value.find((project) => project.id === selectedProjectId.value) ?? null)

  async function fetchProjects(): Promise<void> {
    loading.value = true
    try {
      projects.value = await projectsApi.getProjects()
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload: CreateProjectDto): Promise<void> {
    const project = await projectsApi.createProject(payload)
    projects.value.unshift(project)
  }

  async function updateProject(id: string, payload: UpdateProjectDto): Promise<void> {
    const updated = await projectsApi.updateProject(id, payload)
    const index = projects.value.findIndex((project) => project.id === id)
    if (index >= 0) projects.value[index] = updated
  }

  return { projects, loading, selectedProjectId, selectedProject, fetchProjects, createProject, updateProject }
})
