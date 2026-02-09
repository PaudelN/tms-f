<template>
  <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
    <!-- Kanban Header -->
    <div class="border-b border-border px-4 py-3">
      <h3 class="text-sm font-semibold text-card-foreground">Kanban View</h3>
    </div>

    <!-- Kanban Board -->
    <div class="p-4">
      <!-- Loading state -->
      <div v-if="loading" class="py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <svg class="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="columns.length === 0" class="py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">No columns</p>
            <p class="text-xs text-muted-foreground mt-1">Add columns to get started</p>
          </div>
        </div>
      </div>

      <!-- Kanban columns -->
      <div v-else class="flex gap-4 overflow-x-auto pb-2">
        <div
          v-for="column in columns"
          :key="column.id"
          class="flex-shrink-0 w-72"
        >
          <!-- Column header -->
          <div class="bg-muted rounded-t-lg px-3 py-2 border border-border">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-foreground">
                {{ column.title }}
              </h4>
              <span class="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {{ column.items?.length || 0 }}
              </span>
            </div>
          </div>

          <!-- Column items -->
          <div class="bg-muted rounded-b-lg border-x border-b border-border p-2 min-h-[200px] space-y-2">
            <slot name="item" :column="column" :items="column.items || []">
              <div
                v-for="(item, index) in column.items"
                :key="index"
                class="bg-card rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div class="text-sm text-foreground">
                  {{ item.title || item }}
                </div>
              </div>
            </slot>

            <!-- Empty column state -->
            <div v-if="!column.items || column.items.length === 0" class="text-center py-8">
              <p class="text-xs text-muted-foreground">No items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KanbanColumn {
  id: string | number
  title: string
  items?: any[]
}

interface Props {
  columns: KanbanColumn[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})
</script>