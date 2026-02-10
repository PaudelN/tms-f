import { ref } from 'vue'
import type { TaskStatus } from '@/types'

export function useTaskDragDrop(onMove: (taskId: string, status: TaskStatus) => void) {
  const draggingTaskId = ref<string | null>(null)

  function onDragStart(taskId: string): void {
    draggingTaskId.value = taskId
  }

  function onDrop(status: TaskStatus): void {
    if (!draggingTaskId.value) return
    onMove(draggingTaskId.value, status)
    draggingTaskId.value = null
  }

  function onDragEnd(): void {
    draggingTaskId.value = null
  }

  return { draggingTaskId, onDragStart, onDrop, onDragEnd }
}
