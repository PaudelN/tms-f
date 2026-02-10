<template>
  <div class="flex flex-col gap-3 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
    <div class="text-xs text-muted-foreground">
      <span v-if="total > 0">Showing {{ startItem }}-{{ endItem }} of {{ total }}</span>
      <span v-else>No items</span>
    </div>

    <div class="flex items-center gap-2">
      <AppSelect
        class="w-28"
        :model-value="String(perPage)"
        placeholder="Per page"
        :options="pageSizeOptions"
        @update:model-value="(value) => emit('per-page-change', Number(value))"
      />

      <Button variant="outline" size="icon" :disabled="currentPage === 1" @click="emitPageChange(currentPage - 1)">
        <ChevronLeft class="size-4" />
      </Button>
      <span class="min-w-16 text-center text-xs text-muted-foreground">{{ currentPage }} / {{ totalPages || 1 }}</span>
      <Button variant="outline" size="icon" :disabled="currentPage >= totalPages" @click="emitPageChange(currentPage + 1)">
        <ChevronRight class="size-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSelect from "@/components/common/AppSelect.vue";
import { Button } from "@/components/ui/button";
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

const startItem = computed(() =>
  props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1,
);
const endItem = computed(() => Math.min(props.currentPage * props.perPage, props.total));
const pageSizeOptions = computed(() =>
  props.pageSizes.map((size) => ({ label: `${size} / page`, value: String(size) })),
);

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= (props.totalPages || 1)) {
    emit("page-change", page);
  }
}
</script>
