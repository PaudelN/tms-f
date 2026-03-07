<template>
  <div
    class="rounded-sm overflow-hidden border border-border bg-card transition-all duration-300 flex flex-col max-h-full"
    :class="
      isFullscreen
        ? 'fixed inset-0 z-50 h-screen flex flex-col rounded-none overflow-hidden bg-background p-20'
        : ''
    "
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-primary-20"
    >
      <div class="flex items-center gap-3">
        <div class="relative group/info">
          <Info class="h-3.5 w-3.5 text-primary cursor-pointer shrink-0" />
          <div
            class="absolute top-full left-0 mt-2 w-64 z-50 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible pointer-events-none transition-all duration-200"
          >
            <div
              class="rounded-xl border border-border bg-popover shadow-2xl p-4 text-xs"
            >
              <div class="flex items-center gap-2 mb-3">
                <span class="font-medium text-primary text-xs">Table View</span>
              </div>
              <p class="text-muted-foreground leading-relaxed text-xs mb-3">
                Structured tabular display with full sorting, filtering, column
                control and bulk operations.
              </p>
            </div>
          </div>
        </div>

        <div v-if="selectedRows.length" class="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                size="sm"
                :disabled="loading"
                class="h-8 px-3 text-xs cursor-pointer font-semibold gap-2 rounded-sm border-primary text-primary bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-150"
              >
                <Layers
                  class="h-3.5 w-3.5 shrink-0"
                  :class="loading ? 'animate-spin' : ''"
                />
                Bulk Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              class="w-52 rounded-xl border border-border shadow-xl p-1.5"
            >
              <DropdownMenuLabel
                class="text-xs font-bold tracking-widest uppercase text-muted-foreground px-2 py-1.5"
              >
                Apply to {{ selectedRows.length }} selected
              </DropdownMenuLabel>
              <DropdownMenuSeparator class="my-1" />
              <DropdownMenuItem
                v-for="action in features?.bulkActions"
                :key="action.label"
                :disabled="action.disabled?.(selectedRows)"
                @click="action.onClick(selectedRows)"
                class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer"
              >
                <component
                  v-if="action.icon"
                  :is="action.icon"
                  class="h-4 w-4 shrink-0"
                />
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div class="flex items-center gap-1.5">
            <Button
              type="button"
              variant="header"
              size="xs"
              shape="circle"
              class="rounded-[9999px] cursor-pointer text-white bg-red-400 p-0 h-4 w-4 hover:bg-red-500 focus:bg-red-500"
              @click="table.resetRowSelection()"
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Right controls -->
      <div class="flex items-center gap-1.5">
        <!-- Density -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary hover:text-primary hover:bg-secondary"
                @click="cycleDensity"
              >
                <component :is="densityIcon" class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg capitalize"
            >
              {{ density }} view
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Copy CSV -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary transition-all duration-200"
                @click="copyRowsAsCSV"
              >
                <CheckCheck v-if="copyDone" class="h-4 w-4" />
                <Copy v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg"
            >
              {{ copyDone ? "Copied!" : "Copy as CSV" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Fullscreen -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary transition-all duration-200"
                @click="isFullscreen = !isFullscreen"
              >
                <Minimize v-if="isFullscreen" class="h-4 w-4" />
                <Maximize v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg"
            >
              {{ isFullscreen ? "Exit fullscreen" : "Fullscreen" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Divider -->
        <div class="w-px h-5 bg-border shrink-0 mx-1"></div>

        <!-- Column visibility -->
        <Popover v-if="showColumnToggle">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              :disabled="loading"
              class="h-8 px-3 text-xs cursor-pointer font-semibold gap-2 rounded-sm border-primary text-primary bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-150"
            >
              <Columns3
                class="h-3.5 w-3.5 shrink-0"
                :class="loading ? 'animate-spin' : ''"
              />
              Columns
              <ChevronDown class="h-3 w-3 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            class="w-56 rounded-xl border border-border shadow-xl p-0 overflow-hidden"
          >
            <div
              class="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted"
            >
              <Columns3 class="h-3.5 w-3.5 text-primary shrink-0" />
              <p class="text-xs font-semibold text-primary">
                Configure Columns
              </p>
            </div>
            <div class="p-2 space-y-0.5 max-h-64 overflow-auto">
              <Label
                v-for="column in toggleableColumns"
                :key="column.id"
                class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted transition-colors duration-100 select-none"
              >
                <Checkbox
                  :model-value="column.getIsVisible()"
                  :disabled="isLastVisibleColumn(column)"
                  @update:model-value="
                    (v) => handleColumnToggle(column, Boolean(v))
                  "
                  class="shrink-0"
                />
                <Label class="text-xs font-medium text-muted-foreground">
                  {{ getColumnLabel(column.id) }}
                </Label>
              </Label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!-- ── Table ── -->
    <div class="overflow-auto flex-1 min-h-0">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="h-14 px-4 text-xs font-sans font-bold uppercase text-muted-foreground whitespace-nowrap"
              style="vertical-align: middle"
            >
              <!-- working headers -->
              <div class="flex items-center h-full w-full">
                <FlexRender
                  class="cursor-pointer font-sans"
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="loading">
            <TableRow class="hover:bg-transparent border-0">
              <TableCell
                :colspan="table.getAllLeafColumns().length"
                class="h-48 text-center border-0"
              >
                <div class="flex flex-col items-center gap-4">
                  <div class="flex items-end gap-1 h-6">
                    <span
                      v-for="i in 4"
                      :key="i"
                      class="w-1.5 bg-primary rounded-full animate-bounce"
                      :style="`height:${6 + i * 4}px; animation-delay:${(i - 1) * 80}ms`"
                    ></span>
                  </div>
                  <span
                    class="text-xs tracking-widest uppercase text-muted-foreground font-medium"
                    >Loading data…</span
                  >
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Error -->
          <template v-else-if="error">
            <TableRow class="hover:bg-transparent border-0">
              <TableCell
                :colspan="table.getAllLeafColumns().length"
                class="h-48 text-center border-0"
              >
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
                  >
                    <AlertCircle class="h-5 w-5 text-destructive" />
                  </div>
                  <p class="text-sm text-destructive font-medium">
                    {{ error }}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-8 px-4 rounded-lg text-xs"
                    @click="handleRefresh"
                  >
                    <RefreshCw class="h-3.5 w-3.5 mr-2" />
                    Try again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Data rows -->
          <template v-else-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow
                :data-state="row.getIsSelected() && 'selected'"
                class="cursor-pointer"
                :class="{
                  'h-8 [&_td]:py-1 [&_td]:text-xs': density === 'compact',
                  'h-16 [&_td]:py-5': density === 'comfortable',
                  'h-12 [&_td]:py-2.5': density === 'default',
                  '[&_td:first-child]:border-l-4 [&_td:first-child]:border-violet-400':
                    row.getIsSelected(),
                }"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-4 text-xs text-foreground font-sans whitespace-nowrap"
                  style="vertical-align: middle"
                  @click="
                    !['actions', 'select'].includes(cell.column.id) &&
                    emit('row-click', row.original)
                  "
                >
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>

              <TableRow v-if="row.getIsExpanded()">
                <TableCell
                  :colspan="row.getAllCells().length"
                  class="bg-muted border-b border-border border-l-4 border-l-primary px-4 py-3"
                >
                  <slot name="expanded" :row="row.original">{{
                    JSON.stringify(row.original)
                  }}</slot>
                </TableCell>
              </TableRow>
            </template>
          </template>

          <!-- Empty -->
          <TableRow v-else class="hover:bg-transparent border-0">
            <TableCell
              :colspan="table.getAllLeafColumns().length"
              class="h-48 text-center border-0"
            >
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center"
                >
                  <DatabaseZap class="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">
                    No results found
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- ── Footer ── -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-border bg-primary-20"
    >
      <div
        v-if="
          features?.selection &&
          table.getFilteredSelectedRowModel().rows.length > 0
        "
        class="text-xs text-primary font-mono font-semibold"
      >
        <span class="font-bold text-primary">{{
          table.getFilteredSelectedRowModel().rows.length
        }}</span>
        of {{ table.getFilteredRowModel().rows.length }} row(s) selected
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
  import Label from "@/components/ui/label/Label.vue";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
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
    AlertCircle,
    ArrowUpDown,
    CheckCheck,
    ChevronDown,
    Columns3,
    Copy,
    DatabaseZap,
    GalleryVertical,
    Info,
    Layers,
    Maximize,
    Maximize2,
    Minimize,
    Minimize2,
    MoreHorizontal,
    RefreshCw,
    X,
  } from "lucide-vue-next";
  import { computed, h, ref, useSlots, watch } from "vue";
  import { useTableInteractions } from "./composables/useTableInteractions";
  import type {
    TableColumn,
    TableConfig,
    TableFeatures,
    TableFetchFn,
  } from "./types/table.types";

  // ─── Props ───────────────────────────────────────────────────────────────────
  interface Props {
    tableId: string;
    columns: TableColumn[];
    fetchFn: TableFetchFn;
    config?: TableConfig;
    features?: TableFeatures;
    searchPlaceholder?: string;
    externalSearch?: string;
    externalFilter?: Record<string, any>;
  }
  const props = withDefaults(defineProps<Props>(), {
    config: () => ({}),
    searchPlaceholder: "Search...",
  });

  const emit = defineEmits<{
    export: [];
    "add-item": [];
    filter: [];
    "row-click": [row: any];
  }>();

  const slots = useSlots();

  // ─── Internals ───────────────────────────────────────────────────────────────
  const showColumnToggle = computed(
    () => props.config?.showColumnToggle !== false,
  );

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
    setExternalFilter,
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

  watch(
    () => props.externalFilter,
    (val) => {
      setExternalFilter(val ?? {});
    },
    { deep: true },
  );

  // Density
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

  // Copy CSV
  const copyDone = ref(false);
  function copyRowsAsCSV() {
    const rows = table.getFilteredRowModel().rows;
    const visibleCols = table
      .getVisibleLeafColumns()
      .filter((c) => c.id !== "select" && c.id !== "actions");
    const header = visibleCols.map((c) => c.id).join(",");
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

  // Fullscreen
  const isFullscreen = ref(false);

  // TanStack state
  const sorting = ref<SortingState>([]);
  const columnFilters = ref<ColumnFiltersState>([]);
  const columnVisibility = ref<VisibilityState>({});
  const rowSelection = ref({});
  const expanded = ref<ExpandedState>({});

  const initialVisibility = computed(() =>
    Object.fromEntries(props.columns.map((c) => [c.key, c.visible !== false])),
  );
  watch(
    initialVisibility,
    (v) => {
      columnVisibility.value = v;
    },
    { immediate: true },
  );
  watch(
    () => columnVisibility.value,
    (v) => {
      Object.entries(v).forEach(([key, visible]) =>
        setColumnVisibility(key, Boolean(visible)),
      );
    },
    { deep: true },
  );
  watch(
    () => sort.value,
    (v) => {
      if (!v?.column || !v.order) {
        sorting.value = [];
        return;
      }
      sorting.value = [{ id: v.column, desc: v.order === "desc" }];
    },
    { immediate: true },
  );

  // ─── Column defs ──────────────────────────────────────────────────────────────
  const baseColumns = computed<ColumnDef<any>[]>(() =>
    props.columns.map((column) => ({
      id: column.key,
      accessorKey: column.key,
      header: ({ column: tc }) => {
        if (column.sortable === false) return column.label;
        return h(
          Button,
          {
            variant: "ghost",
            class:
              "px-0 h-auto text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-transparent gap-1 transition-colors",
            onClick: () => tc.toggleSorting(tc.getIsSorted() === "asc"),
          },
          () => [column.label, h(ArrowUpDown, { class: "h-3 w-3 shrink-0" })],
        );
      },
      cell: ({ row, getValue }) => {
        const slot = slots[`cell-${column.key}`];
        if (slot) return slot({ row: row.original, value: getValue(), column });
        if (column.formatter) return column.formatter(getValue(), row.original);
        return getValue() ?? "—";
      },
      enableSorting: column.sortable !== false,
      enableHiding: true,
    })),
  );

  const toggleableColumns = computed(() =>
    table.getAllColumns().filter((c) => c.getCanHide()),
  );
  function getColumnLabel(id: string) {
    return props.columns.find((c) => c.key === id)?.label ?? id;
  }

  const visibleColumnsCount = computed(
    () => toggleableColumns.value.filter((c) => c.getIsVisible()).length,
  );

  function isLastVisibleColumn(column: any) {
    return visibleColumnsCount.value === 2 && column.getIsVisible();
  }

  function handleColumnToggle(column: any, value: boolean) {
    // Prevent hiding the last visible column
    if (visibleColumnsCount.value === 1 && column.getIsVisible()) return;

    column.toggleVisibility(!!value);
  }

  const selectionEnabled = computed(() =>
    Boolean(props.features?.selection?.enabled),
  );
  const hasActionColumn = computed(() =>
    props.columns.some((c) => c.key === "actions"),
  );
  defineExpose({ refresh: handleRefresh });

  // ─── Actions column ───────────────────────────────────────────────────────────
  // The DropdownMenu, Trigger, and Content are all rendered via `h()` so that
  // TanStack can use them inside its cell renderer. The trigger IS a proper
  // shadcn Button with MoreHorizontal inside it.
  const actionColumn = computed<ColumnDef<any> | null>(() => {
    if (hasActionColumn.value || !props.features?.rowActions?.length)
      return null;

    return {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => {
        // Build menu items from rowActions
        const menuItems = props.features!.rowActions!.map((action) =>
          h(
            DropdownMenuItem,
            {
              key: action.label,
              class:
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-pointer",
              onClick: () => action.onClick(row.original),
            },
            () => [
              action.icon
                ? h(action.icon, {
                    class: "h-4 w-4 shrink-0 text-muted-foreground",
                  })
                : null,
              h("span", { class: "text-foreground" }, action.label),
            ],
          ),
        );

        // The full dropdown tree
        return h(
          "div",
          { class: "flex items-center justify-center w-full h-full" },
          [
            h(
              DropdownMenu,
              {},
              {
                default: () => [
                  // ── Trigger button ──────────────────────────────────────────────
                  h(
                    DropdownMenuTrigger,
                    { asChild: true },
                    {
                      default: () =>
                        h(
                          Button,
                          {
                            variant: "ghost",
                            size: "icon",
                            class:
                              "h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary data-[state=open]:bg-secondary data-[state=open]:text-foreground",
                          },
                          {
                            default: () => [
                              h("span", { class: "sr-only" }, "Actions"),
                              h(MoreHorizontal, { class: "h-4 w-4" }),
                            ],
                          },
                        ),
                    },
                  ),

                  // ── Dropdown menu ───────────────────────────────────────────────
                  h(
                    DropdownMenuContent,
                    {
                      align: "end",
                      class:
                        "w-48 rounded-xl border border-border bg-popover shadow-xl p-1.5",
                    },
                    {
                      default: () => menuItems,
                    },
                  ),
                ],
              },
            ),
          ],
        );
      },
    };
  });

  // ─── Selection column ─────────────────────────────────────────────────────────
  const selectionColumn = computed<ColumnDef<any> | null>(() => {
    if (!selectionEnabled.value) return null;
    return {
      id: "select",
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) =>
        h(Checkbox, {
          modelValue:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate"),
          "onUpdate:modelValue": (v) => table.toggleAllPageRowsSelected(!!v),
          ariaLabel: "Select all",
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          modelValue: row.getIsSelected(),
          "onUpdate:modelValue": (v) => row.toggleSelected(!!v),
          ariaLabel: "Select row",
        }),
    };
  });

  const tableColumns = computed<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [];
    if (selectionColumn.value) cols.push(selectionColumn.value);
    cols.push(...baseColumns.value);
    if (actionColumn.value) cols.push(actionColumn.value);
    return cols;
  });

  // ─── useVueTable ──────────────────────────────────────────────────────────────
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
      handleSortingChange(next[0].id, next[0].desc ? "desc" : "asc");
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
    table.getFilteredSelectedRowModel().rows.map((r) => r.original),
  );

  function applyUpdater<T>(fn: ((prev: T) => T) | T, state: T): T {
    return typeof fn === "function" ? (fn as (p: T) => T)(state) : fn;
  }
</script>
