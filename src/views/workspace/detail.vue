<script setup lang="ts">
import type { Workspace } from "@/stores/workspace";
import WorkspaceDetail from "@/features/workspace/components/WorkspaceDetail.vue";

defineProps<{ workspace: Workspace | null }>();
const emit = defineEmits<{ edit: []; delete: [] }>();
</script>

<template>
  <WorkspaceDetail :workspace="workspace" @edit="emit('edit')" @delete="emit('delete')" />
</template>
