<template>
  <div
    class="bg-card text-muted-foreground rounded-sm shadow-sm overflow-hidden"
    :class="isFullscreen ? 'fixed inset-0 z-50 !rounded-none overflow-auto' : ''"
  >
    <div class="px-5 py-3">
      <div class="flex flex-wrap items-center justify-between">

        <!-- ── Left: bulk selection (unchanged from original) ── -->
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
                  <component
                    v-if="action.icon"
                    :is="action.icon"
                    class="mr-2 h-4 w-4"
                  />
                  {{ action.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              class="text-muted-foreground"
              @click="table.resetRowSelection()"
            >
              Clear
            </Button>
          </div>
        </div>

        <!-- ── Right: 3 NEW buttons + existing column toggle + more options ── -->
        <div class="flex flex-wrap items-center gap-2">

          <!-- NEW BUTTON 1: Row density toggle -->
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="cycleDensity"
                >
                  <component :is="densityIcon" class="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium capitalize">
                Row density: {{ density }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <!-- NEW BUTTON 2: Copy visible rows as CSV to clipboard -->
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="copyRowsAsCSV"
                >
                  <component
                    :is="copyDone ? CheckCheck : ClipboardCopy"
                    class="h-4 w-4 transition-all"
                    :class="copyDone ? 'text-green-500' : ''"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                {{ copyDone ? 'Copied to clipboard!' : 'Copy rows as CSV' }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <!-- NEW BUTTON 3: Fullscreen toggle -->
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="isFullscreen = !isFullscreen"
                >
                  <Minimize2 v-if="isFullscreen" class="h-4 w-4" />
                  <Maximize2 v-else class="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                {{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <!-- EXISTING: Column toggle (unchanged) -->
          <Popover v-if="showColumnToggle">
            <PopoverTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                title="Columns"
              >
                <Columns3 class="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" class="w-52 p-3">
              <p class="mb-2 text-sm font-medium text-foreground">Columns</p>
              <div class="space-y-2">
                <label
                  v-for="column in toggleableColumns"
                  :key="column.id"
                  class="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    :model-value="column.getIsVisible()"
                    @update:model-value="
                      (value) => column.toggleVisibility(!!value)
                    "
                  />
                  <span>{{ getColumnLabel(column.id) }}</span>
                </label>
              </div>
            </PopoverContent>
          </Popover>

          <!-- EXISTING: More options (unchanged) -->
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            title="More options"
          >
            <MoreVertical class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- ── Table (100% unchanged) ── -->
    <div class="">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
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
              <TableCell
                :colspan="table.getAllLeafColumns().length"
                class="h-24 text-center"
              >
                <div class="flex items-center justify-center gap-2">
                  <Spinner class="h-4 w-4" />
                  Loading...
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="error">
            <TableRow>
              <TableCell
                :colspan="table.getAllLeafColumns().length"
                class="h-24 text-center"
              >
                <div
                  class="flex flex-col items-center gap-2 text-sm text-destructive"
                >
                  <span>{{ error }}</span>
                  <Button variant="ghost" size="sm" @click="handleRefresh"
                    >Try again</Button
                  >
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow
                :data-state="row.getIsSelected() && 'selected'"
                :class="{
                  'h-7 text-xs [&_td]:py-1 [&_td]:px-3': density === 'compact',
                  'h-16 [&_td]:py-4': density === 'comfortable',
                }"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
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
            <TableCell
              :colspan="table.getAllLeafColumns().length"
              class="h-24 text-center text-muted-foreground"
            >
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- ── Footer (100% unchanged) ── -->
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
import { Badge } from "@/components/ui/badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UiPagination from "@/ui-table/UiPagination.vue";
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
import {
  AlignJustify,
  ArrowUpDown,
  CheckCheck,
  ClipboardCopy,
  Columns3,
  Layers,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  MoreVertical,
  Rows3,
  StretchVertical,
} from "lucide-vue-next";
import { computed, h, ref, useSlots, watch } from "vue";
import { useTableInteractions } from "./composables/useTableInteractions";
import type {
  TableColumn,
  TableConfig,
  TableFeatures,
  TableFetchFn,
} from "./types/table.types";

// ── Props (externalSearch added; all original props preserved) ──────────────
interface Props {
  tableId: string;
  columns: TableColumn[];
  fetchFn: TableFetchFn;
  config?: TableConfig;
  features?: TableFeatures;
  searchPlaceholder?: string;
  showRefresh?: boolean;
  /** Driven by UiHeader's universal search via useUniversalInteractions */
  externalSearch?: string;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  searchPlaceholder: "Search...",
  showRefresh: true,
});

defineEmits<{
  export: [];
  "add-item": [];
  filter: [];
}>();

const slots = useSlots();

// ── Column toggle (unchanged) ───────────────────────────────────────────────
const showColumnToggle = computed(
  () => props.config?.showColumnToggle !== false,
);

// ── Table interactions (unchanged — still owns pagination/sort/data fetching) ─
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

// ── Sync externalSearch → handleSearch (bridge from UiHeader universal search) ─
watch(
  () => props.externalSearch,
  (val) => {
    if (val !== undefined) handleSearch(val);
  },
);

// ── NEW: Row density ────────────────────────────────────────────────────────
type Density = "default" | "compact" | "comfortable";
const densities: Density[] = ["default", "compact", "comfortable"];
const density = ref<Density>("default");
const densityIcon = computed(() => {
  if (density.value === "compact") return Rows3;
  if (density.value === "comfortable") return StretchVertical;
  return AlignJustify;
});
function cycleDensity() {
  const idx = densities.indexOf(density.value);
  density.value = densities[(idx + 1) % densities.length];
}

// ── NEW: Copy rows as CSV ───────────────────────────────────────────────────
const copyDone = ref(false);
function copyRowsAsCSV() {
  const rows = table.getFilteredRowModel().rows;
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== "select" && col.id !== "actions");

  const header = visibleCols.map((col) => col.id).join(",");
  const body = rows
    .map((row) =>
      visibleCols
        .map((col) => {
          const val = row.getValue(col.id);
          const str = val != null ? String(val) : "";
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(","),
    )
    .join("\n");

  navigator.clipboard.writeText(`${header}\n${body}`).then(() => {
    copyDone.value = true;
    setTimeout(() => (copyDone.value = false), 2000);
  });
}

// ── NEW: Fullscreen ─────────────────────────────────────────────────────────
const isFullscreen = ref(false);

// ── tanstack-table state (unchanged) ───────────────────────────────────────
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

// ── Column defs (unchanged) ─────────────────────────────────────────────────
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
          onClick: () =>
            tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc"),
        },
        () => [column.label, h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row, getValue }) => {
      const slot = slots[`cell-${column.key}`];
      if (slot) {
        return slot({ row: row.original, value: getValue(), column });
      }
      if (column.formatter) {
        return column.formatter(getValue(), row.original);
      }
      return getValue() ?? "-";
    },
    enableSorting: column.sortable !== false,
    enableHiding: true,
  }));
});

const toggleableColumns = computed(() =>
  table.getAllColumns().filter((column) => column.getCanHide()),
);

function getColumnLabel(columnId: string) {
  return (
    props.columns.find((column) => column.key === columnId)?.label ?? columnId
  );
}

const selectionEnabled = computed(() =>
  Boolean(props.features?.selection?.enabled),
);
const hasActionColumn = computed(() =>
  props.columns.some((column) => column.key === "actions"),
);

defineExpose({ refresh: handleRefresh });

// ── Action column (unchanged) ───────────────────────────────────────────────
const actionColumn = computed<ColumnDef<any> | null>(() => {
  if (hasActionColumn.value || !props.features?.rowActions?.length) return null;
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) =>
      h(DropdownMenu, {}, {
        default: () => [
          h(DropdownMenuTrigger, { asChild: true }, {
            default: () =>
              h(Button, { variant: "ghost", class: "h-8 w-8 p-0" }, {
                default: () => [
                  h("span", { class: "sr-only" }, "Open menu"),
                  h(MoreHorizontal, { class: "h-4 w-4" }),
                ],
              }),
          }),
          h(DropdownMenuContent, { align: "end" }, {
            default: () =>
              props.features?.rowActions?.map((action) =>
                h(DropdownMenuItem, {
                  key: action.label,
                  onClick: () => action.onClick(row.original),
                }, {
                  default: () => [
                    action.icon ? h(action.icon, { class: "mr-2 h-4 w-4" }) : null,
                    action.label,
                  ],
                }),
              ) ?? [],
          }),
        ],
      }),
  };
});

// ── Selection column (unchanged) ────────────────────────────────────────────
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
  if (selectionColumn.value) columns.push(selectionColumn.value);
  columns.push(...baseColumns.value);
  if (actionColumn.value) columns.push(actionColumn.value);
  return columns;
});

// ── useVueTable (unchanged) ─────────────────────────────────────────────────
const table = useVueTable({
  get data() { return tableData.value ?? []; },
  get columns() { return tableColumns.value; },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  manualSorting: true,
  manualPagination: true,
  manualFiltering: true,
  enableHiding: true,
  onSortingChange: (updater) => {
    const next = applyUpdater(updater, sorting.value);
    sorting.value = next;
    if (next.length === 0) { handleSortingChange(null, null); return; }
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
    get sorting() { return sorting.value; },
    get columnFilters() { return columnFilters.value; },
    get columnVisibility() { return columnVisibility.value; },
    get rowSelection() { return rowSelection.value; },
    get expanded() { return expanded.value; },
  },
});

const selectedRows = computed(() =>
  table.getFilteredSelectedRowModel().rows.map((row) => row.original),
);

function applyUpdater<T>(updaterOrValue: ((prev: T) => T) | T, state: T): T {
  return typeof updaterOrValue === "function"
    ? (updaterOrValue as (prev: T) => T)(state)
    : updaterOrValue;
}
</script>