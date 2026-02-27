<template>
  <div :class="inDialog ? 'space-y-4' : 'min-h-screen bg-background p-6'">
    <div :class="inDialog ? 'space-y-4' : 'max-w-3xl mx-auto space-y-6'">
      <header v-if="!inDialog" class="space-y-2">
        <Button variant="ghost" class="-ml-3" @click="router.back()">Back</Button>
        <h1 class="text-3xl font-semibold tracking-tight">Create Workspace</h1>
        <p class="text-muted-foreground">Add a new workspace with clean defaults.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>Provide a clear name and optional description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="space-y-2">
              <Label for="name">Workspace Name</Label>
              <Input id="name" v-model="form.name" placeholder="Product roadmap" required />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
            </div>
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="form.description" rows="4" placeholder="What is this workspace for?" />
              <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description }}</p>
            </div>

            <Alert v-if="workspaceStore.hasError" variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{{ workspaceStore.errorMessage }}</AlertDescription>
            </Alert>

            <div :class="inDialog ? 'sticky bottom-0 bg-background/95 backdrop-blur pt-3 flex justify-end gap-2' : 'flex gap-3 pt-2'">
              <Button type="button" variant="outline" @click="handleCancel">Cancel</Button>
              <Button type="submit" :disabled="workspaceStore.isLoading">{{ workspaceStore.isLoading ? 'Creating...' : 'Create workspace' }}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useWorkspaceStore } from "@/stores/workspace";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const props = withDefaults(defineProps<{ inDialog?: boolean }>(), { inDialog: false });
const emit = defineEmits<{ success: [number]; cancel: [] }>();

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const form = reactive({ name: "", description: "" });
const errors = reactive({ name: "", description: "" });

function validateForm() {
  errors.name = "";
  errors.description = "";
  if (!form.name.trim()) errors.name = "Workspace name is required";
  if (form.name.trim().length > 255) errors.name = "Workspace name must not exceed 255 characters";
  if (form.description.length > 1000) errors.description = "Description must not exceed 1000 characters";
  return !errors.name && !errors.description;
}

async function handleSubmit() {
  workspaceStore.clearError();
  if (!validateForm()) return;
  const workspace = await workspaceStore.createWorkspace({ name: form.name.trim(), description: form.description.trim() || undefined });
  if (props.inDialog) emit("success", workspace.id);
  else router.push({ name: "workspace-detail", params: { id: workspace.id } });
}

function handleCancel() {
  if (props.inDialog) emit("cancel");
  else router.back();
}
</script>
