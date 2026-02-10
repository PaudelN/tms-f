<script setup lang="ts">
import { Button } from "@/components/ui/button";
defineProps<{ title: string; description?: string; submitLabel: string; loading?: boolean }>();
const emit = defineEmits<{ submit: []; cancel: [] }>();
</script>
<template>
  <form class="space-y-4" @submit.prevent="emit('submit')">
    <header>
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
    </header>
    <slot />
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" :disabled="loading">{{ loading ? 'Saving...' : submitLabel }}</Button>
    </div>
  </form>
</template>
