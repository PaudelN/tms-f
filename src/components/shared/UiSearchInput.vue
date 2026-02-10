<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
const model = defineModel<string>({ default: '' })
defineProps<{ placeholder?: string }>()
</script>
<template>
  <div class="relative min-w-60">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input v-model="model" :placeholder="placeholder ?? 'Search'" class="pl-9" />
  </div>
</template>
