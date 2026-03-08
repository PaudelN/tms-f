// kanban.types.ts

export interface KanbanStageDefinition {
  value: string;
  label: string;
  color?: string;
  dot?: string;
  colorClass?: string;
  textClass?: string;
  borderClass?: string;
  wipLimit?: number;
}

export interface KanbanMoveEvent<T> {
  item: T;
  fromStage: string;
  toStage: string;
  newIndex: number;
}

export interface KanbanReorderEvent {
  stage: string;
  orderedIds: (string | number)[];
}

export interface KanbanMovePayload {
  model_id: number | string;
  column_id: string;
}

export interface KanbanConfig {
  columnWidth?: string;
  stageKey?: string;
  perPage?: number;
}

export interface KanbanFeatures {
  dragDrop?: boolean;
  intraStageReorder?: boolean;
}

export interface KanbanColumnMeta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface KanbanColumnPayload<T> {
  data: T[];
  meta: KanbanColumnMeta;
}

/**
 * Shape returned by GET /workspaces/kanban/board (and equivalent entity endpoints).
 * Key = stage value (e.g. "active"), value = paginated column data.
 */

export type KanbanBoardData<T> = Record<string, KanbanColumnPayload<T>>;

export interface KanbanBoardResponse<T> {
  data: KanbanBoardData<T>;
}

export interface KanbanBoardFetchParams {
  search?: string;
  perPage?: number;
  filters?: Record<string, any> | null | undefined;
}

/**
 * The function signature passed to UiKanban as `boardFetchFn`.
 * Each entity store exposes one of these pointing at its board endpoint.
 */
export type KanbanBoardFetchFn<T> = (
  params: KanbanBoardFetchParams,
) => Promise<KanbanBoardResponse<T>>;
