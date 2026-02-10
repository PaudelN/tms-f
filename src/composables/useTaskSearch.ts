import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

export function useTaskSearch(onSearch: (query: string) => void) {
  const query = ref('')

  watchDebounced(query, (value) => onSearch(value), { debounce: 300, maxWait: 600 })

  return { query }
}
