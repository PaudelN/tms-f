import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'
import * as tasksApi from '@/services/tasks.api'
import type { CreateTaskDto, UpdateTaskDto } from '@/types/dto'
import type { FilterConfig, Task, TaskPriority, TaskStatus, ViewType } from '@/types/models'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentProjectId = ref<string | null>(null)
  const viewType = ref<ViewType>('list')
  const groupBy = ref<'status' | 'priority' | 'assignee' | 'project' | 'none'>('status')
  const showCompleted = ref(true)
  const searchQuery = ref('')
  const activeFilters = ref<FilterConfig | null>(null)
  const quickFilter = ref<string | null>(null)

  const filteredTasks = computed(() => {
    let result = [...tasks.value]

    if (currentProjectId.value) result = result.filter((t) => t.projectId === currentProjectId.value)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q))
    }
    if (!showCompleted.value) result = result.filter((t) => t.status !== 'done')
    if (quickFilter.value) result = applyQuickFilter(result, quickFilter.value)
    if (activeFilters.value) result = applyAdvancedFilters(result, activeFilters.value)

    return result.sort((a, b) => a.position - b.position)
  })

  const tasksByStatus = computed(() => ({
    todo: filteredTasks.value.filter((task) => task.status === 'todo'),
    'in-progress': filteredTasks.value.filter((task) => task.status === 'in-progress'),
    review: filteredTasks.value.filter((task) => task.status === 'review'),
    done: filteredTasks.value.filter((task) => task.status === 'done')
  }))

  async function fetchTasks(projectId?: string) {
    loading.value = true
    error.value = null
    try {
      tasks.value = await tasksApi.getTasks({ projectId })
      currentProjectId.value = projectId ?? null
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to fetch tasks'
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: CreateTaskDto) {
    const created = await tasksApi.createTask(payload)
    tasks.value.unshift(created)
    return created
  }

  async function updateTask(id: string, payload: UpdateTaskDto) {
    const index = tasks.value.findIndex((task) => task.id === id)
    const original = index >= 0 ? tasks.value[index] : null
    if (index >= 0) {
      const nextTask = { ...tasks.value[index], ...payload, updatedAt: new Date() }
      if (typeof payload.dueDate === 'string') nextTask.dueDate = new Date(payload.dueDate)
      tasks.value[index] = nextTask as Task
    }

    try {
      const updated = await tasksApi.updateTask(id, payload)
      if (index >= 0) tasks.value[index] = updated
      return updated
    } catch (err) {
      if (index >= 0 && original) tasks.value[index] = original
      throw err
    }
  }

  async function deleteTask(id: string) {
    await tasksApi.deleteTask(id)
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    return updateTask(id, { status })
  }

  async function updateTaskPriority(id: string, priority: TaskPriority) {
    return updateTask(id, { priority })
  }

  async function moveTask(id: string, status: TaskStatus, position: number) {
    return updateTask(id, { status, position })
  }

  function applyQuickFilter(input: Task[], filter: string) {
    const auth = useAuthStore()
    const userId = auth.user ? String(auth.user.id) : null

    if (filter === 'my-tasks') return input.filter((task) => task.assigneeId === userId)
    if (filter === 'due-today') {
      const now = new Date()
      const y = now.getFullYear()
      const m = now.getMonth()
      const d = now.getDate()
      return input.filter((task) => task.dueDate && new Date(task.dueDate).toDateString() === new Date(y, m, d).toDateString())
    }
    if (filter === 'overdue') return input.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done')
    if (filter === 'high-priority') return input.filter((task) => task.priority === 'high' || task.priority === 'urgent')

    return input
  }

  function applyAdvancedFilters(input: Task[], config: FilterConfig) {
    return input.filter((task) => {
      const checks = config.conditions.map((condition) => {
        const value = task[condition.field as keyof Task] as unknown
        switch (condition.operator) {
          case 'equals':
            return value === condition.value
          case 'contains':
            return String(value ?? '').toLowerCase().includes(String(condition.value ?? '').toLowerCase())
          case 'is_empty':
            return value === null || value === undefined || value === ''
          case 'is_not_empty':
            return value !== null && value !== undefined && value !== ''
          default:
            return true
        }
      })
      return config.operator === 'AND' ? checks.every(Boolean) : checks.some(Boolean)
    })
  }

  return {
    tasks,
    loading,
    error,
    currentProjectId,
    viewType,
    groupBy,
    showCompleted,
    searchQuery,
    activeFilters,
    quickFilter,
    filteredTasks,
    tasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    moveTask
  }
})
