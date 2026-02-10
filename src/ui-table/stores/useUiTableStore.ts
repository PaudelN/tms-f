import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  ApiResponse,
  TableColumn,
  TableConfig,
  TableFilters,
  TableState,
} from "../types/table.types";

const defaultState = (columns: TableColumn[] = [], config: TableConfig = {}): TableState => {
  const { defaultPerPage = 10, defaultSortBy = null, defaultSortOrder = null } = config;

  return {
    data: [],
    loading: false,
    error: null,
    filters: { search: "" },
    sort: { column: defaultSortBy, order: defaultSortOrder },
    pagination: {
      currentPage: 1,
      perPage: defaultPerPage,
      total: 0,
      totalPages: 0,
    },
    columns: columns.map((column) => ({ ...column, visible: column.visible !== false })),
    initialized: true,
  };
};

export const useUiTableStore = defineStore(
  "ui-table",
  () => {
    const tables = ref<Record<string, TableState>>({});

    const ensureTableState = (tableId: string): TableState | null => {
      const table = tables.value[tableId];
      if (!table) return null;

      if (!Array.isArray(table.data)) table.data = [];
      if (!table.filters || typeof table.filters !== "object") table.filters = { search: "" };
      if (typeof table.filters.search !== "string") table.filters.search = "";
      if (!table.sort || typeof table.sort !== "object") table.sort = { column: null, order: null };
      if (!table.pagination || typeof table.pagination !== "object") {
        table.pagination = defaultState().pagination;
      }
      if (!Array.isArray(table.columns)) table.columns = [];
      table.columns = table.columns.map((column) => ({ ...column, visible: column.visible !== false }));
      table.initialized = true;

      return table;
    };

    const getTable = (tableId: string) => ensureTableState(tableId);
    const getTableData = (tableId: string) => ensureTableState(tableId)?.data ?? [];
    const isLoading = (tableId: string) => ensureTableState(tableId)?.loading ?? false;
    const getError = (tableId: string) => ensureTableState(tableId)?.error ?? null;
    const getFilters = (tableId: string) => ensureTableState(tableId)?.filters;
    const getSort = (tableId: string) => ensureTableState(tableId)?.sort;
    const getPagination = (tableId: string) => ensureTableState(tableId)?.pagination;
    const getColumns = (tableId: string) => ensureTableState(tableId)?.columns ?? [];
    const getVisibleColumns = (tableId: string) => getColumns(tableId).filter((column) => column.visible !== false);
    const getColumnByKey = (tableId: string, columnKey: string) => getColumns(tableId).find((column) => column.key === columnKey);
    const isInitialized = (tableId: string) => !!ensureTableState(tableId)?.initialized;
    const hasData = (tableId: string) => getTableData(tableId).length > 0;
    const isEmpty = (tableId: string) => !isLoading(tableId) && !hasData(tableId);
    const hasError = (tableId: string) => !!getError(tableId);
    const canGoNext = (tableId: string) => {
      const pagination = getPagination(tableId);
      return pagination ? pagination.currentPage < pagination.totalPages : false;
    };
    const canGoPrevious = (tableId: string) => {
      const pagination = getPagination(tableId);
      return pagination ? pagination.currentPage > 1 : false;
    };
    const getSearchQuery = (tableId: string) => getFilters(tableId)?.search ?? "";
    const isSortedBy = (tableId: string, columnKey: string) => getSort(tableId)?.column === columnKey;
    const getSortDirection = (tableId: string, columnKey: string) => {
      const sort = getSort(tableId);
      return sort?.column === columnKey ? sort.order : null;
    };

    const initializeTable = (tableId: string, columns: TableColumn[], config: TableConfig = {}) => {
      tables.value[tableId] = defaultState(columns, config);
    };

    const setLoading = (tableId: string, loading: boolean) => {
      const table = ensureTableState(tableId);
      if (table) table.loading = loading;
    };

    const setError = (tableId: string, error: string | null) => {
      const table = ensureTableState(tableId);
      if (table) table.error = error;
    };

    const updateTableData = (tableId: string, response: ApiResponse) => {
      const table = ensureTableState(tableId);
      if (!table) return;

      table.data = Array.isArray(response.data) ? response.data : [];
      table.pagination = {
        currentPage: response.meta.current_page,
        perPage: response.meta.per_page,
        total: response.meta.total,
        totalPages: response.meta.last_page,
      };
      table.error = null;
    };

    const setSearch = (tableId: string, search: string) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      table.filters.search = search;
      table.pagination.currentPage = 1;
    };

    const setSort = (tableId: string, column: string) => {
      const table = ensureTableState(tableId);
      if (!table) return;

      if (table.sort.column === column) {
        table.sort.order = table.sort.order === "asc" ? "desc" : table.sort.order === "desc" ? null : "asc";
        if (!table.sort.order) table.sort.column = null;
      } else {
        table.sort = { column, order: "asc" };
      }

      table.pagination.currentPage = 1;
    };

    const setPage = (tableId: string, page: number) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      table.pagination.currentPage = Math.max(1, Math.min(page, table.pagination.totalPages || 1));
    };

    const nextPage = (tableId: string) => canGoNext(tableId) && setPage(tableId, (getPagination(tableId)?.currentPage ?? 1) + 1);
    const previousPage = (tableId: string) => canGoPrevious(tableId) && setPage(tableId, (getPagination(tableId)?.currentPage ?? 1) - 1);
    const firstPage = (tableId: string) => setPage(tableId, 1);
    const lastPage = (tableId: string) => setPage(tableId, getPagination(tableId)?.totalPages ?? 1);

    const setPerPage = (tableId: string, perPage: number) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      table.pagination = { ...table.pagination, perPage, currentPage: 1 };
    };

    const toggleColumnVisibility = (tableId: string, columnKey: string) => {
      const column = getColumnByKey(tableId, columnKey);
      if (column) column.visible = !column.visible;
    };

    const setColumnVisibility = (tableId: string, columnKey: string, visible: boolean) => {
      const column = getColumnByKey(tableId, columnKey);
      if (column) column.visible = visible;
    };

    const showAllColumns = (tableId: string) => getColumns(tableId).forEach((column) => (column.visible = true));
    const hideAllColumns = (tableId: string) => getColumns(tableId).forEach((column) => (column.visible = false));

    const setFilters = (tableId: string, filters: Partial<TableFilters>) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      table.filters = { ...table.filters, ...filters };
      table.pagination.currentPage = 1;
    };

    const clearFilters = (tableId: string) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      table.filters = { search: "" };
      table.pagination.currentPage = 1;
    };

    const resetTable = (tableId: string) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      table.filters = { search: "" };
      table.pagination.currentPage = 1;
      table.sort = { column: null, order: null };
      table.error = null;
    };

    const resetTableFull = (tableId: string, config: TableConfig = {}) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      const reset = defaultState(table.columns, config);
      table.filters = reset.filters;
      table.sort = reset.sort;
      table.pagination = reset.pagination;
      table.error = null;
    };

    const destroyTable = (tableId: string) => {
      delete tables.value[tableId];
    };

    const clearData = (tableId: string) => {
      const table = ensureTableState(tableId);
      if (!table) return;
      table.data = [];
      table.pagination.total = 0;
      table.pagination.totalPages = 0;
    };

    const updateMultipleColumns = (tableId: string, updates: Array<{ key: string; visible: boolean }>) => {
      updates.forEach(({ key, visible }) => setColumnVisibility(tableId, key, visible));
    };

    return {
      tables,
      getTable,
      getTableData,
      isLoading,
      getError,
      getFilters,
      getSort,
      getPagination,
      getColumns,
      getVisibleColumns,
      getColumnByKey,
      isInitialized,
      hasData,
      isEmpty,
      hasError,
      canGoNext,
      canGoPrevious,
      getSearchQuery,
      isSortedBy,
      getSortDirection,
      initializeTable,
      setLoading,
      setError,
      updateTableData,
      setSearch,
      setSort,
      setPage,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
      setPerPage,
      toggleColumnVisibility,
      setColumnVisibility,
      showAllColumns,
      hideAllColumns,
      setFilters,
      clearFilters,
      resetTable,
      resetTableFull,
      destroyTable,
      clearData,
      updateMultipleColumns,
    };
  },
  {
    persist: {
      key: "ui-table-store",
      storage: localStorage,
    },
  },
);
