import type { Component } from "vue";

// Core table column definition
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

// Sort state
export interface SortState {
  column: string | null;
  order: "asc" | "desc" | null;
}

// Pagination state
export interface PaginationState {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// Table filters
export interface TableFilters {
  search: string;
  [key: string]: any;
}

// API response structure
export interface ApiResponse<T = any> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Table configuration
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

// Table state (stored in Pinia)
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

// Fetch function type
export type TableFetchFn<T = any> = (params: {
  page: number;
  perPage: number;
  search: string;
  sortBy: string | null;
  sortOrder: "asc" | "desc" | null;
  filters?: Record<string, any>;
}) => Promise<ApiResponse<T>>;

// View mode type for navigation
export type ViewMode = "table" | "list" | "kanban";

// Kanban column type
export interface KanbanColumn<T = any> {
  id: string | number;
  title: string;
  items?: T[];
  color?: string;
  icon?: string;
}

// List item type
export interface ListItem {
  [key: string]: any;
}

// Export utility types
export type TableColumnKey<T> = keyof T | string;
export type TableRow<T = any> = T;

// Action types for table interactions
export interface TableAction<T = any> {
  label: string;
  icon?: Component;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  show?: (row: T) => boolean;
}

// Bulk action types
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

// Table event types
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
