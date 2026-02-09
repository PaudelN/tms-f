<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-foreground mb-1">Workspaces</h1>
      <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
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

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative">
        <Input
          :model-value="searchQuery"
          placeholder="Quick search..."
          class="w-full sm:w-64 pl-10"
          @update:model-value="emit('update:searchQuery', $event)"
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

      <Button class="px-5" @click="emit('create')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>New Workspace</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

defineProps<{
  activeCount: number;
  archivedCount: number;
  pinnedCount: number;
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: "update:searchQuery", value: string): void;
  (e: "create"): void;
}>();
</script>
