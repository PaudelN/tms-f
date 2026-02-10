<template>
  <div class="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
    <div class="text-xs text-muted-foreground">
      <span v-if="total > 0">
        Showing {{ startItem }}-{{ endItem }} of {{ total }}
      </span>
      <span v-else>No items</span>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Per page:</span>
        <Select :model-value="String(perPage)" @update:model-value="handlePerPageChange">
          <SelectTrigger class="h-8 w-[96px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage === 1"
          title="First page"
          @click="emitPageChange(1)"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage === 1"
          title="Previous page"
          @click="emitPageChange(currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <Button
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          size="sm"
          class="h-8 min-w-[2rem]"
          @click="emitPageChange(page)"
        >
          {{ page }}
        </Button>

        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage === totalPages"
          title="Next page"
          @click="emitPageChange(currentPage + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage === totalPages"
          title="Last page"
          @click="emitPageChange(totalPages)"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { AcceptableValue } from "reka-ui";
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

const startItem = computed(() => {
  return props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.total);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit("page-change", page);
  }
}

function handlePerPageChange(value: AcceptableValue) {
  const size = Number(value ?? props.perPage);
  if (!Number.isNaN(size)) emit("per-page-change", size);
}
</script>
