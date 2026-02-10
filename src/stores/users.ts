import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/models'
import { getUsers } from '@/services/users.api'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])

  async function fetchUsers() {
    try {
      users.value = await getUsers()
    } catch {
      users.value = [{ id: 'u1', email: 'admin@example.com', name: 'Admin User', avatar: null, role: 'admin' }]
    }
  }

  return { users, fetchUsers }
})
