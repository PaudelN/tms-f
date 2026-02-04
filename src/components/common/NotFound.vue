<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gray-200">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mt-4">
          Page Not Found
        </h2>
        <p class="text-gray-500 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <Button @click="goHome" class="mx-auto">
        Go Back Home
      </Button>
    </div>
  </div>
</template>