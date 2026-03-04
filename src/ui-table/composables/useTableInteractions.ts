// composables/useTableInteractions.ts
// ─────────────────────────────────────────────────────────────────────────────
// Self-contained table composable — no Pinia store required.
// All state (data, loading, pagination, sort, columns) lives locally here.
// UiTable.vue is the only consumer; views never touch this directly.
// ─────────────────────────────────────────────────────────────────────────────
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref } from "vue";
import type {
  TableColumn,
  TableConfig,
  TableFetchFn,
} from "../types/table.types";

export function useTableInteractions<T = any>(
  tableId: string,
  columns: TableColumn<T>[],
  fetchFn: TableFetchFn<T>,
  config: TableConfig = {},
) {
  const {
    debounceMs = 300,
    autoRefresh = false,
    autoRefreshInterval: refreshInterval = 30_000,
    defaultPerPage = 10,
    defaultSortBy = null,
    defaultSortOrder = null,
  } = config;

  // ── Local reactive state ───────────────────────────────────────────────────
  const tableData = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const pagination = ref({
    currentPage: 1,
    perPage: defaultPerPage,
    total: 0,
    totalPages: 0,
  });

  const sort = ref<{ column: string | null; order: "asc" | "desc" | null }>({
    column: defaultSortBy,
    order: defaultSortOrder,
  });

  const searchQuery = ref("");

  // Column state — initialised from prop; tracks visibility locally
  const columnState = ref<TableColumn<T>[]>(
    columns.map((col) => ({ ...col, visible: col.visible !== false })),
  );

  const fetchInProgress = ref(false);
  const autoRefreshHandle = ref<ReturnType<typeof setInterval> | null>(null);

  // ── Derived / computed ────────────────────────────────────────────────────
  const hasData = computed(() => tableData.value.length > 0);
  const isEmpty = computed(() => !loading.value && !hasData.value);
  const hasError = computed(() => !!error.value);
  const canGoNext = computed(
    () => pagination.value.currentPage < pagination.value.totalPages,
  );
  const canGoPrevious = computed(() => pagination.value.currentPage > 1);
  const visibleColumns = computed(() =>
    columnState.value.filter((c) => c.visible !== false),
  );
  const allColumns = computed(() => columnState.value);

  // ── Core fetch ────────────────────────────────────────────────────────────
  async function fetchData(silent = false) {
    if (fetchInProgress.value) return;
    fetchInProgress.value = true;
    if (!silent) loading.value = true;
    error.value = null;

    try {
      const response = await fetchFn({
        page: pagination.value.currentPage,
        perPage: pagination.value.perPage,
        search: searchQuery.value,
        sortBy: sort.value.column,
        sortOrder: sort.value.order,
      });

      tableData.value = response.data as T[];
      pagination.value = {
        currentPage: response.meta.current_page,
        perPage: response.meta.per_page,
        total: response.meta.total,
        totalPages: response.meta.last_page,
      };
    } catch (err: any) {
      error.value = err?.message ?? "Failed to fetch data";
      console.error(`[useTableInteractions:${tableId}]`, err);
    } finally {
      if (!silent) loading.value = false;
      fetchInProgress.value = false;
    }
  }

  // Debounced variant used for search keystrokes
  const debouncedFetch = useDebounceFn(() => fetchData(), debounceMs);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMounted(() => {
    fetchData();

    if (autoRefresh) {
      autoRefreshHandle.value = setInterval(() => {
        if (!fetchInProgress.value) fetchData(true);
      }, refreshInterval);
    }
  });

  onUnmounted(() => {
    if (autoRefreshHandle.value) clearInterval(autoRefreshHandle.value);
  });

  // ── Public actions ────────────────────────────────────────────────────────

  /** Called by UiHeader / externalSearch watcher */
  function handleSearch(value: string) {
    searchQuery.value = value;
    pagination.value = { ...pagination.value, currentPage: 1 };
    debouncedFetch();
  }

  /** Called by TanStack column header sort toggle */
  function handleSortingChange(
    column: string | null,
    order: "asc" | "desc" | null,
  ) {
    sort.value = { column, order };
    pagination.value = { ...pagination.value, currentPage: 1 };
    fetchData();
  }

  /** Alias kept for UiTable's handleSort(columnKey) usage */
  function handleSort(columnKey: string) {
    const col = columnState.value.find((c) => c.key === columnKey);
    if (col?.sortable === false) return;

    const current = sort.value;
    let order: "asc" | "desc" | null = "asc";
    let newColumn: string | null = columnKey;

    if (current.column === columnKey) {
      if (current.order === "asc") order = "desc";
      else if (current.order === "desc") {
        order = null;
        newColumn = null;
      }
    }

    handleSortingChange(newColumn, order);
  }

  function handlePageChange(page: number) {
    const valid = Math.max(1, Math.min(page, pagination.value.totalPages || 1));
    pagination.value = { ...pagination.value, currentPage: valid };
    fetchData();
  }

  function handlePerPageChange(perPage: number) {
    pagination.value = { ...pagination.value, perPage, currentPage: 1 };
    fetchData();
  }

  function handleRefresh() {
    fetchData();
  }

  function handleReset() {
    searchQuery.value = "";
    sort.value = { column: defaultSortBy, order: defaultSortOrder };
    pagination.value = {
      currentPage: 1,
      perPage: defaultPerPage,
      total: 0,
      totalPages: 0,
    };
    fetchData();
  }

  function handleNextPage() {
    if (canGoNext.value) handlePageChange(pagination.value.currentPage + 1);
  }

  function handlePreviousPage() {
    if (canGoPrevious.value) handlePageChange(pagination.value.currentPage - 1);
  }

  function handleFirstPage() {
    handlePageChange(1);
  }

  function handleLastPage() {
    handlePageChange(pagination.value.totalPages);
  }

  // ── Column visibility ─────────────────────────────────────────────────────
  function setColumnVisibility(columnKey: string, visible: boolean) {
    const col = columnState.value.find((c) => c.key === columnKey);
    if (col) col.visible = visible;
  }

  function toggleColumnVisibility(columnKey: string) {
    const col = columnState.value.find((c) => c.key === columnKey);
    if (col) col.visible = !col.visible;
  }

  function showAllColumns() {
    columnState.value.forEach((c) => (c.visible = true));
  }

  function hideAllColumns() {
    columnState.value.forEach((c) => (c.visible = false));
  }

  // ── Misc ──────────────────────────────────────────────────────────────────
  function clearError() {
    error.value = null;
  }

  function clearSearch() {
    searchQuery.value = "";
    pagination.value = { ...pagination.value, currentPage: 1 };
    fetchData();
  }

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    // State (readonly refs — only mutated through actions)
    tableData,
    loading,
    error,
    pagination,
    sort,
    searchQuery,
    visibleColumns,
    allColumns,

    // Derived
    hasData,
    isEmpty,
    hasError,
    canGoNext,
    canGoPrevious,

    // Actions
    fetchData,
    handleSearch,
    handleSort,
    handleSortingChange,
    handlePageChange,
    handlePerPageChange,
    handleRefresh,
    handleReset,
    handleNextPage,
    handlePreviousPage,
    handleFirstPage,
    handleLastPage,
    clearError,
    clearSearch,
    setColumnVisibility,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
  };
}
