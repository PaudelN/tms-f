<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
defineProps<{ title?: string; message: string }>()
</script>
<template>
  <Alert variant="destructive" class="rounded-2xl">
    <AlertTitle>{{ title ?? 'Something went wrong' }}</AlertTitle>
    <AlertDescription>{{ message }}</AlertDescription>
  </Alert>
</template>
