import api from './api'

export interface CommentDto {
  id: string
  taskId: string
  content: string
  userId: string
  createdAt: string
}

export async function getTaskComments(taskId: string): Promise<CommentDto[]> {
  const { data } = await api.get<CommentDto[]>(`/tasks/${taskId}/comments`)
  return data
}
