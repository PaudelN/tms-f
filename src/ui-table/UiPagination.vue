<template>
  <div class="flex items-center justify-between gap-4 px-1 py-2">
    <!-- Items info -->
    <div class="text-xs text-muted-foreground">
      <span v-if="total > 0">
        Showing {{ startItem }}-{{ endItem }} of {{ total }}
      </span>
      <span v-else>No items</span>
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center gap-2">
      <!-- Per page selector -->
      <div class="flex items-center gap-2">
        <label for="perPage" class="text-xs text-muted-foreground">
          Per page:
        </label>
        <select
          id="perPage"
          :value="perPage"
          @change="handlePerPageChange"
          class="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>

      <!-- Page buttons -->
      <div class="flex items-center gap-1">
        <!-- First page -->
        <button
          @click="emitPageChange(1)"
          :disabled="currentPage === 1"
          class="h-8 w-8 rounded-md border border-input bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-all text-xs font-medium"
          title="First page"
        >
          <span class="flex items-center justify-center">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </span>
        </button>

        <!-- Previous page -->
        <button
          @click="emitPageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="h-8 w-8 rounded-md border border-input bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-all text-xs font-medium"
          title="Previous page"
        >
          <span class="flex items-center justify-center">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </span>
        </button>

        <!-- Page numbers -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="emitPageChange(page)"
          :class="[
            'h-8 min-w-[2rem] px-2 rounded-md border text-xs font-medium transition-all',
            page === currentPage
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          {{ page }}
        </button>

        <!-- Next page -->
        <button
          @click="emitPageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="h-8 w-8 rounded-md border border-input bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-all text-xs font-medium"
          title="Next page"
        >
          <span class="flex items-center justify-center">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        <!-- Last page -->
        <button
          @click="emitPageChange(totalPages)"
          :disabled="currentPage === totalPages"
          class="h-8 w-8 rounded-md border border-input bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-all text-xs font-medium"
          title="Last page"
        >
          <span class="flex items-center justify-center">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  total: number
  perPage: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [5, 10, 20, 50, 100]
})

const emit = defineEmits<{
  'page-change': [page: number]
  'per-page-change': [perPage: number]
}>()

const startItem = computed(() => {
  return props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.total)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

function handlePerPageChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('per-page-change', Number(target.value))
}
</script>