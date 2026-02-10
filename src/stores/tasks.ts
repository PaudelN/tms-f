import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { FilterConfig, Task, TaskPriority, TaskStatus, ViewType } from '@/types/models'
import type { CreateTaskDto, UpdateTaskDto } from '@/types/dto'
import * as tasksApi from '@/services/tasks.api'

const mockTasks = (): Task[] => [
  {
    id: 'T-100',
    title: 'Build task list view',
    description: 'Implement grouped task list with filters',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(),
    assigneeId: 'u1',
    projectId: 'p1',
    tags: ['frontend'],
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'u1',
    completedAt: null,
  },
]

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(mockTasks())
  const loading = ref(false)
  const searchQuery = ref('')
  const viewType = ref<ViewType>('list')
  const groupBy = ref<'status' | 'priority' | 'assignee' | 'project' | 'none'>('status')
  const showCompleted = ref(true)
  const quickFilter = ref<string | null>(null)
  const activeFilters = ref<FilterConfig | null>(null)

  const filteredTasks = computed(() => {
    let list = tasks.value.filter((task) => task.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    if (!showCompleted.value) list = list.filter((task) => task.status !== 'done')
    if (quickFilter.value === 'overdue') {
      list = list.filter((task) => task.dueDate && task.status !== 'done' && task.dueDate < new Date())
    }
    if (activeFilters.value) {
      list = list.filter((task) => activeFilters.value?.conditions.every((condition) => {
        const value = String(task[condition.field] ?? '')
        if (condition.operator === 'contains') return value.toLowerCase().includes(String(condition.value).toLowerCase())
        if (condition.operator === 'equals') return value === String(condition.value)
        if (condition.operator === 'in' && Array.isArray(condition.value)) return condition.value.includes(value)
        return true
      }))
    }
    return list
  })

  const tasksByStatus = computed(() => ({
    todo: filteredTasks.value.filter((task) => task.status === 'todo'),
    'in-progress': filteredTasks.value.filter((task) => task.status === 'in-progress'),
    review: filteredTasks.value.filter((task) => task.status === 'review'),
    done: filteredTasks.value.filter((task) => task.status === 'done'),
  }))

  async function fetchTasks(projectId?: string) {
    loading.value = true
    try {
      tasks.value = await tasksApi.getTasks(projectId)
    } catch {
      tasks.value = mockTasks()
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: CreateTaskDto) {
    const optimistic: Task = {
      id: crypto.randomUUID(),
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? 'todo',
      priority: payload.priority ?? 'medium',
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      assigneeId: payload.assigneeId ?? null,
      projectId: payload.projectId,
      tags: payload.tags ?? [],
      position: tasks.value.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 'u1',
      completedAt: null,
    }
    tasks.value.unshift(optimistic)
    try {
      const created = await tasksApi.createTask(payload)
      const index = tasks.value.findIndex((task) => task.id === optimistic.id)
      if (index >= 0) tasks.value[index] = created
      return created
    } catch {
      return optimistic
    }
  }

  async function updateTask(id: string, payload: UpdateTaskDto) {
    const index = tasks.value.findIndex((task) => task.id === id)
    if (index < 0) return
    const backup = { ...tasks.value[index] }
    tasks.value[index] = { ...tasks.value[index], ...payload, dueDate: payload.dueDate === undefined ? tasks.value[index].dueDate : (payload.dueDate ? new Date(payload.dueDate) : null), updatedAt: new Date() }
    try {
      tasks.value[index] = await tasksApi.updateTask(id, payload)
    } catch {
      tasks.value[index] = backup
    }
  }

  async function deleteTask(id: string) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
    try {
      await tasksApi.deleteTask(id)
    } catch {
      // no-op for offline fallback
    }
  }

  function setSearchQuery(query: string) { searchQuery.value = query }
  function setQuickFilter(filter: string | null) { quickFilter.value = filter }
  function setViewType(view: ViewType) { viewType.value = view }
  function setGroupBy(group: 'status' | 'priority' | 'assignee' | 'project' | 'none') { groupBy.value = group }
  function updateTaskStatus(id: string, status: TaskStatus) { return updateTask(id, { status }) }
  function updateTaskPriority(id: string, priority: TaskPriority) { return updateTask(id, { priority }) }

  return {
    tasks,
    loading,
    filteredTasks,
    tasksByStatus,
    searchQuery,
    viewType,
    groupBy,
    showCompleted,
    quickFilter,
    activeFilters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setSearchQuery,
    setQuickFilter,
    setViewType,
    setGroupBy,
    updateTaskStatus,
    updateTaskPriority,
  }
})
