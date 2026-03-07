// composables/useUniversalInteractions.ts
// ─────────────────────────────────────────────────────────────────────────────
// Changes vs original:
//   + applyFilters(filters)  — batch-apply from UiFilter; replaces activeFilters
//   + commonFilter           — computed ref consumed as :external-filter on UiTable
//                              (and later on UiList / UiKanban)
//   + activeFilterCount      — now derived from activeFilters (was already there)
//   ~ setFilter / clearFilter stay — for any future immediate/inline filter use
// ─────────────────────────────────────────────────────────────────────────────

import { useDebounceFn } from "@vueuse/core";
import { computed, ref } from "vue";
import type { ActiveFilters } from "../../types/filter.types";

export interface SortOption {
  column: string | null;
  order: "asc" | "desc" | null;
}

export interface FilterState {
  search: string;
  sort: SortOption;
  [key: string]: any;
}

export interface UseUniversalInteractionsOptions {
  debounceMs?: number;
  onSearch?: (value: string) => void;
  onSort?: (column: string | null, order: "asc" | "desc" | null) => void;
  onFilter?: (filters: ActiveFilters) => void;
}

export function useUniversalInteractions(
  options: UseUniversalInteractionsOptions = {},
) {
  const { debounceMs = 300, onSearch, onSort, onFilter } = options;

  // ── State ─────────────────────────────────────────────────────────────────
  const searchQuery = ref("");
  const sort = ref<SortOption>({ column: null, order: null });

  /**
   * activeFilters is the single source of truth for applied filters.
   *
   * Updated by:
   *   applyFilters(filters)          ← batch apply from UiFilter "Apply" button
   *   setFilter(key, value)          ← immediate single-key update (inline use)
   *   clearFilter(key)               ← remove one filter key
   *   clearAllFilters()              ← wipe everything
   */
  const activeFilters = ref<ActiveFilters>({});

  // ── Derived ───────────────────────────────────────────────────────────────
  /**
   * Number of non-empty filters currently applied.
   * Drives the badge shown on UiHeader's filter button.
   */
  const activeFilterCount = computed(
    () =>
      Object.values(activeFilters.value).filter((v) => {
        if (v == null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      }).length,
  );

  /**
   * Ready-to-use object for :external-filter on UiTable / UiList / UiKanban.
   * The store's fetchFn is responsible for mapping these to axios query params.
   */
  const commonFilter = computed<ActiveFilters>(() => ({
    ...activeFilters.value,
  }));

  // ── Search ────────────────────────────────────────────────────────────────
  const _fireSearch = useDebounceFn((value: string) => {
    onSearch?.(value);
  }, debounceMs);

  function handleSearch(value: string) {
    searchQuery.value = value;
    _fireSearch(value);
  }

  function clearSearch() {
    searchQuery.value = "";
    onSearch?.("");
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  function handleSort(column: string | null, order: "asc" | "desc" | null) {
    sort.value = { column, order };
    onSort?.(column, order);
  }

  function clearSort() {
    sort.value = { column: null, order: null };
    onSort?.(null, null);
  }

  // ── Filters — batch (UiFilter) ────────────────────────────────────────────
  /**
   * Called by UiFilter when the user clicks "Apply".
   * Replaces activeFilters wholesale and fires onFilter callback.
   * commonFilter updates reactively → UiTable re-fetches automatically.
   */
  function applyFilters(filters: ActiveFilters) {
    activeFilters.value = { ...filters };
    onFilter?.(activeFilters.value);
  }

  // ── Filters — immediate / single key (inline use) ─────────────────────────
  function setFilter(key: string, value: any) {
    activeFilters.value = { ...activeFilters.value, [key]: value };
    onFilter?.(activeFilters.value);
  }

  function clearFilter(key: string) {
    const next = { ...activeFilters.value };
    delete next[key];
    activeFilters.value = next;
    onFilter?.(activeFilters.value);
  }

  function clearAllFilters() {
    activeFilters.value = {};
    onFilter?.({});
  }

  // ── Client-side helpers (for List / Kanban local filtering) ───────────────
  function filterItems<T extends Record<string, any>>(
    items: T[],
    fields: (keyof T)[],
  ): T[] {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      fields.some((field) =>
        String(item[field] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  return {
    // State
    searchQuery,
    sort,
    activeFilters,
    activeFilterCount,
    commonFilter, // ← NEW: pass as :external-filter to UiTable/UiList/UiKanban

    // Actions
    handleSearch,
    clearSearch,
    handleSort,
    clearSort,
    applyFilters, // ← NEW: called by UiHeader's @apply-filters
    setFilter,
    clearFilter,
    clearAllFilters,

    // Helpers
    filterItems,
  };
}
