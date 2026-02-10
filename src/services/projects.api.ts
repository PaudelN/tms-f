import { api } from './api'
import type { CreateProjectDto, UpdateProjectDto } from '@/types/dto'
import type { Project } from '@/types/models'

export async function getProjects(): Promise<Project[]> {
  const response = await api.get<Project[]>('/projects')
  return response.data
}

export async function createProject(payload: CreateProjectDto): Promise<Project> {
  const response = await api.post<Project>('/projects', payload)
  return response.data
}

export async function updateProject(id: string, payload: UpdateProjectDto): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}`, payload)
  return response.data
}
