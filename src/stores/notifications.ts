import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface InAppNotification {
  id: string
  message: string
  isRead: boolean
  createdAt: Date
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<InAppNotification[]>([])
  const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)

  function add(message: string) {
    notifications.value.unshift({ id: crypto.randomUUID(), message, isRead: false, createdAt: new Date() })
  }

  function markRead(id: string) {
    const notification = notifications.value.find((item) => item.id === id)
    if (notification) notification.isRead = true
  }

  return { notifications, unreadCount, add, markRead }
})
