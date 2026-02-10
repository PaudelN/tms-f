<script setup lang="ts">defineProps<{ label: string; value?: string | number | null }>()</script>
<template><div class="flex items-center justify-between gap-4 border-b border-border/60 py-2"><dt class="text-sm text-muted-foreground">{{ label }}</dt><dd class="text-sm font-medium text-foreground">{{ value ?? '—' }}</dd></div></template>
