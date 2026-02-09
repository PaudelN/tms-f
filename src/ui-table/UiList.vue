<template>
  <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
    <!-- List Header -->

    
    <div class="border-b border-border px-4 py-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-card-foreground">List View</h3>
        <div class="text-xs text-muted-foreground">
          {{ items.length }} items
        </div>
      </div>
    </div>

    <!-- List Body -->
    <div class="divide-y divide-border">
      <!-- Loading state -->
      <div v-if="loading" class="px-4 py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <svg class="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="px-4 py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">No items</p>
            <p class="text-xs text-muted-foreground mt-1">Get started by adding your first item</p>
          </div>
        </div>
      </div>

      <!-- List items -->
      <div
        v-else
        v-for="(item, index) in items"
        :key="index"
        class="px-4 py-3 hover:bg-accent transition-colors cursor-pointer"
      >
        <slot name="item" :item="item" :index="index">
          <div class="text-sm text-foreground">
            {{ item }}
          </div>
        </slot>
      </div>
    </div>

    <!-- List Footer -->
    <div v-if="showFooter && items.length > 0" class="border-t border-border px-4 py-3">
      <slot name="footer">
        <div class="text-xs text-muted-foreground text-center">
          End of list
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  items: any[]
  loading?: boolean
  showFooter?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  showFooter: true
})
</script>