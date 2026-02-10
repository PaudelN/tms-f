<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <UiTableHeader
      :search-value="filters?.search || ''"
      :search-placeholder="searchPlaceholder"
      :columns="allColumns"
      :show-refresh="showRefresh"
      :loading="loading"
      :selected-count="selectedRows.length"
      :bulk-actions="bulkActions"
      @update:search="handleSearch"
      @refresh="handleRefresh"
      @toggle-column="handleColumnToggle"
      @bulk-action="runBulkAction"
      @clear-selection="clearSelection"
    />

    <UiTableBody
      :data="tableData"
      :visible-columns="visibleColumns"
      :loading="loading"
      :error="error"
      :sort="sort || { column: null, order: null }"
      :selected-row-ids="selectedRowIds"
      :mobile-breakpoint="mobileBreakpoint"
      :row-actions="rowActions"
      @sort="handleSort"
      @refresh="handleRefresh"
      @toggle-row="handleRowSelection"
      @toggle-all="handleAllRows"
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
import { computed } from "vue";
import { useTableInteractions } from "./composables/useTableInteractions";
import type { BulkAction, TableAction, TableColumn, TableConfig, TableFetchFn } from "./types/table.types";
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
  rowActions?: TableAction[];
  bulkActions?: BulkAction[];
  mobileBreakpoint?: number;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  searchPlaceholder: "Search...",
  showRefresh: true,
  rowActions: () => [],
  bulkActions: () => [],
  mobileBreakpoint: 768,
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
  selectedRowIds,
  handleSearch,
  handleSort,
  handlePageChange,
  handlePerPageChange,
  handleColumnToggle,
  handleRefresh,
  handleRowSelection,
  handleAllRows,
  clearSelection,
} = useTableInteractions(props.tableId, props.columns, props.fetchFn, props.config);

const selectedRows = computed(() => {
  const ids = new Set(selectedRowIds.value);
  return tableData.value.filter((row: any) => ids.has(String(row?.id)));
});

function runBulkAction(action: BulkAction) {
  action.onClick(selectedRows.value);
}
</script>
