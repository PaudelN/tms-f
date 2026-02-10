import axios from '@/lib/axios'

export interface ProjectDto {
  id: number
  name: string
  owner: string
}

export async function listProjects() {
  const { data } = await axios.get<ProjectDto[]>('/projects')
  return data
}
