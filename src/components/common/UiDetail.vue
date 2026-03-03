<template>
  <div class="flex-1 flex flex-col min-h-0 w-full bg-background">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="relative">
          <div
            class="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="h-3 w-3 rounded-full bg-primary/40 animate-pulse" />
          </div>
        </div>
        <p
          class="text-xs text-muted-foreground font-medium tracking-widest uppercase"
        >
          {{ loadingText }}
        </p>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="flex-1 flex flex-col min-h-0">
      <!-- Top Bar -->
      <div
        class="px-5 pt-3.5 pb-2.5 flex items-center justify-between shrink-0"
      >
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5">
          <button
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
            class="flex items-center gap-1.5"
            @click="crumb.onClick?.()"
          >
            <span
              :class="[
                'text-[12px] font-medium transition-colors',
                i === breadcrumbs.length - 1
                  ? 'text-foreground text-[13px] font-semibold cursor-default'
                  : 'text-muted-foreground hover:text-foreground cursor-pointer',
              ]"
              >{{ crumb.label }}</span
            >
            <ChevronRight
              v-if="i < breadcrumbs.length - 1"
              class="h-3 w-3 text-muted-foreground/40 shrink-0"
            />
          </button>

          <!-- Status badge inline with breadcrumb -->
          <div v-if="statusBadge" class="ml-2">
            <Badge
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono border border-transparent transition-all duration-200"
              :class="
                statusBadge.class ??
                'bg-primary-20 text-primary border-primary-thin'
              "
            >
              {{ statusBadge.label }}
            </Badge>
          </div>
        </nav>

        <!-- Action Buttons -->
        <TooltipProvider :delay-duration="150">
          <div class="flex items-center gap-4 mr-4">
            <template v-for="action in actions" :key="action.id">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    type="button"
                    :disabled="action.disabled"
                    class="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-200 bg-primary-20"
                    :class="getActionClass(action)"
                    @click="action.onClick"
                  >
                    <component :is="action.icon" class="h-4.5 w-4.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  :side-offset="6"
                  class="text-[11px] font-semibold tracking-wide"
                  :class="
                    action.variant === 'destructive'
                      ? 'bg-destructive text-destructive-foreground border-destructive/30'
                      : ''
                  "
                >
                  {{ action.label }}
                </TooltipContent>
              </Tooltip>
            </template>
          </div>
        </TooltipProvider>
      </div>

      <!-- =============================== -->
      <!-- Resizable Layout               -->
      <!-- =============================== -->
      <div class="flex-1 min-h-0 px-2 pb-3">
        <ResizablePanelGroup
          direction="vertical"
          class="h-full rounded-sm border border-border/50 overflow-hidden shadow-soft"
        >
          <!-- ── UPPER: horizontal left + right ── -->
          <ResizablePanel :default-size="62" :min-size="35">
            <ResizablePanelGroup direction="horizontal" class="h-full">
              <!-- LEFT metadata panel -->
              <ResizablePanel
                :default-size="metaDefaultSize"
                :min-size="10"
                :max-size="30"
                class="border-r border-border/40"
              >
                <ScrollArea class="h-full">
                  <div class="px-4 py-4 space-y-0">
                    <div
                      v-for="(field, i) in metaFields"
                      :key="field.label"
                      class="group"
                    >
                      <div
                        class="py-3 space-y-1.5 transition-colors duration-100"
                        :class="i < metaFields.length - 1"
                      >
                        <p
                          class="'flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 select-none',"
                        >
                          {{ field.label }}
                        </p>
                        <div class="flex items-center gap-1.5">
                          <component
                            v-if="field.icon"
                            :is="field.icon"
                            class="h-3 w-3 text-muted-foreground/50 flex-shrink-0"
                          />
                          <!-- Badge type -->
                          <span
                            v-if="field.type === 'badge'"
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            :class="
                              field.badgeClass ??
                              'bg-primary-20 text-primary border-primary-thin'
                            "
                          >
                            {{ field.value }}
                          </span>
                          <!-- Avatar type -->
                          <div
                            v-else-if="
                              field.type === 'avatar' && field.avatarData
                            "
                            class="flex items-center gap-2"
                          >
                            <div
                              class="h-6 w-6 rounded-full ring-1 ring-primary/30 bg-primary-20 flex items-center justify-center flex-shrink-0"
                            >
                              <span class="text-[10px] font-bold text-primary">
                                {{ field.avatarData.initials }}
                              </span>
                            </div>
                            <div class="min-w-0">
                              <p
                                class="text-[12px] font-semibold truncate leading-tight"
                              >
                                {{ field.avatarData.name }}
                              </p>
                              <p
                                class="text-[10px] text-muted-foreground truncate"
                              >
                                {{ field.avatarData.sub }}
                              </p>
                            </div>
                          </div>
                          <!-- Default text -->
                          <span
                            v-else
                            class="text-[12px] font-medium text-foreground leading-snug"
                          >
                            {{ field.value }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle with-handle />

              <ResizablePanel
                :default-size="100 - metaDefaultSize"
                :min-size="45"
              >
                <ScrollArea class="h-full">
                  <div class="px-7 py-5 space-y-6">
                    <!-- Named slots for right panel sections -->
                    <slot name="content">
                      <!-- default empty state -->
                      <div
                        class="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground/40"
                      >
                        <FileText class="h-8 w-8" />
                        <p class="text-xs">No content provided</p>
                      </div>
                    </slot>
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle with-handle class="border-b" />

          <ResizablePanel :default-size="35" :min-size="30" :max-size="45">
            <div class="h-full flex flex-col">
              <div
                class="flex-shrink-0 flex items-center justify-between px-6 py-3"
              >
                <div class="flex items-center gap-2">
                  <h3
                    class="'flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 select-none',"
                  >
                    Activity & Comments
                  </h3>
                </div>
                <div class="flex items-center gap-2">
                  <slot name="activity-actions" />
                  <span
                    v-if="activityComingSoon"
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 border border-border/50 px-2 py-0.5 rounded-full"
                  >
                    Coming soon
                  </span>
                </div>
              </div>

              <ScrollArea class="flex-1">
                <div class="px-6 py-4">
                  <slot name="activity">
                    <!-- default placeholder -->
                    <div class="space-y-3">
                      <div
                        v-for="i in 4"
                        :key="i"
                        class="flex items-start gap-3"
                        :style="`opacity: ${0.06 + i * 0.04}`"
                      >
                        <div
                          class="h-6 w-6 rounded-full bg-muted shrink-0 mt-0.5"
                        />
                        <div class="flex-1 space-y-1.5 pt-0.5">
                          <div
                            class="h-2 rounded-full bg-muted"
                            :style="`width: ${[100, 140, 80, 120][i - 1]}px`"
                          />
                          <div
                            class="h-1.5 rounded-full bg-muted/70"
                            :style="`width: ${[180, 140, 200, 160][i - 1]}px`"
                          />
                        </div>
                        <div
                          class="h-1.5 w-12 rounded-full bg-muted/50 mt-1 shrink-0"
                        />
                      </div>
                    </div>

                    <div class="mt-6 flex flex-col items-center gap-2 py-3">
                      <MessageSquare class="h-6 w-6 text-muted-foreground/20" />
                      <p
                        class="text-[11px] text-muted-foreground/30 italic text-center"
                      >
                        Activity and comments will appear here
                      </p>
                    </div>
                  </slot>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>

    <!-- =============================== -->
    <!-- Delete Confirm Dialog (built-in) -->
    <!-- =============================== -->
    <Dialog v-model:open="internalDeleteOpen">
      <DialogContent class="max-w-sm">
        <DialogHeader>
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0"
            >
              <Trash2 class="h-4.5 w-4.5 text-destructive" />
            </div>
            <div>
              <DialogTitle class="text-[15px] font-semibold">{{
                deleteDialog.title ?? "Delete Item"
              }}</DialogTitle>
              <DialogDescription class="text-xs mt-0.5 text-muted-foreground">
                {{
                  deleteDialog.description ?? "This action cannot be undone."
                }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          class="rounded-lg bg-destructive/5 border border-destructive/15 px-4 py-3 text-[13px] text-destructive/80 leading-relaxed"
        >
          <slot name="delete-body">
            <span
              >This item will be
              <strong class="font-semibold">permanently deleted</strong> along
              with all its data.</span
            >
          </slot>
        </div>

        <DialogFooter class="gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            class="flex-1 h-9"
            @click="internalDeleteOpen = false"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            class="flex-1 h-9 font-semibold"
            :disabled="deleteLoading"
            @click="handleDeleteConfirm"
          >
            <Loader2
              v-if="deleteLoading"
              class="h-3.5 w-3.5 mr-1.5 animate-spin"
            />
            <span v-else>{{ deleteDialog.confirmLabel ?? "Delete" }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import type { Component } from "vue";
  import { ref, watch } from "vue";

  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

  import Badge from "@/components/ui/badge/Badge.vue";
  import {
    ChevronRight,
    FileText,
    Loader2,
    MessageSquare,
    Trash2,
  } from "lucide-vue-next";

  // ─────────────────────────────────────────
  // Types
  // ─────────────────────────────────────────

  export interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
  }

  export interface StatusBadge {
    label: string;
    class?: string;
  }

  export interface ActionButton {
    id: string;
    label: string;
    icon: Component;
    variant?: "default" | "destructive" | "ghost";
    disabled?: boolean;
    onClick: () => void;
  }

  export interface MetaField {
    label: string;
    value?: string;
    icon?: Component;
    type?: "text" | "badge" | "avatar";
    badgeClass?: string;
    avatarData?: {
      initials: string;
      name: string;
      sub: string;
    };
  }

  export interface DeleteDialog {
    title?: string;
    description?: string;
    confirmLabel?: string;
  }

  // ─────────────────────────────────────────
  // Props
  // ─────────────────────────────────────────

  const props = withDefaults(
    defineProps<{
      loading?: boolean;
      loadingText?: string;
      breadcrumbs?: BreadcrumbItem[];
      statusBadge?: StatusBadge;
      actions?: ActionButton[];
      metaFields?: MetaField[];
      metaDefaultSize?: number;
      deleteOpen?: boolean;
      deleteLoading?: boolean;
      deleteDialog?: DeleteDialog;
      activityComingSoon?: boolean;
    }>(),
    {
      loading: false,
      loadingText: "Loading…",
      breadcrumbs: () => [],
      actions: () => [],
      metaFields: () => [],
      metaDefaultSize: 20,
      deleteOpen: false,
      deleteLoading: false,
      deleteDialog: () => ({}),
      activityComingSoon: true,
    },
  );

  // ─────────────────────────────────────────
  // Emits
  // ─────────────────────────────────────────

  const emit = defineEmits<{
    "update:deleteOpen": [value: boolean];
    "confirm-delete": [];
  }>();

  // ─────────────────────────────────────────
  // Internal state
  // ─────────────────────────────────────────

  const internalDeleteOpen = ref(props.deleteOpen);

  watch(
    () => props.deleteOpen,
    (v) => {
      internalDeleteOpen.value = v;
    },
  );
  watch(internalDeleteOpen, (v) => {
    emit("update:deleteOpen", v);
  });

  function handleDeleteConfirm() {
    emit("confirm-delete");
  }

  // ─────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────

  function getActionClass(action: ActionButton): string {
    if (action.variant === "destructive") {
      return "bg-red-200 text-red-700 shadow-sm hover:bg-red-300";
    }
    if (action.variant === "ghost") {
      return "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent";
    }
    return "bg-primary-20 text-primary hover:bg-primary";
  }
</script>
