import { ref } from 'vue'
import type { TaskStatus } from '@/types/models'

export function useTaskDragDrop(onMove: (taskId: string, status: TaskStatus) => void) {
  const draggingTaskId = ref<string | null>(null)

  function start(taskId: string) { draggingTaskId.value = taskId }
  function end() { draggingTaskId.value = null }
  function drop(status: TaskStatus) {
    if (!draggingTaskId.value) return
    onMove(draggingTaskId.value, status)
    draggingTaskId.value = null
  }

  return { draggingTaskId, start, end, drop }
}
