// composables/useListInteractions.ts

import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref, watch, type Ref } from "vue";
import type {
  ListApiResponse,
  ListConfig,
  ListFetchFn,
  ListFetchParams,
  ListGroup,
  ListSortOrder,
} from "../types/list.types";

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function useListInteractions<T extends Record<string, any> = any>(
  listId: string,
  fetchFn: ListFetchFn<T>,
  config: ListConfig = {},
  // widened to | undefined so toRef on an optional prop works without casting
  externalFilter?: Ref<Record<string, any> | null | undefined>,
) {
  const {
    pageSize = 20,
    debounceMs = 300,
    defaultSortBy = null,
    defaultSortOrder = null,
    defaultGroupBy = null,
  } = config;

  const loadedItems = ref<T[]>([]);
  const currentPage = ref(0);
  const totalCount = ref(0);
  const totalPages = ref(0);
  const hasMore = ref(true);
  const isInitialLoading = ref(true);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);
  const fetchInProgress = ref(false);

  const searchQuery = ref("");
  const sortKey = ref<string | null>(defaultSortBy);
  const sortOrder = ref<ListSortOrder>(defaultSortOrder);
  const groupByKey = ref<string | null>(defaultGroupBy);

  const newItemIndexes = ref<Set<number>>(new Set());
  let newItemClearTimer: ReturnType<typeof setTimeout> | null = null;

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
        // null → undefined so it satisfies UniversalFetchParams.filters?: Record | undefined
        filters: externalFilter?.value ?? undefined,
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

  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoadingMore.value || fetchInProgress.value) return;
    await fetchPage(currentPage.value + 1, true);
  }

  async function reload(): Promise<void> {
    currentPage.value = 0;
    hasMore.value = true;
    loadedItems.value = [];
    newItemIndexes.value = new Set();
    await fetchPage(1, false);
  }

  const debouncedReload = useDebounceFn(reload, debounceMs);

  function handleSearch(val: string): void {
    searchQuery.value = val;
    debouncedReload();
  }

  function handleSort(key: string | null, order: ListSortOrder): void {
    sortKey.value = key;
    sortOrder.value = order;
    reload();
  }

  function setGroupBy(key: string | null): void {
    groupByKey.value = key;
  }

  if (externalFilter) {
    watch(externalFilter, () => debouncedReload(), { deep: true });
  }

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
    const entries = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return entries.map(([key, items]) => ({ key, label: key, items }));
  });

  const loadedCount = computed(() => loadedItems.value.length);
  const isEmpty = computed(
    () => !isInitialLoading.value && loadedItems.value.length === 0,
  );
  const hasError = computed(() => !!error.value);
  const loadProgress = computed(() =>
    totalCount.value > 0
      ? Math.min(100, Math.round((loadedCount.value / totalCount.value) * 100))
      : 0,
  );

  onMounted(() => {
    fetchPage(1, false);
  });

  return {
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
    loadMore,
    reload,
    handleSearch,
    handleSort,
    setGroupBy,
  };
}
