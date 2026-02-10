<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from "vue";
import { SearchIcon, Columns2Icon, ChevronDownIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, MoreHorizontalIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UiEmptyState from "@/components/shared/UiEmptyState.vue";
import { compareValues, normalizeQuery, safeArray } from "@/utils/design-system";

export interface UiTableColumn<T> { key: keyof T | string; label: string; sortable?: boolean; hidden?: boolean; type?: "text" | "actions"; }
interface Pagination { page: number; perPage: number; total: number; }

const props = withDefaults(defineProps<{ data?: T[]; columns: UiTableColumn<T>[]; loading?: boolean; pagination?: Pagination; }>(), { data: () => [], loading: false });
const emit = defineEmits<{ sort:[{column:string;order:'asc'|'desc'|null}]; select:[T[]]; action:[{action:string;row:T}]; pageChange:[number]; perPageChange:[number]; rowClick:[T]; }>();

const query = ref("");
const selectedKeys = ref<Set<number>>(new Set());
const sortBy = ref<string | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const visible = ref<Record<string, boolean>>({});

watch(() => props.columns, (cols) => {
  visible.value = cols.reduce((acc, col) => ({ ...acc, [String(col.key)]: !col.hidden }), {});
}, { immediate: true });

const safeData = computed(() => safeArray(props.data));
const visibleColumns = computed(() => props.columns.filter((col) => visible.value[String(col.key)]));
const searched = computed(() => {
  const term = normalizeQuery(query.value);
  if (!term) return safeData.value;
  return safeData.value.filter((row) => visibleColumns.value.some((col) => normalizeQuery(String(row[col.key as keyof T] ?? "")).includes(term)));
});
const sortedRows = computed(() => {
  if (!sortBy.value || !sortOrder.value) return searched.value;
  const items = [...searched.value];
  items.sort((a, b) => {
    const value = compareValues(a[sortBy.value as keyof T], b[sortBy.value as keyof T]);
    return sortOrder.value === "asc" ? value : -value;
  });
  return items;
});

function toggleSort(column: string) {
  if (sortBy.value !== column) { sortBy.value = column; sortOrder.value = "asc"; }
  else if (sortOrder.value === "asc") sortOrder.value = "desc";
  else if (sortOrder.value === "desc") sortOrder.value = null;
  else sortOrder.value = "asc";
  emit("sort", { column, order: sortOrder.value });
}

function toggleSelect(index: number) {
  const next = new Set(selectedKeys.value);
  next.has(index) ? next.delete(index) : next.add(index);
  selectedKeys.value = next;
  emit("select", [...next].map((key) => sortedRows.value[key]).filter(Boolean));
}

function cellSortIcon(columnKey: string) {
  if (sortBy.value !== columnKey || !sortOrder.value) return ArrowUpDownIcon;
  return sortOrder.value === "asc" ? ArrowUpIcon : ArrowDownIcon;
}
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full max-w-sm">
        <SearchIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="query" class="pl-9" placeholder="Search visible columns" />
      </div>
      <div class="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="gap-2"><Columns2Icon class="h-4 w-4" />Columns <ChevronDownIcon class="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem v-for="column in columns" :key="String(column.key)" :model-value="visible[String(column.key)]" @update:model-value="visible[String(column.key)] = Boolean($event)">
              {{ column.label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10"><Checkbox :model-value="false" disabled /></TableHead>
            <TableHead v-for="column in visibleColumns" :key="String(column.key)">
              <Button v-if="column.sortable" variant="ghost" size="sm" class="-ml-3 gap-1" @click="toggleSort(String(column.key))">
                {{ column.label }}
                <component :is="cellSortIcon(String(column.key))" class="h-4 w-4" />
              </Button>
              <span v-else class="text-muted-foreground">{{ column.label }}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="row in 6" :key="row"><TableCell :colspan="visibleColumns.length + 1"><Skeleton class="h-8 w-full" /></TableCell></TableRow>
          </template>
          <template v-else-if="sortedRows.length">
            <TableRow v-for="(row, rowIndex) in sortedRows" :key="rowIndex" class="cursor-pointer" @click="emit('rowClick', row)">
              <TableCell @click.stop><Checkbox :model-value="selectedKeys.has(rowIndex)" @update:model-value="toggleSelect(rowIndex)" /></TableCell>
              <TableCell v-for="column in visibleColumns" :key="`${rowIndex}-${String(column.key)}`" class="py-4">
                <slot :name="`cell-${String(column.key)}`" :row="row" :value="row[column.key as keyof T]">
                  <template v-if="column.type === 'actions'">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child><Button variant="ghost" size="icon"><MoreHorizontalIcon class="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end"><DropdownMenuItem @click="emit('action', { action: 'view', row })">View</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </template>
                  <template v-else>{{ row[column.key as keyof T] }}</template>
                </slot>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <UiEmptyState v-if="!loading && !sortedRows.length" title="No data found" description="Try changing filters or search query." />
  </div>
</template>
