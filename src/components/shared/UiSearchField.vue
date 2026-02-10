<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <div class="relative min-w-64">
    <Search class="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
    <Input
      :model-value="modelValue"
      :placeholder="placeholder ?? 'Search...'"
      class="pl-9"
      @update:model-value="(v) => emit('update:modelValue', String(v))"
    />
  </div>
</template>
