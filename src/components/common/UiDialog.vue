<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent :class="dialogClass" :show-close-button="false">
      <div class="ui-dialog-shell">
        <header class="ui-dialog-header">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold tracking-tight">{{ title }}</h2>
              <Badge :class="modeBadgeClass">{{ modeLabel }}</Badge>
            </div>
            <p v-if="description" class="text-sm text-muted-foreground">
              {{ description }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <slot name="header-actions" />
            <Button
              v-if="showSidebarToggle"
              size="sm"
              variant="outline"
              @click="sidebarVisible = !sidebarVisible"
            >
              {{ sidebarVisible ? "Hide info" : "Show info" }}
            </Button>
            <Button v-if="fullscreenRoute" size="sm" variant="secondary" @click="goFullscreen">
              Fullscreen
            </Button>
            <Button size="icon" variant="ghost" @click="emit('update:open', false)">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </header>

        <ResizablePanelGroup direction="horizontal" class="ui-dialog-panels">
          <ResizablePanel v-if="showSidebarToggle && sidebarVisible" :default-size="28" :min-size="20">
            <ScrollArea class="h-full p-4">
              <slot name="sidebar">
                <component :is="sidebarComponent" v-if="sidebarComponent" v-bind="sidebarProps" />
              </slot>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle v-if="showSidebarToggle && sidebarVisible" with-handle />

          <ResizablePanel :default-size="showSidebarToggle ? 72 : 100" :min-size="40">
            <div class="h-full flex flex-col">
              <ScrollArea class="flex-1 p-4">
                <slot>
                  <component :is="component" v-if="component" v-bind="componentProps" />
                </slot>
              </ScrollArea>
              <footer v-if="$slots.footer" class="border-t p-3 bg-background/80 backdrop-blur-sm">
                <slot name="footer" />
              </footer>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";
import { type RouteLocationRaw, useRouter } from "vue-router";
import { X } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

import "@/assets/ui-dialog.css";

type DialogMode = "add" | "edit" | "detail";
type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    mode: DialogMode;
    size?: DialogSize;
    component?: Component;
    componentProps?: Record<string, unknown>;
    sidebarComponent?: Component;
    sidebarProps?: Record<string, unknown>;
    fullscreenRoute?: RouteLocationRaw;
  }>(),
  {
    description: "",
    size: "xl",
    component: undefined,
    componentProps: () => ({}),
    sidebarComponent: undefined,
    sidebarProps: () => ({}),
    fullscreenRoute: undefined,
  },
);

const emit = defineEmits<{ "update:open": [boolean] }>();
const router = useRouter();
const sidebarVisible = ref(true);

watch(
  () => props.open,
  (open) => {
    if (open) sidebarVisible.value = true;
  },
);

const showSidebarToggle = computed(() => Boolean(props.sidebarComponent || !!(Object.keys(props.sidebarProps).length)));

const modeLabel = computed(() =>
  props.mode === "add" ? "New" : props.mode === "edit" ? "Editing" : "Viewing",
);

const modeBadgeClass = computed(() => {
  if (props.mode === "add") return "bg-emerald-500/15 text-emerald-600 border-transparent";
  if (props.mode === "edit") return "bg-amber-500/15 text-amber-700 border-transparent";
  return "bg-sky-500/15 text-sky-700 border-transparent";
});

const dialogClass = computed(() => {
  const map: Record<DialogSize, string> = {
    sm: "ui-dialog-content max-w-2xl",
    md: "ui-dialog-content max-w-3xl",
    lg: "ui-dialog-content max-w-5xl",
    xl: "ui-dialog-content max-w-6xl",
    full: "ui-dialog-content max-w-[96vw] h-[92vh]",
  };
  return map[props.size];
});

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

async function goFullscreen() {
  if (!props.fullscreenRoute) return;
  emit("update:open", false);
  await router.push(props.fullscreenRoute);
}
</script>
