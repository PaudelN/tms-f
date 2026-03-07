// composables/useKanbanInteractions.ts
//
// Per-stage reactive state. Accepts UniversalFetchFn — the same type as
// UiTable and UiList. Internally adds kanbanStage to params, so the caller
// (the page) never has to know about kanban-specific fetch logic.
//
// SEARCH — external: pass `searchQuery` ref from `useUniversalInteractions()`.
// FILTER — external: pass `commonFilter` ref from `useUniversalInteractions()`.
// Both trigger a debounced full reload so the server receives updated params.

import { reactive, ref, watch, type Ref } from "vue";
import type { UniversalFetchFn } from "../types/universal.types";
import type { KanbanConfig, KanbanStageState } from "../types/kanban.types";

export function useKanbanInteractions<T extends Record<string, any>>(
  stageValues: string[],
  fetchFn: UniversalFetchFn<T>,
  config?: KanbanConfig,
  externalSearch?: Ref<string>,
  externalFilter?: Ref<Record<string, any> | null>,
) {
  const pageSize = config?.pageSize ?? 10;
  const debounceMs = config?.debounceMs ?? 350;

  const searchQuery = ref(externalSearch?.value ?? "");
  const filterQuery = ref<Record<string, any> | null>(
    externalFilter?.value ?? null,
  );

  const stageStates = reactive<Record<string, KanbanStageState<T>>>({});
  const inFlight = new Set<string>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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

  // ── Core fetch ──────────────────────────────────────────────────────────────

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
        filters: filterQuery.value,
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

  // ── Public helpers ──────────────────────────────────────────────────────────

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

  /** @deprecated — use externalSearch Ref instead */
  function handleSearch(value: string): void {
    searchQuery.value = value;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => reload(), debounceMs);
  }

  async function initialize(): Promise<void> {
    await Promise.all(stageValues.map((sv) => fetchPage(sv, 1, false)));
  }

  // ── Watch external search ───────────────────────────────────────────────────

  if (externalSearch) {
    watch(externalSearch, (value) => {
      searchQuery.value = value;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => reload(), debounceMs);
    });
  }

  // ── Watch external filter ───────────────────────────────────────────────────

  if (externalFilter) {
    watch(
      externalFilter,
      (value) => {
        filterQuery.value = value;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => reload(), debounceMs);
      },
      { deep: true },
    );
  }

  return {
    stageStates,
    searchQuery,
    filterQuery,
    loadMore,
    reload,
    handleSearch,
    initialize,
  };
}
