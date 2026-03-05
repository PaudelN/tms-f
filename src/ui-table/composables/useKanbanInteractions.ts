// ─────────────────────────────────────────────────────────────────────────────
// composables/useKanbanInteractions.ts
//
// Self-contained composable for UiKanban.vue.
// Manages per-stage pagination state, infinite scroll, search debounce,
// optimistic drag-drop (move + reorder), and error recovery.
//
// No Pinia store required — all state is local.
// ─────────────────────────────────────────────────────────────────────────────

import { useDebounceFn } from "@vueuse/core";
import { onMounted, reactive, ref } from "vue";
import type {
  DragContext,
  KanbanConfig,
  KanbanFetchFn,
  KanbanFetchParams,
  Stage,
  StageState,
} from "../types/kanban.types";

// ── Factory ────────────────────────────────────────────────────────────────────

function makeStageState<T>(): StageState<T> {
  return {
    items: [],
    currentPage: 0,
    totalPages: 0,
    total: 0,
    hasMore: true,
    isInitialLoading: true,
    isLoadingMore: false,
    error: null,
  };
}

// ── Composable ─────────────────────────────────────────────────────────────────

export function useKanbanInteractions<T extends Record<string, any> = any>(
  kanbanId: string,
  stages: Stage[],
  fetchFn: KanbanFetchFn<T>,
  config: KanbanConfig = {},
) {
  const {
    pageSize = 10,
    debounceMs = 300,
    defaultSortBy = null,
    defaultSortOrder = null,
  } = config;

  // ── Per-stage reactive state ────────────────────────────────────────────────
  // Using a reactive Map so Vue tracks mutations on stage entries.
  const stageStates = reactive(new Map<string, StageState<T>>());

  // Initialise an entry for every stage upfront
  for (const stage of stages) {
    stageStates.set(stage.value, makeStageState<T>());
  }

  // In-flight guard per stage — prevents duplicate concurrent fetches
  const fetchInProgress = new Map<string, boolean>();

  // ── Query state ─────────────────────────────────────────────────────────────
  const searchQuery = ref("");
  const sortKey = ref<string | null>(defaultSortBy);
  const sortOrder = ref<"asc" | "desc" | null>(defaultSortOrder);
  const externalFilters = ref<Record<string, any>>({});

  // ── Drag state ──────────────────────────────────────────────────────────────
  const dragCtx = ref<DragContext | null>(null);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  async function fetchPage(
    stageValue: string,
    page: number,
    append: boolean,
  ): Promise<void> {
    if (fetchInProgress.get(stageValue)) return;
    fetchInProgress.set(stageValue, true);

    const state = stageStates.get(stageValue);
    if (!state) return;

    if (append) {
      state.isLoadingMore = true;
    } else {
      state.isInitialLoading = true;
      state.error = null;
    }

    const params: KanbanFetchParams = {
      stage: stageValue,
      page,
      perPage: pageSize,
      search: searchQuery.value,
      sortBy: sortKey.value,
      sortOrder: sortOrder.value,
      filters: externalFilters.value,
    };

    try {
      const res = await fetchFn(params);
      const incoming = res.data as T[];

      state.total = res.meta.total;
      state.totalPages = res.meta.last_page;
      state.currentPage = res.meta.current_page;
      state.hasMore = res.meta.current_page < res.meta.last_page;

      if (append) {
        state.items = [...state.items, ...incoming];
      } else {
        state.items = incoming;
      }
    } catch (err: any) {
      state.error = err?.message ?? "Failed to load items";
      console.error(`[useKanbanInteractions:${kanbanId}:${stageValue}]`, err);
    } finally {
      state.isInitialLoading = false;
      state.isLoadingMore = false;
      fetchInProgress.set(stageValue, false);
    }
  }

  // ── Public actions ──────────────────────────────────────────────────────────

  /**
   * Load the next page for a specific stage.
   * Called by the per-column IntersectionObserver sentinel.
   */
  async function loadMore(stageValue: string): Promise<void> {
    const state = stageStates.get(stageValue);
    if (
      !state ||
      !state.hasMore ||
      state.isLoadingMore ||
      state.isInitialLoading
    )
      return;
    await fetchPage(stageValue, state.currentPage + 1, true);
  }

  /**
   * Hard-reload one stage (or all if no stageValue given).
   * Clears items and re-fetches page 1.
   */
  async function reload(stageValue?: string): Promise<void> {
    const targets = stageValue ? [stageValue] : stages.map((s) => s.value);

    for (const sv of targets) {
      const state = stageStates.get(sv);
      if (state) {
        state.items = [];
        state.currentPage = 0;
        state.hasMore = true;
      }
    }

    await Promise.all(targets.map((sv) => fetchPage(sv, 1, false)));
  }

  // ── Optimistic drag-drop mutations ──────────────────────────────────────────

  /**
   * Move an item from one stage to another.
   * The item is spliced out of the source stage and inserted at `toIndex`
   * (or appended to the end) in the target stage.
   * No re-fetch is triggered — the caller is responsible for syncing with
   * the backend and calling reload() if reconciliation is needed.
   */
  function moveItem(
    item: T,
    fromStage: string,
    toStage: string,
    toIndex?: number,
  ): void {
    const from = stageStates.get(fromStage);
    const to = stageStates.get(toStage);
    if (!from || !to) return;

    // Remove from source
    const srcIdx = from.items.findIndex((i) => i === item);
    if (srcIdx !== -1) {
      from.items.splice(srcIdx, 1);
      from.total = Math.max(0, from.total - 1);
    }

    // Insert into target
    const insertAt = toIndex != null ? toIndex : to.items.length;
    to.items.splice(insertAt, 0, item);
    to.total += 1;
  }

  /**
   * Reorder a card within the same stage.
   */
  function reorderItem(
    stageValue: string,
    fromIndex: number,
    toIndex: number,
  ): void {
    const state = stageStates.get(stageValue);
    if (!state || fromIndex === toIndex) return;

    const [item] = state.items.splice(fromIndex, 1);
    state.items.splice(toIndex, 0, item);
  }

  // ── Drag state helpers ──────────────────────────────────────────────────────

  function startDrag(ctx: DragContext): void {
    dragCtx.value = ctx;
  }

  function endDrag(): void {
    dragCtx.value = null;
  }

  // ── Search / filter ─────────────────────────────────────────────────────────

  const debouncedReload = useDebounceFn(() => reload(), debounceMs);

  function handleSearch(val: string): void {
    searchQuery.value = val;
    debouncedReload();
  }

  function setFilters(filters: Record<string, any>): void {
    externalFilters.value = filters;
    reload();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  onMounted(() => {
    // Fetch all stages concurrently on mount
    Promise.all(stages.map((s) => fetchPage(s.value, 1, false)));
  });

  // ── Return ───────────────────────────────────────────────────────────────────

  return {
    stageStates,
    dragCtx,
    searchQuery,
    loadMore,
    reload,
    moveItem,
    reorderItem,
    startDrag,
    endDrag,
    handleSearch,
    setFilters,
  };
}
