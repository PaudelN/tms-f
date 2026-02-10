<script setup lang="ts">
import TaskCard from './TaskCard.vue'
import { useTaskDragDrop } from '@/composables/useTaskDragDrop'
import type { Task, TaskStatus } from '@/types'

const props = defineProps<{
  tasksByStatus: Record<TaskStatus, Task[]>
}>()

const emit = defineEmits<{
  move: [taskId: string, status: TaskStatus]
  toggleStatus: [task: Task]
  edit: [task: Task]
  remove: [task: Task]
}>()

const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done']
const dragDrop = useTaskDragDrop((taskId, status) => emit('move', taskId, status))
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="status in statuses"
      :key="status"
      class="rounded-xl bg-slate-50 p-3"
      @dragover.prevent
      @drop.prevent="dragDrop.onDrop(status)"
    >
      <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {{ status }} ({{ props.tasksByStatus[status].length }})
      </h2>

      <div class="space-y-2">
        <div
          v-for="task in props.tasksByStatus[status]"
          :key="task.id"
          draggable="true"
          @dragstart="dragDrop.onDragStart(task.id)"
          @dragend="dragDrop.onDragEnd"
        >
          <TaskCard
            :task="task"
            variant="board"
            @toggle-status="emit('toggleStatus', task)"
            @edit="emit('edit', task)"
            @remove="emit('remove', task)"
          />
        </div>
      </div>
    </article>
  </section>
</template>
