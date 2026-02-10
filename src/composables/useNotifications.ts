import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'

export function useNotifications() {
  const store = useNotificationsStore()
  const { notifications } = storeToRefs(store)

  const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)

  return {
    notifications,
    unreadCount,
    markRead: store.markRead,
    markAllRead: store.markAllRead,
    fetchNotifications: store.fetchNotifications
  }
}
