<template>
  <div :class="inDialog ? 'space-y-4' : 'min-h-screen bg-background p-6'">
    <div :class="inDialog ? 'space-y-4' : 'max-w-3xl mx-auto space-y-6'">
      <div v-if="loading" class="py-10 text-sm text-muted-foreground">Loading workspace...</div>

      <template v-else>
        <header v-if="!inDialog" class="space-y-2">
          <Button variant="ghost" class="-ml-3" @click="router.back()">Back</Button>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-semibold tracking-tight">Edit Workspace</h1>
            <Badge v-if="hasChanges" class="bg-amber-500/15 text-amber-700 border-transparent animate-pulse">
              <CircleDot class="h-3 w-3 mr-1" /> Unsaved changes
            </Badge>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Workspace Details</CardTitle>
            <CardDescription>Keep your workspace profile up to date.</CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div class="space-y-2">
                <Label for="name">Workspace Name</Label>
                <Input id="name" v-model="form.name" required />
                <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
              </div>
              <div class="space-y-2">
                <Label for="description">Description</Label>
                <Textarea id="description" v-model="form.description" rows="4" />
                <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm rounded-lg border p-3">
                <div><span class="text-muted-foreground">Created:</span> {{ workspace ? formatDate(workspace.created_at) : '-' }}</div>
                <div><span class="text-muted-foreground">Updated:</span> {{ workspace ? formatDate(workspace.updated_at) : '-' }}</div>
              </div>
              <Alert v-if="workspaceStore.hasError" variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{{ workspaceStore.errorMessage }}</AlertDescription>
              </Alert>

              <div :class="inDialog ? 'sticky bottom-0 bg-background/95 backdrop-blur pt-3 flex justify-end gap-2' : 'flex gap-3 pt-2'">
                <Button type="button" variant="outline" @click="handleCancel">Cancel</Button>
                <Button type="submit" :disabled="workspaceStore.isLoading || !hasChanges">{{ workspaceStore.isLoading ? 'Saving...' : 'Save changes' }}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CircleDot } from "lucide-vue-next";
import { useWorkspaceStore } from "@/stores/workspace";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const props = withDefaults(defineProps<{ inDialog?: boolean; workspaceId?: number }>(), { inDialog: false, workspaceId: undefined });
const emit = defineEmits<{ success: [number]; cancel: [] }>();

const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();

const loading = ref(true);
const workspace = computed(() => workspaceStore.activeWorkspace);
const form = reactive({ name: "", description: "" });
const originalForm = reactive({ name: "", description: "" });
const errors = reactive({ name: "", description: "" });
const hasChanges = computed(() => form.name.trim() !== originalForm.name || form.description.trim() !== originalForm.description);

onMounted(loadWorkspace);

async function loadWorkspace() {
  const id = props.workspaceId ?? Number(route.params.id);
  if (!id || Number.isNaN(id)) return router.push({ name: "workspace" });
  loading.value = true;
  await workspaceStore.fetchWorkspace(id);
  if (workspace.value) {
    form.name = workspace.value.name;
    form.description = workspace.value.description || "";
    originalForm.name = form.name;
    originalForm.description = form.description;
  }
  loading.value = false;
}

function validateForm() {
  errors.name = "";
  errors.description = "";
  if (!form.name.trim()) errors.name = "Workspace name is required";
  if (form.name.trim().length > 255) errors.name = "Workspace name must not exceed 255 characters";
  if (form.description.length > 1000) errors.description = "Description must not exceed 1000 characters";
  return !errors.name && !errors.description;
}

async function handleSubmit() {
  if (!workspace.value || !validateForm()) return;
  await workspaceStore.updateWorkspace(workspace.value.id, { name: form.name.trim(), description: form.description.trim() || undefined });
  originalForm.name = form.name.trim();
  originalForm.description = form.description.trim();
  if (props.inDialog) emit("success", workspace.value.id);
  else router.push({ name: "workspace-detail", params: { id: workspace.value.id } });
}

function handleCancel() {
  if (props.inDialog) emit("cancel");
  else router.back();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
</script>
