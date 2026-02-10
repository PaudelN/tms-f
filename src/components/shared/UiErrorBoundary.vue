<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-vue-next";
defineProps<{ title?: string; message: string }>();
</script>

<template>
  <Alert variant="destructive" class="rounded-xl">
    <AlertTriangleIcon class="h-4 w-4" />
    <AlertTitle>{{ title ?? 'Something went wrong' }}</AlertTitle>
    <AlertDescription>{{ message }}</AlertDescription>
  </Alert>
</template>
