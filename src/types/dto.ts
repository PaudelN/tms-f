import type { FilterConfig, TaskPriority, TaskStatus } from './models'

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: string | null
  projectId: string
  tags?: string[]
  estimatedHours?: number | null
}

export interface UpdateTaskDto {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: string | null
  tags?: string[]
  estimatedHours?: number | null
  actualHours?: number | null
  position?: number
}

export interface BulkUpdateTasksDto {
  taskIds: string[]
  updates: UpdateTaskDto
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateFilterDto {
  name: string
  projectId?: string
  config: FilterConfig
}
