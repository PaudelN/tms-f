// stores/useUiTableStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  ApiResponse,
  TableColumn,
  TableConfig,
  TableFilters,
  TableState,
} from "../types/table.types";

export const useUiTableStore = defineStore(
  "ui-table",
  () => {
    // ============================
    // STATE
    // ============================
    const tables = ref<Record<string, TableState>>({});

    // ============================
    // GETTERS
    // ============================
    const getTable = (tableId: string) => tables.value[tableId];

    const getTableData = (tableId: string) => tables.value[tableId]?.data || [];

    const isLoading = (tableId: string) =>
      tables.value[tableId]?.loading || false;

    const getError = (tableId: string) => tables.value[tableId]?.error || null;

    const getFilters = (tableId: string) => tables.value[tableId]?.filters;

    const getSort = (tableId: string) => tables.value[tableId]?.sort;

    const getPagination = (tableId: string) =>
      tables.value[tableId]?.pagination;

    const getColumns = (tableId: string) =>
      tables.value[tableId]?.columns || [];

    const getVisibleColumns = (tableId: string) =>
      tables.value[tableId]?.columns.filter((col) => col.visible !== false) ||
      [];

    const getRowIdKey = (tableId: string) =>
      tables.value[tableId]?.rowIdKey || "id";

    const getSelectedRowIds = (tableId: string) =>
      tables.value[tableId]?.selectedRowIds || [];

    const isRowSelected = (tableId: string, rowId: string | number) =>
      tables.value[tableId]?.selectedRowIds.includes(rowId) || false;

    const getColumnByKey = (tableId: string, columnKey: string) =>
      tables.value[tableId]?.columns.find((col) => col.key === columnKey);

    const isInitialized = (tableId: string) =>
      tables.value[tableId]?.initialized || false;

    // Advanced getters
    const hasData = (tableId: string) =>
      (tables.value[tableId]?.data?.length || 0) > 0;

    const isEmpty = (tableId: string) =>
      !isLoading(tableId) && !hasData(tableId);

    const hasError = (tableId: string) => !!tables.value[tableId]?.error;

    const canGoNext = (tableId: string) => {
      const pagination = getPagination(tableId);
      return pagination
        ? pagination.currentPage < pagination.totalPages
        : false;
    };

    const canGoPrevious = (tableId: string) => {
      const pagination = getPagination(tableId);
      return pagination ? pagination.currentPage > 1 : false;
    };

    const getSearchQuery = (tableId: string) =>
      tables.value[tableId]?.filters?.search || "";

    const isSortedBy = (tableId: string, columnKey: string) =>
      tables.value[tableId]?.sort?.column === columnKey;

    const getSortDirection = (tableId: string, columnKey: string) => {
      const sort = getSort(tableId);
      return sort?.column === columnKey ? sort.order : null;
    };

    // ============================
    // ACTIONS
    // ============================

    const initializeTable = (
      tableId: string,
      columns: TableColumn[],
      config: TableConfig = {},
    ) => {
      const {
        defaultPerPage = 10,
        defaultSortBy = null,
        defaultSortOrder = null,
        rowIdKey = "id",
      } = config;

      const initializedColumns = columns.map((col) => ({
        ...col,
        visible: col.visible !== false,
      }));

      tables.value[tableId] = {
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
        columns: initializedColumns,
        rowIdKey,
        selectedRowIds: [],
        initialized: true,
      };
    };

    const setLoading = (tableId: string, loading: boolean) => {
      if (tables.value[tableId]) {
        tables.value[tableId].loading = loading;
      }
    };

    const setError = (tableId: string, error: string | null) => {
      if (tables.value[tableId]) {
        tables.value[tableId].error = error;
      }
    };

    const updateTableData = (tableId: string, response: ApiResponse) => {
      const table = tables.value[tableId];
      if (!table) return;

      table.data = response.data;
      table.pagination = {
        currentPage: response.meta.current_page,
        perPage: response.meta.per_page,
        total: response.meta.total,
        totalPages: response.meta.last_page,
      };
      table.error = null;
      const availableIds = new Set(
        table.data
          .map((row: any) => row?.[table.rowIdKey])
          .filter((id: string | number) => id !== undefined),
      );
      table.selectedRowIds = table.selectedRowIds.filter((id) =>
        availableIds.has(id),
      );
    };

    const setSearch = (tableId: string, search: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.filters.search = search;
      table.pagination.currentPage = 1; // Reset to first page on search
    };

    const setSort = (tableId: string, column: string) => {
      const table = tables.value[tableId];
      if (!table) return;

      const currentSort = table.sort;

      // Toggle sort: asc -> desc -> null -> asc
      if (currentSort.column === column) {
        if (currentSort.order === "asc") {
          currentSort.order = "desc";
        } else if (currentSort.order === "desc") {
          currentSort.column = null;
          currentSort.order = null;
        } else {
          currentSort.order = "asc";
        }
      } else {
        table.sort = { column, order: "asc" };
      }

      table.pagination.currentPage = 1; // Reset to first page on sort
    };


    const setPage = (tableId: string, page: number) => {
      const table = tables.value[tableId];
      if (!table) return;

      const validPage = Math.max(
        1,
        Math.min(page, table.pagination.totalPages || 1),
      );

      table.pagination = {
        ...table.pagination,
        currentPage: validPage,
      };
    };

    const nextPage = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table || !canGoNext(tableId)) return;
      table.pagination.currentPage += 1;
    };

    const previousPage = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table || !canGoPrevious(tableId)) return;
      table.pagination.currentPage -= 1;
    };

    const firstPage = (tableId: string) => {
      setPage(tableId, 1);
    };

    const lastPage = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      setPage(tableId, table.pagination.totalPages);
    };

    const setPerPage = (tableId: string, perPage: number) => {
      const table = tables.value[tableId];
      if (!table) return;

      table.pagination = {
        ...table.pagination,
        perPage,
        currentPage: 1, 
      };
    };

    const toggleColumnVisibility = (tableId: string, columnKey: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      const column = table.columns.find((col) => col.key === columnKey);
      if (column) {
        column.visible = !column.visible;
      }
    };

    const setColumnVisibility = (
      tableId: string,
      columnKey: string,
      visible: boolean,
    ) => {
      const table = tables.value[tableId];
      if (!table) return;
      const column = table.columns.find((col) => col.key === columnKey);
      if (column) {
        column.visible = visible;
      }
    };

    const showAllColumns = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.columns.forEach((col) => (col.visible = true));
    };

    const hideAllColumns = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.columns.forEach((col) => (col.visible = false));
    };

    const setFilters = (tableId: string, filters: Partial<TableFilters>) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.filters = { ...table.filters, ...filters };
      table.pagination.currentPage = 1; // Reset to first page on filter change
    };

    const clearFilters = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.filters = { search: "" };
      table.pagination.currentPage = 1;
    };

    const resetTable = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.filters = { search: "" };
      table.pagination.currentPage = 1;
      table.sort = { column: null, order: null };
      table.error = null;
      table.selectedRowIds = [];
    };

    const resetTableFull = (tableId: string, config: TableConfig = {}) => {
      const table = tables.value[tableId];
      if (!table) return;

      const {
        defaultPerPage = 10,
        defaultSortBy = null,
        defaultSortOrder = null,
      } = config;

      table.filters = { search: "" };
      table.sort = { column: defaultSortBy, order: defaultSortOrder };
      table.pagination = {
        currentPage: 1,
        perPage: defaultPerPage,
        total: 0,
        totalPages: 0,
      };
      table.error = null;
      table.selectedRowIds = [];
    };

    const destroyTable = (tableId: string) => {
      delete tables.value[tableId];
    };

    const clearData = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.data = [];
      table.pagination.total = 0;
      table.pagination.totalPages = 0;
      table.selectedRowIds = [];
    };

    const toggleRowSelection = (
      tableId: string,
      rowId: string | number,
    ) => {
      const table = tables.value[tableId];
      if (!table) return;
      if (table.selectedRowIds.includes(rowId)) {
        table.selectedRowIds = table.selectedRowIds.filter(
          (id) => id !== rowId,
        );
      } else {
        table.selectedRowIds = [...table.selectedRowIds, rowId];
      }
    };

    const setRowSelection = (
      tableId: string,
      rowIds: Array<string | number>,
    ) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.selectedRowIds = rowIds;
    };

    const clearSelection = (tableId: string) => {
      const table = tables.value[tableId];
      if (!table) return;
      table.selectedRowIds = [];
    };

    // Bulk operations
    const updateMultipleColumns = (
      tableId: string,
      updates: Array<{ key: string; visible: boolean }>,
    ) => {
      const table = tables.value[tableId];
      if (!table) return;

      updates.forEach(({ key, visible }) => {
        const column = table.columns.find((col) => col.key === key);
        if (column) {
          column.visible = visible;
        }
      });
    };

    // ============================
    // RETURN
    // ============================
    return {
      // State
      tables,

      // Getters
      getTable,
      getTableData,
      isLoading,
      getError,
      getFilters,
      getSort,
      getPagination,
      getColumns,
      getVisibleColumns,
      getRowIdKey,
      getSelectedRowIds,
      isRowSelected,
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

      // Actions
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
      toggleRowSelection,
      setRowSelection,
      clearSelection,
    };
  },
  {
    persist: {
      key: "ui-table-store",
      storage: localStorage,
      // paths: ["tables"],
    },
  },
);
