<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
    <AlertTriangle class="mx-auto size-8 text-destructive" />
    <p class="mt-3 text-sm">{{ message }}</p>
    <Button variant="outline" class="mt-4" @click="$emit('retry')">Try again</Button>
  </div>
</template>
