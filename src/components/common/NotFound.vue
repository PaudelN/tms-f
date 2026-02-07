<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router = useRouter()
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center space-y-4">
      <h1 class="text-6xl font-bold text-primary">404</h1>
      <h2 class="text-2xl font-semibold">Page Not Found</h2>
      <p class="text-muted-foreground">
        The page you're looking for doesn't exist or is under construction.
      </p>
      <Button @click="router.push({ name: 'dashboard' })">
        Go to Dashboard
      </Button>
    </div>
  </div>
</template>