<script setup lang="ts">
defineProps<{ text: string }>()
</script>
<template><span class="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{{ text }}</span></template>
