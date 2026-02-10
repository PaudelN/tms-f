<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <router-view />
  <Toaster
    position="top-right"
    rich-colors
    :toast-options="{
      duration: 4000,
      class: 'z-[120]'
    }"
  />
</template>
