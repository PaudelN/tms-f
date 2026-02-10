<script setup lang="ts">
import { reactive, watch } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import UiDialogFormShell from "@/components/shared/UiDialogFormShell.vue";

const props = defineProps<{ mode: "add" | "edit"; loading?: boolean; initial?: { name: string; description?: string | null } }>();
const emit = defineEmits<{ submit: [{ name: string; description: string }]; cancel: [] }>();

const form = reactive({ name: "", description: "" });
watch(() => props.initial, (value) => {
  form.name = value?.name ?? "";
  form.description = value?.description ?? "";
}, { immediate: true });

function submit() {
  emit("submit", { name: form.name.trim(), description: form.description.trim() });
}
</script>
<template>
  <UiDialogFormShell :title="mode === 'add' ? 'Create workspace' : 'Edit workspace'" :description="'Keep it concise and discoverable for the team.'" :submit-label="mode === 'add' ? 'Create' : 'Save changes'" :loading="loading" @submit="submit" @cancel="emit('cancel')">
    <div class="space-y-2">
      <Label for="workspace-name">Name</Label>
      <Input id="workspace-name" v-model="form.name" placeholder="Engineering squad" required />
    </div>
    <div class="space-y-2">
      <Label for="workspace-description">Description</Label>
      <Textarea id="workspace-description" v-model="form.description" placeholder="Cross-functional team workspace" />
    </div>
  </UiDialogFormShell>
</template>
