import { computed, ref } from 'vue'

export function usePagination(initialPerPage = 10) {
  const page = ref(1)
  const perPage = ref(initialPerPage)
  const total = ref(0)

  const offset = computed(() => (page.value - 1) * perPage.value)
  const pages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

  function reset() {
    page.value = 1
  }

  return { page, perPage, total, offset, pages, reset }
}
