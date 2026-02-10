import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useUiTableStore } from "../stores/useUiTableStore";
import type { TableColumn, TableConfig, TableFetchFn } from "../types/table.types";

export function useTableInteractions<T = any>(
  tableId: string,
  columns: TableColumn<T>[],
  fetchFn: TableFetchFn<T>,
  config: TableConfig = {},
) {
  const store = useUiTableStore();
  const fetchInProgress = ref(false);

  const {
    debounceMs = 300,
    persistState = true,
  } = config;

  onMounted(() => {
    if (!store.getTable(tableId)?.initialized) {
      store.initializeTable(tableId, columns, config);
    }
    fetchData();
  });

  onUnmounted(() => {
    if (!persistState) store.destroyTable(tableId);
  });

  const tableData = computed(() => store.getTableData(tableId));
  const loading = computed(() => store.isLoading(tableId));
  const error = computed(() => store.getError(tableId));
  const pagination = computed(() => store.getPagination(tableId));
  const filters = computed(() => store.getFilters(tableId));
  const sort = computed(() => store.getSort(tableId));
  const visibleColumns = computed(() => store.getVisibleColumns(tableId));
  const allColumns = computed(() => store.getColumns(tableId));
  const selectedRowIds = computed(() => store.getSelectedRowIds(tableId));

  async function fetchData(silent = false) {
    if (fetchInProgress.value) return;

    const currentFilters = store.getFilters(tableId);
    const currentSort = store.getSort(tableId);
    const currentPagination = store.getPagination(tableId);

    fetchInProgress.value = true;
    if (!silent) store.setLoading(tableId, true);
    store.setError(tableId, null);

    try {
      const response = await fetchFn({
        page: currentPagination.currentPage,
        perPage: currentPagination.perPage,
        search: currentFilters.search,
        sortBy: currentSort.column,
        sortOrder: currentSort.order,
        filters: currentFilters,
      });

      store.updateTableData(tableId, response);
    } catch (err: any) {
      store.setError(tableId, err?.message ?? "Failed to fetch data");
    } finally {
      if (!silent) store.setLoading(tableId, false);
      fetchInProgress.value = false;
    }
  }

  const debouncedFetch = useDebounceFn(fetchData, debounceMs);

  watch(() => store.getFilters(tableId)?.search, () => debouncedFetch());
  watch(() => store.getSort(tableId), () => fetchData(), { deep: true });
  watch(
    () => store.getPagination(tableId),
    (newPagination, oldPagination) => {
      if (
        newPagination.currentPage !== oldPagination?.currentPage ||
        newPagination.perPage !== oldPagination?.perPage
      ) fetchData();
    },
    { deep: true },
  );

  const handleSearch = (value: string) => store.setSearch(tableId, value);
  const handleSort = (columnKey: string) => {
    if (allColumns.value.find((col) => col.key === columnKey)?.sortable !== false) {
      store.setSort(tableId, columnKey);
    }
  };
  const handlePageChange = (page: number) => store.setPage(tableId, page);
  const handlePerPageChange = (perPage: number) => store.setPerPage(tableId, perPage);
  const handleColumnToggle = (columnKey: string) => store.toggleColumnVisibility(tableId, columnKey);
  const handleRefresh = () => fetchData();
  const handleRowSelection = (rowId: string) => store.toggleRowSelection(tableId, rowId);
  const handleAllRows = (rowIds: string[]) => store.toggleAllRows(tableId, rowIds);
  const clearSelection = () => store.clearSelection(tableId);

  return {
    tableData,
    loading,
    error,
    pagination,
    filters,
    sort,
    visibleColumns,
    allColumns,
    selectedRowIds,
    handleSearch,
    handleSort,
    handlePageChange,
    handlePerPageChange,
    handleColumnToggle,
    handleRefresh,
    handleRowSelection,
    handleAllRows,
    clearSelection,
  };
}
