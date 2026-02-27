<template>
  <div :class="inDialog ? 'h-full overflow-auto p-4' : 'min-h-screen bg-background p-6'">
    <div :class="inDialog ? 'mx-auto max-w-3xl' : 'mx-auto max-w-3xl'">
      <div v-if="!inDialog" class="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.back()">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">Create Workspace</h1>
          <p class="text-muted-foreground">Craft a polished workspace for your team.</p>
        </div>
      </div>

      <Card class="shadow-sm">
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="space-y-2">
              <Label for="name">Workspace Name <span class="text-destructive">*</span></Label>
              <Input id="name" v-model="form.name" placeholder="Marketing Ops" />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
            </div>

            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="form.description" rows="5" placeholder="Describe how this workspace will be used." />
              <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description }}</p>
            </div>

            <Alert v-if="workspaceStore.hasError" variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{{ workspaceStore.errorMessage }}</AlertDescription>
            </Alert>

            <div class="sticky bottom-0 flex gap-3 border-t bg-background/95 pt-4 backdrop-blur">
              <Button type="button" variant="outline" class="flex-1" @click="handleCancel">Cancel</Button>
              <Button type="submit" class="flex-1" :disabled="workspaceStore.isLoading">
                {{ workspaceStore.isLoading ? "Creating..." : "Create Workspace" }}
              </Button>
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
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
  import { ArrowLeft } from "lucide-vue-next";

  const props = withDefaults(defineProps<{ inDialog?: boolean }>(), { inDialog: false });
  const emit = defineEmits<{ saved: [id: number]; cancel: [] }>();

  const router = useRouter();
  const workspaceStore = useWorkspaceStore();

  const form = reactive({ name: "", description: "" });
  const errors = reactive({ name: "", description: "" });

  function validateForm() {
    errors.name = "";
    errors.description = "";
    let isValid = true;
    if (!form.name.trim()) {
      errors.name = "Workspace name is required";
      isValid = false;
    }
    if (form.description.length > 1000) {
      errors.description = "Description must not exceed 1000 characters";
      isValid = false;
    }
    return isValid;
  }

  async function handleSubmit() {
    workspaceStore.clearError();
    if (!validateForm()) return;
    const workspace = await workspaceStore.createWorkspace({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    });

    if (props.inDialog) emit("saved", workspace.id);
    else router.push({ name: "workspace-detail", params: { id: workspace.id } });
  }

  function handleCancel() {
    if (props.inDialog) emit("cancel");
    else router.back();
  }
</script>
