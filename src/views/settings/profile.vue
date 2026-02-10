<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const name = ref('')
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)
</script>

<template>
  <section class="mx-auto max-w-xl space-y-4">
    <h2 class="text-2xl font-semibold">Profile Settings</h2>
    <div class="space-y-3 rounded-xl border bg-card p-4">
      <label class="block text-sm">Name<input v-model="name" class="mt-1 h-10 w-full rounded-md border px-3"/></label>
      <label class="block text-sm">Timezone<input v-model="timezone" class="mt-1 h-10 w-full rounded-md border px-3"/></label>
      <Button>Save</Button>
    </div>
  </section>
</template>
