<template>
  <div class="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/70 p-3 md:flex-row md:items-center md:justify-between">
    <div class="text-xs text-muted-foreground">
      <span v-if="total > 0">Showing {{ startItem }}-{{ endItem }} of {{ total }}</span>
      <span v-else>No items</span>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Select :model-value="String(perPage)" @update:model-value="handlePerPageChange">
        <SelectTrigger class="h-9 w-[104px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">{{ size }} / page</SelectItem>
        </SelectContent>
      </Select>

      <div class="mx-1 h-6 w-px bg-border" />

      <Button variant="outline" size="sm" class="h-9 px-3" :disabled="currentPage === 1" @click="emitPageChange(currentPage - 1)">
        <ChevronLeft class="mr-1 h-4 w-4" /> Prev
      </Button>

      <div class="rounded-md border border-border bg-muted/30 px-3 py-1 text-sm font-medium">
        {{ currentPage }} / {{ Math.max(totalPages, 1) }}
      </div>

      <Button variant="outline" size="sm" class="h-9 px-3" :disabled="currentPage === totalPages || totalPages === 0" @click="emitPageChange(currentPage + 1)">
        Next <ChevronRight class="ml-1 h-4 w-4" />
      </Button>
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
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

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

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) emit("page-change", page);
}

function handlePerPageChange(value: AcceptableValue) {
  const size = Number(value ?? props.perPage);
  if (!Number.isNaN(size)) emit("per-page-change", size);
}
</script>
