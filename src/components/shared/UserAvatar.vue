<script setup lang="ts">
const props = defineProps<{
  name?: string
  avatar?: string | null
}>()

function initials(name: string | undefined): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<template>
  <div class="flex items-center gap-2">
    <img
      v-if="props.avatar"
      :src="props.avatar"
      :alt="props.name ?? 'User avatar'"
      class="h-7 w-7 rounded-full object-cover"
    />
    <div v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">
      {{ initials(props.name) }}
    </div>
    <span v-if="props.name" class="text-xs text-slate-600">{{ props.name }}</span>
  </div>
</template>
