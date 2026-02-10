<script setup lang="ts">defineProps<{ title: string; description?: string }>()</script>
<template><div class="space-y-1"><h3 class="text-lg font-semibold text-foreground">{{ title }}</h3><p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p></div></template>
