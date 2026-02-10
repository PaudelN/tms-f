import { ref } from 'vue'
import type { TaskStatus } from '@/types/models'

export function useTaskDragDrop(onMove: (taskId: string, status: TaskStatus, position: number) => Promise<void> | void) {
  const draggedTaskId = ref<string | null>(null)

  const onDragStart = (taskId: string) => {
    draggedTaskId.value = taskId
  }

  const onDrop = async (status: TaskStatus, position: number) => {
    if (!draggedTaskId.value) return
    await onMove(draggedTaskId.value, status, position)
    draggedTaskId.value = null
  }

  const onDragEnd = () => {
    draggedTaskId.value = null
  }

  return { draggedTaskId, onDragStart, onDrop, onDragEnd }
}
