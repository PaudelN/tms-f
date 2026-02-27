<template>
  <div :class="inDialog ? 'space-y-4' : 'min-h-screen bg-background p-6'">
    <div :class="inDialog ? 'space-y-4' : 'max-w-5xl mx-auto space-y-6'">
      <div v-if="workspaceStore.isDetailLoading" class="py-10 text-sm text-muted-foreground">Loading workspace details...</div>

      <div v-else-if="workspaceStore.hasError" class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        {{ workspaceStore.errorMessage }}
      </div>

      <div v-else-if="workspace" class="space-y-4">
        <header class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight">{{ workspace.name }}</h1>
            <p class="text-muted-foreground">{{ workspace.description || 'No description available.' }}</p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" @click="handleEdit">Edit</Button>
            <Button variant="destructive" @click="handleDelete">Delete</Button>
          </div>
        </header>

        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle class="text-base">Owner</CardTitle></CardHeader>
            <CardContent class="text-sm">
              <p class="font-medium">{{ workspace.user?.name || 'Unassigned' }}</p>
              <p class="text-muted-foreground">{{ workspace.user?.email || 'No email' }}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle class="text-base">Metadata</CardTitle></CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-muted-foreground">ID</span><span>{{ workspace.id }}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Created</span><span>{{ formatDate(workspace.created_at) }}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Updated</span><span>{{ formatDate(workspace.updated_at) }}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <Dialog v-model:open="deleteModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong class="text-destructive">{{ workspace?.name }}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteModalOpen = false">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="deleteLoading">{{ deleteLoading ? 'Deleting...' : 'Delete' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWorkspaceStore } from "@/stores/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const props = withDefaults(defineProps<{ inDialog?: boolean; workspaceId?: number }>(), { inDialog: false, workspaceId: undefined });
const emit = defineEmits<{ edit: [number]; deleted: []; close: [] }>();

const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const deleteModalOpen = ref(false);
const deleteLoading = ref(false);
const workspace = computed(() => workspaceStore.activeWorkspace);

onMounted(loadWorkspace);

async function loadWorkspace() {
  const id = props.workspaceId ?? Number(route.params.id);
  if (!id || Number.isNaN(id)) return router.push({ name: "workspace" });
  await workspaceStore.fetchWorkspace(id);
}

function handleEdit() {
  if (!workspace.value) return;
  if (props.inDialog) emit("edit", workspace.value.id);
  else router.push({ name: "workspace-edit", params: { id: workspace.value.id } });
}

function handleDelete() {
  deleteModalOpen.value = true;
}

async function confirmDelete() {
  if (!workspace.value) return;
  deleteLoading.value = true;
  await workspaceStore.deleteWorkspace(workspace.value.id);
  deleteLoading.value = false;
  deleteModalOpen.value = false;
  if (props.inDialog) emit("deleted");
  else router.push({ name: "workspace" });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
</script>
