// composables/useKanbanApi.ts
//
// Generic HTTP transport for any kanban-enabled entity.
// Zero knowledge of workspaces, projects, or any domain model.
//
// The CALLER (index.vue) is responsible for constructing the correct base URL.
// This composable just calls whatever URL it receives.
//
// ── Quick usage ───────────────────────────────────────────────────────────────
//
//  Flat entity (workspaces):
//    const api = useKanbanApi('/workspaces')
//
//  Nested entity — dynamic getter (recommended for anything with a parent ID):
//    const api = useKanbanApi(() => `workspaces/${workspaceId.value}/projects`)
//
//  Nested entity — using resolveNestedUrl helper (for shallow routing):
//    const api = useKanbanApi(
//      resolveNestedUrl(
//        (id) => `workspaces/${id}/projects`,
//        [
//          () => route.params.workspaceId,   // try route first
//          () => workspaceStore.current?.id, // then store
//          () => projectStore.projects[0]?.workspace_id, // then any loaded item
//        ],
//      ),
//    )
//
// ── Wire to UiKanban without boilerplate ─────────────────────────────────────
//
//  <UiKanban @move="api.handleMove" @reorder="api.handleReorder" />
//
//  handleMove / handleReorder convert UiKanban's camelCase event shape to the
//  backend's snake_case payload automatically.

import axios from "@/lib/axios";

// ── Payload types — match your backend exactly ────────────────────────────────

export interface KanbanMovePayload {
  model_id: number | string;
  column_id: string;
}

export interface KanbanReorderPayload {
  stage_value: string;
  ordered_ids: (number | string)[];
  last_ordered_at?: string | null;
}

// ── Response types ────────────────────────────────────────────────────────────

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

// ── Instance interface ────────────────────────────────────────────────────────

export interface KanbanApiInstance<T = any> {
  /** GET {base}?kanban_stage=…&page=…&per_page=…&search=… */
  fetchStage(
    stage: string,
    page?: number,
    perPage?: number,
    search?: string,
    filters?: Record<string, any>,
  ): Promise<KanbanApiResponse<T>>;

  /** POST {base}/kanban/move  →  { model_id, column_id } */
  move(payload: KanbanMovePayload): Promise<void>;

  /** POST {base}/kanban/reorder  →  { stage_value, ordered_ids } */
  reorder(payload: KanbanReorderPayload): Promise<void>;

  /**
   * Drop-in handler for UiKanban's @move event.
   * Converts { item, toStage } → { model_id, column_id } automatically.
   *
   * Usage: <UiKanban @move="api.handleMove" />
   */
  handleMove(event: {
    item: T & { id: number | string };
    toStage: string;
  }): Promise<void>;

  /**
   * Drop-in handler for UiKanban's @reorder event.
   * Converts { stage, orderedIds } → { stage_value, ordered_ids } automatically.
   *
   * Usage: <UiKanban @reorder="api.handleReorder" />
   */
  handleReorder(event: {
    stage: string;
    orderedIds: (string | number)[];
  }): Promise<void>;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function useKanbanApi<T = any>(
  /**
   * The base URL for this entity's kanban endpoints.
   *
   * String — use when the URL never changes:
   *   useKanbanApi('/workspaces')
   *
   * Getter — use when the URL contains reactive values that must be
   * re-evaluated on every API call. This is the safe default for any
   * entity nested under a parent:
   *   useKanbanApi(() => `workspaces/${workspaceId.value}/projects`)
   *
   * The getter is called at the moment of each HTTP request — never stale.
   */
  baseUrl: string | (() => string),
): KanbanApiInstance<T> {
  /** Called fresh before every request. Strips leading/trailing slashes. */
  function resolvedBase(): string {
    const raw = typeof baseUrl === "function" ? baseUrl() : baseUrl;
    return raw.replace(/^\/+|\/+$/g, "");
  }

  // ── fetchStage ──────────────────────────────────────────────────────────────

  async function fetchStage(
    stage: string,
    page = 1,
    perPage = 50,
    search = "",
    filters: Record<string, any> = {},
  ): Promise<KanbanApiResponse<T>> {
    const params: Record<string, string> = {
      kanban_stage: stage,
      page: String(page),
      per_page: String(perPage),
    };

    if (search.trim()) params["search"] = search.trim();

    for (const [k, v] of Object.entries(filters)) {
      if (v !== null && v !== undefined && v !== "") params[k] = String(v);
    }

    const { data } = await axios.get<KanbanApiResponse<T>>(
      `/${resolvedBase()}?${new URLSearchParams(params)}`,
    );
    return data;
  }

  // ── move ────────────────────────────────────────────────────────────────────

  async function move(payload: KanbanMovePayload): Promise<void> {
    if (!payload.model_id)
      throw new Error("[useKanbanApi] move: model_id is required");
    if (!payload.column_id)
      throw new Error("[useKanbanApi] move: column_id is required");
    await axios.post(`/${resolvedBase()}/kanban/move`, payload);
  }

  // ── reorder ─────────────────────────────────────────────────────────────────

  async function reorder(payload: KanbanReorderPayload): Promise<void> {
    if (!payload.stage_value)
      throw new Error("[useKanbanApi] reorder: stage_value is required");
    if (
      !Array.isArray(payload.ordered_ids) ||
      payload.ordered_ids.length === 0
    ) {
      throw new Error(
        "[useKanbanApi] reorder: ordered_ids must be a non-empty array",
      );
    }
    await axios.post(`/${resolvedBase()}/kanban/reorder`, payload);
  }

  // ── Convenience event handlers ────────────────────────────────────────────
  // Wire these directly to @move and @reorder on <UiKanban>.
  // They handle the camelCase→snake_case conversion so no page ever has to.

  async function handleMove(event: {
    item: T & { id: number | string };
    toStage: string;
  }): Promise<void> {
    await move({
      model_id: event.item.id,
      column_id: event.toStage,
    });
  }

  async function handleReorder(event: {
    stage: string;
    orderedIds: (string | number)[];
  }): Promise<void> {
    await reorder({
      stage_value: event.stage, // UiKanban: 'stage'      → backend: 'stage_value'
      ordered_ids: event.orderedIds, // UiKanban: 'orderedIds' → backend: 'ordered_ids'
    });
  }

  return { fetchStage, move, reorder, handleMove, handleReorder };
}

// ── resolveNestedUrl ──────────────────────────────────────────────────────────
//
// Builds a reactive URL getter for entities that live under a parent.
// Completely generic — no workspace/project knowledge here.
//
// You supply:
//   buildUrl   — how to construct the URL from the resolved parent ID
//   idSources  — ordered list of functions to try; first valid value wins
//
// Example — projects under workspaces with shallow routing:
//
//   const api = useKanbanApi<Project>(
//     resolveNestedUrl(
//       (id) => `workspaces/${id}/projects`,
//       [
//         () => route.params.workspaceId,        // nested route param
//         () => route.params.workspace,           // alternative param name
//         () => workspaceStore.current?.id,       // Pinia store
//         () => projectStore.projects[0]?.workspace_id, // loaded item fallback
//       ],
//     ),
//   )
//
// Example — tasks under projects:
//
//   const api = useKanbanApi<Task>(
//     resolveNestedUrl(
//       (id) => `projects/${id}/tasks`,
//       [
//         () => route.params.projectId,
//         () => taskStore.tasks[0]?.project_id,
//       ],
//     ),
//   )

export function resolveNestedUrl(
  /** Builds the entity path from the resolved parent ID. */
  buildUrl: (parentId: number | string) => string,

  /**
   * Ordered list of ID sources.
   * Each is called in sequence; the first truthy, non-NaN value wins.
   * Vue Router params (string | string[]) are handled automatically.
   */
  idSources: Array<() => number | string | null | undefined | string[]>,
): () => string {
  return (): string => {
    for (const source of idSources) {
      const raw = source();
      const val = Array.isArray(raw) ? raw[0] : raw;

      if (val === null || val === undefined || val === "") continue;

      const n = Number(val);
      if (!isNaN(n) && n > 0) return buildUrl(n);

      // Non-numeric IDs (slugs, UUIDs)
      if (typeof val === "string" && val.trim()) return buildUrl(val.trim());
    }

    console.warn(
      "[useKanbanApi] resolveNestedUrl: no ID source returned a valid value.",
      "Check that at least one source is populated before API calls are made.",
    );
    return buildUrl("__unresolved__");
  };
}
