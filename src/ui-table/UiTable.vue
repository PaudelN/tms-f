<template>
  <div
    class="overflow-hidden rounded-2xl border border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90"
    :class="
      isFullscreen
        ? 'fixed inset-0 z-50 overflow-auto rounded-none border-0 bg-background p-6 transition-all duration-300 ease-out'
        : ''
    "
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-5 py-4"
    >
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative inline-flex items-center" @mouseleave="showInfo = false">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all hover:border-border/70 hover:bg-background hover:text-foreground"
            @mouseenter="showInfo = true"
            @focus="showInfo = true"
            @blur="showInfo = false"
            @click="toggleInfo"
          >
            <Info class="h-4 w-4" />
            <span class="sr-only">Table info</span>
          </button>
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-1 scale-95 opacity-0"
            enter-to-class="translate-y-0 scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="translate-y-0 scale-100 opacity-100"
            leave-to-class="translate-y-1 scale-95 opacity-0"
          >
            <div
              v-if="showInfo"
              class="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-border/70 bg-background p-3 text-xs shadow-lg"
            >
              <p class="font-semibold text-foreground">Table View</p>
              <p class="mt-1 leading-relaxed text-muted-foreground">
                This layout displays your data in a structured and sortable table format.
              </p>
            </div>
          </transition>
        </div>

        <div v-if="selectedRows.length" class="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                type="button"
                variant="header"
                shape="circle"
                size="sm"
                class="h-8 rounded-lg border border-border/70 bg-background px-3 text-xs font-medium shadow-sm"
                :disabled="loading"
              >
                <Layers
                  class="h-4 w-4 transition-transform duration-500"
                  :class="loading ? 'animate-spin' : ''"
                />
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              class="w-52 rounded-xl border border-border/70 bg-background p-1.5 shadow-xl"
            >
              <DropdownMenuLabel class="px-2 py-1.5 text-xs text-muted-foreground"
                >Apply to selected</DropdownMenuLabel
              >
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="action in features?.bulkActions"
                :key="action.label"
                :disabled="action.disabled?.(selectedRows)"
                class="cursor-pointer rounded-md px-2 py-2 text-sm"
                @click="action.onClick(selectedRows)"
              >
                <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div class="flex items-center gap-1 rounded-lg border border-border/70 bg-background px-2 py-1 shadow-sm">
            <Badge variant="default" class="text-xs">
              {{ selectedRows.length }} selected
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7 cursor-pointer rounded-md text-destructive hover:bg-destructive/10"
              @click="table.resetRowSelection()"
            >
              <CircleX class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-background p-1 shadow-sm">
        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                type="button"
                variant="ghost"
                class="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                @click="cycleDensity"
              >
                <component :is="densityIcon" class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="8" class="text-xs font-medium capitalize">
              {{ density }} view
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                type="button"
                variant="ghost"
                class="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                @click="copyRowsAsCSV"
              >
                <component
                  :is="copyDone ? CheckCheck : ClipboardCopy"
                  class="h-4 w-4 transition-all"
                  :class="copyDone ? 'text-primary' : ''"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="8" class="text-xs font-medium">
              {{ copyDone ? "Copied to clipboard!" : "Copy rows as CSV" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                type="button"
                variant="ghost"
                class="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                @click="isFullscreen = !isFullscreen"
              >
                <Minimize v-if="isFullscreen" class="h-4 w-4" />
                <Maximize v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="8" class="text-xs font-medium">
              {{ isFullscreen ? "Exit fullscreen" : "Fullscreen" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Popover v-if="showColumnToggle">
          <PopoverTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              class="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings class="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            class="w-64 rounded-xl border border-border/70 bg-background p-3 shadow-xl"
          >
            <p class="mb-3 text-sm font-semibold text-foreground">Configure Columns</p>
            <div class="max-h-72 space-y-1 overflow-auto pr-1">
              <label
                v-for="column in toggleableColumns"
                :key="column.id"
                class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/70"
              >
                <Checkbox
                  :model-value="column.getIsVisible()"
                  @update:model-value="(value) => column.toggleVisibility(!!value)"
                />
                <span class="truncate">{{ getColumnLabel(column.id) }}</span>
              </label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <Table>
      <TableHeader class="bg-muted/20">
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="border-border/70"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="h-11 border-b border-border/70 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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
          <TableRow class="border-border/60">
            <TableCell :colspan="table.getAllLeafColumns().length" class="h-24 px-4 text-center">
              <div class="flex items-center justify-center gap-2 text-muted-foreground">
                <Spinner class="h-4 w-4" />
                Loading...
              </div>
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="error">
          <TableRow class="border-border/60">
            <TableCell :colspan="table.getAllLeafColumns().length" class="h-24 px-4 text-center">
              <div class="flex flex-col items-center gap-2 text-sm text-destructive">
                <span>{{ error }}</span>
                <Button variant="ghost" size="sm" @click="handleRefresh">Try again</Button>
              </div>
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="table.getRowModel().rows?.length">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <TableRow
              :data-state="row.getIsSelected() && 'selected'"
              class="border-border/60 hover:bg-muted/40"
              :class="{
                'h-9 text-xs [&_td]:px-4 [&_td]:py-1.5': density === 'compact',
                'h-14 [&_td]:px-4 [&_td]:py-4': density === 'comfortable',
                'h-11 [&_td]:px-4 [&_td]:py-2.5': density === 'default',
              }"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="border-b border-border/60 align-middle"
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
            <TableRow v-if="row.getIsExpanded()" class="border-border/60 bg-muted/20">
              <TableCell :colspan="row.getAllCells().length" class="px-4 py-3">
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
            class="h-24 px-4 text-center text-muted-foreground"
          >
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/20 px-5 py-4">
      <div
        v-if="features?.selection && table.getFilteredSelectedRowModel().rows.length > 0"
        class="text-xs font-medium leading-snug tracking-tight text-foreground"
      >
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
  import Badge from "@/components/ui/badge/Badge.vue";
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
    Archive,
    ArrowUpDown,
    CheckCheck,
    CircleX,
    ClipboardCopy,
    Eye,
    GalleryVertical,
    Info,
    Layers,
    Maximize,
    Maximize2,
    Minimize,
    Minimize2,
    MoreHorizontal,
    Pencil,
    Settings,
    Trash2,
  } from "lucide-vue-next";
  import { computed, h, ref, useSlots, watch } from "vue";
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

  const showColumnToggle = computed(
    () => props.config?.showColumnToggle !== false,
  );
  const showInfo = ref(false);

  function toggleInfo() {
    showInfo.value = !showInfo.value;
  }

  const {
    tableData,
    loading,
    error,
    pagination,
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

  watch(
    () => props.externalSearch,
    (val) => {
      if (val !== undefined) handleSearch(val);
    },
  );

  type Density = "default" | "compact" | "comfortable";
  const densities: Density[] = ["default", "compact", "comfortable"];
  const density = ref<Density>("default");
  const densityIcon = computed(() => {
    if (density.value === "compact") return Minimize2;
    if (density.value === "comfortable") return Maximize2;
    return GalleryVertical;
  });

  function cycleDensity() {
    const idx = densities.indexOf(density.value);
    density.value = densities[(idx + 1) % densities.length];
  }

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

  const isFullscreen = ref(false);

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
            class:
              "-ml-1 h-8 rounded-md px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            onClick: () =>
              tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc"),
          },
          () => [column.label, h(ArrowUpDown, { class: "ml-2 h-3.5 w-3.5" })],
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

  const fallbackActionIcons: Record<string, any> = {
    edit: Pencil,
    archive: Archive,
    view: Eye,
    delete: Trash2,
  };

  const actionColumn = computed<ColumnDef<any> | null>(() => {
    if (hasActionColumn.value || !props.features?.rowActions?.length) {
      return null;
    }

    return {
      id: "actions",
      enableHiding: false,
      header: () => h("span", { class: "sr-only" }, "Actions"),
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
                      {
                        variant: "ghost",
                        class:
                          "h-8 w-8 rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-foreground",
                        onClick: (event: MouseEvent) => event.stopPropagation(),
                      },
                      {
                        default: () => [
                          h("span", { class: "sr-only" }, "Open actions menu"),
                          h(MoreHorizontal, { class: "h-4 w-4" }),
                        ],
                      },
                    ),
                },
              ),
              h(
                DropdownMenuContent,
                {
                  align: "end",
                  class:
                    "w-44 rounded-xl border border-border/70 bg-background p-1.5 shadow-xl",
                  onClick: (event: MouseEvent) => event.stopPropagation(),
                },
                {
                  default: () =>
                    props.features?.rowActions?.map((action) => {
                      const actionKey = action.label.toLowerCase();
                      const icon = action.icon ?? fallbackActionIcons[actionKey];
                      const isDelete = actionKey.includes("delete");

                      return h(
                        DropdownMenuItem,
                        {
                          key: action.label,
                          class: `group cursor-pointer rounded-md px-2 py-2 text-sm transition-colors ${
                            isDelete
                              ? "text-destructive focus:bg-destructive/10 focus:text-destructive"
                              : "text-foreground"
                          }`,
                          onClick: (event: Event) => {
                            event.stopPropagation();
                            action.onClick(row.original);
                          },
                        },
                        {
                          default: () => [
                            icon
                              ? h(icon, {
                                  class: `mr-2 h-4 w-4 shrink-0 ${
                                    isDelete
                                      ? "text-destructive/90"
                                      : "text-muted-foreground group-focus:text-foreground"
                                  }`,
                                })
                              : null,
                            h("span", { class: "truncate" }, action.label),
                          ],
                        },
                      );
                    }) ?? [],
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
    if (selectionColumn.value) columns.push(selectionColumn.value);
    columns.push(...baseColumns.value);
    if (actionColumn.value) columns.push(actionColumn.value);
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
    enableHiding: true,
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

  function applyUpdater<T>(updaterOrValue: ((prev: T) => T) | T, state: T): T {
    return typeof updaterOrValue === "function"
      ? (updaterOrValue as (prev: T) => T)(state)
      : updaterOrValue;
  }
</script>
