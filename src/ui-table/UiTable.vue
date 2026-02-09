<template>
  <div class="bg-card text-muted-foreground rounded-lg shadow-sm border border-border overflow-hidden">
    <div class="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      <Input
        v-if="resolvedConfig.showSearch"
        class="max-w-sm"
        :placeholder="searchPlaceholder"
        :model-value="filters?.search || ''"
        @update:model-value="handleSearch"
      />

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <div v-if="features?.bulkActions?.length" class="flex items-center gap-2">
          <Badge v-if="selectedCount" variant="secondary" class="text-xs">
            {{ selectedCount }} selected
          </Badge>
          <DropdownMenu>
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
          <Button variant="ghost" size="sm" class="text-muted-foreground" @click="clearSelection">
            Clear
          </Button>
        </div>

        <Button
          v-if="resolvedConfig.showRefresh"
          variant="outline"
          size="sm"
          class="gap-2"
          :disabled="loading"
          @click="handleRefresh"
        >
          <RefreshCcw :class="['h-4 w-4', loading && 'animate-spin']" />
          Refresh
        </Button>

        <DropdownMenu v-if="resolvedConfig.showColumnToggle">
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
              @update:model-value="(value) => handleColumnVisibility(column.id, value)"
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="hidden md:block">
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableHead v-for="header in headerGroup.headers" :key="header.id">
                <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() && 'selected'"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </template>

            <TableRow v-else>
              <TableCell :colspan="table.getAllLeafColumns().length" class="h-24 text-center text-muted-foreground">
                <template v-if="loading">Loading...</template>
                <template v-else-if="error">{{ error }}</template>
                <template v-else>No results.</template>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div class="text-xs text-muted-foreground">
          {{ selectedCount }} of {{ pagination?.total || tableData.length }} row(s) selected.
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div v-if="pagination" class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Per page</span>
            <Select
              :model-value="String(pagination.perPage)"
              @update:model-value="(value) => handlePerPageChange(Number(value))"
            >
              <SelectTrigger class="h-8 w-[90px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">
                  {{ size }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="!canPrevious"
            @click="handlePageChange((pagination?.currentPage || 1) - 1)"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!canNext"
            @click="handlePageChange((pagination?.currentPage || 1) + 1)"
          >
            Next
          </Button>
        </div>
      </div>
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
            <div v-if="features?.selection?.enabled" class="flex items-center gap-2">
              <Checkbox
                :checked="table.getState().rowSelection[`${item[selectionRowKey]}`] || false"
                @update:model-value="(value) => toggleRowSelection(item, Boolean(value))"
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
  </div>
</template>

<script setup lang="ts">
import type { ColumnDef, RowSelectionState, SortingState, VisibilityState } from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { computed, h, ref, useSlots, watch } from "vue";
import { ArrowUpDown, ChevronDown, Layers, MoreHorizontal, RefreshCcw } from "lucide-vue-next";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableInteractions } from "./composables/useTableInteractions";
import type { TableColumn, TableConfig, TableFeatures, TableFetchFn } from "./types/table.types";
import UiList from "./UiList.vue";

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

const selectionRowKey = computed(() => props.features?.selection?.rowKey || "id");

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
  setColumnVisibility,
  handleRefresh,
} = useTableInteractions(
  props.tableId,
  props.columns,
  props.fetchFn,
  props.config,
);

const sortingState = computed<SortingState>(() => {
  if (!sort.value?.column || !sort.value?.order) return [];
  return [{ id: sort.value.column, desc: sort.value.order === "desc" }];
});

const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref<RowSelectionState>({});
const pageSizes = computed(() => props.config?.pageSizes || [5, 10, 20, 50, 100]);

watch(
  allColumns,
  (columns) => {
    const visibility: VisibilityState = {};
    columns.forEach((column) => {
      visibility[column.key] = column.visible !== false;
    });
    columnVisibility.value = visibility;
  },
  { immediate: true },
);

const columnDefs = computed<ColumnDef<any>[]>(() => {
  const baseColumns: ColumnDef<any>[] = visibleColumns.value.map((column) => ({
    accessorKey: column.key,
    header: ({ column: columnInstance }) => {
      if (column.sortable === false) return column.label;
      return h(
        Button,
        {
          variant: "ghost",
          class: "-ml-2 gap-2",
          onClick: () => {
            columnInstance.toggleSorting(columnInstance.getIsSorted() === "asc");
          },
        },
        () => [column.label, h(ArrowUpDown, { class: "h-4 w-4" })],
      );
    },
    cell: (ctx) => {
      const row = ctx.row.original;
      const value = ctx.getValue();
      const slotName = `cell-${column.key}`;
      if (slots[slotName]) {
        return slots[slotName]?.({ row, value, column });
      }
      return column.formatter ? column.formatter(value, row) : value;
    },
  }));

  if (featuresSelectionEnabled.value) {
    baseColumns.unshift({
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
          "onUpdate:modelValue": (value: boolean) => row.toggleSelected(!!value),
          ariaLabel: "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
    });
  }

  if (hasActionsColumn.value) {
    baseColumns.push({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const slot = slots["cell-actions"];
        if (slot) {
          return slot({ row: row.original });
        }
        if (!props.features?.rowActions?.length) return null;
        return h(
          DropdownMenu,
          {},
          {
            default: () =>
              h(
                DropdownMenuTrigger,
                { asChild: true },
                {
                  default: () =>
                    h(
                      Button,
                      { variant: "ghost", class: "h-8 w-8 p-0" },
                      () => [h("span", { class: "sr-only" }, "Open menu"), h(MoreHorizontal, { class: "h-4 w-4" })],
                    ),
                },
              ),
            content: () =>
              h(
                DropdownMenuContent,
                { align: "end" },
                {
                  default: () =>
                    props.features?.rowActions?.map((action) =>
                      h(
                        DropdownMenuItem,
                        { onClick: () => action.onClick(row.original) },
                        {
                          default: () => [
                            action.icon ? h(action.icon, { class: "mr-2 h-4 w-4" }) : null,
                            action.label,
                          ],
                        },
                      ),
                    ),
                },
              ),
          },
        );
      },
    });
  }

  return baseColumns;
});

const table = useVueTable({
  data: tableData.value,
  columns: columnDefs,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getRowId: (row) => `${row[selectionRowKey.value] ?? row.id ?? row.key ?? row.name ?? ''}`,
  onSortingChange: (updater) => {
    const next = typeof updater === "function" ? updater(sortingState.value) : updater;
    const nextSort = next[0];
    if (nextSort?.id) {
      handleSort(nextSort.id);
    } else if (sort.value?.column) {
      handleSort(sort.value.column);
    }
  },
  onColumnVisibilityChange: (updater) => {
    const next = typeof updater === "function" ? updater(columnVisibility.value) : updater;
    columnVisibility.value = next;
    Object.entries(next).forEach(([key, value]) => {
      if (key !== "select" && key !== "actions") {
        setColumnVisibility(key, Boolean(value));
      }
    });
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === "function" ? updater(rowSelection.value) : updater;
  },
  manualPagination: true,
  manualSorting: true,
  state: {
    get sorting() {
      return sortingState.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
});

watch(tableData, (next) => {
  table.setOptions((prev) => ({ ...prev, data: next }));
});

const featuresSelectionEnabled = computed(() => Boolean(props.features?.selection?.enabled));
const hasExplicitActionsColumn = computed(() => props.columns.some((column) => column.key === "actions"));
const hasActionsColumn = computed(
  () =>
    !hasExplicitActionsColumn.value &&
    (Boolean(slots["cell-actions"]) || Boolean(props.features?.rowActions?.length)),
);

const selectedRows = computed(() => table.getSelectedRowModel().rows.map((row) => row.original));
const selectedCount = computed(() => table.getSelectedRowModel().rows.length);
const canNext = computed(() => (pagination.value ? pagination.value.currentPage < pagination.value.totalPages : false));
const canPrevious = computed(() => (pagination.value ? pagination.value.currentPage > 1 : false));

function clearSelection() {
  table.resetRowSelection();
}

function visibleRowActions(row: Record<string, any>) {
  return (
    props.features?.rowActions?.filter((action) => (action.show ? action.show(row) : true)) || []
  );
}

function toggleRowSelection(row: Record<string, any>, value: boolean) {
  const rowId = `${row[selectionRowKey.value]}`;
  rowSelection.value = { ...rowSelection.value, [rowId]: value };
}

function handleColumnVisibility(columnId: string, value: boolean | "indeterminate") {
  const isVisible = Boolean(value);
  if (columnId !== "select" && columnId !== "actions") {
    setColumnVisibility(columnId, isVisible);
  }
  columnVisibility.value = { ...columnVisibility.value, [columnId]: isVisible };
}
</script>
