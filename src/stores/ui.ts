import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ViewType } from '@/types/models'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const commandPaletteOpen = ref(false)
  const defaultView = ref<ViewType>('list')

  return { sidebarOpen, commandPaletteOpen, defaultView }
})
