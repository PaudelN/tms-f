<template>
  <div class="bg-card text-foreground rounded-lg shadow-sm border border-border overflow-hidden">
    <UiTableHeader
      :table="table"
      :search-value="filters?.search || ''"
      :search-placeholder="searchPlaceholder"
      :show-search="resolvedConfig.showSearch"
      :show-column-toggle="resolvedConfig.showColumnToggle"
      :show-refresh="resolvedConfig.showRefresh"
      :loading="loading"
      :bulk-actions="features?.bulkActions"
      :selected-count="selectedCount"
      @update:search="handleSearch"
      @refresh="handleRefresh"
      @clear-selection="clearSelection"
    />

    <div class="hidden md:block">
      <UiTableBody
        :table="table"
        :loading="loading"
        :error="error"
        :columns-length="columnCount"
        @refresh="handleRefresh"
      >
        <template #expanded-row="slotData">
          <slot name="expanded-row" v-bind="slotData" />
        </template>
      </UiTableBody>
    </div>

    <UiList
      v-if="resolvedConfig.mobileView === 'list'"
      class="md:hidden"
      :items="tableData"
      :loading="loading"
      :show-footer="false"
      :columns="visibleColumns"
      :row-actions="features?.rowActions"
      @row-action="handleRowAction"
    >
      <template #item="{ item, column }">
        <slot :name="`cell-${column.key}`" :row="item" :value="item[column.key]" :column="column">
          {{ column.formatter ? column.formatter(item[column.key], item) : item[column.key] }}
        </slot>
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
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { computed, h, ref, useSlots, watch } from "vue";
import { valueUpdater } from "@/components/ui/table/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-vue-next";
import { useTableInteractions } from "./composables/useTableInteractions";
import type {
  TableAction,
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

const slots = useSlots();
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
  handlePageChange,
  handlePerPageChange,
  handleRefresh,
  setSortState,
  setColumnVisibility,
} = useTableInteractions(props.tableId, props.columns, props.fetchFn, props.config);

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref<Record<string, boolean>>({});
const expanded = ref<ExpandedState>({});

const data = computed(() => tableData.value ?? []);

const columnCount = computed(() => table.getVisibleLeafColumns().length);

const baseColumns = computed<ColumnDef<any>[]>(() =>
  props.columns.map((column) => ({
    accessorKey: column.key,
    header: ({ column: columnInstance }) =>
      column.sortable === false
        ? column.label
        : h(
            Button,
            {
              variant: "ghost",
              size: "sm",
              class: "-ml-3",
              onClick: () =>
                columnInstance.toggleSorting(columnInstance.getIsSorted() === "asc"),
            },
            () => [column.label, h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
          ),
    cell: ({ row }) => {
      const slot = slots[`cell-${column.key}`];
      if (slot) {
        return slot({
          row: row.original,
          value: row.getValue(column.key),
          column,
        });
      }
      return row.getValue(column.key);
    },
    enableSorting: column.sortable !== false,
    enableHiding: column.visible !== false,
  })),
);

const selectionColumn = computed<ColumnDef<any> | null>(() => {
  if (!selectionConfig.value.enabled) return null;
  return {
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  };
});

const actionColumn = computed<ColumnDef<any> | null>(() => {
  if (!props.features?.rowActions?.length) return null;
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) =>
      h(
        DropdownMenu,
        {},
        {
          default: () => [
            h(
              DropdownMenuTrigger,
              { asChild: true },
              {
                default: () =>
                  h(
                    Button,
                    { variant: "ghost", size: "icon", class: "h-8 w-8 p-0" },
                    () => h(MoreHorizontal, { class: "h-4 w-4" }),
                  ),
              },
            ),
            h(
              DropdownMenuContent,
              { align: "end" },
              () => [
                h(DropdownMenuLabel, {}, () => "Actions"),
                h(DropdownMenuSeparator),
                ...(props.features?.rowActions ?? []).map((action) =>
                  h(
                    DropdownMenuItem,
                    { onClick: () => handleRowAction(action, row.original) },
                    () => [
                      action.icon ? h(action.icon, { class: "mr-2 h-4 w-4" }) : null,
                      action.label,
                    ],
                  ),
                ),
              ],
            ),
          ],
        },
      ),
  };
});

const columns = computed<ColumnDef<any>[]>(() => {
  const list = [...baseColumns.value];
  if (selectionColumn.value) list.unshift(selectionColumn.value);
  if (actionColumn.value) list.push(actionColumn.value);
  return list;
});

const table = useVueTable({
  get data() {
    return data.value;
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  manualSorting: true,
  manualPagination: true,
  manualFiltering: true,
  pageCount: pagination.value?.totalPages ?? -1,
  onSortingChange: (updater) => {
    valueUpdater(updater, sorting);
    const next = sorting.value[0];
    if (!next) {
      setSortState(null, null);
      return;
    }
    setSortState(next.id, next.desc ? "desc" : "asc");
  },
  onColumnFiltersChange: (updater) => valueUpdater(updater, columnFilters),
  onColumnVisibilityChange: (updater) => {
    valueUpdater(updater, columnVisibility);
    Object.entries(columnVisibility.value).forEach(([key, visible]) => {
      setColumnVisibility(key, Boolean(visible));
    });
  },
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
  },
});

const selectedCount = computed(
  () => table.getFilteredSelectedRowModel().rows.length,
);
const selectedRows = computed(() =>
  table.getSelectedRowModel().rows.map((row) => row.original),
);

watch(
  allColumns,
  (columns) => {
    const visibility: VisibilityState = {};
    columns.forEach((column) => {
      visibility[column.key] = column.visible !== false;
    });
    columnVisibility.value = visibility;
  },
  { immediate: true, deep: true },
);

watch(sort, (next) => {
  if (!next?.column) {
    sorting.value = [];
    return;
  }
  sorting.value = [{ id: next.column, desc: next.order === "desc" }];
});

watch(selectedRows, (rows) => {
  selectionConfig.value.onChange?.(rows);
});

function clearSelection() {
  table.resetRowSelection();
}

function handleRowAction(action: TableAction | undefined, row: any) {
  if (!action) return;
  action.onClick(row);
}
</script>
