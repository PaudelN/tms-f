import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/types/models'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  async function fetchNotifications() {
    notifications.value = []
  }

  function markRead(id: string) {
    const notification = notifications.value.find((item) => item.id === id)
    if (notification) notification.isRead = true
  }

  function markAllRead() {
    notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
  }

  return { notifications, fetchNotifications, markRead, markAllRead }
})
