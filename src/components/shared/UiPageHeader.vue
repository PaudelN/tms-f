<script setup lang="ts">
import { Button } from "@/components/ui/button";
defineProps<{ title: string; description?: string; actionLabel?: string }>();
const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-xl font-semibold tracking-tight">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <Button v-if="actionLabel" @click="emit('action')">{{ actionLabel }}</Button>
  </div>
</template>
