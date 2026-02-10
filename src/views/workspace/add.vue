<script setup lang="ts">
import WorkspaceForm from "@/features/workspace/components/WorkspaceForm.vue";
const emit = defineEmits<{ submit: [{ name: string; description: string }]; cancel: [] }>();
</script>

<template>
  <WorkspaceForm mode="add" @submit="emit('submit', $event)" @cancel="emit('cancel')" />
</template>
