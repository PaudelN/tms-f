<template>
  <div class="overflow-hidden rounded-lg border border-border bg-card text-muted-foreground">
    <UiTableHeader
      :search-value="filters?.search || ''"
      :search-placeholder="searchPlaceholder"
      :columns="allColumns"
      :show-refresh="showRefresh"
      :loading="loading"
      @update:search="handleSearch"
      @refresh="handleRefresh"
      @toggle-column="handleColumnToggle"
    />

    <div v-if="selectedRows.length" class="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
      <p class="text-xs text-muted-foreground">{{ selectedRows.length }} selected</p>
      <slot name="bulk-actions" :rows="selectedData">
        <Button size="sm" variant="outline" @click="selectedRows = []">Clear</Button>
      </slot>
    </div>

    <UiTableBody
      :data="tableData"
      :visible-columns="visibleColumns"
      :loading="loading"
      :error="error"
      :sort="sort || { column: null, order: null }"
      :selected-rows="selectedRows"
      @sort="handleSort"
      @refresh="handleRefresh"
      @toggle-row="toggleRow"
      @toggle-all="toggleAllRows"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </UiTableBody>

    <UiTableFooter
      v-if="pagination"
      :pagination="pagination"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { computed, ref, watch } from "vue";
import { useTableInteractions } from "./composables/useTableInteractions";
import type { TableColumn, TableConfig, TableFetchFn } from "./types/table.types";
import UiTableBody from "./UiTableBody.vue";
import UiTableFooter from "./UiTableFooter.vue";
import UiTableHeader from "./UiTableHeader.vue";

interface Props {
  tableId: string;
  columns: TableColumn[];
  fetchFn: TableFetchFn;
  config?: TableConfig;
  searchPlaceholder?: string;
  showRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  searchPlaceholder: "Search...",
  showRefresh: true,
});

const {
  tableData,
  loading,
  error,
  pagination,
  filters,
  sort,
  visibleColumns,
  allColumns,
  handleSearch,
  handleSort,
  handlePageChange,
  handlePerPageChange,
  handleColumnToggle,
  handleRefresh,
} = useTableInteractions(props.tableId, props.columns, props.fetchFn, props.config);

const selectedRows = ref<number[]>([]);
const selectedData = computed(() => selectedRows.value.map((index) => tableData.value[index]).filter(Boolean));

watch(tableData, () => {
  selectedRows.value = [];
});

function toggleRow(index: number) {
  if (selectedRows.value.includes(index)) {
    selectedRows.value = selectedRows.value.filter((item) => item !== index);
    return;
  }
  selectedRows.value = [...selectedRows.value, index];
}

function toggleAllRows() {
  if (selectedRows.value.length === tableData.value.length) {
    selectedRows.value = [];
    return;
  }
  selectedRows.value = tableData.value.map((_, index) => index);
}
</script>
