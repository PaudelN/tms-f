<script setup lang="ts">
import { computed } from 'vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'
import type { Task } from '@/types/models'

interface Props { task: Task | null; open: boolean }
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:open':[boolean] }>()
const hasTask = computed(() => props.task !== null)
</script>

<template>
  <Sheet :open="open" @update:open="(value) => emit('update:open', value)">
    <SheetContent class="w-full sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>Task details</SheetTitle>
      </SheetHeader>
      <div v-if="hasTask && task" class="mt-4 space-y-3">
        <h3 class="text-lg font-semibold">{{ task.title }}</h3>
        <p class="text-sm text-muted-foreground">{{ task.description || 'No description.' }}</p>
        <div class="flex gap-2">
          <StatusBadge :status="task.status" />
          <PriorityBadge :priority="task.priority" />
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
