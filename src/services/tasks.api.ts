import type { BulkUpdateTasksDto, CreateTaskDto, UpdateTaskDto } from '@/types'
import type { Task, TaskStatus } from '@/types'

const STORAGE_KEY = 'advanced-tasks'

const seedTask: Task = {
  id: crypto.randomUUID(),
  title: 'Ship enterprise task module',
  description: 'Implement list, board, parsing, and store patterns',
  status: 'in-progress',
  priority: 'high',
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  assigneeId: null,
  projectId: 'default-project',
  tags: ['engineering', 'mvp'],
  estimatedHours: 8,
  actualHours: 3,
  position: 1,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdById: 'system',
  completedAt: null,
}

function read(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    write([seedTask])
    return [seedTask]
  }
  return JSON.parse(raw) as Task[]
}

function write(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export async function getTasks(projectId?: string): Promise<Task[]> {
  const tasks = read()
  return projectId ? tasks.filter((task) => task.projectId === projectId) : tasks
}

export async function createTask(dto: CreateTaskDto): Promise<Task> {
  const tasks = read()
  const task: Task = {
    id: crypto.randomUUID(),
    title: dto.title,
    description: dto.description ?? null,
    status: dto.status ?? 'todo',
    priority: dto.priority ?? 'medium',
    dueDate: dto.dueDate ?? null,
    assigneeId: dto.assigneeId ?? null,
    projectId: dto.projectId,
    tags: dto.tags ?? [],
    estimatedHours: dto.estimatedHours ?? null,
    actualHours: null,
    position: tasks.length + 1,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdById: 'me',
    completedAt: null,
  }
  const next = [task, ...tasks]
  write(next)
  return task
}

export async function updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
  const tasks = read()
  const index = tasks.findIndex((task) => task.id === id)
  if (index < 0) {
    throw new Error('Task not found')
  }
  const updated: Task = {
    ...tasks[index],
    ...dto,
    updatedAt: new Date().toISOString(),
    completedAt: dto.status === 'done' ? new Date().toISOString() : tasks[index].completedAt,
  }
  tasks[index] = updated
  write(tasks)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = read().filter((task) => task.id !== id)
  write(tasks)
}

export async function bulkUpdateTasks(payload: BulkUpdateTasksDto): Promise<void> {
  const tasks = read().map((task) =>
    payload.taskIds.includes(task.id)
      ? { ...task, ...payload.updates, updatedAt: new Date().toISOString() }
      : task,
  )
  write(tasks)
}

export async function moveTask(taskId: string, status: TaskStatus): Promise<Task> {
  return updateTask(taskId, { status })
}
