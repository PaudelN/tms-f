<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@/types/models'

withDefaults(defineProps<{ user: User; showName?: boolean }>(), { showName: false })
</script>

<template>
  <div class="flex items-center gap-2">
    <Avatar class="h-7 w-7">
      <AvatarImage v-if="user.avatar" :src="user.avatar" :alt="user.name" />
      <AvatarFallback>{{ user.name.slice(0, 2).toUpperCase() }}</AvatarFallback>
    </Avatar>
    <span v-if="showName" class="text-xs text-muted-foreground">{{ user.name }}</span>
  </div>
</template>
