<template>
  <div class="min-h-0 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
    <button
      v-for="cat in ACTIVITY_CATEGORIES"
      :key="cat.value"
      class="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.07em] px-2.5 py-1 rounded-full border transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      :class="
        modelValue === cat.value
          ? 'bg-primary/10 text-primary border-primary/30 shadow-none'
          : 'bg-transparent text-muted-foreground/50 border-border/30 hover:text-muted-foreground/80 hover:bg-muted/60 hover:border-border/50'
      "
      @click="$emit('update:modelValue', cat.value)"
    >
      <span
        v-if="cat.value !== 'all'"
        class="h-1.5 w-1.5 rounded-full shrink-0 transition-opacity duration-150"
        :class="modelValue === cat.value ? 'opacity-100' : 'opacity-40'"
        :style="{ background: getCategoryColor(cat.value) }"
      />
      {{ cat.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
  CATEGORY_COLORS,
} from "@/types/activity.types";

  defineProps<{ modelValue: ActivityCategory }>();
  defineEmits<{ "update:modelValue": [value: ActivityCategory] }>();

  function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] ?? "rgb(var(--color-primary))";
  }
</script>
