<template>
  <div class="overflow-x-auto rounded-lg shadow-soft border-border border">
    <table class="min-w-full divide-y divide-border">
      <!-- Table Head -->
      <thead class="bg-card">
        <tr>
          <th
            v-for="column in visibleColumns"
            :key="column.key"
            :style="{ width: column.width }"
            :class="[
              'px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none transition-colors',
              column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left',
              column.sortable !== false ? 'cursor-pointer hover:bg-muted dark:hover:bg-muted/70' : ''
            ]"
            @click="column.sortable !== false && $emit('sort', column.key)"
          >
            <div class="flex items-center gap-2" :class="column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'">
              <span>{{ column.label }}</span>
              <!-- Sort indicator -->
              <span v-if="column.sortable !== false" class="flex flex-col">
                <svg
                  :class="[
                    'h-3 w-3 transition-all',
                    sort.column === column.key && sort.order === 'asc'
                      ? 'text-primary dark:text-primary-foreground'
                      : 'text-muted-foreground dark:text-muted-foreground/70'
                  ]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </span>
            </div>
          </th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody class="divide-y divide-border bg-background text-foreground">
        <!-- Loading State -->
        <tr v-if="loading">
          <td :colspan="visibleColumns.length" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-3">
              <svg class="animate-spin h-8 w-8 text-primary dark:text-primary-foreground" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </td>
        </tr>

        <!-- Error State -->
        <tr v-else-if="error">
          <td :colspan="visibleColumns.length" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-3">
              <div class="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <svg class="h-6 w-6 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-card-foreground">Error loading data</p>
                <p class="text-xs text-muted-foreground mt-1">{{ error }}</p>
              </div>
              <button
                @click="$emit('refresh')"
                class="mt-2 px-3 py-1.5 text-xs font-medium text-primary dark:text-primary-foreground hover:text-primary-foreground/80 dark:hover:text-primary/80 transition-colors"
              >
                Try again
              </button>
            </div>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="data.length === 0">
          <td :colspan="visibleColumns.length" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-3">
              <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <svg class="h-6 w-6 text-muted-foreground dark:text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-card-foreground">No data found</p>
                <p class="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
              </div>
            </div>
          </td>
        </tr>

        <!-- Data Rows -->
        <tr
          v-else
          v-for="(row, index) in data"
          :key="index"
          class="hover:bg-muted/50 dark:hover:bg-muted/70 transition-colors"
        >
          <td
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[
              'px-4 py-3 text-sm transition-colors',
              column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left',
              'text-card-foreground'
            ]"
          >
            <!-- Scoped slot for custom cell rendering -->
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
              :column="column"
            >
              {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, SortState } from './types/table.types'

interface Props {
  data?: Record<string, unknown>[]
  visibleColumns?: TableColumn[]
  loading?: boolean
  error?: string | null
  sort?: SortState
}

withDefaults(defineProps<Props>(), {
  data: () => [],
  visibleColumns: () => [],
  loading: false,
  error: null,
  sort: () => ({ column: null, order: null }),
})

defineEmits<{
  sort: [columnKey: string]
  refresh: []
}>()
</script>
