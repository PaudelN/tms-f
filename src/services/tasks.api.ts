import api from '@/services/api'
import type { BulkUpdateTasksDto, CreateTaskDto, TaskQueryDto, UpdateTaskDto } from '@/types/dto'
import type { Task } from '@/types/models'

export async function getTasks(params?: TaskQueryDto): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks', { params })
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

export async function bulkUpdateTasks(payload: BulkUpdateTasksDto): Promise<void> {
  await api.patch('/tasks/bulk', payload)
}
