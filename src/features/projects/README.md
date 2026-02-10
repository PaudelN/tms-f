# Projects feature

## Workflow
- `index.vue` orchestrates table, detail sheet, and add/edit dialog.
- `add.vue`, `edit.vue`, and `detail.vue` are component-mode route files reusable inside overlays.

## UiTable usage
```vue
<UiTable :data="projects" :columns="columns" :row-actions="rowActions" @action="handleAction" />
```

### Column config
```ts
const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'actions', label: '', type: 'actions' },
]
```

## Migration guide (legacy `src/ui-table` -> `components/shared/UiTable`)
1. Replace `fetch-fn` with pre-fetched `data` prop.
2. Move cell slot logic to `type: 'badge' | 'actions'` where possible.
3. Handle row/bulk actions via `@action` event payload.
4. Keep server pagination in parent store/service and pass paged data.
