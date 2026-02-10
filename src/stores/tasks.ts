import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { FilterConfig, Task, TaskPriority, TaskStatus, UpdateTaskDto } from '@/types'
import * as tasksApi from '@/services/tasks.api'
import { isDueToday, isOverdue } from '@/utils/date'
import { toast } from '@/utils/toast'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const quickFilter = ref<'my-tasks' | 'due-today' | 'overdue' | 'high-priority' | null>(null)
  const advancedFilters = ref<FilterConfig | null>(null)
  const currentProjectId = ref<string>('default-project')
  const viewType = ref<'list' | 'board' | 'calendar' | 'timeline'>('list')

  const filteredTasks = computed(() => {
    let data = tasks.value.filter((task) => !task.isArchived)

    data = data.filter((task) => task.projectId === currentProjectId.value)

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      data = data.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description?.toLowerCase().includes(query) ?? false) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (quickFilter.value === 'due-today') {
      data = data.filter((task) => isDueToday(task.dueDate))
    } else if (quickFilter.value === 'overdue') {
      data = data.filter((task) => isOverdue(task.dueDate) && task.status !== 'done')
    } else if (quickFilter.value === 'high-priority') {
      data = data.filter((task) => task.priority === 'high' || task.priority === 'urgent')
    }

    if (advancedFilters.value) {
      data = applyAdvancedFilters(data, advancedFilters.value)
    }

    return data
  })

  const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
    todo: filteredTasks.value.filter((task) => task.status === 'todo'),
    'in-progress': filteredTasks.value.filter((task) => task.status === 'in-progress'),
    review: filteredTasks.value.filter((task) => task.status === 'review'),
    done: filteredTasks.value.filter((task) => task.status === 'done'),
  }))

  async function fetchTasks(): Promise<void> {
    loading.value = true
    try {
      tasks.value = await tasksApi.getTasks(currentProjectId.value)
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: {
    title: string
    description?: string
    priority?: TaskPriority
    dueDate?: string | null
    tags?: string[]
  }): Promise<void> {
    await tasksApi.createTask({
      ...payload,
      projectId: currentProjectId.value,
    })
    await fetchTasks()
    toast.success('Task created')
  }

  async function updateTask(id: string, dto: UpdateTaskDto): Promise<void> {
    const index = tasks.value.findIndex((task) => task.id === id)
    const original = index >= 0 ? { ...tasks.value[index] } : null

    if (index >= 0) {
      tasks.value[index] = { ...tasks.value[index], ...dto, updatedAt: new Date().toISOString() }
    }

    try {
      await tasksApi.updateTask(id, dto)
    } catch (error) {
      if (index >= 0 && original) {
        tasks.value[index] = original
      }
      throw error
    }
  }

  async function removeTask(id: string): Promise<void> {
    await tasksApi.deleteTask(id)
    tasks.value = tasks.value.filter((task) => task.id !== id)
    toast.success('Task deleted')
  }

  async function moveTask(taskId: string, status: TaskStatus): Promise<void> {
    await tasksApi.moveTask(taskId, status)
    await fetchTasks()
  }

  function setSearchQuery(value: string): void {
    searchQuery.value = value
  }

  function setQuickFilter(value: typeof quickFilter.value): void {
    quickFilter.value = value
  }

  function setAdvancedFilters(value: FilterConfig | null): void {
    advancedFilters.value = value
  }

  function setViewType(value: typeof viewType.value): void {
    viewType.value = value
  }

  return {
    tasks,
    loading,
    searchQuery,
    quickFilter,
    viewType,
    filteredTasks,
    tasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
    removeTask,
    moveTask,
    setSearchQuery,
    setQuickFilter,
    setAdvancedFilters,
    setViewType,
  }
})

function applyAdvancedFilters(tasks: Task[], config: FilterConfig): Task[] {
  return tasks.filter((task) => {
    const comparisons = config.conditions.map((condition) => {
      const value = task[condition.field]
      switch (condition.operator) {
        case 'equals':
          return value === condition.value
        case 'not_equals':
          return value !== condition.value
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase())
        case 'greater_than':
          return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value
        case 'less_than':
          return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value
        case 'is_empty':
          return value === null || value === ''
        case 'is_not_empty':
          return value !== null && value !== ''
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(String(value))
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(String(value))
        default:
          return true
      }
    })

    return config.operator === 'AND' ? comparisons.every(Boolean) : comparisons.some(Boolean)
  })
}
