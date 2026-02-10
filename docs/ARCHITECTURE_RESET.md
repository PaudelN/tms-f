# Architecture Reset Guide

## Design system foundations

- **UI source of truth**: `src/components/ui/*` (shadcn-vue primitives).
- **Enterprise claymorphism tokens**: `shadow-clay-sm`, `shadow-clay-md`, `surface-clay` in `src/assets/tailwind-shadcn.css`.
- **Typography**: title (`text-xl font-semibold`), section (`text-base font-semibold`), helper (`text-sm text-muted-foreground`).
- **Spacing**: page `space-y-5`, cards `p-4/p-5`, table row rhythm `py-4`.
- **Semantic colors**: `primary`, `muted`, `destructive`, `card`, `background`.

## Reusable component inventory

Shared reusable components created in `src/components/shared`:

1. `UiTable.vue`
2. `UiSelect.vue`
3. `UiPageHeader.vue`
4. `UiEmptyState.vue`
5. `UiErrorBoundary.vue`
6. `UiStatCard.vue`
7. `UiToolbar.vue`
8. `UiLoadingBlock.vue`
9. `UiDetailField.vue`
10. `UiFormActions.vue`
11. `UiInfoCallout.vue`
12. `UiMetricGrid.vue`
13. `UiSectionCard.vue`
14. `UiIconButton.vue`
15. `UiFilterChip.vue`
16. `UiSearchInput.vue`
17. `UiListTile.vue`
18. `UiDialogFormShell.vue`
19. `UiAvatarName.vue`
20. `UiSkeletonTable.vue`
21. `UiConfirmDialog.vue`

## UiTable usage

```vue
<UiTable
  :data="rows"
  :columns="columns"
  :loading="loading"
  :pagination="pagination"
  row-key="id"
  @row-click="openDetail"
  @sort="onSort"
  @select="onSelect"
  @action="onAction"
  @page-change="onPage"
  @per-page-change="onPerPage"
/>
```

Features:
- Async-safe defaults for undefined data.
- Search, sorting, column visibility.
- Row select + bulk action slot.
- Row action menu.
- Mobile card mode.

## Workspace workflow pattern

- `views/workspace/index.vue` is the orchestrator.
- Add/Edit handled in `Dialog` with `WorkspaceForm`.
- Detail handled in `Sheet` with `WorkspaceDetailPanel`.
- Delete guarded by `UiConfirmDialog`.

## Critical bug fixes included

- Select empty value safety via `UiSelect` wrapper.
- Legacy table undefined data guard in `src/ui-table/UiTableBody.vue`.
- Toast mount in `App.vue` + central utility `src/utils/toast.ts`.
- Expanded dropdown exports in `src/components/ui/dropdown-menu/index.ts`.

## New SPA routes (fake data)

- `/insights`
- `/automation`
- `/roadmap`

## Folder structure direction

```txt
src/
  components/
    ui/
    shared/
  features/
    workspace/components/
  views/
    workspace/
    insights/
    automation/
  services/
  stores/
  utils/
  router/
```

## Migration notes (old → new)

- Old full-page workspace CRUD routes remain for compatibility.
- Primary workflow now lives in `workspace/index.vue` using overlay UX.
- Toast calls should import from `@/utils/toast`.
- New tables should use `@/components/shared/UiTable.vue`.

## Troubleshooting

- If a `Select` appears broken, ensure model is `undefined` not `''`.
- If toasts do not show, verify `<Toaster />` remains mounted in `App.vue`.
- If rows disappear in table, confirm column keys match object keys.
