<template>
  <Tabs :model-value="activeTab" class="mb-6" @update:model-value="emit('update:activeTab', $event)">
    <TabsList class="w-full justify-start border-b border-border bg-transparent p-0">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.id"
        :value="tab.id"
        class="rounded-none border-b-2 border-transparent px-5 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          {{ tab.label }}
          <Badge v-if="tab.badge !== undefined" variant="secondary" class="text-xs">
            {{ tab.badge }}
          </Badge>
        </span>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type WorkspaceTab = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
};

defineProps<{
  tabs: WorkspaceTab[];
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: "update:activeTab", value: string): void;
}>();
</script>
