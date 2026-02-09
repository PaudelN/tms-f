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
  import { useTableInteractions } from "./composables/useTableInteractions";
  import type {
    TableColumn,
    TableConfig,
    TableFetchFn,
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
    handleSearch,
    handleSort,
    handlePageChange,
    handlePerPageChange,
    handleColumnToggle,
    handleRefresh,
  } = useTableInteractions(
    props.tableId,
    props.columns,
    props.fetchFn,
    props.config,
  );
</script>
