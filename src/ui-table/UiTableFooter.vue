<template>
  <div class="bg-card border-t border-border px-4 py-3">
    <UiPagination
      :current-page="pagination.currentPage"
      :total-pages="pagination.totalPages"
      :total="pagination.total"
      :per-page="pagination.perPage"
      @page-change="$emit('page-change', $event)"
      @per-page-change="$emit('per-page-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  import UiPagination from "./UiPagination.vue";
  import type { PaginationState } from "./types/table.types";

  interface Props {
    pagination: PaginationState;
  }

  defineProps<Props>();

  defineEmits<{
    "page-change": [page: number];
    "per-page-change": [perPage: number];
  }>();
</script>
