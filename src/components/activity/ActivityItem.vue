<template>
  <div class="group flex items-stretch gap-0 px-1 relative">
    <!-- Spine column: icon + vertical line -->
    <div class="flex flex-col items-center w-10 shrink-0">
      <!-- Icon circle -->
      <div
        class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-transform duration-150 "
        :style="{
          background: iconBg,
          borderColor: iconBorder,
        }"
      >
        <component
          :is="eventIcon"
          class="w-4 h-4"
          :style="{ color: categoryColor }"
        />
      </div>
      <!-- Vertical connector line -->
      <div
        v-if="!isLast"
        class="w-px flex-1 mt-1"
        :style="{ background: `${categoryColor}22` }"
      />
    </div>

    <!-- Body -->
    <div
      class="flex-1 min-w-0 pb-4 pl-2.5 pt-0.5 rounded-r-lg transition-colors duration-150 "
    >
      <!-- Left accent line on hover -->
      <div
        class="absolute left-[34px] top-1 bottom-4 w-[2px] rounded-full opacity-0 "
        :style="{ background: categoryColor }"
      />

      <!-- Description -->
      <p
        class="text-[12.5px] leading-snug text-foreground/85 mb-1.5"
        v-html="formattedDescription"
      />

      <!-- Meta row: badge + time -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Event badge -->
        <span
          class="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.07em] px-1.5 py-[2px] rounded-full"
          :style="{
            background: iconBg,
            color: categoryColor,
            borderColor: iconBorder,
          }"
          style="border-width: 0.5px; border-style: solid"
        >
          <span
            class="h-[5px] w-[5px] rounded-full shrink-0"
            :style="{ background: categoryColor }"
          />
          {{ activity.label }}
        </span>

        <!-- Change diff pills (for updated events) -->
        <template v-if="changedFields.length">
          <span
            v-for="field in changedFields.slice(0, 3)"
            :key="field"
            class="text-[9px] font-medium text-muted-foreground/60 bg-muted/50 border border-border/30 px-1.5 py-[2px] rounded"
          >
            {{ formatFieldName(field) }}
          </span>
          <span
            v-if="changedFields.length > 3"
            class="text-[9px] text-muted-foreground/40"
          >
            +{{ changedFields.length - 3 }} more
          </span>
        </template>

        <!-- Timestamp -->
        <span
          class="ml-auto text-[10px] text-muted-foreground/40 transition-colors duration-150 shrink-0 whitespace-nowrap"
          :title="fullDate"
        >
          {{ activity.time_ago }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type ActivityItem, CATEGORY_COLORS } from "@/types/activity.types";
  import { computed, defineComponent, h } from "vue";

  // ── Icon components (inline SVG, no external dep beyond lucide) ──────────────
  // We define tiny render-function components so <component :is=""> works cleanly

  const IconCreated = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("circle", {
          cx: 8,
          cy: 8,
          r: 6,
          stroke: "currentColor",
          "stroke-width": 1.6,
        }),
        h("path", {
          d: "M8 5.5v5M5.5 8h5",
          stroke: "currentColor",
          "stroke-width": 1.6,
          "stroke-linecap": "round",
        }),
      ]),
  });

  const IconUpdated = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("path", {
          d: "M3 8l3.5 3.5L13 4",
          stroke: "currentColor",
          "stroke-width": 1.6,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
      ]),
  });

  const IconDeleted = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("path", {
          d: "M4 4l8 8M12 4l-8 8",
          stroke: "currentColor",
          "stroke-width": 1.6,
          "stroke-linecap": "round",
        }),
      ]),
  });

  const IconMoved = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("path", {
          d: "M3 8h10M9 4l4 4-4 4",
          stroke: "currentColor",
          "stroke-width": 1.6,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
      ]),
  });

  const IconReordered = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("path", {
          d: "M5 4h6M5 8h6M5 12h6",
          stroke: "currentColor",
          "stroke-width": 1.6,
          "stroke-linecap": "round",
        }),
      ]),
  });

  const IconPriority = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("path", {
          d: "M8 2l1.8 4.2 4.2.6-3 3 .7 4.2L8 12l-3.7 2 .7-4.2-3-3 4.2-.6z",
          stroke: "currentColor",
          "stroke-width": 1.4,
          "stroke-linejoin": "round",
        }),
      ]),
  });

  const IconStage = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("rect", {
          x: 2,
          y: 3,
          width: 12,
          height: 10,
          rx: 2,
          stroke: "currentColor",
          "stroke-width": 1.5,
        }),
        h("path", {
          d: "M6 3v10",
          stroke: "currentColor",
          "stroke-width": 1.5,
          "stroke-linecap": "round",
        }),
        h("path", {
          d: "M10 3v10",
          stroke: "currentColor",
          "stroke-width": 1.5,
          "stroke-linecap": "round",
        }),
      ]),
  });

  const IconAssigned = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("circle", {
          cx: 8,
          cy: 5,
          r: 3,
          stroke: "currentColor",
          "stroke-width": 1.5,
        }),
        h("path", {
          d: "M2 14c0-3 2.7-5 6-5s6 2 6 5",
          stroke: "currentColor",
          "stroke-width": 1.5,
          "stroke-linecap": "round",
        }),
      ]),
  });

  const IconDefault = defineComponent({
    render: () =>
      h("svg", { viewBox: "0 0 16 16", fill: "none", width: 12, height: 12 }, [
        h("circle", { cx: 8, cy: 8, r: 2.5, fill: "currentColor" }),
      ]),
  });

  // ── Props ────────────────────────────────────────────────────────────────────

  const props = defineProps<{
    activity: ActivityItem;
    isLast?: boolean;
  }>();

  // ── Category color ───────────────────────────────────────────────────────────

  const categoryColor = computed(
    () =>
      CATEGORY_COLORS[props.activity.category] ?? "rgb(var(--color-primary))",
  );

  const iconBg = computed(() => `${categoryColor.value}18`);
  const iconBorder = computed(() => `${categoryColor.value}35`);

  // ── Icon selection ───────────────────────────────────────────────────────────

  const EVENT_ICON_MAP: Record<string, ReturnType<typeof defineComponent>> = {
    created: IconCreated,
    updated: IconUpdated,
    deleted: IconDeleted,
    moved: IconMoved,
    reordered: IconReordered,
    priority_changed: IconPriority,
    stage_created: IconStage,
    stage_renamed: IconStage,
    stage_deleted: IconDeleted,
    stage_reordered: IconReordered,
    assigned: IconAssigned,
  };

  const eventIcon = computed(
    () => EVENT_ICON_MAP[props.activity.event] ?? IconDefault,
  );

  // ── Description: bold the causer name ───────────────────────────────────────

  const formattedDescription = computed(() => {
    const desc = props.activity.description;
    const causer = props.activity.causer?.name;
    if (!causer || causer === "System") return desc;
    return desc.replace(
      causer,
      `<strong class="font-semibold text-foreground">${causer}</strong>`,
    );
  });

  // ── Changed fields (for updated events) ─────────────────────────────────────

  const changedFields = computed<string[]>(() => {
    if (props.activity.event !== "updated") return [];
    const changes = props.activity.properties?.changes;
    if (!changes || typeof changes !== "object") return [];
    return Object.keys(changes as Record<string, unknown>);
  });

  function formatFieldName(field: string): string {
    return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // ── Full date tooltip ────────────────────────────────────────────────────────

  const fullDate = computed(() => {
    try {
      return new Date(props.activity.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return props.activity.created_at;
    }
  });
</script>
