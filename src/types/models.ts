export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type UserRole = 'admin' | 'member' | 'guest'
export type ViewType = 'list' | 'board' | 'calendar' | 'timeline'

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  defaultView: ViewType
  defaultProjectId: string | null
  timeZone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  weekStartsOn: 0 | 1
  notifications: NotificationSettings
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

export interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'checkbox'
  options?: string[]
  isRequired: boolean
}

export interface ProjectSettings {
  defaultView: ViewType
  allowGuests: boolean
  taskPrefix: string
  statuses: TaskStatus[]
  customFields: CustomField[]
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

export interface Reaction {
  emoji: string
  userIds: string[]
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[]
  attachments: string[]
  createdAt: Date
  updatedAt: Date
  isEdited: boolean
  reactions: Reaction[]
}

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  startTime: Date
  endTime: Date | null
  duration: number
  description: string | null
  isBillable: boolean
  createdAt: Date
}

export interface Attachment {
  id: string
  taskId: string
  userId: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  uploadedAt: Date
}

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
  comments?: Comment[]
  timeEntries?: TimeEntry[]
  attachments?: Attachment[]
}

export interface FilterCondition {
  field: keyof Task
  operator: FilterOperator
  value: string | number | boolean | null | string[]
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

export interface FilterConfig {
  conditions: FilterCondition[]
  operator: 'AND' | 'OR'
  name?: string
  isDefault?: boolean
}

export interface SavedFilter {
  id: string
  name: string
  userId: string
  projectId: string | null
  config: FilterConfig
  isDefault: boolean
  createdAt: Date
}

export type NotificationType =
  | 'mention'
  | 'assigned'
  | 'due_soon'
  | 'completed'
  | 'comment'
  | 'status_changed'
  | 'project_invite'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  taskId: string | null
  projectId: string | null
  triggeredByUserId: string
  message: string
  isRead: boolean
  createdAt: Date
}
