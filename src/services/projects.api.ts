import api from './api'
import type { CreateProjectDto, UpdateProjectDto } from '@/types/dto'
import type { Project } from '@/types/models'

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/projects')
  return data
}

export async function createProject(payload: CreateProjectDto): Promise<Project> {
  const { data } = await api.post<Project>('/projects', payload)
  return data
}

export async function updateProject(id: string, payload: UpdateProjectDto): Promise<Project> {
  const { data } = await api.patch<Project>(`/projects/${id}`, payload)
  return data
}
