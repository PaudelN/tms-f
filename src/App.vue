<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <router-view />
  <Toaster position="top-right" :close-button="false" :offset="16" />
</template>
