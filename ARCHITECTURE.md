# SPA UI/UX Reset Notes

## Design system tokens
- Shadows: `sm`, `md`, `lg` in `src/utils/design-system.ts`.
- Radius: `rounded-md`, `rounded-xl`, `rounded-2xl`.
- Spacing scale: `space-y-1`..`space-y-6`.
- Semantic colors are defined in `src/assets/tailwind-shadcn.css` using `--color-*` tokens.
- Typography: tabular numerals on metric/table numbers, compact headings with `font-semibold`.

## Reusable components
Shared components introduced under `src/components/shared`:
1. UiTable
2. UiSelect
3. UiPageHeader
4. UiEmptyState
5. UiErrorBoundary
6. UiStatCard
7. UiSectionCard
8. UiMetricPill
9. UiDialogFormShell
10. UiDetailField
11. UiActionIconButton
12. UiStatusBadge
13. UiBreadcrumbs

Helper TS utilities (`src/utils/design-system.ts` + `src/utils/toast.ts`) provide >8 reusable helper APIs.

## New table usage
```vue
<UiTable
  :data="items"
  :columns="columns"
  :loading="isLoading"
  @sort="handleSort"
  @select="handleSelect"
  @action="handleAction"
/>
```

## Migration: old workspace flow -> dialog orchestration
- Before: `/workspace/add`, `/workspace/:id`, `/workspace/:id/edit` full page transitions.
- After: all operations are managed in `src/views/workspace/index.vue` with:
  - Add/Edit in `Dialog`
  - Detail in `Sheet`
  - Delete in `AlertDialog`

## Folder direction
Current additions move toward feature-driven structure:
- `src/features/workspace/components/*`
- `src/features/mock-data/data.ts`
- `src/components/shared/*`
- `src/views/clients/index.vue`
- `src/views/reports/index.vue`

## State & API flow
- View -> Pinia Store (`useWorkspaceStore`) -> Axios service (`src/lib/axios.ts`) -> API.
- Toast feedback is centralized via `src/utils/toast.ts`.

## Troubleshooting
- If Select crashes, replace `""` model values with `undefined` using `UiSelect`.
- If table data is async undefined, use fallback guards (`safeArray`, default props).
- If toasts do not render, verify `Toaster` mounted in `src/App.vue`.
