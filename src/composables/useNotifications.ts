import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'

export function useNotifications() {
  const notificationsStore = useNotificationsStore()

  const unreadNotifications = computed(() => notificationsStore.notifications.filter((item) => !item.isRead))

  return {
    notifications: notificationsStore.notifications,
    unreadNotifications,
    unreadCount: notificationsStore.unreadCount,
    markAllAsRead: notificationsStore.markAllAsRead,
  }
}
