<template>
  <div :class="inDialog ? 'h-full overflow-auto p-4' : 'min-h-screen bg-background p-6'">
    <div class="mx-auto max-w-3xl">
      <div v-if="loading" class="flex justify-center py-20 text-muted-foreground">Loading workspace...</div>
      <template v-else>
        <div v-if="!inDialog" class="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" @click="router.back()"><ArrowLeft class="h-4 w-4" /></Button>
          <div>
            <h1 class="text-3xl font-bold">Edit Workspace</h1>
            <p class="text-muted-foreground">Keep things up to date.</p>
          </div>
          <Badge v-if="hasChanges" class="ml-auto bg-amber-500/15 text-amber-600"><CircleDot class="mr-1 h-3 w-3 animate-pulse" />Unsaved changes</Badge>
        </div>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Workspace details</CardTitle>
            <Badge v-if="hasChanges" class="bg-amber-500/15 text-amber-600"><CircleDot class="mr-1 h-3 w-3 animate-pulse" />Unsaved</Badge>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div class="space-y-2">
                <Label for="name">Workspace Name</Label>
                <Input id="name" v-model="form.name" />
                <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
              </div>
              <div class="space-y-2">
                <Label for="description">Description</Label>
                <Textarea id="description" v-model="form.description" rows="5" />
                <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description }}</p>
              </div>
              <div class="rounded-lg border bg-muted/40 p-3 text-sm">
                Last updated: {{ workspace ? formatDate(workspace.updated_at) : '—' }}
              </div>
              <div class="sticky bottom-0 flex gap-3 border-t bg-background/95 pt-4 backdrop-blur">
                <Button type="button" variant="outline" class="flex-1" @click="handleCancel">Cancel</Button>
                <Button type="submit" class="flex-1" :disabled="workspaceStore.isLoading || !hasChanges">{{ workspaceStore.isLoading ? 'Saving...' : 'Save Changes' }}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
  import { useWorkspaceStore } from "@/stores/workspace";
  import { ArrowLeft, CircleDot } from "lucide-vue-next";
  import { computed, onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  const props = withDefaults(defineProps<{ inDialog?: boolean; workspaceId?: number }>(), {
    inDialog: false,
  });
  const emit = defineEmits<{ saved: [id: number]; cancel: [] }>();

  const route = useRoute();
  const router = useRouter();
  const workspaceStore = useWorkspaceStore();

  const loading = ref(true);
  const workspace = computed(() => workspaceStore.activeWorkspace);
  const form = reactive({ name: "", description: "" });
  const originalForm = reactive({ name: "", description: "" });
  const errors = reactive({ name: "", description: "" });

  const hasChanges = computed(
    () => form.name.trim() !== originalForm.name || form.description.trim() !== originalForm.description,
  );

  onMounted(loadWorkspace);

  async function loadWorkspace() {
    const id = props.workspaceId ?? Number(route.params.id);
    if (!id || Number.isNaN(id)) {
      router.push({ name: "workspace" });
      return;
    }
    loading.value = true;
    await workspaceStore.fetchWorkspace(id);
    if (workspace.value) {
      form.name = workspace.value.name;
      form.description = workspace.value.description || "";
      originalForm.name = workspace.value.name;
      originalForm.description = workspace.value.description || "";
    }
    loading.value = false;
  }

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
    if (!workspace.value || !validateForm()) return;
    await workspaceStore.updateWorkspace(workspace.value.id, {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    });
    originalForm.name = form.name.trim();
    originalForm.description = form.description.trim();
    if (props.inDialog) emit("saved", workspace.value.id);
    else router.push({ name: "workspace-detail", params: { id: workspace.value.id } });
  }

  function handleCancel() {
    if (props.inDialog) emit("cancel");
    else router.back();
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
</script>
