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
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
          <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="px-4 py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <List class="h-6 w-6 text-muted-foreground" />
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
import { List, Loader2 } from "lucide-vue-next";
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
