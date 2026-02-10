<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
defineProps<{ label: string }>()
</script>
<template><Badge variant="outline">{{ label }}</Badge></template>
