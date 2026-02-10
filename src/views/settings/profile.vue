<script setup lang="ts">
import { ref } from 'vue'

const name = ref('Admin User')
const email = ref('admin@example.com')
</script>

<template>
  <section class="max-w-xl space-y-4">
    <h1 class="text-2xl font-semibold">Profile Settings</h1>
    <label class="block text-sm space-y-1">
      <span>Name</span>
      <input v-model="name" class="w-full rounded-md border border-input bg-background px-3 py-2" >
    </label>
    <label class="block text-sm space-y-1">
      <span>Email</span>
      <input v-model="email" class="w-full rounded-md border border-input bg-background px-3 py-2" >
    </label>
  </section>
</template>
