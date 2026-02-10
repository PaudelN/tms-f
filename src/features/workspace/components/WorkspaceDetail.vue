<script setup lang="ts">
import type { Workspace } from "@/stores/workspace";
import { Button } from "@/components/ui/button";
import UiDetailField from "@/components/shared/UiDetailField.vue";

defineProps<{ workspace: Workspace | null }>();
const emit = defineEmits<{ edit: []; delete: [] }>();
</script>
<template>
  <div class="space-y-4" v-if="workspace">
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-lg font-semibold">{{ workspace.name }}</h2>
        <p class="text-sm text-muted-foreground">Workspace details and controls.</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="emit('edit')">Edit</Button>
        <Button variant="destructive" @click="emit('delete')">Delete</Button>
      </div>
    </div>
    <UiDetailField label="Description" :value="workspace.description" />
    <UiDetailField label="Owner" :value="workspace.user?.name ?? 'Unassigned'" />
    <UiDetailField label="Created" :value="new Date(workspace.created_at).toLocaleString()" />
    <UiDetailField label="Updated" :value="new Date(workspace.updated_at).toLocaleString()" />
  </div>
</template>
