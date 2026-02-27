<template>
  <div :class="inDialog ? 'h-full overflow-auto p-4' : 'min-h-screen bg-background p-6'">
    <div class="mx-auto max-w-5xl">
      <div v-if="workspaceStore.isDetailLoading" class="py-20 text-center text-muted-foreground">Loading workspace details...</div>
      <div v-else-if="workspace" class="space-y-5">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-3xl font-bold">{{ workspace.name }}</h1>
              <Badge :variant="workspace.isArchived ? 'secondary' : 'default'">{{ workspace.isArchived ? 'Archived' : 'Active' }}</Badge>
            </div>
            <p class="text-muted-foreground">{{ workspace.description || 'No description provided.' }}</p>
          </div>
          <div class="flex gap-2" v-if="!inDialog">
            <Button variant="outline" @click="handleEdit">Edit</Button>
            <Button variant="destructive" @click="deleteModalOpen = true">Delete</Button>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle class="text-base">Owner</CardTitle></CardHeader>
            <CardContent>
              <p class="font-medium">{{ workspace.user?.name || 'Unassigned' }}</p>
              <p class="text-sm text-muted-foreground">{{ workspace.user?.email || '—' }}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle class="text-base">Workspace info</CardTitle></CardHeader>
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
          <Button variant="destructive" @click="confirmDelete" :disabled="deleteLoading">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { useWorkspaceStore } from "@/stores/workspace";
  import { computed, onMounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  const props = withDefaults(defineProps<{ inDialog?: boolean; workspaceId?: number }>(), {
    inDialog: false,
  });

  const route = useRoute();
  const router = useRouter();
  const workspaceStore = useWorkspaceStore();
  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const workspace = computed(() => workspaceStore.activeWorkspace);

  onMounted(loadWorkspace);

  async function loadWorkspace() {
    const id = props.workspaceId ?? Number(route.params.id);
    if (!id || Number.isNaN(id)) return;
    await workspaceStore.fetchWorkspace(id);
  }

  function handleEdit() {
    router.push({ name: "workspace-edit", params: { id: workspace.value?.id } });
  }

  async function confirmDelete() {
    if (!workspace.value) return;
    deleteLoading.value = true;
    await workspaceStore.deleteWorkspace(workspace.value.id);
    deleteLoading.value = false;
    deleteModalOpen.value = false;
    router.push({ name: "workspace" });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
</script>
