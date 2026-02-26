import { useDebounceFn } from "@vueuse/core";
import { computed, ref } from "vue";

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
  onFilter?: (filters: Record<string, any>) => void;
}

/**
 * Universal interactions composable — manages search, sort, and filter state
 * that is shared across Table / List / Kanban views.
 *
 * For UiTable: pass `onSearch` / `onSort` callbacks that delegate into
 * `useTableInteractions` (which handles the actual API fetch).
 *
 * For List / Kanban: consume `searchQuery` directly for client-side filtering.
 */
export function useUniversalInteractions(
  options: UseUniversalInteractionsOptions = {},
) {
  const { debounceMs = 300, onSearch, onSort, onFilter } = options;

  // ── State ─────────────────────────────────────────────────────────────────
  const searchQuery = ref("");
  const sort = ref<SortOption>({ column: null, order: null });
  const activeFilters = ref<Record<string, any>>({});

  const activeFilterCount = computed(
    () =>
      Object.values(activeFilters.value).filter((v) => v != null && v !== "")
        .length,
  );

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

  // ── Filters ───────────────────────────────────────────────────────────────
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

  // ── Client-side helpers (for List / Kanban) ───────────────────────────────
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

    // Actions
    handleSearch,
    clearSearch,
    handleSort,
    clearSort,
    setFilter,
    clearFilter,
    clearAllFilters,

    // Helpers
    filterItems,
  };
}
