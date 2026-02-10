<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <router-view />
  <Toaster position="top-right" :duration="3500" class="z-[9999]" />
</template>
