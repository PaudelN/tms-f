import { useNotificationsStore } from '@/stores/notifications'

export function useNotifications() {
  const store = useNotificationsStore()
  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    notify: store.add,
    markRead: store.markRead,
  }
}
