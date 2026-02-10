<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <router-view />
  <Toaster rich-colors position="top-right" />
</template>
