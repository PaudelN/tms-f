<template>
  <div class="flex flex-col gap-4 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
    <!-- Items info -->
    <div class="text-xs text-muted-foreground">
      <span v-if="total > 0">
        Showing {{ startItem }}-{{ endItem }} of {{ total }}
      </span>
      <span v-else>No items</span>
    </div>

    <!-- Pagination controls -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div class="flex items-center gap-2">
        <label class="text-xs text-muted-foreground">Per page:</label>
        <Select :model-value="String(perPage)" @update:model-value="handlePerPageChange">
          <SelectTrigger class="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="size in pageSizes"
              :key="size"
              :value="String(size)"
            >
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          @click="emitPageChange(1)"
          :disabled="currentPage === 1"
          title="First page"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          @click="emitPageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          title="Previous page"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in visiblePages"
          :key="page"
          @click="emitPageChange(page)"
          :variant="page === currentPage ? 'default' : 'outline'"
          size="icon"
          class="h-8 min-w-[2rem] text-xs"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="icon"
          @click="emitPageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          title="Next page"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          @click="emitPageChange(totalPages)"
          :disabled="currentPage === totalPages"
          title="Last page"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-vue-next";

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
  "page-change": [page: number]
  "per-page-change": [perPage: number]
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

function handlePerPageChange(value: string) {
  emit("per-page-change", Number(value))
}
</script>
