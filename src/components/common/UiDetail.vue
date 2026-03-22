<template>
  <div class="flex min-h-0 flex-1 flex-col bg-background">
    <div v-if="loading" class="flex flex-1 items-center justify-center px-6 py-16">
      <div class="flex flex-col items-center gap-4 rounded-[28px] border border-border/60 bg-card px-10 py-12 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)]">
        <div class="relative h-14 w-14">
          <div class="absolute inset-0 rounded-full border-2 border-primary/15" />
          <div class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          <div class="absolute inset-2 rounded-full bg-primary/8" />
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-foreground">{{ loadingText }}</p>
          <p class="mt-1 text-xs text-muted-foreground">Loading a refined workspace view.</p>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-1 flex-col min-h-0 overflow-hidden px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <section class="mb-4 rounded-[30px] border border-border/60 bg-card/95 px-6 py-5 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.5)]">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                Record overview
              </span>
              <div v-if="statusBadge">
                <Badge :color="getDotColor(statusBadge.dot ?? '')">
                  {{ statusBadge.label }}
                </Badge>
              </div>
            </div>
            <div class="mt-3 min-w-0">
              <Breadcrumb>
                <BreadcrumbList class="min-w-0 flex-wrap gap-1.5 text-xs">
                  <template v-for="(crumb, index) in breadcrumbs" :key="`${crumb.label}-${index}`">
                    <BreadcrumbItem class="min-w-0">
                      <BreadcrumbPage
                        v-if="index === breadcrumbs.length - 1"
                        class="max-w-56 truncate font-semibold text-foreground"
                      >
                        {{ crumb.label }}
                      </BreadcrumbPage>
                      <BreadcrumbLink
                        v-else
                        as="button"
                        class="cursor-pointer whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                        @click="crumb.onClick?.()"
                      >
                        {{ crumb.label }}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" class="text-muted-foreground/60" />
                  </template>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 xl:justify-end">
            <TooltipProvider :delay-duration="150">
              <template v-for="action in actions" :key="action.id">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      type="button"
                      :disabled="action.disabled"
                      class="h-11 rounded-2xl px-4 transition-all duration-200"
                      :class="getActionClass(action)"
                      @click="action.onClick"
                    >
                      <component :is="action.icon" class="mr-2 h-4 w-4" />
                      {{ action.label }}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" :side-offset="6" class="text-[11px] font-semibold tracking-wide">
                    {{ action.label }}
                  </TooltipContent>
                </Tooltip>
              </template>
            </TooltipProvider>
          </div>
        </div>
      </section>

      <div class="flex-1 min-h-0">
        <ResizablePanelGroup
          direction="vertical"
          class="h-full overflow-hidden rounded-[30px] border border-border/60 bg-card/95 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.52)]"
        >
          <ResizablePanel :default-size="68" :min-size="40">
            <ResizablePanelGroup direction="horizontal" class="h-full">
              <ResizablePanel
                :default-size="metaDefaultSize"
                :min-size="14"
                :max-size="32"
                class="border-r border-border/50 bg-background/70"
              >
                <ScrollArea class="h-full">
                  <div class="space-y-3 p-5">
                    <div class="rounded-[24px] border border-border/60 bg-card/90 p-4 shadow-sm">
                      <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Key facts</p>
                      <p class="mt-2 text-sm leading-6 text-muted-foreground">
                        Important record metadata stays pinned here for faster decisions while reviewing content and related activity.
                      </p>
                    </div>
                    <div
                      v-for="field in metaFields"
                      :key="field.label"
                      class="rounded-[22px] border border-border/60 bg-card/90 p-4 shadow-sm"
                    >
                      <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {{ field.label }}
                      </p>
                      <div class="flex items-center gap-2">
                        <component v-if="field.icon" :is="field.icon" class="h-3.5 w-3.5 text-muted-foreground" />
                        <Badge v-if="field.type === 'badge'" :color="getDotColor((field as any).dot ?? '')">
                          {{ field.value }}
                        </Badge>
                        <div v-else-if="field.type === 'avatar' && field.avatarData" class="flex items-center gap-3 min-w-0">
                          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">
                            {{ field.avatarData.initials }}
                          </div>
                          <div class="min-w-0">
                            <p class="truncate text-sm font-semibold text-foreground">{{ field.avatarData.name }}</p>
                            <p class="truncate text-xs text-muted-foreground">{{ field.avatarData.sub }}</p>
                          </div>
                        </div>
                        <span v-else class="text-sm font-medium text-foreground">{{ field.value }}</span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle with-handle />

              <ResizablePanel :default-size="100 - metaDefaultSize" :min-size="45">
                <div class="flex h-full flex-col bg-card/70">
                  <template v-if="tabs && tabs.length > 0">
                    <Tabs :model-value="activeTab" class="flex h-full flex-col" @update:model-value="handleTabChange">
                      <div class="border-b border-border/50 px-4 pt-4">
                        <TabsList class="h-auto rounded-2xl bg-background/80 p-1">
                          <TabsTrigger
                            :value="DETAIL_TAB_ID"
                            class="rounded-xl px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] data-[state=active]:bg-card data-[state=active]:text-primary"
                          >
                            Detail
                          </TabsTrigger>
                          <TabsTrigger
                            v-for="tab in tabs"
                            :key="tab.id"
                            :value="tab.id"
                            class="rounded-xl px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] data-[state=active]:bg-card data-[state=active]:text-primary"
                          >
                            <span class="flex items-center gap-1.5">
                              <component v-if="tab.icon" :is="tab.icon" class="h-3.5 w-3.5" />
                              {{ tab.label }}
                              <span
                                v-if="tab.badge != null"
                                class="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold leading-none text-muted-foreground"
                              >
                                {{ tab.badge }}
                              </span>
                            </span>
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent :value="DETAIL_TAB_ID" class="m-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
                        <ScrollArea class="h-full">
                          <div class="space-y-6 px-6 py-6">
                            <slot name="content">
                              <div class="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground/40">
                                <FileText class="h-8 w-8" />
                                <p class="text-xs">No content provided</p>
                              </div>
                            </slot>
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent
                        v-for="tab in tabs"
                        :key="tab.id"
                        :value="tab.id"
                        class="m-0 data-[state=inactive]:hidden"
                        :class="tab.flush ? 'flex-1 min-h-0 overflow-hidden' : 'flex-1 overflow-hidden'"
                      >
                        <template v-if="!tab.flush">
                          <ScrollArea class="h-full">
                            <div class="space-y-6 px-6 py-6">
                              <slot :name="`tab-${tab.id}`">
                                <div class="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground/40">
                                  <FileText class="h-8 w-8" />
                                  <p class="text-xs">Nothing here yet</p>
                                </div>
                              </slot>
                            </div>
                          </ScrollArea>
                        </template>
                        <template v-else>
                          <slot :name="`tab-${tab.id}`">
                            <div class="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground/40">
                              <FileText class="h-8 w-8" />
                              <p class="text-xs">Nothing here yet</p>
                            </div>
                          </slot>
                        </template>
                      </TabsContent>
                    </Tabs>
                  </template>

                  <template v-else>
                    <ScrollArea class="h-full">
                      <div class="space-y-6 px-6 py-6">
                        <slot name="content">
                          <div class="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground/40">
                            <FileText class="h-8 w-8" />
                            <p class="text-xs">No content provided</p>
                          </div>
                        </slot>
                      </div>
                    </ScrollArea>
                  </template>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle with-handle />

          <ResizablePanel :default-size="32" :min-size="24" :max-size="45">
            <div class="flex h-full flex-col bg-background/70">
              <div class="flex items-center justify-between border-b border-border/50 px-6 py-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Activity timeline</p>
                  <p class="mt-1 text-sm text-muted-foreground">Operational updates and collaboration notes will live here.</p>
                </div>
                <div class="flex items-center gap-2">
                  <slot name="activity-actions" />
                  <span
                    v-if="activityComingSoon"
                    class="rounded-full bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground ring-1 ring-border/60"
                  >
                    Coming soon
                  </span>
                </div>
              </div>
              <ScrollArea class="flex-1">
                <div class="px-6 py-5">
                  <slot name="activity">
                    <div class="grid gap-3 md:grid-cols-2">
                      <div
                        v-for="i in 4"
                        :key="i"
                        class="rounded-[22px] border border-border/60 bg-card/90 p-4 shadow-sm"
                        :style="`opacity:${1 - i * 0.12}`"
                      >
                        <div class="flex items-start gap-3">
                          <div class="h-10 w-10 rounded-2xl bg-muted" />
                          <div class="flex-1 space-y-2">
                            <div class="h-2.5 w-24 rounded-full bg-muted" />
                            <div class="h-2 w-full rounded-full bg-muted/80" />
                            <div class="h-2 w-3/4 rounded-full bg-muted/60" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-6 flex flex-col items-center gap-2 rounded-[24px] border border-dashed border-border/70 bg-card/70 px-6 py-8 text-center">
                      <MessageSquare class="h-6 w-6 text-muted-foreground/30" />
                      <p class="text-sm font-medium text-muted-foreground">Activity and comments will appear here.</p>
                    </div>
                  </slot>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>

    <Dialog v-model:open="internalDeleteOpen">
      <DialogContent class="max-w-sm rounded-[28px] border-border/60">
        <DialogHeader>
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
              <Trash2 class="h-4.5 w-4.5 text-destructive" />
            </div>
            <div>
              <DialogTitle class="text-[15px] font-semibold">{{ deleteDialog.title ?? 'Delete Item' }}</DialogTitle>
              <DialogDescription class="mt-0.5 text-xs text-muted-foreground">
                {{ deleteDialog.description ?? 'This action cannot be undone.' }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div class="rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-[13px] leading-relaxed text-destructive/80">
          <slot name="delete-body">
            <span>This item will be <strong class="font-semibold">permanently deleted</strong> along with all its data.</span>
          </slot>
        </div>
        <DialogFooter class="mt-1 gap-2">
          <Button variant="outline" size="sm" class="h-10 flex-1 rounded-xl" @click="internalDeleteOpen = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            class="h-10 flex-1 rounded-xl font-semibold"
            :disabled="deleteLoading"
            @click="handleDeleteConfirm"
          >
            <Loader2 v-if="deleteLoading" class="mr-1.5 h-3.5 w-3.5 animate-spin" />
            <span>{{ deleteDialog.confirmLabel ?? 'Delete' }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ref, watch } from 'vue'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import Badge from '@/components/ui/badge/Badge.vue'
import { FileText, Loader2, MessageSquare, Trash2 } from 'lucide-vue-next'

import { useDotColor } from '@/composables/useDotColor'
const { getDotColor } = useDotColor()

const DETAIL_TAB_ID = 'detail' as const

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
  variant?: 'default' | 'destructive' | 'ghost';
  disabled?: boolean;
  onClick: () => void;
}
export interface MetaField {
  label: string;
  value?: string;
  icon?: Component;
  type?: 'text' | 'badge' | 'avatar';
  badgeClass?: string;
  dot?: string;
  avatarData?: { initials: string; name: string; sub: string };
}
export interface DeleteDialog {
  title?: string;
  description?: string;
  confirmLabel?: string;
}
export interface TabItem {
  id: string;
  label: string;
  icon?: Component;
  badge?: number | null;
  flush?: boolean;
}

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
    tabs?: TabItem[];
  }>(),
  {
    loading: false,
    loadingText: 'Loading…',
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
)

const emit = defineEmits<{
  'update:deleteOpen': [value: boolean];
  'confirm-delete': [];
  'tab-change': [tabId: string];
}>()

const activeTab = ref<string>(DETAIL_TAB_ID)
const internalDeleteOpen = ref(props.deleteOpen)

watch(() => props.deleteOpen, (v) => { internalDeleteOpen.value = v })
watch(internalDeleteOpen, (v) => { emit('update:deleteOpen', v) })

function handleTabChange(value: string | number) {
  const id = String(value)
  activeTab.value = id
  emit('tab-change', id)
}
function handleDeleteConfirm() {
  emit('confirm-delete')
}
function getActionClass(action: ActionButton): string {
  if (action.variant === 'destructive') {
    return 'border border-destructive/20 bg-destructive/8 text-destructive hover:bg-destructive/14'
  }
  if (action.variant === 'ghost') {
    return 'border border-border/60 bg-card/70 text-muted-foreground hover:bg-background hover:text-foreground'
  }
  return 'border border-primary/15 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
}
</script>
