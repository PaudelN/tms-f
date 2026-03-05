// ─────────────────────────────────────────────────────────────────────────────
// composables/useListInteractions.ts
//
// Self-contained list composable for UiList.vue.
// Handles: infinite scroll pagination, search debounce, sort, client-side
// grouping, new-item tracking for fade-in animations, and error recovery.
//
// No Pinia store required — all state lives here.
// ─────────────────────────────────────────────────────────────────────────────

import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import type {
  ListApiResponse,
  ListConfig,
  ListFetchFn,
  ListFetchParams,
  ListGroup,
  ListSortOrder,
} from "../types/list.types";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Resolve dot-notation paths on an object.
 * e.g. getNestedValue(item, 'user.name') => item.user?.name
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// ── Composable ─────────────────────────────────────────────────────────────────

export function useListInteractions<T extends Record<string, any> = any>(
  listId: string,
  fetchFn: ListFetchFn<T>,
  config: ListConfig = {},
) {
  const {
    pageSize = 20,
    debounceMs = 300,
    defaultSortBy = null,
    defaultSortOrder = null,
    defaultGroupBy = null,
  } = config;

  // ── Core state ──────────────────────────────────────────────────────────────
  const loadedItems = ref<T[]>([]);
  const currentPage = ref(0);
  const totalCount = ref(0);
  const totalPages = ref(0);
  const hasMore = ref(true);
  const isInitialLoading = ref(true);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);
  const fetchInProgress = ref(false);

  // ── Query state ─────────────────────────────────────────────────────────────
  const searchQuery = ref("");
  const sortKey = ref<string | null>(defaultSortBy);
  const sortOrder = ref<ListSortOrder>(defaultSortOrder);
  const groupByKey = ref<string | null>(defaultGroupBy);

  // ── Animation tracking ──────────────────────────────────────────────────────
  /** Global indexes (in loadedItems) of items that just arrived — for fade-in */
  const newItemIndexes = ref<Set<number>>(new Set());
  let newItemClearTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Core fetch ──────────────────────────────────────────────────────────────

  async function fetchPage(page: number, append: boolean): Promise<void> {
    if (fetchInProgress.value) return;
    fetchInProgress.value = true;

    if (append) {
      isLoadingMore.value = true;
    } else {
      isInitialLoading.value = true;
      error.value = null;
    }

    try {
      const params: ListFetchParams = {
        page,
        perPage: pageSize,
        search: searchQuery.value,
        sortBy: sortKey.value,
        sortOrder: sortOrder.value,
      };

      const res: ListApiResponse<T> = await fetchFn(params);

      totalCount.value = res.meta.total;
      totalPages.value = res.meta.last_page;
      currentPage.value = res.meta.current_page;
      hasMore.value = res.meta.current_page < res.meta.last_page;

      const incoming = res.data as T[];

      if (append) {
        const startIdx = loadedItems.value.length;

        // Clear any pending timer and schedule a fresh one
        if (newItemClearTimer) clearTimeout(newItemClearTimer);
        newItemIndexes.value = new Set(incoming.map((_, i) => startIdx + i));
        newItemClearTimer = setTimeout(() => {
          newItemIndexes.value = new Set();
        }, 900);

        loadedItems.value = [...loadedItems.value, ...incoming];
      } else {
        loadedItems.value = incoming;
        newItemIndexes.value = new Set();
      }
    } catch (err: any) {
      error.value = err?.message ?? "Failed to load items";
      console.error(`[useListInteractions:${listId}]`, err);
    } finally {
      isInitialLoading.value = false;
      isLoadingMore.value = false;
      fetchInProgress.value = false;
    }
  }

  // ── Public actions ──────────────────────────────────────────────────────────

  /** Triggered by IntersectionObserver sentinel in UiList.vue */
  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoadingMore.value || fetchInProgress.value) return;
    await fetchPage(currentPage.value + 1, true);
  }

  /** Hard reset — clears all items and re-fetches page 1 */
  async function reload(): Promise<void> {
    currentPage.value = 0;
    hasMore.value = true;
    loadedItems.value = [];
    newItemIndexes.value = new Set();
    await fetchPage(1, false);
  }

  // Debounced version for search keystrokes
  const debouncedReload = useDebounceFn(reload, debounceMs);

  /** Called when externalSearch prop changes (propagated from UiHeader) */
  function handleSearch(val: string): void {
    searchQuery.value = val;
    debouncedReload();
  }

  /** Re-fetch from page 1 with new sort params */
  function handleSort(key: string | null, order: ListSortOrder): void {
    sortKey.value = key;
    sortOrder.value = order;
    reload();
  }

  /** Client-side grouping key — no re-fetch required */
  function setGroupBy(key: string | null): void {
    groupByKey.value = key;
  }

  // ── Grouping (client-side, runs over all loaded items) ──────────────────────

  const groupedItems = computed<ListGroup<T>[]>(() => {
    if (!groupByKey.value) {
      return [{ key: "__all__", label: null, items: loadedItems.value as T[] }];
    }

    const path = groupByKey.value;
    const map = new Map<string, T[]>();

    for (const item of loadedItems.value as T[]) {
      const raw = getNestedValue(item, path);
      const val = raw != null ? String(raw) : "Unknown";
      if (!map.has(val)) map.set(val, []);
      map.get(val)!.push(item);
    }

    // Sort groups alphabetically for consistency
    const entries = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return entries.map(([key, items]) => ({ key, label: key, items }));
  });

  // ── Derived ─────────────────────────────────────────────────────────────────

  const loadedCount = computed(() => loadedItems.value.length);
  const isEmpty = computed(
    () => !isInitialLoading.value && loadedItems.value.length === 0,
  );
  const hasError = computed(() => !!error.value);

  /** Percentage of total items currently loaded (0–100) */
  const loadProgress = computed(() =>
    totalCount.value > 0
      ? Math.min(100, Math.round((loadedCount.value / totalCount.value) * 100))
      : 0,
  );

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  onMounted(() => {
    fetchPage(1, false);
  });

  // ── Return ───────────────────────────────────────────────────────────────────

  return {
    // State
    loadedItems,
    groupedItems,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    error,
    totalCount,
    loadedCount,
    loadProgress,
    isEmpty,
    hasError,
    searchQuery,
    sortKey,
    sortOrder,
    groupByKey,
    newItemIndexes,
    // Actions
    loadMore,
    reload,
    handleSearch,
    handleSort,
    setGroupBy,
  };
}
