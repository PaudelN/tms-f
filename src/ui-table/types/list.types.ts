// ─────────────────────────────────────────────────────────────────────────────
// list.types.ts
// ─────────────────────────────────────────────────────────────────────────────

import type {
  UniversalApiResponse,
  UniversalFetchFn,
  UniversalFetchParams,
} from "./universal.types";

// Re-export shared types under list-idiomatic names.
export type { UniversalFetchParams as ListFetchParams };
export type { UniversalApiResponse as ListApiResponse };

/**
 * The fetch function UiList accepts.
 * Identical to UniversalFetchFn / TableFetchFn — same shape as all views.
 */
export type ListFetchFn<T = any> = UniversalFetchFn<T>;

// ── Enums ──────────────────────────────────────────────────────────────────

export type ListDensity = "compact" | "default" | "comfortable";
export type ListSortOrder = "asc" | "desc" | null;

// ── Config ─────────────────────────────────────────────────────────────────

export interface ListConfig {
  /** Items per page. Default: 20 */
  pageSize?: number;
  /** Debounce ms for search. Default: 300 */
  debounceMs?: number;
  defaultSortBy?: string | null;
  defaultSortOrder?: ListSortOrder;
  defaultGroupBy?: string | null;
  /** IntersectionObserver threshold for infinite scroll. Default: 0.1 */
  sentinelThreshold?: number;
}

// ── Feature toggles ────────────────────────────────────────────────────────

export interface ListSortOption {
  key: string;
  label: string;
}

export interface ListGroupOption {
  key: string;
  label: string;
}

export interface ListFeatures {
  groupBy?: ListGroupOption[];
  sortOptions?: ListSortOption[];
}

// ── Internal grouping ──────────────────────────────────────────────────────

export interface ListGroup<T = any> {
  key: string;
  label: string | null;
  items: T[];
}

// ── Composable return shape ────────────────────────────────────────────────

export interface UseListInteractionsReturn<T = any> {
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
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
  handleSearch: (val: string) => void;
  handleSort: (key: string | null, order: ListSortOrder) => void;
  setGroupBy: (key: string | null) => void;
}
