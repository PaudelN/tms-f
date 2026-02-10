import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Notification } from '@/types/models'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)

  function addNotification(notification: Notification): void {
    notifications.value.unshift(notification)
  }

  function markAllAsRead(): void {
    notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
  }

  return { notifications, unreadCount, addNotification, markAllAsRead }
})
