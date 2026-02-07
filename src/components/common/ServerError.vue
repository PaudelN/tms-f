<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { useRouter } from "vue-router";

  const router = useRouter();
</script>

<template>
  <div
    class="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-background via-background to-primary/5"
  >
    <div
      class="text-center space-y-6 p-10 rounded-2xl "
    >
      <h1
        class="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-red-500"
      >
        500
      </h1>

      <h2 class="text-2xl text-red-500 font-semibold tracking-tight">
        Server Error
      </h2>

      <p class="text-sm text-red-500 max-w-sm mx-auto">
        The page you’re looking for doesn’t exist or something went wrong on our
        side.
      </p>

      <div class="pt-2">
        <Button
        variant="destructive"
          size="lg"
          class="gap-2"
          @click="router.push({ name: 'dashboard' })"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  </div>
</template>
