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
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          :model-value="searchQuery"
          type="text"
          placeholder="Quick search..."
          class="w-64 pl-10"
          @update:model-value="emit('update:searchQuery', $event)"
        />
      </div>

      <Button type="button" class="gap-2" @click="emit('create')">
        <Plus class="h-4 w-4" />
        <span>New Workspace</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-vue-next";

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
</script>
