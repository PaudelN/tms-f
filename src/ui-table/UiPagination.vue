<template>
  <div class="flex flex-col gap-3 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-xs text-muted-foreground">
      <span v-if="total > 0">Showing {{ startItem }}-{{ endItem }} of {{ total }}</span>
      <span v-else>No items</span>
    </p>

    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">Per page</span>
      <Select :model-value="String(perPage)" @update:model-value="(v) => emit('per-page-change', Number(v))">
        <SelectTrigger class="h-8 w-20"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">{{ size }}</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" class="h-8 w-8" :disabled="currentPage <= 1" @click="emitPageChange(currentPage - 1)">
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <span class="px-2 text-xs text-muted-foreground">{{ currentPage }} / {{ totalPages || 1 }}</span>
      <Button variant="outline" size="icon" class="h-8 w-8" :disabled="currentPage >= totalPages" @click="emitPageChange(currentPage + 1)">
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
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

function emitPageChange(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit("page-change", page);
  }
}
</script>
