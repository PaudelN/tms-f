<template>
  <div class="space-y-0">
    <template v-for="(group, gi) in groups" :key="group.date">
      <!-- Date separator -->
      <div
        class="flex items-center gap-2.5 px-1 py-2 sticky top-0 z-10 bg-card/95 backdrop-blur-sm"
      >
        <div class="h-px flex-1 bg-border/40" />
        <span
          class="inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground/50 bg-card border border-border/40 px-2.5 py-1 rounded-full shrink-0 shadow-subtle"
        >
          <svg
            v-if="isToday(group.date)"
            viewBox="0 0 16 16"
            fill="none"
            width="9"
            height="9"
            class="shrink-0"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M8 5v3l2 1.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          {{ formatDateLabel(group.date) }}
        </span>
        <div class="h-px flex-1 bg-border/40" />
      </div>

      <!-- Items -->
      <ActivityItem
        v-for="(item, ii) in group.items"
        :key="item.id"
        :activity="item"
        :is-last="gi === groups.length - 1 && ii === group.items.length - 1"
        class="animate-fade-in"
        :style="{ animationDelay: `${ii * 30}ms` }"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { ActivityItem as ActivityItemType } from "@/types/activity.types";
  import ActivityItem from "./ActivityItem.vue";

  defineProps<{
    groups: { date: string; items: ActivityItemType[] }[];
  }>();

  function isToday(dateStr: string): boolean {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  }

  function formatDateLabel(dateStr: string): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const d = new Date(dateStr);
    const fmt = (dt: Date) =>
      dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    if (fmt(d) === fmt(today)) return "Today";
    if (fmt(d) === fmt(yesterday)) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>
