import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useUiTableStore } from "../stores/useUiTableStore";
import { useDebounceFn } from "@vueuse/core";
import type {
  TableColumn,
  TableConfig,
  TableFetchFn,
} from "../types/table.types";

export function useTableInteractions<T extends Record<string, unknown>>(
  tableId: string,
  columns: TableColumn<T>[],
  fetchFn: TableFetchFn<T>,
  config: TableConfig = {},
) {
  const store = useUiTableStore();
  const fetchInProgress = ref(false);
  const autoRefreshInterval = ref<number | null>(null);

  const {
    debounceMs = 300,
    persistState = true,
    autoRefresh = false,
    autoRefreshInterval: refreshInterval = 30000,
  } = config;

  // Initialize table on mount
  onMounted(() => {
    if (!store.getTable(tableId)?.initialized) {
      store.initializeTable(tableId, columns, config);
    }
    fetchData();

    // Setup auto-refresh if enabled
    if (autoRefresh) {
      setupAutoRefresh();
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    if (!persistState) {
      store.destroyTable(tableId);
    }
    clearAutoRefresh();
  });

  // Setup auto-refresh
  function setupAutoRefresh() {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value);
    }
    autoRefreshInterval.value = window.setInterval(() => {
      if (!fetchInProgress.value) {
        fetchData(true); // silent refresh
      }
    }, refreshInterval);
  }

  // Clear auto-refresh
  function clearAutoRefresh() {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value);
      autoRefreshInterval.value = null;
    }
  }

  // Computed getters
  const tableData = computed(() => store.getTableData(tableId));
  const loading = computed(() => store.isLoading(tableId));
  const error = computed(() => store.getError(tableId));
  const pagination = computed(() => store.getPagination(tableId));
  const filters = computed(() => store.getFilters(tableId));
  const sort = computed(() => store.getSort(tableId));
  const visibleColumns = computed(() => store.getVisibleColumns(tableId));
  const allColumns = computed(() => store.getColumns(tableId));
  const hasData = computed(() => store.hasData(tableId));
  const isEmpty = computed(() => store.isEmpty(tableId));
  const hasError = computed(() => store.hasError(tableId));
  const canGoNext = computed(() => store.canGoNext(tableId));
  const canGoPrevious = computed(() => store.canGoPrevious(tableId));
  const searchQuery = computed(() => store.getSearchQuery(tableId));

  // Fetch data function
  async function fetchData(silent = false) {
    if (fetchInProgress.value) return;

    // Ensure table is initialized
    const table = store.getTable(tableId);
    if (!table) {
      store.setError(tableId, `Table ${tableId} not initialized`);
      return;
    }

    fetchInProgress.value = true;
    if (!silent) {
      store.setLoading(tableId, true);
    }
    store.setError(tableId, null);

    try {
      const currentFilters = store.getFilters(tableId);
      const currentSort = store.getSort(tableId);
      const currentPagination = store.getPagination(tableId);

      if (!currentFilters || !currentSort || !currentPagination) {
        throw new Error("Table state not properly initialized");
      }

      const response = await fetchFn({
        page: currentPagination.currentPage,
        perPage: currentPagination.perPage,
        search: currentFilters.search,
        sortBy: currentSort.column,
        sortOrder: currentSort.order,
        filters: currentFilters,
      });

      store.updateTableData(tableId, response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      store.setError(tableId, errorMessage);
    } finally {
      if (!silent) {
        store.setLoading(tableId, false);
      }
      fetchInProgress.value = false;
    }
  }

  // Debounced fetch for search
  const debouncedFetch = useDebounceFn(fetchData, debounceMs);

  // Watch for search changes
  watch(
    () => store.getFilters(tableId)?.search,
    (newSearch, oldSearch) => {
      if (newSearch !== oldSearch) {
        debouncedFetch();
      }
    },
  );

  // Watch for sort changes
  watch(
    () => store.getSort(tableId),
    (newSort, oldSort) => {
      if (
        newSort?.column !== oldSort?.column ||
        newSort?.order !== oldSort?.order
      ) {
        fetchData();
      }
    },
    { deep: true },
  );

  // Watch for pagination changes
  watch(
    () => store.getPagination(tableId),
    (newPagination, oldPagination) => {
      if (
        newPagination?.currentPage !== oldPagination?.currentPage ||
        newPagination?.perPage !== oldPagination?.perPage
      ) {
        fetchData();
      }
    },
    { deep: true },
  );

  // Actions
  function handleSearch(value: string) {
    store.setSearch(tableId, value);
  }

  function handleSort(columnKey: string) {
    const column = allColumns.value.find((col) => col.key === columnKey);
    if (column?.sortable !== false) {
      store.setSort(tableId, columnKey);
    }
  }

  function handlePageChange(page: number) {
    store.setPage(tableId, page);
  }

  function handlePerPageChange(perPage: number) {
    store.setPerPage(tableId, perPage);
  }

  function handleColumnToggle(columnKey: string) {
    store.toggleColumnVisibility(tableId, columnKey);
  }

  function handleRefresh() {
    fetchData();
  }

  function handleReset() {
    store.resetTable(tableId);
    fetchData();
  }

  function handleNextPage() {
    store.nextPage(tableId);
  }

  function handlePreviousPage() {
    store.previousPage(tableId);
  }

  function handleFirstPage() {
    store.firstPage(tableId);
  }

  function handleLastPage() {
    store.lastPage(tableId);
  }

  function clearError() {
    store.setError(tableId, null);
  }

  function clearSearch() {
    store.setSearch(tableId, "");
  }

  function setColumnVisibility(columnKey: string, visible: boolean) {
    store.setColumnVisibility(tableId, columnKey, visible);
  }

  function showAllColumns() {
    store.showAllColumns(tableId);
  }

  function hideAllColumns() {
    store.hideAllColumns(tableId);
  }

  return {
    // State
    tableData,
    loading,
    error,
    pagination,
    filters,
    sort,
    visibleColumns,
    allColumns,
    hasData,
    isEmpty,
    hasError,
    canGoNext,
    canGoPrevious,
    searchQuery,

    // Actions
    handleSearch,
    handleSort,
    handlePageChange,
    handlePerPageChange,
    handleColumnToggle,
    handleRefresh,
    handleReset,
    handleNextPage,
    handlePreviousPage,
    handleFirstPage,
    handleLastPage,
    fetchData,
    clearError,
    clearSearch,
    setColumnVisibility,
    showAllColumns,
    hideAllColumns,
  };
}
