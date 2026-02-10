import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ViewType } from '@/types/models'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const taskView = ref<ViewType>('list')

  const toggleSidebar = (): void => { sidebarOpen.value = !sidebarOpen.value }
  const setTaskView = (value: ViewType): void => { taskView.value = value }

  return { sidebarOpen, taskView, toggleSidebar, setTaskView }
})
