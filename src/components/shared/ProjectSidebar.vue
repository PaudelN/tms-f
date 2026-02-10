<script setup lang="ts">
import { Folder } from 'lucide-vue-next'
import type { Project } from '@/types/models'

interface Props { projects: Project[]; activeId?: string | null }
withDefaults(defineProps<Props>(), { activeId: null })
const emit = defineEmits<{ select:[string] }>()
</script>

<template>
  <aside class="space-y-2 rounded-xl border bg-card p-3">
    <button
      v-for="project in projects"
      :key="project.id"
      class="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-muted"
      :class="activeId === project.id ? 'bg-muted border-l-2 border-primary' : ''"
      @click="emit('select', project.id)"
    >
      <Folder class="mt-0.5 h-4 w-4" :style="{ color: project.color }" />
      <div>
        <p class="text-sm font-medium">{{ project.name }}</p>
        <p class="text-xs text-muted-foreground">{{ project.description || 'No description' }}</p>
      </div>
    </button>
  </aside>
</template>
