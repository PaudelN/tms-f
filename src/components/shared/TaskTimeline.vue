<script setup lang="ts">
import type { Task } from '@/types/models'
interface Props { tasks: Task[] }
defineProps<Props>()
</script>

<template>
  <div class="rounded-xl border border-border p-4 overflow-x-auto">
    <h3 class="font-semibold mb-3">Timeline View</h3>
    <div class="space-y-2 min-w-[560px]">
      <div v-for="task in tasks" :key="task.id" class="grid grid-cols-[200px_1fr] gap-3 items-center">
        <span class="text-sm">{{ task.title }}</span>
        <div class="h-3 rounded bg-primary/20">
          <div class="h-3 rounded bg-primary" :style="{ width: `${Math.max(10, (task.position % 10) * 10)}%` }" />
        </div>
      </div>
    </div>
  </div>
</template>
