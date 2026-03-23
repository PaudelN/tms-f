<template>
  <div class="flex-1 flex flex-col min-h-0 w-full bg-background">
    <!-- ── Loading State ── -->
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

    <!-- ── Content ── -->
    <div v-else class="flex-1 flex flex-col min-h-0">
      <!-- Top Bar -->
      <div
        class="px-5 pt-3.5 pb-2.5 flex items-center justify-between shrink-0"
      >
        <div v-if="statusBadge" class="ml-2">
          <Badge :color="getDotColor(statusBadge.dot ?? '')">
            {{ statusBadge.label }}
          </Badge>
        </div>
        <div />

        <!-- Action Buttons -->
        <TooltipProvider :delay-duration="150">
          <div class="flex items-center gap-1.5 mr-4">
            <template v-for="action in actions" :key="action.id">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    type="button"
                    variant="header"
                    :disabled="action.disabled"
                    class="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-200 bg-primary-20"
                    :class="getActionClass(action)"
                    @click="action.onClick"
                  >
                    <component :is="action.icon" class="h-4 w-4" />
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

      <!-- ── Resizable Layout ── -->
      <div class="flex-1 min-h-0 px-2 pb-3">
        <ResizablePanelGroup
          direction="vertical"
          class="h-full rounded-lg overflow-hidden shadow-sm"
        >
          <!-- UPPER PANEL -->
          <ResizablePanel :default-size="62" :min-size="35">
            <ResizablePanelGroup direction="horizontal" class="h-full">
              <!-- RIGHT: tabbed content -->
              <ResizablePanel
                :default-size="100 - metaDefaultSize"
                :min-size="45"
              >
                <div class="h-full flex flex-col">
                  <!-- ── WITH TABS ── -->
                  <template v-if="tabs && tabs.length > 0">
                    <Tabs
                      :model-value="activeTab"
                      class="h-full flex flex-col"
                      @update:model-value="handleTabChange"
                    >
                      <!-- Tab strip -->
                      <div class="shrink-0 relative border-border/50">
                        <!-- subtle background tint on strip -->
                        <div
                          class="absolute inset-0 bg-muted/[0.04] pointer-events-none"
                        />
                        <TabsList
                          class="relative h-auto bg-transparent p-0 gap-0 rounded-none flex items-end pl-2"
                        >
                          <!-- Detail tab (always first) -->
                          <TabsTrigger
                            :value="DETAIL_TAB_ID"
                            class="group relative h-10 px-5 bg-transparent rounded-none border-0 shadow-none text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/50 hover:text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-150 focus-visible:outline-none"
                          >
                            <!-- Active indicator bar -->
                            <span
                              class="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm bg-primary scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-200 ease-out origin-center"
                            />
                            <!-- Hover indicator bar -->
                            <span
                              class="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm bg-border scale-x-0 group-hover:scale-x-100 group-data-[state=active]:hidden transition-transform duration-150 ease-out origin-center"
                            />
                            Detail
                          </TabsTrigger>

                          <!-- Separator dot -->
                          <span
                            class="self-center w-px h-3.5 bg-border/60 mx-0.5 shrink-0"
                          />

                          <!-- Dynamic tabs -->
                          <TabsTrigger
                            v-for="tab in tabs"
                            :key="tab.id"
                            :value="tab.id"
                            class="group relative h-10 px-5 bg-transparent rounded-none border-0 shadow-none text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/50 hover:text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-150 focus-visible:outline-none"
                          >
                            <span
                              class="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm bg-primary scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-200 ease-out origin-center"
                            />
                            <span
                              class="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm bg-border scale-x-0 group-hover:scale-x-100 group-data-[state=active]:hidden transition-transform duration-150 ease-out origin-center"
                            />
                            <span class="relative flex items-center gap-1.5">
                              <component
                                v-if="tab.icon"
                                :is="tab.icon"
                                class="h-3 w-3"
                              />
                              {{ tab.label }}
                              <!-- Badge pill on tab -->
                              <span
                                v-if="tab.badge != null"
                                class="inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-bold leading-none bg-muted/80 text-muted-foreground/60 group-data-[state=active]:bg-primary/15 group-data-[state=active]:text-primary transition-colors duration-150"
                              >
                                {{ tab.badge }}
                              </span>
                            </span>
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <!-- Detail tab content -->
                      <TabsContent
                        :value="DETAIL_TAB_ID"
                        class="flex-1 overflow-hidden m-0 outline-none data-[state=inactive]:hidden"
                      >
                        <ScrollArea class="h-full">
                          <div class="px-7 py-6 space-y-6">
                            <slot name="content">
                              <div
                                class="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground/40"
                              >
                                <FileText class="h-8 w-8" />
                                <p class="text-xs">No content provided</p>
                              </div>
                            </slot>
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <!-- Dynamic tab contents -->
                      <TabsContent
                        v-for="tab in tabs"
                        :key="tab.id"
                        :value="tab.id"
                        class="flex-1 overflow-hidden m-0 outline-none data-[state=inactive]:hidden"
                      >
                        <ScrollArea class="h-full">
                          <div class="px-7 py-6 space-y-6">
                            <slot :name="`tab-${tab.id}`">
                              <div
                                class="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground/40"
                              >
                                <FileText class="h-8 w-8" />
                                <p class="text-xs">Nothing here yet</p>
                              </div>
                            </slot>
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </template>

                  <!-- ── WITHOUT TABS (original behaviour) ── -->
                  <template v-else>
                    <ScrollArea class="h-full">
                      <div class="px-7 py-6 space-y-6">
                        <slot name="content">
                          <div
                            class="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground/40"
                          >
                            <FileText class="h-8 w-8" />
                            <p class="text-xs">No content provided</p>
                          </div>
                        </slot>
                      </div>
                    </ScrollArea>
                  </template>
                </div>
              </ResizablePanel>

              <ResizableHandle with-handle />

              <!-- LEFT: meta sidebar -->
              <ResizablePanel
                :default-size="metaDefaultSize"
                :min-size="10"
                :max-size="30"
              >
                <ScrollArea class="h-full">
                  <div class="px-3 py-3 space-y-1">
                    <template
                      v-for="(field, i) in metaFields"
                      :key="field.label"
                    >
                      <div
                        class="group relative rounded-lg px-3 py-3 transition-all duration-150 hover:bg-muted/60 border border-transparent hover:border-border"
                      >
                        <!-- Label row -->
                        <div class="flex items-center gap-1.5 mb-2 font-bold">
                          <component
                            v-if="field.icon"
                            :is="field.icon"
                            class="h-3 w-3 text-muted-foreground/35 shrink-0 group-hover:text-primary transition-colors duration-150"
                          />
                          <p
                            class="text-[9px] tracking-[0.12em] uppercase text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors duration-150 select-none"
                          >
                            {{ field.label }}
                          </p>
                        </div>

                        <!-- Value row -->
                        <div class="pl-0.5">
                          <!-- Badge type -->
                          <Badge
                            v-if="field.type === 'badge'"
                            :color="getDotColor((field as any).dot ?? '')"
                          >
                            {{ field.value }}
                          </Badge>

                          <!-- Avatar type -->
                          <div
                            v-else-if="
                              field.type === 'avatar' && field.avatarData
                            "
                            class="flex items-center gap-2.5"
                          >
                            <div class="relative shrink-0">
                              <div
                                class="h-7 w-7 rounded-full bg-primary-10 border border-border flex items-center justify-center shadow-subtle"
                              >
                                <span
                                  class="text-[11px] font-black text-primary leading-none"
                                >
                                  {{ field.avatarData.initials }}
                                </span>
                              </div>
                              <!-- online dot -->
                              <span
                                class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-background border border-border"
                              >
                                <span
                                  class="block h-full w-full rounded-full bg-primary-20"
                                />
                              </span>
                            </div>
                            <div class="min-w-0">
                              <p
                                class="text-[12px] font-semibold text-foreground truncate leading-tight"
                              >
                                {{ field.avatarData.name }}
                              </p>
                              <p
                                class="text-[10px] text-muted-foreground truncate leading-snug mt-0.5"
                              >
                                {{ field.avatarData.sub }}
                              </p>
                            </div>
                          </div>

                          <!-- Text type -->
                          <span
                            v-else
                            class="text-[12px] ml-4 font-medium text-foreground leading-snug"
                          >
                            {{ field.value ?? "—" }}
                          </span>
                        </div>

                        <!-- Left accent line — appears on hover -->
                        <span
                          class="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        />
                      </div>

                      <!-- Divider between items -->
                      <div v-if="i < metaFields.length - 1" class="mx-3 h-px" />
                    </template>
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle with-handle />

          <!-- LOWER PANEL: activity -->
          <ResizablePanel :default-size="35" :min-size="30" :max-size="45">
            <div class="h-full flex flex-col bg-muted/[0.03]">
              <div
                class="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border/40"
              >
                <div class="flex items-center gap-2">
                  <MessageSquare class="h-3.5 w-3.5 text-muted-foreground/40" />
                  <h3
                    class="text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/60 select-none"
                  >
                    Activity & Comments
                  </h3>
                </div>
                <div class="flex items-center gap-2">
                  <slot name="activity-actions" />
                  <span
                    v-if="activityComingSoon"
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/35 border border-border/40 px-2 py-0.5 rounded-full"
                  >
                    Coming soon
                  </span>
                </div>
              </div>
              <ScrollArea class="flex-1">
                <div class="px-6 py-5">
                  <slot name="activity">
                    <div class="space-y-4">
                      <div
                        v-for="i in 4"
                        :key="i"
                        class="flex items-start gap-3"
                        :style="`opacity: ${0.04 + i * 0.03}`"
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
                    <div class="mt-8 flex flex-col items-center gap-2 py-2">
                      <MessageSquare class="h-5 w-5 text-muted-foreground/15" />
                      <p
                        class="text-[11px] text-muted-foreground/25 italic text-center"
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

    <!-- ── Delete Dialog ── -->
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
              <DialogTitle class="text-[15px] font-semibold">
                {{ deleteDialog.title ?? "Delete Item" }}
              </DialogTitle>
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

  import Badge from "@/components/ui/badge/Badge.vue";
import { FileText, Loader2, MessageSquare, Trash2 } from "lucide-vue-next";

  import { useDotColor } from "@/composables/useDotColor";
  const { getDotColor } = useDotColor();

  // ─────────────────────────────────────────
  // Constants
  // ─────────────────────────────────────────

  const DETAIL_TAB_ID = "detail" as const;

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
    dot?: string;
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
    dot?: string;
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

  /**
   * A single extra tab rendered after the built-in "Detail" tab.
   * Its content slot is named `tab-{id}`.
   */
  export interface TabItem {
    id: string;
    label: string;
    /** Optional icon rendered to the left of the label */
    icon?: Component;
    /** Optional numeric count badge shown on the tab */
    badge?: number | null;
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
      /**
       * Extra tabs rendered after the built-in "Detail" tab.
       * Each tab gets a slot: `tab-{id}`.
       * Pass `[]` (or omit) to hide the tab bar entirely.
       */
      tabs?: TabItem[];
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
      tabs: () => [],
    },
  );

  // ─────────────────────────────────────────
  // Emits
  // ─────────────────────────────────────────

  const emit = defineEmits<{
    "update:deleteOpen": [value: boolean];
    "confirm-delete": [];
    /**
     * Fires ONLY when the user actively clicks a tab — never on mount.
     * `tabId` is "detail" or a custom id from your `tabs` array.
     */
    "tab-change": [tabId: string];
  }>();

  // ─────────────────────────────────────────
  // Internal state
  // ─────────────────────────────────────────

  /** Tracks currently active tab — starts on Detail, never triggers an emit. */
  const activeTab = ref<string>(DETAIL_TAB_ID);
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

  /**
   * Called only when the user clicks a tab trigger.
   * Updates internal state and bubbles up to the parent via `tab-change`.
   */
  function handleTabChange(value: string | number) {
    const id = String(value);
    activeTab.value = id;
    emit("tab-change", id);
  }

  function handleDeleteConfirm() {
    emit("confirm-delete");
  }

  // ─────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────

  function getActionClass(action: ActionButton): string {
    if (action.variant === "destructive")
      return "bg-destructive/8 text-destructive hover:bg-destructive/15 border border-destructive/20";
    if (action.variant === "ghost")
      return "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40";
    return "bg-primary/8 text-primary hover:bg-primary/15 border border-primary/15";
  }
</script>
