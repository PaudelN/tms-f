<template>
  <div class="h-full flex flex-col gap-0">
    <!-- Live indicator -->
    <Transition name="fade">
      <div
        v-if="isConnected"
        class="shrink-0 flex items-center justify-between px-1 pb-2"
      >
        <span
          class="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest"
        >
          {{
            totalCount > 0
              ? `${totalCount} event${totalCount !== 1 ? "s" : ""}`
              : "Timeline"
          }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 border border-emerald-500/20 px-2 py-0.5 rounded-full"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
    </Transition>

    <ActivityTimeline
      ref="timelineRef"
      :entity-type="entityType"
      :entity-id="entityId"
    />
  </div>
</template>

<script setup lang="ts">
  import { useActivityChannel } from "@/composables/useActivityChannel";
  import type { ActivityItem } from "@/types/activity.types";
  import { ref } from "vue";
  import ActivityTimeline from "./ActivityTimeline.vue";

  const props = defineProps<{
    entityType: string;
    entityId: number;
    isLive?: boolean;
  }>();

  const timelineRef = ref<InstanceType<typeof ActivityTimeline> | null>(null);
  const isConnected = ref(false);
  const totalCount = ref(0);

  useActivityChannel(props.entityType, props.entityId, (item: ActivityItem) => {
    timelineRef.value?.insertRealtimeActivity(item);
    totalCount.value++;
  });

  setTimeout(() => {
    isConnected.value = true;
  }, 1500);

  function pushRealtimeActivity(item: ActivityItem) {
    timelineRef.value?.insertRealtimeActivity(item);
  }

  function reload() {
    timelineRef.value?.reload();
  }

  defineExpose({ pushRealtimeActivity, reload });
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition:
      opacity 0.3s,
      transform 0.3s;
  }
  .fade-enter-from {
    opacity: 0;
    transform: translateY(-4px);
  }
  .fade-leave-to {
    opacity: 0;
  }
</style>
