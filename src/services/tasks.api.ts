import { api } from './api'
import type { BulkUpdateTasksDto, CreateTaskDto, UpdateTaskDto } from '@/types/dto'
import type { Task } from '@/types/models'

export async function getTasks(params?: { projectId?: string }): Promise<Task[]> {
  const response = await api.get<Task[]>('/tasks', { params })
  return response.data
}

export async function createTask(payload: CreateTaskDto): Promise<Task> {
  const response = await api.post<Task>('/tasks', payload)
  return response.data
}

export async function updateTask(id: string, payload: UpdateTaskDto): Promise<Task> {
  const response = await api.patch<Task>(`/tasks/${id}`, payload)
  return response.data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}

export async function bulkUpdateTasks(payload: BulkUpdateTasksDto): Promise<void> {
  await api.patch('/tasks/bulk', payload)
}
