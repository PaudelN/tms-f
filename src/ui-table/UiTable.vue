<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { createReusableTemplate, useDebounceFn } from "@vueuse/core";
import { ChevronDown, MoreHorizontal, Search, Sparkles } from "lucide-vue-next";
import { computed, h, ref, watch } from "vue";
import type { AcceptableValue, CheckboxCheckedState } from "reka-ui";
import { valueUpdater } from "@/lib/utils";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UiPagination from "./UiPagination.vue";
import type { ApiResponse, BulkAction, TableAction } from "./types/table.types";

interface Props<T> {
  columns: ColumnDef<T, any>[];
  data?: T[];
  fetchFn?: (params: {
    page: number;
    perPage: number;
    search: string;
    sortBy: string | null;
    sortOrder: "asc" | "desc" | null;
  }) => Promise<ApiResponse<T>>;
  searchKey?: string;
  searchPlaceholder?: string;
  pageSizes?: number[];
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  rowActions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  title?: string;
  description?: string;
  showToolbar?: boolean;
  showSearch?: boolean;
  showSelectionSummary?: boolean;
  showPagination?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const props = withDefaults(defineProps<Props<any>>(), {
  data: () => [],
  searchPlaceholder: "Search...",
  pageSizes: () => [5, 10, 20, 50, 100],
  enableRowSelection: true,
  enableColumnVisibility: true,
  rowActions: () => [],
  bulkActions: () => [],
  title: "Data table",
  description: "Browse, filter and manage your records.",
  showToolbar: true,
  showSearch: true,
  showSelectionSummary: true,
  showPagination: true,
  emptyTitle: "No results",
  emptyDescription: "Try changing filters or search keyword.",
});

const tableData = ref<any[]>(props.data ?? []);
const loading = ref(false);
const error = ref<string | null>(null);
const totalItems = ref(0);

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const globalFilter = ref("");
const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: props.pageSizes[0] ?? 10,
});

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{ row: any }>();

const hasRowActions = computed(() => props.rowActions.length > 0);
const hidableColumns = computed(() => table.getAllColumns().filter((column) => column.getCanHide()));
const selectedRows = computed(() => table.getFilteredSelectedRowModel().rows.map((row) => row.original));

const actionColumn = computed<ColumnDef<any> | null>(() => {
  if (!hasRowActions.value) return null;
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => h(ReuseTemplate, { row: row.original }),
  } as ColumnDef<any>;
});

const selectionColumn = computed<ColumnDef<any> | null>(() => {
  if (!props.enableRowSelection) return null;
  return {
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:modelValue": (value: CheckboxCheckedState) =>
          table.toggleAllPageRowsSelected(value === true),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: CheckboxCheckedState) =>
          row.toggleSelected(value === true),
        ariaLabel: "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  } as ColumnDef<any>;
});

const resolvedColumns = computed<ColumnDef<any>[]>(() => {
  const cols = [...props.columns];
  if (selectionColumn.value) cols.unshift(selectionColumn.value);
  if (actionColumn.value) cols.push(actionColumn.value);
  return cols;
});

const table = useVueTable({
  get data() {
    return tableData.value;
  },
  get columns() {
    return resolvedColumns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  manualPagination: Boolean(props.fetchFn),
  manualSorting: Boolean(props.fetchFn),
  manualFiltering: Boolean(props.fetchFn),
  get pageCount() {
    if (!props.fetchFn) return undefined;
    return Math.max(Math.ceil(totalItems.value / pagination.value.pageSize), 1);
  },
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onColumnFiltersChange: (updater) => valueUpdater(updater, columnFilters),
  onColumnVisibilityChange: (updater) => valueUpdater(updater, columnVisibility),
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  onGlobalFilterChange: (updater) => valueUpdater(updater, globalFilter),
  onPaginationChange: (updater) => valueUpdater(updater, pagination),
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
    get globalFilter() {
      return globalFilter.value;
    },
    get pagination() {
      return pagination.value;
    },
  },
});

const searchValue = computed(() => {
  if (props.searchKey) {
    return (table.getColumn(props.searchKey)?.getFilterValue() as string) ?? "";
  }
  return (globalFilter.value as string) ?? "";
});

function updateSearch(value: AcceptableValue) {
  const normalized = String(value ?? "");
  if (props.searchKey) {
    table.getColumn(props.searchKey)?.setFilterValue(normalized);
  } else {
    globalFilter.value = normalized;
    table.setGlobalFilter(normalized);
  }
  table.setPageIndex(0);
}

const fetchInProgress = ref(false);
const lastFetchKey = ref("");

const fetchRemote = async (reason: "search" | "state" = "state") => {
  if (!props.fetchFn) return;

  const sort = sorting.value[0];
  const payload: {
    page: number;
    perPage: number;
    search: string;
    sortBy: string | null;
    sortOrder: "asc" | "desc" | null;
  } = {
    page: pagination.value.pageIndex + 1,
    perPage: pagination.value.pageSize,
    search: searchValue.value,
    sortBy: sort?.id ?? null,
    sortOrder: sort?.desc ? "desc" : sort ? "asc" : null,
  };

  const fetchKey = JSON.stringify(payload);
  if (fetchInProgress.value) return;
  if (reason === "state" && fetchKey === lastFetchKey.value) return;

  fetchInProgress.value = true;
  loading.value = true;
  error.value = null;

  try {
    const response = await props.fetchFn(payload);
    tableData.value = response?.data ?? [];
    totalItems.value = response?.meta?.total ?? 0;
    lastFetchKey.value = fetchKey;
  } catch (err: any) {
    error.value = err?.message ?? "Failed to fetch data";
    tableData.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
    fetchInProgress.value = false;
  }
};

const debouncedFetch = useDebounceFn(fetchRemote, 250);

watch(
  () => props.data,
  (value) => {
    if (!props.fetchFn) {
      tableData.value = value ?? [];
      totalItems.value = value?.length ?? 0;
    }
  },
  { immediate: true },
);

watch(
  [sorting, pagination],
  () => {
    if (props.fetchFn) fetchRemote("state");
  },
  { deep: true, immediate: true },
);

watch(
  () => searchValue.value,
  () => {
    if (props.fetchFn) debouncedFetch("search");
  },
);

const selectedCount = computed(() => table.getFilteredSelectedRowModel().rows.length);
const filteredCount = computed(() => table.getFilteredRowModel().rows.length);

function runBulkAction(action: BulkAction<any>) {
  action.onClick(selectedRows.value);
}

function getRowActions(row: any) {
  return props.rowActions.filter((action) => (action.show ? action.show(row) : true));
}

function toggleColumnVisibility(column: any, checked: CheckboxCheckedState) {
  column.toggleVisibility(checked === true);
}
</script>

<template>
  <DefineTemplate v-slot="{ row }">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="h-8 w-8 p-0">
          <span class="sr-only">Open menu</span>
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>Row actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <slot name="row-actions" :row="row" :actions="getRowActions(row)">
          <DropdownMenuItem
            v-for="action in getRowActions(row)"
            :key="action.label"
            @select.prevent="action.onClick(row)"
          >
            <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
            {{ action.label }}
          </DropdownMenuItem>
        </slot>
      </DropdownMenuContent>
    </DropdownMenu>
  </DefineTemplate>

  <section class="w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
    <div class="border-b border-border/60 bg-gradient-to-r from-muted/50 to-background p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-foreground">{{ title }}</p>
          <p class="text-xs text-muted-foreground">{{ description }}</p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs text-muted-foreground">
          <Sparkles class="h-3.5 w-3.5 text-primary" />
          Advanced table mode
        </div>
      </div>

      <div v-if="showToolbar" class="mt-3 flex flex-wrap items-center gap-3">
        <div v-if="showSearch" class="relative w-full max-w-md">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            class="w-full rounded-lg bg-background pl-9"
            :placeholder="searchPlaceholder"
            :model-value="searchValue"
            @update:model-value="updateSearch"
          />
        </div>

        <slot name="toolbar-actions" :table="table" :selected-rows="selectedRows">
          <DropdownMenu v-if="enableColumnVisibility">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="sm:ml-auto">Columns <ChevronDown class="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-72 max-h-80 overflow-y-auto">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <template v-if="hidableColumns.length">
                <DropdownMenuCheckboxItem
                  v-for="column in hidableColumns"
                  :key="column.id"
                  class="capitalize"
                  :checked="column.getIsVisible()"
                  @update:checked="toggleColumnVisibility(column, $event)"
                >
                  {{ column.columnDef.header && typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id }}
                </DropdownMenuCheckboxItem>
              </template>
              <DropdownMenuItem v-else disabled>No configurable columns</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu v-if="bulkActions.length && selectedCount">
            <DropdownMenuTrigger as-child>
              <Button variant="outline">Bulk actions <ChevronDown class="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>Apply to selection</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="action in bulkActions"
                :key="action.label"
                :disabled="action.disabled?.(selectedRows)"
                @select.prevent="runBulkAction(action)"
              >
                <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </slot>
      </div>
    </div>

    <div class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="bg-muted/40">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow>
              <TableCell :colspan="resolvedColumns.length" class="h-24 text-center text-muted-foreground">Loading...</TableCell>
            </TableRow>
          </template>
          <template v-else-if="error">
            <TableRow>
              <TableCell :colspan="resolvedColumns.length" class="h-24 text-center text-destructive">{{ error }}</TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="hover:bg-muted/30"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="py-3 align-middle">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="resolvedColumns.length" class="h-28 text-center">
              <p class="text-sm font-medium text-foreground">{{ emptyTitle }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ emptyDescription }}</p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <footer v-if="showPagination" class="border-t border-border/60 p-3">
      <div v-if="showSelectionSummary" class="mb-2 text-sm text-muted-foreground">
        {{ selectedCount }} of {{ filteredCount }} row(s) selected.
      </div>
      <UiPagination
        :current-page="table.getState().pagination.pageIndex + 1"
        :total-pages="table.getPageCount()"
        :total="props.fetchFn ? totalItems : filteredCount"
        :per-page="table.getState().pagination.pageSize"
        :page-sizes="pageSizes"
        @page-change="(page) => table.setPageIndex(page - 1)"
        @per-page-change="(size) => table.setPageSize(size)"
      />
    </footer>
  </section>
</template>
