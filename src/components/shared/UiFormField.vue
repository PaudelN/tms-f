<script setup lang="ts">defineProps<{ label: string; hint?: string }>()</script>
<template><div class="space-y-2"><label class="text-sm font-medium text-foreground">{{ label }}</label><slot /><p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p></div></template>
