<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { UiDataPoint, UiKeyValueList } from '@/components/shared'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps<{ id: number | null }>()
const emit = defineEmits<{ edit: []; close: [] }>()
const store = useWorkspaceStore()

const row = computed(() => (props.id ? store.getWorkspaceById(props.id) : null))
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Workspace details</h3>
    <UiKeyValueList v-if="row">
      <UiDataPoint label="Name" :value="row.name" />
      <UiDataPoint label="Description" :value="row.description || '-'" />
      <UiDataPoint label="Owner" :value="row.user?.name || 'Unassigned'" />
      <UiDataPoint label="Created" :value="new Date(row.created_at).toLocaleDateString()" />
    </UiKeyValueList>
    <p v-else class="text-sm text-muted-foreground">Select a workspace row to view details.</p>
    <div class="flex justify-end gap-2">
      <Button variant="outline" @click="emit('close')">Close</Button>
      <Button :disabled="!row" @click="emit('edit')">Edit</Button>
    </div>
  </div>
</template>
