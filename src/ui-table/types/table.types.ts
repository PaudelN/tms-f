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

export interface ApiResponse<T = any> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

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
}

export interface TableState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  filters: TableFilters;
  sort: SortState;
  pagination: PaginationState;
  columns: TableColumn<T>[];
  selectedRowIds: string[];
  initialized: boolean;
}

export type TableFetchFn<T = any> = (params: {
  page: number;
  perPage: number;
  search: string;
  sortBy: string | null;
  sortOrder: "asc" | "desc" | null;
  filters?: Record<string, any>;
}) => Promise<ApiResponse<T>>;

export type ViewMode = "table" | "list" | "kanban";

export interface KanbanColumn<T = any> {
  id: string | number;
  title: string;
  items?: T[];
}

export interface TableAction<T = any> {
  label: string;
  icon?: any;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  show?: (row: T) => boolean;
}

export interface BulkAction<T = any> {
  label: string;
  icon?: any;
  onClick: (selectedRows: T[]) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  disabled?: (selectedRows: T[]) => boolean;
}
