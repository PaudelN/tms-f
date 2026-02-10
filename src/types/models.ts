export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type UserRole = 'admin' | 'member' | 'guest'
export type ViewType = 'list' | 'board' | 'calendar' | 'timeline'

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  role: UserRole
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: string | null
  projectId: string
  tags: string[]
  estimatedHours: number | null
  actualHours: number | null
  position: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
  createdById: string
  completedAt: string | null
  assignee?: User
}

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  ownerId: string
  memberIds: string[]
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface FilterCondition {
  field: keyof Task
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'is_empty'
    | 'is_not_empty'
    | 'in'
    | 'not_in'
  value: string | string[] | number | null
}

export interface FilterConfig {
  conditions: FilterCondition[]
  operator: 'AND' | 'OR'
}

export interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
}
