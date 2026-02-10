<script setup lang="ts">
import type { Project } from '@/features/projects/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const props = defineProps<{ project?: Project | null }>()
const emit = defineEmits<{ edit: []; close: [] }>()
</script>

<template>
  <div v-if="project" class="space-y-4">
    <h2 class="text-lg font-semibold">{{ project.name }}</h2>
    <div class="rounded-xl border border-border p-4">
      <p class="text-sm text-muted-foreground">Owner</p>
      <p class="font-medium">{{ project.owner }}</p>
      <p class="mt-3 text-sm text-muted-foreground">Budget</p>
      <p class="font-medium">{{ project.budget }}</p>
      <p class="mt-3 text-sm text-muted-foreground">Status</p>
      <Badge variant="secondary" class="mt-1">{{ project.status }}</Badge>
    </div>
    <div class="flex gap-2"><Button @click="emit('edit')">Edit</Button><Button variant="outline" @click="emit('close')">Close</Button></div>
  </div>
</template>
