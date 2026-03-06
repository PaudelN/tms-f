// ─────────────────────────────────────────────────────────────────────────────
// table.types.ts
// ─────────────────────────────────────────────────────────────────────────────

import type { Component } from "vue";
import type {
  UniversalApiResponse,
  UniversalFetchFn,
  UniversalFetchParams,
} from "./universal.types";

// Re-export shared types under table-idiomatic names so existing UiTable
// code keeps working without changes.
export type { ViewMode } from "./universal.types";
export type { UniversalFetchParams as TableFetchParams };
export type { UniversalApiResponse as ApiResponse };

/**
 * The fetch function UiTable accepts.
 * Identical to UniversalFetchFn — same shape as UiList and UiKanban.
 * Alias exists so existing imports of TableFetchFn still compile.
 */
export type TableFetchFn<T = any> = UniversalFetchFn<T>;

// ── Table column ───────────────────────────────────────────────────────────

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  formatter?: (value: any, row: T) => string;
  cellClass?: string | ((row: T) => string);
  headerClass?: string;
}

// ── Sort / pagination ──────────────────────────────────────────────────────

export interface SortState {
  column: string | null;
  order: "asc" | "desc" | null;
}

export interface PaginationState {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface TableFilters {
  search: string;
  [key: string]: any;
}

// ── Config ─────────────────────────────────────────────────────────────────

export interface TableConfig {
  defaultPerPage?: number;
  defaultSortBy?: string | null;
  defaultSortOrder?: "asc" | "desc" | null;
  debounceMs?: number;
  persistState?: boolean;
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
  pageSizes?: number[];
  showSearch?: boolean;
  showColumnToggle?: boolean;
  showRefresh?: boolean;
  mobileView?: "table" | "list";
  emptyMessage?: string;
  errorMessage?: string;
}

// ── Internal state ─────────────────────────────────────────────────────────

export interface TableState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  filters: TableFilters;
  sort: SortState;
  pagination: PaginationState;
  columns: TableColumn<T>[];
  initialized: boolean;
}

// ── Actions ────────────────────────────────────────────────────────────────

export interface TableAction<T = any> {
  label: string;
  icon?: Component;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  show?: (row: T) => boolean;
}

export interface BulkAction<T = any> {
  label: string;
  icon?: Component;
  onClick: (selectedRows: T[]) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  disabled?: (selectedRows: T[]) => boolean;
}

export interface TableSelectionConfig<T = any> {
  enabled?: boolean;
  rowKey?: keyof T | string;
  onChange?: (selectedRows: T[]) => void;
}

export interface TableFeatures<T = any> {
  selection?: TableSelectionConfig<T>;
  rowActions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
}

// ── Events ─────────────────────────────────────────────────────────────────

export interface TableEvents<T = any> {
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  onCellClick?: (row: T, columnKey: string) => void;
  onSort?: (columnKey: string, order: "asc" | "desc" | null) => void;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onSearch?: (searchTerm: string) => void;
  onRefresh?: () => void;
}

// ── Utility aliases ────────────────────────────────────────────────────────

export type TableColumnKey<T> = keyof T | string;
export type TableRow<T = any> = T;
export type ListItem = Record<string, any>;
