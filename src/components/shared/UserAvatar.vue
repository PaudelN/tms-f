<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@/types/models'

interface Props { user: User; size?: 'xs'|'sm'|'md'; showName?: boolean }
const props = withDefaults(defineProps<Props>(), { size: 'sm', showName: false })
const sizeClass = computed(() => (props.size === 'xs' ? 'h-6 w-6' : props.size === 'md' ? 'h-10 w-10' : 'h-8 w-8'))
const initials = computed(() => props.user.name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase())
</script>

<template>
  <div class="flex items-center gap-2">
    <Avatar :class="sizeClass">
      <AvatarImage v-if="user.avatar" :src="user.avatar" :alt="user.name" />
      <AvatarFallback>{{ initials }}</AvatarFallback>
    </Avatar>
    <span v-if="showName" class="text-xs text-muted-foreground">{{ user.name }}</span>
  </div>
</template>
