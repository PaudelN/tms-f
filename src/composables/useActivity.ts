import axios from "@/lib/axios";
import type {
  ActivityCategory,
  ActivityItem,
  ActivityPaginationMeta,
} from "@/types/activity.types";
import { computed, ref } from "vue";

// ─── Module-level cache ───────────────────────────────────────────────────────
interface CacheEntry {
  items: ActivityItem[];
  meta: ActivityPaginationMeta;
  ts: number;
}

const CACHE_TTL_MS = 5 * 60 * 1_000;
const _cache = new Map<string, CacheEntry>();
const _inflight = new Map<
  string,
  Promise<{ items: ActivityItem[]; meta: ActivityPaginationMeta }>
>();

function buildCacheKey(
  entityType: string,
  entityId: number,
  category: ActivityCategory,
  page: number,
) {
  return `${entityType}::${entityId}::${category}::${page}`;
}

function getCached(key: string): CacheEntry | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  return entry;
}

export function invalidateActivityCache(entityType: string, entityId: number) {
  for (const k of _cache.keys()) {
    if (k.startsWith(`${entityType}::${entityId}::`)) _cache.delete(k);
  }
}

const FALLBACK_META: ActivityPaginationMeta = {
  total: 0,
  per_page: 20,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
  has_more: false,
};

// ─── Composable ──────────────────────────────────────────────────────────────
export function useActivity(entityType: string, entityId: number) {
  const activities = ref<ActivityItem[]>([] as ActivityItem[]);
  const meta = ref<ActivityPaginationMeta | null>(null);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const activeCategory = ref<ActivityCategory>("all");

  const hasMore = computed(() => {
    if (!meta.value) return false;
    return (
      meta.value.has_more || meta.value.current_page < meta.value.last_page
    );
  });

  const groupedByDate = computed(() => {
    // Defensive: always treat activities.value as array
    const list = Array.isArray(activities.value) ? activities.value : [];
    const groups: Record<string, ActivityItem[]> = {};
    for (const item of list) {
      if (!groups[item.date_label]) groups[item.date_label] = [];
      groups[item.date_label].push(item);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, items }));
  });

  function _setActivities(value: ActivityItem[]) {
    activities.value = Array.isArray(value) ? value : [];
  }

  function _merge(incoming: ActivityItem[], replace: boolean) {
    const safeIncoming = Array.isArray(incoming) ? incoming : [];
    const current = Array.isArray(activities.value) ? activities.value : [];

    if (replace) {
      activities.value = safeIncoming;
      return;
    }

    const existingIds = new Set(current.map((a) => a.id));

    activities.value = [
      ...current,
      ...safeIncoming.filter((a) => !existingIds.has(a.id)),
    ];
  }

  async function _fetch(page: number, replace: boolean): Promise<void> {
    const category = activeCategory.value;
    const key = buildCacheKey(entityType, entityId, category, page);

    // 1. Cache hit
    const cached = getCached(key);
    if (cached) {
      _merge(cached.items, replace);
      meta.value = cached.meta;
      return;
    }

    // 2. In-flight dedup
    if (_inflight.has(key)) {
      const result = await _inflight.get(key)!;
      _merge(result.items, replace);
      meta.value = result.meta;
      return;
    }

    // 3. API request
    // Confirmed response shape from backend (Paginatable::formatPaginatedResponse):
    // {
    //   "status": "success",
    //   "data": [],              ← plain array (NOT ResourceCollection wrapper)
    //   "meta": { total, per_page, current_page, last_page, from, to, has_more },
    //   "links": { first, last, prev, next }
    // }
    // So items = res.data.data  (plain array)
    //    meta  = res.data.meta
    const params: Record<string, unknown> = { page, per_page: 20 };
    if (category !== "all") params.category = category;

    const promise = axios
      .get(`/${entityType}/${entityId}/activities`, { params })
      .then((res) => {
        const body = res.data;

        const raw = body?.data;

        const items: ActivityItem[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : [];

        const parsedMeta: ActivityPaginationMeta = {
          ...FALLBACK_META,
          ...(body?.meta ?? {}),
        };

        _cache.set(key, { items, meta: parsedMeta, ts: Date.now() });
        return { items, meta: parsedMeta };
      })
      .finally(() => {
        _inflight.delete(key);
      });

    _inflight.set(key, promise);

    const result = await promise;
    _merge(result.items, replace);
    meta.value = result.meta;
  }

  async function load() {
    if (isLoading.value) return;
    isLoading.value = true;
    error.value = null;
    currentPage.value = 1;
    try {
      await _fetch(1, true);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load activity";
      _setActivities([]);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return;
    isLoadingMore.value = true;
    const nextPage = currentPage.value + 1;
    try {
      await _fetch(nextPage, false);
      currentPage.value = nextPage;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load more";
    } finally {
      isLoadingMore.value = false;
    }
  }

  async function changeCategory(cat: ActivityCategory) {
    if (activeCategory.value === cat && activities.value.length > 0) return;
    activeCategory.value = cat;
    currentPage.value = 1;
    _setActivities([]);
    meta.value = null;
    await load();
  }

  function insertRealtimeActivity(item: ActivityItem) {
    if (!Array.isArray(activities.value)) _setActivities([]);
    if (activities.value.some((a) => a.id === item.id)) return;
    activities.value = [item, ...activities.value];
    invalidateActivityCache(entityType, entityId);
  }

  return {
    activities,
    groupedByDate,
    meta,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    activeCategory,
    load,
    loadMore,
    changeCategory,
    insertRealtimeActivity,
  };
}
