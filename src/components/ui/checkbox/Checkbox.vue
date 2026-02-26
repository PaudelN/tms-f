<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check } from "lucide-vue-next"
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
<CheckboxRoot
  v-slot="slotProps"
  data-slot="checkbox"
  v-bind="forwarded"
  :class="
    cn(
      'peer size-4 shrink-0 rounded-sm border border-input bg-card text-primary shadow-xs outline-none transition-all',
      'data-[state=checked]:bg-card data-[state=checked]:text-foreground data-[state=checked]:border-foreground',
      'focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring',
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )
  "
>
  <CheckboxIndicator
    data-slot="checkbox-indicator"
    class="grid place-content-center text-current"
  >
    <slot v-bind="slotProps">
      <Check class="size-3" />
    </slot>
  </CheckboxIndicator>
</CheckboxRoot>
</template>
