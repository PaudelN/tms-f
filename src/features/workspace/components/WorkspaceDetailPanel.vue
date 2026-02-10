<script setup lang="ts">
import type { Workspace } from '@/stores/workspace'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import UiDetailField from '@/components/shared/UiDetailField.vue'

const props = defineProps<{ workspace: Workspace | null }>()
const emit = defineEmits<{ edit: []; close: [] }>()
</script>

<template>
  <div v-if="props.workspace" class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold">{{ props.workspace.name }}</h3>
        <p class="text-sm text-muted-foreground">Workspace detail and metadata.</p>
      </div>
      <Badge :variant="props.workspace.isArchived ? 'outline' : 'default'">{{ props.workspace.isArchived ? 'Archived' : 'Active' }}</Badge>
    </div>

    <UiDetailField label="Description" :value="props.workspace.description || 'No description'" />
    <UiDetailField label="Owner" :value="props.workspace.user?.name || 'Unassigned'" />
    <UiDetailField label="Created" :value="new Date(props.workspace.created_at).toLocaleString()" />
    <UiDetailField label="Updated" :value="new Date(props.workspace.updated_at).toLocaleString()" />

    <div class="flex gap-2 pt-2">
      <Button @click="emit('edit')">Edit workspace</Button>
      <Button variant="outline" @click="emit('close')">Close</Button>
    </div>
  </div>
</template>
