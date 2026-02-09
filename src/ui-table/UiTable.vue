<template>
  <div
    class="bg-card text-muted-foreground rounded-lg shadow-sm border border-border overflow-hidden"
  >
    <!-- Table Header (Search, Refresh, Column Toggle) -->
    <UiTableHeader
      :search-value="filters?.search || ''"
      :search-placeholder="searchPlaceholder"
      :columns="allColumns"
      :show-refresh="showRefresh"
      :loading="loading"
      :bulk-actions="headerBulkActions"
      :selected-count="selectedRowIds.length"
      @clear-selection="clearSelection"
      @update:search="handleSearch"
      @refresh="handleRefresh"
      @toggle-column="handleColumnToggle"
    />

    <!-- Table Body -->
    <UiTableBody
      :data="tableData"
      :visible-columns="visibleColumns"
      :loading="loading"
      :error="error"
      :sort="sort || { column: null, order: null }"
      :row-actions="rowActions"
      :row-id-key="rowIdKey"
      :selected-row-ids="selectedRowIds"
      @toggle-row="toggleRowSelection"
      @toggle-all="setRowSelection"
      @sort="handleSort"
      @refresh="handleRefresh"
    >
      <!-- Pass through all scoped slots -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </UiTableBody>

    <!-- Table Footer (Pagination) -->
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
  import type {
    TableColumn,
    TableConfig,
    TableFetchFn,
    TableAction,
    BulkAction,
  } from "./types/table.types";
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
  }

  const props = withDefaults(defineProps<Props>(), {
    config: () => ({}),
    searchPlaceholder: "Search...",
    showRefresh: true,
  });

  // Use table interactions composable
  const {
    tableData,
    loading,
    error,
    pagination,
    filters,
    sort,
    visibleColumns,
    allColumns,
    rowIdKey,
    selectedRowIds,
    handleSearch,
    handleSort,
    handlePageChange,
    handlePerPageChange,
    handleColumnToggle,
    handleRefresh,
    toggleRowSelection,
    setRowSelection,
    clearSelection,
  } = useTableInteractions(
    props.tableId,
    props.columns,
    props.fetchFn,
    props.config,
  );

  const selectedRows = computed(() => {
    const key = rowIdKey.value;
    return tableData.value.filter((row: any) =>
      selectedRowIds.value.includes(row?.[key]),
    );
  });

  const headerBulkActions = computed(() =>
    (props.bulkActions || []).map((action) => ({
      ...action,
      onClick: () => action.onClick(selectedRows.value),
      disabled: action.disabled
        ? action.disabled(selectedRows.value)
        : false,
    })),
  );
</script>
