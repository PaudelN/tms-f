// ui-table/types/filter.types.ts

/**
 * Supported field types that UiFilter can render.
 *
 *  text          → plain text input
 *  number        → numeric input
 *  date          → native date picker
 *  select        → single-option dropdown (shadcn Select)
 *  multi-select  → checkbox list for array params like ?tags[]=1&tags[]=2
 */
export type FilterFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multi-select";

export interface FilterFieldOption {
  label: string;
  value: string | number;
}

/**
 * Describes one filter field rendered inside UiFilter.
 *
 * key         → maps 1-to-1 to the backend query param (e.g. 'creator', 'created_from')
 * label       → human-readable label shown above the field
 * type        → controls which input widget is rendered
 * options     → required for 'select' and 'multi-select'
 * placeholder → optional hint text
 * description → optional subtitle below the label
 */
export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  options?: FilterFieldOption[];
  placeholder?: string;
  description?: string;
}

/**
 * The active filter payload — a plain object whose keys map to
 * backend query params and values map to their values.
 *
 * This is what gets spread into axios params inside the store's fetchFn.
 *
 * Examples:
 *   { creator: 1, created_from: '2024-01-01', sort: 'desc' }
 *   { tags: [1, 2, 3] }
 */
export type ActiveFilters = Record<string, any>;
