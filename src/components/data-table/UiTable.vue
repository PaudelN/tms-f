<template>
  <div class="bg-card text-muted-foreground rounded-lg shadow-sm border border-border overflow-hidden">
    <UiTableHeader
      :search-value="filters?.search || ''"
      :search-placeholder="searchPlaceholder"
      :columns="allColumns"
      :show-refresh="resolvedShowRefresh"
      :show-search="resolvedShowSearch"
      :show-column-toggle="resolvedShowColumnToggle"
      :loading="loading"
      :selected-count="selectedCount"
      :bulk-actions="bulkActions"
      :selected-rows="selectedRows"
      @update:search="handleSearch"
      @refresh="handleRefresh"
      @toggle-column="handleColumnToggle"
      @clear-selection="clearSelection"
    />

    <UiTableBody
      :data="tableData"
      :visible-columns="visibleColumns"
      :loading="loading"
      :error="error"
      :sort="sort || { column: null, order: null }"
      :selectable="selectable"
      :row-key="rowKey"
      :selected-row-ids="selectedRowIds"
      :row-actions="rowActions"
      @sort="handleSort"
      @refresh="handleRefresh"
      @toggle-row="toggleRowSelection"
      @toggle-all="toggleAllSelection"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </UiTableBody>

    <UiTableFooter
      v-if="pagination"
      :pagination="pagination"
      :page-sizes="config.pageSizes"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>

<script setup lang="ts">
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

const config = computed(() => props.config || {});
const rowKey = computed(() => config.value.rowKey || "id");
const selectable = computed(() => config.value.selectable ?? (config.value.bulkActions?.length ?? 0) > 0);
const rowActions = computed(() => config.value.rowActions || []);
const bulkActions = computed(() => config.value.bulkActions || []);
const resolvedShowSearch = computed(() => config.value.showSearch ?? true);
const resolvedShowColumnToggle = computed(() => config.value.showColumnToggle ?? true);
const resolvedShowRefresh = computed(() => config.value.showRefresh ?? props.showRefresh ?? true);

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

const selectedRowIds = ref<Set<string | number>>(new Set());

const selectedRows = computed(() =>
  tableData.value.filter((row) => selectedRowIds.value.has(row[rowKey.value])),
);

const selectedCount = computed(() => selectedRowIds.value.size);

watch(tableData, (rows) => {
  const availableIds = new Set(rows.map((row) => row[rowKey.value]));
  selectedRowIds.value = new Set(
    Array.from(selectedRowIds.value).filter((id) => availableIds.has(id)),
  );
});

function toggleRowSelection(row: any) {
  const id = row[rowKey.value];
  const next = new Set(selectedRowIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedRowIds.value = next;
}

function toggleAllSelection() {
  if (selectedRowIds.value.size === tableData.value.length) {
    selectedRowIds.value = new Set();
    return;
  }
  selectedRowIds.value = new Set(tableData.value.map((row) => row[rowKey.value]));
}

function clearSelection() {
  selectedRowIds.value = new Set();
}
</script>
