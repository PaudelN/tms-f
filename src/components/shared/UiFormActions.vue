<script setup lang="ts">
import { Button } from '@/components/ui/button'
defineProps<{ loading?: boolean; submitLabel: string }>()
defineEmits<{ cancel: [] }>()
</script>

<template>
  <div class="flex justify-end gap-2 pt-2">
    <Button variant="outline" type="button" @click="$emit('cancel')">Cancel</Button>
    <Button :disabled="loading" type="submit">{{ loading ? 'Saving...' : submitLabel }}</Button>
  </div>
</template>
