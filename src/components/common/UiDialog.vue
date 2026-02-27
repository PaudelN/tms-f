<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent :class="dialogClasses" :show-close="false">
      <div class="ui-dialog-shell">
        <header class="flex items-center justify-between border-b px-4 py-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold">{{ title }}</h3>
              <Badge :class="modeClass">{{ modeLabel }}</Badge>
            </div>
            <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <slot name="header-actions" />
            <Button variant="outline" size="sm" class="gap-1" @click="goFullscreen">
              <Expand class="h-4 w-4" />
              Fullscreen
            </Button>
            <Button variant="ghost" size="icon" @click="toggleSidebar">
              <PanelLeftClose v-if="sidebarVisible" class="h-4 w-4" />
              <PanelLeftOpen v-else class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" @click="closeDialog">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </header>

        <ResizablePanelGroup direction="horizontal" class="h-[70vh]">
          <ResizablePanel v-if="sidebarVisible" :default-size="28" :min-size="20" :max-size="40" class="border-r bg-muted/40">
            <slot name="sidebar">
              <component :is="sidebarComponent" v-if="sidebarComponent" v-bind="sidebarProps" />
            </slot>
          </ResizablePanel>

          <ResizableHandle v-if="sidebarVisible" with-handle />

          <ResizablePanel :default-size="sidebarVisible ? 72 : 100">
            <div class="h-full overflow-auto">
              <component :is="component" v-if="component" v-bind="componentProps" />
              <slot v-else />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <footer v-if="$slots.footer" class="border-t px-4 py-3">
          <slot name="footer" />
        </footer>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { useRouter } from "vue-router";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Dialog, DialogContent } from "@/components/ui/dialog";
  import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable";
  import { Expand, PanelLeftClose, PanelLeftOpen, X } from "lucide-vue-next";

  type DialogMode = "add" | "edit" | "detail";
  type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

  const props = withDefaults(
    defineProps<{
      open: boolean;
      title: string;
      description?: string;
      mode?: DialogMode;
      size?: DialogSize;
      fullscreenRoute?: { name: string; params?: Record<string, string | number | (string | number)[]> };
      component?: any;
      componentProps?: Record<string, unknown>;
      sidebarComponent?: any;
      sidebarProps?: Record<string, unknown>;
    }>(),
    {
      mode: "detail",
      size: "xl",
      componentProps: () => ({}),
      sidebarProps: () => ({}),
    },
  );

  const emit = defineEmits<{ "update:open": [value: boolean] }>();
  const router = useRouter();
  const sidebarVisible = ref(true);

  const modeLabel = computed(() =>
    props.mode === "add" ? "New" : props.mode === "edit" ? "Editing" : "Viewing",
  );

  const modeClass = computed(() => {
    if (props.mode === "add") return "bg-emerald-500/15 text-emerald-600";
    if (props.mode === "edit") return "bg-amber-500/15 text-amber-600";
    return "bg-sky-500/15 text-sky-600";
  });

  const dialogClasses = computed(() => {
    const sizeClass = {
      sm: "max-w-xl",
      md: "max-w-3xl",
      lg: "max-w-5xl",
      xl: "max-w-6xl",
      full: "max-w-[96vw] h-[96vh]",
    }[props.size];

    return `ui-dialog-centered p-0 overflow-hidden ${sizeClass}`;
  });

  function closeDialog() {
    emit("update:open", false);
  }

  function onOpenChange(value: boolean) {
    emit("update:open", value);
  }

  function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
  }

  function goFullscreen() {
    if (props.fullscreenRoute) router.push(props.fullscreenRoute);
    closeDialog();
  }
</script>

<style>
  @import "@/assets/ui-dialog.css";
</style>
