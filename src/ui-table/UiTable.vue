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
import { ChevronDown, MoreHorizontal } from "lucide-vue-next";
import { computed, h, ref, watch } from "vue";
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
}

const props = withDefaults(defineProps<Props<any>>(), {
  data: () => [],
  searchPlaceholder: "Search...",
  pageSizes: () => [5, 10, 20, 50, 100],
  enableRowSelection: true,
  enableColumnVisibility: true,
  rowActions: () => [],
  bulkActions: () => [],
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

const actionColumn = computed<ColumnDef<any> | null>(() => {
  if (!props.rowActions.length) return null;
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) =>
      h(ReuseTemplate, {
        row: row.original,
      }),
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
        "onUpdate:modelValue": (value: boolean) =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean) =>
          row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  } as ColumnDef<any>;
});

const resolvedColumns = computed<ColumnDef<any>[]>(() => {
  const cols = [...props.columns];
  if (selectionColumn.value) {
    cols.unshift(selectionColumn.value);
  }
  if (actionColumn.value) {
    cols.push(actionColumn.value);
  }
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

function updateSearch(value: string) {
  if (props.searchKey) {
    table.getColumn(props.searchKey)?.setFilterValue(value);
  } else {
    globalFilter.value = value;
    table.setGlobalFilter(value);
  }
  table.setPageIndex(0);
}

const fetchRemote = async () => {
  if (!props.fetchFn) return;
  loading.value = true;
  error.value = null;
  try {
    const sort = sorting.value[0];
    const response = await props.fetchFn({
      page: pagination.value.pageIndex + 1,
      perPage: pagination.value.pageSize,
      search: searchValue.value,
      sortBy: sort?.id ?? null,
      sortOrder: sort?.desc ? "desc" : sort ? "asc" : null,
    });
    tableData.value = response?.data ?? [];
    totalItems.value = response?.meta?.total ?? 0;
    if (props.fetchFn) {
      table.setPageCount(Math.max(Math.ceil(totalItems.value / pagination.value.pageSize), 1));
    }
  } catch (err: any) {
    error.value = err?.message ?? "Failed to fetch data";
    tableData.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = useDebounceFn(fetchRemote, 300);

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
    if (props.fetchFn) {
      fetchRemote();
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => searchValue.value,
  () => {
    if (props.fetchFn) {
      debouncedFetch();
    }
  },
);

const selectedCount = computed(
  () => table.getFilteredSelectedRowModel().rows.length,
);

const filteredCount = computed(
  () => table.getFilteredRowModel().rows.length,
);

function runBulkAction(action: BulkAction<any>) {
  action.onClick(table.getFilteredSelectedRowModel().rows.map((row) => row.original));
}

function getRowActions(row: any) {
  return props.rowActions.filter((action) => (action.show ? action.show(row) : true));
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
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          v-for="action in getRowActions(row)"
          :key="action.label"
          @click="action.onClick(row)"
        >
          <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
          {{ action.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </DefineTemplate>

  <div class="w-full space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <Input
        class="max-w-sm"
        :placeholder="searchPlaceholder"
        :model-value="searchValue"
        @update:model-value="updateSearch"
      />

      <DropdownMenu v-if="enableColumnVisibility">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
            Columns <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table
              .getAllColumns()
              .filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="(value) => column.toggleVisibility(!!value)"
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu v-if="bulkActions.length && selectedCount">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
            Bulk actions <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Apply to selection</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-for="action in bulkActions"
            :key="action.label"
            :disabled="action.disabled?.(table.getFilteredSelectedRowModel().rows.map((row) => row.original))"
            @click="runBulkAction(action)"
          >
            <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
            {{ action.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
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
              <TableCell :colspan="resolvedColumns.length" class="h-24 text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="error">
            <TableRow>
              <TableCell :colspan="resolvedColumns.length" class="h-24 text-center text-destructive">
                {{ error }}
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="resolvedColumns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-muted-foreground">
        {{ selectedCount }} of {{ filteredCount }} row(s) selected.
      </div>
      <div class="flex items-center gap-3">
        <UiPagination
          :current-page="table.getState().pagination.pageIndex + 1"
          :total-pages="table.getPageCount()"
          :total="props.fetchFn ? totalItems : filteredCount"
          :per-page="table.getState().pagination.pageSize"
          :page-sizes="pageSizes"
          @page-change="(page) => table.setPageIndex(page - 1)"
          @per-page-change="(size) => table.setPageSize(size)"
        />
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
