<script setup lang="ts">
import { useTaskDragDrop } from '@/composables/useTaskDragDrop'
import TaskCard from './TaskCard.vue'
import type { Task, TaskStatus } from '@/types/models'

const props = defineProps<{ columns: Record<TaskStatus, Task[]> }>()
const emit = defineEmits<{ (e: 'move', taskId: string, status: TaskStatus, position: number): void; (e: 'delete', task: Task): void }>()

const { onDragStart, onDrop, onDragEnd } = useTaskDragDrop((taskId, status, position) => emit('move', taskId, status, position))
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <div v-for="(tasks, status) in columns" :key="status" class="rounded-xl border bg-muted/40 p-3" @dragover.prevent @drop="onDrop(status as TaskStatus, tasks.length)">
      <h3 class="mb-3 text-sm font-semibold capitalize">{{ status }} ({{ tasks.length }})</h3>
      <div class="space-y-2">
        <div v-for="(task, index) in tasks" :key="task.id" draggable="true" @dragstart="onDragStart(task.id)" @dragend="onDragEnd" @drop.stop.prevent="onDrop(status as TaskStatus, index)">
          <TaskCard :task="task" variant="board" @delete="emit('delete', task)" />
        </div>
      </div>
    </div>
  </div>
</template>
