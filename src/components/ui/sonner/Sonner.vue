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
})

const delegatedProps = computed(() => {
  const { class: _className, toastOptions, ...rest } = props
  return rest
})

const toastOptions = computed<NonNullable<ToasterProps["toastOptions"]>>(() => ({
  ...props.toastOptions,
  classes: {
    toast:
      "group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
    description: "group-[.toast]:text-muted-foreground",
    actionButton:
      "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
    cancelButton:
      "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
    ...(props.toastOptions?.classes ?? {}),
  },
}))
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    :toast-options="toastOptions"
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
