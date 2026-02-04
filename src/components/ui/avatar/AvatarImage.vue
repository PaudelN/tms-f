<script setup lang="ts">
import { computed } from 'vue'
import { AvatarImage, type AvatarImageProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<AvatarImageProps & {
  class?: string
}>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <AvatarImage
    v-bind="delegatedProps"
    :class="cn('aspect-square h-full w-full', props.class)"
  >
    <slot />
  </AvatarImage>
</template>