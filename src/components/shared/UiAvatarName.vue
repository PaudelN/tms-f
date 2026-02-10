<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
defineProps<{ name: string }>()
</script>
<template>
  <div class="flex items-center gap-2">
    <Avatar class="size-8">
      <AvatarFallback>{{ name.slice(0,2).toUpperCase() }}</AvatarFallback>
    </Avatar>
    <span class="text-sm font-medium">{{ name }}</span>
  </div>
</template>
