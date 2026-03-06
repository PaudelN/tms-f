// composables/useKanbanInteractions.ts
//
// Per-stage reactive state. Accepts UniversalFetchFn — the same type as
// UiTable and UiList. Internally adds kanbanStage to params, so the caller
// (the page) never has to know about kanban-specific fetch logic.

import { reactive, ref } from "vue";
import type { UniversalFetchFn } from "../types/universal.types";
import type { KanbanConfig, KanbanStageState } from "../types/kanban.types";

export function useKanbanInteractions<T extends Record<string, any>>(
  stageValues: string[],
  fetchFn: UniversalFetchFn<T>,
  config?: KanbanConfig,
) {
  const pageSize = config?.pageSize ?? 10;
  const debounceMs = config?.debounceMs ?? 350;

  // Plain Record — NOT Map. Fixes UnwrapRefSimple<T> TypeScript error with reactive Maps.
  const stageStates = reactive<Record<string, KanbanStageState<T>>>({});
  const searchQuery = ref("");
  const inFlight = new Set<string>();
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  for (const sv of stageValues) {
    stageStates[sv] = makeEmpty();
  }

  function makeEmpty(): KanbanStageState<T> {
    return {
      items: [],
      currentPage: 0,
      totalPages: 1,
      total: 0,
      hasMore: true,
      isInitialLoading: true,
      isLoadingMore: false,
      error: null,
    };
  }

  async function fetchPage(
    stage: string,
    page: number,
    append: boolean,
  ): Promise<void> {
    if (inFlight.has(stage)) return;
    inFlight.add(stage);

    const state = stageStates[stage];
    if (!state) {
      inFlight.delete(stage);
      return;
    }

    try {
      if (append) {
        state.isLoadingMore = true;
      } else {
        state.isInitialLoading = true;
        state.error = null;
      }

      // Same fetchFn the table/list use — just adds kanbanStage.
      // This results in GET /api/{entity}?kanban_stage={stage}&page={page}&per_page={perPage}
      const res = await fetchFn({
        page,
        perPage: pageSize,
        search: searchQuery.value,
        sortBy: null,
        sortOrder: null,
        kanbanStage: stage,
      });

      const incoming = res.data as T[];
      state.items = append ? ([...state.items, ...incoming] as T[]) : incoming;
      state.currentPage = res.meta.current_page;
      state.totalPages = res.meta.last_page;
      state.total = res.meta.total;
      state.hasMore = res.meta.current_page < res.meta.last_page;
    } catch (err: any) {
      state.error =
        err?.response?.data?.message ?? err?.message ?? "Failed to load";
    } finally {
      state.isInitialLoading = false;
      state.isLoadingMore = false;
      inFlight.delete(stage);
    }
  }

  async function loadMore(stage: string): Promise<void> {
    const state = stageStates[stage];
    if (
      !state ||
      !state.hasMore ||
      state.isLoadingMore ||
      state.isInitialLoading
    )
      return;
    await fetchPage(stage, state.currentPage + 1, true);
  }

  async function reload(stage?: string): Promise<void> {
    const targets = stage ? [stage] : stageValues;
    for (const sv of targets) {
      const state = stageStates[sv];
      if (state) Object.assign(state, makeEmpty());
    }
    await Promise.all(targets.map((sv) => fetchPage(sv, 1, false)));
  }

  function handleSearch(value: string): void {
    searchQuery.value = value;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => reload(), debounceMs);
  }

  async function initialize(): Promise<void> {
    await Promise.all(stageValues.map((sv) => fetchPage(sv, 1, false)));
  }

  return {
    stageStates,
    searchQuery,
    loadMore,
    reload,
    handleSearch,
    initialize,
  };
}
