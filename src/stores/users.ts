import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as usersApi from '@/services/users.api'
import type { User } from '@/types/models'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  async function fetchUsers(): Promise<void> {
    loading.value = true
    try {
      users.value = await usersApi.getUsers()
    } finally {
      loading.value = false
    }
  }

  return { users, loading, fetchUsers }
})
