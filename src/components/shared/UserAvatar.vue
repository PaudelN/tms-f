<script setup lang="ts">
interface Props {
  name: string
}
defineProps<Props>()
</script>

<template>
  <div class="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold grid place-items-center">
    {{ name.slice(0, 1).toUpperCase() }}
  </div>
</template>
