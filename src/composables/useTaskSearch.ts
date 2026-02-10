import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

export function useTaskSearch(onSearch: (query: string) => void) {
  const query = ref('')

  watchDebounced(query, (value) => onSearch(value), { debounce: 250, maxWait: 500 })

  return { query }
}
