// lib/useRequestCache.ts
// ─────────────────────────────────────────────────────────────────────────────
// Enhanced request cache — all documented issues addressed:
//
//  ✅ 1. GC              — expired entries pruned on a timer, zero memory leak
//  ✅ 2. SWR             — stale data returned instantly, background re-fetch fires
//  ✅ 3. Auto-invalidate  — withCacheInvalidation() wrapper; mutations can't forget
//  ✅ 4. Over-caching     — keyFn + invalidateWhere for coarse/partial control
//  ✅ 5. Tag invalidation — globalCacheRegistry.invalidateTag() busts N caches at once
//  ✅ 6. Optimistic UI    — optimisticUpdate() patches in-memory entries instantly
//  ✅ 7. Retry            — exponential back-off, configurable attempts
// ─────────────────────────────────────────────────────────────────────────────

import { ActivityCategory } from "@/types/activity.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RequestCacheOptions {
  /**
   * How long (ms) a response is considered fully fresh.
   * Calls within this window return cached data instantly, no network.
   * Default: 30 000 (30 s)
   */
  ttlMs?: number;

  /**
   * Extra window (ms) after ttlMs during which stale data is still returned
   * instantly while a background re-fetch runs silently (Stale-While-Revalidate).
   * Default: 10 000 (10 s)
   *
   * Timeline per cache entry:
   *   |────── fresh (ttlMs) ──────|── SWR (swrMs) ──|── hard miss ──|
   *                               ^ stale data served instantly
   *                                 + background fetch fires once
   */
  swrMs?: number;

  /**
   * Custom key builder. Default: stable JSON.stringify (sorted keys).
   * Override to coarsen the cache — e.g. ignore page/perPage so all paginated
   * requests for the same filters share a single cache entry.
   */
  keyFn?: (params: unknown) => string;

  /**
   * Tag strings for group invalidation via globalCacheRegistry.
   * e.g. tags: ['projects', 'workspace:1']
   * Then: globalCacheRegistry.invalidateTag('projects') busts this cache
   * plus every other cache registered with that tag.
   */
  tags?: string[];

  /**
   * Max retry attempts when a fetch fails. 0 = no retries. Default: 2
   */
  maxRetries?: number;

  /**
   * Base delay (ms) for exponential back-off. Default: 300
   * Actual delays: 300 ms, 600 ms, 1 200 ms …
   */
  retryDelay?: number;

  /**
   * How often (ms) the GC sweep runs to prune fully-expired entries.
   * Default: 60 000 (60 s). Set 0 to disable (e.g. in unit tests).
   */
  gcIntervalMs?: number;
}

interface CacheEntry<TResult> {
  data: TResult;
  /** Entry is fully fresh until here — no network call made */
  expiresAt: number;
  /** Entry is stale-but-usable until here — background re-fetch fires */
  swrUntil: number;
}

export type CachedFn<TParams, TResult> = {
  (params: TParams): Promise<TResult>;

  /**
   * Bust one entry by params, or the whole cache (no args).
   * Always call this after a successful mutation.
   */
  invalidate(params?: TParams): void;

  /** Bust every entry whose serialised key satisfies the predicate. */
  invalidateWhere(predicate: (key: string) => boolean): void;

  /**
   * Patch every cached entry in-place without waiting for a network round-trip.
   * The TTL/SWR windows are preserved — the entry still expires on schedule.
   *
   * Example — mark one item as archived across all cached pages:
   *   fetchProjects.optimisticUpdate(res => ({
   *     ...res,
   *     data: res.data.map(p => p.id === id ? { ...p, is_archived: true } : p),
   *   }))
   */
  optimisticUpdate(updater: (data: TResult) => TResult): void;

  /** Stop the GC timer and deregister from the tag registry. */
  destroy(): void;
};

// ── Global tag registry ───────────────────────────────────────────────────────
// A plain singleton Map.  createRequestCache registers its invalidate() here.
// Any code can call globalCacheRegistry.invalidateTag('projects') to bust
// every cache that carries that tag in one shot.

interface CacheRegistry {
  /** Bust every cache registered under this tag. */
  invalidateTag(tag: string): void;
  /** @internal — called by createRequestCache */
  _register(tag: string, fn: () => void): void;
  /** @internal — called by destroy() */
  _unregister(tag: string, fn: () => void): void;
}

export const globalCacheRegistry: CacheRegistry = (() => {
  const map = new Map<string, Set<() => void>>();
  return {
    invalidateTag(tag) {
      map.get(tag)?.forEach((fn) => fn());
    },
    _register(tag, fn) {
      if (!map.has(tag)) map.set(tag, new Set());
      map.get(tag)!.add(fn);
    },
    _unregister(tag, fn) {
      map.get(tag)?.delete(fn);
    },
  };
})();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** JSON.stringify with sorted keys — makes { page:1, perPage:10 } === { perPage:10, page:1 } */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  const sorted = Object.keys(value as object)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = (value as Record<string, unknown>)[k];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

/** Retry fn up to maxRetries times with exponential back-off */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, baseDelay * 2 ** attempt));
      }
    }
  }
  throw lastErr;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createRequestCache<TParams, TResult>(
  fetchFn: (params: TParams) => Promise<TResult>,
  options: RequestCacheOptions = {},
): CachedFn<TParams, TResult> {
  const {
    ttlMs = 30_000,
    swrMs = 10_000,
    keyFn,
    tags = [],
    maxRetries = 2,
    retryDelay = 300,
    gcIntervalMs = 60_000,
  } = options;

  const cache = new Map<string, CacheEntry<TResult>>();
  const inflight = new Map<string, Promise<TResult>>();

  function buildKey(p: TParams): string {
    return keyFn ? keyFn(p) : stableStringify(p);
  }

  // ── GC timer ───────────────────────────────────────────────────────────────
  let gcHandle: ReturnType<typeof setInterval> | null = null;
  if (gcIntervalMs > 0) {
    gcHandle = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (entry.swrUntil < now) cache.delete(key);
      }
    }, gcIntervalMs);
    // Don't hold the Node.js process open
    if (gcHandle && typeof gcHandle === "object" && "unref" in gcHandle) {
      (gcHandle as any).unref();
    }
  }

  // ── Internal fetch (with retry) ────────────────────────────────────────────
  function doFetch(params: TParams): Promise<TResult> {
    return withRetry(() => fetchFn(params), maxRetries, retryDelay);
  }

  function storeResult(key: string, data: TResult): TResult {
    const now = Date.now();
    cache.set(key, {
      data,
      expiresAt: now + ttlMs,
      swrUntil: now + ttlMs + swrMs,
    });
    inflight.delete(key);
    return data;
  }

  // ── Main callable ──────────────────────────────────────────────────────────
  const cachedFn = async function (params: TParams): Promise<TResult> {
    const key = buildKey(params);
    const now = Date.now();
    const hit = cache.get(key);

    // 1 ── Fully fresh ────────────────────────────────────────────────────────
    if (hit && now < hit.expiresAt) {
      return hit.data;
    }

    // 2 ── Stale-While-Revalidate ──────────────────────────────────────────────
    //      Return stale data instantly; kick off ONE background refresh
    if (hit && now < hit.swrUntil) {
      if (!inflight.has(key)) {
        const bg = doFetch(params)
          .then((data) => storeResult(key, data))
          .catch(() => {
            inflight.delete(key);
          }); // silent — stale still served
        inflight.set(key, bg as Promise<TResult>);
      }
      return hit.data;
    }

    // 3 ── In-flight dedup ─────────────────────────────────────────────────────
    const pending = inflight.get(key);
    if (pending) return pending;

    // 4 ── Hard miss — block until fetch resolves ──────────────────────────────
    const promise = doFetch(params)
      .then((data) => storeResult(key, data))
      .catch((err) => {
        inflight.delete(key);
        throw err;
      });

    inflight.set(key, promise);
    return promise;
  } as CachedFn<TParams, TResult>;

  // ── invalidate ─────────────────────────────────────────────────────────────
  cachedFn.invalidate = (params?: TParams) => {
    if (params === undefined) {
      cache.clear();
      return;
    }
    cache.delete(buildKey(params));
  };

  cachedFn.invalidateWhere = (predicate: (key: string) => boolean) => {
    for (const key of cache.keys()) {
      if (predicate(key)) cache.delete(key);
    }
  };

  // ── optimisticUpdate ───────────────────────────────────────────────────────
  cachedFn.optimisticUpdate = (updater: (data: TResult) => TResult) => {
    for (const [key, entry] of cache.entries()) {
      cache.set(key, { ...entry, data: updater(entry.data) });
    }
  };

  // ── destroy ────────────────────────────────────────────────────────────────
  const boundInvalidate = () => cachedFn.invalidate();

  cachedFn.destroy = () => {
    if (gcHandle) clearInterval(gcHandle);
    tags.forEach((tag) =>
      globalCacheRegistry._unregister(tag, boundInvalidate),
    );
    cache.clear();
  };

  // ── tag registration ───────────────────────────────────────────────────────
  tags.forEach((tag) => globalCacheRegistry._register(tag, boundInvalidate));

  return cachedFn;
}

// ── withCacheInvalidation ─────────────────────────────────────────────────────
// Wraps any mutation function so the cache is ALWAYS busted after it runs —
// even when it throws. Eliminates the human error of forgetting .invalidate().
//
// Accepts three target shapes:
//   single fn:   withCacheInvalidation(mutFn, fetchProjects)
//   array:       withCacheInvalidation(mutFn, [fetchProjects, fetchKanbanBoard])
//   tags:        withCacheInvalidation(mutFn, { tags: ['projects', 'workspace:1'] })

type InvalidationTarget =
  | CachedFn<any, any>
  | CachedFn<any, any>[]
  | { tags: string[] };

export function withCacheInvalidation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  targets: InvalidationTarget,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await mutationFn(...args);
    } finally {
      // finally = runs whether mutationFn resolves OR rejects
      if (Array.isArray(targets)) {
        targets.forEach((fn) => fn.invalidate());
      } else if ("invalidate" in targets) {
        (targets as CachedFn<any, any>).invalidate();
      } else {
        targets.tags.forEach((tag) => globalCacheRegistry.invalidateTag(tag));
      }
    }
  };
}

export function buildActivityCacheKey(
  entityType: string,
  entityId: number,
  category: ActivityCategory,
  page: number,
): string {
  return `activity::${entityType}::${entityId}::${category}::${page}`;
}
 
