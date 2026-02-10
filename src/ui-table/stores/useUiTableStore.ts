import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  ApiResponse,
  TableColumn,
  TableConfig,
  TableState,
} from "../types/table.types";

const createDefaultTableState = (
  columns: TableColumn[] = [],
  config: TableConfig = {},
): TableState => {
  const {
    defaultPerPage = 10,
    defaultSortBy = null,
    defaultSortOrder = null,
  } = config;

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
    columns: columns.map((col) => ({ ...col, visible: col.visible !== false })),
    selectedRowIds: [],
    initialized: true,
  };
};

export const useUiTableStore = defineStore(
  "ui-table",
  () => {
    const tables = ref<Record<string, TableState>>({});

    const ensureTable = (tableId: string) => {
      if (!tables.value[tableId]) {
        tables.value[tableId] = createDefaultTableState();
      }
      return tables.value[tableId];
    };

    const getTable = (tableId: string) => tables.value[tableId];
    const getTableData = (tableId: string) => ensureTable(tableId).data ?? [];
    const isLoading = (tableId: string) => !!ensureTable(tableId).loading;
    const getError = (tableId: string) => ensureTable(tableId).error;
    const getFilters = (tableId: string) => ensureTable(tableId).filters;
    const getSort = (tableId: string) => ensureTable(tableId).sort;
    const getPagination = (tableId: string) => ensureTable(tableId).pagination;
    const getColumns = (tableId: string) => ensureTable(tableId).columns ?? [];
    const getVisibleColumns = (tableId: string) => getColumns(tableId).filter((col) => col?.visible !== false);
    const getSelectedRowIds = (tableId: string) => ensureTable(tableId).selectedRowIds ?? [];

    const hasData = (tableId: string) => getTableData(tableId).length > 0;
    const isEmpty = (tableId: string) => !isLoading(tableId) && !hasData(tableId);

    const initializeTable = (
      tableId: string,
      columns: TableColumn[],
      config: TableConfig = {},
    ) => {
      tables.value[tableId] = createDefaultTableState(columns, config);
    };

    const setLoading = (tableId: string, loading: boolean) => {
      ensureTable(tableId).loading = loading;
    };

    const setError = (tableId: string, error: string | null) => {
      ensureTable(tableId).error = error;
    };

    const updateTableData = (tableId: string, response: ApiResponse) => {
      const table = ensureTable(tableId);
      table.data = Array.isArray(response?.data) ? response.data : [];
      table.pagination = {
        currentPage: response?.meta?.current_page ?? 1,
        perPage: response?.meta?.per_page ?? table.pagination.perPage,
        total: response?.meta?.total ?? 0,
        totalPages: response?.meta?.last_page ?? 0,
      };
      table.error = null;
      table.selectedRowIds = table.selectedRowIds.filter((id) =>
        table.data.some((row: any) => String(row?.id) === id),
      );
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
        if (currentSort.order === "asc") currentSort.order = "desc";
        else if (currentSort.order === "desc") table.sort = { column: null, order: null };
        else currentSort.order = "asc";
      } else {
        table.sort = { column, order: "asc" };
      }

      table.pagination.currentPage = 1;
    };

    const setPage = (tableId: string, page: number) => {
      const table = ensureTable(tableId);
      table.pagination.currentPage = Math.max(1, Math.min(page, table.pagination.totalPages || 1));
    };

    const setPerPage = (tableId: string, perPage: number) => {
      const table = ensureTable(tableId);
      table.pagination.perPage = perPage;
      table.pagination.currentPage = 1;
    };

    const toggleColumnVisibility = (tableId: string, columnKey: string) => {
      const column = ensureTable(tableId).columns.find((col) => col.key === columnKey);
      if (column) column.visible = !column.visible;
    };

    const toggleRowSelection = (tableId: string, rowId: string) => {
      const table = ensureTable(tableId);
      const selected = new Set(table.selectedRowIds);
      if (selected.has(rowId)) selected.delete(rowId);
      else selected.add(rowId);
      table.selectedRowIds = Array.from(selected);
    };

    const toggleAllRows = (tableId: string, rowIds: string[]) => {
      const table = ensureTable(tableId);
      const allSelected = rowIds.length > 0 && rowIds.every((id) => table.selectedRowIds.includes(id));
      table.selectedRowIds = allSelected ? [] : rowIds;
    };

    const clearSelection = (tableId: string) => {
      ensureTable(tableId).selectedRowIds = [];
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
      getSelectedRowIds,
      hasData,
      isEmpty,
      initializeTable,
      setLoading,
      setError,
      updateTableData,
      setSearch,
      setSort,
      setPage,
      setPerPage,
      toggleColumnVisibility,
      toggleRowSelection,
      toggleAllRows,
      clearSelection,
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
