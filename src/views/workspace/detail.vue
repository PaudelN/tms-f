<script setup lang="ts">
import { Button } from '@/components/ui/button'
import UiDetailList from '@/components/shared/UiDetailList.vue'
import UiInfoRow from '@/components/shared/UiInfoRow.vue'
import UiSectionTitle from '@/components/shared/UiSectionTitle.vue'
import UiStatusBadge from '@/components/shared/UiStatusBadge.vue'
import type { Workspace } from '@/types/workspace'

defineProps<{ workspace: Workspace | null }>()
const emit = defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <div v-if="workspace" class="space-y-5">
    <UiSectionTitle :title="workspace.name" caption="Workspace details" />
    <UiStatusBadge :status="workspace.status" />
    <p class="text-sm text-muted-foreground">{{ workspace.description }}</p>
    <UiDetailList>
      <UiInfoRow label="Owner" :value="workspace.owner" />
      <UiInfoRow label="Members" :value="workspace.members" />
      <UiInfoRow label="Created" :value="workspace.createdAt" />
      <UiInfoRow label="Updated" :value="workspace.updatedAt" />
    </UiDetailList>
    <div class="flex gap-2 pt-2">
      <Button class="flex-1" @click="emit('edit')">Edit</Button>
      <Button class="flex-1" variant="destructive" @click="emit('delete')">Delete</Button>
    </div>
  </div>
</template>
