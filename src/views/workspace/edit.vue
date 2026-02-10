<script setup lang="ts">
import type { Workspace } from "@/stores/workspace";
import WorkspaceForm from "@/features/workspace/components/WorkspaceForm.vue";

defineProps<{ workspace?: Workspace | null; loading?: boolean }>();
const emit = defineEmits<{ submit: [{ name: string; description: string }]; cancel: [] }>();
</script>

<template>
  <WorkspaceForm mode="edit" :initial="workspace ?? undefined" :loading="loading" @submit="emit('submit', $event)" @cancel="emit('cancel')" />
</template>
