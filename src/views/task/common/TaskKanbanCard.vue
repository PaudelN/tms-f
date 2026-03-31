<template>
  <div
    class="task-card group/tc relative flex flex-col gap-0 cursor-pointer select-none overflow-hidden rounded-2xl transition-all duration-200"
    @click="emit('view', item.id)"
  >
    <!-- ── Inner content ───────────────────────────────────────────────── -->
    <div class="relative z-10 flex flex-col gap-3 p-4">
      <!-- ── Row 1: task number + priority ── -->
      <div class="flex items-center justify-between gap-2">
        <div
          class="task-number-badge inline-flex items-center gap-1 px-2 py-1 rounded-lg"
        >
          <Hash class="w-2.5 h-2.5 task-number-icon shrink-0" />
          <span
            class="text-[9.5px] font-mono font-bold tracking-wider task-number-text"
          >
            {{ item.task_number }}
          </span>
        </div>

        <span
          v-if="priorityObj"
          class="priority-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 transition-all duration-200"
          :class="priorityObj.badge"
        >
          <span
            class="w-1.5 h-1.5 rounded-full shrink-0 priority-dot"
            :class="priorityObj.dot"
          />
          {{ priorityObj.label }}
        </span>
      </div>

      <!-- ── Title ── -->
      <p
        class="card-title text-[13px] font-semibold leading-snug line-clamp-2 tracking-[-0.015em] transition-colors duration-150"
      >
        {{ item.title }}
      </p>

      <!-- ── Description ── -->
      <p
        v-if="item.description"
        class="card-description text-[11px] line-clamp-2 leading-relaxed"
      >
        {{ item.description }}
      </p>

      <!-- ── Footer ── -->
      <div
        class="card-footer flex items-center justify-between gap-2 pt-3 mt-0.5"
      >
        <div v-if="item.creator" class="flex items-center gap-2 min-w-0">
          <div
            class="creator-avatar h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 ring-2 ring-white/20"
            :style="{ background: avatarGradient }"
          >
            {{ item.creator.name.charAt(0).toUpperCase() }}
          </div>
          <span class="card-creator-name text-[10px] font-medium truncate">
            {{ item.creator.name }}
          </span>
        </div>
        <div v-else class="flex-1" />

        <div
          v-if="item.due_date"
          class="due-badge flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 transition-all duration-150"
          :class="
            item.is_overdue
              ? 'due-overdue'
              : item.is_due_today
                ? 'due-today'
                : 'due-normal'
          "
        >
          <CalendarDays class="w-3 h-3 shrink-0" />
          <span class="tabular-nums">{{ formattedDue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Task } from "@/stores/task";
  import type { KanbanStageDefinition } from "@/ui-table/types/kanban.types";
  import { CalendarDays, Hash } from "lucide-vue-next";
  import { computed } from "vue";

  const props = defineProps<{
    item: Task;
    stageMeta: KanbanStageDefinition;
  }>();

  const emit = defineEmits<{
    (e: "view", id: number): void;
    (e: "edit", id: number): void;
  }>();

  const priorityObj = computed(() => {
    const p = props.item.priority;
    if (!p) return null;
    if (typeof p === "object" && "badge" in p) return p;
    return null;
  });

  const AVATAR_COLORS = [
    ["#7c6ff7", "#a78bfa"],
    ["#f6a623", "#fbbf24"],
    ["#34c789", "#10b981"],
    ["#4a9eff", "#60a5fa"],
    ["#ff6b9d", "#f472b6"],
    ["#a855f7", "#c084fc"],
  ];

  const avatarGradient = computed(() => {
    const name = props.item.creator?.name ?? "";
    let h = 0;
    for (let i = 0; i < name.length; i++)
      h = name.charCodeAt(i) + ((h << 5) - h);
    const [from, to] = AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
    return `linear-gradient(135deg, ${from}, ${to})`;
  });

  const formattedDue = computed(() => {
    if (!props.item.due_date) return "";
    if (props.item.is_due_today) return "Today";
    return new Date(props.item.due_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });
</script>

<style scoped>
  /* ── Card base glass ──────────────────────────────────────────────────── */
  .task-card {
    /* default light */
    --card-bg: rgba(255, 255, 255, 0.72);
    --card-border: rgba(229, 231, 235, 0.9);
    --card-shadow:
      0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
    --card-hover-shadow:
      0 4px 24px rgba(139, 92, 246, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
    --card-hover-border: rgba(139, 92, 246, 0.25);
    --card-orb: rgba(139, 92, 246, 0.06);
    --card-sheen: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(255, 255, 255, 0.1) 60%,
      transparent 100%
    );
    --number-bg: rgba(243, 244, 246, 0.8);
    --number-text: rgba(107, 114, 128, 0.75);
    --number-icon: rgba(107, 114, 128, 0.45);
    --footer-border: rgba(229, 231, 235, 0.6);
    --title-color: rgb(17, 24, 39);
    --title-hover-color: rgb(139, 92, 246);
    --desc-color: rgba(107, 114, 128, 0.7);
    --creator-color: rgba(107, 114, 128, 0.65);
    --due-normal-bg: rgba(243, 244, 246, 0.8);
    --due-normal-text: rgba(107, 114, 128, 0.75);
    --due-today-bg: rgba(251, 191, 36, 0.12);
    --due-today-text: rgba(180, 130, 10, 0.95);
    --due-overdue-bg: rgba(239, 68, 68, 0.1);
    --due-overdue-text: rgb(220, 38, 38);

    border: 1px solid var(--card-border);
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(12px) saturate(1.4);
    -webkit-backdrop-filter: blur(12px) saturate(1.4);
  }

  /* dark mode overrides */
  :global(.dark) .task-card {
    --card-bg: rgba(22, 32, 50, 0.75);
    --card-border: rgba(30, 41, 59, 0.85);
    --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15);
    --card-hover-shadow:
      0 4px 28px rgba(139, 92, 246, 0.2), 0 1px 6px rgba(0, 0, 0, 0.25);
    --card-hover-border: rgba(139, 92, 246, 0.35);
    --card-orb: rgba(139, 92, 246, 0.09);
    --card-sheen: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.07) 0%,
      rgba(255, 255, 255, 0.02) 60%,
      transparent 100%
    );
    --number-bg: rgba(30, 41, 59, 0.7);
    --number-text: rgba(148, 163, 184, 0.7);
    --number-icon: rgba(148, 163, 184, 0.35);
    --footer-border: rgba(30, 41, 59, 0.8);
    --title-color: rgb(248, 250, 252);
    --title-hover-color: rgb(167, 139, 250);
    --desc-color: rgba(148, 163, 184, 0.65);
    --creator-color: rgba(148, 163, 184, 0.6);
    --due-normal-bg: rgba(30, 41, 59, 0.7);
    --due-normal-text: rgba(148, 163, 184, 0.7);
    --due-today-bg: rgba(251, 191, 36, 0.1);
    --due-today-text: rgba(251, 191, 36, 0.9);
    --due-overdue-bg: rgba(239, 68, 68, 0.12);
    --due-overdue-text: rgb(248, 113, 113);
  }

  /* ── Glass base layer ─────────────────────────────────────────────────── */
  .card-glass-base {
    background: var(--card-bg);
    inset: 0;
  }

  /* ── Sheen overlay ────────────────────────────────────────────────────── */
  .card-glass-sheen {
    background: var(--card-sheen);
    inset: 0;
  }

  /* ── Liquid orb accent ────────────────────────────────────────────────── */
  .card-liquid-orb {
    width: 80px;
    height: 80px;
    top: -20px;
    right: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--card-orb) 0%, transparent 70%);
    filter: blur(12px);
    transition:
      transform 0.4s ease,
      opacity 0.3s ease;
  }



  .task-card:active {
    transform: translateY(0);
  }

  /* ── Task number badge ────────────────────────────────────────────────── */
  .task-number-badge {
    background: var(--number-bg);
  }
  .task-number-text {
    color: var(--number-text);
  }
  .task-number-icon {
    color: var(--number-icon);
  }

  /* ── Title ────────────────────────────────────────────────────────────── */
  .card-title {
    color: var(--title-color);
  }
  .group\/tc:hover .card-title {
    color: var(--title-hover-color);
  }

  /* ── Description ──────────────────────────────────────────────────────── */
  .card-description {
    color: var(--desc-color);
  }

  /* ── Footer separator ─────────────────────────────────────────────────── */
  .card-footer {
    border-top: 1px solid var(--footer-border);
  }

  /* ── Creator name ─────────────────────────────────────────────────────── */
  .card-creator-name {
    color: var(--creator-color);
  }

  /* ── Due date badges ──────────────────────────────────────────────────── */
  .due-normal {
    background: var(--due-normal-bg);
    color: var(--due-normal-text);
  }
  .due-today {
    background: var(--due-today-bg);
    color: var(--due-today-text);
  }
  .due-overdue {
    background: var(--due-overdue-bg);
    color: var(--due-overdue-text);
  }

  /* ── Priority badge shimmer ───────────────────────────────────────────── */
  .priority-badge {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* ── Avatar ring ──────────────────────────────────────────────────────── */
  .creator-avatar {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }
</style>
