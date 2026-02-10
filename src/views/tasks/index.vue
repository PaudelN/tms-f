<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TaskBoard from '@/components/shared/TaskBoard.vue'
import TaskList from '@/components/shared/TaskList.vue'
import TaskQuickAdd from '@/components/shared/TaskQuickAdd.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useTaskSearch } from '@/composables/useTaskSearch'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/types'

const store = useTasksStore()
const editingTask = ref<Task | null>(null)

const search = useTaskSearch((query) => store.setSearchQuery(query))

const tasks = computed(() => store.filteredTasks)
const tasksByStatus = computed(() => store.tasksByStatus)

onMounted(async () => {
  await store.fetchTasks()
})

function cycleStatus(task: Task): void {
  const map: Record<Task['status'], Task['status']> = {
    todo: 'in-progress',
    'in-progress': 'review',
    review: 'done',
    done: 'todo',
  }

  void store.updateTask(task.id, { status: map[task.status] })
}

function deleteTask(task: Task): void {
  void store.removeTask(task.id)
}

function createQuickTask(payload: { title: string; dueDate?: string; priority?: Task['priority']; tags: string[] }): void {
  void store.createTask({
    title: payload.title,
    dueDate: payload.dueDate,
    priority: payload.priority,
    tags: payload.tags,
  })
}

function openEditor(task: Task): void {
  editingTask.value = task
}

function saveEditor(): void {
  if (!editingTask.value) return
  void store.updateTask(editingTask.value.id, {
    title: editingTask.value.title,
    description: editingTask.value.description,
    priority: editingTask.value.priority,
    status: editingTask.value.status,
  })
  editingTask.value = null
}

function moveTask(taskId: string, status: Task['status']): void {
  void store.moveTask(taskId, status)
}

useKeyboardShortcuts([
  {
    key: 'n',
    ctrl: true,
    action: () => {
      const input = document.getElementById('task-input') as HTMLInputElement | null
      input?.focus()
    },
  },
  {
    key: '/',
    action: () => {
      const input = document.getElementById('task-search') as HTMLInputElement | null
      input?.focus()
    },
  },
])
</script>

<template>
  <main class="space-y-4 p-4 md:p-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 class="text-2xl font-semibold">Advanced Tasks</h1>
      <div class="flex flex-wrap gap-2">
        <button class="rounded-lg border px-3 py-1 text-sm" @click="store.setViewType('list')">List</button>
        <button class="rounded-lg border px-3 py-1 text-sm" @click="store.setViewType('board')">Board</button>
        <button class="rounded-lg border px-3 py-1 text-sm" @click="store.setQuickFilter('due-today')">Due today</button>
        <button class="rounded-lg border px-3 py-1 text-sm" @click="store.setQuickFilter('overdue')">Overdue</button>
        <button class="rounded-lg border px-3 py-1 text-sm" @click="store.setQuickFilter(null)">Clear</button>
      </div>
    </header>

    <input
      id="task-search"
      v-model="search.query"
      type="search"
      class="w-full rounded-xl border px-3 py-2"
      placeholder="Search tasks"
    />

    <TaskQuickAdd @create="createQuickTask" />

    <TaskList
      v-if="store.viewType === 'list'"
      :tasks="tasks"
      @toggle-status="cycleStatus"
      @edit="openEditor"
      @remove="deleteTask"
    />

    <TaskBoard
      v-else
      :tasks-by-status="tasksByStatus"
      @move="moveTask"
      @toggle-status="cycleStatus"
      @edit="openEditor"
      @remove="deleteTask"
    />

    <section v-if="editingTask" class="rounded-xl border bg-white p-4">
      <h2 class="mb-3 text-lg font-semibold">Edit task</h2>
      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-sm">
          Title
          <input v-model="editingTask.title" class="mt-1 w-full rounded-lg border px-2 py-1" />
        </label>
        <label class="text-sm">
          Priority
          <select v-model="editingTask.priority" class="mt-1 w-full rounded-lg border px-2 py-1">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </div>
      <label class="mt-3 block text-sm">
        Description
        <textarea v-model="editingTask.description" class="mt-1 w-full rounded-lg border px-2 py-1" />
      </label>
      <div class="mt-3 flex justify-end gap-2">
        <button class="rounded-lg border px-3 py-1" @click="editingTask = null">Cancel</button>
        <button class="rounded-lg bg-slate-900 px-3 py-1 text-white" @click="saveEditor">Save</button>
      </div>
    </section>
  </main>
</template>
