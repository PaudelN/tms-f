<script setup lang="ts">
import { computed } from 'vue'
import { AvatarFallback, type AvatarFallbackProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<AvatarFallbackProps & {
  class?: string
}>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <AvatarFallback
    v-bind="delegatedProps"
    :class="cn('flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>