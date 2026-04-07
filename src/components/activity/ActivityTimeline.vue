<template>
  <div class="h-full flex flex-col min-h-0">
    <!-- Filter controls -->
    <div class="shrink-0 px-1 pb-3">
      <ActivityControls
        :model-value="activeCategory"
        @update:model-value="handleCategoryChange"
      />
    </div>

    <!-- Scrollable body -->
    <div
      ref="scrollRef"
      class="flex-1 overflow-y-auto min-h-0 -mx-1 px-1"
      @scroll.passive="handleScroll"
    >
      <ActivityState v-if="isLoading" state="loading" />

      <ActivityState
        v-else-if="error"
        state="error"
        :message="error"
        @retry="load"
      />

      <ActivityState v-else-if="groupedByDate.length === 0" state="empty" />

      <template v-else>
        <ActivityList :groups="groupedByDate" />

        <div class="py-4 flex flex-col items-center gap-2">
          <div v-if="isLoadingMore" class="flex items-center gap-2">
            <div
              class="h-3 w-3 rounded-full border border-primary/30 border-t-primary animate-spin"
            />
            <span class="text-[10px] text-muted-foreground/40 font-medium"
              >Loading more…</span
            >
          </div>

          <div ref="sentinelRef" class="h-px w-full" />

          <div v-if="!hasMore && !isLoadingMore" class="pt-1">
            <span
              class="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/25 border border-border/20 px-3 py-1 rounded-full"
            >
              <svg viewBox="0 0 16 16" fill="none" class="h-2.5 w-2.5">
                <path
                  d="M3 8l3.5 3.5L13 4"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              All caught up
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useActivity } from "@/composables/useActivity";
  import type { ActivityCategory } from "@/types/activity.types";
  import { onBeforeUnmount, onMounted, ref, watch } from "vue";
  import ActivityControls from "./ActivityControls.vue";
  import ActivityList from "./ActivityList.vue";
  import ActivityState from "./ActivityState.vue";

  const props = defineProps<{
    entityType: string;
    entityId: number;
  }>();

  const {
    groupedByDate,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    activeCategory,
    load,
    loadMore,
    changeCategory,
    insertRealtimeActivity,
  } = useActivity(props.entityType, props.entityId);

  defineExpose({ insertRealtimeActivity, reload: load });

  const scrollRef = ref<HTMLElement | null>(null);
  const sentinelRef = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  function handleCategoryChange(cat: ActivityCategory) {
    changeCategory(cat);
  }

  function setupObserver() {
    if (!sentinelRef.value) return;
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value && !isLoadingMore.value)
          loadMore();
      },
      { threshold: 0.1, root: scrollRef.value },
    );
    observer.observe(sentinelRef.value);
  }

  function handleScroll() {
    const el = scrollRef.value;
    if (!el || isLoadingMore.value || !hasMore.value) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) loadMore();
  }

  watch(sentinelRef, (el) => {
    if (el) setupObserver();
  });
  watch(
    () => [props.entityType, props.entityId] as [string, number],
    () => load(),
  );
  onMounted(() => load());
  onBeforeUnmount(() => observer?.disconnect());
</script>
