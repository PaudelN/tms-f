<script setup lang="ts">
import TaskCard from '@/components/shared/TaskCard.vue'
import { useTaskDragDrop } from '@/composables/useTaskDragDrop'
import type { Task, TaskStatus } from '@/types/models'

interface Props { columns: Record<TaskStatus, Task[]> }
const props = defineProps<Props>()
const emit = defineEmits<{ move:[string, TaskStatus, number]; edit:[Task] }>()
const { startDrag, endDrag, dropOnColumn } = useTaskDragDrop((taskId, status, position) => emit('move', taskId, status, position))
const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done']
</script>

<template>
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <section
      v-for="status in statuses"
      :key="status"
      class="rounded-xl border bg-muted/30 p-3"
      @dragover.prevent
      @drop="dropOnColumn(status, props.columns[status]?.length ?? 0)"
    >
      <h3 class="mb-3 text-sm font-semibold capitalize">{{ status.replace('-', ' ') }} ({{ props.columns[status]?.length ?? 0 }})</h3>
      <div class="space-y-2 min-h-40">
        <div v-for="task in props.columns[status]" :key="task.id" draggable="true" @dragstart="startDrag(task.id)" @dragend="endDrag">
          <TaskCard :task="task" variant="board" @edit="emit('edit', task)" />
        </div>
      </div>
    </section>
  </div>
</template>
