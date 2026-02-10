<script setup lang="ts">
defineProps<{ label: string }>();
</script>
<template><span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{{ label }}</span></template>
