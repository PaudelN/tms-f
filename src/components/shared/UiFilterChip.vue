<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
defineProps<{ text: string }>()
defineEmits<{ remove: [] }>()
</script>
<template>
  <Button variant="secondary" size="sm" class="gap-1" @click="$emit('remove')">
    {{ text }}
    <X class="size-3" />
  </Button>
</template>
