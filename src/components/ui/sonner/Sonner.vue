<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-vue-next"
import { computed } from "vue"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<ToasterProps>(), {
  position: "top-right",
  closeButton: false,
  richColors: true,
  offset: "1rem",
})

const defaultToastOptions = {
  classes: {
    toast:
      "group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
    description: "group-[.toast]:text-muted-foreground",
    actionButton:
      "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
    cancelButton:
      "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
  },
} satisfies NonNullable<ToasterProps["toastOptions"]>

const mergedToastOptions = computed(() => ({
  ...defaultToastOptions,
  ...props.toastOptions,
  classes: {
    ...defaultToastOptions.classes,
    ...props.toastOptions?.classes,
  },
}))

const delegatedProps = computed(() => {
  const { toastOptions, class: _className, ...rest } = props
  return rest
})
</script>

<template>
  <Sonner
    :class="
      cn(
        'toaster group',
        '[--width:360px] data-[y-position=top]:top-4 data-[y-position=bottom]:bottom-4 data-[x-position=right]:right-4 data-[x-position=left]:left-4',
        props.class,
      )
    "
    :style="{
      '--normal-bg': 'var(--background)',
      '--normal-text': 'var(--foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    :toast-options="mergedToastOptions"
    v-bind="delegatedProps"
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
