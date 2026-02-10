<script setup lang="ts" generic="TData">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronUp, ChevronsUpDown, Settings2 } from 'lucide-vue-next'
import UiEmptyState from './UiEmptyState.vue'
import UiMobileCard from './UiMobileCard.vue'

export interface UiTableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  hidden?: boolean
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

const props = withDefaults(
  defineProps<{
    data?: TData[] | null
    columns: UiTableColumn<TData>[]
    loading?: boolean
    pagination?: Pagination
    title?: string
    searchPlaceholder?: string
  }>(),
  {
    data: () => [],
    loading: false,
    searchPlaceholder: 'Search rows...'
  },
)

const emit = defineEmits<{
  sort: [payload: { key: string; order: 'asc' | 'desc' | null }]
  select: [payload: TData[]]
  action: [payload: { action: string; row: TData }]
  'update:pagination': [payload: Pagination]
}>()

const search = ref('')
const selectedRowIds = ref<Set<string | number>>(new Set())
const visibleColumns = ref<Record<string, boolean>>({})
const sortState = ref<{ key: string | null; order: 'asc' | 'desc' | null }>({ key: null, order: null })

watch(
  () => props.columns,
  (value) => {
    const next: Record<string, boolean> = {}
    value.forEach((column) => {
      const key = String(column.key)
      next[key] = column.hidden ? false : visibleColumns.value[key] ?? true
    })
    visibleColumns.value = next
  },
  { immediate: true, deep: true },
)

const safeData = computed(() => (Array.isArray(props.data) ? props.data : []))

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return safeData.value
  const keys = props.columns
    .map((column) => String(column.key))
    .filter((key) => visibleColumns.value[key])

  return safeData.value.filter((row) =>
    keys.some((key) => String((row as Record<string, unknown>)[key] ?? '').toLowerCase().includes(q)),
  )
})

const sortedRows = computed(() => {
  const { key, order } = sortState.value
  if (!key || !order) return filteredRows.value
  return [...filteredRows.value].sort((left, right) => {
    const a = String((left as Record<string, unknown>)[key] ?? '')
    const b = String((right as Record<string, unknown>)[key] ?? '')
    return order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  })
})

const activeColumns = computed(() => props.columns.filter((column) => visibleColumns.value[String(column.key)]))

const paginatedRows = computed(() => {
  const currentPage = props.pagination?.page ?? 1
  const pageSize = props.pagination?.pageSize ?? (sortedRows.value.length || 10)
  const start = (currentPage - 1) * pageSize
  return sortedRows.value.slice(start, start + pageSize)
})

const allSelected = computed(() => paginatedRows.value.length > 0 && paginatedRows.value.every((row) => selectedRowIds.value.has(getRowId(row))))

function getRowId(row: TData) {
  return (row as Record<string, string | number>).id ?? JSON.stringify(row)
}

function toggleSort(key: string) {
  const current = sortState.value
  if (current.key !== key) sortState.value = { key, order: 'asc' }
  else if (current.order === 'asc') sortState.value = { key, order: 'desc' }
  else if (current.order === 'desc') sortState.value = { key: null, order: null }
  else sortState.value = { key, order: 'asc' }
  emit('sort', { key, order: sortState.value.order })
}

function toggleRow(row: TData, checked: boolean) {
  const id = getRowId(row)
  if (checked) selectedRowIds.value.add(id)
  else selectedRowIds.value.delete(id)
  emitSelection()
}

function togglePageSelection(checked: boolean) {
  paginatedRows.value.forEach((row) => {
    const id = getRowId(row)
    if (checked) selectedRowIds.value.add(id)
    else selectedRowIds.value.delete(id)
  })
  emitSelection()
}

function emitSelection() {
  const selectedRows = safeData.value.filter((row) => selectedRowIds.value.has(getRowId(row)))
  emit('select', selectedRows)
}

function updatePage(page: number) {
  if (!props.pagination) return
  emit('update:pagination', { ...props.pagination, page })
}
</script>

<template>
  <div class="rounded-2xl border border-border/70 bg-card p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)]">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 v-if="title" class="text-base font-semibold text-foreground">{{ title }}</h3>
      <div class="ml-auto flex items-center gap-2">
        <Input v-model="search" :placeholder="searchPlaceholder" class="w-64" />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm"><Settings2 class="mr-2 size-4" />Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in columns"
              :key="String(column.key)"
              :checked="visibleColumns[String(column.key)]"
              @update:checked="(checked: boolean) => (visibleColumns[String(column.key)] = !!checked)"
            >
              {{ column.label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton v-for="i in 6" :key="i" class="h-12 w-full" />
    </div>

    <UiEmptyState
      v-else-if="paginatedRows.length === 0"
      title="No records found"
      description="Try another search or clear filters to broaden your result."
    />

    <div v-else>
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border/70 text-left text-muted-foreground">
              <th class="w-10 py-3">
                <Checkbox :model-value="allSelected" @update:model-value="(value) => togglePageSelection(Boolean(value))" />
              </th>
              <th v-for="column in activeColumns" :key="String(column.key)" class="py-3 font-medium">
                <button
                  type="button"
                  class="inline-flex items-center gap-1"
                  :disabled="!column.sortable"
                  @click="toggleSort(String(column.key))"
                >
                  {{ column.label }}
                  <ChevronsUpDown v-if="column.sortable && sortState.key !== String(column.key)" class="size-3" />
                  <ChevronUp v-else-if="sortState.key === String(column.key) && sortState.order === 'asc'" class="size-3" />
                  <ChevronDown v-else-if="sortState.key === String(column.key) && sortState.order === 'desc'" class="size-3" />
                </button>
              </th>
              <th class="w-20 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="String(getRowId(row))" class="border-b border-border/40 hover:bg-muted/30">
              <td class="py-4 align-top">
                <Checkbox :model-value="selectedRowIds.has(getRowId(row))" @update:model-value="(value) => toggleRow(row, Boolean(value))" />
              </td>
              <td v-for="column in activeColumns" :key="String(column.key)" class="py-4 align-top">
                <slot :name="`cell-${String(column.key)}`" :row="row" :value="(row as Record<string, unknown>)[String(column.key)]">
                  {{ (row as Record<string, unknown>)[String(column.key)] }}
                </slot>
              </td>
              <td class="py-4 text-right align-top">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child><Button variant="ghost" size="sm">•••</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="emit('action', { action: 'view', row })">View</DropdownMenuItem>
                    <DropdownMenuItem @click="emit('action', { action: 'edit', row })">Edit</DropdownMenuItem>
                    <DropdownMenuItem class="text-destructive" @click="emit('action', { action: 'delete', row })">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 md:hidden">
        <UiMobileCard v-for="row in paginatedRows" :key="String(getRowId(row))">
          <div class="space-y-2">
            <div v-for="column in activeColumns" :key="String(column.key)" class="flex items-center justify-between gap-3">
              <span class="text-xs text-muted-foreground">{{ column.label }}</span>
              <span class="text-sm font-medium text-foreground">{{ (row as Record<string, unknown>)[String(column.key)] }}</span>
            </div>
            <Button variant="outline" size="sm" class="w-full" @click="emit('action', { action: 'view', row })">Open</Button>
          </div>
        </UiMobileCard>
      </div>

      <div v-if="pagination" class="mt-4 flex items-center justify-between border-t border-border/70 pt-4 text-sm">
        <span class="text-muted-foreground">Page {{ pagination.page }} · {{ sortedRows.length }} total</span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" :disabled="pagination.page <= 1" @click="updatePage(pagination.page - 1)">Previous</Button>
          <Button variant="outline" size="sm" :disabled="pagination.page * pagination.pageSize >= sortedRows.length" @click="updatePage(pagination.page + 1)">Next</Button>
        </div>
      </div>
    </div>
  </div>
</template>
