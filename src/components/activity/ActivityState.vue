<template>
  <!-- Loading skeleton -->
  <div v-if="state === 'loading'" class="space-y-3 px-1 py-2">
    <div
      v-for="i in 4"
      :key="i"
      class="flex items-start gap-3 animate-fade-in"
      :style="{ animationDelay: `${i * 60}ms` }"
    >
      <div class="w-7 h-7 rounded-full bg-muted/60 animate-pulse shrink-0" />
      <div class="flex-1 space-y-2 pt-1">
        <div
          class="h-2.5 rounded-full bg-muted/60 animate-pulse"
          :style="{ width: WIDTHS[i - 1][0] + 'px' }"
        />
        <div
          class="h-2 rounded-full bg-muted/40 animate-pulse"
          :style="{ width: WIDTHS[i - 1][1] + 'px' }"
        />
      </div>
      <div
        class="h-2 w-12 rounded-full bg-muted/30 animate-pulse mt-1.5 shrink-0"
      />
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else-if="state === 'empty'"
    class="flex flex-col items-center justify-center py-12 gap-3 animate-fade-in"
  >
    <div class="relative">
      <div
        class="h-12 w-12 rounded-2xl bg-muted/30 border border-border/30 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          class="h-5 w-5 text-muted-foreground/30"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <div
        class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-muted/50 border border-border/40 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          class="h-2.5 w-2.5 text-muted-foreground/30"
        >
          <path
            d="M8 4v8M4 8h8"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>
    <div class="text-center space-y-1">
      <p class="text-[12px] font-semibold text-muted-foreground/50">
        No activity yet
      </p>
      <p
        class="text-[11px] text-muted-foreground/30 max-w-[160px] leading-relaxed"
      >
        Actions on this record will appear here in real time
      </p>
    </div>
  </div>

  <!-- Error state -->
  <div
    v-else-if="state === 'error'"
    class="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in"
  >
    <div
      class="h-11 w-11 rounded-2xl bg-destructive/8 border border-destructive/15 flex items-center justify-center"
    >
      <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5 text-destructive/60">
        <path
          d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="text-center space-y-1">
      <p class="text-[12px] font-semibold text-destructive/70">
        Failed to load activity
      </p>
      <p class="text-[11px] text-muted-foreground/50">{{ message }}</p>
    </div>
    <button
      class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary/70 hover:text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 hover:border-primary/25 transition-all duration-150 px-3 py-1.5 rounded-lg"
      @click="$emit('retry')"
    >
      <svg viewBox="0 0 16 16" fill="none" class="h-3 w-3">
        <path
          d="M13.5 8a5.5 5.5 0 11-1.1-3.3"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M13.5 2.5v3h-3"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      state: "loading" | "empty" | "error";
      message?: string;
    }>(),
    { message: "Something went wrong." },
  );

  defineEmits<{ retry: [] }>();

  const WIDTHS = [
    [140, 200],
    [100, 160],
    [160, 120],
    [120, 180],
  ];
</script>
