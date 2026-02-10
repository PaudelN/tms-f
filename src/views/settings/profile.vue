<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const user = computed(() => auth.user)
</script>

<template>
  <section class="max-w-2xl space-y-4">
    <h2 class="text-xl font-semibold">Profile Settings</h2>
    <article class="rounded-xl border p-4">
      <p class="text-sm text-muted-foreground">Name</p>
      <p class="font-medium">{{ user?.name || '—' }}</p>
    </article>
    <article class="rounded-xl border p-4">
      <p class="text-sm text-muted-foreground">Email</p>
      <p class="font-medium">{{ user?.email || '—' }}</p>
    </article>
  </section>
</template>
