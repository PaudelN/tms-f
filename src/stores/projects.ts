import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as projectsApi from '@/services/projects.api'
import type { Project } from '@/types/models'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const activeProjectId = ref<string | null>(null)

  const activeProject = computed(() => projects.value.find((project) => project.id === activeProjectId.value) ?? null)

  async function fetchProjects() {
    try {
      projects.value = await projectsApi.getProjects()
    } catch {
      projects.value = [
        {
          id: 'p1', name: 'Enterprise Task Platform', description: 'Core workspace', color: '#3b82f6', icon: 'folder',
          ownerId: 'u1', memberIds: ['u1'], isArchived: false, createdAt: new Date(), updatedAt: new Date(),
          settings: { defaultView: 'list', allowGuests: false, taskPrefix: 'ETP' },
        },
      ]
    }
    if (!activeProjectId.value && projects.value.length > 0) activeProjectId.value = projects.value[0].id
  }

  function setActiveProject(id: string) { activeProjectId.value = id }

  return { projects, activeProjectId, activeProject, fetchProjects, setActiveProject }
})
