import { ref } from 'vue'
import type { TaskStatus } from '@/types/models'

export function useTaskDragDrop(onMove: (taskId: string, status: TaskStatus, position: number) => void) {
  const draggedTaskId = ref<string | null>(null)

  const startDrag = (taskId: string): void => { draggedTaskId.value = taskId }
  const endDrag = (): void => { draggedTaskId.value = null }
  const dropOnColumn = (status: TaskStatus, position = 0): void => {
    if (!draggedTaskId.value) return
    onMove(draggedTaskId.value, status, position)
    draggedTaskId.value = null
  }

  return { draggedTaskId, startDrag, endDrag, dropOnColumn }
}
