export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type UserRole = 'admin' | 'member' | 'guest'
export type ViewType = 'list' | 'board' | 'calendar' | 'timeline'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  startDate: Date | null
  assigneeId: string | null
  projectId: string
  parentTaskId: string | null
  tags: string[]
  estimatedHours: number | null
  actualHours: number | null
  position: number
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  createdById: string
  completedAt: Date | null
  completedById: string | null
  assignee?: User
  project?: Project
}

export interface ProjectSettings {
  defaultView: ViewType
  allowGuests: boolean
  taskPrefix: string
  statuses: TaskStatus[]
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
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  settings: ProjectSettings
}

export interface NotificationSettings {
  email: boolean
  inApp: boolean
  desktop: boolean
  mentions: boolean
  assignments: boolean
  dueSoon: boolean
  comments: boolean
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  defaultView: ViewType
  defaultProjectId: string | null
  timeZone: string
  notifications: NotificationSettings
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  lastActiveAt: Date
  settings: UserSettings
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in'

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value: unknown
}

export interface FilterConfig {
  conditions: FilterCondition[]
  operator: 'AND' | 'OR'
}

export interface Notification {
  id: string
  userId: string
  type: 'mention' | 'assigned' | 'due_soon' | 'completed' | 'comment' | 'status_changed' | 'project_invite'
  taskId: string | null
  projectId: string | null
  triggeredByUserId: string
  message: string
  isRead: boolean
  createdAt: Date
}
