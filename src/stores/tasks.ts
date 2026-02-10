import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as tasksApi from '@/services/tasks.api'
import { toast } from '@/utils/toast'
import type { CreateTaskDto, UpdateTaskDto } from '@/types/dto'
import type { FilterConfig, Task, TaskPriority, TaskStatus, ViewType } from '@/types/models'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentProjectId = ref<string | null>(null)
  const viewType = ref<ViewType>('list')
  const groupBy = ref<'status' | 'priority' | 'assignee' | 'project' | 'none'>('status')
  const searchQuery = ref('')
  const quickFilter = ref<'my-tasks' | 'due-today' | 'overdue' | 'high-priority' | null>(null)
  const activeFilters = ref<FilterConfig | null>(null)
  const currentUserId = ref<string>('u1')

  const filteredTasks = computed(() => {
    let list = [...tasks.value]
    if (currentProjectId.value) list = list.filter((task) => task.projectId === currentProjectId.value)
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      list = list.filter((task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }
    if (quickFilter.value === 'my-tasks') list = list.filter((task) => task.assigneeId === currentUserId.value)
    if (quickFilter.value === 'due-today') {
      const start = new Date(); start.setHours(0,0,0,0)
      const end = new Date(start); end.setDate(end.getDate() + 1)
      list = list.filter((task) => task.dueDate !== null && task.dueDate >= start && task.dueDate < end)
    }
    if (quickFilter.value === 'overdue') {
      const now = new Date()
      list = list.filter((task) => task.dueDate !== null && task.dueDate < now && task.status !== 'done')
    }
    if (quickFilter.value === 'high-priority') list = list.filter((task) => ['high', 'urgent'].includes(task.priority))
    if (activeFilters.value) list = applyAdvancedFilters(list, activeFilters.value)
    return list
  })

  const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
    todo: filteredTasks.value.filter((task) => task.status === 'todo'),
    'in-progress': filteredTasks.value.filter((task) => task.status === 'in-progress'),
    review: filteredTasks.value.filter((task) => task.status === 'review'),
    done: filteredTasks.value.filter((task) => task.status === 'done'),
  }))

  async function fetchTasks(projectId?: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      tasks.value = await tasksApi.getTasks(projectId ? { projectId } : undefined)
      if (projectId) currentProjectId.value = projectId
    } catch (err) {
      error.value = 'Failed to fetch tasks'
      toast.error('Failed to fetch tasks')
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: CreateTaskDto): Promise<void> {
    const created = await tasksApi.createTask(payload)
    tasks.value.unshift(created)
    toast.success('Task created')
  }

  async function updateTask(id: string, payload: UpdateTaskDto): Promise<void> {
    const existingIndex = tasks.value.findIndex((task) => task.id === id)
    const updated = await tasksApi.updateTask(id, payload)
    if (existingIndex >= 0) tasks.value[existingIndex] = updated
    toast.success('Task updated')
  }

  async function deleteTask(id: string): Promise<void> {
    await tasksApi.deleteTask(id)
    tasks.value = tasks.value.filter((task) => task.id !== id)
    toast.success('Task deleted')
  }

  const setQuickFilter = (value: typeof quickFilter.value) => { quickFilter.value = value }
  const setSearchQuery = (value: string) => { searchQuery.value = value }
  const setViewType = (value: ViewType) => { viewType.value = value }
  const setGroupBy = (value: typeof groupBy.value) => { groupBy.value = value }
  const setAdvancedFilters = (value: FilterConfig | null) => { activeFilters.value = value }
  const updateTaskStatus = (id: string, status: TaskStatus) => updateTask(id, { status })
  const updateTaskPriority = (id: string, priority: TaskPriority) => updateTask(id, { priority })

  return {
    tasks,
    loading,
    error,
    viewType,
    groupBy,
    searchQuery,
    quickFilter,
    filteredTasks,
    tasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    setQuickFilter,
    setSearchQuery,
    setViewType,
    setGroupBy,
    setAdvancedFilters,
  }
})

function applyAdvancedFilters(tasks: Task[], config: FilterConfig): Task[] {
  return tasks.filter((task) => {
    const conditions = config.conditions.map((condition) => {
      const value = task[condition.field]
      if (condition.operator === 'equals') return value === condition.value
      if (condition.operator === 'not_equals') return value !== condition.value
      if (condition.operator === 'contains') return String(value ?? '').toLowerCase().includes(String(condition.value).toLowerCase())
      if (condition.operator === 'is_empty') return value === null || value === undefined || value === ''
      if (condition.operator === 'is_not_empty') return value !== null && value !== undefined && value !== ''
      return true
    })
    return config.operator === 'AND' ? conditions.every(Boolean) : conditions.some(Boolean)
  })
}
