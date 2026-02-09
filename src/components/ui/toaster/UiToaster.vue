<template>
  <div class="fixed top-6 right-6 z-50 flex flex-col gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="w-80 rounded-xl border border-border bg-card p-4 shadow-lg transition-all"
      :class="variantClasses[toast.variant ?? 'default']"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-foreground">{{ toast.title }}</p>
          <p v-if="toast.description" class="text-xs text-muted-foreground mt-1">
            {{ toast.description }}
          </p>
        </div>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground"
          @click="removeToast(toast.id)"
        >
          <span class="sr-only">Dismiss</span>
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useToast } from "./useToast";

const { toasts, removeToast } = useToast();

const variantClasses = computed(() => ({
  default: "",
  success: "border-emerald-500/40 bg-emerald-500/10",
  warning: "border-amber-500/40 bg-amber-500/10",
  destructive: "border-destructive/40 bg-destructive/10",
}));
</script>
