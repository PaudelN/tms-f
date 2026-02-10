import api from './api'
import type { CreateTaskDto, UpdateTaskDto } from '@/types/dto'
import type { Task } from '@/types/models'

export async function getTasks(projectId?: string): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks', { params: { projectId } })
  return data
}

export async function createTask(payload: CreateTaskDto): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', payload)
  return data
}

export async function updateTask(id: string, payload: UpdateTaskDto): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}`, payload)
  return data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}
