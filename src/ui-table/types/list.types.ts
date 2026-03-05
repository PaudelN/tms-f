// ─────────────────────────────────────────────────────────────────────────────
// list.types.ts
// All TypeScript types consumed by UiList.vue and useListInteractions.ts
// ─────────────────────────────────────────────────────────────────────────────

export type ListDensity = "compact" | "default" | "comfortable";
export type ListSortOrder = "asc" | "desc" | null;

// ── Fetch contract ────────────────────────────────────────────────────────────

export interface ListFetchParams {
  page: number;
  perPage: number;
  search: string;
  sortBy: string | null;
  sortOrder: ListSortOrder;
}

export interface ListApiMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ListApiResponse<T = any> {
  data: T[];
  meta: ListApiMeta;
}

export type ListFetchFn<T = any> = (
  params: ListFetchParams,
) => Promise<ListApiResponse<T>>;

// ── Configuration ─────────────────────────────────────────────────────────────

export interface ListConfig {
  /** Items per page fetched on each scroll trigger. Default: 20 */
  pageSize?: number;
  /** Debounce ms for search input. Default: 300 */
  debounceMs?: number;
  /** Default sort column key */
  defaultSortBy?: string | null;
  /** Default sort direction */
  defaultSortOrder?: ListSortOrder;
  /** Default group-by key */
  defaultGroupBy?: string | null;
  /** Intersection threshold for infinite scroll sentinel. Default: 0.1 */
  sentinelThreshold?: number;
}

// ── Feature toggles ───────────────────────────────────────────────────────────

export interface ListSortOption {
  /** Must match a key on your item objects (supports dot-notation: "user.name") */
  key: string;
  label: string;
}

export interface ListGroupOption {
  /** Must match a key on your item objects (supports dot-notation) */
  key: string;
  label: string;
}

export interface ListFeatures {
  groupBy?: ListGroupOption[];
  sortOptions?: ListSortOption[];
}

// ── Internal grouping model ───────────────────────────────────────────────────

export interface ListGroup<T = any> {
  /** Unique identifier for this group (group value or '__all__') */
  key: string;
  /** Display label; null = no grouping active */
  label: string | null;
  items: T[];
}

// ── Composable return shape ───────────────────────────────────────────────────

export interface UseListInteractionsReturn<T = any> {
  // Reactive state
  loadedItems: Readonly<T[]>;
  groupedItems: Readonly<ListGroup<T>[]>;
  hasMore: boolean;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalCount: number;
  loadedCount: number;
  loadProgress: number;
  isEmpty: boolean;
  hasError: boolean;
  searchQuery: string;
  sortKey: string | null;
  sortOrder: ListSortOrder;
  groupByKey: string | null;
  newItemIndexes: Set<number>;
  // Actions
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
  handleSearch: (val: string) => void;
  handleSort: (key: string | null, order: ListSortOrder) => void;
  setGroupBy: (key: string | null) => void;
}
