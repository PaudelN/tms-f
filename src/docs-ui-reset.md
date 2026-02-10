# UI/UX Reset Guide

## Design system
- **Foundation:** shadcn-vue primitives in `src/components/ui/*`.
- **Claymorphism tokens:** `shadow-clay-sm`, `shadow-clay-md`, `radius-clay` in `src/assets/tailwind-shadcn.css`.
- **Color semantics:** background/card/sidebar/accent/destructive tokens from CSS variables.
- **Typography:** heading scale from page headers + tabular numbers in `UiTable`/`UiStatCard`.
- **Spacing:** 4pt rhythm via Tailwind classes (`p-4`, `p-5`, `gap-2`, `gap-4`, `space-y-5`).

## Core shared components
- `UiTable`, `UiEmptyState`, `UiErrorBoundary`, `UiPageHeader`, plus 17 additional reusable shared components in `src/components/shared`.

## UiTable API
```vue
<UiTable
  :data="items"
  :columns="columns"
  :loading="loading"
  :pagination="{ page, perPage, total }"
  @sort="onSort"
  @select="onSelect"
  @action="onAction"
/>
```

### Column format
```ts
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'budget', label: 'Budget', type: 'numeric' },
  { key: 'actions', label: '', type: 'actions' },
]
```

## Migration guide (old table -> new table)
1. Replace imports from `@/ui-table/UiTable.vue` with `@/components/shared`.
2. Convert `fetchFn/config/tableId` pattern to direct `data/loading/pagination` props.
3. Move server fetching to view/store and pass results to table.
4. Handle `@action` at orchestration layer (dialog/sheet open).

## Folder structure target
```
src/
├─ components/
│  ├─ ui/
│  └─ shared/
├─ features/
│  └─ workspace/components/
├─ views/
│  ├─ workspace/
│  ├─ projects/
│  └─ reports/
├─ stores/
├─ services/
├─ composables/
├─ utils/
├─ router/
└─ assets/
```

## Patterns & anti-patterns
- ✅ View -> Store -> Service -> API.
- ✅ Dialog-driven add/edit + Sheet-driven details.
- ✅ toast helper usage from `@/utils/toast` only.
- ✅ Select values default to `undefined` through `UiSelect` wrapper.
- ❌ Empty-string Select value in Radix-backed Select items.
- ❌ Direct `vue-sonner` imports in view components.

## Troubleshooting
- **No toast visible:** ensure `Toaster` mounted in `App.vue`.
- **Select crashes:** use `UiSelect` and avoid `""` values.
- **Dropdown import errors:** import from `@/components/ui/dropdown-menu` barrel only.
- **Table undefined data:** pass `data` as optional; component normalizes to `[]`.
