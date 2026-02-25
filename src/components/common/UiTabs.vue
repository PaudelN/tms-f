<template>
  <div class="mb-6">
    <div class="border-b border-border">
      <div class="flex items-center gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-5 py-3 text-sm font-medium transition-all relative"
          :class="activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
          @click="emit('update:activeTab', tab.id)"
        >
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            {{ tab.label }}
            <span
              v-if="tab.badge !== undefined"
              class="px-1.5 py-0.5 text-xs rounded-full"
              :class="activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
            >
              {{ tab.badge }}
            </span>
          </span>
          <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type Tab = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
};

defineProps<{
  tabs: Tab[];
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: "update:activeTab", value: string): void;
}>();
</script>
