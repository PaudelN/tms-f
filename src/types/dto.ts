import type {
  ProjectSettings,
  TaskPriority,
  TaskStatus,
} from '@/types/models'

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  assigneeId?: string
  projectId: string
  parentTaskId?: string
  tags?: string[]
  estimatedHours?: number
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: string | null
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
  position?: number
}

export interface BulkUpdateTasksDto {
  taskIds: string[]
  updates: UpdateTaskDto
}

export interface CreateProjectDto {
  name: string
  description?: string
  color?: string
  icon?: string
  settings?: Partial<ProjectSettings>
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  color?: string
  icon?: string
  settings?: Partial<ProjectSettings>
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

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface TaskQueryDto extends PaginationParams {
  projectId?: string
  search?: string
  status?: TaskStatus
}
