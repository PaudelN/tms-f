<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from 'vue'
import { ChevronDown, ChevronUp, Columns3, MoreHorizontal, Search, Table2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export interface UiTableColumn<TData> {
  key: keyof TData | string
  label: string
  sortable?: boolean
  searchable?: boolean
  hidden?: boolean
  class?: string
  headerClass?: string
}

export interface UiTablePagination {
  page: number
  perPage: number
  total: number
}

const props = withDefaults(
  defineProps<{
    data?: T[]
    columns: UiTableColumn<T>[]
    loading?: boolean
    pagination?: UiTablePagination
    rowKey?: keyof T | ((row: T, index: number) => string | number)
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    data: () => [],
    loading: false,
    rowKey: undefined,
    emptyTitle: 'No records found',
    emptyDescription: 'Try adjusting filters or create a new record.',
  },
)

const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc' | null]
  select: [rows: T[]]
  action: [{ type: string; row: T }]
  'row-click': [row: T]
  'page-change': [page: number]
  'per-page-change': [perPage: number]
}>()

const search = ref('')
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)
const visibleColumnKeys = ref<string[]>([])
const selectedKeys = ref<Set<string | number>>(new Set())

const normalizedRows = computed<T[]>(() => (Array.isArray(props.data) ? props.data : []))
const normalizedColumns = computed(() => props.columns ?? [])
const searchableColumns = computed(() => normalizedColumns.value.filter((column) => column.searchable !== false))

watch(
  normalizedColumns,
  (columns) => {
    visibleColumnKeys.value = columns.filter((column) => !column.hidden).map((column) => String(column.key))
  },
  { immediate: true },
)

const visibleColumns = computed(() =>
  normalizedColumns.value.filter((column) => visibleColumnKeys.value.includes(String(column.key))),
)

function rowIdentifier(row: T, index: number): string | number {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }
  if (props.rowKey) {
    const value = row[props.rowKey]
    if (typeof value === 'string' || typeof value === 'number') {
      return value
    }
  }
  return index
}

function getCell(row: T, key: keyof T | string): string {
  const value = row[key as keyof T]
  if (value === null || value === undefined) return ''
  return String(value)
}

const filteredRows = computed(() => {
  if (!search.value.trim()) return normalizedRows.value
  const query = search.value.toLowerCase()
  return normalizedRows.value.filter((row) =>
    searchableColumns.value.some((column) => getCell(row, column.key).toLowerCase().includes(query)),
  )
})

const sortedRows = computed(() => {
  if (!sortKey.value || !sortOrder.value) return filteredRows.value
  return [...filteredRows.value].sort((left, right) => {
    const activeSortKey = sortKey.value as string
    const a = getCell(left, activeSortKey)
    const b = getCell(right, activeSortKey)
    const compare = a.localeCompare(b, undefined, { numeric: true })
    return sortOrder.value === 'asc' ? compare : compare * -1
  })
})

const currentPage = computed(() => props.pagination?.page ?? 1)
const perPage = computed(() => props.pagination?.perPage ?? 10)
const totalItems = computed(() => props.pagination?.total ?? sortedRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / perPage.value)))

const pagedRows = computed(() => {
  if (props.pagination) return sortedRows.value
  const start = (currentPage.value - 1) * perPage.value
  return sortedRows.value.slice(start, start + perPage.value)
})

const allRowsSelected = computed(() =>
  pagedRows.value.length > 0 && pagedRows.value.every((row, index) => selectedKeys.value.has(rowIdentifier(row, index))),
)

const selectedRows = computed(() =>
  pagedRows.value.filter((row, index) => selectedKeys.value.has(rowIdentifier(row, index))),
)

watch(selectedRows, (rows) => emit('select', rows))

function toggleSort(column: string) {
  if (sortKey.value !== column) {
    sortKey.value = column
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else if (sortOrder.value === 'desc') {
    sortOrder.value = null
    sortKey.value = null
  } else {
    sortOrder.value = 'asc'
  }
  emit('sort', sortKey.value ?? column, sortOrder.value)
}

function toggleAllRows(value: boolean) {
  if (!value) {
    selectedKeys.value.clear()
    return
  }
  pagedRows.value.forEach((row, index) => selectedKeys.value.add(rowIdentifier(row, index)))
}

function toggleRow(row: T, index: number, value: boolean) {
  const id = rowIdentifier(row, index)
  if (value) {
    selectedKeys.value.add(id)
  } else {
    selectedKeys.value.delete(id)
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
      <div class="relative min-w-[240px]">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" placeholder="Search rows..." class="pl-9" />
      </div>

      <div class="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="gap-2"><Columns3 class="size-4" />Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in normalizedColumns"
              :key="String(column.key)"
              :model-value="visibleColumnKeys.includes(String(column.key))"
              @update:model-value="(value) => {
                if (value) visibleColumnKeys.push(String(column.key))
                else visibleColumnKeys = visibleColumnKeys.filter((item) => item !== String(column.key))
              }"
            >
              {{ column.label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu v-if="selectedRows.length > 0">
          <DropdownMenuTrigger as-child>
            <Button size="sm">Bulk Actions ({{ selectedRows.length }})</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="selectedKeys.clear()">Clear selection</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12">
              <Checkbox :model-value="allRowsSelected" @update:model-value="toggleAllRows(Boolean($event))" />
            </TableHead>
            <TableHead
              v-for="column in visibleColumns"
              :key="String(column.key)"
              :class="['py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground', column.headerClass]"
            >
              <button
                v-if="column.sortable"
                class="inline-flex items-center gap-1"
                type="button"
                @click="toggleSort(String(column.key))"
              >
                {{ column.label }}
                <ChevronUp v-if="sortKey === String(column.key) && sortOrder === 'asc'" class="size-4" />
                <ChevronDown v-else-if="sortKey === String(column.key) && sortOrder === 'desc'" class="size-4" />
              </button>
              <span v-else>{{ column.label }}</span>
            </TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="loading">
            <TableRow v-for="i in 8" :key="i">
              <TableCell :colspan="visibleColumns.length + 2" class="py-4"><Skeleton class="h-7 w-full" /></TableCell>
            </TableRow>
          </template>

          <TableRow v-else-if="pagedRows.length === 0">
            <TableCell :colspan="visibleColumns.length + 2" class="py-12 text-center">
              <Table2 class="mx-auto mb-2 size-8 text-muted-foreground" />
              <p class="font-medium">{{ emptyTitle }}</p>
              <p class="text-sm text-muted-foreground">{{ emptyDescription }}</p>
            </TableCell>
          </TableRow>

          <TableRow
            v-for="(row, rowIndex) in pagedRows"
            v-else
            :key="rowIdentifier(row, rowIndex)"
            class="cursor-pointer"
            @click="emit('row-click', row)"
          >
            <TableCell>
              <Checkbox
                :model-value="selectedKeys.has(rowIdentifier(row, rowIndex))"
                @update:model-value="toggleRow(row, rowIndex, Boolean($event))"
                @click.stop
              />
            </TableCell>
            <TableCell v-for="column in visibleColumns" :key="String(column.key)" :class="['py-4 align-middle', column.class]">
              <slot :name="`cell-${String(column.key)}`" :row="row" :value="row[column.key as keyof T]">
                {{ row[column.key as keyof T] }}
              </slot>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" @click.stop><MoreHorizontal class="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="emit('action', { type: 'view', row })">View</DropdownMenuItem>
                  <DropdownMenuItem @click="emit('action', { type: 'edit', row })">Edit</DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive" @click="emit('action', { type: 'delete', row })">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="space-y-3 p-4 md:hidden">
      <div v-for="(row, rowIndex) in pagedRows" :key="rowIdentifier(row, rowIndex)" class="rounded-xl border border-border p-4">
        <div v-for="column in visibleColumns.slice(0, 4)" :key="String(column.key)" class="flex items-center justify-between py-1">
          <p class="text-xs text-muted-foreground">{{ column.label }}</p>
          <p class="text-sm font-medium">{{ row[column.key as keyof T] }}</p>
        </div>
        <Button class="mt-3 w-full" variant="outline" size="sm" @click="emit('row-click', row)">Open</Button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
      <p class="text-xs text-muted-foreground">{{ selectedRows.length }} selected · {{ totalItems }} total</p>
      <div class="flex items-center gap-2">
        <Select
          :model-value="String(perPage)"
          @update:model-value="(value) => emit('per-page-change', Number(value))"
        >
          <SelectTrigger class="w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="emit('page-change', currentPage - 1)">Prev</Button>
        <p class="px-2 text-sm">{{ currentPage }} / {{ totalPages }}</p>
        <Button variant="outline" size="sm" :disabled="currentPage >= totalPages" @click="emit('page-change', currentPage + 1)">Next</Button>
      </div>
    </div>
  </div>
</template>
