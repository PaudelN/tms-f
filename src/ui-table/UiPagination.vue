<template>
  <div class="flex flex-col gap-3 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-xs text-muted-foreground">
      <span v-if="total > 0">Showing {{ startItem }}-{{ endItem }} of {{ total }}</span>
      <span v-else>No items</span>
    </p>

    <div class="flex items-center gap-2 self-end sm:self-auto">
      <Select :model-value="String(perPage)" @update:model-value="handlePerPageChange">
        <SelectTrigger class="h-8 w-[92px] text-xs">
          <SelectValue placeholder="Per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">
            {{ size }} / page
          </SelectItem>
        </SelectContent>
      </Select>

      <div class="flex items-center gap-1">
        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage <= 1" @click="emitPageChange(1)">
          <ChevronsLeft class="size-3.5" />
        </Button>
        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage <= 1" @click="emitPageChange(currentPage - 1)">
          <ChevronLeft class="size-3.5" />
        </Button>

        <Button
          v-for="page in visiblePages"
          :key="page"
          size="sm"
          :variant="page === currentPage ? 'default' : 'outline'"
          class="h-8 min-w-8 px-2"
          @click="emitPageChange(page)"
        >
          {{ page }}
        </Button>

        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage >= totalPages" @click="emitPageChange(currentPage + 1)">
          <ChevronRight class="size-3.5" />
        </Button>
        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage >= totalPages" @click="emitPageChange(totalPages)">
          <ChevronsRight class="size-3.5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-vue-next";
import { computed } from "vue";

interface Props {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  pageSizes?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [5, 10, 20, 50, 100],
});

const emit = defineEmits<{
  "page-change": [page: number];
  "per-page-change": [perPage: number];
}>();

const startItem = computed(() => (props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1));
const endItem = computed(() => Math.min(props.currentPage * props.perPage, props.total));

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(Math.max(props.totalPages, 1), start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let index = start; index <= end; index += 1) {
    pages.push(index);
  }

  return pages;
});

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= Math.max(props.totalPages, 1)) {
    emit("page-change", page);
  }
}

function handlePerPageChange(value: string | number | bigint | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isNaN(parsed) && parsed > 0) {
    emit("per-page-change", parsed);
  }
}
</script>
