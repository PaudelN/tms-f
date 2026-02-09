<template>
  <div class="mb-6">
    <div class="border-b border-border">
      <div class="flex items-center gap-1">
        <Button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          variant="ghost"
          class="relative px-5 py-3 text-sm font-medium"
          :class="activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
          @click="emit('update:activeTab', tab.id)"
        >
          <span class="flex items-center gap-2">
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span
              v-if="tab.badge !== undefined"
              class="px-1.5 py-0.5 text-xs rounded-full"
              :class="activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
            >
              {{ tab.badge }}
            </span>
          </span>
          <span v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { Button } from "@/components/ui/button";

export type WorkspaceTab = {
  id: string;
  label: string;
  icon: Component;
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
