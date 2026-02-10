<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { InboxIcon } from "lucide-vue-next";

defineProps<{ title: string; description: string; actionLabel?: string }>();
const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div class="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
    <InboxIcon class="mb-3 h-8 w-8 text-muted-foreground" />
    <h3 class="text-base font-semibold">{{ title }}</h3>
    <p class="mt-2 max-w-sm text-sm text-muted-foreground">{{ description }}</p>
    <Button v-if="actionLabel" class="mt-4" @click="emit('action')">{{ actionLabel }}</Button>
  </div>
</template>
