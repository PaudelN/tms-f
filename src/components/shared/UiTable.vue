<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronsUpDown, Ellipsis, Search } from 'lucide-vue-next'
import UiEmptyState from './UiEmptyState.vue'

export interface UiTableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  type?: 'text' | 'badge' | 'actions'
}

const props = withDefaults(defineProps<{
  data?: T[]
  columns: UiTableColumn<T>[]
  loading?: boolean
  rowActions?: Array<{ label: string; action: string; destructive?: boolean }>
  bulkActions?: Array<{ label: string; action: string; destructive?: boolean }>
  pageSize?: number
}>(), {
  data: () => [],
  loading: false,
  rowActions: () => [],
  bulkActions: () => [],
  pageSize: 8,
})

const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc' | null]
  action: [payload: { action: string; row: T }]
  select: [rows: T[]]
}>()

const query = ref('')
const currentPage = ref(1)
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)
const selectedIds = ref<Set<number>>(new Set())

const safeData = computed(() => (Array.isArray(props.data) ? props.data : []))
const visibleColumnMap = ref<Record<string, boolean>>({})

watch(
  () => props.columns,
  (columns) => {
    visibleColumnMap.value = columns.reduce<Record<string, boolean>>((acc, column) => {
      acc[String(column.key)] = true
      return acc
    }, {})
  },
  { immediate: true },
)

const filteredData = computed(() => {
  const base = safeData.value
  const q = query.value.trim().toLowerCase()
  if (!q) return base

  return base.filter((row) =>
    props.columns.some((column) => {
      if (!visibleColumnMap.value[String(column.key)] || column.type === 'actions') return false
      const raw = row[column.key as keyof T]
      return String(raw ?? '').toLowerCase().includes(q)
    }),
  )
})

const sortedData = computed(() => {
  if (!sortKey.value || !sortOrder.value) return filteredData.value
  return [...filteredData.value].sort((a, b) => {
    const aValue = String(a[sortKey.value as keyof T] ?? '')
    const bValue = String(b[sortKey.value as keyof T] ?? '')
    const result = aValue.localeCompare(bValue, undefined, { numeric: true })
    return sortOrder.value === 'asc' ? result : -result
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedData.value.length / props.pageSize)))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return sortedData.value.slice(start, start + props.pageSize)
})

const visibleColumns = computed(() => props.columns.filter((column) => visibleColumnMap.value[String(column.key)]))
const selectedRows = computed(() => paginatedData.value.filter((_, index) => selectedIds.value.has(index)))

watch(selectedRows, (rows) => emit('select', rows))
watch([query, totalPages], () => {
  currentPage.value = 1
  selectedIds.value.clear()
})

function toggleSort(columnKey: string, sortable = false) {
  if (!sortable) return
  if (sortKey.value !== columnKey) {
    sortKey.value = columnKey
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else if (sortOrder.value === 'desc') {
    sortOrder.value = null
    sortKey.value = null
  } else {
    sortOrder.value = 'asc'
  }

  emit('sort', sortKey.value ?? columnKey, sortOrder.value)
}

function toggleRow(index: number, checked: boolean) {
  if (checked) selectedIds.value.add(index)
  else selectedIds.value.delete(index)
}

function toggleAll(checked: boolean) {
  if (!checked) {
    selectedIds.value.clear()
    return
  }
  selectedIds.value = new Set(paginatedData.value.map((_, index) => index))
}
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full md:max-w-sm">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="query" placeholder="Search visible columns" class="pl-9" />
      </div>

      <div class="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="gap-2">Columns <ChevronDown class="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in columns"
              :key="String(column.key)"
              :model-value="visibleColumnMap[String(column.key)]"
              @update:model-value="(value) => { visibleColumnMap[String(column.key)] = !!value }"
            >
              {{ column.label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu v-if="bulkActions.length && selectedRows.length">
          <DropdownMenuTrigger as-child>
            <Button size="sm">Bulk actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              v-for="action in bulkActions"
              :key="action.action"
              :class="action.destructive ? 'text-destructive' : ''"
              @click="emit('action', { action: action.action, row: selectedRows[0] })"
            >
              {{ action.label }} ({{ selectedRows.length }})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              <Checkbox :model-value="selectedRows.length === paginatedData.length && paginatedData.length > 0" @update:model-value="toggleAll(Boolean($event))" />
            </TableHead>
            <TableHead
              v-for="column in visibleColumns"
              :key="String(column.key)"
              class="text-muted-foreground"
            >
              <Button variant="ghost" class="-ml-3 h-8 px-3" @click="toggleSort(String(column.key), column.sortable)">
                {{ column.label }}
                <ChevronsUpDown class="ml-2 h-3.5 w-3.5" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="idx in 6" :key="idx">
              <TableCell v-for="col in visibleColumns.length + 1" :key="col"><Skeleton class="h-8 w-full" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="!paginatedData.length">
            <TableRow>
              <TableCell :colspan="visibleColumns.length + 1">
                <UiEmptyState title="No matching data" description="Try changing your filters or create a new record." />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow v-for="(row, index) in paginatedData" :key="index" class="hover:bg-muted/40">
              <TableCell>
                <Checkbox :model-value="selectedIds.has(index)" @update:model-value="toggleRow(index, Boolean($event))" />
              </TableCell>
              <TableCell v-for="column in visibleColumns" :key="String(column.key)" class="py-4">
                <template v-if="column.type === 'actions'">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon"><Ellipsis class="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        v-for="action in rowActions"
                        :key="action.action"
                        :class="action.destructive ? 'text-destructive' : ''"
                        @click="emit('action', { action: action.action, row })"
                      >
                        {{ action.label }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </template>
                <template v-else-if="column.type === 'badge'">
                  <Badge variant="secondary">{{ row[column.key as keyof T] }}</Badge>
                </template>
                <template v-else>
                  <span class="text-sm text-foreground">{{ row[column.key as keyof T] }}</span>
                </template>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div class="space-y-3 md:hidden">
      <div v-if="loading" class="space-y-2">
        <Skeleton v-for="idx in 4" :key="idx" class="h-24 w-full rounded-xl" />
      </div>
      <div v-else-if="!paginatedData.length">
        <UiEmptyState title="No data" description="Create your first record to get started." />
      </div>
      <div v-else class="space-y-3">
        <div v-for="(row, index) in paginatedData" :key="index" class="rounded-xl border border-border/70 bg-background p-4 shadow-subtle">
          <div v-for="column in visibleColumns" :key="String(column.key)" class="flex items-center justify-between py-1">
            <span class="text-xs uppercase tracking-wide text-muted-foreground">{{ column.label }}</span>
            <span class="text-sm text-foreground">{{ row[column.key as keyof T] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 text-sm text-muted-foreground">
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <div class="flex gap-2">
        <Button size="sm" variant="outline" :disabled="currentPage === 1" @click="currentPage -= 1">Previous</Button>
        <Button size="sm" variant="outline" :disabled="currentPage === totalPages" @click="currentPage += 1">Next</Button>
      </div>
    </div>
  </div>
</template>
