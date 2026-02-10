<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
defineProps<{ title?: string; message: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>
<template>
  <Alert variant="destructive" class="rounded-2xl shadow-soft">
    <AlertTitle>{{ title ?? 'Something went wrong' }}</AlertTitle>
    <AlertDescription class="mt-1">{{ message }}</AlertDescription>
    <Button variant="outline" class="mt-3" @click="emit('retry')">Try again</Button>
  </Alert>
</template>
