<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-vue-next";
import { Toaster as Sonner } from "vue-sonner";
import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<ToasterProps>(), {
  closeButton: false,
  position: "top-right",
  richColors: true,
  visibleToasts: 5,
});
</script>

<template>
  <Sonner
    v-bind="props"
    :class="
      cn(
        'toaster group',
        '[&_[data-sonner-toast][data-styled=true]]:!bg-background [&_[data-sonner-toast][data-styled=true]]:!text-foreground [&_[data-sonner-toast][data-styled=true]]:!border-border [&_[data-sonner-toast][data-styled=true]]:!shadow-lg',
        '[&_[data-sonner-toast][data-type=success][data-styled=true]]:!bg-emerald-600 [&_[data-sonner-toast][data-type=success][data-styled=true]]:!text-white [&_[data-sonner-toast][data-type=success][data-styled=true]]:!border-emerald-600',
        '[&_[data-sonner-toast][data-type=error][data-styled=true]]:!bg-red-600 [&_[data-sonner-toast][data-type=error][data-styled=true]]:!text-white [&_[data-sonner-toast][data-type=error][data-styled=true]]:!border-red-600',
        '[&_[data-sonner-toast][data-type=warning][data-styled=true]]:!bg-amber-500 [&_[data-sonner-toast][data-type=warning][data-styled=true]]:!text-black [&_[data-sonner-toast][data-type=warning][data-styled=true]]:!border-amber-500',
        '[&_[data-sonner-toast][data-type=info][data-styled=true]]:!bg-sky-600 [&_[data-sonner-toast][data-type=info][data-styled=true]]:!text-white [&_[data-sonner-toast][data-type=info][data-styled=true]]:!border-sky-600',
        props.class,
      )
    "
    :offset="16"
    :toast-options="{
      classes: {
        toast:
          'group toast group-[.toaster]:rounded-lg group-[.toaster]:border group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:shadow-lg',
        title: 'text-sm font-semibold leading-none tracking-tight',
        description: 'text-sm opacity-90',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80',
      },
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <Loader2Icon class="size-4 animate-spin" />
    </template>
  </Sonner>
</template>
