<script setup lang="ts">
import { Input } from '@/components/ui/input'
const value = defineModel<string>({ default: '' })
defineProps<{ placeholder?: string }>()
</script>
<template>
  <Input v-model="value" :placeholder="placeholder ?? 'Search…'" class="w-full md:max-w-sm" />
</template>
