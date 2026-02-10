import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as projectsApi from '@/services/projects.api'
import type { CreateProjectDto, UpdateProjectDto } from '@/types/dto'
import type { Project } from '@/types/models'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const activeProjectId = ref<string | null>(null)

  const activeProject = computed(() => projects.value.find((project) => project.id === activeProjectId.value) ?? null)

  async function fetchProjects() {
    loading.value = true
    try {
      projects.value = await projectsApi.getProjects()
      if (!activeProjectId.value && projects.value.length) activeProjectId.value = projects.value[0].id
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload: CreateProjectDto) {
    const project = await projectsApi.createProject(payload)
    projects.value.unshift(project)
    return project
  }

  async function updateProject(id: string, payload: UpdateProjectDto) {
    const updated = await projectsApi.updateProject(id, payload)
    const index = projects.value.findIndex((project) => project.id === id)
    if (index >= 0) projects.value[index] = updated
    return updated
  }

  return { projects, loading, activeProjectId, activeProject, fetchProjects, createProject, updateProject }
})
