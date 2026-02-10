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

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  ownerId: string
  memberIds: string[]
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  settings: {
    defaultView: ViewType
    allowGuests: boolean
    taskPrefix: string
  }
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  assigneeId: string | null
  projectId: string
  tags: string[]
  position: number
  createdAt: Date
  updatedAt: Date
  createdById: string
  completedAt: Date | null
  assignee?: User
  project?: Project
}

export interface FilterCondition {
  field: keyof Task
  operator: 'equals' | 'contains' | 'in'
  value: string | string[]
}

export interface FilterConfig {
  conditions: FilterCondition[]
  operator: 'AND' | 'OR'
}
