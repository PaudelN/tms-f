// composables/useKanbanApi.ts
//
// Typed HTTP wrapper for kanban endpoints.
// One instance per entity, created in the page component.
//
// Fetch uses GET /api/{entity}?kanban_stage={stage}
// — the SAME index endpoint as UiTable/UiList, just with an extra param.
// The backend detects ?kanban_stage= and applies KanbanService::fetchStage().
//
// Move   → POST /api/{entity}/kanban/move
// Reorder → POST /api/{entity}/kanban/reorder

import axios from "@/lib/axios";

export interface KanbanPageMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface KanbanApiResponse<T = any> {
  data: T[];
  meta: KanbanPageMeta;
}

export interface KanbanMovePayload {
  model_id: number | string;
  column_id: string;
}

export interface KanbanReorderPayload {
  stage_value: string;
  ordered_ids: (number | string)[];
  last_ordered_at?: string | null;
}

export interface KanbanApiInstance<T = any> {
  fetchStage(
    stage: string,
    page?: number,
    perPage?: number,
    search?: string,
  ): Promise<KanbanApiResponse<T>>;
  move(payload: KanbanMovePayload): Promise<void>;
  reorder(payload: KanbanReorderPayload): Promise<void>;
}

export function useKanbanApi<T = any>(baseUrl: string): KanbanApiInstance<T> {
  const base = baseUrl.replace(/\/+$/, "");

  async function fetchStage(
    stage: string,
    page = 1,
    perPage = 10,
    search = "",
  ): Promise<KanbanApiResponse<T>> {
    const params = new URLSearchParams({
      kanban_stage: stage,
      page: String(page),
      per_page: String(perPage),
    });
    if (search.trim()) params.set("search", search.trim());
    const { data } = await axios.get<KanbanApiResponse<T>>(
      `${base}?${params.toString()}`,
    );
    return data;
  }

  async function move(payload: KanbanMovePayload): Promise<void> {
    await axios.post(`${base}/kanban/move`, payload);
  }

  async function reorder(payload: KanbanReorderPayload): Promise<void> {
    await axios.post(`${base}/kanban/reorder`, payload);
  }

  return { fetchStage, move, reorder };
}
