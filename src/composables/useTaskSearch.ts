import { ref, watch } from 'vue'

export function useTaskSearch(onSearch: (query: string) => void, debounceMs = 250) {
  const query = ref('')
  let timer: number | undefined

  watch(query, (value) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      onSearch(value)
    }, debounceMs)
  })

  return { query }
}
