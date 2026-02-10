import type { TaskPriority, TaskStatus } from './models'

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  assigneeId?: string
  projectId: string
  tags?: string[]
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: string | null
  tags?: string[]
  position?: number
}

export interface CreateProjectDto {
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  color?: string
  icon?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
