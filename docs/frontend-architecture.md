# Frontend Architecture Notes

## Folder structure (targeted + aligned to current repo)
```
src/
  assets/                 # global Tailwind + design tokens
  components/
    common/               # shared atoms (theme toggle, profile menu)
    layouts/              # app shells (Sidebar layout)
    ui/                   # shadcn-vue primitives
    workspace/            # workspace feature UI components
  router/                 # view routing
  stores/                 # pinia stores (feature-focused)
  types/                  # global shared types
  ui-table/               # advanced table system (table/list/kanban)
  views/                  # route views (index/detail/add/edit)
```

## Layout & navigation
- AppLayout uses the shadcn Sidebar system for persistent navigation, collapsed mode, and mobile drawer behavior.
- Sidebar navigation is SPA-only with router links and a lightweight header/search area.

## UiTable design & usage
- UiTable supports search, sorting, pagination, column visibility, row selection, bulk actions, row actions, and loading/empty states.
- Usage stays concise in `index.vue` with `rowActions`, `bulkActions`, and scoped cells for custom content.

Example usage:
```vue
<UiTable
  table-id="workspaces-table"
  :columns="columns"
  :fetch-fn="fetchWorkspaces"
  :row-actions="rowActions"
  :bulk-actions="bulkActions"
  :config="{ defaultPerPage: 10, defaultSortBy: 'created_at' }"
  search-placeholder="Search workspaces..."
/>
```

## Component strategy
- Prefer shadcn-vue primitives for interaction controls.
- Keep feature components in `/components/<feature>` and use views for route-level composition.
- Iconography is lucide-vue-next only.

## State & data flow
- Pinia stores stay feature-focused and small.
- UiTable state is centralized in its store with composables handling orchestration.

## Performance notes
- Collapsible sidebar uses shadcn context and avoids layout shifts.
- UiTable uses debounced search and store-managed state to reduce re-renders.
