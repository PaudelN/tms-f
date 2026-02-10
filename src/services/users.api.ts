import { api } from './api'
import type { User } from '@/types/models'

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users')
  return response.data
}
