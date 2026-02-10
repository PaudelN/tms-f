<script setup lang="ts">defineProps<{ title: string; caption?: string }>()</script>
<template><div><h2 class="text-lg font-semibold text-foreground">{{ title }}</h2><p v-if="caption" class="text-sm text-muted-foreground">{{ caption }}</p></div></template>
