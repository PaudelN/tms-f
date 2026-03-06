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
  search: string;
  sortBy: string | null;
  sortOrder: "asc" | "desc" | null;
  // Present only when fetching for kanban — maps to ?kanban_stage= on the backend.
  kanbanStage?: string;
}

export type UniversalFetchFn<T = any> = (
  params: UniversalFetchParams,
) => Promise<UniversalApiResponse<T>>;

export type ViewMode = "table" | "list" | "kanban";
