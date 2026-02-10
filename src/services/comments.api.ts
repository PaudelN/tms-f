import { api } from './api'
import type { CreateCommentDto } from '@/types/dto'

export async function createComment(payload: CreateCommentDto): Promise<void> {
  await api.post('/comments', payload)
}
