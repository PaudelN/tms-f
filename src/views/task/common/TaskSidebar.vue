<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-250 ease-out"
      enter-from-class="opacity-0 -translate-x-3"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-180 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-3"
    >
      <div
        v-if="open"
        class="fixed inset-y-0 z-40"
        :style="{ left: mainCollapsed ? '50px' : '224px' }"
      >
        <!-- Click-outside backdrop -->
        <div class="fixed inset-0 z-[-1]" @click="emit('close')" />

        <TooltipProvider :delay-duration="0">
          <div
            class="task-sidebar h-full flex flex-col overflow-hidden"
            :style="{
              width: isCollapsed ? '54px' : '220px',
              transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
            }"
          >
            <!-- ════════════════════════════
                 HEADER
            ════════════════════════════ -->
            <div class="task-sidebar-header shrink-0 px-2 py-2">
              <!-- Expanded header -->
              <div
                v-if="!isCollapsed"
                class="flex items-center gap-2.5 px-1.5 h-11"
              >
                <div class="task-icon-badge shrink-0">
                  <ClipboardList class="h-3.5 w-3.5" />
                </div>

                <div class="flex-1 min-w-0">
                  <p class="task-sidebar-title truncate">Tasks</p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="task-sidebar-subtitle">Task views</span>
                    <span class="task-count-badge">{{
                      navItems.filter((i) => !i.disabled).length
                    }}</span>
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      type="button"
                      class="task-collapse-btn h-7 w-7 shrink-0 rounded-lg flex items-center justify-center"
                      @click="isCollapsed = true"
                    >
                      <PanelLeftClose class="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="text-xs font-medium">
                    Collapse
                  </TooltipContent>
                </Tooltip>
              </div>

              <!-- Collapsed header -->
              <div v-else class="flex items-center justify-center h-11">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      type="button"
                      class="task-collapse-btn h-9 w-9 rounded-lg flex items-center justify-center"
                      @click="isCollapsed = false"
                    >
                      <PanelLeftOpen class="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="text-xs font-medium">
                    Tasks
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <!-- Section label -->
            <div v-if="!isCollapsed" class="task-section-label px-4 pb-1">
              <span>Views</span>
              <div class="task-section-line" />
            </div>
            <div v-else class="task-section-dot-divider" />

            <!-- ════════════════════════════
                 NAV ITEMS
            ════════════════════════════ -->
            <div class="flex-1 overflow-y-auto px-2 pt-1 pb-2">
              <div class="flex flex-col gap-0.5">
                <div
                  v-for="(item, index) in navItems"
                  :key="item.id"
                  class="task-nav-item-wrapper"
                  :style="{ '--item-index': index }"
                >
                  <!-- Collapsed: icon + tooltip -->
                  <template v-if="isCollapsed">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <button
                          type="button"
                          class="task-nav-btn task-nav-btn--collapsed"
                          :class="[
                            isActive(item.route) && 'task-nav-btn--active',
                            item.disabled && 'task-nav-btn--disabled',
                          ]"
                          :disabled="item.disabled"
                          @click="navigate(item)"
                        >
                          <span
                            v-if="isActive(item.route)"
                            class="task-active-pip"
                          />
                          <component :is="item.icon" class="h-4 w-4 shrink-0" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" class="text-xs font-medium">
                        {{ item.label }}
                        <span v-if="item.disabled" class="ml-1 opacity-50"
                          >(Soon)</span
                        >
                      </TooltipContent>
                    </Tooltip>
                  </template>

                  <!-- Expanded: full row -->
                  <template v-else>
                    <button
                      type="button"
                      class="task-nav-btn task-nav-btn--expanded w-full"
                      :class="[
                        isActive(item.route) && 'task-nav-btn--active',
                        item.disabled && 'task-nav-btn--disabled',
                      ]"
                      :disabled="item.disabled"
                      @click="navigate(item)"
                    >
                      <!-- Shimmer on active -->
                      <span
                        v-if="isActive(item.route)"
                        class="task-active-shimmer"
                      />

                      <!-- Icon container -->
                      <span
                        class="task-nav-icon-wrap"
                        :class="
                          isActive(item.route) && 'task-nav-icon-wrap--active'
                        "
                      >
                        <component :is="item.icon" class="h-3.5 w-3.5" />
                      </span>

                      <span class="flex-1 task-nav-label truncate text-left">
                        {{ item.label }}
                      </span>

                      <!-- "Soon" badge -->
                      <span v-if="item.disabled" class="task-soon-badge">
                        Soon
                      </span>

                      <!-- Active dot -->
                      <span
                        v-if="isActive(item.route)"
                        class="task-active-dot"
                      />
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <!-- ════════════════════════════
                 FOOTER
            ════════════════════════════ -->
            <div
              v-if="!isCollapsed"
              class="task-sidebar-footer px-3 py-2.5 shrink-0"
            >
              <div class="task-footer-inner">
                <Zap class="h-3 w-3 text-primary opacity-70 shrink-0" />
                <span class="task-footer-text">Pro workspace</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

  import {
    ClipboardList,
    Clock,
    Layers,
    PanelLeftClose,
    PanelLeftOpen,
    User,
    UserCheck,
    UserX,
    Zap,
  } from "lucide-vue-next";

  // ── Props / emits ─────────────────────────────────────────────────────────────
  defineProps<{
    open: boolean;
    /** Whether the main AppSidebar is in collapsed/icon mode */
    mainCollapsed: boolean;
  }>();

  const emit = defineEmits<{ close: [] }>();

  // ── Internal state ────────────────────────────────────────────────────────────
  const isCollapsed = ref(false);

  // ── Router ────────────────────────────────────────────────────────────────────
  const route = useRoute();
  const router = useRouter();

  // ── Nav items ─────────────────────────────────────────────────────────────────
  const navItems = [
    {
      id: "all-tasks",
      label: "All Tasks",
      icon: Layers,
      route: "task-all",
      disabled: false,
    },
    {
      id: "my-tasks",
      label: "My Tasks",
      icon: User,
      route: "my-tasks",
      disabled: false,
    },
    {
      id: "assigned-by-me",
      label: "Assigned By Me",
      icon: UserCheck,
      route: null,
      disabled: true,
    },
    {
      id: "overdue",
      label: "Overdue Tasks",
      icon: Clock,
      route: null,
      disabled: true,
    },
    {
      id: "unassigned",
      label: "Unassigned Tasks",
      icon: UserX,
      route: null,
      disabled: true,
    },
  ] as const;

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function isActive(routeName: string | null): boolean {
    if (!routeName) return false;
    return route.name === routeName;
  }

  function navigate(item: (typeof navItems)[number]) {
    if (item.disabled || !item.route) return;
    router.push({ name: item.route });
    emit("close");
  }
</script>

<style scoped>
  /* ══════════════════════════════════════════
   SIDEBAR SHELL
══════════════════════════════════════════ */
  .task-sidebar {
    background-color: rgb(var(--color-sidebar));
    box-shadow:
      1px 0 0 rgb(var(--color-border) / 0.3),
      4px 0 24px -4px rgb(0 0 0 / 0.06);
    position: relative;
    overflow: hidden;
  }

  .task-sidebar::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgb(var(--color-primary) / 0.025) 0%,
      transparent 35%,
      transparent 75%,
      rgb(var(--color-primary) / 0.015) 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* ══════════════════════════════════════════
   HEADER
══════════════════════════════════════════ */
  .task-sidebar-header {
    border-bottom: 1px solid rgb(var(--color-border) / 0.4);
    background: linear-gradient(
      135deg,
      rgb(var(--color-sidebar)) 0%,
      rgb(var(--color-primary) / 0.03) 100%
    );
    position: relative;
    z-index: 1;
  }

  .task-icon-badge {
    height: 30px;
    width: 30px;
    border-radius: 9px;
    background: linear-gradient(
      135deg,
      rgb(var(--color-primary) / 0.18) 0%,
      rgb(var(--color-primary) / 0.08) 100%
    );
    border: 1px solid rgb(var(--color-primary) / 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(var(--color-primary));
    box-shadow:
      0 0 0 3px rgb(var(--color-primary) / 0.06),
      inset 0 1px 0 rgb(255 255 255 / 0.12);
    transition: box-shadow 200ms ease;
  }

  .task-sidebar-title {
    font-size: 12.5px;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: rgb(var(--color-foreground));
    line-height: 1.2;
  }

  .task-sidebar-subtitle {
    font-size: 9.5px;
    font-weight: 500;
    color: rgb(var(--color-muted-foreground));
    letter-spacing: 0.01em;
    line-height: 1;
  }

  .task-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 14px;
    min-width: 14px;
    padding: 0 4px;
    border-radius: 99px;
    font-size: 8.5px;
    font-weight: 700;
    background: rgb(var(--color-primary) / 0.12);
    color: rgb(var(--color-primary));
    line-height: 1;
  }

  .task-collapse-btn {
    color: rgb(var(--color-muted-foreground) / 0.5);
    transition: all 150ms ease;
  }

  .task-collapse-btn:hover {
    color: rgb(var(--color-foreground));
    background: rgb(var(--color-accent));
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
  }

  /* ══════════════════════════════════════════
   SECTION LABELS
══════════════════════════════════════════ */
  .task-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 12px;
    padding-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .task-section-label span {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgb(var(--color-muted-foreground) / 0.6);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .task-section-line {
    height: 1px;
    flex: 1;
    background: linear-gradient(
      90deg,
      rgb(var(--color-border) / 0.6) 0%,
      transparent 100%
    );
  }

  .task-section-dot-divider {
    margin: 10px auto 6px;
    width: 20px;
    height: 1px;
    background: rgb(var(--color-border) / 0.5);
  }

  /* ══════════════════════════════════════════
   NAV ITEMS
══════════════════════════════════════════ */
  .task-nav-item-wrapper {
    animation: task-item-in 220ms ease-out both;
    animation-delay: calc(var(--item-index, 0) * 40ms + 40ms);
    position: relative;
    z-index: 1;
  }

  @keyframes task-item-in {
    from {
      opacity: 0;
      transform: translateX(-6px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .task-nav-btn {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    transition:
      background 160ms ease,
      color 160ms ease,
      box-shadow 160ms ease,
      transform 120ms ease;
    cursor: pointer;
    border: none;
    background: transparent;
  }

  .task-nav-btn--expanded {
    height: 36px;
    padding: 0 10px;
    gap: 9px;
    display: flex;
    align-items: center;
  }

  .task-nav-btn--collapsed {
    height: 36px;
    width: 36px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .task-nav-btn:not(.task-nav-btn--active):not(.task-nav-btn--disabled) {
    color: rgb(var(--color-muted-foreground));
  }

  .task-nav-btn:not(.task-nav-btn--active):not(.task-nav-btn--disabled):hover {
    background: rgb(var(--color-accent));
    color: rgb(var(--color-foreground));
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.05);
    transform: translateX(1px);
  }

  .task-nav-btn--active {
    background: linear-gradient(
      135deg,
      rgb(var(--color-primary) / 0.13) 0%,
      rgb(var(--color-primary) / 0.07) 100%
    ) !important;
    color: rgb(var(--color-primary)) !important;
    box-shadow:
      0 0 0 1px rgb(var(--color-primary) / 0.15),
      0 1px 4px rgb(var(--color-primary) / 0.1);
  }

  .task-nav-btn--disabled {
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  }

  .task-active-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgb(var(--color-primary) / 0.06) 50%,
      transparent 70%
    );
    pointer-events: none;
  }

  .task-active-pip {
    position: absolute;
    left: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    border-radius: 99px;
    background: rgb(var(--color-primary));
    box-shadow: 0 0 6px rgb(var(--color-primary) / 0.5);
  }

  .task-active-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgb(var(--color-primary));
    flex-shrink: 0;
    box-shadow: 0 0 0 2.5px rgb(var(--color-primary) / 0.2);
  }

  .task-nav-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: rgb(var(--color-muted) / 0.6);
    color: inherit;
    flex-shrink: 0;
    transition:
      background 160ms ease,
      box-shadow 160ms ease;
  }

  .task-nav-btn:hover .task-nav-icon-wrap:not(.task-nav-icon-wrap--active) {
    background: rgb(var(--color-border));
  }

  .task-nav-icon-wrap--active {
    background: rgb(var(--color-primary) / 0.15);
    box-shadow: 0 0 0 1px rgb(var(--color-primary) / 0.2);
  }

  .task-nav-label {
    font-size: 12.5px;
    font-weight: 500;
    letter-spacing: -0.005em;
    line-height: 1;
  }

  .task-soon-badge {
    height: 16px;
    padding: 0 6px;
    border-radius: 99px;
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: 1px dashed rgb(var(--color-border));
    background: transparent;
    color: rgb(var(--color-muted-foreground) / 0.5);
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }

  /* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
  .task-sidebar-footer {
    border-top: 1px solid rgb(var(--color-border) / 0.4);
    position: relative;
    z-index: 1;
  }

  .task-footer-inner {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 8px;
    background: rgb(var(--color-primary) / 0.05);
    border: 1px solid rgb(var(--color-primary) / 0.1);
  }

  .task-footer-text {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: -0.005em;
    color: rgb(var(--color-muted-foreground));
  }

  /* ══════════════════════════════════════════
   DARK MODE
══════════════════════════════════════════ */
  .dark .task-sidebar {
    box-shadow:
      1px 0 0 rgb(var(--color-border) / 0.4),
      4px 0 24px -4px rgb(0 0 0 / 0.25);
  }

  .dark .task-nav-icon-wrap {
    background: rgb(255 255 255 / 0.05);
  }

  .dark
    .task-nav-btn:hover
    .task-nav-icon-wrap:not(.task-nav-icon-wrap--active) {
    background: rgb(255 255 255 / 0.08);
  }

  .dark .task-soon-badge {
    border-color: rgb(var(--color-border) / 0.6);
  }
</style>
