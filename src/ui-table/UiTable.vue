<template>
  <div
    class="bg-card text-muted-foreground rounded-lg shadow-sm border border-border overflow-hidden"
  >
    <UiTableHeader
      :search-value="filters?.search || ''"
      :search-placeholder="searchPlaceholder"
      :columns="allColumns"
      :show-search="resolvedConfig.showSearch"
      :show-column-toggle="resolvedConfig.showColumnToggle"
      :show-refresh="resolvedConfig.showRefresh"
      :loading="loading"
      :bulk-actions="features?.bulkActions"
      :selected-rows="selectedRows"
      @update:search="handleSearch"
      @refresh="handleRefresh"
      @toggle-column="handleColumnToggle"
      @clear-selection="clearSelection"
    />

    <div class="hidden md:block">
      <UiTableBody
        :data="tableData"
        :visible-columns="visibleColumns"
        :loading="loading"
        :error="error"
        :sort="sort || { column: null, order: null }"
        :row-actions="features?.rowActions"
        :selection="selectionState"
        @sort="handleSort"
        @refresh="handleRefresh"
        @toggle-row="toggleRowSelection"
        @toggle-all="toggleAllSelection"
      >
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </UiTableBody>
    </div>

    <UiList
      v-if="resolvedConfig.mobileView === 'list'"
      class="md:hidden"
      :items="tableData"
      :loading="loading"
      :show-footer="false"
    >
      <template #item="{ item }">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div v-if="selectionState.enabled" class="flex items-center gap-2">
              <Checkbox
                :checked="selectionState.isRowSelected(item)"
                @update:checked="(checked) => toggleRowSelection(item, Boolean(checked))"
              />
              <span class="text-xs text-muted-foreground">Select</span>
            </div>
            <div v-if="features?.rowActions?.length" class="flex items-center gap-2">
              <Button
                v-for="action in visibleRowActions(item)"
                :key="action.label"
                size="sm"
                :variant="action.variant || 'ghost'"
                class="gap-2"
                @click="action.onClick(item)"
              >
                <component v-if="action.icon" :is="action.icon" class="h-4 w-4" />
                {{ action.label }}
              </Button>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="column in visibleColumns"
              :key="column.key"
              class="flex items-start justify-between gap-4"
            >
              <span class="text-xs text-muted-foreground">{{ column.label }}</span>
              <span class="text-sm text-card-foreground text-right">
                <slot
                  :name="`cell-${column.key}`"
                  :row="item"
                  :value="item[column.key]"
                  :column="column"
                >
                  {{ column.formatter ? column.formatter(item[column.key], item) : item[column.key] }}
                </slot>
              </span>
            </div>
          </div>
        </div>
      </template>
    </UiList>

    <UiTableFooter
      v-if="pagination"
      :pagination="pagination"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTableInteractions } from "./composables/useTableInteractions";
import type {
  TableColumn,
  TableConfig,
  TableFeatures,
  TableFetchFn,
  TableSelectionConfig,
} from "./types/table.types";
import UiList from "./UiList.vue";
import UiTableBody from "./UiTableBody.vue";
import UiTableFooter from "./UiTableFooter.vue";
import UiTableHeader from "./UiTableHeader.vue";

interface Props {
  tableId: string;
  columns: TableColumn[];
  fetchFn: TableFetchFn;
  config?: TableConfig;
  features?: TableFeatures;
  searchPlaceholder?: string;
  showRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  searchPlaceholder: "Search...",
  showRefresh: true,
});

const resolvedConfig = computed(() => ({
  showSearch: true,
  showColumnToggle: true,
  showRefresh: props.showRefresh,
  mobileView: "list",
  ...props.config,
}));

const selectionConfig = computed<TableSelectionConfig>(() => ({
  enabled: false,
  rowKey: "id",
  ...props.features?.selection,
}));

const selectedRowIds = ref(new Set<string | number>());

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

const selectedRows = computed(() =>
  tableData.value.filter((row) => selectedRowIds.value.has(getRowId(row))),
);

const allSelected = computed(
  () =>
    tableData.value.length > 0 &&
    selectedRowIds.value.size === tableData.value.length,
);

const someSelected = computed(
  () => selectedRowIds.value.size > 0 && !allSelected.value,
);

const selectionState = computed(() => ({
  enabled: Boolean(selectionConfig.value.enabled),
  allSelected: allSelected.value,
  someSelected: someSelected.value,
  isRowSelected,
}));

function getRowId(row: Record<string, any>) {
  const key = selectionConfig.value.rowKey || "id";
  return row[key as keyof typeof row] as string | number;
}

function isRowSelected(row: Record<string, any>) {
  return selectedRowIds.value.has(getRowId(row));
}

function toggleRowSelection(row: Record<string, any>, checked: boolean) {
  if (!selectionConfig.value.enabled) return;
  const next = new Set(selectedRowIds.value);
  const id = getRowId(row);
  if (checked) {
    next.add(id);
  } else {
    next.delete(id);
  }
  selectedRowIds.value = next;
}

function toggleAllSelection(checked: boolean) {
  if (!selectionConfig.value.enabled) return;
  if (checked) {
    selectedRowIds.value = new Set(tableData.value.map(getRowId));
  } else {
    selectedRowIds.value = new Set();
  }
}

function clearSelection() {
  selectedRowIds.value = new Set();
}

function visibleRowActions(row: Record<string, any>) {
  return (
    props.features?.rowActions?.filter((action) =>
      action.show ? action.show(row) : true,
    ) || []
  );
}

watch(tableData, (rows) => {
  if (!selectionConfig.value.enabled) return;
  const ids = new Set(rows.map(getRowId));
  const next = new Set(
    Array.from(selectedRowIds.value).filter((id) => ids.has(id)),
  );
  selectedRowIds.value = next;
  selectionConfig.value.onChange?.(selectedRows.value);
});

watch(selectedRows, (rows) => {
  selectionConfig.value.onChange?.(rows);
});
</script>
