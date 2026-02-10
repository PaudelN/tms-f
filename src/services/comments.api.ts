import api from '@/services/api'
import type { Comment } from '@/types/models'

export async function getTaskComments(taskId: string): Promise<Comment[]> {
  const { data } = await api.get<Comment[]>(`/tasks/${taskId}/comments`)
  return data
}
