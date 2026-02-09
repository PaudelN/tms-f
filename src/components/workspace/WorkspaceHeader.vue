<template>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-foreground mb-1">Workspaces</h1>
      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          {{ activeCount }} Active
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-orange-500"></span>
          {{ archivedCount }} Archived
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          {{ pinnedCount }} Pinned
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative">
        <input
          :value="searchQuery"
          type="text"
          placeholder="Quick search..."
          class="w-64 pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground shadow-sm"
          @input="updateSearch"
        />
        <svg
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <button
        type="button"
        class="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm hover:shadow hover:opacity-90 transition-all flex items-center gap-2"
        @click="emit('create')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>New Workspace</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeCount: number;
  archivedCount: number;
  pinnedCount: number;
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: "update:searchQuery", value: string): void;
  (e: "create"): void;
}>();

function updateSearch(event: Event) {
  emit("update:searchQuery", (event.target as HTMLInputElement).value);
}
</script>
