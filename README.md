# TMS-F SPA Reset

## Setup

```bash
npm install
npm run dev
```

## Architecture Overview

- `src/components/ui`: shadcn-vue primitives.
- `src/components/shared`: reusable enterprise wrappers (20+ UI pieces).
- `src/views/workspace`: dialog/sheet CRUD orchestration.
- `src/services/workspace.mock.ts`: fake API used for SPA workflows and demo routes.
- `src/utils/toast.ts`: centralized toast helper built on `vue-sonner`.

## Folder Structure

```text
src/
├─ components/
│  ├─ ui/
│  └─ shared/
├─ composables/
├─ services/
├─ types/
├─ views/
│  ├─ dashboard/
│  ├─ workspace/
│  ├─ projects/
│  └─ teams/
├─ router/
├─ utils/
├─ App.vue
└─ main.ts
```

## UiTable Usage

```vue
<UiTable
  :data="items"
  :columns="columns"
  :loading="loading"
  :pagination="{ page, pageSize, total }"
  @sort="handleSort"
  @select="handleSelect"
  @action="handleAction"
/>
```

## Migration Guide (old table -> new table)

1. Replace `src/ui-table/UiTable.vue` import with `@/components/shared/UiTable.vue`.
2. Pass plain `data` array instead of `fetchFn`.
3. Convert old table column schema to `{ key, label, sortable }`.
4. Use `@action` for row actions and dialog orchestration.
5. Use `@update:pagination` to keep page state in parent.

## Toast Standard

Always import from:

```ts
import { toast } from '@/utils/toast'
```

## Patterns and Anti-Patterns

### Do
- Keep route views thin.
- Move data logic to composables/stores/services.
- Use dialog/sheet CRUD flows for context preservation.

### Avoid
- Empty string values in `<SelectItem>`.
- Full-page add/edit/detail navigations for quick CRUD.
- Mixed icon libraries in the same view.

## Troubleshooting

- **Toasts not visible:** verify `Toaster` is mounted in `App.vue`.
- **Select errors:** ensure model uses `undefined` default (use `UiSelect`).
- **Table empty on load:** pass `undefined`-safe arrays (`UiTable` already guards).
