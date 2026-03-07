// ─────────────────────────────────────────────────────────────────────────────
// types/universal.types.ts
// ─────────────────────────────────────────────────────────────────────────────

// All entities must implement this minimum contract so UiKanban can key items.
export interface UniversalEntity {
  id: number | string;
  [key: string]: any;
}

export interface UniversalMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface UniversalApiResponse<T = any> {
  data: T[];
  meta: UniversalMeta;
}

// Shared fetch params used by UiTable, UiList, and store kanban fetchers.
export interface UniversalFetchParams {
  page: number;
  perPage: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: "asc" | "desc" | null;
  kanbanStage?: string;
  /**
   * Arbitrary filter params forwarded directly to the backend as query params.
   * Each key maps to a BaseFilter method name (creator, created_from, tags, sort…).
   * The store's fetchFn is responsible for spreading these into axios params.
   */
  filters?: Record<string, any>;
}

export type UniversalFetchFn<T = any> = (
  params: UniversalFetchParams,
) => Promise<UniversalApiResponse<T>>;

export type ViewMode = "table" | "list" | "kanban";
