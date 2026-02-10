<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTableInteractions } from "./composables/useTableInteractions";
import type { BulkAction, TableAction, TableColumn, TableConfig, TableFetchFn } from "./types/table.types";
import UiTableBody from "./UiTableBody.vue";
import UiTableFooter from "./UiTableFooter.vue";
import UiTableHeader from "./UiTableHeader.vue";
import { Button } from "@/components/ui/button";

interface Props {
  tableId: string;
  columns: TableColumn[];
  fetchFn: TableFetchFn;
  config?: TableConfig;
  searchPlaceholder?: string;
  showRefresh?: boolean;
  rowKey?: string;
  rowActions?: TableAction[];
  bulkActions?: BulkAction[];
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  searchPlaceholder: "Search...",
  showRefresh: true,
  rowKey: "id",
  rowActions: () => [],
  bulkActions: () => [],
});

const selectedRows = ref<Set<string | number>>(new Set());

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
  showAllColumns,
  hideAllColumns,
} = useTableInteractions(props.tableId, props.columns, props.fetchFn, props.config);

const selectedRowData = computed(() => {
  const rowKey = props.rowKey as string;
  return tableData.value.filter((row: Record<string, any>) => selectedRows.value.has(row[rowKey]));
});

const allSelected = computed(
  () =>
    tableData.value.length > 0 &&
    tableData.value.every((row: Record<string, any>) => selectedRows.value.has(row[props.rowKey])),
);

watch(tableData, () => {
  const validIds = new Set(tableData.value.map((row: Record<string, any>) => row[props.rowKey]));
  selectedRows.value = new Set([...selectedRows.value].filter((rowId) => validIds.has(rowId)));
});

function handleToggleRow(rowId: string | number, checked: boolean) {
  if (checked) {
    selectedRows.value.add(rowId);
    return;
  }
  selectedRows.value.delete(rowId);
}

function handleToggleAllRows(checked: boolean) {
  if (!checked) {
    selectedRows.value.clear();
    return;
  }

  selectedRows.value = new Set(tableData.value.map((row: Record<string, any>) => row[props.rowKey]));
}
</script>

<template>
  <section class="overflow-hidden rounded-lg border bg-card">
    <UiTableHeader
      :search-value="filters?.search || ''"
      :search-placeholder="searchPlaceholder"
      :columns="allColumns"
      :show-refresh="showRefresh"
      :loading="loading"
      :selected-count="selectedRows.size"
      :total-rows="tableData.length"
      :all-selected="allSelected"
      @update:search="handleSearch"
      @refresh="handleRefresh"
      @toggle-column="handleColumnToggle"
      @toggle-all-columns="($event) => ($event ? showAllColumns() : hideAllColumns())"
      @toggle-all-rows="handleToggleAllRows"
    />

    <div v-if="selectedRows.size && bulkActions.length" class="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-4 py-2">
      <span class="text-xs text-muted-foreground">{{ selectedRows.size }} selected</span>
      <Button
        v-for="action in bulkActions"
        :key="action.label"
        size="sm"
        variant="outline"
        @click="action.onClick(selectedRowData)"
      >
        {{ action.label }}
      </Button>
    </div>

    <UiTableBody
      :data="tableData"
      :visible-columns="visibleColumns"
      :loading="loading"
      :error="error"
      :sort="sort || { column: null, order: null }"
      :row-key="rowKey"
      :selected-rows="selectedRows"
      :row-actions="rowActions"
      @sort="handleSort"
      @refresh="handleRefresh"
      @toggle-row="handleToggleRow"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </UiTableBody>

    <UiTableFooter v-if="pagination" :pagination="pagination" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />
  </section>
</template>
