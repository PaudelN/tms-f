// ─────────────────────────────────────────────────────────────────────────────
// kanban.types.ts
// All TypeScript types consumed by UiKanban.vue, KanbanCard.vue,
// and useKanbanInteractions.ts
// ─────────────────────────────────────────────────────────────────────────────

// ── Stage (comes from backend via store.fetchStatuses / store.statuses) ───────

export interface Stage {
  /** API identifier used to filter items for this column */
  value: string;
  /** Human-readable column title */
  label: string;
  /** Tailwind class string for the dot colour, e.g. "bg-emerald-500" */
  dot: string;
  /** Optional WIP limit – enforced in UI, validated on drop */
  wipLimit?: number;
}

// ── Fetch contract ────────────────────────────────────────────────────────────

export interface KanbanFetchParams {
  /** Stage value being fetched (used to build the API filter) */
  stage: string;
  page: number;
  perPage: number;
  search: string;
  sortBy: string | null;
  sortOrder: "asc" | "desc" | null;
  /** Arbitrary extra filters forwarded from UiHeader filter panel */
  filters?: Record<string, any>;
}

export interface KanbanApiMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface KanbanApiResponse<T = any> {
  data: T[];
  meta: KanbanApiMeta;
}

export type KanbanFetchFn<T = any> = (
  params: KanbanFetchParams,
) => Promise<KanbanApiResponse<T>>;

// ── Configuration ─────────────────────────────────────────────────────────────

export interface KanbanConfig {
  /** Items fetched per stage per page. Default: 10 */
  pageSize?: number;
  /** Debounce ms applied to externalSearch changes. Default: 300 */
  debounceMs?: number;
  /** Default sort column key forwarded to the fetch fn. Default: null */
  defaultSortBy?: string | null;
  /** Default sort order. Default: null */
  defaultSortOrder?: "asc" | "desc" | null;
  /** Width in px/rem of each column, CSS value. Default: '280px' */
  columnWidth?: string;
}

// ── Feature toggles ───────────────────────────────────────────────────────────

export interface KanbanFeatures {
  /** Enable HTML5 drag-and-drop between and within stages. Default: true */
  dragDrop?: boolean;
  /** Allow reordering cards inside the same stage. Default: true */
  intraStageReorder?: boolean;
}

// ── Per-stage internal state (lives inside the composable) ────────────────────

export interface StageState<T = any> {
  items: T[];
  currentPage: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

// ── Drag-and-drop context shared between composable & component ───────────────

export interface DragContext {
  /** Item being dragged */
  item: any;
  /** Stage value the drag started from */
  fromStage: string;
  /** Index inside fromStage */
  fromIndex: number;
}

// ── Composable return shape ───────────────────────────────────────────────────

export interface UseKanbanInteractionsReturn<T = any> {
  stageStates: Map<string, StageState<T>>;
  dragCtx: DragContext | null;
  searchQuery: string;
  // Per-stage actions
  loadMore: (stageValue: string) => Promise<void>;
  reload: (stageValue?: string) => Promise<void>;
  // Cross-stage mutation (optimistic)
  moveItem: (
    item: T,
    fromStage: string,
    toStage: string,
    toIndex?: number,
  ) => void;
  reorderItem: (stage: string, fromIndex: number, toIndex: number) => void;
  // Drag state helpers
  startDrag: (ctx: DragContext) => void;
  endDrag: () => void;
  // Query
  handleSearch: (val: string) => void;
}
