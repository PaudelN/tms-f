// composables/useKanbanInteractions.ts
//
// Per-stage reactive state.  Accepts UniversalFetchFn — the same type as
// UiTable and UiList.  Internally adds kanbanStage to params, so the caller
// (the page) never has to know about kanban-specific fetch logic.
//
// ── SEARCH ──────────────────────────────────────────────────────────────────
// Search is now EXTERNAL: pass the `searchQuery` ref from
// `useUniversalInteractions()` as `externalSearch`.
//
// When `externalSearch` changes the composable debounces a full reload so the
// server receives the updated ?search= param.  There is no internal search bar
// inside UiKanban — the UiHeader search bar drives everything.

import { ref, watch, type Ref } from "vue";
import { reactive } from "vue";
import type { UniversalFetchFn } from "../types/universal.types";
import type { KanbanConfig, KanbanStageState } from "../types/kanban.types";

export function useKanbanInteractions<T extends Record<string, any>>(
  stageValues: string[],
  fetchFn: UniversalFetchFn<T>,
  config?: KanbanConfig,
  /**
   * Pass `searchQuery` from `useUniversalInteractions()` here.
   * The composable watches it and triggers a debounced server reload.
   * If omitted, search is ignored (kanban shows all items).
   */
  externalSearch?: Ref<string>,
) {
  const pageSize = config?.pageSize ?? 10;
  const debounceMs = config?.debounceMs ?? 350;

  // Internal mirror of the external search so we can read it in fetchPage
  const searchQuery = ref(externalSearch?.value ?? "");

  // Plain Record — NOT Map.  Fixes UnwrapRefSimple<T> TypeScript error.
  const stageStates = reactive<Record<string, KanbanStageState<T>>>({});
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

  // ── Core fetch ──────────────────────────────────────────────────────────
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

  // ── Public helpers ──────────────────────────────────────────────────────
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

  /**
   * @deprecated — kept for backwards compatibility only.
   * Prefer passing `externalSearch` and letting the watcher drive reloads.
   */
  function handleSearch(value: string): void {
    searchQuery.value = value;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => reload(), debounceMs);
  }

  async function initialize(): Promise<void> {
    await Promise.all(stageValues.map((sv) => fetchPage(sv, 1, false)));
  }

  // ── Watch externalSearch ────────────────────────────────────────────────
  // When the UiHeader search query changes, debounce a full server reload
  // so every stage re-fetches with the new ?search= parameter.
  if (externalSearch) {
    watch(externalSearch, (value) => {
      searchQuery.value = value;
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => reload(), debounceMs);
    });
  }

  return {
    stageStates,
    searchQuery, // still exposed so callers can read it
    loadMore,
    reload,
    handleSearch, // deprecated but non-breaking
    initialize,
  };
}
