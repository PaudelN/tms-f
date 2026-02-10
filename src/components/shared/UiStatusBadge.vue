<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
defineProps<{ label: string; tone?: 'default' | 'secondary' | 'destructive' | 'outline' }>();
</script>
<template><Badge :variant="tone ?? 'secondary'">{{ label }}</Badge></template>
