<template>
  <div class="bg-card text-muted-foreground rounded-lg shadow-sm border border-border overflow-hidden">
    <div class="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
      <div v-if="showSearch" class="flex-1 min-w-[220px]">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            :model-value="filters?.search || ''"
            :placeholder="searchPlaceholder"
            class="w-full pl-10"
            @update:model-value="handleSearch"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div v-if="selectedRows.length" class="flex items-center gap-2">
          <Badge variant="secondary" class="text-xs">
            {{ selectedRows.length }} selected
          </Badge>
          <DropdownMenu v-if="features?.bulkActions?.length">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="gap-2">
                <Layers class="h-4 w-4" />
                Bulk actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuLabel>Apply to selected</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="action in features.bulkActions"
                :key="action.label"
                :disabled="action.disabled?.(selectedRows)"
                @click="action.onClick(selectedRows)"
              >
                <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" class="text-muted-foreground" @click="table.resetRowSelection()">
            Clear
          </Button>
        </div>

        <Button
          v-if="showRefresh"
          variant="outline"
          size="sm"
          class="gap-2"
          :disabled="loading"
          @click="handleRefresh"
        >
          <RefreshCcw :class="['h-4 w-4', loading && 'animate-spin']" />
          Refresh
        </Button>

        <DropdownMenu v-if="showColumnToggle">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="gap-2">
              Columns <ChevronDown class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
              :key="column.id"
              class="capitalize"
              :model-value="column.getIsVisible()"
              @update:model-value="(value) => column.toggleVisibility(!!value)"
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow>
              <TableCell :colspan="table.getAllLeafColumns().length" class="h-24 text-center">
                <div class="flex items-center justify-center gap-2">
                  <Spinner class="h-4 w-4" />
                  Loading...
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="error">
            <TableRow>
              <TableCell :colspan="table.getAllLeafColumns().length" class="h-24 text-center">
                <div class="flex flex-col items-center gap-2 text-sm text-destructive">
                  <span>{{ error }}</span>
                  <Button variant="ghost" size="sm" @click="handleRefresh">Try again</Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
              <TableRow v-if="row.getIsExpanded()">
                <TableCell :colspan="row.getAllCells().length">
                  <slot name="expanded" :row="row.original">
                    {{ JSON.stringify(row.original) }}
                  </slot>
                </TableCell>
              </TableRow>
            </template>
          </template>
          <TableRow v-else>
            <TableCell :colspan="table.getAllLeafColumns().length" class="h-24 text-center text-muted-foreground">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
      <div class="text-sm text-muted-foreground">
        {{ table.getFilteredSelectedRowModel().rows.length }} of
        {{ table.getFilteredRowModel().rows.length }} row(s) selected.
      </div>
      <div class="ml-auto">
        <UiPagination
          v-if="pagination"
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total="pagination.total"
          :per-page="pagination.perPage"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { computed, h, ref, useSlots, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import UiPagination from "@/ui-table/UiPagination.vue";
import {
  ArrowUpDown,
  ChevronDown,
  Layers,
  MoreHorizontal,
  RefreshCcw,
  Search,
} from "lucide-vue-next";
import { useTableInteractions } from "./composables/useTableInteractions";
import type {
  TableColumn,
  TableConfig,
  TableFeatures,
  TableFetchFn,
} from "./types/table.types";

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

const showSearch = computed(() => props.config?.showSearch !== false);
const showColumnToggle = computed(() => props.config?.showColumnToggle !== false);

const {
  tableData,
  loading,
  error,
  pagination,
  filters,
  sort,
  handleSearch,
  handlePageChange,
  handlePerPageChange,
  handleRefresh,
  handleSortingChange,
  setColumnVisibility,
} = useTableInteractions(
  props.tableId,
  props.columns,
  props.fetchFn,
  props.config,
);

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const initialVisibility = computed(() =>
  Object.fromEntries(
    props.columns.map((column) => [column.key, column.visible !== false]),
  ),
);

watch(
  initialVisibility,
  (value) => {
    columnVisibility.value = value;
  },
  { immediate: true },
);

watch(
  () => columnVisibility.value,
  (value) => {
    Object.entries(value).forEach(([key, visible]) => {
      setColumnVisibility(key, Boolean(visible));
    });
  },
  { deep: true },
);

watch(
  () => sort.value,
  (value) => {
    if (!value?.column || !value.order) {
      sorting.value = [];
      return;
    }
    sorting.value = [{ id: value.column, desc: value.order === "desc" }];
  },
  { immediate: true },
);

const baseColumns = computed<ColumnDef<any>[]>(() => {
  return props.columns.map((column) => ({
    id: column.key,
    accessorKey: column.key,
    header: ({ column: tableColumn }) => {
      if (column.sortable === false) {
        return column.label;
      }
      return h(
        Button,
        {
          variant: "ghost",
          class: "px-0",
          onClick: () => tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc"),
        },
        () => [
          column.label,
          h(ArrowUpDown, { class: "ml-2 h-4 w-4" }),
        ],
      );
    },
    cell: ({ row, getValue }) => {
      const slot = slots[`cell-${column.key}`];
      if (slot) {
        return slot({
          row: row.original,
          value: getValue(),
          column,
        });
      }
      if (column.formatter) {
        return column.formatter(getValue(), row.original);
      }
      return getValue() ?? "-";
    },
    enableSorting: column.sortable !== false,
    enableHiding: column.visible !== false,
  }));
});

const selectionEnabled = computed(() => Boolean(props.features?.selection?.enabled));
const hasActionColumn = computed(() =>
  props.columns.some((column) => column.key === "actions"),
);

const actionColumn = computed<ColumnDef<any> | null>(() => {
  if (hasActionColumn.value || !props.features?.rowActions?.length) return null;
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
                    { variant: "ghost", class: "h-8 w-8 p-0" },
                    {
                      default: () => [
                        h("span", { class: "sr-only" }, "Open menu"),
                        h(MoreHorizontal, { class: "h-4 w-4" }),
                      ],
                    },
                  ),
              },
            ),
            h(
              DropdownMenuContent,
              { align: "end" },
              {
                default: () =>
                  props.features?.rowActions?.map((action) =>
                    h(
                      DropdownMenuItem,
                      {
                        key: action.label,
                        onClick: () => action.onClick(row.original),
                      },
                      {
                        default: () => [
                          action.icon
                            ? h(action.icon, { class: "mr-2 h-4 w-4" })
                            : null,
                          action.label,
                        ],
                      },
                    ),
                  ) ?? [],
              },
            ),
          ],
        },
      ),
  };
});

const selectionColumn = computed<ColumnDef<any> | null>(() => {
  if (!selectionEnabled.value) return null;
  return {
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:modelValue": (value) =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  };
});

const tableColumns = computed<ColumnDef<any>[]>(() => {
  const columns: ColumnDef<any>[] = [];
  if (selectionColumn.value) {
    columns.push(selectionColumn.value);
  }
  columns.push(...baseColumns.value);
  if (actionColumn.value) {
    columns.push(actionColumn.value);
  }
  return columns;
});

const table = useVueTable({
  get data() {
    return tableData.value ?? [];
  },
  get columns() {
    return tableColumns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  manualSorting: true,
  manualPagination: true,
  manualFiltering: true,
  onSortingChange: (updater) => {
    const next = applyUpdater(updater, sorting.value);
    sorting.value = next;
    if (next.length === 0) {
      handleSortingChange(null, null);
      return;
    }
    const first = next[0];
    handleSortingChange(first.id, first.desc ? "desc" : "asc");
  },
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value = applyUpdater(updater, columnVisibility.value);
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = applyUpdater(updater, rowSelection.value);
  },
  onExpandedChange: (updater) => {
    expanded.value = applyUpdater(updater, expanded.value);
  },
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

const selectedRows = computed(() =>
  table.getFilteredSelectedRowModel().rows.map((row) => row.original),
);

function applyUpdater<T>(
  updaterOrValue: ((prev: T) => T) | T,
  state: T,
): T {
  return typeof updaterOrValue === "function"
    ? updaterOrValue(state)
    : updaterOrValue;
}
</script>
