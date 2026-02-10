<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

defineProps<{ message: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <Alert variant="destructive" class="rounded-2xl shadow-soft">
    <AlertTitle>Something went wrong</AlertTitle>
    <AlertDescription class="mt-2 flex items-center justify-between gap-4">
      <span>{{ message }}</span>
      <Button size="sm" variant="outline" @click="emit('retry')">Retry</Button>
    </AlertDescription>
  </Alert>
</template>
