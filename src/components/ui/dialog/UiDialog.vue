<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import Dialog from './Dialog.vue'
import DialogContent from './DialogContent.vue'
import DialogDescription from './DialogDescription.vue'
import DialogFooter from './DialogFooter.vue'
import DialogHeader from './DialogHeader.vue'
import DialogTitle from './DialogTitle.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    fullscreenTo?: { name: string; params?: Record<string, string | number> }
    contentClass?: string
    modal?: boolean
  }>(),
  {
    description: '',
    contentClass: 'sm:max-w-2xl',
    modal: true,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const router = useRouter()

const modelOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

function goFullscreen() {
  if (!props.fullscreenTo) return
  router.push(props.fullscreenTo)
  emit('update:open', false)
}
</script>

<template>
  <Dialog v-model:open="modelOpen" :modal="modal">
    <DialogContent :class="contentClass" class="group border-border/70">
      <DialogHeader class="gap-2">
        <div class="flex items-start justify-between gap-3">
          <div>
            <DialogTitle>{{ title }}</DialogTitle>
            <DialogDescription v-if="description">{{ description }}</DialogDescription>
          </div>
          <Button
            v-if="fullscreenTo"
            type="button"
            variant="outline"
            size="sm"
            class="opacity-0 transition-opacity group-hover:opacity-100"
            @click="goFullscreen"
          >
            Full screen
          </Button>
        </div>
      </DialogHeader>

      <slot />

      <DialogFooter v-if="$slots.footer">
        <slot name="footer" />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
