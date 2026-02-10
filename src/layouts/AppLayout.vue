<script setup lang="ts">
import ProjectSidebar from '@/components/shared/ProjectSidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground md:flex">
    <ProjectSidebar class="hidden md:block" />
    <main class="flex-1 p-4 md:p-6">
      <router-view />
    </main>
  </div>
</template>
