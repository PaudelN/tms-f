<template>
  <!-- ============================================================ -->
  <!-- UiDialog — Full-screen SaaS workspace dialog                 -->
  <!-- ============================================================ -->
  <Teleport to="body">
    <Transition name="ui-dialog">
      <div
        v-if="modelValue"
        class="ui-dialog-root"
        role="dialog"
        :aria-label="title"
        @keydown.esc="handleClose"
      >

        <!-- Backdrop -->
        <div class="ui-dialog-backdrop" @click="closeOnBackdrop && handleClose()" />

        <!-- Shell -->
        <div class="ui-dialog-shell" tabindex="-1">

          <!-- ─── Top Chrome ─────────────────────────────────── -->
          <header class="ui-dialog-chrome">
            <div class="chrome-left">
              <!-- Traffic-light close -->
              <button class="traffic-btn traffic-close" title="Close" @click="handleClose">
                <X class="traffic-icon" />
              </button>
              <button class="traffic-btn traffic-min" title="Minimise" @click="emit('minimise')">
                <Minus class="traffic-icon" />
              </button>
              <button class="traffic-btn traffic-max" title="Maximise" @click="emit('maximise')">
                <Maximize2 class="traffic-icon" />
              </button>
            </div>

            <div class="chrome-center">
              <span class="chrome-title">{{ title }}</span>
            </div>

            <div class="chrome-right">
              <slot name="chrome-actions" />
            </div>
          </header>

          <!-- ─── Three-Panel Resizable Body ────────────────── -->
          <ResizablePanelGroup direction="horizontal" class="ui-dialog-body">

            <!-- ══════════════════════════════════════════════ -->
            <!-- LEFT COLUMN (60 %)                            -->
            <!-- ══════════════════════════════════════════════ -->
            <ResizablePanel
              :default-size="60"
              :min-size="35"
              class="ui-panel-left"
            >
              <ResizablePanelGroup direction="vertical" class="h-full">

                <!-- ── TOP STRIP (20 %) ──────────────────── -->
                <ResizablePanel
                  :default-size="20"
                  :min-size="12"
                  :max-size="38"
                  class="ui-panel-top"
                >
                  <div class="top-inner">

                    <!-- Breadcrumbs -->
                    <Breadcrumb>
                      <BreadcrumbList class="breadcrumb-list">
                        <template
                          v-for="(crumb, idx) in breadcrumbs"
                          :key="crumb.label"
                        >
                          <BreadcrumbItem>
                            <BreadcrumbLink
                              v-if="idx < breadcrumbs.length - 1"
                              class="breadcrumb-link"
                              @click="crumb.onClick?.()">
                              {{ crumb.label }}
                            </BreadcrumbLink>
                            <BreadcrumbPage v-else class="breadcrumb-page">
                              {{ crumb.label }}
                            </BreadcrumbPage>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator
                            v-if="idx < breadcrumbs.length - 1"
                            class="breadcrumb-sep"
                          />
                        </template>
                      </BreadcrumbList>
                    </Breadcrumb>

                    <!-- Title row -->
                    <div class="title-row">
                      <div class="title-group">
                        <h1 class="dialog-title">{{ title }}</h1>
                        <p v-if="subtitle" class="dialog-subtitle">{{ subtitle }}</p>
                      </div>

                      <div class="title-actions">
                        <!-- Mode badge -->
                        <div :class="['mode-badge', `mode-badge--${mode}`]">
                          <span class="mode-dot" />
                          <span class="mode-label">{{ modeLabel }}</span>
                        </div>

                        <!-- Header actions slot -->
                        <slot name="header-actions" />
                      </div>
                    </div>

                  </div>
                </ResizablePanel>

                <ResizableHandle with-handle class="resizable-handle-h" />

                <!-- ── MAIN CONTENT (80 %) ───────────────── -->
                <ResizablePanel
                  :default-size="80"
                  :min-size="40"
                  class="ui-panel-main"
                >
                  <ScrollArea class="h-full">
                    <div class="main-content-inner">
                      <Transition name="content-swap" mode="out-in">
                        <div :key="contentKey" class="content-wrapper">
                          <slot name="content">
                            <!-- Default empty state -->
                            <div class="empty-state">
                              <div class="empty-icon-wrap">
                                <LayoutTemplate class="empty-icon" />
                              </div>
                              <p class="empty-label">No content provided.</p>
                              <p class="empty-hint">Use the <code>content</code> slot to render your component here.</p>
                            </div>
                          </slot>
                        </div>
                      </Transition>
                    </div>
                  </ScrollArea>
                </ResizablePanel>

              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle with-handle class="resizable-handle-v" />

            <!-- ══════════════════════════════════════════════ -->
            <!-- RIGHT SIDEBAR (40 %)                          -->
            <!-- ══════════════════════════════════════════════ -->
            <ResizablePanel
              :default-size="40"
              :min-size="sidebarCollapsed ? 3.5 : 18"
              :max-size="sidebarCollapsed ? 3.5 : 55"
              class="ui-panel-right"
            >
              <div class="sidebar-shell">

                <!-- Collapse toggle -->
                <button
                  class="sidebar-collapse-btn"
                  :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                  @click="sidebarCollapsed = !sidebarCollapsed"
                >
                  <ChevronLeft
                    :class="['collapse-icon', { 'collapse-icon--flipped': sidebarCollapsed }]"
                  />
                </button>

                <!-- Sidebar content -->
                <Transition name="sidebar-content">
                  <ScrollArea v-if="!sidebarCollapsed" class="h-full">
                    <div class="sidebar-inner">

                      <!-- Custom sidebar slot -->
                      <slot name="sidebar">

                        <!-- ── Default metadata cards ── -->
                        <div
                          v-if="metadata.length"
                          class="metadata-section"
                        >
                          <h3 class="sidebar-section-title">Details</h3>
                          <div class="metadata-grid">
                            <div
                              v-for="item in metadata"
                              :key="item.label"
                              class="metadata-card"
                            >
                              <span class="meta-label">{{ item.label }}</span>
                              <span class="meta-value">{{ item.value }}</span>
                            </div>
                          </div>
                        </div>

                        <Separator v-if="metadata.length && sidebarCards.length" class="sidebar-sep" />

                        <!-- Custom sidebar cards -->
                        <div
                          v-for="(card, idx) in sidebarCards"
                          :key="idx"
                          class="sidebar-card"
                        >
                          <div class="sidebar-card-header">
                            <component
                              :is="card.icon"
                              v-if="card.icon"
                              class="card-icon"
                            />
                            <h4 class="card-title">{{ card.title }}</h4>
                          </div>
                          <p class="card-body">{{ card.body }}</p>
                          <Badge v-if="card.badge" :variant="card.badgeVariant ?? 'secondary'" class="card-badge">
                            {{ card.badge }}
                          </Badge>
                        </div>

                      </slot>

                    </div>
                  </ScrollArea>
                </Transition>

              </div>
            </ResizablePanel>

          </ResizablePanelGroup>

          <!-- ─── Footer Bar ──────────────────────────────── -->
          <footer class="ui-dialog-footer">
            <slot name="footer">
              <div class="footer-default">
                <span class="footer-hint">
                  <kbd class="kbd">Esc</kbd> to close
                </span>
                <div class="footer-actions">
                  <Button variant="ghost" size="sm" class="footer-btn" @click="handleClose">
                    Cancel
                  </Button>
                  <Button size="sm" class="footer-btn footer-btn--primary" @click="emit('confirm')">
                    <slot name="confirm-label">Confirm</slot>
                  </Button>
                </div>
              </div>
            </slot>
          </footer>

        </div><!-- /shell -->
      </div><!-- /root -->
    </Transition>
  </Teleport>
</template>

<!-- ================================================================ -->
<!-- Script                                                            -->
<!-- ================================================================ -->
<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { Component } from 'vue'

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  X,
  Minus,
  Maximize2,
  ChevronLeft,
  LayoutTemplate,
} from 'lucide-vue-next'

// ── Types ───────────────────────────────────────────────────────────
export type DialogMode = 'new' | 'editing' | 'viewing'

export interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

export interface MetadataItem {
  label: string
  value: string | number
}

export interface SidebarCard {
  title: string
  body: string
  icon?: Component
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

// ── Props ────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  subtitle?: string
  mode?: DialogMode
  breadcrumbs?: BreadcrumbItem[]
  metadata?: MetadataItem[]
  sidebarCards?: SidebarCard[]
  closeOnBackdrop?: boolean
  /** Increment to trigger content-swap transition */
  contentKey?: string | number
}>(), {
  mode: 'viewing',
  breadcrumbs: () => [],
  metadata: () => [],
  sidebarCards: () => [],
  closeOnBackdrop: false,
  contentKey: 0,
})

// ── Emits ────────────────────────────────────────────────────────────
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
  (e: 'minimise'): void
  (e: 'maximise'): void
}>()

// ── State ────────────────────────────────────────────────────────────
const sidebarCollapsed = ref(false)

// ── Computed ─────────────────────────────────────────────────────────
const modeLabel = computed(() => ({
  new: 'New',
  editing: 'Editing',
  viewing: 'Viewing',
}[props.mode]))

// ── Helpers ───────────────────────────────────────────────────────────
function handleClose() {
  emit('update:modelValue', false)
}

// Lock body scroll while open
watch(() => props.modelValue, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    nextTick(() => {
      document.querySelector<HTMLElement>('.ui-dialog-shell')?.focus()
    })
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<!-- ================================================================ -->
<!-- Styles                                                            -->
<!-- ================================================================ -->
<style scoped>
/* ── Tokens ────────────────────────────────────────────────────── */
:root {
  --dlg-radius: 16px;
  --dlg-chrome-h: 44px;
  --dlg-footer-h: 52px;
  --dlg-font-sans: 'DM Sans', 'Inter', system-ui, sans-serif;
  --dlg-font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --dlg-easing: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ── Backdrop ───────────────────────────────────────────────────── */
.ui-dialog-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: var(--dlg-font-sans);
}

.ui-dialog-backdrop {
  position: absolute;
  inset: 0;
  background: hsl(220 20% 4% / 0.72);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
}

/* ── Shell ──────────────────────────────────────────────────────── */
.ui-dialog-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1480px;
  height: calc(100vh - 4rem);
  max-height: 920px;
  display: flex;
  flex-direction: column;
  border-radius: var(--dlg-radius);
  background: hsl(220 16% 9%);
  border: 1px solid hsl(220 12% 18%);
  box-shadow:
    0 0 0 0.5px hsl(220 12% 22% / 0.6),
    0 32px 80px -16px hsl(220 30% 2% / 0.7),
    0 8px 24px -4px hsl(220 20% 2% / 0.5),
    inset 0 1px 0 hsl(220 12% 22%);
  overflow: hidden;
  outline: none;
}

/* ── Chrome Bar ─────────────────────────────────────────────────── */
.ui-dialog-chrome {
  height: var(--dlg-chrome-h);
  min-height: var(--dlg-chrome-h);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid hsl(220 12% 15%);
  background: hsl(220 16% 8%);
  flex-shrink: 0;
  user-select: none;
}

.chrome-left { display: flex; align-items: center; gap: 8px; }
.chrome-center { display: flex; justify-content: center; }
.chrome-right { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }

.chrome-title {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: hsl(220 8% 55%);
}

/* Traffic-light buttons */
.traffic-btn {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 120ms ease, transform 80ms ease;
  flex-shrink: 0;
}
.traffic-btn:hover { filter: brightness(1.25); transform: scale(1.12); }
.traffic-btn:active { transform: scale(0.9); }

.traffic-close  { background: hsl(4 80% 58%); }
.traffic-min    { background: hsl(40 90% 55%); }
.traffic-max    { background: hsl(136 60% 48%); }

.traffic-icon {
  width: 7px;
  height: 7px;
  opacity: 0;
  color: hsl(0 0% 0% / 0.5);
  transition: opacity 120ms ease;
}
.traffic-btn:hover .traffic-icon { opacity: 1; }

/* ── Body (resizable panels) ────────────────────────────────────── */
.ui-dialog-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Resizable Handles ──────────────────────────────────────────── */
.resizable-handle-v,
.resizable-handle-h {
  /* override shadcn defaults for custom look */
}
:deep([data-panel-resize-handle-id]) {
  background: hsl(220 12% 14%);
  transition: background 150ms ease;
}
:deep([data-panel-resize-handle-id]:hover),
:deep([data-panel-resize-handle-id][data-resize-handle-active]) {
  background: hsl(210 100% 60% / 0.35);
}
:deep([data-panel-resize-handle-id][data-panel-group-direction='horizontal']) {
  width: 5px;
}
:deep([data-panel-resize-handle-id][data-panel-group-direction='vertical']) {
  height: 5px;
}

/* ── Left panels ─────────────────────────────────────────────────── */
.ui-panel-left {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top strip */
.ui-panel-top {
  overflow: hidden;
}

.top-inner {
  height: 100%;
  padding: 1rem 2rem 1rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-bottom: 1px solid hsl(220 12% 14%);
  background: hsl(220 16% 8.5%);
}

/* Breadcrumb overrides */
.breadcrumb-list {
  font-size: 11.5px;
}
.breadcrumb-link {
  color: hsl(220 8% 45%);
  cursor: pointer;
  transition: color 120ms ease;
}
.breadcrumb-link:hover { color: hsl(220 8% 70%); }
.breadcrumb-page { color: hsl(220 8% 65%); }
.breadcrumb-sep { color: hsl(220 10% 28%); }

/* Title row */
.title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}
.title-group { min-width: 0; }
.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: hsl(220 6% 90%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.dialog-subtitle {
  font-size: 12.5px;
  color: hsl(220 8% 44%);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Mode badge */
.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid transparent;
  transition: all 160ms ease;
}
.mode-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* New */
.mode-badge--new {
  background: hsl(142 60% 14%);
  border-color: hsl(142 50% 22%);
  color: hsl(142 70% 60%);
}
.mode-badge--new .mode-dot {
  background: hsl(142 70% 55%);
  box-shadow: 0 0 6px hsl(142 70% 55% / 0.7);
  animation: pulse-dot 2s ease-in-out infinite;
}

/* Editing */
.mode-badge--editing {
  background: hsl(38 80% 12%);
  border-color: hsl(38 70% 20%);
  color: hsl(38 90% 65%);
}
.mode-badge--editing .mode-dot {
  background: hsl(38 90% 58%);
  box-shadow: 0 0 6px hsl(38 90% 58% / 0.6);
  animation: pulse-dot 1.4s ease-in-out infinite;
}

/* Viewing */
.mode-badge--viewing {
  background: hsl(220 20% 13%);
  border-color: hsl(220 15% 20%);
  color: hsl(220 10% 55%);
}
.mode-badge--viewing .mode-dot {
  background: hsl(220 10% 45%);
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

/* Main content panel */
.ui-panel-main {
  overflow: hidden;
}

.main-content-inner {
  padding: 2.5rem;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 5rem 2rem;
  text-align: center;
}
.empty-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: hsl(220 16% 13%);
  border: 1px solid hsl(220 12% 18%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-icon { width: 22px; height: 22px; color: hsl(220 8% 38%); }
.empty-label { font-size: 13.5px; font-weight: 500; color: hsl(220 6% 48%); }
.empty-hint { font-size: 12px; color: hsl(220 8% 35%); max-width: 26ch; }
.empty-hint code {
  font-family: var(--dlg-font-mono);
  font-size: 11px;
  background: hsl(220 16% 14%);
  padding: 1px 5px;
  border-radius: 4px;
  color: hsl(210 80% 65%);
}

/* ── Right Sidebar ───────────────────────────────────────────────── */
.ui-panel-right {
  overflow: hidden;
  border-left: 1px solid hsl(220 12% 14%);
  background: hsl(220 16% 7.5%);
  position: relative;
}

.sidebar-shell {
  position: relative;
  height: 100%;
  display: flex;
}

/* Collapse button */
.sidebar-collapse-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 20px;
  height: 48px;
  background: hsl(220 16% 11%);
  border: 1px solid hsl(220 12% 17%);
  border-left: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(220 8% 40%);
  transition: color 150ms ease, background 150ms ease;
}
.sidebar-collapse-btn:hover {
  background: hsl(220 16% 14%);
  color: hsl(220 6% 65%);
}
.collapse-icon {
  width: 12px;
  height: 12px;
  transition: transform 280ms var(--dlg-easing);
  flex-shrink: 0;
}
.collapse-icon--flipped { transform: rotate(180deg); }

/* Sidebar inner scroll content */
.sidebar-inner {
  padding: 2rem 1.75rem 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsl(220 8% 38%);
  margin-bottom: 0.875rem;
}

/* Metadata grid */
.metadata-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.metadata-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 8px;
  background: hsl(220 16% 11%);
  border: 1px solid hsl(220 12% 15%);
  transition: border-color 150ms ease;
}
.metadata-card:hover { border-color: hsl(220 12% 20%); }
.meta-label {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: hsl(220 8% 38%);
}
.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: hsl(220 6% 72%);
  font-family: var(--dlg-font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-sep { background: hsl(220 12% 15%); }

/* Sidebar cards */
.sidebar-card {
  padding: 14px 16px;
  border-radius: 10px;
  background: hsl(220 16% 11%);
  border: 1px solid hsl(220 12% 15%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.sidebar-card:hover {
  border-color: hsl(220 12% 22%);
  box-shadow: 0 4px 16px -4px hsl(220 30% 2% / 0.4);
}
.sidebar-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-icon { width: 15px; height: 15px; color: hsl(210 70% 60%); }
.card-title {
  font-size: 13px;
  font-weight: 600;
  color: hsl(220 6% 78%);
}
.card-body {
  font-size: 12.5px;
  color: hsl(220 8% 46%);
  line-height: 1.6;
}
.card-badge { align-self: flex-start; margin-top: 2px; }

/* ── Footer ─────────────────────────────────────────────────────── */
.ui-dialog-footer {
  height: var(--dlg-footer-h);
  min-height: var(--dlg-footer-h);
  flex-shrink: 0;
  border-top: 1px solid hsl(220 12% 14%);
  background: hsl(220 16% 8%);
  display: flex;
  align-items: center;
}

.footer-default {
  width: 100%;
  padding: 0 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-hint {
  font-size: 11.5px;
  color: hsl(220 8% 34%);
  display: flex;
  align-items: center;
  gap: 6px;
}
.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 5px;
  border-radius: 4px;
  background: hsl(220 16% 13%);
  border: 1px solid hsl(220 12% 20%);
  font-family: var(--dlg-font-mono);
  font-size: 10px;
  color: hsl(220 8% 50%);
}

.footer-actions { display: flex; align-items: center; gap: 8px; }

.footer-btn {
  font-size: 13px;
  height: 32px;
  border-radius: 7px;
}
.footer-btn--primary {
  background: hsl(210 100% 56%);
  color: hsl(0 0% 100%);
  border: none;
  box-shadow: 0 2px 8px hsl(210 100% 56% / 0.3);
  transition: background 150ms ease, box-shadow 150ms ease, transform 80ms ease;
}
.footer-btn--primary:hover {
  background: hsl(210 100% 62%);
  box-shadow: 0 3px 12px hsl(210 100% 56% / 0.45);
}
.footer-btn--primary:active { transform: scale(0.97); }

/* ── Enter / Leave Transitions ──────────────────────────────────── */
.ui-dialog-enter-active,
.ui-dialog-leave-active {
  transition: opacity 260ms var(--dlg-easing);
}
.ui-dialog-enter-active .ui-dialog-shell,
.ui-dialog-leave-active .ui-dialog-shell {
  transition:
    opacity 260ms var(--dlg-easing),
    transform 280ms var(--dlg-easing);
}
.ui-dialog-enter-from,
.ui-dialog-leave-to {
  opacity: 0;
}
.ui-dialog-enter-from .ui-dialog-shell {
  opacity: 0;
  transform: scale(0.96) translateY(12px);
}
.ui-dialog-leave-to .ui-dialog-shell {
  opacity: 0;
  transform: scale(0.97) translateY(6px);
}

/* ── Content Swap Transition ────────────────────────────────────── */
.content-swap-enter-active {
  transition: opacity 200ms ease, transform 220ms var(--dlg-easing);
}
.content-swap-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}
.content-swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.content-swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Sidebar Content Transition ─────────────────────────────────── */
.sidebar-content-enter-active {
  transition: opacity 220ms ease, transform 240ms var(--dlg-easing);
}
.sidebar-content-leave-active {
  transition: opacity 140ms ease;
}
.sidebar-content-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.sidebar-content-leave-to {
  opacity: 0;
}
</style>