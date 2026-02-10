import api from '@/services/api'
import type { User } from '@/types/models'

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return data
}
