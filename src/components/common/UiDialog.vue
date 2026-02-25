<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader class="group/header pr-10">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <DialogTitle>{{ title }}</DialogTitle>
            <DialogDescription v-if="description">{{ description }}</DialogDescription>
          </div>
          <Button
            v-if="fullScreenRoute"
            type="button"
            variant="ghost"
            size="sm"
            class="opacity-40 transition-opacity group-hover/header:opacity-100"
            @click="goFullScreen"
          >
            Full screen
          </Button>
        </div>
      </DialogHeader>

      <slot />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'vue-router'

const props = defineProps<{
  open: boolean
  title: string
  description?: string
  fullScreenRoute?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const router = useRouter()

function goFullScreen() {
  if (!props.fullScreenRoute) return
  emit('update:open', false)
  router.push(props.fullScreenRoute)
}
</script>
