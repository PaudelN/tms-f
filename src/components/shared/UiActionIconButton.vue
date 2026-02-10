<script setup lang="ts">
import { Button } from "@/components/ui/button";
defineProps<{ title: string; variant?: 'ghost' | 'outline' | 'secondary' | 'destructive' | 'default' }>();
const emit = defineEmits<{ click: [] }>();
</script>
<template>
  <Button size="icon" :variant="variant ?? 'ghost'" :title="title" @click="emit('click')"><slot /></Button>
</template>
