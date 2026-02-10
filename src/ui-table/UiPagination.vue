<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const perPageSelectValue = computed(() => String(props.perPage));

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit("page-change", page);
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 px-1 py-2 md:flex-row md:items-center md:justify-between">
    <p class="text-xs text-muted-foreground">
      <span v-if="total > 0">Showing {{ startItem }}-{{ endItem }} of {{ total }}</span>
      <span v-else>No items</span>
    </p>

    <div class="flex items-center gap-2">
      <Select :model-value="perPageSelectValue" @update:model-value="emit('per-page-change', Number($event))">
        <SelectTrigger class="h-8 w-[88px] text-xs">
          <SelectValue placeholder="Per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">{{ size }}</SelectItem>
        </SelectContent>
      </Select>

      <div class="flex items-center gap-1">
        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage === 1" @click="emitPageChange(1)">
          <ChevronsLeft class="size-3.5" />
        </Button>
        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage === 1" @click="emitPageChange(currentPage - 1)">
          <ChevronLeft class="size-3.5" />
        </Button>
        <span class="min-w-16 text-center text-xs text-muted-foreground">{{ currentPage }} / {{ totalPages || 1 }}</span>
        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage === totalPages || !totalPages" @click="emitPageChange(currentPage + 1)">
          <ChevronRight class="size-3.5" />
        </Button>
        <Button variant="outline" size="icon" class="size-8" :disabled="currentPage === totalPages || !totalPages" @click="emitPageChange(totalPages)">
          <ChevronsRight class="size-3.5" />
        </Button>
      </div>
    </div>
  </div>
</template>
