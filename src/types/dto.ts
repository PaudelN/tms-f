import type { FilterConfig, ProjectSettings, TaskPriority, TaskStatus } from './models'

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

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export interface CreateCommentDto {
  taskId: string
  content: string
  mentions?: string[]
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

export interface CreateFilterDto {
  name: string
  projectId?: string
  config: FilterConfig
  isDefault?: boolean
}
