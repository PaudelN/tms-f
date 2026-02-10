<script setup lang="ts" generic="T">
import { computed, ref } from 'vue'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import UiEmptyState from './UiEmptyState.vue'
import UiMobileCard from './UiMobileCard.vue'

export interface UiTableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  type?: 'text' | 'actions' | 'badge' | 'numeric'
  hidden?: boolean
}

interface Props<T> {
  data?: T[]
  columns: UiTableColumn<T>[]
  loading?: boolean
  pagination?: { page: number; perPage: number; total: number }
}

const props = withDefaults(defineProps<Props<T>>(), { data: () => [], loading: false })
const emit = defineEmits<{
  sort: [payload: { key: string; order: 'asc' | 'desc' | null }]
  select: [payload: { rows: T[] }]
  action: [payload: { type: string; row: T }]
  page: [page: number]
  perPage: [perPage: number]
  rowClick: [row: T]
}>()

const search = ref('')
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)
const visibleColumns = ref<Record<string, boolean>>({})
const selectedIndexes = ref<number[]>([])
const lastSelected = ref<number | null>(null)

const normalizedData = computed(() => (Array.isArray(props.data) ? props.data : []))
const selectableColumns = computed(() => props.columns.filter((column) => column.type !== 'actions'))

if (!Object.keys(visibleColumns.value).length) {
  props.columns.forEach((column) => {
    visibleColumns.value[String(column.key)] = !column.hidden
  })
}

const filteredData = computed(() => {
  if (!search.value.trim()) {
    return normalizedData.value
  }

  const query = search.value.toLowerCase()
  return normalizedData.value.filter((row) =>
    selectableColumns.value.some((column) => String((row as any)?.[column.key as keyof T] ?? '').toLowerCase().includes(query)),
  )
})

const sortedData = computed(() => {
  if (!sortKey.value || !sortOrder.value) {
    return filteredData.value
  }

  return [...filteredData.value].sort((a, b) => {
    const aValue = String((a as any)?.[sortKey.value as keyof T] ?? '')
    const bValue = String((b as any)?.[sortKey.value as keyof T] ?? '')
    return sortOrder.value === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  })
})

const visibleDataColumns = computed(() => props.columns.filter((column) => visibleColumns.value[String(column.key)]))
const selectedRows = computed(() => selectedIndexes.value.map((index) => sortedData.value[index]).filter(Boolean))

function toggleSort(columnKey: string) {
  if (sortKey.value !== columnKey) {
    sortKey.value = columnKey
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else if (sortOrder.value === 'desc') {
    sortKey.value = null
    sortOrder.value = null
  } else {
    sortOrder.value = 'asc'
  }

  emit('sort', { key: columnKey, order: sortOrder.value })
}

function toggleRow(index: number, event?: MouseEvent) {
  if (event?.shiftKey && lastSelected.value !== null) {
    const [start, end] = [lastSelected.value, index].sort((a, b) => a - b)
    selectedIndexes.value = Array.from({ length: end - start + 1 }, (_, idx) => idx + start)
  } else if (selectedIndexes.value.includes(index)) {
    selectedIndexes.value = selectedIndexes.value.filter((current) => current !== index)
  } else {
    selectedIndexes.value = [...selectedIndexes.value, index]
  }

  lastSelected.value = index
  emit('select', { rows: selectedRows.value })
}

function toggleAllRows() {
  selectedIndexes.value = selectedIndexes.value.length === sortedData.value.length ? [] : sortedData.value.map((_, index) => index)
  emit('select', { rows: selectedRows.value })
}

function runAction(type: string, row: T) {
  emit('action', { type, row })
}
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Input v-model="search" placeholder="Search visible columns" class="md:max-w-sm" />
      <div class="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="gap-2">Columns <ChevronDown class="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in columns"
              :key="String(column.key)"
              :checked="visibleColumns[String(column.key)]"
              @update:checked="visibleColumns[String(column.key)] = Boolean($event)"
            >
              {{ column.label || column.key }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="hidden overflow-x-auto rounded-xl border border-border/70 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[40px]"><Checkbox :model-value="selectedIndexes.length === sortedData.length && sortedData.length > 0" @update:model-value="toggleAllRows" /></TableHead>
            <TableHead v-for="column in visibleDataColumns" :key="String(column.key)">
              <Button v-if="column.sortable" variant="ghost" size="sm" class="-ml-2 gap-2" @click="toggleSort(String(column.key))">
                {{ column.label }}
                <ArrowUpDown class="h-3 w-3" />
              </Button>
              <span v-else class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ column.label }}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="index in 8" :key="index">
              <TableCell :colspan="visibleDataColumns.length + 1"><Skeleton class="h-8 w-full" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="!sortedData.length">
            <TableRow>
              <TableCell :colspan="visibleDataColumns.length + 1">
                <UiEmptyState title="No rows found" description="Try adjusting filters or creating a new record." />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow
              v-for="(row, index) in sortedData"
              :key="index"
              class="cursor-pointer hover:bg-muted/40"
              @click="emit('rowClick', row)"
            >
              <TableCell class="py-4" @click.stop="toggleRow(index, $event)">
                <Checkbox :model-value="selectedIndexes.includes(index)" />
              </TableCell>
              <TableCell
                v-for="column in visibleDataColumns"
                :key="String(column.key)"
                class="py-4"
                :class="column.type === 'numeric' ? 'tabular-nums' : ''"
              >
                <template v-if="column.type === 'actions'">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon"><MoreHorizontal class="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="runAction('view', row)">View</DropdownMenuItem>
                      <DropdownMenuItem @click="runAction('edit', row)">Edit</DropdownMenuItem>
                      <DropdownMenuItem class="text-destructive" @click="runAction('delete', row)">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </template>
                <template v-else>
                  {{ (row as any)?.[column.key as keyof T] }}
                </template>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div class="grid gap-3 md:hidden">
      <UiMobileCard v-for="(row, index) in sortedData" :key="index">
        <div class="space-y-1 text-sm" @click="emit('rowClick', row)">
          <p v-for="column in visibleDataColumns" :key="String(column.key)"><span class="text-muted-foreground">{{ column.label }}:</span> {{ (row as any)?.[column.key as keyof T] }}</p>
        </div>
      </UiMobileCard>
    </div>

    <div v-if="pagination" class="flex flex-col gap-2 border-t border-border/60 pt-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <span>Showing {{ sortedData.length }} of {{ pagination.total }} records</span>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="pagination.page <= 1" @click="emit('page', pagination.page - 1)">Previous</Button>
        <Button variant="outline" size="sm" :disabled="(pagination.page * pagination.perPage) >= pagination.total" @click="emit('page', pagination.page + 1)">Next</Button>
      </div>
    </div>
  </div>
</template>
