import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  ApiResponse,
  TableColumn,
  TableConfig,
  TableState,
} from "../types/table.types";

const createDefaultState = (
  columns: TableColumn[] = [],
  config: TableConfig = {},
): TableState => ({
  data: [],
  loading: false,
  error: null,
  filters: { search: "" },
  sort: {
    column: config.defaultSortBy ?? null,
    order: config.defaultSortOrder ?? null,
  },
  pagination: {
    currentPage: 1,
    perPage: config.defaultPerPage ?? 10,
    total: 0,
    totalPages: 0,
  },
  columns: (columns ?? []).map((column) => ({
    ...column,
    visible: column.visible !== false,
  })),
  initialized: true,
});

export const useUiTableStore = defineStore(
  "ui-table",
  () => {
    const tables = ref<Record<string, TableState>>({});

    const ensureTable = (tableId: string) => {
      if (!tables.value[tableId]) {
        tables.value[tableId] = createDefaultState();
      }
      return tables.value[tableId];
    };

    const getTable = (tableId: string) => tables.value[tableId];
    const getTableData = (tableId: string) => getTable(tableId)?.data ?? [];
    const isLoading = (tableId: string) => getTable(tableId)?.loading ?? false;
    const getError = (tableId: string) => getTable(tableId)?.error ?? null;
    const getFilters = (tableId: string) => getTable(tableId)?.filters ?? { search: "" };
    const getSort = (tableId: string) =>
      getTable(tableId)?.sort ?? { column: null, order: null };
    const getPagination = (tableId: string) =>
      getTable(tableId)?.pagination ?? {
        currentPage: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      };
    const getColumns = (tableId: string) => getTable(tableId)?.columns ?? [];
    const getVisibleColumns = (tableId: string) =>
      (getTable(tableId)?.columns ?? []).filter((col) => col.visible !== false);

    const initializeTable = (
      tableId: string,
      columns: TableColumn[],
      config: TableConfig = {},
    ) => {
      tables.value[tableId] = createDefaultState(columns, config);
    };

    const setLoading = (tableId: string, loading: boolean) => {
      ensureTable(tableId).loading = loading;
    };

    const setError = (tableId: string, error: string | null) => {
      ensureTable(tableId).error = error;
    };

    const updateTableData = (tableId: string, response: ApiResponse) => {
      const table = ensureTable(tableId);
      table.data = response?.data ?? [];
      table.pagination = {
        currentPage: response?.meta?.current_page ?? 1,
        perPage: response?.meta?.per_page ?? table.pagination.perPage,
        total: response?.meta?.total ?? 0,
        totalPages: response?.meta?.last_page ?? 0,
      };
      table.error = null;
    };

    const setSearch = (tableId: string, search: string) => {
      const table = ensureTable(tableId);
      table.filters = { ...table.filters, search };
      table.pagination.currentPage = 1;
    };

    const setSort = (tableId: string, column: string) => {
      const table = ensureTable(tableId);
      const currentSort = table.sort;
      if (currentSort.column === column) {
        currentSort.order = currentSort.order === "asc" ? "desc" : currentSort.order === "desc" ? null : "asc";
        if (currentSort.order === null) {
          currentSort.column = null;
        }
      } else {
        table.sort = { column, order: "asc" };
      }
      table.pagination.currentPage = 1;
    };

    const setPage = (tableId: string, page: number) => {
      const table = ensureTable(tableId);
      const maxPage = Math.max(table.pagination.totalPages, 1);
      table.pagination.currentPage = Math.min(Math.max(page, 1), maxPage);
    };

    const setPerPage = (tableId: string, perPage: number) => {
      const table = ensureTable(tableId);
      table.pagination.perPage = perPage;
      table.pagination.currentPage = 1;
    };

    const toggleColumnVisibility = (tableId: string, columnKey: string) => {
      const table = ensureTable(tableId);
      const column = table.columns.find((col) => col.key === columnKey);
      if (column) {
        column.visible = !column.visible;
      }
    };

    const setColumnVisibility = (tableId: string, columnKey: string, visible: boolean) => {
      const table = ensureTable(tableId);
      const column = table.columns.find((col) => col.key === columnKey);
      if (column) {
        column.visible = visible;
      }
    };
    const showAllColumns = (tableId: string) => {
      const table = ensureTable(tableId);
      table.columns.forEach((column) => {
        column.visible = true;
      });
    };

    const hideAllColumns = (tableId: string) => {
      const table = ensureTable(tableId);
      table.columns.forEach((column) => {
        column.visible = false;
      });
    };

    const resetTable = (tableId: string) => {
      const table = ensureTable(tableId);
      table.filters = { search: "" };
      table.error = null;
      table.sort = { column: null, order: null };
      table.pagination.currentPage = 1;
    };

    const destroyTable = (tableId: string) => {
      delete tables.value[tableId];
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
      initializeTable,
      setLoading,
      setError,
      updateTableData,
      setSearch,
      setSort,
      setPage,
      setPerPage,
      toggleColumnVisibility,
      setColumnVisibility,
      showAllColumns,
      hideAllColumns,
      resetTable,
      destroyTable,
    };
  },
  {
    persist: {
      key: "ui-table-store",
      storage: localStorage,
    },
  },
);
